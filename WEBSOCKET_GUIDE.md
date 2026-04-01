# WebSocket e Multiplayer - FutCards

Guia completo para implementar partidas multiplayer em tempo real com WebSocket.

## 🎮 Visão Geral

O sistema de multiplayer usa Socket.IO para comunicação bidirecional em tempo real entre cliente e servidor.

## 🔌 Conexão WebSocket

### Cliente (React Native)

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: userToken,
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

socket.on('connect', () => {
  console.log('Conectado ao servidor');
});

socket.on('disconnect', () => {
  console.log('Desconectado do servidor');
});
```

## 📡 Eventos de Partida

### 1. Procurar Adversário

**Cliente envia:**
```typescript
socket.emit('match:find-opponent');
```

**Servidor responde:**
```json
{
  "event": "match:opponent-found",
  "data": {
    "matchId": "match_...",
    "opponent": {
      "id": "user_...",
      "username": "Jogador"
    }
  }
}
```

Ou aguarda:
```json
{
  "event": "match:waiting-for-opponent",
  "data": {
    "waitingPlayers": 5
  }
}
```

### 2. Partida Criada

**Servidor envia:**
```json
{
  "event": "match:created",
  "data": {
    "matchId": "match_...",
    "opponent": {
      "id": "user_...",
      "username": "Jogador"
    }
  }
}
```

### 3. Seleção de Cartas (20 segundos)

**Cliente envia:**
```typescript
socket.emit('match:select-cards', {
  matchId: 'match_...',
  selectedCards: ['card_1', 'card_2', 'card_3']
});
```

**Servidor envia quando ambos selecionaram:**
```json
{
  "event": "match:started",
  "data": {
    "currentPlayer": "player1",
    "player1": {
      "id": "user_...",
      "username": "Jogador 1",
      "score": 0
    },
    "player2": {
      "id": "user_...",
      "username": "Jogador 2",
      "score": 0
    }
  }
}
```

### 4. Ação do Jogador (8 segundos por turno)

**Cliente envia:**
```typescript
socket.emit('match:action', {
  matchId: 'match_...',
  action: {
    type: 'shoot',        // shoot, pass, defend, dribble
    cardId: 'card_...',
    targetCardId: 'card_...'
  }
});
```

**Servidor envia para ambos:**
```json
{
  "event": "match:action",
  "data": {
    "player": "user_...",
    "action": {
      "type": "shoot",
      "cardId": "card_...",
      "targetCardId": "card_..."
    },
    "result": {
      "type": "shoot",
      "result": "success",
      "power": 85.5,
      "defensePower": 72.3
    },
    "newScore": {
      "player1": 1,
      "player2": 0
    }
  }
}
```

### 5. Próximo Turno

**Servidor envia:**
```json
{
  "event": "match:next-turn",
  "data": {
    "currentPlayer": "player2",
    "currentTurn": 2
  }
}
```

### 6. Adicionar Carta (Turnos 3 e 5)

**Servidor envia:**
```json
{
  "event": "match:add-card",
  "data": {
    "turn": 3,
    "message": "Você pode adicionar uma carta ao campo"
  }
}
```

### 7. Penalidades (Se empate)

**Servidor envia:**
```json
{
  "event": "match:penalties",
  "data": {
    "message": "Partida empatada! Indo para penalidades..."
  }
}
```

**Cliente envia:**
```typescript
socket.emit('match:penalty', {
  matchId: 'match_...',
  result: 'goal' // ou 'miss'
});
```

**Servidor envia resultado:**
```json
{
  "event": "match:penalty-result",
  "data": {
    "player": "user_...",
    "result": "goal",
    "newScore": {
      "player1": 1,
      "player2": 0
    }
  }
}
```

### 8. Partida Finalizada

**Servidor envia:**
```json
{
  "event": "match:finished",
  "data": {
    "winner": "user_...",
    "finalScore": {
      "player1": 3,
      "player2": 2
    }
  }
}
```

### 9. Jogador Desconectado

**Servidor envia:**
```json
{
  "event": "match:player-disconnected",
  "data": {
    "winner": "user_...",
    "message": "Adversário desconectou"
  }
}
```

## 🔐 Autenticação

O WebSocket requer um token JWT válido:

```typescript
const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('token'),
  },
});
```

O servidor valida o token antes de permitir conexão.

## 📊 Endpoints de Status

### GET `/health`
Retorna status do servidor e partidas ativas.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00Z",
  "activeMatches": 5,
  "waitingPlayers": 2
}
```

