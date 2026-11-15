// Spécification OpenAPI 3 servie sur /api-docs (et en JSON sur /api-docs.json).
// À tenir à jour avec src/routes/index.js et src/validators/schemas.js.

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema) => ({ content: { 'application/json': { schema } } });
const arrayOf = (name) => ({ type: 'array', items: ref(name) });

const ERRORS = {
  400: 'Données invalides (détail par champ dans `details`)',
  401: 'Non connecté, jeton invalide ou expiré',
  403: 'Rôle insuffisant ou ressource d’un autre utilisateur',
  404: 'Introuvable, ou contenu privé d’un autre utilisateur',
  409: 'Conflit (valeur déjà utilisée, ressource référencée)',
  413: 'Fichier ou requête trop volumineux',
  429: 'Trop de tentatives (limite sur les routes d’authentification)',
  503: 'Service non configuré',
};

const ROLES = {
  visitor: 'Visiteur, utilisateur ou admin (jeton facultatif)',
  user: 'Utilisateur connecté ou admin',
  owner: 'Propriétaire de la ressource (vérifié en base) ou admin',
  admin: 'Admin',
};

const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } };
const q = (name, schema, description) => ({ name, in: 'query', required: false, schema, description });
const PAGE = [q('page', { type: 'integer', minimum: 1, default: 1 }), q('limit', { type: 'integer', minimum: 1, maximum: 50, default: 20 })];
const ORDER = q('order', { type: 'string', enum: ['asc', 'desc'], default: 'desc' });

// op({ tag, summary, role, params, body, ok, okStatus, errors })
function op({ tag, summary, role, params = [], body, ok, okStatus = 200, errors = [], description = '' }) {
  const responses = {
    [okStatus]: okStatus === 204 ? { description: 'Supprimé' } : { description: 'Succès', ...(ok && json(ok)) },
  };
  for (const code of [400, ...errors]) responses[code] = { description: ERRORS[code], ...json(ref('Error')) };
  return {
    tags: [tag],
    summary,
    description: `**Rôle requis :** ${ROLES[role]}${description ? `\n\n${description}` : ''}`,
    'x-role': role,
    ...(role !== 'visitor' && { security: [{ bearerAuth: [] }] }),
    parameters: params,
    ...(body && { requestBody: { required: true, ...json(body) } }),
    responses,
  };
}

const str = (maxLength, extra = {}) => ({ type: 'string', maxLength, ...extra });
const age = { type: 'integer', minimum: 0, maximum: 36 };
const visibility = { type: 'string', enum: ['public', 'private'] };

