import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

try { loadEnvFile(fileURLToPath(new URL('.env', import.meta.url))); }
catch (error) { if (error.code !== 'ENOENT') throw error; }

export function readConfig(env = process.env) {
  const secret = env.JWT_SECRET || '';
  if (Buffer.byteLength(secret) < 32 || !secret.trim()) {
    throw new Error('Configure JWT_SECRET com pelo menos 32 bytes aleatórios.');
  }
  const port = Number(env.PORT || 8800);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválida.');
  return { secret, port, origin: env.FRONTEND_URL || 'http://localhost:3000',
    registrationEnabled: env.ALLOW_REGISTRATION === 'true' };
}
