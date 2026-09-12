import express from 'express';
import cors from 'cors';
import { createAuth } from './middleware/auth.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { errorHandler } from './lib/errors.js';
import { setupSwagger } from './swagger.js';

export function createApp({ store, config }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.origin, allowedHeaders: ['Authorization', 'Content-Type'] }));
  app.use(express.json({ limit: '16kb' }));
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'no-store');
    next();
  });
  const auth = createAuth(config.secret, store);
  app.get('/health', async (req, res) => {
    try { await store.ping(); res.json({ status: 'ok' }); }
    catch { res.status(503).json({ status: 'unavailable' }); }
  });
  setupSwagger(app);
  app.use('/auth', authRoutes(store, auth, config));
  app.use('/users', userRoutes(store, auth));
  app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
  app.use(errorHandler);
  return app;
}
