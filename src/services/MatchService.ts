import { Server, Socket } from 'socket.io';
import { pool } from '../config/database';
import { MatchService as GameMatchService } from '../utils/gameLogic';

interface Player {
  id: string;
  username: string;
  socket: Socket;
  selectedCards: string[];
  fieldCards: string[];
  goalkeeper: string;
  score: number;
}

interface Match {
  id: string;
  player1: Player;
  player2: Player | null;
  status: 'waiting' | 'selection' | 'playing' | 'finished' | 'penalties';
  currentTurn: number;
  currentPlayer: 'player1' | 'player2';
  winner: string | null;
  createdAt: Date;
}

export class MatchManager {
  private matches: Map<string, Match> = new Map();
  private waitingPlayers: Player[] = [];
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Procura um adversário para o jogador
   */
  findOpponent(player: Player): Player | null {
    if (this.waitingPlayers.length === 0) {
      this.waitingPlayers.push(player);
      return null;
    }

    const opponent = this.waitingPlayers.shift();
    if (opponent) {
      return opponent;
    }

    return null;
  }

  /**
   * Cria uma nova partida
   */
  createMatch(player1: Player, player2: Player): Match {
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const match: Match = {
      id: matchId,
      player1,
      player2,
      status: 'selection',
      currentTurn: 1,
      currentPlayer: 'player1',
      winner: null,
      createdAt: new Date(),
    };

    this.matches.set(matchId, match);

    // Notificar ambos os jogadores
    player1.socket.emit('match:created', {
      matchId,
      opponent: {
        id: player2.id,
        username: player2.username,
      },
    });

    player2.socket.emit('match:created', {
      matchId,
      opponent: {
        id: player1.id,
        username: player1.username,
      },
    });

    // Juntar em sala
    player1.socket.join(matchId);
    player2.socket.join(matchId);

    return match;
  }

  /**
   * Processa seleção de cartas iniciais
   */
  async handleCardSelection(
    matchId: string,
    playerId: string,
    selectedCards: string[]
  ) {
    const match = this.matches.get(matchId);
    if (!match) return;

    if (match.player1.id === playerId) {
      match.player1.selectedCards = selectedCards;
    } else if (match.player2 && match.player2.id === playerId) {
      match.player2.selectedCards = selectedCards;
    }

    // Verificar se ambos selecionaram
    if (
      match.player1.selectedCards.length === 3 &&
      match.player2 &&
      match.player2.selectedCards.length === 3
    ) {
      // Iniciar partida
      this.startMatch(matchId);
    }
  }

  /**
   * Inicia a partida
   */
  private startMatch(matchId: string) {
    const match = this.matches.get(matchId);
    if (!match) return;

    match.status = 'playing';

    // Decidir quem começa (50/50)
    const startsFirst = Math.random() > 0.5 ? 'player1' : 'player2';
    match.currentPlayer = startsFirst;

    // Notificar ambos os jogadores
    this.io.to(matchId).emit('match:started', {
      currentPlayer: startsFirst,
      player1: {
        id: match.player1.id,
        username: match.player1.username,
        score: 0,
      },
      player2: {
        id: match.player2?.id,
        username: match.player2?.username,
        score: 0,
      },
    });
  }

  /**
   * Processa ação de um jogador
   */
  async handlePlayerAction(
    matchId: string,
    playerId: string,
    action: {
      type: string;
      cardId: string;
      targetCardId?: string;
    }
  ) {
    const match = this.matches.get(matchId);
    if (!match) return;

    // Validar se é a vez do jogador
    const isPlayer1 = match.player1.id === playerId;
    const isCurrentPlayer =
      (isPlayer1 && match.currentPlayer === 'player1') ||
      (!isPlayer1 && match.currentPlayer === 'player2');

    if (!isCurrentPlayer) {
      return;
    }

    // Processar ação
    const result = GameMatchService.resolveAction(action);

    // Atualizar placar se foi gol
    if (action.type === 'shoot' && result.result === 'success') {
      if (isPlayer1) {
        match.player1.score += 1;
      } else {
        match.player2!.score += 1;
      }
    }

    // Notificar ambos os jogadores
    this.io.to(matchId).emit('match:action', {
      player: playerId,
      action,
      result,
      newScore: {
        player1: match.player1.score,
        player2: match.player2?.score || 0,
      },
    });

    // Avançar turno
    this.advanceTurn(matchId);
  }

