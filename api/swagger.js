import swaggerUi from 'swagger-ui-express';

const json = schema => ({ 'application/json': { schema } });
const ref = name => ({ $ref: `#/components/schemas/${name}` });
const error = description => ({ description, content: json(ref('Error')) });
const input = name => ({ required: true, content: json(ref(name)) });
const security = [{ bearerAuth: [] }];
const errors = { 400: error('Dados inválidos'), 401: error('Sessão ausente, inválida ou expirada'), 500: error('Erro interno') };
const id = [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }];
export const specification = {
  openapi: '3.0.3', info: { title: 'CRUD de usuários com JWT', version: '1.1.0',
    description: 'Contas de acesso autenticam operadores; todos os operadores compartilham os cadastros de usuários.' },
  servers: [{ url: '/' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Error: { type: 'object', properties: { error: { type: 'string' } } },
      UserInput: { type: 'object', required: ['nome', 'email', 'fone', 'data_nascimento'], properties: {
        nome: { type: 'string', minLength: 2, maxLength: 255 }, email: { type: 'string', format: 'email', maxLength: 254 },
        fone: { type: 'string', maxLength: 50 }, data_nascimento: { type: 'string', format: 'date' } } },
      User: { allOf: [ref('UserInput'), { type: 'object', properties: { id: { type: 'integer' } } }] },
      Login: { type: 'object', required: ['email', 'senha'], properties: {
        email: { type: 'string', format: 'email' }, senha: { type: 'string', format: 'password', maxLength: 128 } } },
      Register: { type: 'object', required: ['nome', 'email', 'senha'], properties: {
        nome: { type: 'string', minLength: 2, maxLength: 255 }, email: { type: 'string', format: 'email' },
        senha: { type: 'string', format: 'password', minLength: 15, maxLength: 128 } } },
      Account: { type: 'object', properties: { id: { type: 'integer' }, nome: { type: 'string' }, email: { type: 'string' } } },
      Session: { type: 'object', properties: { token: { type: 'string' }, expiresIn: { type: 'integer' }, account: ref('Account') } },
    },
  },
  paths: {
    '/health': { get: { summary: 'Verifica a conexão com o banco', responses: { 200: { description: 'Disponível' }, 503: { description: 'Banco indisponível' } } } },
    '/auth/config': { get: { summary: 'Informa se novas contas podem ser cadastradas', responses: { 200: { description: 'Configuração pública', content: json({ type: 'object', properties: { registrationEnabled: { type: 'boolean' } } }) } } } },
    '/auth/register': { post: { summary: 'Cria uma conta de acesso', requestBody: input('Register'), responses: {
      ...errors, 201: { description: 'Conta criada e sessão iniciada', content: json(ref('Session')) },
      403: error('Cadastro desativado'), 409: error('E-mail já cadastrado'), 429: error('Limite de tentativas atingido') } } },
    '/auth/login': { post: { summary: 'Autentica e emite JWT válido por uma hora', requestBody: input('Login'), responses: {
      ...errors, 200: { description: 'Sessão iniciada', content: json(ref('Session')) }, 429: error('Limite de tentativas atingido') } } },
    '/auth/me': { get: { summary: 'Consulta a conta autenticada', security, responses: { ...errors, 200: { description: 'Conta atual', content: json(ref('Account')) } } } },
    '/users': {
      get: { summary: 'Lista e busca usuários por nome ou e-mail', security,
        parameters: [{ name: 'q', in: 'query', schema: { type: 'string', maxLength: 100 } }],
        responses: { ...errors, 200: { description: 'Usuários em ordem alfabética', content: json({ type: 'array', items: ref('User') }) } } },
      post: { summary: 'Cadastra um usuário', security, requestBody: input('UserInput'), responses: { ...errors, 201: { description: 'Usuário criado', content: json(ref('User')) } } },
    },
    '/users/{id}': {
      put: { summary: 'Atualiza um usuário', security, parameters: id, requestBody: input('UserInput'), responses: { ...errors, 200: { description: 'Usuário atualizado', content: json(ref('User')) }, 404: error('Cadastro não encontrado') } },
      delete: { summary: 'Exclui um usuário', security, parameters: id, responses: { ...errors, 204: { description: 'Excluído; resposta sem corpo' }, 404: error('Cadastro não encontrado') } },
    },
  },
};
export function setupSwagger(app) {
  app.get('/openapi.json', (req, res) => res.json(specification));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specification, { swaggerOptions: { persistAuthorization: false } }));
}
