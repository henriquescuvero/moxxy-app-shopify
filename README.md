# Moxxy App - Shopify Integration

Aplicação integrada com Shopify desenvolvida com Remix Framework para gerenciamento de popups em lojas virtuais.

## Visão Geral

O Moxxy App é uma aplicação Shopify embutida que permite aos lojistas gerenciar popups em suas lojas virtuais. A aplicação oferece uma interface amigável construída com o Polaris UI Kit do Shopify e integração completa com a API do Shopify.

## Tecnologias Principais

- **Framework**: Remix
- **Integração**: Shopify API
- **Banco de Dados**: Prisma ORM
- **Linguagem**: TypeScript
- **UI Framework**: Polaris (Shopify)
- **Gerenciamento de Estado**: Session Storage

## Funcionalidades Principais

- **Gestão de Popups**:
  - Criação e edição de popups
  - Ativação/desativação de popups
  - Monitoramento de métricas (impressões, conversões)
  - Gestão em massa de popups
  - Menu de ações individual (editar, excluir) para cada popup na tabela
  - Interface responsiva e intuitiva
  - Correção de ícone no menu de ações do popup (utiliza `HorizontalDotsMinor`)

- **Integração Shopify**:
  - Autenticação segura com Shopify
  - Integração com API GraphQL
  - Webhooks para eventos em tempo real
  - Escopo de acesso: write_products

- **Segurança**:
  - Autenticação segura com Shopify
  - Verificação de sessão
  - Proteção contra CSRF
  - Webhooks verificados
  - Validação de tokens

## Estrutura do Projeto

```
/
├── /app
│   ├── /routes
│   │   ├── app.tsx            # Página principal com navegação
│   │   ├── app.popups.tsx     # Gerenciamento de popups
│   │   ├── auth.login         # Sistema de autenticação
│   │   └── webhooks           # Webhooks do Shopify
│   └── shopify.server.ts      # Configuração da integração Shopify
├── /prisma                  # Definições do banco de dados
├── /extensions             # Extensões do Shopify
├── /public                 # Arquivos estáticos
└── /src                    # Código fonte principal
```

## Configuração do Shopify

O projeto utiliza o arquivo `shopify.app.toml` para configuração da aplicação Shopify. Configurações importantes:

- **URL da Aplicação**: https://ins-week-seo-exterior.trycloudflare.com
- **Escopos de Permissão**: write_products
- **Webhooks Configurados**:
  - app/uninstalled
  - app/scopes_update
- **Autenticação**: Suporte a múltiplas URLs de callback

## Desenvolvimento Local

O projeto utiliza o Shopify CLI para desenvolvimento local. Para começar:

1. Instale as dependências:
```bash
yarn install
```

2. Inicie o servidor de desenvolvimento:
```bash
yarn dev
```

3. O Shopify CLI fornecerá:
   - Autenticação automática
   - Tunnel para testes
   - Ambiente de desenvolvimento configurado
   - Suporte a webhooks locais

## Deploy

O projeto está configurado para deploy em:
- Easypanel

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commit das suas alterações
4. Abra um Pull Request

## Histórico de Versões

- **v0.6 (DD/MM/AAAA)**: Release inicial com funcionalidades básicas de gerenciamento de popups, incluindo criação, listagem, edição (placeholder), exclusão (placeholder), ordenação e ações em massa (placeholder).

## Licença

MIT

