// Toute la configuration vient des variables d'environnement (voir .env.example à la racine).
function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

// Proxys de confiance pour retrouver l'IP du visiteur (rate limiting) :
// un nombre de proxys (« 1 ») ou des sous-réseaux (« loopback,linklocal,uniquelocal »), vide = aucun.
function parseTrustProxy(value) {
  if (!value) return false;
  if (/^\d+$/.test(value)) return Number(value);
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) throw new Error('JWT_SECRET doit faire au moins 32 caractères');

export const env = {
  port: Number(process.env.PORT || 3000),
  db: {
    host: required('DB_HOST'),
    port: Number(process.env.DB_PORT || 3306),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
  },
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  corsOrigins: (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean),
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT || 20),
  s3: {
    endpoint: required('S3_ENDPOINT'),
    region: process.env.S3_REGION || 'us-east-1',
    accessKeyId: required('S3_ACCESS_KEY'),
    secretAccessKey: required('S3_SECRET_KEY'),
    bucket: process.env.S3_BUCKET || 'parents-connectes',
  },
};
