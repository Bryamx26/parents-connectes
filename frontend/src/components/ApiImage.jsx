import { useEffect, useState } from 'react';
import { fetchImage } from '../lib/api.js';

// Image servie par l'API : chargée avec le jeton (une image privée n'a pas d'URL publique).
export default function ApiImage({ id, alt, fallback }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let url;
    let alive = true;
    setSrc(null);
    setFailed(false);
    fetchImage(`/api/images/${id}/file`)
      .then((blob) => {
        if (!alive) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);

  if (failed) return fallback ?? null;
  return src ? <img src={src} alt={alt ?? ''} width="320" height="200" /> : null;
}
