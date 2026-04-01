# Guia de Testes - FutCards Backend

Documentação completa sobre testes automatizados para o backend do FutCards.

## 🧪 Visão Geral

O projeto utiliza **Jest** como framework de testes com suporte a **TypeScript**.

### Tecnologias
- **Jest:** Framework de testes
- **ts-jest:** Suporte para TypeScript
- **@types/jest:** Tipos TypeScript para Jest

## 📁 Estrutura de Testes

```
src/
├── __tests__/
│   ├── setup.ts           # Setup global
│   ├── gameLogic.test.ts  # Testes de lógica do jogo
│   └── ...
├── utils/
│   ├── gameLogic.ts       # Código a testar
│   └── ...
└── ...
```

## 🚀 Executar Testes

### Testes Básicos
```bash
npm test
```

### Testes em Modo Watch
```bash
npm run test:watch
```

### Cobertura de Testes
```bash
npm run test:coverage
```

## 📊 Cobertura Esperada

- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

## 🧬 Testes Implementados

### GameLogic Tests (35 testes)

#### calculateActionPower
- ✅ Calcula poder de chute corretamente
- ✅ Calcula poder de ataque corretamente
- ✅ Calcula poder de defesa corretamente
- ✅ Calcula poder de dribla corretamente

#### resolveAction
- ✅ Resolve ação com sucesso
- ✅ Retorna objeto com estrutura correta

#### generateRandomAction
- ✅ Gera ação aleatória válida
- ✅ Gera múltiplas ações diferentes

#### isValidTurn
- ✅ Valida turnos válidos (1-8)
- ✅ Rejeita turnos inválidos

#### shouldAddCard
- ✅ Retorna true para turnos 3 e 5
- ✅ Retorna false para outros turnos

#### shouldMatchEnd
- ✅ Retorna true quando turno > 8
- ✅ Retorna false quando turno <= 8

#### calculateExperience
- ✅ Calcula XP base por turno
- ✅ Adiciona XP por gols
- ✅ Adiciona bônus por vitória

#### calculateRewards
- ✅ Calcula moedas base
- ✅ Adiciona moedas por gols
- ✅ Adiciona bônus por vitória

#### isValidDeck
- ✅ Aceita deck válido
- ✅ Rejeita deck com número errado
- ✅ Rejeita deck sem goleiro
- ✅ Rejeita deck com poucos jogadores

#### isValidInitialSelection
- ✅ Aceita seleção válida
- ✅ Rejeita seleção com número errado
- ✅ Rejeita seleção com cartas fora do deck

## 📝 Escrevendo Novos Testes

### Estrutura Básica

```typescript
describe('NomeDoModulo', () => {
  describe('nomeDoMetodo', () => {
    it('deve fazer algo específico', () => {
      // Arrange
      const input = { /* dados */ };

      // Act
      const result = functionToTest(input);

      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Exemplo Completo

```typescript
describe('MatchService', () => {
  describe('calculateRewards', () => {
    it('deve calcular moedas por vitória', () => {
      // Arrange
      const turn = 8;
      const score = 3;
      const won = true;

      // Act
      const rewards = MatchService.calculateRewards(turn, score, won);

      // Assert
      expect(rewards.gameCoins).toBeGreaterThan(0);
      expect(rewards.specialCoins).toBeGreaterThan(0);
    });
  });
});
```

## 🔍 Assertions Comuns

```typescript
// Igualdade
expect(value).toBe(expected);
expect(value).toEqual(expected);

// Comparação
expect(value).toBeGreaterThan(5);
expect(value).toBeLessThan(10);
expect(value).toBeGreaterThanOrEqual(5);

// Tipo
expect(value).toBeDefined();
expect(value).toBeNull();
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objetos
expect(obj).toHaveProperty('key');
expect(obj).toEqual({ key: 'value' });

// Funções
expect(fn).toThrow();
expect(fn).toThrow(Error);
```

## 🎯 Testes para Implementar

### Auth Tests
```typescript
describe('AuthController', () => {
  describe('register', () => {
    it('deve registrar novo usuário');
    it('deve rejeitar email duplicado');
    it('deve validar força de senha');
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas');
    it('deve rejeitar credenciais inválidas');
  });
});
```

### Inventory Tests
```typescript
describe('InventoryController', () => {
  describe('addCard', () => {
    it('deve adicionar carta ao inventário');
    it('deve rejeitar carta inválida');
  });

  describe('upgradeCard', () => {
    it('deve fazer upgrade de carta');
    it('deve rejeitar upgrade sem moedas');
  });
});
```

### Payment Tests
```typescript
describe('PaymentController', () => {
  describe('createPaymentIntent', () => {
    it('deve criar payment intent');
    it('deve rejeitar pacote inválido');
  });

  describe('confirmPayment', () => {
    it('deve confirmar pagamento bem-sucedido');
    it('deve rejeitar pagamento falhado');
  });
});
```

## 🔧 Mocking

### Mock de Funções

```typescript
const mockFn = jest.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue({ success: true });
mockFn.mockRejectedValue(new Error('Failed'));

expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg);
expect(mockFn).toHaveBeenCalledTimes(1);
```

### Mock de Módulos

```typescript
jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn(),
  },
}));
```

## 📈 Cobertura

### Gerar Relatório
```bash
npm run test:coverage
```

### Visualizar Relatório
```bash
open coverage/lcov-report/index.html
```

## 🚨 Boas Práticas

1. **Nomes Descritivos**
   - ✅ `it('deve rejeitar email duplicado')`
   - ❌ `it('test email')`

2. **Uma Asserção por Teste**
   - ✅ Testes focados e específicos
   - ❌ Múltiplas asserções não relacionadas

3. **Arrange-Act-Assert**
   - ✅ Estrutura clara do teste
   - ❌ Código misturado

4. **Dados de Teste**
   - ✅ Usar fixtures ou builders
   - ❌ Dados hardcoded

5. **Testes Independentes**
   - ✅ Cada teste é independente
   - ❌ Testes que dependem uns dos outros

## 🐛 Debugging

### Executar Teste Específico
```bash
npm test -- gameLogic.test.ts
```

### Executar Teste Específico com Padrão
```bash
npm test -- -t "calculateRewards"
```

### Debug com Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [Jest API](https://jestjs.io/docs/api)
- [Testing Best Practices](https://jestjs.io/docs/tutorial-react)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)

## 🚀 Próximos Passos

1. Implementar testes de integração
2. Adicionar testes de API
3. Implementar testes E2E
4. Setup de CI/CD com testes
5. Aumentar cobertura para 90%+

## 📞 Troubleshooting

### "Cannot find module"
- Verificar imports
- Verificar tsconfig.json
- Limpar cache: `jest --clearCache`

### "Timeout"
- Aumentar timeout: `jest.setTimeout(30000)`
- Verificar promises não resolvidas

### "Mock not working"
- Verificar se mock está antes do import
- Verificar se está usando jest.mock() corretamente

## 📋 Checklist de Teste

- [ ] Testes unitários implementados
- [ ] Testes de integração implementados
- [ ] Cobertura > 70%
- [ ] Todos os testes passando
- [ ] CI/CD configurado
- [ ] Documentação atualizada
