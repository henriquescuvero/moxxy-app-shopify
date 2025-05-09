# Moxxy App - Shopify Integration

Aplicação integrada com Shopify desenvolvida com Remix Framework para gerenciamento e automação de lojas virtuais.

## Tecnologias Principais

- **Framework**: Remix
- **Integração**: Shopify API
- **Banco de Dados**: Prisma ORM
- **Linguagem**: TypeScript
- **Gerenciamento de Estado**: Session Storage

## Funcionalidades

- Autenticação com Shopify
- Integração com API GraphQL do Shopify
- Gerenciamento de produtos
- Webhooks para eventos em tempo real
- Interface administrativa

## Configuração Inicial

### Pré-requisitos

1. Node.js instalado
2. Conta de parceiro Shopify
3. Loja de desenvolvimento Shopify

### Instalação

```bash
# Instalar dependências
yarn install

# Iniciar servidor de desenvolvimento
yarn dev
```

## Estrutura do Projeto

- `/app`: Código fonte principal
- `/app/shopify.server.ts`: Configuração da integração Shopify
- `/app/routes`: Rotas da aplicação
  - `app.tsx`: Página principal com navegação
  - `popups.tsx`: Gerenciamento de popups
  - `auth.login`: Autenticação
  - `webhooks`: Webhooks do Shopify
- `/prisma`: Definições do banco de dados
- `/extensions`: Extensões do Shopify

## Configuração do Shopify

O projeto utiliza o arquivo `shopify.app.toml` para configuração da aplicação Shopify, incluindo:
- URL da aplicação
- Escopos de permissão
- Configurações de webhooks

## Desenvolvimento Local

O projeto utiliza o Shopify CLI para desenvolvimento local, fornecendo:
- Autenticação automática
- Tunnel para testes
- Ambiente de desenvolvimento configurado
- Suporte a webhooks locais

## Deploy

O projeto está configurado para deploy em:
- Easypanel

## Segurança

- Autenticação segura com Shopify
- Gerenciamento de sessões
- Webhooks verificados
- Proteção contra CSRF

## Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commit das suas alterações
4. Abra um Pull Request

## Licença