const schemas = {
  Error: {
    type: 'object',
    properties: {
      error: { type: 'string' },
      details: { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } } },
    },
  },
  User: {
    type: 'object',
    description: 'Le mot de passe et google_id ne sont jamais renvoyés.',
    properties: { id: { type: 'integer' }, name: { type: 'string' }, email: { type: 'string' }, role: { type: 'string', enum: ['user', 'admin'] }, created_at: { type: 'string', format: 'date-time' } },
  },
  Session: { type: 'object', properties: { token: { type: 'string', description: 'JWT (HS256, 1 h)' }, user: ref('User') } },
  Image: {
    type: 'object',
    description: 'Rattachée à exactement un parent : activité, publication ou étape. 10 photos maximum par parent.',
    properties: {
      id: { type: 'integer' }, activity_id: { type: 'integer', nullable: true }, publication_id: { type: 'integer', nullable: true },
      step_id: { type: 'integer', nullable: true },
      alt_text: { type: 'string', nullable: true }, position: { type: 'integer' }, created_at: { type: 'string', format: 'date-time' },
      url: { type: 'string', example: '/api/images/1/file', description: 'Fichier servi par l’API après contrôle des droits' },
    },
  },
  ActivityInput: {
    type: 'object',
    required: ['title', 'description', 'age_min_months', 'age_max_months'],
    properties: {
      title: str(150, { minLength: 1 }), description: str(10000, { minLength: 1 }),
      age_min_months: age, age_max_months: { ...age, description: '≥ age_min_months' },
      duration_minutes: { type: 'integer', minimum: 1, maximum: 1440, nullable: true },
      material: str(10000, { nullable: true }), visibility: { ...visibility, default: 'public' },
    },
  },
  Activity: {
    allOf: [ref('ActivityInput'), {
      type: 'object',
      properties: {
        id: { type: 'integer' }, user_id: { type: 'integer' }, author_name: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' }, updated_at: { type: 'string', format: 'date-time' },
        images: { ...arrayOf('Image'), description: 'Uniquement dans le détail' },
        cover_image_id: { type: 'integer', nullable: true, description: 'Première image (fichier : /api/images/{id}/file)' },
        cover_alt: { type: 'string', nullable: true },
        steps: { ...arrayOf('Step'), description: 'Uniquement dans le détail, dans l’ordre des étapes' },
      },
    }],
  },
  StepInput: {
    type: 'object', required: ['title', 'content'],
    properties: { title: str(150, { minLength: 1 }), content: str(10000, { minLength: 1 }) },
  },
  Step: {
    allOf: [ref('StepInput'), {
      type: 'object',
      properties: {
        id: { type: 'integer' }, activity_id: { type: 'integer' }, position: { type: 'integer', description: '1 = première étape' },
        created_at: { type: 'string', format: 'date-time' }, images: arrayOf('Image'),
      },
    }],
  },
  PublicationInput: {
    type: 'object',
    required: ['title', 'content'],
    properties: {
      title: str(150, { minLength: 1 }), content: str(10000, { minLength: 1 }), visibility: { ...visibility, default: 'public' },
      activity_id: { type: 'integer', nullable: true, description: 'Activité visible par l’auteur (publique ou à lui)' },
    },
  },
  Publication: {
    allOf: [ref('PublicationInput'), {
      type: 'object',
      properties: {
        id: { type: 'integer' }, user_id: { type: 'integer' }, author_name: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' }, updated_at: { type: 'string', format: 'date-time' },
        images: { ...arrayOf('Image'), description: 'Uniquement dans le détail' },
        cover_image_id: { type: 'integer', nullable: true, description: 'Première image (fichier : /api/images/{id}/file)' },
        cover_alt: { type: 'string', nullable: true },
        like_count: { type: 'integer' }, comment_count: { type: 'integer' },
        liked: { type: 'integer', enum: [0, 1], description: '1 si le lecteur connecté a aimé la publication' },
        activity: {
          type: 'object', nullable: true, properties: { id: { type: 'integer' }, title: { type: 'string' } },
          description: 'Uniquement dans le détail ; null si aucune activité liée ou si le lecteur ne peut pas la voir',
        },
      },
    }],
  },
  Comment: {
    type: 'object',
    properties: {
      id: { type: 'integer' }, user_id: { type: 'integer' }, author_name: { type: 'string' }, publication_id: { type: 'integer' },
      content: { type: 'string' }, created_at: { type: 'string', format: 'date-time' },
    },
  },
  QuizInput: {
    type: 'object', required: ['title'],
    properties: { title: str(150, { minLength: 1 }), description: str(10000, { nullable: true }), is_published: { type: 'boolean', default: false } },
  },
  Quiz: {
    allOf: [ref('QuizInput'), { type: 'object', properties: { id: { type: 'integer' }, created_by: { type: 'integer' }, created_at: { type: 'string', format: 'date-time' } } }],
  },
  Choice: {
    type: 'object',
    properties: { id: { type: 'integer' }, question_id: { type: 'integer' }, label: { type: 'string' }, is_correct: { type: 'boolean', description: 'Envoyé à l’admin uniquement' } },
  },
  Question: {
    type: 'object',
    properties: { id: { type: 'integer' }, quiz_id: { type: 'integer' }, label: { type: 'string' }, position: { type: 'integer' }, choices: arrayOf('Choice') },
  },
  QuizDetail: { allOf: [ref('Quiz'), { type: 'object', properties: { questions: arrayOf('Question') } }] },
  QuizResult: {
    type: 'object',
    properties: {
      id: { type: 'integer' }, user_id: { type: 'integer' }, quiz_id: { type: 'integer' }, quiz_title: { type: 'string' },
      score: { type: 'integer' }, total: { type: 'integer', description: 'Seulement à la création' }, completed_at: { type: 'string', format: 'date-time' },
    },
  },
};

