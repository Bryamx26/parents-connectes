import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { openapi } from './docs/openapi.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();
app.set('trust proxy', env.trustProxy); // derrière Cloudflare, Traefik et nginx en prod : IP réelle pour le rate limiting
app.disable('x-powered-by');
app.use(helmet());
// Le front passe par le même domaine (proxy Vite / nginx) : CORS fermé sauf origines listées.
app.use(cors({ origin: env.corsOrigins.length ? env.corsOrigins : false }));
app.use(express.json({ limit: '100kb' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.get('/api-docs.json', (req, res) => res.json(openapi));
app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
