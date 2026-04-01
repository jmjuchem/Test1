/**
 * Lógica do jogo FutCards
 */

export interface ActionResult {
  type: string;
  result: 'success' | 'fail' | 'blocked';
  power: number;
  defensePower: number;
}

export class MatchService {
  /**
   * Calcula o poder de uma ação
   */
  static calculateActionPower(
    attributes: any,
    actionType: string
  ): number {
    let power = 0;

    switch (actionType) {
      case 'shoot':
        power = attributes.chute || 0;
        break;
      case 'pass':
        power = attributes.ataque || 0;
        break;
      case 'defend':
        power = attributes.defesa || 0;
        break;
      case 'dribble':
        power = ((attributes.ataque || 0) + (attributes.forca || 0)) / 2;
        break;
    }

    // Adicionar variação aleatória (±10%)
    const variation = power * 0.1 * (Math.random() - 0.5) * 2;
    return Math.max(0, power + variation);
  }

  /**
   * Resolve uma ação entre duas cartas
   */
  static resolveAction(action: {
    type: string;
    cardId: string;
    targetCardId?: string;
  }): ActionResult {
    // Simular atributos (em produção, viriam do banco)
    const attackAttributes = {
      chute: 80 + Math.random() * 20,
      ataque: 75 + Math.random() * 25,
      defesa: 60 + Math.random() * 20,
      forca: 70 + Math.random() * 30,
    };

    const defendAttributes = {
      defesa: 70 + Math.random() * 30,
      agilidade: 75 + Math.random() * 25,
    };

    const attackPower = this.calculateActionPower(attackAttributes, action.type);
    const defensePower = this.calculateActionPower(defendAttributes, 'defend');

    const result =
      attackPower > defensePower * 1.1 ? 'success' : 'fail';

    return {
      type: action.type,
      result: result as 'success' | 'fail' | 'blocked',
      power: attackPower,
      defensePower,
    };
  }

  /**
   * Gera uma ação aleatória
   */
  static generateRandomAction(): ActionResult {
    const actionTypes = ['shoot', 'pass', 'defend', 'dribble'];
    const randomAction =
      actionTypes[Math.floor(Math.random() * actionTypes.length)];

    return {
      type: randomAction,
      result: Math.random() > 0.5 ? 'success' : 'fail',
      power: Math.random() * 100,
      defensePower: Math.random() * 100,
    };
  }

  /**
   * Valida se um turno é válido
   */
  static isValidTurn(turn: number): boolean {
    return turn >= 1 && turn <= 8;
  }

  /**
   * Verifica se deve adicionar carta
   */
  static shouldAddCard(turn: number): boolean {
    return turn === 3 || turn === 5;
  }

  /**
   * Verifica se a partida deve terminar
   */
  static shouldMatchEnd(turn: number): boolean {
    return turn > 8;
  }

  /**
   * Calcula pontos de experiência
   */
  static calculateExperience(
    turn: number,
    score: number,
    won: boolean
  ): number {
    let xp = 0;

    // XP base por turno
    xp += turn * 10;

    // XP por gols
    xp += score * 50;

    // Bônus por vitória
    if (won) {
      xp += 100;
    }

    return xp;
  }

  /**
   * Calcula recompensas
   */
  static calculateRewards(
    turn: number,
    score: number,
    won: boolean
  ): { gameCoins: number; specialCoins: number } {
    let gameCoins = 0;
    let specialCoins = 0;

    // Moedas base
    gameCoins = turn * 50;

    // Moedas por gols
    gameCoins += score * 100;

    // Bônus por vitória
    if (won) {
      gameCoins += 200;
      specialCoins = 10;
    }

    return { gameCoins, specialCoins };
  }

  /**
   * Valida deck
   */
  static isValidDeck(cards: any[]): boolean {
    if (cards.length !== 10) {
      return false;
    }

    // Verificar se tem goleiro
    const hasGoalkeeper = cards.some((c) => c.type === 'goalkeeper');
    if (!hasGoalkeeper) {
      return false;
    }

    // Verificar se tem pelo menos 3 jogadores de campo
    const fieldPlayers = cards.filter((c) => c.type === 'player');
    if (fieldPlayers.length < 3) {
      return false;
    }

    return true;
  }

  /**
   * Valida seleção de 3 cartas iniciais
   */
  static isValidInitialSelection(
    cards: any[],
    deck: any[]
  ): boolean {
    if (cards.length !== 3) {
      return false;
    }

    // Verificar se todas as cartas estão no deck
    for (const card of cards) {
      if (!deck.find((c) => c.id === card.id)) {
        return false;
      }
    }

    return true;
  }
}
