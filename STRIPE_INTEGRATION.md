# Integração Stripe - FutCards

Documentação completa da integração de pagamentos com Stripe no FutCards.

## 🔐 Configuração Inicial

### 1. Criar Conta Stripe

1. Acesse [stripe.com](https://stripe.com)
2. Crie uma conta
3. Vá para Dashboard > Developers > API Keys
4. Copie suas chaves:
   - **Publishable Key** (pk_test_...)
   - **Secret Key** (sk_test_...)

### 2. Configurar Variáveis de Ambiente

Edite `.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_test_your_key_here
```

### 3. Configurar Webhook

1. No Dashboard Stripe, vá para Developers > Webhooks
2. Clique em "Add endpoint"
3. URL: `https://seu-dominio.com/api/payment/webhook`
4. Selecione eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copie o Signing Secret para `STRIPE_WEBHOOK_SECRET`

## 💳 Pacotes Premium

O sistema oferece 4 pacotes:

| Pacote | Preço | Moedas do Jogo | Moedas Especiais |
|--------|-------|----------------|------------------|
| Iniciante | $9.99 | 5,000 | 500 |
| Padrão | $24.99 | 15,000 | 1,500 |
| Premium | $49.99 | 35,000 | 3,500 |
| Elite | $99.99 | 100,000 | 10,000 |

## 📡 Endpoints de Pagamento

### GET `/api/payment/packages`
Retorna lista de pacotes disponíveis.

**Response:**
```json
{
  "success": true,
  "packages": [
    {
      "id": "starter",
      "name": "Pacote Iniciante",
      "price": "9.99",
      "currency": "USD",
      "gameCoins": 5000,
      "specialCoins": 500
    }
  ]
}
```

### POST `/api/payment/create-intent`
Cria um Payment Intent para iniciar o pagamento.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "packageId": "starter"
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_test_...",
  "publishableKey": "pk_test_..."
}
```

### POST `/api/payment/confirm`
Confirma um pagamento bem-sucedido.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "paymentIntentId": "pi_test_...",
  "packageId": "starter"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pagamento confirmado com sucesso",
  "rewards": {
    "gameCoins": 5000,
    "specialCoins": 500
  },
  "currency": {
    "gameCoins": 15000,
    "specialCoins": 1000
  }
}
```

### GET `/api/payment/history`
Retorna histórico de transações do usuário.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "txn_...",
      "amount": 9.99,
      "currency": "USD",
      "status": "completed",
      "package_id": "starter",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

## 🔗 Integração Frontend (React Native)

### 1. Instalar Stripe React Native

```bash
npm install @stripe/stripe-react-native
```

### 2. Inicializar Stripe

```typescript
import { useStripe, usePaymentSheet } from '@stripe/stripe-react-native';

export const PremiumShopScreen = () => {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const stripe = useStripe();

  const handlePayment = async (packageId: string) => {
    try {
      // 1. Criar Payment Intent no backend
      const response = await fetch('https://api.futcards.com/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });

      const { clientSecret, publishableKey } = await response.json();

      // 2. Inicializar Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        publishableKey,
        merchantDisplayName: 'FutCards',
      });

      if (initError) {
        console.error('Erro ao inicializar:', initError);
        return;
      }

      // 3. Apresentar formulário de pagamento
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Erro ao apresentar:', presentError);
        return;
      }

      // 4. Confirmar pagamento no backend
      const confirmResponse = await fetch('https://api.futcards.com/api/payment/confirm', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: clientSecret.split('_secret_')[0],
          packageId,
        }),
      });

      const confirmData = await confirmResponse.json();

      if (confirmData.success) {
        Alert.alert('Sucesso!', 'Pagamento realizado com sucesso!');
        // Atualizar inventário
      }
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Falha ao processar pagamento');
    }
  };

  return (
    // UI do shop
  );
};
```

## 🔒 Segurança

### Boas Práticas

1. **Nunca exponha Secret Key no frontend**
   - Sempre use o backend para processar pagamentos
   - Secret Key deve estar apenas no servidor

2. **Validar no Backend**
   - Verificar se o usuário tem permissão
   - Validar valor do pagamento
   - Confirmar status no Stripe

3. **Usar Webhooks**
   - Processar eventos de pagamento via webhook
   - Não confiar apenas no frontend
   - Verificar assinatura do webhook

4. **HTTPS Obrigatório**
   - Todos os endpoints devem usar HTTPS
   - Webhook URL deve ser HTTPS

## 🧪 Testes

### Cartões de Teste Stripe

| Número | Resultado |
|--------|-----------|
| 4242 4242 4242 4242 | Sucesso |
| 4000 0000 0000 0002 | Falha |
| 4000 0025 0000 3155 | Requer autenticação |

### Testar Localmente

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Escutar webhooks locais
stripe listen --forward-to localhost:3000/api/payment/webhook

# Simular evento
stripe trigger payment_intent.succeeded
```

## 📊 Monitoramento

### Verificar Transações

1. Dashboard Stripe > Payments
2. Filtrar por status
3. Ver detalhes de cada transação

### Logs

Verifique os logs do servidor:

```bash
# Ver transações no banco
SELECT * FROM transactions ORDER BY created_at DESC;

# Ver transações por status
SELECT status, COUNT(*) FROM transactions GROUP BY status;
```

## 🐛 Troubleshooting

### "Invalid API Key"
- Verificar se a chave está correta em `.env`
- Verificar se está usando a chave correta (test vs live)

### "Webhook signature verification failed"
- Verificar se `STRIPE_WEBHOOK_SECRET` está correto
- Certificar que está usando o raw body (não JSON parsed)

### "Payment failed"
- Verificar cartão de teste
- Verificar se há fundos suficientes
- Verificar logs do Stripe Dashboard

## 📚 Recursos

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Native](https://github.com/stripe/stripe-react-native)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Webhooks](https://stripe.com/docs/webhooks)

## 🚀 Próximos Passos

1. Testar com cartões de teste
2. Configurar webhook em produção
3. Implementar retry logic
4. Adicionar suporte a múltiplas moedas
5. Implementar sistema de reembolso

## 📞 Suporte

Para problemas com Stripe:
- Contate [Stripe Support](https://support.stripe.com)
- Verifique [Stripe Status](https://status.stripe.com)
