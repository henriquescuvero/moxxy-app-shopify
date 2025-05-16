Plano de Implementação do Backend - Moxxy App
Visão Geral
O Moxxy App é uma aplicação Shopify que gerencia popups em lojas virtuais. Este documento detalha a implementação do backend da aplicação, dividida em fases.

Fase 1: Configuração Inicial e Autenticação (1-2 semanas)
1.1 Configuração do Projeto
Configuração do Remix Framework
Configuração do Prisma ORM
Configuração do TypeScript
Configuração do Polaris UI Kit
Configuração do ambiente de desenvolvimento
1.2 Autenticação Shopify
Implementação do OAuth 2.0 com Shopify
Configuração de sessões seguras
Implementação de verificação de CSRF
Webhooks básicos (app/uninstalled, app/scopes_update)
Gerenciamento de tokens de acesso
Fase 2: Estrutura de Dados e Banco de Dados (2-3 semanas)
2.1 Modelo de Dados
Definição do schema Prisma
Tabela Popups
id
shop_id
title
content
status
created_at
updated_at
metrics (impressões, cliques)
Tabela Shops
id
shopify_domain
access_token
scopes
created_at
updated_at
2.2 Migrations
Criação das migrações iniciais
Configuração de relacionamentos
Implementação de índices
Definição de constraints
## Fase 3: API e Integração Shopify (Concluída)

### 3.1 API GraphQL

Implementação de um serviço GraphQL para interagir com a API do Shopify:
- `app/services/graphql.server.ts`: Serviço base para consultas GraphQL
- `app/services/productSync.server.ts`: Sincronização de produtos
- Suporte a queries e mutations personalizadas

### 3.2 Webhooks

Implementação de um sistema de webhooks para eventos em tempo real:

#### Webhooks Suportados:
- **Produtos**:
  - `products/create`: Quando um novo produto é criado
  - `products/update`: Quando um produto é atualizado
  - `products/delete`: Quando um produto é excluído
- **Pedidos**:
  - `orders/create`: Quando um novo pedido é criado
  - `orders/updated`: Quando um pedido é atualizado
- **Clientes**:
  - `customers/create`: Quando um novo cliente é criado
  - `customers/update`: Quando um cliente é atualizado

#### Funcionalidades:
- Registro automático de webhooks durante a instalação
- Processamento assíncrono de eventos
- Tratamento de erros e retentativa

### 3.3 Sincronização de Dados

- Sincronização em lote de produtos
- Sincronização individual de produtos
- Atualização em tempo real via webhooks

### 3.4 Scripts de Utilidade

- `npm run migrate`: Executa migrações do banco de dados
- `npm run register-webhooks`: Registra webhooks manualmente
- `npm run sync-products`: Sincroniza produtos da loja

### 3.5 Modelo de Dados Atualizado

```prisma
model Product {
  id          String   @id @default(uuid())
  shopifyId   String   @unique @db.VarChar(50)
  title       String   @db.VarChar(255)
  description String?  @db.Text
  handle      String   @db.VarChar(255)
  imageUrl    String?  @db.VarChar(512)
  price       String   @db.VarChar(20)
  currency    String   @default("USD") @db.VarChar(3)
  shopId      String
  shop        Shop     @relation(fields: [shopId], references: [id])
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")


  @@index([shopId])
  @@index([title])
  @@index([handle])
  @@index([createdAt])
  map("products")
}
```
Fase 4: Gerenciamento de Popups (2-3 semanas)
4.1 CRUD de Popups
Implementação completa do fluxo de criação
Sistema de edição com preview
Gestão de status (ativo/inativo)
Sistema de deleção segura
4.2 Sistema de Métricas
Contagem de impressões
Rastreamento de cliques
Agregação de dados
Dashboard de métricas
Fase 5: Segurança e Performance (2-3 semanas)
5.1 Segurança
Validação de inputs
Proteção contra injeção SQL
Rate limiting
Logging de segurança
Monitoramento de erros
5.2 Performance
Cache de dados
Otimização de queries
Paginação eficiente
Implementação de índices
Monitoramento de performance
Fase 6: Testes e Deploy (1-2 semanas)
6.1 Testes
Testes unitários
Testes de integração
Testes de carga
Testes de segurança
6.2 Deploy
Configuração do ambiente de produção
Deploy automatizado
Monitoramento de produção
Backup de dados
Considerações Finais
Documentação completa da API
Guia de desenvolvimento
Procedimentos de backup
Plano de escalabilidade
Monitoramento de métricas
Tecnologias Principais
Framework: Remix
Banco de Dados: PostgreSQL via Prisma
Linguagem: TypeScript
UI Framework: Polaris (Shopify)
Gerenciamento de Estado: Session Storage
API: REST + GraphQL (Shopify)