const imageUpload = {
  required: true,
  content: {
    'multipart/form-data': {
      schema: {
        type: 'object', required: ['image'],
        properties: {
          image: { type: 'string', format: 'binary', description: 'JPEG, PNG ou WebP, 5 Mo max (signature du fichier vérifiée)' },
          alt_text: str(255), position: { type: 'integer', minimum: 0, maximum: 1000 },
        },
      },
    },
  },
};

function contentPaths(base, tag, name, extraQuery) {
  const sorts = name === 'Activity' ? ['created_at', 'title', 'age_min_months'] : ['created_at', 'title'];
  const label = name === 'Activity' ? 'activité' : 'publication';
  return {
    [`/${base}`]: {
      get: op({
        tag, role: 'visitor', ok: arrayOf(name), summary: `Lister les ${label}s visibles`,
        description: 'Visiteur : contenus publics. Utilisateur : publics + les siens. Admin : tout.',
        params: [...PAGE, q('sort', { type: 'string', enum: sorts, default: 'created_at' }, 'Liste blanche de colonnes'), ORDER,
          q('mine', { type: 'boolean' }, 'Seulement les miens (connexion requise)'), ...extraQuery],
        errors: [401],
      }),
      post: op({ tag, role: 'user', okStatus: 201, ok: ref(name), body: ref(`${name}Input`), summary: `Créer une ${label}`, errors: [401] }),
    },
    [`/${base}/{id}`]: {
      get: op({ tag, role: 'visitor', params: [idParam], ok: ref(name), summary: `Détail d’une ${label} (avec ses images)`, errors: [401, 404] }),
      patch: op({
        tag, role: 'owner', params: [idParam], ok: ref(name), body: { ...ref(`${name}Input`), description: 'Tous les champs sont facultatifs' },
        summary: `Modifier une ${label}`, errors: [401, 403, 404],
      }),
      delete: op({ tag, role: 'owner', params: [idParam], okStatus: 204, summary: `Supprimer une ${label} (et ses images)`, errors: [401, 403, 404] }),
    },
    [`/${base}/{id}/images`]: {
      post: { ...op({ tag: 'Images', role: 'owner', params: [idParam], okStatus: 201, ok: ref('Image'), summary: `Ajouter une image à une ${label}`, description: '10 photos maximum (409 au-delà).', errors: [401, 403, 404, 409, 413] }), requestBody: imageUpload },
    },
  };
}

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'API Parents Connectés',
    version: '1.0.0',
    description: 'Activités, publications et quiz pour les parents d’enfants de 0 à 3 ans. '
      + 'Authentification : `Authorization: Bearer <jwt>` (obtenu via /auth/login, /auth/register ou /auth/google). '
      + 'Le rôle est relu en base à chaque requête. Un contenu privé d’un autre utilisateur répond 404.',
  },
  servers: [{ url: '/api' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }, schemas },
  paths: {
    '/health': { get: op({ tag: 'Système', role: 'visitor', summary: 'État de l’API', ok: { type: 'object', properties: { ok: { type: 'boolean' } } } }) },

    '/auth/register': {
      post: op({
        tag: 'Auth', role: 'visitor', okStatus: 201, ok: ref('Session'), summary: 'Inscription (rôle user)', errors: [409, 429],
        body: { type: 'object', required: ['name', 'email', 'password'], properties: { name: str(100), email: str(255, { format: 'email' }), password: { type: 'string', minLength: 8, maxLength: 128 } } },
        description: 'Un champ `role` éventuel est ignoré.',
      }),
    },
    '/auth/login': {
      post: op({
        tag: 'Auth', role: 'visitor', ok: ref('Session'), summary: 'Connexion par e-mail et mot de passe', errors: [401, 429],
        body: { type: 'object', required: ['email', 'password'], properties: { email: str(255, { format: 'email' }), password: str(128) } },
      }),
    },
    '/auth/google': {
      post: op({
        tag: 'Auth', role: 'visitor', ok: ref('Session'), summary: 'Connexion Google (ID token)', errors: [401, 409, 429, 503],
        body: { type: 'object', required: ['idToken'], properties: { idToken: { type: 'string', description: 'ID token Google Identity Services' } } },
        description: 'Crée le compte au besoin, ou le lie à un compte existant si Google certifie l’e-mail.',
      }),
    },
    '/auth/me': { get: op({ tag: 'Auth', role: 'user', ok: ref('User'), summary: 'Mon profil', errors: [401] }) },

    '/users': {
      get: op({
        tag: 'Utilisateurs', role: 'admin', ok: arrayOf('User'), summary: 'Lister les utilisateurs', errors: [401, 403],
        params: [...PAGE, q('sort', { type: 'string', enum: ['created_at', 'name', 'email'], default: 'created_at' }), ORDER],
      }),
    },
    '/users/{id}': {
      get: op({ tag: 'Utilisateurs', role: 'owner', params: [idParam], ok: ref('User'), summary: 'Voir un compte', errors: [401, 403, 404] }),
      patch: op({
        tag: 'Utilisateurs', role: 'owner', params: [idParam], ok: ref('User'), summary: 'Modifier un compte', errors: [401, 403, 404, 409],
        body: { type: 'object', properties: { name: str(100), email: str(255, { format: 'email' }), password: { type: 'string', minLength: 8, maxLength: 128 }, current_password: { type: 'string', description: 'Obligatoire pour changer son propre mot de passe' } } },
      }),
      delete: op({
        tag: 'Utilisateurs', role: 'owner', params: [idParam], okStatus: 204, summary: 'Supprimer un compte et tous ses contenus', errors: [401, 403, 404, 409],
        description: '409 si le compte est un admin auteur de quiz.',
      }),
    },
    '/users/{id}/role': {
      patch: op({
        tag: 'Utilisateurs', role: 'admin', params: [idParam], ok: ref('User'), summary: 'Changer le rôle', errors: [401, 403, 404],
        body: { type: 'object', required: ['role'], properties: { role: { type: 'string', enum: ['user', 'admin'] } } },
      }),
    },

    ...contentPaths('activities', 'Activités', 'Activity', [
      q('age_months', age, 'Âge de l’enfant en mois : age_min ≤ x ≤ age_max'),
      q('age_min', age, 'Tranche recherchée (chevauchement)'),
      q('age_max', age, 'Tranche recherchée (chevauchement)'),
    ]),
    ...contentPaths('publications', 'Publications', 'Publication', [q('activity_id', { type: 'integer', minimum: 1 })]),

    '/activities/{id}/steps': {
      post: op({
        tag: 'Étapes', role: 'owner', params: [idParam], okStatus: 201, ok: ref('Step'), body: ref('StepInput'),
        summary: 'Ajouter une étape (à la fin)', description: 'Propriétaire de l’activité ou admin. 50 étapes maximum.', errors: [401, 403, 404],
      }),
    },
    '/activities/{id}/steps/order': {
      put: op({
        tag: 'Étapes', role: 'owner', params: [idParam], ok: arrayOf('Step'), summary: 'Réordonner les étapes',
        description: '`step_ids` contient chaque étape de l’activité une seule fois, dans le nouvel ordre (transaction).',
        body: { type: 'object', required: ['step_ids'], properties: { step_ids: { type: 'array', items: { type: 'integer' }, maxItems: 50 } } },
        errors: [401, 403, 404],
      }),
    },
    '/steps/{id}': {
      patch: op({
        tag: 'Étapes', role: 'owner', params: [idParam], ok: ref('Step'), summary: 'Modifier une étape',
        body: { ...ref('StepInput'), description: 'Tous les champs sont facultatifs' }, errors: [401, 403, 404],
      }),
      delete: op({ tag: 'Étapes', role: 'owner', params: [idParam], okStatus: 204, summary: 'Supprimer une étape et ses photos', errors: [401, 403, 404] }),
    },
    '/steps/{id}/images': {
      post: { ...op({ tag: 'Étapes', role: 'owner', params: [idParam], okStatus: 201, ok: ref('Image'), summary: 'Ajouter une photo à une étape', errors: [401, 403, 404, 409, 413] }), requestBody: imageUpload },
    },

    '/publications/{id}/like': {
      put: op({ tag: 'Réactions', role: 'user', params: [idParam], ok: { type: 'object', properties: { liked: { type: 'boolean' }, like_count: { type: 'integer' } } }, summary: 'Aimer une publication', description: 'Idempotent : un seul J’aime par utilisateur.', errors: [401, 404] }),
      delete: op({ tag: 'Réactions', role: 'user', params: [idParam], ok: { type: 'object', properties: { liked: { type: 'boolean' }, like_count: { type: 'integer' } } }, summary: 'Retirer son J’aime', errors: [401, 404] }),
    },
    '/publications/{id}/comments': {
      get: op({ tag: 'Réactions', role: 'visitor', params: [idParam], ok: arrayOf('Comment'), summary: 'Commentaires d’une publication (du plus ancien au plus récent)', errors: [401, 404] }),
      post: op({
        tag: 'Réactions', role: 'user', params: [idParam], okStatus: 201, ok: ref('Comment'), summary: 'Commenter une publication', errors: [401, 404],
        body: { type: 'object', required: ['content'], properties: { content: str(2000, { minLength: 1 }) } },
      }),
    },
    '/comments/{id}': {
      delete: op({ tag: 'Réactions', role: 'owner', params: [idParam], okStatus: 204, summary: 'Supprimer un commentaire', description: 'Auteur du commentaire ou admin.', errors: [401, 403, 404] }),
    },

    '/images/{id}': {
      get: op({ tag: 'Images', role: 'visitor', params: [idParam], ok: ref('Image'), summary: 'Métadonnées d’une image', errors: [401, 404], description: 'Visible si son activité ou sa publication l’est.' }),
      patch: op({
        tag: 'Images', role: 'owner', params: [idParam], ok: ref('Image'), summary: 'Modifier le texte alternatif ou la position', errors: [401, 403, 404],
        body: { type: 'object', properties: { alt_text: str(255), position: { type: 'integer', minimum: 0, maximum: 1000 } } },
      }),
      delete: op({ tag: 'Images', role: 'owner', params: [idParam], okStatus: 204, summary: 'Supprimer une image (et l’objet MinIO)', errors: [401, 403, 404] }),
    },
    '/images/{id}/file': {
      get: {
        ...op({ tag: 'Images', role: 'visitor', params: [idParam], summary: 'Fichier image', errors: [401, 404] }),
        responses: { 200: { description: 'Image', content: { 'image/*': { schema: { type: 'string', format: 'binary' } } } }, 401: { description: ERRORS[401] }, 404: { description: ERRORS[404] } },
      },
    },

    '/quizzes': {
      get: op({ tag: 'Quiz', role: 'visitor', params: PAGE, ok: arrayOf('Quiz'), summary: 'Lister les quiz', description: 'Non-admins : quiz publiés uniquement.', errors: [401] }),
      post: op({ tag: 'Quiz', role: 'admin', okStatus: 201, ok: ref('Quiz'), body: ref('QuizInput'), summary: 'Créer un quiz', errors: [401, 403] }),
    },
    '/quizzes/{id}': {
      get: op({ tag: 'Quiz', role: 'visitor', params: [idParam], ok: ref('QuizDetail'), summary: 'Quiz avec questions et choix', description: '`is_correct` n’est envoyé qu’à l’admin. Quiz non publié : 404 sauf admin.', errors: [401, 404] }),
      patch: op({ tag: 'Quiz', role: 'admin', params: [idParam], ok: ref('Quiz'), body: ref('QuizInput'), summary: 'Modifier un quiz', errors: [401, 403, 404] }),
      delete: op({ tag: 'Quiz', role: 'admin', params: [idParam], okStatus: 204, summary: 'Supprimer un quiz (questions, choix, résultats)', errors: [401, 403, 404] }),
    },
    '/quizzes/{id}/questions': {
      post: op({
        tag: 'Quiz', role: 'admin', params: [idParam], okStatus: 201, ok: ref('Question'), summary: 'Ajouter une question', errors: [401, 403, 404],
        body: { type: 'object', required: ['label'], properties: { label: str(255), position: { type: 'integer', minimum: 0, maximum: 1000, description: 'Par défaut : à la fin' } } },
      }),
    },
    '/questions/{id}': {
      patch: op({ tag: 'Quiz', role: 'admin', params: [idParam], ok: ref('Question'), summary: 'Modifier une question', errors: [401, 403, 404], body: { type: 'object', properties: { label: str(255), position: { type: 'integer' } } } }),
      delete: op({ tag: 'Quiz', role: 'admin', params: [idParam], okStatus: 204, summary: 'Supprimer une question (et ses choix)', errors: [401, 403, 404] }),
    },
    '/questions/{id}/choices': {
      post: op({
        tag: 'Quiz', role: 'admin', params: [idParam], okStatus: 201, ok: ref('Choice'), summary: 'Ajouter un choix', errors: [401, 403, 404],
        body: { type: 'object', required: ['label'], properties: { label: str(255), is_correct: { type: 'boolean', default: false } } },
      }),
    },
    '/choices/{id}': {
      patch: op({ tag: 'Quiz', role: 'admin', params: [idParam], ok: ref('Choice'), summary: 'Modifier un choix', errors: [401, 403, 404], body: { type: 'object', properties: { label: str(255), is_correct: { type: 'boolean' } } } }),
      delete: op({ tag: 'Quiz', role: 'admin', params: [idParam], okStatus: 204, summary: 'Supprimer un choix', errors: [401, 403, 404] }),
    },

    '/quizzes/{id}/results': {
      post: op({
        tag: 'Résultats', role: 'user', params: [idParam], okStatus: 201, ok: ref('QuizResult'), summary: 'Répondre à un quiz', errors: [401, 404],
        description: 'Une réponse par question. Le score est calculé par le serveur (1 point par bon choix). Chaque envoi crée une tentative.',
        body: { type: 'object', required: ['answers'], properties: { answers: { type: 'array', items: { type: 'object', required: ['question_id', 'choice_id'], properties: { question_id: { type: 'integer' }, choice_id: { type: 'integer' } } } } } },
      }),
    },
    '/quiz-results': {
      get: op({
        tag: 'Résultats', role: 'user', ok: arrayOf('QuizResult'), summary: 'Lister les résultats', errors: [401],
        description: 'Utilisateur : ses résultats uniquement (le filtre user_id est ignoré). Admin : tous.',
        params: [...PAGE, q('quiz_id', { type: 'integer', minimum: 1 }), q('user_id', { type: 'integer', minimum: 1 }, 'Admin uniquement')],
      }),
    },
    '/quiz-results/{id}': {
      get: op({ tag: 'Résultats', role: 'owner', params: [idParam], ok: ref('QuizResult'), summary: 'Voir un résultat', errors: [401, 404] }),
      delete: op({ tag: 'Résultats', role: 'owner', params: [idParam], okStatus: 204, summary: 'Supprimer un résultat', errors: [401, 404] }),
    },
  },
};
