# Interface do CRUD de usuários

Aplicação React com login, cadastro de contas, busca e manutenção de usuários.
As instruções de instalação, banco de dados, segurança e testes estão no [README principal](../README.md).

- `src/components`: formulários de acesso e cadastro, tabela de usuários.
- `src/api.js`: cliente HTTP, envio do JWT e tratamento da sessão expirada.
- `src/auth.js`: armazenamento da sessão na aba do navegador.
- `src/styles`: estilos compartilhados.

O endereço da API pode ser configurado em `.env.local` conforme `.env.example`.
Variáveis do React são públicas; não inclua senhas nem chaves nelas.
