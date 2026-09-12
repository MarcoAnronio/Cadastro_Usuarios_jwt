import { readConfig } from './config.js';
import { createPool } from './db.js';
import { createStore } from './repositories/store.js';
import { createApp } from './app.js';

let pool;
try {
  const config = readConfig();
  pool = createPool();
  await pool.query('SELECT 1 FROM usuarios LIMIT 1');
  await pool.query('SELECT 1 FROM contas LIMIT 1');
  const server = createApp({ store: createStore(pool), config }).listen(config.port, () => {
    console.log(`API: http://localhost:${config.port} | Documentação: /api-docs`);
  });
  server.on('error', async () => { console.error('Não foi possível abrir a porta da API.'); await pool.end(); process.exitCode = 1; });
  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    server.close(async () => { await pool.end(); process.exit(0); });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
} catch (error) {
  console.error('Falha ao iniciar. Confira o .env, o MySQL e execute npm run db:init.');
  if (pool) await pool.end();
  process.exitCode = 1;
}
