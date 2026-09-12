import jwt from 'jsonwebtoken';
import { HttpError } from '../lib/errors.js';

export function createAuth(secret, store) {
  const options = { algorithm: 'HS256', expiresIn: '1h', issuer: 'crud-users-api', audience: 'crud-users-web' };
  return {
    generateToken(account) { return jwt.sign({}, secret, { ...options, subject: String(account.id) }); },
    async verifyToken(req, res, next) {
      const match = /^Bearer ([^\s]+)$/i.exec(req.get('Authorization') || '');
      if (!match) throw new HttpError(401, 'Entre na sua conta para continuar.');
      let payload;
      try { payload = jwt.verify(match[1], secret, { algorithms: ['HS256'], issuer: options.issuer, audience: options.audience }); }
      catch { throw new HttpError(401, 'Sessão inválida ou expirada. Entre novamente.'); }
      if (!/^[1-9]\d*$/.test(payload.sub || '')) throw new HttpError(401, 'Sessão inválida.');
      const account = await store.getAccount(Number(payload.sub));
      if (!account) throw new HttpError(401, 'Sessão inválida.');
      req.account = account;
      next();
    },
  };
}
