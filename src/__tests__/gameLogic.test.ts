/**
 * Testes para a lógica do jogo
 */

import { MatchService } from '../utils/gameLogic';

describe('MatchService', () => {
  describe('calculateActionPower', () => {
    it('deve calcular poder de chute corretamente', () => {
      const attributes = {
        chute: 80,
        ataque: 75,
        defesa: 60,
        forca: 70,
      };

      const power = MatchService.calculateActionPower(attributes, 'shoot');

      expect(power).toBeGreaterThan(70);
      expect(power).toBeLessThan(90);
    });

    it('deve calcular poder de ataque corretamente', () => {
      const attributes = {
        ataque: 85,
        chute: 80,
      };

      const power = MatchService.calculateActionPower(attributes, 'pass');

      expect(power).toBeGreaterThan(75);
      expect(power).toBeLessThan(95);
    });

    it('deve calcular poder de defesa corretamente', () => {
      const attributes = {
        defesa: 75,
      };

      const power = MatchService.calculateActionPower(attributes, 'defend');

      expect(power).toBeGreaterThan(65);
      expect(power).toBeLessThan(85);
    });

    it('deve calcular poder de dribla corretamente', () => {
      const attributes = {
        ataque: 80,
        forca: 75,
      };

      const power = MatchService.calculateActionPower(attributes, 'dribble');

      expect(power).toBeGreaterThan(70);
      expect(power).toBeLessThan(85);
    });
  });

  describe('resolveAction', () => {
    it('deve resolver ação com sucesso quando ataque > defesa', () => {
      const action = {
        type: 'shoot',
        cardId: 'card_1',
      };

      const result = MatchService.resolveAction(action);

      expect(result.type).toBe('shoot');
      expect(['success', 'fail', 'blocked']).toContain(result.result);
      expect(result.power).toBeGreaterThan(0);
      expect(result.defensePower).toBeGreaterThan(0);
    });

    it('deve retornar objeto com estrutura correta', () => {
      const action = {
        type: 'pass',
        cardId: 'card_1',
      };

      const result = MatchService.resolveAction(action);

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('power');
      expect(result).toHaveProperty('defensePower');
    });
  });

  describe('generateRandomAction', () => {
    it('deve gerar ação aleatória válida', () => {
      const action = MatchService.generateRandomAction();

      expect(['shoot', 'pass', 'defend', 'dribble']).toContain(action.type);
      expect(['success', 'fail']).toContain(action.result);
      expect(action.power).toBeGreaterThan(0);
      expect(action.power).toBeLessThan(100);
    });

    it('deve gerar múltiplas ações diferentes', () => {
      const actions = Array.from({ length: 10 }, () =>
        MatchService.generateRandomAction()
      );

      const types = new Set(actions.map((a) => a.type));
      expect(types.size).toBeGreaterThan(1);
    });
  });

  describe('isValidTurn', () => {
    it('deve validar turnos válidos', () => {
      expect(MatchService.isValidTurn(1)).toBe(true);
      expect(MatchService.isValidTurn(4)).toBe(true);
      expect(MatchService.isValidTurn(8)).toBe(true);
    });

    it('deve rejeitar turnos inválidos', () => {
      expect(MatchService.isValidTurn(0)).toBe(false);
      expect(MatchService.isValidTurn(9)).toBe(false);
      expect(MatchService.isValidTurn(-1)).toBe(false);
    });
  });

  describe('shouldAddCard', () => {
    it('deve retornar true para turnos 3 e 5', () => {
      expect(MatchService.shouldAddCard(3)).toBe(true);
      expect(MatchService.shouldAddCard(5)).toBe(true);
    });

    it('deve retornar false para outros turnos', () => {
      expect(MatchService.shouldAddCard(1)).toBe(false);
      expect(MatchService.shouldAddCard(2)).toBe(false);
      expect(MatchService.shouldAddCard(4)).toBe(false);
      expect(MatchService.shouldAddCard(6)).toBe(false);
      expect(MatchService.shouldAddCard(7)).toBe(false);
      expect(MatchService.shouldAddCard(8)).toBe(false);
    });
  });

  describe('shouldMatchEnd', () => {
    it('deve retornar true quando turno > 8', () => {
      expect(MatchService.shouldMatchEnd(9)).toBe(true);
      expect(MatchService.shouldMatchEnd(10)).toBe(true);
    });

    it('deve retornar false quando turno <= 8', () => {
      expect(MatchService.shouldMatchEnd(1)).toBe(false);
      expect(MatchService.shouldMatchEnd(8)).toBe(false);
    });
  });

  describe('calculateExperience', () => {
    it('deve calcular XP base por turno', () => {
      const xp = MatchService.calculateExperience(5, 0, false);
      expect(xp).toBe(50); // 5 * 10
    });

    it('deve adicionar XP por gols', () => {
      const xp = MatchService.calculateExperience(5, 2, false);
      expect(xp).toBe(150); // 50 + (2 * 50)
    });

    it('deve adicionar bônus por vitória', () => {
      const xpDerrota = MatchService.calculateExperience(5, 2, false);
      const xpVitoria = MatchService.calculateExperience(5, 2, true);
      expect(xpVitoria).toBe(xpDerrota + 100);
    });
  });

  describe('calculateRewards', () => {
    it('deve calcular moedas base', () => {
      const rewards = MatchService.calculateRewards(5, 0, false);
      expect(rewards.gameCoins).toBe(250); // 5 * 50
      expect(rewards.specialCoins).toBe(0);
    });

    it('deve adicionar moedas por gols', () => {
      const rewards = MatchService.calculateRewards(5, 2, false);
      expect(rewards.gameCoins).toBe(450); // 250 + (2 * 100)
    });

    it('deve adicionar bônus por vitória', () => {
      const rewardsDerrota = MatchService.calculateRewards(5, 2, false);
      const rewardsVitoria = MatchService.calculateRewards(5, 2, true);
      expect(rewardsVitoria.gameCoins).toBe(rewardsDerrota.gameCoins + 200);
      expect(rewardsVitoria.specialCoins).toBe(10);
    });
  });

  describe('isValidDeck', () => {
    it('deve aceitar deck válido', () => {
      const deck = [
        { id: 'gk_1', type: 'goalkeeper' },
        { id: 'p_1', type: 'player' },
        { id: 'p_2', type: 'player' },
        { id: 'p_3', type: 'player' },
        { id: 'p_4', type: 'player' },
        { id: 'p_5', type: 'player' },
        { id: 'p_6', type: 'player' },
        { id: 'p_7', type: 'player' },
        { id: 'p_8', type: 'player' },
        { id: 'p_9', type: 'player' },
      ];

      expect(MatchService.isValidDeck(deck)).toBe(true);
    });

    it('deve rejeitar deck com número errado de cartas', () => {
      const deck = [
        { id: 'gk_1', type: 'goalkeeper' },
        { id: 'p_1', type: 'player' },
      ];

      expect(MatchService.isValidDeck(deck)).toBe(false);
    });

    it('deve rejeitar deck sem goleiro', () => {
      const deck = Array.from({ length: 10 }, (_, i) => ({
        id: `p_${i}`,
        type: 'player',
      }));

      expect(MatchService.isValidDeck(deck)).toBe(false);
    });

    it('deve rejeitar deck com poucos jogadores de campo', () => {
      const deck = [
        { id: 'gk_1', type: 'goalkeeper' },
        { id: 'p_1', type: 'player' },
        { id: 'p_2', type: 'player' },
        ...Array.from({ length: 7 }, (_, i) => ({
          id: `gk_${i}`,
          type: 'goalkeeper',
        })),
      ];

      expect(MatchService.isValidDeck(deck)).toBe(false);
    });
  });

  describe('isValidInitialSelection', () => {
    it('deve aceitar seleção válida', () => {
      const cards = [
        { id: 'p_1' },
        { id: 'p_2' },
        { id: 'p_3' },
      ];

      const deck = [
        { id: 'p_1', type: 'player' },
        { id: 'p_2', type: 'player' },
        { id: 'p_3', type: 'player' },
        { id: 'p_4', type: 'player' },
      ];

      expect(MatchService.isValidInitialSelection(cards, deck)).toBe(true);
    });

    it('deve rejeitar seleção com número errado de cartas', () => {
      const cards = [
        { id: 'p_1' },
        { id: 'p_2' },
      ];

      const deck = [
        { id: 'p_1', type: 'player' },
        { id: 'p_2', type: 'player' },
      ];

      expect(MatchService.isValidInitialSelection(cards, deck)).toBe(false);
    });

    it('deve rejeitar seleção com cartas fora do deck', () => {
      const cards = [
        { id: 'p_1' },
        { id: 'p_2' },
        { id: 'p_999' },
      ];

      const deck = [
        { id: 'p_1', type: 'player' },
        { id: 'p_2', type: 'player' },
      ];

      expect(MatchService.isValidInitialSelection(cards, deck)).toBe(false);
    });
  });
});
