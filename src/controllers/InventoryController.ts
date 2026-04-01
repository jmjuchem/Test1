import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { InventoryModel } from '../models/Inventory';
import { CardModel } from '../models/Card';

export class InventoryController {
  static async getInventory(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const cards = await InventoryModel.getUserCards(req.userId);
      const currency = await InventoryModel.getCurrency(req.userId);

      return res.status(200).json({
        success: true,
        inventory: {
          cards,
          currency,
          equipment: [],
          chests: [],
          deck: [],
        },
      });
    } catch (error) {
      console.error('Erro ao obter inventário:', error);
      return res.status(500).json({ error: 'Erro ao obter inventário' });
    }
  }

  static async addCard(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const { cardId } = req.body;

      if (!cardId) {
        return res.status(400).json({ error: 'Card ID é obrigatório' });
      }

      // Verificar se carta existe
      const card = await CardModel.findById(cardId);
      if (!card) {
        return res.status(404).json({ error: 'Carta não encontrada' });
      }

      // Adicionar carta
      const userCard = await InventoryModel.addCard(req.userId, cardId);

      return res.status(201).json({
        success: true,
        card: userCard,
      });
    } catch (error) {
      console.error('Erro ao adicionar carta:', error);
      return res.status(500).json({ error: 'Erro ao adicionar carta' });
    }
  }

  static async upgradeCard(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const { cardId, cost } = req.body;

      if (!cardId || !cost) {
        return res.status(400).json({ error: 'Card ID e custo são obrigatórios' });
      }

      // Verificar moedas
      const currency = await InventoryModel.getCurrency(req.userId);
      if (currency.gameCoins < cost) {
        return res.status(400).json({ error: 'Moedas insuficientes' });
      }

      // Fazer upgrade
      await InventoryModel.upgradeCard(req.userId, cardId);
      await InventoryModel.deductCurrency(req.userId, cost, 0);

      return res.status(200).json({
        success: true,
        message: 'Carta atualizada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error);
      return res.status(500).json({ error: 'Erro ao fazer upgrade' });
    }
  }

  static async addCurrency(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const { gameCoins, specialCoins } = req.body;

      if (gameCoins === undefined || specialCoins === undefined) {
        return res.status(400).json({ error: 'Valores de moedas são obrigatórios' });
      }

      await InventoryModel.addCurrency(req.userId, gameCoins, specialCoins);

      const currency = await InventoryModel.getCurrency(req.userId);

      return res.status(200).json({
        success: true,
        currency,
      });
    } catch (error) {
      console.error('Erro ao adicionar moedas:', error);
      return res.status(500).json({ error: 'Erro ao adicionar moedas' });
    }
  }
}
