import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { testConnection } from './config/database';
import { initializeSocket } from './config/socket';
import authRoutes from './routes/auth';
import inventoryRoutes from './routes/inventory';
import paymentRoutes from './routes/payment';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar WebSocket
const matchManager = initializeSocket(io);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/user/inventory', inventoryRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    activeMatches: matchManager.getActiveMatches(),
    waitingPlayers: matchManager.getWaitingPlayers(),
  });
});

// Stats
app.get('/stats', (req, res) => {
  res.json({
    activeMatches: matchManager.getActiveMatches(),
    waitingPlayers: matchManager.getWaitingPlayers(),
    connectedClients: io.engine.clientsCount,
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
async function start() {
  try {
    // Testar conexão com banco de dados
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Falha ao conectar ao banco de dados');
      process.exit(1);
    }

    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`🎮 WebSocket disponível em ws://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 Stats: http://localhost:${PORT}/stats\n`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

start();

export default app;
