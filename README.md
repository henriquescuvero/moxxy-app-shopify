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
  - Criação e edição de popups com preview interativo e layout de duas colunas (`/app/popups/new` e `/app/popups/:id/edit`).
  - Ativação/desativação de popups.
  - Visualização detalhada de popups com métricas em tempo real (`/app/popups/:id/view`).
  - Configurações avançadas de gatilhos (carregamento da página, scroll, saída da página).
  - Personalização completa de estilos (cores, animações, posição).
  - Gestão em massa de popups com ações em lote.
  - Menu de ações individual (editar, excluir) para cada popup na tabela (ícone `HorizontalDotsMinor`).
  - Interface responsiva e intuitiva utilizando Polaris UI Kit.
  - Botão "Criar popup" na página de gerenciamento (`app/routes/app.popups.tsx`) utiliza componente `Button` do Polaris com `PlusIcon`.
  - Card informativo na página de gerenciamento de pop-ups substituído por `Banner` Polaris.
  - Adicionado botão "Add theme" com `PlusIcon` na `TitleBar` da página de gerenciamento de pop-ups.
  - Exibição de números de impressões na tabela de pop-ups formatada com `toLocaleString('pt-BR')`.
  - Sistema de métricas completo com rastreamento de impressões, cliques e taxa de conversão.
  - Configuração de duração de cookies e comportamento de fechamento.

- **Dashboard (`app/routes/app._index.tsx`)**:
  - Exibe estatísticas resumidas: Pop-ups Ativos, Visualizações, Cliques (dados mockados).
  - Título "Estatísticas dos Pop-ups" em `Banner` Polaris com `tone="success"`.
  - Textos dos cards "Recursos Principais" e "Próximos Passos" atualizados.
  - Funcionalidade "Criar Pop-up (Demo)" removida para simplificar a interface.

- **Integração Shopify**:
  - Autenticação segura com Shopify.
  - Integração com API GraphQL.
  - Webhooks para eventos em tempo real (`app/uninstalled`, `app/scopes_update`).
  - Escopo de acesso: `write_products`.

- **Segurança**:
  - Autenticação segura com Shopify.
  - Verificação de sessão.
  - Proteção contra CSRF.
  - Webhooks verificados.
  - Validação de tokens.
  - Validação de inputs com Zod.
  - Proteção contra SQL injection.
  - Rate limiting para prevenção de abuso.
  - Logging de segurança e erros.
  - Monitoramento de erros em tempo real.
  - Sistema de rate limiting configurável.

## Estrutura do Projeto

```text
/
├── .shopify/                # Arquivos de configuração e estado do Shopify CLI
├── .vscode/                 # Configurações do VSCode para o projeto
│   └── extensions.json      # Extensões recomendadas para o VSCode
├── app/                     # Núcleo da aplicação Remix
│   ├── db.server.ts         # Configuração do cliente Prisma para o servidor
│   ├── entry.server.tsx     # Ponto de entrada do servidor para renderização
│   ├── globals.d.ts         # Definições de tipos globais
│   ├── root.tsx             # Componente raiz da aplicação
│   ├── routes.ts            # Arquivo de configuração ou utilitário de rotas (verificar propósito específico no código)
│   ├── routes/              # Definições de rotas da aplicação
│   │   ├── _index/          # Diretório para rotas da raiz do site (ex: landing page, se aplicável)
│   │   ├── app._index.tsx   # Página de dashboard/inicial da app embutida no Shopify Admin
│   │   ├── app.additional.tsx # Página adicional de exemplo dentro da app
│   │   ├── app.popup.new.tsx# Página para criação de novos pop-ups
│   │   ├── app.popups.tsx   # Página para gerenciamento (listar, editar, excluir) de pop-ups
│   │   ├── app.tsx          # Layout principal para as rotas autenticadas da aplicação (/app/*)
│   │   ├── auth.$.tsx       # Rota de fallback ou wildcard para o sistema de autenticação
│   │   ├── auth.login/      # Diretório contendo rotas e lógica para o processo de login/autenticação
│   │   ├── webhooks.app.scopes_update.tsx # Endpoint do webhook para o evento 'app/scopes_update' do Shopify
│   │   └── webhooks.app.uninstalled.tsx   # Endpoint do webhook para o evento 'app/uninstalled' do Shopify
│   └── shopify.server.ts    # Configurações do servidor Shopify (autenticação, contextos de API, etc.)
├── extensions/              # Extensões da aplicação Shopify (ex: theme app extensions, function extensions)
│   └── .gitkeep             # Arquivo placeholder para manter o diretório no versionamento Git
├── prisma/                  # Configuração e arquivos relacionados ao Prisma ORM
│   ├── migrations/          # Diretório contendo os arquivos de migração do banco de dados gerados pelo Prisma
│   │   └── 20250507191434_init/ # Exemplo de um diretório de migração específico (o nome indica a data e um sufixo)
│   │       └── migration_lock.toml # Arquivo de bloqueio para garantir que as migrações sejam aplicadas sequencialmente
│   └── schema.prisma        # Arquivo principal do Prisma contendo o esquema do banco de dados e configuração do cliente
├── public/                  # Diretório para arquivos estáticos que são servidos publicamente
│   └── favicon.ico          # Ícone da aplicação exibido no navegador
├── .dockerignore            # Especifica arquivos e diretórios a serem ignorados ao construir a imagem Docker
├── .editorconfig            # Define e mantém estilos de codificação consistentes entre diferentes editores e IDEs
├── .eslintignore            # Especifica arquivos e diretórios que o ESLint (linter) deve ignorar
├── .eslintrc.cjs            # Arquivo de configuração para o ESLint
├── .gitignore               # Especifica arquivos e diretórios intencionalmente não rastreados pelo Git
├── .graphqlrc.ts            # Arquivo de configuração para ferramentas relacionadas ao GraphQL (ex: GraphQL Code Generator, linters)
├── .npmrc                   # Arquivo de configuração para o npm (Node Package Manager), pode definir registries, etc.
├── .prettierignore          # Especifica arquivos e diretórios que o Prettier (formatador de código) deve ignorar
├── CHANGELOG.md             # Registro de todas as alterações notáveis feitas na aplicação, por versão
├── Dockerfile               # Contém as instruções para construir uma imagem Docker da aplicação
├── README.md                # Este arquivo, fornecendo uma visão geral e documentação do projeto
├── package-lock.json        # Registra as versões exatas de todas as dependências do projeto, garantindo builds consistentes
├── package.json             # Arquivo manifesta do projeto Node.js: metadados, dependências, scripts de execução
├── shopify.app.toml         # Arquivo de configuração principal para a aplicação Shopify (nome, escopos, URLs, etc.)
├── shopify.web.toml         # Arquivo de configuração para frontends web da aplicação Shopify (se houver múltiplos)
├── tsconfig.json            # Arquivo de configuração para o compilador TypeScript (tsc)
└── vite.config.ts           # Arquivo de configuração para o Vite (ferramenta de build e servidor de desenvolvimento frontend)
```

