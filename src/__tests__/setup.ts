/**
 * Setup para testes
 */

// Configurar timeout padrão para testes
jest.setTimeout(10000);

// Mock de variáveis de ambiente
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRE = '24h';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'password';
process.env.DB_NAME = 'futcards_test';
