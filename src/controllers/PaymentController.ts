import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Stripe from 'stripe';
import { InventoryModel } from '../models/Inventory';
import { pool } from '../config/database';
import { PAYMENT_PACKAGES, convertRealToUSD } from '../data/paymentPackages';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export class PaymentController {
  static async createPaymentIntent(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const { packageId } = req.body;

      const package_ = PAYMENT_PACKAGES.find((pkg) => pkg.id === packageId);

      if (!package_) {
        return res.status(400).json({ error: 'Pacote inválido' });
      }

      // Converter para centavos (Stripe usa centavos)
      const amountInCents = Math.round(package_.priceUSD * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
          userId: req.userId,
          packageId: packageId,
          priceReal: package_.priceReal.toString(),
        },
      });

      // Salvar transação pendente
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const query = `
        INSERT INTO transactions (id, user_id, stripe_payment_id, amount, package_id, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `;
      await pool.execute(query, [
        transactionId,
        req.userId,
        paymentIntent.id,
        package_.priceReal,
        packageId,
      ]);

      return res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        package: {
          id: package_.id,
          name: package_.name,
          priceReal: package_.priceReal,
          priceUSD: package_.priceUSD,
          gameCoins: package_.gameCoins,
          specialCoins: package_.specialCoins,
        },
      });
    } catch (error) {
      console.error('Erro ao criar payment intent:', error);
      return res.status(500).json({ error: 'Erro ao criar pagamento' });
    }
  }

  static async confirmPayment(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const { paymentIntentId, packageId } = req.body;

      if (!paymentIntentId || !packageId) {
        return res.status(400).json({ error: 'Dados de pagamento inválidos' });
      }

      const package_ = PAYMENT_PACKAGES.find((pkg) => pkg.id === packageId);

      if (!package_) {
        return res.status(400).json({ error: 'Pacote inválido' });
      }

      // Verificar status do pagamento no Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Pagamento não foi bem-sucedido' });
      }

      // Atualizar transação
      const query = `
        UPDATE transactions
        SET status = 'completed', updated_at = NOW()
        WHERE stripe_payment_id = ? AND user_id = ?
      `;
      await pool.execute(query, [paymentIntentId, req.userId]);

      // Adicionar recompensas
      await InventoryModel.addCurrency(
        req.userId,
        package_.gameCoins,
        package_.specialCoins
      );

      const currency = await InventoryModel.getCurrency(req.userId);

      return res.status(200).json({
        success: true,
        message: 'Pagamento confirmado com sucesso',
        rewards: {
          gameCoins: package_.gameCoins,
          specialCoins: package_.specialCoins,
        },
        currency,
      });
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      return res.status(500).json({ error: 'Erro ao confirmar pagamento' });
    }
  }

  static async getPackages(req: AuthRequest, res: Response) {
    try {
      const packages = PAYMENT_PACKAGES.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        priceReal: pkg.priceReal,
        priceUSD: pkg.priceUSD,
        currency: 'BRL',
        gameCoins: pkg.gameCoins,
        specialCoins: pkg.specialCoins,
        bonus: pkg.bonus,
      }));

      return res.status(200).json({
        success: true,
        packages,
      });
    } catch (error) {
      console.error('Erro ao obter pacotes:', error);
      return res.status(500).json({ error: 'Erro ao obter pacotes' });
    }
  }

  static async getTransactionHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const query = `
        SELECT id, amount, status, package_id, created_at
        FROM transactions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `;
      const [transactions] = await pool.execute(query, [req.userId]);

      return res.status(200).json({
        success: true,
        transactions,
      });
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      return res.status(500).json({ error: 'Erro ao obter histórico' });
    }
  }

  static async handleWebhook(req: AuthRequest, res: Response) {
    const sig = req.headers['stripe-signature'] as string;

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as any;
          console.log('✅ Pagamento bem-sucedido:', paymentIntent.id);
          // Já foi processado no confirmPayment
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as any;
          console.log('❌ Pagamento falhou:', failedPayment.id);
          // Atualizar status da transação
          const query = `
            UPDATE transactions
            SET status = 'failed', updated_at = NOW()
            WHERE stripe_payment_id = ?
          `;
          await pool.execute(query, [failedPayment.id]);
          break;

        case 'charge.refunded':
          const refund = event.data.object as any;
          console.log('💰 Reembolso processado:', refund.id);
          // Atualizar status da transação
          const refundQuery = `
            UPDATE transactions
            SET status = 'refunded', updated_at = NOW()
            WHERE stripe_payment_id = ?
          `;
          await pool.execute(refundQuery, [refund.payment_intent]);
          break;
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return res.status(400).json({ error: 'Webhook inválido' });
    }
  }
}