  /**
   * Avança para o próximo turno
   */
  private advanceTurn(matchId: string) {
    const match = this.matches.get(matchId);
    if (!match) return;

    // Alternar jogador
    match.currentPlayer =
      match.currentPlayer === 'player1' ? 'player2' : 'player1';

    // Incrementar turno se ambos jogaram
    if (match.currentPlayer === 'player1') {
      match.currentTurn += 1;
    }

    // Verificar se deve adicionar carta (turnos 3 e 5)
    if (match.currentTurn === 3 || match.currentTurn === 5) {
      this.io.to(matchId).emit('match:add-card', {
        turn: match.currentTurn,
      });
    }

    // Verificar se partida acabou
    if (match.currentTurn > 8) {
      this.endMatch(matchId);
      return;
    }

    // Notificar próximo jogador
    this.io.to(matchId).emit('match:next-turn', {
      currentPlayer: match.currentPlayer,
      currentTurn: match.currentTurn,
    });
  }

  /**
   * Finaliza a partida
   */
  private async endMatch(matchId: string) {
    const match = this.matches.get(matchId);
    if (!match) return;

    let winner: string | null = null;

    if (match.player1.score > match.player2!.score) {
      winner = match.player1.id;
      match.status = 'finished';
    } else if (match.player2!.score > match.player1.score) {
      winner = match.player2!.id;
      match.status = 'finished';
    } else {
      // Empate - ir para penalidades
      match.status = 'penalties';
      this.io.to(matchId).emit('match:penalties', {
        message: 'Partida empatada! Indo para penalidades...',
      });
      return;
    }

    match.winner = winner;

    // Salvar resultado no banco
    const query = `
      INSERT INTO matches (id, player1_id, player2_id, status, player1_score, player2_score, winner, finished_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await pool.execute(query, [
      matchId,
      match.player1.id,
      match.player2?.id,
      match.status,
      match.player1.score,
      match.player2?.score || 0,
      winner,
    ]);

    // Notificar resultado
    this.io.to(matchId).emit('match:finished', {
      winner,
      finalScore: {
        player1: match.player1.score,
        player2: match.player2?.score || 0,
      },
    });

    // Remover partida após 5 segundos
    setTimeout(() => {
      this.matches.delete(matchId);
    }, 5000);
  }

  /**
   * Processa penalidades
   */
  async handlePenalty(
    matchId: string,
    playerId: string,
    result: 'goal' | 'miss'
  ) {
    const match = this.matches.get(matchId);
    if (!match || match.status !== 'penalties') return;

    if (result === 'goal') {
      if (match.player1.id === playerId) {
        match.player1.score += 1;
      } else {
        match.player2!.score += 1;
      }
    }

    // Notificar resultado da penalidade
    this.io.to(matchId).emit('match:penalty-result', {
      player: playerId,
      result,
      newScore: {
        player1: match.player1.score,
        player2: match.player2?.score || 0,
      },
    });

    // Verificar se alguém venceu
    const player1Penalties = 5; // Exemplo
    const player2Penalties = 5;

    if (
      match.player1.score > match.player2!.score &&
      player1Penalties >= player2Penalties
    ) {
      this.endMatch(matchId);
    } else if (
      match.player2!.score > match.player1.score &&
      player2Penalties >= player1Penalties
    ) {
      this.endMatch(matchId);
    }
  }

  /**
   * Remove jogador da partida
   */
  removePlayer(matchId: string, playerId: string) {
    const match = this.matches.get(matchId);
    if (!match) return;

    const winner =
      match.player1.id === playerId ? match.player2?.id : match.player1.id;

    match.winner = winner || null;
    match.status = 'finished';

    // Notificar outro jogador
    this.io.to(matchId).emit('match:player-disconnected', {
      winner,
      message: 'Adversário desconectou',
    });

    // Remover partida
    this.matches.delete(matchId);
  }

  /**
   * Obtém informações da partida
   */
  getMatch(matchId: string): Match | undefined {
    return this.matches.get(matchId);
  }

  /**
   * Obtém número de partidas ativas
   */
  getActiveMatches(): number {
    return this.matches.size;
  }

  /**
   * Obtém número de jogadores esperando
   */
  getWaitingPlayers(): number {
    return this.waitingPlayers.length;
  }
}
