# FutCards Backend API

Backend Node.js/Express para o jogo FutCards - Jogo de Futebol de Cartas.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 16+
- MySQL 8+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações
nano .env
```

### Configurar Banco de Dados

```bash
# Conectar ao MySQL
mysql -u root -p

# Executar script SQL
source database.sql;
```

### Executar em Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

### Build para Produção

```bash
npm run build
npm start
```

## 📚 Documentação da API

### Autenticação

#### POST `/api/auth/register`
Registra um novo usuário.

**Request:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  },
  "token": "string"
}
```

#### POST `/api/auth/login`
Faz login de um usuário.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  },
  "token": "string",
  "expiresIn": 86400
}
```

#### GET `/api/auth/profile`
Obtém o perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "created_at": "timestamp"
  }
}
```

### Inventário

#### GET `/api/user/inventory`
Obtém o inventário completo do usuário.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "inventory": {
    "cards": [],
    "currency": {
      "gameCoins": "number",
      "specialCoins": "number"
    },
    "equipment": [],
    "chests": [],
    "deck": []
  }
}
```

#### POST `/api/user/inventory/cards`
Adiciona uma carta ao inventário.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "cardId": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "card": {
    "id": "string",
    "userId": "string",
    "cardId": "string",
    "level": 1,
    "copies": 1
  }
}
```

#### POST `/api/user/inventory/upgrade-card`
Faz upgrade de uma carta.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "cardId": "string",
  "cost": "number"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Carta atualizada com sucesso"
}
```

#### POST `/api/user/inventory/currency`
Adiciona moedas ao usuário.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "gameCoins": "number",
  "specialCoins": "number"
}
```

**Response (200):**
```json
{
  "success": true,
  "currency": {
    "gameCoins": "number",
    "specialCoins": "number"
  }
}
```

## 🏗️ Estrutura do Projeto

```
futcards-backend/
├── src/
│   ├── config/          # Configurações (banco de dados, etc)
│   ├── controllers/     # Controladores de requisições
│   ├── middleware/      # Middlewares (autenticação, etc)
│   ├── models/          # Modelos de dados
│   ├── routes/          # Rotas da API
│   ├── services/        # Serviços de lógica
│   ├── utils/           # Funções utilitárias
│   └── index.ts         # Arquivo principal
├── dist/                # Código compilado
├── database.sql         # Script SQL
├── .env.example         # Exemplo de variáveis de ambiente
├── package.json         # Dependências
├── tsconfig.json        # Configuração TypeScript
└── README.md            # Este arquivo
```

## 🔐 Segurança

- Senhas criptografadas com bcryptjs
- Autenticação com JWT
- CORS configurável
- Validação de entrada em todos os endpoints
- Rate limiting recomendado em produção

## 🗄️ Banco de Dados

### Tabelas Principais

- **users:** Informações dos usuários
- **cards:** Catálogo de cartas
- **user_cards:** Cartas do inventário do usuário
- **user_currency:** Moedas do usuário
- **equipment:** Equipamentos disponíveis
- **chests:** Baús disponíveis
- **matches:** Histórico de partidas
- **transactions:** Transações de pagamento

## 📦 Próximas Funcionalidades

- [ ] Endpoints de partidas
- [ ] Endpoints de lojas
- [ ] Integração com Stripe
- [ ] WebSocket para multiplayer
- [ ] Sistema de ranking
- [ ] Testes automatizados
- [ ] Documentação Swagger

## 🤝 Contribuição

1. Criar branch: `git checkout -b feature/nova-feature`
2. Fazer commits: `git commit -am 'Add nova feature'`
3. Push: `git push origin feature/nova-feature`
4. Criar Pull Request

## 📝 Licença

Todos os direitos reservados.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
