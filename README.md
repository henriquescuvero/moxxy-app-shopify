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

## Funcionalidades Implementadas

### Página de Dashboard (`app/routes/app._index.tsx`)
A página de dashboard principal do aplicativo (`app/routes/app._index.tsx`) exibe as seguintes estatísticas resumidas sobre os pop-ups:
- **Pop-ups Ativos**: Quantidade de pop-ups que estão atualmente ativos e em execução.
- **Visualizações**: Número total de vezes que todos os pop-ups foram exibidos aos usuários.
- **Cliques**: Número total de cliques que os pop-ups receberam.

Esta página serve como uma visão geral rápida do desempenho dos pop-ups gerenciados pelo aplicativo. Atualmente, os dados para estas estatísticas são fornecidos de forma mockada diretamente no código da página para fins de demonstração e desenvolvimento inicial.

A funcionalidade de "Criar Pop-up (Demo)" foi removida desta página para simplificar o dashboard e focar nas estatísticas principais.

### Página de Gerenciamento de Pop-ups (`app/routes/app.popups.tsx`)
- O botão "Criar popup" foi atualizado para usar o componente `Button` do Polaris com o `PlusIcon` para uma melhor experiência visual e consistência com a biblioteca de UI.
- O card informativo no topo da página foi substituído por um componente `Banner` do Polaris para melhor destaque e consistência visual com outras partes do aplicativo.
- Adicionado um botão "Add theme" com o `PlusIcon` ao lado do botão "Criar popup" na `TitleBar` para futuras funcionalidades relacionadas a temas.

**Atualizações Recentes na Página de Dashboard:**
- O título "Estatísticas dos Pop-ups" agora é exibido dentro de um componente `Banner` do Polaris com o tom "success", destacando visualmente esta seção.
- Na página de gerenciamento de pop-ups (`app/routes/app.popups.tsx`), o card informativo que apresentava a página foi substituído por um componente `Banner` com `tone="info"`.
- Os textos dos cards de "Recursos Principais" e "Próximos Passos" foram atualizados para serem mais informativos e alinhados com as funcionalidades do Moxxy App.
- A funcionalidade de "Criar Pop-up (Demo)" e seus elementos associados foram removidos da página de dashboard para simplificar a interface.

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


// ... existing code ...
- Ajustada a exibição dos números de impressões na tabela de pop-ups para utilizar toLocaleString('pt-BR'), garantindo separadores de milhar corretos em UTF-8 no arquivo app/routes/app.popups.tsx.
- O botão "Criar popup" na página de gerenciamento de pop-ups (`app/routes/app.popups.tsx`) foi alterado de um elemento `<button>` HTML padrão para um componente `<Button>` do Polaris, incluindo o `PlusIcon`.
- Adicionado um botão "Add theme" (utilizando o componente `Button` do Polaris com `PlusIcon`) ao lado do botão "Criar popup" no arquivo `app/routes/app.popups.tsx`.

