# Guia de Testes

Este documento fornece instruções sobre como testar a implementação da API GraphQL e Webhooks do Moxxy App.

## Pré-requisitos

- Node.js 18+ instalado
- Acesso a uma loja Shopify de desenvolvimento
- Aplicativo Shopify configurado no Partner Dashboard
- Variáveis de ambiente configuradas corretamente

## Configuração do Ambiente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente** no arquivo `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/moxxy"
   SHOPIFY_API_KEY=seu_api_key
   SHOPIFY_API_SECRET=seu_api_secret
   SHOPIFY_APP_URL=https://sua-url-de-teste.com
   NODE_ENV=development
   ```

3. **Execute as migrações do banco de dados:**
   ```bash
   npm run migrate
   ```

## Testando a API GraphQL

### 1. Consulta de Produtos

Você pode testar a consulta de produtos usando o seguinte exemplo:

```typescript
import { getProducts } from '~/services/graphql.server';

async function testGetProducts() {
  const shop = 'sua-loja.myshopify.com';
  const result = await getProducts(shop, 5);
  console.log('Produtos:', result);
}

testGetProducts();
```

### 2. Consulta de um Produto Específico

```typescript
import { getProduct } from '~/services/graphql.server';

async function testGetProduct() {
  const shop = 'sua-loja.myshopify.com';
  const productId = 'gid://shopify/Product/123456789';
  const result = await getProduct(shop, productId);
  console.log('Detalhes do produto:', result);
}

testGetProduct();
```

## Testando a Sincronização de Produtos

### 1. Sincronização em Lote

```bash
# Sincronizar até 20 produtos
npm run sync-products -- sua-loja.myshopify.com 20
```

### 2. Sincronização Individual

```typescript
import { syncSingleProduct } from '~/services/productSync.server';

async function testSyncSingleProduct() {
  const shop = 'sua-loja.myshopify.com';
  const productId = 'gid://shopify/Product/123456789';
  const result = await syncSingleProduct(shop, productId);
  console.log('Resultado da sincronização:', result);
}

testSyncSingleProduct();
```

## Testando Webhooks

### 1. Registrando Webhooks

```bash
# Registrar todos os webhooks para uma loja
npm run register-webhooks -- sua-loja.myshopify.com
```

### 2. Simulando Webhooks

Você pode usar o Shopify Admin ou ferramentas como Postman para simular webhooks. Aqui está um exemplo de payload para um webhook de criação de produto:

```json
{
  "id": 123456789,
  "title": "Produto de Teste",
  "handle": "produto-teste",
  "body_html": "<p>Descrição do produto de teste</p>",
  "vendor": "Moxxy",
  "product_type": "Teste",
  "created_at": "2025-05-16T13:00:00-03:00",
  "updated_at": "2025-05-16T13:00:00-03:00",
  "published_at": "2025-05-16T13:00:00-03:00",
  "template_suffix": null,
  "status": "active",
  "published_scope": "web",
  "tags": "teste, moxxy",
  "variants": [
    {
      "id": 1234567890,
      "title": "Padrão",
      "price": "99.99",
      "sku": "TESTE-001",
      "position": 1,
      "inventory_policy": "deny",
      "compare_at_price": null,
      "fulfillment_service": "manual",
      "inventory_management": "shopify",
      "option1": "Padrão",
      "option2": null,
      "option3": null,
      "created_at": "2025-05-16T13:00:00-03:00",
      "updated_at": "2025-05-16T13:00:00-03:00",
      "taxable": true,
      "barcode": "1234567890123",
      "grams": 100,
      "weight": 0.1,
      "weight_unit": "kg",
      "inventory_quantity": 10,
      "requires_shipping": true
    }
  ],
  "options": [
    {
      "name": "Título",
      "position": 1,
      "values": ["Padrão"]
    }
  ],
  "images": [
    {
      "id": 12345678901,
      "position": 1,
      "src": "https://cdn.shopify.com/s/files/1/1234/5678/products/test.jpg",
      "width": 800,
      "height": 600,
      "created_at": "2025-05-16T13:00:00-03:00",
      "updated_at": "2025-05-16T13:00:00-03:00"
    }
  ]
}
```

## Verificando os Dados no Banco de Dados

Você pode verificar os dados sincronizados no banco de dados usando o Prisma Studio:

```bash
npx prisma studio
```

Isso abrirá uma interface web onde você pode visualizar e gerenciar os dados do banco de dados.

## Solução de Problemas

### Webhooks não estão sendo processados

1. Verifique se o aplicativo está em execução e acessível na internet
2. Confirme se o endpoint de webhooks está configurado corretamente no Shopify Admin
3. Verifique os logs do servidor em busca de erros
4. Confirme se o HMAC está sendo validado corretamente

### Erros de Sincronização

1. Verifique se o token de acesso da loja é válido
2. Confirme se o aplicativo tem as permissões necessárias
3. Verifique os logs do servidor para mensagens de erro detalhadas
4. Tente sincronizar um único produto para isolar o problema

### Problemas de Conexão com o Banco de Dados

1. Verifique se o banco de dados está em execução
2. Confirme se a string de conexão no `.env` está correta
3. Execute as migrações novamente se necessário

## Próximos Passos

- Implementar testes automatizados
- Adicionar monitoramento de erros
- Configurar alertas para falhas de sincronização
- Implementar sistema de filas para processamento em lote
