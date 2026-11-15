import { randomUUID } from 'node:crypto';
import * as images from '../repositories/imageRepository.js';
import * as storage from './storageService.js';
import { ALLOWED_TYPES } from '../middlewares/upload.js';
import { badRequest, conflict, notFound } from '../utils/httpError.js';

export const MAX_IMAGES = 10; // par activité, publication ou étape
const LINKS = { activity: 'activityId', publication: 'publicationId', step: 'stepId' };
const FOLDERS = { activity: 'activities', publication: 'publications', step: 'steps' };

// Le type annoncé par le client ne suffit pas : on lit la signature du fichier.
export function sniffImageType(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

// object_key reste interne : le client reçoit une URL de l'API qui revérifie les droits à chaque lecture.
export function format({ id, activity_id, publication_id, step_id, alt_text, position, created_at }) {
  return { id, activity_id, publication_id, step_id, alt_text, position, created_at, url: `/api/images/${id}/file` };
}

const canRead = (img, viewer) =>
  img.visibility === 'public' || viewer?.role === 'admin' || img.owner_id === viewer?.id;

export async function upload(parent, file, fields) {
  if (!file) throw badRequest('Fichier « image » manquant');
  const type = sniffImageType(file.buffer);
  if (!type) throw badRequest('Format accepté : JPEG, PNG ou WebP');
  const link = { [LINKS[parent.type]]: parent.id };
  const { count, next } = await images.stats(link);
  if (count >= MAX_IMAGES) throw conflict(`${MAX_IMAGES} photos maximum : retirez-en une avant d'en ajouter`);
  const objectKey = `${FOLDERS[parent.type]}/${parent.id}/${randomUUID()}.${ALLOWED_TYPES[type]}`;
  await storage.put(objectKey, file.buffer, type);
  try {
    const position = fields.position ?? next;
    const id = await images.create({ ...link, objectKey, altText: fields.alt_text ?? null, position });
    return format(await images.findWithParent(id));
  } catch (err) {
    await storage.removeMany([objectKey]);
    throw err;
  }
}

export async function getVisible(id, viewer) {
  const img = await images.findWithParent(id);
  if (!img || !canRead(img, viewer)) throw notFound();
  return img;
}

export async function file(id, viewer) {
  const img = await getVisible(id, viewer);
  return storage.get(img.object_key);
}

export async function update(id, patch) {
  await images.update(id, { altText: patch.alt_text, position: patch.position });
  return format(await images.findWithParent(id));
}

export async function remove(id) {
  const img = await images.findWithParent(id);
  await images.remove(id);
  await storage.removeMany([img.object_key]);
}
