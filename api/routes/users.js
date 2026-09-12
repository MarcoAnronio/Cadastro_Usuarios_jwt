import { Router } from 'express';
import { userController } from '../controllers/user.js';

export function userRoutes(store, auth) {
  const router = Router(); const users = userController(store);
  router.use(auth.verifyToken);
  router.get('/', users.list);
  router.post('/', users.create);
  router.put('/:id', users.update);
  router.delete('/:id', users.remove);
  return router;
}
