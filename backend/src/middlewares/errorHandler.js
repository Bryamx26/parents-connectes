import { ZodError } from 'zod';
import multer from 'multer';
import { HttpError } from '../utils/httpError.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Ressource introuvable' });
}

// Aucune stack trace ni message SQL ne part vers le client : seulement un message prévu.
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details && { details: err.details }) });
  }
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return res.status(400).json({ error: 'Données invalides', details });
  }
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ error: status === 413 ? 'Image trop lourde (5 Mo maximum)' : 'Envoi de fichier invalide' });
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON invalide' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Requête trop volumineuse' });
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Cette valeur est déjà utilisée' });
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ error: 'Suppression impossible : des éléments dépendent de cette ressource' });
  }
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
}
