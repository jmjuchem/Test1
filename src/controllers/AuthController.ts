import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { InventoryModel } from '../models/Inventory';
import { generateToken } from '../middleware/auth';

export class AuthController {
  static async register(req: AuthRequest, res: Response) {
    try {
      const { username, email, password, confirmPassword } = req.body;

      // Validações
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Senhas não correspondem' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
      }

      // Verificar se usuário já existe
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email já cadastrado' });
      }

      // Criar usuário
      const user = await UserModel.create(username, email, password);

      // Inicializar inventário
      await InventoryModel.initializeCurrency(user.id);

      const token = generateToken(user.id);

      return res.status(201).json({
        success: true,
        user,
        token,
      });
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }

  static async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      const isPasswordValid = await UserModel.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      // Atualizar último login
      await UserModel.updateLastLogin(user.id);

      const token = generateToken(user.id);

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        token,
        expiresIn: 86400, // 24 horas em segundos
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const user = await UserModel.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      return res.status(500).json({ error: 'Erro ao obter perfil' });
    }
  }
}
