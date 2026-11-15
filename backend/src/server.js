import app from './app.js';
import { env } from './config/env.js';
import { ensureBucket } from './services/storageService.js';

await ensureBucket().catch((err) => console.error('MinIO indisponible :', err.message));
app.listen(env.port, () => console.log(`API sur le port ${env.port} · docs sur /api-docs`));
