import multer from 'multer';
import { badRequest } from '../utils/httpError.js';

export const ALLOWED_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Un seul fichier, champ « image », gardé en mémoire le temps de l'envoyer à MinIO.
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 5 },
  fileFilter(req, file, cb) {
    if (ALLOWED_TYPES[file.mimetype]) cb(null, true);
    else cb(badRequest('Format accepté : JPEG, PNG ou WebP'));
  },
}).single('image');
