/**
 * Pacotes de Pagamento - FutCards
 * Preços em Real (BRL) com conversão para USD para Stripe
 */

export interface PaymentPackage {
  id: string;
  name: string;
  priceReal: number; // Preço em Real
  priceUSD: number; // Preço em USD (para Stripe)
  gameCoins: number; // Moedas do jogo
  specialCoins: number; // Moedas especiais
  bonus: string;
}

// Taxa de conversão aproximada: 1 USD = 5 BRL
export const PAYMENT_PACKAGES: PaymentPackage[] = [
  {
    id: 'package_starter',
    name: 'Iniciante',
    priceReal: 4.99,
    priceUSD: 0.99,
    gameCoins: 5000,
    specialCoins: 500,
    bonus: 'Bônus: +500 moedas especiais',
  },
  {
    id: 'package_standard',
    name: 'Padrão',
    priceReal: 13.99,
    priceUSD: 2.99,
    gameCoins: 15000,
    specialCoins: 1500,
    bonus: 'Bônus: +1500 moedas especiais + 1 baú raro',
  },
  {
    id: 'package_premium',
    name: 'Premium',
    priceReal: 27.99,
    priceUSD: 5.99,
    gameCoins: 35000,
    specialCoins: 3500,
    bonus: 'Bônus: +3500 moedas especiais + 1 baú épico',
  },
  {
    id: 'package_elite',
    name: 'Elite',
    priceReal: 59.99,
    priceUSD: 12.99,
    gameCoins: 100000,
    specialCoins: 10000,
    bonus: 'Bônus: +10000 moedas especiais + 1 baú lendário + 1 carta épica',
  },
];

/**
 * Função para obter pacote por ID
 */
export function getPackageById(id: string): PaymentPackage | undefined {
  return PAYMENT_PACKAGES.find((pkg) => pkg.id === id);
}

/**
 * Função para listar todos os pacotes
 */
export function getAllPackages(): PaymentPackage[] {
  return PAYMENT_PACKAGES;
}

/**
 * Função para converter Real para USD
 */
export function convertRealToUSD(real: number): number {
  return Math.round((real / 5) * 100) / 100;
}

/**
 * Função para converter USD para Real
 */
export function convertUSDToReal(usd: number): number {
  return Math.round(usd * 5 * 100) / 100;
}
