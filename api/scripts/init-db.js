import '../config.js';
import { readFile } from 'node:fs/promises';
import { createPool } from '../db.js';

let pool;
try {
  pool = createPool();
  const sql = await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8');
  for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) await pool.query(statement);
  console.log('Tabelas verificadas/criadas; registros existentes preservados.');
} catch {
  console.error('Não foi possível preparar as tabelas. Confira o banco, as permissões e o .env.');
  process.exitCode = 1;
} finally { if (pool) await pool.end(); }
