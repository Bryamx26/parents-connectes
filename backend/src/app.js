import express from 'express';
import postRoutes from './routes/postRoutes.js';

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/posts', postRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ressource introuvable' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

export default app;
