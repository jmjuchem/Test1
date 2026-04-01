import { Server, Socket } from 'socket.io';
import { MatchManager } from '../services/MatchService';
import { verifyToken } from '../middleware/auth';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export function initializeSocket(io: Server) {
  const matchManager = new MatchManager(io);

  // Middleware de autenticação
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Token não fornecido'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Token inválido'));
    }

    (socket as AuthenticatedSocket).userId = decoded.userId;
    next();
  });

  // Conexão
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ Usuário conectado: ${socket.userId}`);

    // Procurar adversário
    socket.on('match:find-opponent', () => {
      const player = {
        id: socket.userId!,
        username: socket.username || `Jogador ${socket.userId}`,
        socket,
        selectedCards: [],
        fieldCards: [],
        goalkeeper: '',
        score: 0,
      };

      const opponent = matchManager.findOpponent(player);

      if (opponent) {
        // Encontrou adversário
        const match = matchManager.createMatch(player, opponent);
        socket.emit('match:opponent-found', {
          matchId: match.id,
          opponent: {
            id: opponent.id,
            username: opponent.username,
          },
        });
      } else {
        // Aguardando adversário
        socket.emit('match:waiting-for-opponent', {
          waitingPlayers: matchManager.getWaitingPlayers(),
        });
      }
    });

    // Seleção de cartas
    socket.on('match:select-cards', (data) => {
      const { matchId, selectedCards } = data;
      matchManager.handleCardSelection(matchId, socket.userId!, selectedCards);
    });

    // Ação do jogador
    socket.on('match:action', (data) => {
      const { matchId, action } = data;
      matchManager.handlePlayerAction(matchId, socket.userId!, action);
    });

    // Penalidade
    socket.on('match:penalty', (data) => {
      const { matchId, result } = data;
      matchManager.handlePenalty(matchId, socket.userId!, result);
    });

    // Desconexão
    socket.on('disconnect', () => {
      console.log(`❌ Usuário desconectado: ${socket.userId}`);
      // Notificar adversário se estava em partida
    });

    // Erro
    socket.on('error', (error) => {
      console.error(`Erro do socket ${socket.userId}:`, error);
    });
  });

  return matchManager;
}