### GET `/stats`
Retorna estatísticas em tempo real.

**Response:**
```json
{
  "activeMatches": 5,
  "waitingPlayers": 2,
  "connectedClients": 15
}
```

## 🎯 Fluxo Completo de uma Partida

```
1. Cliente conecta com token
   ↓
2. Cliente solicita adversário (match:find-opponent)
   ↓
3. Servidor encontra adversário ou aguarda
   ↓
4. Quando encontra, cria partida (match:created)
   ↓
5. Ambos selecionam 3 cartas (match:select-cards)
   ↓
6. Servidor inicia partida (match:started)
   ↓
7. Jogadores fazem ações em turnos (match:action)
   ↓
8. Servidor processa resultado e avança turno
   ↓
9. Repete até turno 8
   ↓
10. Se empate, vai para penalidades (match:penalties)
    ↓
11. Servidor finaliza e envia resultado (match:finished)
    ↓
12. Partida removida após 5 segundos
```

## 🛠️ Implementação Frontend

### Gerenciar Partida

```typescript
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export function useMatch(token: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [matchState, setMatchState] = useState<any>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      auth: { token },
    });

    newSocket.on('match:created', (data) => {
      setMatchId(data.matchId);
    });

    newSocket.on('match:started', (data) => {
      setMatchState(data);
    });

    newSocket.on('match:action', (data) => {
      setMatchState((prev: any) => ({
        ...prev,
        ...data,
      }));
    });

    newSocket.on('match:finished', (data) => {
      setMatchState((prev: any) => ({
        ...prev,
        finished: true,
        winner: data.winner,
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const findOpponent = () => {
    socket?.emit('match:find-opponent');
  };

  const selectCards = (cards: string[]) => {
    socket?.emit('match:select-cards', {
      matchId,
      selectedCards: cards,
    });
  };

  const performAction = (action: any) => {
    socket?.emit('match:action', {
      matchId,
      action,
    });
  };

  return {
    matchId,
    matchState,
    findOpponent,
    selectCards,
    performAction,
  };
}
```

## 🔄 Reconexão Automática

O cliente reconecta automaticamente se a conexão cair:

```typescript
const socket = io('http://localhost:3000', {
  auth: { token },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

socket.on('reconnect', () => {
  console.log('Reconectado!');
  // Re-sincronizar estado se necessário
});
```

## 📈 Performance

### Otimizações

1. **Compressão:** Socket.IO comprime automaticamente
2. **Batching:** Agrupa múltiplos eventos
3. **Throttling:** Limita taxa de eventos
4. **Rooms:** Apenas clientes na sala recebem eventos

### Limites

- Máximo 100 partidas simultâneas (ajustável)
- Máximo 1000 conexões por servidor (ajustável)
- Timeout de inatividade: 60 segundos

## 🐛 Troubleshooting

### "Connection refused"
- Verificar se servidor está rodando
- Verificar URL do servidor
- Verificar CORS

### "Token inválido"
- Verificar se token é válido
- Verificar se token não expirou
- Verificar se token está no formato correto

### "Partida não encontrada"
- Verificar ID da partida
- Verificar se partida foi finalizada
- Verificar logs do servidor

## 📚 Recursos

- [Socket.IO Documentation](https://socket.io/docs/)
- [Socket.IO React Native](https://socket.io/docs/v4/socket-io-client-api/)
- [Real-time Communication](https://socket.io/docs/v4/real-time-communication/)

## 🚀 Próximas Melhorias

- [ ] Salas de espera com chat
- [ ] Replay de partidas
- [ ] Espectadores
- [ ] Torneios em tempo real
- [ ] Matchmaking por rating
- [ ] Histórico de partidas