## Atualizações Recentes

Esta seção resume as principais alterações e melhorias recentes no aplicativo.

- **Refinamento da Documentação (README.md)**:
  - A seção "Funcionalidades Principais" foi expandida para incluir detalhes das implementações recentes.
  - A seção "Funcionalidades Implementadas" foi renomeada para "Atualizações Recentes" e simplificada.
- **Melhorias na Interface do Usuário (UI)**:
  - **Dashboard (`app/routes/app._index.tsx`)**: Estatísticas de pop-ups (ativos, visualizações, cliques) agora são apresentadas de forma mais clara; funcionalidade de "Criar Pop-up (Demo)" removida para simplificação.
  - **Gerenciamento de Pop-ups (`app/routes/app.popups.tsx`)**: Botão "Criar popup" atualizado para componente Polaris com `PlusIcon`; card informativo substituído por `Banner`; adicionado botão "Add theme".
  - **Criação de Pop-ups (`app/routes/app.popup.new.tsx`)**: Página corrigida e layout ajustado para preview interativo e melhor usabilidade; botões de ação restaurados.
- **Formatação de Dados**: Números de impressões na tabela de pop-ups agora usam `toLocaleString('pt-BR')`.
- **API de Popups (`app/routes/api/popups.$popupId.ts`)**:
  - Corrigido bug de autenticação que impedia a correta identificação do `shopId` nas operações PUT e DELETE.
  - Implementada a atualização do campo `metrics.lastUpdated` ao editar um popup (método PUT), preservando os valores de `impressions` e `clicks` existentes.
  - Corrigidos erros de TypeScript relacionados à importação de módulos, definição de sessão, tratamento de tipos de erro e chamadas de autenticação nas funções `loader` e `action`.

## Configuração do Shopify

O projeto utiliza o arquivo `shopify.app.toml` para configuração da aplicação Shopify. Configurações importantes:

- **URL da Aplicação**: https://ins-week-seo-exterior.trycloudflare.com
- **Escopos de Permissão**: write_products, read_products, write_customers, read_customers, write_orders, read_orders
- **Webhooks Configurados**:
  - app/uninstalled
  - app/scopes_update
  - products/create
  - products/update
  - products/delete
  - orders/create
  - orders/updated
  - customers/create
  - customers/update
- **Autenticação**: Suporte a múltiplas URLs de callback

## Integração com a API GraphQL do Shopify

O aplicativo inclui uma integração completa com a API GraphQL do Shopify, permitindo:

- Consulta de produtos
- Sincronização de produtos com o banco de dados local
- Gerenciamento de webhooks para eventos da loja

### Scripts disponíveis

- `npm run migrate` - Executa as migrações do banco de dados
- `npm run register-webhooks -- seudominio.myshopify.com` - Registra os webhooks para uma loja específica
- `npm run sync-products -- seudominio.myshopify.com [quantidade]` - Sincroniza produtos da loja para o banco de dados local

### Estrutura de Dados

O aplicativo armazena os seguintes dados localmente:

- **Produtos**: Informações básicas, preços e imagens
- **Webhooks**: Registro de eventos recebidos
- **Sessões**: Dados de autenticação do Shopify

### Webhooks

Os seguintes webhooks são suportados:

- **Produtos**: Criação, atualização e exclusão
- **Pedidos**: Criação e atualização
- **Clientes**: Criação e atualização

Cada webhook é registrado automaticamente durante a instalação do aplicativo e processado de forma assíncrona para melhor desempenho.

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

## Releases

- **main** - Branch principal atualizada com o conteúdo da release v0.8.

- **v0.8** - Tag v0.8 enviada para o repositório remoto.

- **v0.8** - Release inicial da tag v0.8.

- **v0.9** - Tag v0.9 enviada para o repositório remoto.

- **v0.9** - Release inicial da tag v0.9.

- **v0.10** - Tag v0.10 enviada para o repositório remoto.

- **v0.10** - Release inicial da tag v0.10.

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


### Página Adicional (`app/routes/app.additional.tsx`)
- Existe uma página de exemplo em `app/routes/app.additional.tsx` com uma estrutura básica utilizando componentes Polaris.
- O link de navegação para "Página Adicional" foi anteriormente utilizado para testes e o conteúdo desta página não interfere na funcionalidade de criação de pop-ups.

