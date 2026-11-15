import { z } from 'zod';
import * as activitySorts from '../repositories/activityRepository.js';
import * as publicationSorts from '../repositories/publicationRepository.js';
import * as userSorts from '../repositories/userRepository.js';

z.config(z.locales.fr());

const id = z.coerce.number().int().positive();
const text = (max) => z.string().trim().min(1).max(max);
const ageMonths = z.coerce.number().int().min(0).max(36);
const visibility = z.enum(['public', 'private']);
const sortKeys = (whitelist) => z.enum(Object.keys(whitelist)).default('created_at');

export const idParam = z.object({ id });

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
};
const sorting = (whitelist) => ({ sort: sortKeys(whitelist.SORTS), order: z.enum(['asc', 'desc']).default('desc') });
export const pageQuery = z.object(pagination);

// --- Auth et utilisateurs ---
const email = z.email().max(255).transform((e) => e.toLowerCase());
const password = z.string().min(8).max(128);

export const registerBody = z.object({ name: text(100), email, password });
export const loginBody = z.object({ email, password: z.string().min(1).max(128) });
export const googleBody = z.object({ idToken: z.string().min(1).max(4096) });

export const usersQuery = z.object({ ...pagination, ...sorting(userSorts) });
export const userUpdateBody = z.object({
  name: text(100).optional(),
  email: email.optional(),
  password: password.optional(),
  current_password: z.string().max(128).optional(),
});
export const roleBody = z.object({ role: z.enum(['user', 'admin']) });

// --- Activités ---
export const activitiesQuery = z.object({
  ...pagination,
  ...sorting(activitySorts),
  age_months: ageMonths.optional(),
  age_min: ageMonths.optional(),
  age_max: ageMonths.optional(),
  mine: z.stringbool().optional(),
});
export const activityBody = z.object({
  title: text(150),
  description: text(10000),
  age_min_months: ageMonths,
  age_max_months: ageMonths,
  duration_minutes: z.number().int().min(1).max(1440).nullable().optional(),
  material: z.string().trim().max(10000).nullable().optional(),
  visibility: visibility.default('public'),
}).refine((a) => a.age_min_months <= a.age_max_months, {
  message: "L'âge minimum doit être inférieur ou égal à l'âge maximum", path: ['age_max_months'],
});
// PATCH : champs facultatifs ; le service fusionne avec l'existant puis revalide avec activityBody.
export const activityPatch = z.object({
  title: text(150), description: text(10000), age_min_months: ageMonths, age_max_months: ageMonths,
  duration_minutes: z.number().int().min(1).max(1440).nullable(),
  material: z.string().trim().max(10000).nullable(), visibility,
}).partial();

// --- Étapes d'activité ---
export const stepBody = z.object({ title: text(150), content: text(10000) });
export const stepPatch = stepBody.partial();
export const stepOrderBody = z.object({ step_ids: z.array(id).min(1).max(50) });

// --- Publications ---
export const commentBody = z.object({ content: text(2000) });
export const publicationsQuery = z.object({
  ...pagination, ...sorting(publicationSorts), activity_id: id.optional(), mine: z.stringbool().optional(),
});
export const publicationBody = z.object({
  title: text(150), content: text(10000), visibility: visibility.default('public'), activity_id: id.nullable().optional(),
});
export const publicationPatch = z.object({
  title: text(150), content: text(10000), visibility, activity_id: id.nullable(),
}).partial();

// --- Images (multipart : les champs arrivent en chaînes) ---
export const imageFields = z.object({
  alt_text: z.string().trim().max(255).optional(),
  position: z.coerce.number().int().min(0).max(1000).optional(),
});
export const imagePatch = z.object({
  alt_text: z.string().trim().max(255), position: z.number().int().min(0).max(1000),
}).partial();

// --- Quiz ---
export const quizBody = z.object({
  title: text(150), description: z.string().trim().max(10000).nullable().optional(), is_published: z.boolean().default(false),
});
export const quizPatch = z.object({
  title: text(150), description: z.string().trim().max(10000), is_published: z.boolean(),
}).partial();
export const questionBody = z.object({ label: text(255), position: z.number().int().min(0).max(1000).optional() });
export const questionPatch = questionBody.partial();
export const choiceBody = z.object({ label: text(255), is_correct: z.boolean().default(false) });
export const choicePatch = z.object({ label: text(255), is_correct: z.boolean() }).partial();

// --- Résultats ---
export const answersBody = z.object({
  answers: z.array(z.object({ question_id: id, choice_id: id })).min(1).max(200),
});
export const resultsQuery = z.object({ ...pagination, user_id: id.optional(), quiz_id: id.optional() });
