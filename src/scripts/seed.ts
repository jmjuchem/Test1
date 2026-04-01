/**
 * Script para popular o banco de dados com cartas, equipamentos e baús
 * Executar: npm run seed
 */

import { pool } from '../config/database';
import { CARDS_DATA } from '../data/cards';
import { EQUIPMENT_DATA } from '../data/equipment';
import { CHESTS_DATA } from '../data/chests';

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    // Limpar dados existentes (opcional)
    console.log('🗑️  Limpando dados existentes...');
    await pool.execute('DELETE FROM chests');
    await pool.execute('DELETE FROM equipment');
    await pool.execute('DELETE FROM cards');

    // Inserir cartas
    console.log('🃏 Inserindo cartas...');
    let cardCount = 0;
    for (const card of CARDS_DATA) {
      const query = `
        INSERT INTO cards (id, name, type, quality, base_attributes, image, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;
      await pool.execute(query, [
        card.id,
        card.name,
        card.type,
        card.quality,
        JSON.stringify(card.attributes),
        card.image,
      ]);
      cardCount++;
    }
    console.log(`✅ ${cardCount} cartas inseridas\n`);

    // Inserir equipamentos
    console.log('⚙️  Inserindo equipamentos...');
    let equipmentCount = 0;
    for (const equipment of EQUIPMENT_DATA) {
      const query = `
        INSERT INTO equipment (id, name, quality, bonus, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      await pool.execute(query, [
        equipment.id,
        equipment.name,
        equipment.quality,
        JSON.stringify(equipment.bonus),
      ]);
      equipmentCount++;
    }
    console.log(`✅ ${equipmentCount} equipamentos inseridos\n`);

    // Inserir baús
    console.log('🎁 Inserindo baús...');
    let chestCount = 0;
    for (const chest of CHESTS_DATA) {
      const query = `
        INSERT INTO chests (id, quality, open_time, rewards, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      const rewards = {
        minCards: chest.minCards,
        maxCards: chest.maxCards,
        minGameCoins: chest.minGameCoins,
        maxGameCoins: chest.maxGameCoins,
        minSpecialCoins: chest.minSpecialCoins,
        maxSpecialCoins: chest.maxSpecialCoins,
        specialCoinChance: chest.specialCoinChance,
      };
      await pool.execute(query, [
        chest.id,
        chest.quality,
        chest.openTime,
        JSON.stringify(rewards),
      ]);
      chestCount++;
    }
    console.log(`✅ ${chestCount} baús inseridos\n`);

    // Estatísticas
    console.log('📊 Estatísticas do Seed:');
    console.log(`   - Cartas: ${cardCount}`);
    console.log(`     • Lendárias: ${CARDS_DATA.filter((c) => c.quality === 'legendary').length}`);
    console.log(`     • Épicas: ${CARDS_DATA.filter((c) => c.quality === 'epic').length}`);
    console.log(`     • Raras: ${CARDS_DATA.filter((c) => c.quality === 'rare').length}`);
    console.log(`     • Incomum: ${CARDS_DATA.filter((c) => c.quality === 'uncommon').length}`);
    console.log(`     • Comuns: ${CARDS_DATA.filter((c) => c.quality === 'common').length}`);
    console.log(`     • Goleiros: ${CARDS_DATA.filter((c) => c.type === 'goalkeeper').length}`);
    console.log(`   - Equipamentos: ${equipmentCount}`);
    console.log(`   - Baús: ${chestCount}\n`);

    console.log('✨ Seed concluído com sucesso!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
}

seedDatabase();
