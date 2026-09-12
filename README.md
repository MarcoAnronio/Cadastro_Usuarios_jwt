# CRUD de usuários com autenticação JWT

Desenvolvi este projeto para praticar a integração entre uma interface em React, uma API em Node.js e um banco MySQL. A proposta é simples: permitir o cadastro e a manutenção de usuários em um painel com acesso por e-mail e senha.

## O que o projeto faz

- Cadastro de contas, login e logout com autenticação JWT.
- Cadastro, consulta, edição e exclusão de usuários.
- Busca por nome ou e-mail.
- Validação dos dados, confirmação de exclusão e tratamento de sessão expirada.
- Proteção de senhas com scrypt e limite de tentativas de autenticação.

As contas de acesso são separadas dos usuários cadastrados no painel. Todas as contas autenticadas administram a mesma base de dados; ainda não há perfis de permissão ou recuperação de senha.

## Tecnologias

**Frontend:** React, styled-components e Axios.  
**Backend:** Node.js, Express, JWT e MySQL.  
**Testes:** Node Test Runner, Supertest, Jest e React Testing Library.

O código está dividido em `api/` e `frontend/`. A documentação das rotas está disponível no Swagger, com a API em execução: [localhost:8800/api-docs](http://localhost:8800/api-docs).

## Como executar

Você precisa de **Node.js 22 ou superior**, **npm** e **MySQL 8**. Os comandos abaixo são para PowerShell, a partir da raiz do projeto.

### 1. Configurar a API

```powershell
cd api
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

No `.env`, preencha as configurações `DB_*` do MySQL e defina uma chave aleatória em `JWT_SECRET`. Para gerar uma chave, execute o comando abaixo e copie o resultado para essa variável:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Mantenha o `.env` apenas no ambiente local. Para criar sua primeira conta, configure `ALLOW_REGISTRATION=true`.

### 2. Preparar o banco e iniciar a API

No MySQL, crie o banco e use o mesmo nome em `DB_NAME`:

```sql
CREATE DATABASE IF NOT EXISTS crud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Na pasta `api`, execute:

```powershell
npm run db:init
npm run dev
```

O primeiro comando cria as tabelas ausentes sem apagar os registros existentes. A API usa a porta `8800` por padrão.

### 3. Iniciar a interface

Em outro terminal, a partir da raiz do projeto:

```powershell
cd frontend
npm install
npm start
```

Acesse [localhost:3000](http://localhost:3000), clique em **Criar uma conta** e use uma senha de pelo menos 15 caracteres. Após criar as contas necessárias, altere `ALLOW_REGISTRATION=false` e reinicie a API para bloquear novos cadastros de acesso.

Se mudar o endereço da API, configure `REACT_APP_API_URL` conforme o exemplo em `frontend/.env.example`.

## Testes

Na pasta `api`:

```powershell
npm test
```

Na pasta `frontend`:

```powershell
npm test -- --watchAll=false --runInBand
npm run build
```

Os testes cobrem autenticação, operações do CRUD, validações e os principais fluxos da interface. O comando de build gera a versão de produção do frontend.
