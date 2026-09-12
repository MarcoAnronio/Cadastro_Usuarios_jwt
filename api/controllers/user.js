import { HttpError } from '../lib/errors.js';
import { userInput, idParam } from '../lib/validation.js';

export function userController(store) {
  return {
    async list(req, res) {
      if (Object.keys(req.query).some(key => key !== 'q')) throw new HttpError(400, 'Parâmetro de busca inválido.');
      if (req.query.q !== undefined && (typeof req.query.q !== 'string' || req.query.q.length > 100))
        throw new HttpError(400, 'A busca deve ter até 100 caracteres.');
      res.json(await store.listUsers((req.query.q || '').trim()));
    },
    async create(req, res) { res.status(201).json(await store.createUser(userInput(req.body))); },
    async update(req, res) {
      const id = idParam(req.params.id); const user = userInput(req.body);
      if (!await store.updateUser(id, user)) throw new HttpError(404, 'Cadastro não encontrado.');
      res.json({ id, ...user });
    },
    async remove(req, res) {
      if (!await store.deleteUser(idParam(req.params.id))) throw new HttpError(404, 'Cadastro não encontrado.');
      res.status(204).end();
    },
  };
}
