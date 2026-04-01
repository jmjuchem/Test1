-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS futcards;
USE futcards;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de cartas
CREATE TABLE IF NOT EXISTS cards (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('player', 'goalkeeper') NOT NULL,
  quality ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') NOT NULL,
  base_attributes JSON NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_quality (quality)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de cartas do usuário
CREATE TABLE IF NOT EXISTS user_cards (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  card_id VARCHAR(255) NOT NULL,
  level INT DEFAULT 1,
  copies INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_card (user_id, card_id),
  INDEX idx_user_id (user_id),
  INDEX idx_card_id (card_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de moedas do usuário
CREATE TABLE IF NOT EXISTS user_currency (
  user_id VARCHAR(255) PRIMARY KEY,
  game_coins INT DEFAULT 1000,
  special_coins INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de equipamentos
CREATE TABLE IF NOT EXISTS equipment (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  quality ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') NOT NULL,
  bonus JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_quality (quality)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de baús
CREATE TABLE IF NOT EXISTS chests (
  id VARCHAR(255) PRIMARY KEY,
  quality ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') NOT NULL,
  open_time INT NOT NULL,
  rewards JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_quality (quality)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de baús do usuário
CREATE TABLE IF NOT EXISTS user_chests (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  chest_id VARCHAR(255) NOT NULL,
  opened_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chest_id) REFERENCES chests(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de partidas
CREATE TABLE IF NOT EXISTS matches (
  id VARCHAR(255) PRIMARY KEY,
  player1_id VARCHAR(255) NOT NULL,
  player2_id VARCHAR(255),
  status ENUM('selection', 'playing', 'finished', 'penalties') DEFAULT 'selection',
  current_turn INT DEFAULT 1,
  current_player VARCHAR(255),
  player1_score INT DEFAULT 0,
  player2_score INT DEFAULT 0,
  winner VARCHAR(255),
  started_at TIMESTAMP NULL,
  finished_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_player1_id (player1_id),
  INDEX idx_player2_id (player2_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de ações de partida
CREATE TABLE IF NOT EXISTS match_actions (
  id VARCHAR(255) PRIMARY KEY,
  match_id VARCHAR(255) NOT NULL,
  player_id VARCHAR(255) NOT NULL,
  card_id VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  result VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  INDEX idx_match_id (match_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de transações de pagamento
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  stripe_payment_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  package_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_stripe_payment_id (stripe_payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir algumas cartas de exemplo
INSERT INTO cards (id, name, type, quality, base_attributes, image) VALUES
('card_cr7', 'Cristiano Ronaldo', 'player', 'legendary', 
 '{"chute": 95, "ataque": 92, "defesa": 35, "forca": 88, "salto": 85, "estamina": 88}', 
 'https://via.placeholder.com/120x150?text=CR7'),
('card_messi', 'Lionel Messi', 'player', 'legendary',
 '{"chute": 94, "ataque": 93, "defesa": 38, "forca": 75, "salto": 69, "estamina": 90}',
 'https://via.placeholder.com/120x150?text=Messi'),
('card_neymar', 'Neymar Jr', 'player', 'epic',
 '{"chute": 84, "ataque": 87, "defesa": 40, "forca": 78, "salto": 72, "estamina": 85}',
 'https://via.placeholder.com/120x150?text=Neymar'),
('card_alisson', 'Alisson', 'goalkeeper', 'epic',
 '{"habilidadeComMaos": 89, "agilidade": 85, "salto": 82}',
 'https://via.placeholder.com/120x150?text=Alisson');
