import { HttpError } from './errors.js';

function text(value, label, max, min = 1) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max)
    throw new HttpError(400, `${label} deve ter entre ${min} e ${max} caracteres.`);
  return value.trim();
}
export function email(value) {
  const result = text(value, 'E-mail', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new HttpError(400, 'Informe um e-mail válido.');
  return result;
}
export function credentials(body = {}, registering = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Informe um objeto JSON válido.');
  const result = { email: email(body.email), senha: body.senha };
  const min = registering ? 15 : 1;
  if (typeof result.senha !== 'string' || result.senha.length < min || result.senha.length > 128)
    throw new HttpError(400, `A senha deve ter entre ${min} e 128 caracteres.`);
  if (registering) result.nome = text(body.nome, 'Nome', 255, 2);
  return result;
}
export function userInput(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Informe um objeto JSON válido.');
  const nome = text(body.nome, 'Nome', 255, 2);
  const fone = text(body.fone, 'Telefone', 50);
  if (!/^[+()\d\s.-]+$/.test(fone) || fone.replace(/\D/g, '').length < 8)
    throw new HttpError(400, 'Informe um telefone válido.');
  const date = body.data_nascimento;
  const parsed = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
  if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date
      || date < '1900-01-01' || date > new Date().toISOString().slice(0, 10))
    throw new HttpError(400, 'Informe uma data de nascimento válida, sem data futura.');
  return { nome, email: email(body.email), fone, data_nascimento: date };
}
export function idParam(value) {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new HttpError(400, 'ID inválido.');
  return Number(value);
}
