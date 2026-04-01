import { pool } from '../config/database';

export interface Card {
  id: string;
  name: string;
  type: 'player' | 'goalkeeper';
  quality: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  baseAttributes: any;
  image: string;
  createdAt: Date;
}

export class CardModel {
  static async create(card: Omit<Card, 'id' | 'createdAt'>) {
    const id = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const query = `
      INSERT INTO cards (id, name, type, quality, base_attributes, image, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await pool.execute(query, [
      id,
      card.name,
      card.type,
      card.quality,
      JSON.stringify(card.baseAttributes),
      card.image,
    ]);

    return { id, ...card };
  }

  static async findAll() {
    const query = 'SELECT * FROM cards ORDER BY quality DESC, name ASC';
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async findById(id: string) {
    const query = 'SELECT * FROM cards WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    const card = (rows as any[])[0];
    if (card) {
      card.baseAttributes = JSON.parse(card.base_attributes);
    }
    return card;
  }

  static async findByQuality(quality: string) {
    const query = 'SELECT * FROM cards WHERE quality = ? ORDER BY name ASC';
    const [rows] = await pool.execute(query, [quality]);
    return rows;
  }

  static async findByType(type: string) {
    const query = 'SELECT * FROM cards WHERE type = ? ORDER BY quality DESC';
    const [rows] = await pool.execute(query, [type]);
    return rows;
  }

  static async getRandomCards(limit: number = 5) {
    const query = `
      SELECT * FROM cards 
      ORDER BY RAND() 
      LIMIT ?
    `;
    const [rows] = await pool.execute(query, [limit]);
    return rows;
  }
}
