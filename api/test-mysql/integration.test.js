import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import request from 'supertest';
import '../config.js';
import { createPool } from '../db.js';
import { createStore } from '../repositories/store.js';
import { createApp } from '../app.js';

test('integração MySQL: esquema idempotente, login e CRUD real sem alterar o banco original', { skip: process.env.RUN_MYSQL_TESTS !== '1' }, async () => {
  const database = `crud_test_${randomBytes(6).toString('hex')}`;
  assert.match(database, /^crud_test_[a-f0-9]{12}$/);
  let connection, pool, created = false;
  try {
    connection = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER, password: process.env.DB_PASSWORD || '' });
    await connection.query(`CREATE DATABASE ${database}`); created = true;
    pool = createPool({ ...process.env, DB_NAME: database });
    const schema = await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8');
    for (let i = 0; i < 2; i++) for (const sql of schema.split(';').map(s => s.trim()).filter(Boolean)) await pool.query(sql);
    const app = createApp({ store: createStore(pool), config: { secret: 'mysql-test-only-'.repeat(4), registrationEnabled: true, origin: 'http://localhost:3000' } });
    const account = { nome: 'Conta de teste', email: 'teste@example.test', senha: 'frase de senha para testar mysql' };
    await request(app).post('/auth/register').send(account).expect(201);
    const session = await request(app).post('/auth/login').send(account).expect(200);
    const token = `Bearer ${session.body.token}`;
    const user = { nome: 'Teste MySQL', email: 'usuario@example.test', fone: '11999999999', data_nascimento: '2000-02-29' };
    const response = await request(app).post('/users').set('Authorization', token).send(user).expect(201);
    const id = response.body.id;
    await request(app).put(`/users/${id}`).set('Authorization', token).send(user).expect(200);
    const list = await request(app).get('/users?q=MySQL').set('Authorization', token).expect(200);
    assert.equal(list.body[0].data_nascimento, '2000-02-29');
    const wildcard = await request(app).get('/users?q=%25').set('Authorization', token).expect(200);
    assert.equal(wildcard.body.length, 0);
    await request(app).delete(`/users/${id}`).set('Authorization', token).expect(204);
    await request(app).get('/users').set('Authorization', token).expect(200, []);
  } finally {
    if (pool) await pool.end();
    if (created) await connection.query(`DROP DATABASE ${database}`);
    if (connection) await connection.end();
  }
});
