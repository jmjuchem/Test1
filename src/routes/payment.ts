import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rotas de pagamento (requerem autenticação)
router.get('/packages', PaymentController.getPackages);
router.post('/create-intent', authMiddleware, PaymentController.createPaymentIntent);
router.post('/confirm', authMiddleware, PaymentController.confirmPayment);
router.get('/history', authMiddleware, PaymentController.getTransactionHistory);

// Webhook do Stripe (sem autenticação, mas com verificação de assinatura)
router.post('/webhook', PaymentController.handleWebhook);

export default router;
