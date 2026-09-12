import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app.js';
import { memoryStore } from '../test-support/memory-store.js';
import { readConfig } from '../config.js';

const secret = 'test-only-secret-'.repeat(4);
const config = { secret, origin: 'http://localhost:3000', registrationEnabled: true };
const account = { nome: 'Operador de teste', email: 'operador@example.test', senha: 'frase de senha exclusiva para teste' };
const user = { nome: 'Pessoa de teste', email: 'pessoa@example.test', fone: '(11) 90000-0000', data_nascimento: '2000-02-29' };
function setup(overrides = {}) { const store = memoryStore(); return { store, app: createApp({ store, config: { ...config, ...overrides } }) }; }
async function session(app) { const res = await request(app).post('/auth/register').send(account).expect(201); return `Bearer ${res.body.token}`; }

test('configuração rejeita segredo ausente ou curto e porta inválida', () => {
  assert.throws(() => readConfig({}));
  assert.throws(() => readConfig({ JWT_SECRET: 'curto' }));
  assert.throws(() => readConfig({ JWT_SECRET: secret, PORT: 'abc' }));
  assert.equal(readConfig({ JWT_SECRET: secret }).registrationEnabled, false);
});
test('nenhuma operação do CRUD permite acesso sem autenticação', async () => {
  const { app } = setup();
  await request(app).get('/users').expect(401);
  await request(app).post('/users').send(user).expect(401);
  await request(app).put('/users/1').send(user).expect(401);
  await request(app).delete('/users/1').expect(401);
  await request(app).get('/get-token').expect(404);
  await request(app).post('/login').send({ email: 'qualquer@example.test' }).expect(404);
});
test('cadastro persiste hash salgado, normaliza e-mail e não expõe senha', async () => {
  const { app, store } = setup();
  const response = await request(app).post('/auth/register').send({ ...account, email: 'OPERADOR@example.test' }).expect(201);
  assert.equal(response.body.account.email, account.email);
  assert.equal(response.body.account.password_hash, undefined);
  const saved = await store.findAccount(account.email);
  assert.ok(saved.password_hash.startsWith('scrypt$'));
  assert.ok(!saved.password_hash.includes(account.senha));
  await request(app).get('/auth/me').set('Authorization', `Bearer ${response.body.token}`).expect(200);
  await request(app).post('/auth/register').send(account).expect(409);
});
test('login exige a senha correta e não informa se um e-mail existe', async () => {
  const { app } = setup(); await session(app);
  await request(app).post('/auth/login').send(account).expect(200);
  const wrong = await request(app).post('/auth/login').send({ ...account, senha: 'senha incorreta' }).expect(401);
  const unknown = await request(app).post('/auth/login').send({ ...account, email: 'outro@example.test' }).expect(401);
  assert.deepEqual(wrong.body, unknown.body);
});
test('novas contas podem ser desativadas sem fechar as rotas públicas de configuração', async () => {
  const { app } = setup({ registrationEnabled: false });
  await request(app).post('/auth/register').send(account).expect(403);
  const response = await request(app).get('/auth/config').expect(200);
  assert.equal(response.body.registrationEnabled, false);
});
test('tokens expirados, adulterados, sem Bearer e com algoritmo indevido são recusados', async () => {
  const { app } = setup(); const authorization = await session(app);
  const opts = { subject: '1', issuer: 'crud-users-api', audience: 'crud-users-web' };
  const expired = jwt.sign({}, secret, { ...opts, expiresIn: -1 });
  const wrongAlgorithm = jwt.sign({}, secret, { ...opts, algorithm: 'HS384' });
  for (const header of [`Bearer ${expired}`, `Bearer ${wrongAlgorithm}`, 'Basic abc', 'Bearer broken', authorization + 'broken'])
    await request(app).get('/users').set('Authorization', header).expect(401);
});
test('conta removida deixa de ser aceita mesmo com JWT dentro da validade', async () => {
  const { app, store } = setup(); const token = await session(app); store.accounts.clear();
  await request(app).get('/users').set('Authorization', token).expect(401);
});
test('CRUD completo cria, busca, atualiza sem alterar data e exclui o registro', async () => {
  const { app } = setup(); const token = await session(app);
  const created = await request(app).post('/users').set('Authorization', token).send(user).expect(201);
  const id = created.body.id;
  const list = await request(app).get('/users?q=Pessoa').set('Authorization', token).expect(200);
  assert.equal(list.body.length, 1);
  assert.equal(list.body[0].data_nascimento, user.data_nascimento);
  await request(app).put(`/users/${id}`).set('Authorization', token).send(user).expect(200);
  const edited = await request(app).put(`/users/${id}`).set('Authorization', token).send({ ...user, nome: 'Nome atualizado' }).expect(200);
  assert.equal(edited.body.nome, 'Nome atualizado');
  await request(app).delete(`/users/${id}`).set('Authorization', token).expect(204);
  await request(app).delete(`/users/${id}`).set('Authorization', token).expect(404);
});
test('validação bloqueia campos ausentes, datas impossíveis/futuras e IDs inválidos', async () => {
  const { app } = setup(); const token = await session(app);
  for (const body of [{}, { ...user, email: 'invalido' }, { ...user, fone: 'abc' }, { ...user, data_nascimento: '2023-02-29' }, { ...user, data_nascimento: '2999-01-01' }])
    await request(app).post('/users').set('Authorization', token).send(body).expect(400);
  await request(app).delete('/users/-1').set('Authorization', token).expect(400);
  await request(app).put('/users/999').set('Authorization', token).send(user).expect(404);
  await request(app).get('/users?q[]=x').set('Authorization', token).expect(400);
});
test('erros internos e JSON inválido têm status apropriado sem vazar SQL', async () => {
  const { app, store } = setup(); const token = await session(app);
  store.listUsers = async () => { throw new Error('SELECT password_hash FROM contas; senha-privada'); };
  const response = await request(app).get('/users').set('Authorization', token).expect(500);
  assert.ok(!response.text.includes('SELECT'));
  assert.ok(!response.text.includes('senha-privada'));
  await request(app).post('/auth/login').set('Content-Type', 'application/json').send('{bad').expect(400);
});
test('limite de tentativas também protege requisições de login inválidas', async () => {
  const { app } = setup();
  for (let i = 0; i < 20; i++) await request(app).post('/auth/login').send({}).expect(400);
  await request(app).post('/auth/login').send({}).expect(429);
});
test('OpenAPI usa Bearer, documenta as rotas e health informa falha no banco', async () => {
  const { app, store } = setup();
  const response = await request(app).get('/openapi.json').expect(200);
  assert.equal(response.body.components.securitySchemes.bearerAuth.scheme, 'bearer');
  assert.ok(response.body.paths['/users'].post.responses['201']);
  await request(app).get('/health').expect(200);
  store.ping = async () => { throw new Error('db'); };
  await request(app).get('/health').expect(503);
});
