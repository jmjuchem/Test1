/**
 * Catálogo de Equipamentos - FutCards
 * 30+ equipamentos de diferentes qualidades
 */

export interface EquipmentData {
  id: string;
  name: string;
  quality: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  bonus: {
    chute?: number;
    ataque?: number;
    defesa?: number;
    forca?: number;
    salto?: number;
    estamina?: number;
    habilidadeComMaos?: number;
    agilidade?: number;
  };
  price: number; // em moedas do jogo
}

export const EQUIPMENT_DATA: EquipmentData[] = [
  // Lendários
  {
    id: 'eq_legendary_boots',
    name: 'Chuteira de Ouro Lendária',
    quality: 'legendary',
    bonus: {
      chute: 15,
      forca: 8,
      estamina: 5,
    },
    price: 10000,
  },
  {
    id: 'eq_legendary_gloves',
    name: 'Luvas Lendárias Premium',
    quality: 'legendary',
    bonus: {
      habilidadeComMaos: 15,
      agilidade: 10,
      salto: 8,
    },
    price: 10000,
  },
  {
    id: 'eq_legendary_shin_guards',
    name: 'Caneleira Lendária',
    quality: 'legendary',
    bonus: {
      defesa: 15,
      forca: 10,
      salto: 8,
    },
    price: 10000,
  },
  {
    id: 'eq_legendary_wristband',
    name: 'Fita de Pulso Lendária',
    quality: 'legendary',
    bonus: {
      forca: 12,
      estamina: 12,
      ataque: 8,
    },
    price: 10000,
  },
  {
    id: 'eq_legendary_headband',
    name: 'Faixa Lendária',
    quality: 'legendary',
    bonus: {
      ataque: 12,
      defesa: 10,
      salto: 10,
    },
    price: 10000,
  },

  // Épicos
  {
    id: 'eq_epic_boots',
    name: 'Chuteira de Ouro Épica',
    quality: 'epic',
    bonus: {
      chute: 12,
      forca: 6,
      estamina: 4,
    },
    price: 5000,
  },
  {
    id: 'eq_epic_gloves',
    name: 'Luvas Épicas',
    quality: 'epic',
    bonus: {
      habilidadeComMaos: 12,
      agilidade: 8,
      salto: 6,
    },
    price: 5000,
  },
  {
    id: 'eq_epic_shin_guards',
    name: 'Caneleira Épica',
    quality: 'epic',
    bonus: {
      defesa: 12,
      forca: 8,
      salto: 6,
    },
    price: 5000,
  },
  {
    id: 'eq_epic_wristband',
    name: 'Fita de Pulso Épica',
    quality: 'epic',
    bonus: {
      forca: 10,
      estamina: 10,
      ataque: 6,
    },
    price: 5000,
  },
  {
    id: 'eq_epic_socks',
    name: 'Meia Épica',
    quality: 'epic',
    bonus: {
      estamina: 12,
      salto: 8,
      agilidade: 6,
    },
    price: 5000,
  },

  // Raros
  {
    id: 'eq_rare_boots',
    name: 'Chuteira de Ouro Rara',
    quality: 'rare',
    bonus: {
      chute: 8,
      forca: 4,
      estamina: 2,
    },
    price: 2500,
  },
  {
    id: 'eq_rare_gloves',
    name: 'Luvas Raras',
    quality: 'rare',
    bonus: {
      habilidadeComMaos: 8,
      agilidade: 5,
      salto: 4,
    },
    price: 2500,
  },
  {
    id: 'eq_rare_shin_guards',
    name: 'Caneleira Rara',
    quality: 'rare',
    bonus: {
      defesa: 8,
      forca: 5,
      salto: 4,
    },
    price: 2500,
  },
  {
    id: 'eq_rare_wristband',
    name: 'Fita de Pulso Rara',
    quality: 'rare',
    bonus: {
      forca: 6,
      estamina: 6,
      ataque: 4,
    },
    price: 2500,
  },
  {
    id: 'eq_rare_headband',
    name: 'Faixa Rara',
    quality: 'rare',
    bonus: {
      ataque: 8,
      defesa: 6,
      salto: 6,
    },
    price: 2500,
  },
  {
    id: 'eq_rare_socks',
    name: 'Meia Rara',
    quality: 'rare',
    bonus: {
      estamina: 8,
      salto: 5,
      agilidade: 4,
    },
    price: 2500,
  },
  {
    id: 'eq_rare_chest_protector',
    name: 'Protetor de Peito Raro',
    quality: 'rare',
    bonus: {
      defesa: 7,
      forca: 6,
      estamina: 5,
    },
    price: 2500,
  },

  // Incomum
  {
    id: 'eq_uncommon_boots',
    name: 'Chuteira Incomum',
    quality: 'uncommon',
    bonus: {
      chute: 5,
      forca: 2,
      estamina: 1,
    },
    price: 1000,
  },
  {
    id: 'eq_uncommon_gloves',
    name: 'Luvas Incomum',
    quality: 'uncommon',
    bonus: {
      habilidadeComMaos: 5,
      agilidade: 3,
      salto: 2,
    },
    price: 1000,
  },
  {
    id: 'eq_uncommon_shin_guards',
    name: 'Caneleira Incomum',
    quality: 'uncommon',
    bonus: {
      defesa: 5,
      forca: 3,
      salto: 2,
    },
    price: 1000,
  },
  {
    id: 'eq_uncommon_wristband',
    name: 'Fita de Pulso Incomum',
    quality: 'uncommon',
    bonus: {
      forca: 4,
      estamina: 4,
      ataque: 2,
    },
    price: 1000,
  },
  {
    id: 'eq_uncommon_headband',
    name: 'Faixa Incomum',
    quality: 'uncommon',
    bonus: {
      ataque: 5,
      defesa: 3,
      salto: 3,
    },
    price: 1000,
  },
  {
    id: 'eq_uncommon_socks',
    name: 'Meia Incomum',
    quality: 'uncommon',
    bonus: {
      estamina: 5,
      salto: 3,
      agilidade: 2,
    },
    price: 1000,
  },

  // Comum
  {
    id: 'eq_common_boots',
    name: 'Chuteira Comum',
    quality: 'common',
    bonus: {
      chute: 2,
      forca: 1,
    },
    price: 300,
  },
  {
    id: 'eq_common_gloves',
    name: 'Luvas Comuns',
    quality: 'common',
    bonus: {
      habilidadeComMaos: 2,
      agilidade: 1,
    },
    price: 300,
  },
  {
    id: 'eq_common_shin_guards',
    name: 'Caneleira Comum',
    quality: 'common',
    bonus: {
      defesa: 2,
      forca: 1,
    },
    price: 300,
  },
  {
    id: 'eq_common_wristband',
    name: 'Fita de Pulso Comum',
    quality: 'common',
    bonus: {
      forca: 2,
      estamina: 2,
    },
    price: 300,
  },
  {
    id: 'eq_common_socks',
    name: 'Meia Comum',
    quality: 'common',
    bonus: {
      estamina: 2,
      salto: 1,
    },
    price: 300,
  },
];
