export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (msg = 'Requête invalide', details) => new HttpError(400, msg, details);
export const unauthorized = (msg = 'Authentification requise') => new HttpError(401, msg);
export const forbidden = (msg = 'Action non autorisée') => new HttpError(403, msg);
export const notFound = (msg = 'Ressource introuvable') => new HttpError(404, msg);
export const conflict = (msg) => new HttpError(409, msg);
