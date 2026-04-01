import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModel {
  static async create(username: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const query = `
      INSERT INTO users (id, username, email, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await pool.execute(query, [
      id,
      username,
      email,
      hashedPassword,
    ]);

    return { id, username, email };
  }

  static async findByEmail(email: string) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return (rows as any[])[0];
  }

  static async findById(id: string) {
    const query = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return (rows as any[])[0];
  }

  static async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async updateLastLogin(userId: string) {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = ?';
    await pool.execute(query, [userId]);
  }
}
