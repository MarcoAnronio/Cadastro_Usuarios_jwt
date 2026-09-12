import mysql from 'mysql2/promise';

export function createPool(env = process.env) {
  for (const name of ['DB_USER', 'DB_NAME']) {
    if (!env[name]) throw new Error(`Configure ${name}.`);
  }
  return mysql.createPool({ host: env.DB_HOST || 'localhost', port: Number(env.DB_PORT || 3306),
    user: env.DB_USER, password: env.DB_PASSWORD || '', database: env.DB_NAME,
    waitForConnections: true, connectionLimit: 10, queueLimit: 100, dateStrings: true });
}
