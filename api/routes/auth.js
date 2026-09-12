import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { credentials } from '../lib/validation.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { HttpError } from '../lib/errors.js';

export function authRoutes(store, auth, config) {
  const router = Router();
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' } });
  router.get('/config', (req, res) => res.json({ registrationEnabled: config.registrationEnabled }));
  router.post('/register', limiter, async (req, res) => {
    if (!config.registrationEnabled) throw new HttpError(403, 'O cadastro de novas contas está desativado.');
    const input = credentials(req.body, true);
    if (await store.findAccount(input.email)) throw new HttpError(409, 'Este e-mail já está cadastrado.');
    const account = await store.createAccount({ nome: input.nome, email: input.email, password_hash: await hashPassword(input.senha) });
    res.status(201).json({ token: auth.generateToken(account), account, expiresIn: 3600 });
  });
  router.post('/login', limiter, async (req, res) => {
    const input = credentials(req.body);
    const account = await store.findAccount(input.email);
    // Mesmo custo de hash para e-mails desconhecidos, sem indicar qual campo falhou.
    const valid = account ? await verifyPassword(input.senha, account.password_hash) : (await hashPassword(input.senha), false);
    if (!valid) throw new HttpError(401, 'E-mail ou senha incorretos.');
    res.json({ token: auth.generateToken(account), account: { id: account.id, nome: account.nome, email: account.email }, expiresIn: 3600 });
  });
  router.get('/me', auth.verifyToken, (req, res) => res.json(req.account));
  return router;
}
