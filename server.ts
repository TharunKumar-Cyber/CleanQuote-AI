import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractCleaningRequest, isGeminiConfigured } from './server/gemini.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      geminiConfigured: isGeminiConfigured(),
    });
  });

  app.post('/api/extract-quote', async (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    if (!message) {
      res.status(400).json({
        code: 'INVALID_INPUT',
        error: 'Please paste a customer message before extracting job details.',
      });
      return;
    }

    if (message.length < 10) {
      res.status(400).json({
        code: 'INPUT_TOO_SHORT',
        error:
          'The customer message is too short. Please include a few details about the cleaning request.',
      });
      return;
    }

    if (message.length > 6000) {
      res.status(400).json({
        code: 'INPUT_TOO_LONG',
        error: 'Message exceeds the 6,000-character limit. Please trim extra text and try again.',
      });
      return;
    }

    if (!isGeminiConfigured()) {
      res.status(503).json({
        code: 'GEMINI_NOT_CONFIGURED',
        error:
          'GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets (or Replit Secrets) and restart the server.',
      });
      return;
    }

    try {
      const data = await extractCleaningRequest(message);
      res.json({ data });
    } catch (err) {
      console.error('Gemini extraction error:', err);
      const errMessage = err instanceof Error ? err.message : 'Unexpected extraction error.';

      if (errMessage === 'GEMINI_NOT_CONFIGURED') {
        res.status(503).json({
          code: 'GEMINI_NOT_CONFIGURED',
          error:
            'GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets (or Replit Secrets) and restart.',
        });
        return;
      }

      if (errMessage.includes('API_KEY_INVALID') || errMessage.includes('PERMISSION_DENIED')) {
        res.status(403).json({
          code: 'GEMINI_AUTH_ERROR',
          error:
            'The server GEMINI_API_KEY could not be authenticated. Verify your key in Settings > Secrets (or Replit Secrets).',
        });
        return;
      }

      res.status(502).json({
        code: 'AI_EXTRACTION_FAILED',
        error: 'Could not extract job details right now. Please try again in a moment.',
      });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const clientDist = path.resolve(__dirname, 'dist');
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CleanQuote AI server listening on http://0.0.0.0:${PORT}`);
    if (!isGeminiConfigured()) {
      console.warn(
        'Warning: GEMINI_API_KEY is not set. /api/extract-quote will return setup instructions.'
      );
    }
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
