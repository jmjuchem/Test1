/**
 * Catálogo de Baús - FutCards
 * 5 baús de diferentes qualidades
 */

export interface ChestData {
  id: string;
  quality: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  openTime: number; // em segundos
  minCards: number;
  maxCards: number;
  minGameCoins: number;
  maxGameCoins: number;
  minSpecialCoins: number;
  maxSpecialCoins: number;
  specialCoinChance: number; // 0-1 (probabilidade)
  price: number; // em moedas do jogo
}

export const CHESTS_DATA: ChestData[] = [
  {
    id: 'chest_common',
    quality: 'common',
    openTime: 600, // 10 minutos
    minCards: 1,
    maxCards: 2,
    minGameCoins: 100,
    maxGameCoins: 300,
    minSpecialCoins: 0,
    maxSpecialCoins: 0,
    specialCoinChance: 0.05, // 5% de chance
    price: 500,
  },
  {
    id: 'chest_uncommon',
    quality: 'uncommon',
    openTime: 1800, // 30 minutos
    minCards: 2,
    maxCards: 3,
    minGameCoins: 300,
    maxGameCoins: 600,
    minSpecialCoins: 0,
    maxSpecialCoins: 10,
    specialCoinChance: 0.15, // 15% de chance
    price: 1000,
  },
  {
    id: 'chest_rare',
    quality: 'rare',
    openTime: 3600, // 1 hora
    minCards: 3,
    maxCards: 4,
    minGameCoins: 600,
    maxGameCoins: 1200,
    minSpecialCoins: 10,
    maxSpecialCoins: 30,
    specialCoinChance: 0.35, // 35% de chance
    price: 2000,
  },
  {
    id: 'chest_epic',
    quality: 'epic',
    openTime: 7200, // 2 horas
    minCards: 4,
    maxCards: 5,
    minGameCoins: 1200,
    maxGameCoins: 2500,
    minSpecialCoins: 30,
    maxSpecialCoins: 75,
    specialCoinChance: 0.65, // 65% de chance
    price: 5000,
  },
  {
    id: 'chest_legendary',
    quality: 'legendary',
    openTime: 10800, // 3 horas
    minCards: 5,
    maxCards: 6,
    minGameCoins: 2500,
    maxGameCoins: 5000,
    minSpecialCoins: 75,
    maxSpecialCoins: 150,
    specialCoinChance: 0.95, // 95% de chance
    price: 10000,
  },
];

/**
 * Gera recompensas aleatórias para um baú
 */
export function generateChestRewards(chest: ChestData) {
  const numCards = Math.floor(
    Math.random() * (chest.maxCards - chest.minCards + 1) + chest.minCards
  );

  const gameCoins = Math.floor(
    Math.random() * (chest.maxGameCoins - chest.minGameCoins + 1) +
      chest.minGameCoins
  );

  let specialCoins = 0;
  if (Math.random() < chest.specialCoinChance) {
    specialCoins = Math.floor(
      Math.random() * (chest.maxSpecialCoins - chest.minSpecialCoins + 1) +
        chest.minSpecialCoins
    );
  }

  return {
    numCards,
    gameCoins,
    specialCoins,
  };
}
