import app from './app.js';
import { env } from './config/env.js';
import { ensureBucket } from './services/storageService.js';
import { ensureAdmin } from './services/authService.js';

await ensureBucket().catch((err) => console.error('MinIO indisponible :', err.message));
await ensureAdmin();
app.listen(env.port, () => console.log(`API sur le port ${env.port} · docs sur /api-docs`));
