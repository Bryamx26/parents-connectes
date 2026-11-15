// Appels à l'API (/api, relayé par Vite en dev et nginx en prod). Le jeton est gardé dans localStorage.
const TOKEN_KEY = 'pc-token';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* navigation privée : la session dure le temps de l'onglet */ }
}

function headers(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

// body : objet envoyé en JSON ; form : FormData (upload).
export async function api(path, { method = 'GET', body, form } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: headers(body ? { 'Content-Type': 'application/json' } : {}),
    body: form ?? (body && JSON.stringify(body)),
  });
  if (res.status === 401 && getToken()) {
    setToken(null);
    window.dispatchEvent(new Event('pc-session-expired'));
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error || 'Le service ne répond pas. Réessayez dans un instant.');
    err.status = res.status;
    err.fields = Object.fromEntries((data?.details ?? []).map((d) => [d.field, d.message]));
    throw err;
  }
  return data;
}

// Les images passent par l'API (droits revérifiés) : on les charge avec le jeton.
export async function fetchImage(url) {
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error('Image indisponible');
  return res.blob();
}

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGES = 10;

// Envoi d'une photo avec progression : fetch ne donne pas l'avancement d'un envoi, XMLHttpRequest si.
export function uploadImage(path, file, altText, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('image', file);
    if (altText) form.append('alt_text', altText);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api${path}`);
    const token = getToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data = null;
      try { data = JSON.parse(xhr.responseText); } catch { /* réponse vide */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(Object.assign(new Error(data?.error || "La photo n'a pas pu être envoyée."), { status: xhr.status }));
    };
    xhr.onerror = () => reject(new Error("La photo n'a pas pu être envoyée. Vérifiez votre connexion."));
    xhr.send(form);
  });
}

// Vérifie une photo avant l'envoi ; renvoie un message d'erreur ou null.
export function checkImage(file) {
  if (!IMAGE_TYPES.includes(file.type)) return `« ${file.name} » n'est pas au bon format : choisissez une photo JPEG, PNG ou WebP.`;
  if (file.size > MAX_IMAGE_BYTES) return `« ${file.name} » dépasse 5 Mo : choisissez une image plus légère.`;
  return null;
}
