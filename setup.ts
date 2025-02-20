import { Express } from 'express';
import express from 'express';
import { registerRoutes } from '../server/routes';

export function createTestApp(): Express {
  const app = express();
  app.use(express.json());
  registerRoutes(app);
  return app;
}