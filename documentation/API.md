# Documentação da API

Este documento descreve os serviços e funcionalidades da API do Moxxy App.

## Índice

1. [Visão Geral](#visão-geral)
2. [Serviços](#serviços)
   - [GraphQL Service](#graphql-service)
   - [Webhook Service](#webhook-service)
   - [Product Sync Service](#product-sync-service)
3. [Endpoints](#endpoints)
   - [Webhooks](#webhooks)
4. [Exemplos de Uso](#exemplos-de-uso)
5. [Considerações de Segurança](#considerações-de-segurança)

## Visão Geral

A API do Moxxy App é construída sobre o Shopify App Bridge e oferece integração completa com a API do Shopify, incluindo:

- Consultas GraphQL para buscar e manipular dados
- Webhooks para receber notificações de eventos em tempo real
- Sincronização de dados com um banco de dados local

## Serviços

### GraphQL Service

Localizado em `app/services/graphql.server.ts`, este serviço fornece uma interface para executar consultas GraphQL na API do Shopify.

**Métodos Principais:**

- `shopifyGraphQLQuery(shop: string, query: string, variables?: any)`: Executa uma consulta GraphQL
- `getProducts(shop: string, first: number = 10, after?: string)`: Busca uma lista de produtos
- `getProduct(shop: string, id: string)`: Busca um produto específico por ID

### Webhook Service

Localizado em `app/services/webhooks.server.ts`, este serviço gerencia o registro e processamento de webhooks do Shopify.

**Métodos Principais:**

- `registerWebhook(shop: string, topic: string)`: Registra um webhook
- `processWebhook(topic: string, shop: string, payload: any)`: Processa um webhook recebido
- `registerAllWebhooks(shop: string)`: Registra todos os webhooks necessários

### Product Sync Service

Localizado em `app/services/productSync.server.ts`, este serviço sincroniza produtos entre o Shopify e o banco de dados local.

**Métodos Principais:**

- `syncShopifyProducts(options: SyncProductsOptions)`: Sincroniza produtos em lote
- `syncSingleProduct(shop: string, productId: string)`: Sincroniza um único produto

## Endpoints

### Webhooks

- **POST** `/webhooks`: Endpoint para receber webhooks do Shopify

## Exemplos de Uso

### Consultando produtos via GraphQL

```typescript
import { getProducts } from '~/services/graphql.server';

// Buscar os primeiros 10 produtos
const { data } = await getProducts('loja.myshopify.com', 10);
```

### Registrando um webhook

```typescript
import { registerWebhook } from '~/services/webhooks.server';

// Registrar webhook para criação de produtos
await registerWebhook('loja.myshopify.com', 'products/create');
```

### Sincronizando produtos

```typescript
import { syncShopifyProducts } from '~/services/productSync.server';

// Sincronizar até 50 produtos
await syncShopifyProducts({
  shop: 'loja.myshopify.com',
  batchSize: 10,
  maxProducts: 50
});
```

## Considerações de Segurança

- Todos os endpoints de API exigem autenticação válida do Shopify
- Webhooks são validados usando o HMAC fornecido pelo Shopify
- As credenciais de API são armazenadas de forma segura usando variáveis de ambiente
- O acesso ao banco de dados é protegido pelo Prisma Client, que previne injeção de SQL
