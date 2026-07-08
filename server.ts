import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import auditRouter from './backend/src/routes/audit';
import auditSingularRouter from './backend/src/routes/auditSingular';
import recommendationsRouter from './backend/src/routes/recommendations';
import { errorHandler } from './backend/src/middleware/errorHandler';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/audits', auditRouter);
  app.use('/api/audit', auditSingularRouter);
  app.use('/api/recommendations', recommendationsRouter);

  // Global Error Handler
  app.use(errorHandler);

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Dev Server] Mounting Vite dev middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Prod Server] Serving production static files from dist/');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Fallback all other requests to index.html for SPA router
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SEO Audit AI Pro] Full-stack container online at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Startup Error] Failed to boot express container:', err);
});
