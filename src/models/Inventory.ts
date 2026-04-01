import { pool } from '../config/database';

export interface UserCard {
  id: string;
  userId: string;
  cardId: string;
  level: number;
  copies: number;
  equipment: string[];
}

export interface UserCurrency {
  userId: string;
  gameCoins: number;
  specialCoins: number;
}

export class InventoryModel {
  // User Cards
  static async addCard(userId: string, cardId: string) {
    const id = `uc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const query = `
      INSERT INTO user_cards (id, user_id, card_id, level, copies, created_at)
      VALUES (?, ?, ?, 1, 1, NOW())
    `;

    await pool.execute(query, [id, userId, cardId]);
    return { id, userId, cardId, level: 1, copies: 1 };
  }

  static async getUserCards(userId: string) {
    const query = `
      SELECT uc.*, c.name, c.type, c.quality, c.base_attributes
      FROM user_cards uc
      JOIN cards c ON uc.card_id = c.id
      WHERE uc.user_id = ?
      ORDER BY c.quality DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }

  static async upgradeCard(userId: string, cardId: string) {
    const query = `
      UPDATE user_cards
      SET level = level + 1
      WHERE user_id = ? AND card_id = ?
    `;
    await pool.execute(query, [userId, cardId]);
  }

  static async incrementCardCopies(userId: string, cardId: string) {
    const query = `
      UPDATE user_cards
      SET copies = copies + 1
      WHERE user_id = ? AND card_id = ?
    `;
    await pool.execute(query, [userId, cardId]);
  }

  // Currency
  static async getCurrency(userId: string) {
    const query = `
      SELECT game_coins, special_coins
      FROM user_currency
      WHERE user_id = ?
    `;
    const [rows] = await pool.execute(query, [userId]);
    const currency = (rows as any[])[0];
    return currency || { gameCoins: 0, specialCoins: 0 };
  }

  static async addCurrency(userId: string, gameCoins: number, specialCoins: number) {
    const query = `
      UPDATE user_currency
      SET game_coins = game_coins + ?, special_coins = special_coins + ?
      WHERE user_id = ?
    `;
    await pool.execute(query, [gameCoins, specialCoins, userId]);
  }

  static async deductCurrency(userId: string, gameCoins: number, specialCoins: number) {
    const query = `
      UPDATE user_currency
      SET game_coins = game_coins - ?, special_coins = special_coins - ?
      WHERE user_id = ? AND game_coins >= ? AND special_coins >= ?
    `;
    const [result] = await pool.execute(query, [
      gameCoins,
      specialCoins,
      userId,
      gameCoins,
      specialCoins,
    ]);
    return (result as any).affectedRows > 0;
  }

  static async initializeCurrency(userId: string) {
    const query = `
      INSERT INTO user_currency (user_id, game_coins, special_coins, created_at)
      VALUES (?, 1000, 0, NOW())
    `;
    await pool.execute(query, [userId]);
  }
}
