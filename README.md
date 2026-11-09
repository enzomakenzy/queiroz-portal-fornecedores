# Portal do Fornecedor — Grupo Queiroz

Aplicação Full-Stack desenvolvida para o teste técnico de **Desenvolvedor Full-Stack Pleno** do **Grupo Queiroz**. O portal permite que fornecedores parceiros consultem, de forma autônoma, transparente e segura, todas as suas pendências financeiras (**títulos de débito em aberto**) junto ao Grupo Queiroz, distinguindo valores vencidos e a vencer.

---

## Sumário

1. [Visão Geral e Regra de Negócio](#-visão-geral-e-regra-de-negócio)
2. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
3. [Estrutura do Repositório](#-estrutura-do-repositório)
4. [Como Instalar e Rodar o Projeto do Zero](#-como-instalar-e-rodar-o-projeto-do-zero)
   - [Opção 1: Tudo via Docker (Recomendado para Avaliação Rápida)](#opção-1-tudo-via-docker-recomendado-para-avaliação-rápida)
   - [Opção 2: Ambiente de Desenvolvimento Local](#opção-2-ambiente-de-desenvolvimento-local)
5. [Como Rodar as Migrations e Popular o Banco (Seeds)](#-como-rodar-as-migrations-e-popular-o-banco-seeds)
6. [Credenciais de Teste e Isolamento de Dados](#-credenciais-de-teste-e-isolamento-de-dados)
7. [Principais Decisões Técnicas e o Porquê de Cada Uma](#-principais-decisões-técnicas-e-o-porquê-de-cada-uma)
8. [O Que Eu Faria a Mais se Tivesse Mais Tempo](#-o-que-eu-faria-a-mais-se-tivesse-mais-tempo)

---

## 📌 Visão Geral e Regra de Negócio

O ERP do Grupo Queiroz registra títulos financeiros de duas naturezas na tabela de espécies (`consulta2_especies.csv`):
- **`O` (Obrigação do Queiroz):** valores que o Grupo Queiroz deve pagar ao fornecedor.
- **`D` (Direito do Queiroz):** valores que **o fornecedor deve ao Grupo Queiroz** (devoluções, verbas comerciais, acordos, etc.).

Seguindo estritamente o contexto do negócio, o portal aplica três filtros fundamentais na camada de dados:
1. **Apenas débitos do fornecedor (`obrigdireito = 'D'`):** títulos de obrigação do Queiroz (`'O'`) nunca são expostos.
2. **Apenas títulos com saldo em aberto (`(vlrnominal - vlrpago) > 0`):** títulos integralmente quitados são descartados e pagamentos parciais são abatidos do valor em aberto.
3. **Classificação temporal precisa (UTC):** cada título em aberto é classificado como **Vencido** (`dtavencimento < data_atual`) ou **A vencer** (`dtavencimento >= data_atual`), consolidando o montante global e os subtotais para leitura imediata.

---

## 🚀 Tecnologias Utilizadas

### Back-end (`api/`)
- **Node.js 24** + **TypeScript**
- **NestJS 11** (Arquitetura modular, Injeção de Dependência, Guards, Pipes e Exception Filters)
- **PostgreSQL 17** + **Prisma ORM 7** (`@prisma/adapter-pg` e consultas em SQL nativo via `$queryRaw`)
- **Passport JWT** + **Cookie-Parser** (Autenticação stateless via Cookie `httpOnly`)
- **Bcrypt.js** (Hashing seguro de senhas)
- **Zod** (Validação estrita de payloads de entrada e variáveis de ambiente)
- **Helmet** (Proteção de cabeçalhos HTTP)
- **@nestjs/throttler** (Rate Limiting contra ataques de força bruta e DoS)

### Front-end (`web/`)
- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** (Estilização utilitária com Design Tokens nativos via `@theme`)
- **React Router 7** (Roteamento client-side com Guardas de Rotas públicas e privadas)
- **Axios** (Cliente HTTP configurado com `withCredentials: true` e interceptor de sessão 401)
- **Lucide React** (Iconografia consistente)

### Infraestrutura & DevOps
- **Docker** & **Docker Compose** (Orquestração multi-container com *Multi-Stage Builds*, *Healthchecks* e servidor **Nginx Alpine** em produção para o front-end).

---

## 📂 Estrutura do Repositório

O projeto está organizado como um monorepo contendo o back-end (`api/`) e o front-end (`web/`) claramente desacoplados:

```text
queiroz-portal-fornecedores/
├── api/                                # Back-end REST API (NestJS + Prisma 7)
│   ├── prisma/
│   │   ├── migrations/                 # Histórico de migrations SQL (3FN)
│   │   ├── seeds/                      # Script de seed + arquivos CSV originais do ERP
│   │   └── schema.prisma               # Modelagem das tabelas (fornecedores, especies, titulos)
│   ├── src/
│   │   ├── infra/                      # Módulos transversais (Auth, Cryptography, Database, Env, Pipes)
│   │   └── modules/
│   │       ├── supplier/               # Domínio de Autenticação e Fornecedores
│   │       └── titles/                 # Domínio de Títulos Financeiros e Regras de Negócio
│   └── Dockerfile                      # Multi-stage build (builder + runner enxuto em produção)
│
├── web/                                # Front-end SPA (React 19 + Vite + Tailwind v4)
│   ├── src/
│   │   ├── assets/                     # Identidade visual oficial do Grupo Queiroz
│   │   ├── lib/                        # Instância do Axios e interceptors
│   │   ├── pages/
│   │   │   ├── login/                  # Tela de Login e componentes (LoginHero, LoginForm)
│   │   │   └── dashboard/              # Tela de Pendências (Header, SummaryCards, TitlesTable, Badge)
│   │   ├── routes/                     # Guardas de rota (ProtectedRoute e PublicOnlyRoute)
│   │   ├── services/                   # Camada de integração com a API REST
│   │   ├── types/                      # Contratos e interfaces TypeScript
│   │   └── utils/                      # Formatadores brasileiros (R$ e dd/mm/aaaa em UTC)
│   └── Dockerfile                      # Multi-stage build (Vite build + Nginx Alpine com suporte a SPA)
│
├── docker-compose.yml                  # Orquestração completa (postgres -> migrator -> api -> web)
├── .env.example                        # Template de variáveis para o Docker Compose
└── package.json                        # Scripts utilitários na raiz para controle do Docker
```

---

## 🛠️ Como Instalar e Rodar o Projeto do Zero

Você pode avaliar o projeto de **duas formas**: rodando todo o ecossistema containerizado com **um único comando via Docker** (sem precisar instalar Node ou PostgreSQL na máquina) ou rodando em **modo de desenvolvimento local**.

---

### Opção 1: Tudo via Docker (Recomendado para Avaliação Rápida)

Nesta modalidade, o Docker Compose sobe o banco **PostgreSQL 17**, executa automaticamente o container **Migrator** (que cria as tabelas e popula os CSVs), inicia a **API NestJS** e serve o **Front-end compilado via Nginx**.

#### Pré-requisitos
- [Docker](https://www.docker.com/) e Docker Compose instalados e em execução.

#### Passo a passo

1. Clone o repositório e acesse a pasta raiz:
   ```bash
   git clone https://github.com/enzomakenzy/queiroz-portal-fornecedores.git
   cd queiroz-portal-fornecedores
   ```

2. Crie o arquivo `.env` na raiz copiando o `.env.example` (os valores padrão já estão prontos para o Docker):
   ```bash
   cp .env.example .env
   ```
   *(No Windows PowerShell, você também pode usar `copy .env.example .env`).*

3. Suba toda a stack de produção com um único comando:
   ```bash
   npm run docker:prod
   ```
   *(Ou diretamente: `docker compose --profile production up -d --build`).*

4. Aguarde a conclusão da fila de inicialização (`postgres` -> `migrator` -> `api` -> `web`) e acesse:
   - **Front-end (Portal Web):** [http://localhost:3333](http://localhost:3333)
   - **Back-end (API REST):** [http://localhost:3000](http://localhost:3000)

5. Para encerrar os containers ao finalizar os testes:
   ```bash
   npm run docker:prod:down
   ```

---

### Opção 2: Ambiente de Desenvolvimento Local

Caso prefira subir apenas o banco de dados no Docker e executar o Back-end e o Front-end localmente com *hot-reload*:

#### Pré-requisitos
- **Node.js 22+** (recomendado Node 24 LTS) e **npm**
- **Docker** (para o container do PostgreSQL)

#### Passo a passo

1. **Na raiz do projeto**, crie o `.env` e suba apenas o banco de dados PostgreSQL (mapeado na porta `5433` do host para evitar conflitos com instalações locais na `5432`):
   ```bash
   cp .env.example .env
   npm run docker:dev
   ```

2. **Configure e inicie o Back-end (`api/`):**
   ```bash
   cd api
   cp .env.example .env
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   npm run start:dev
   ```
   A API estará rodando em [http://localhost:3000](http://localhost:3000).

3. **Em outro terminal, configure e inicie o Front-end (`web/`):**
   ```bash
   cd web
   cp .env.example .env
   npm install
   npm run dev
   ```
   O Portal Web estará disponível em [http://localhost:5173](http://localhost:5173).

---

## 🗄️ Como Rodar as Migrations e Popular o Banco (Seeds)

> [!NOTE]
> Se você seguiu qualquer uma das duas opções da seção anterior (**Docker** ou **Ambiente Local**), **você não precisa executar nada aqui**: o banco de dados já foi automaticamente criado, migrado e populado com os dados dos arquivos CSV e os usuários de teste.

Esta seção descreve como esse ciclo funciona por baixo dos panos e como você pode re-executá-lo manualmente caso deseje resetar ou inspecionar o estado do banco.

### Como a carga funciona por padrão:
- **No Docker (`npm run docker:prod`):** O serviço desacoplado `migrator` aguarda o *healthcheck* do PostgreSQL ficar saudável e dispara `npx prisma migrate deploy && npx prisma db seed` antes da inicialização da API.
- **Idempotência Garantida:** O script em `api/prisma/seeds/index.ts` utiliza operações de `upsert` e `skipDuplicates`. As migrations e seeds podem ser executadas repetidas vezes sem risco de duplicação de registros ou violação de chaves.

### Comandos manuais (para reset ou validação isolada):
Caso deseje inspecionar as tabelas ou forçar uma nova execução manual a partir da pasta `api/`:

```bash
cd api

# 1. Gera os artefatos de tipagem do Prisma Client 7
npx prisma generate

# 2. Aplica as migrations SQL criando as tabelas (fornecedores, especies, titulos)
npx prisma migrate deploy

# 3. Lê os CSVs em api/prisma/seeds/data/, normaliza os dados e popula o banco
npx prisma db seed
```

---

## 🔐 Credenciais de Teste e Isolamento de Dados

Para cumprir o **Requisito 3** e permitir a validação prática do **Requisito 4 (Segurança e Isolamento dos Dados)**, o script de seed prepara dois fornecedores distintos:

| Código do Fornecedor (`Usuário`) | Senha | Razão Social | Finalidade no Teste |
| :---: | :---: | :--- | :--- |
| **`4827`** | `queiroz@2026` | `DISTRIBUIDORA EXEMPLO ALIMENTOS LTDA` | **Usuário oficial exigido no PDF.** Possui 92 títulos brutos no CSV, dos quais **34 são débitos (`D`) em aberto** exibidos no portal. |
| **`5001`** | `queiroz@2026` | `LATICINIOS SERTAO NORDESTINO LTDA` | **Fornecedor extra criado no seed** com 2 títulos próprios (`R$ 450,00` vencido e `R$ 1.000,00` a vencer) exclusivamente para comprovar que cada fornecedor enxerga apenas os seus próprios títulos. |

---

## 💡 Principais Decisões Técnicas e o Porquê de Cada Uma

### 1. Escolha da Stack: NestJS no Back-end e React + Vite no Front-end
- **NestJS (`api/`):** Por possuir uma arquitetura fortemente opinada baseada em módulos, Injeção de Dependência nativa e suporte de primeira classe ao TypeScript, o NestJS permite separar responsabilidades de infraestrutura (autenticação, validação, banco) das regras de negócio desde o primeiro dia.
- **React 19 + Vite (`web/`):** Como o Portal do Fornecedor é uma aplicação autenticada (feita para operar atrás de login e sem necessidade de indexação pública/SEO), uma SPA construída com React e Vite entrega transições instantâneas, build extremamente rápido e simplicidade operacional ao ser servida estaticamente via Nginx.

### 2. Princípios SOLID e Arquitetura Limpa Pensando na Evolução do Produto
Como o próprio contexto do teste destaca que esta é a **primeira versão funcional** do portal, estruturei o projeto aplicando princípios do **SOLID** (especialmente *Single Responsibility Principle* e *Dependency Inversion Principle*):
- Os casos de uso (`AuthenticateUseCase` e `FetchPendingTitlesUseCase`) dependem de contratos abstratos (`SupplierRepository`, `TitlesRepository`, `HashComparer`, `Encrypter`), e não diretamente do Prisma, Bcrypt ou JWT.
- Isso mantém o código altamente legível para avaliação e aberto à evolução: caso o Grupo Queiroz decida no futuro substituir a origem dos dados por uma chamada direta a uma procedure do ERP Oracle/Totvs ou adicionar testes unitários em memória, a camada de domínio permanece intacta.

### 3. Normalização do Banco de Dados na 3ª Forma Normal (3FN)
Embora tenham sido fornecidos apenas 2 arquivos CSV (`consulta1_titulos.csv` e `consulta2_especies.csv`), o arquivo de títulos continha dados cadastrais do fornecedor (`seqpessoa` e `nomerazao`) repetidos nas 92 linhas.
- Em vez de criar apenas duas tabelas desnormalizadas, modelei o banco em **3 tabelas relacionais** (`fornecedores`, `especies` e `titulos`), mantendo os nomes de colunas originais do ERP via diretiva `@map` do Prisma.
- Isso elimina redundância de texto, garante integridade referencial via chaves estrangeiras (`FOREIGN KEY`) e armazena a credencial de acesso (`senha` com hash bcrypt) diretamente na entidade `fornecedores`.

### 4. Consultas em SQL Puro com `INNER JOIN` e Tipo `Decimal(10, 2)`
- **SQL Explícito:** Em atendimento direto ao Requisito 1 (*"As consultas devem usar SQL e relacionar as duas tabelas"*), o método `findPendingBySupplierId` no `PrismaTitlesRepository` utiliza `$queryRaw` executando um `SELECT` com `INNER JOIN` entre `titulos` e `especies`, filtrando `e.obrigdireito = 'D'` e `(t.vlrnominal - t.vlrpago) > 0` diretamente no motor do PostgreSQL.
- **Precisão Financeira:** Valores monetários foram modelados como `Decimal(10, 2)` no banco para evitar erros clássicos de arredondamento de ponto flutuante (`Float`).

### 5. Autenticação via Cookie `httpOnly` e Isolamento Estrito (Zero IDOR)
- Em vez de trafegar o token JWT exposto no `localStorage` (vulnerável a ataques XSS), o endpoint `POST /auth/login` assina o token e o armazena em um **Cookie `httpOnly`** (`sameSite: 'lax'`).
- Para garantir o isolamento dos dados (Requisito 4), a rota `GET /titles` **não aceita nenhum parâmetro de ID de fornecedor na URL ou no corpo da requisição**. O `supplierId` é extraído única e exclusivamente do payload criptografado do JWT validado pelo `JwtAuthGuard` (`@CurrentUser()`), tornando impossível um fornecedor consultar dados de outro (*Insecure Direct Object Reference - IDOR*).

### 6. Tratamento de Datas em UTC e Responsividade Adaptativa (Tabela vs. Cards)
- **Datas em UTC:** Datas financeiras (`dtaemissao` e `dtavencimento`) são salvas e formatadas em UTC (`timeZone: 'UTC'` no `Intl.DateTimeFormat`), evitando que o fuso horário local do navegador (`GMT-3`) recue a data em 1 dia na virada da meia-noite.
- **UX Mobile-First:** Tabelas financeiras com 6 colunas costumam quebrar ou exigir zoom desconfortável em smartphones. Por isso, a listagem de títulos adota uma **visualização dual**: em Desktop e Tablet (`>= 768px`) exibe uma tabela estruturada, e em telas Mobile (`< 768px`) transforma-se automaticamente em cartões individuais verticais de fácil leitura.

### 7. Paginação e Filtragem Server-Side com Agregação Global em SQL Puro
- **Preservação da Regra de Negócio:** O Requisito 5 exige que o fornecedor veja o *valor total em aberto com o Grupo Queiroz*. Uma paginação e filtragem ingênua que calcula o resumo apenas sobre os dados da página/filtro quebraria esse requisito. Por isso, os cards superiores refletem permanentemente os totais consolidados do fornecedor.
- **Consultas em Paralelo e Contadores Dinâmicos:** No `PrismaTitlesRepository`, a API executa duas queries SQL via `$queryRaw` em paralelo com `Promise.all`:
  1. **Query de Agregação:** Calcula diretamente no PostgreSQL (`SUM` e `COUNT`) o montante total em aberto, o total vencido, o total a vencer e as quantidades exatas por status (`totalCount`, `overdueCount`, `upcomingCount`). Isso alimenta os badges de contagem das abas de filtro (**Todos**, **Vencidos** e **A vencer**) sem requisições adicionais.
  2. **Query da Fatia Paginada e Filtrada:** Aplica a cláusula condicional de status via `Prisma.sql` (`AND t.dtavencimento < refDate` para vencidos ou `>= refDate` para a vencer) e retorna apenas a fatia solicitada usando `LIMIT` e `OFFSET` com ordenação determinística (`ORDER BY t.dtavencimento ASC, t.seqtitulo ASC`).
- **Controle Flexível e Feedback Visual:** O fornecedor pode alternar entre abas de status (`Todos`, `Vencidos`, `A vencer`), alterar o limite por página (`10`, `20` ou `50/Todos`) e contar com reset automático de página e mensagens contextuais para estados vazios.

### 8. Acessibilidade Completa (WCAG 2.1 Nível AA e WAI-ARIA)
- **Internacionalização Semântica:** Tag `<html lang="pt-BR">` para garantir que tecnologias assistivas (leitores de tela como NVDA, JAWS e VoiceOver) façam a pronúncia correta de valores monetários em Reais e datas no formato brasileiro.
- **Skip Link:** Inclusão de atalho invisível no topo da página (*"Pular para o conteúdo principal"*) que se torna visível ao pressionar `Tab`, permitindo que usuários que navegam exclusivamente via teclado acessem as pendências sem percorrer todo o cabeçalho repetidamente.
- **Navegação por Teclado e Foco Visível:** Todos os elementos interativos possuem anel de foco destacado (`focus-visible:ring-2 focus-visible:ring-primary`), remoção de `tabIndex={-1}` indevido no botão de exibição de senha com estado `aria-pressed`, além de atributos `aria-invalid` e `aria-describedby` conectados às mensagens de erro dinâmicas.
- **Semântica de Tabelas, Abas e Live Regions:** A tabela de títulos inclui `<caption className="sr-only">`, cabeçalhos de linha semânticos (`<th scope="row">`), cartões mobile com `aria-label` descritivo, grupo de abas acessível (`role="group"` com `aria-pressed`) e regiões `aria-live="polite"` que anunciam as mudanças de página e contagens para leitores de tela sem interromper a navegação.

### 9. Proteção contra Força Bruta e Abusos com Rate Limiting (@nestjs/throttler)
- **Mitigação de Força Bruta e DoS:** Para proteger os endpoints da API contra tentativas automatizadas de adivinhação de senhas (*credential stuffing* / *brute force*) e sobrecarga de requisições, foi integrado o módulo `@nestjs/throttler` com `ThrottlerGuard` global via `APP_GUARD`.
- **Experiência sem Bloqueios Inadvertidos:** O limitador atua com janelas de tempo em memória retornando `429 Too Many Requests` caso o limiar de segurança seja ultrapassado, sem prejudicar o uso legítimo do fornecedor ao paginar ou aplicar filtros sucessivos.

---

## 🔮 O Que Eu Faria a Mais se Tivesse Mais Tempo

Pensando nos próximos passos de evolução desta primeira versão para um ambiente de produção em larga escala no Grupo Queiroz:

### No Back-end (`api/`)
1. **Testes Automatizados (Unitários e E2E):**
   - Implementação de testes unitários (com Jest/Vitest e repositórios *in-memory*) para os casos de uso `AuthenticateUseCase` e `FetchPendingTitlesUseCase`, validando cenários de borda (títulos parciais, títulos do tipo `'O'`, filtros por status, cálculo de páginas e credenciais incorretas).
   - Testes End-to-End (E2E) com Supertest validando o fluxo completo de cookie `httpOnly`, bloqueio de rotas não autenticadas (`401`), parâmetros inválidos de paginação/filtro (`400`) e isolamento entre os fornecedores `4827` e `5001`.
2. **Filtros Adicionais na API:**
   - Adição de filtros opcionais por período de emissão/vencimento (intervalo de datas) e por espécie (`codespecie`), permitindo consultas analíticas detalhadas.
3. **Rotação de Refresh Tokens e Revogação Ativa de Sessões:**
   - Implementação de *Refresh Tokens* com rotação automática persistida no banco ou cache Redis para possibilitar revogação instantânea de sessões ativas sem depender unicamente da expiração do JWT.
4. **Documentação Interativa com Swagger (OpenAPI):**
   - Exposição dos contratos de entrada e saída em `/api/docs` com `@nestjs/swagger`.

### No Front-end (`web/`)
1. **Busca Rápida por Número do Título:**
   - Campo de busca textual com *debounce* para filtragem imediata pelo número do título (`seqtitulo`) ou descrição da espécie.
2. **Exportação de Relatório (CSV / PDF):**
   - Botão para o fornecedor baixar o extrato consolidado de todas as suas pendências em PDF ou planilha Excel/CSV para conciliação contábil interna.
3. **Gerenciamento de Estado Assíncrono com TanStack Query (React Query):**
   - Cache inteligente, revalidação automática ao focar na janela (*refetch on window focus*) e *prefetching* da próxima página de títulos durante a navegação.
4. **Fluxo de Troca de Senha no Primeiro Acesso:**
   - Como os fornecedores iniciam com uma senha padrão (`queiroz@2026`), um modal ou rota obrigatória de redefinição de senha no primeiro login elevaria a segurança operacional do portal.
