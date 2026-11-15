import { useRef, useState } from 'react';
import Icon from './Icon.jsx';
import Img from './Img.jsx';
import { checkImage, MAX_IMAGES } from '../lib/api.js';

let counter = 0;
export const newKey = () => `n${++counter}`;

// Photos d'un contenu : déjà enregistrées ({ id, alt }) ou nouvelles ({ key, file, preview, alt }).
// Aperçu immédiat, contrôle du type, de la taille et du nombre, texte alternatif pour chacune,
// progression pendant l'envoi (progress, posé par le parent).
export default function PhotoPicker({ id, label, photos, onChange }) {
  const [error, setError] = useState(null);
  const input = useRef(null);

  function add(files) {
    const room = MAX_IMAGES - photos.length;
    const accepted = [];
    const problems = [];
    for (const file of files) {
      const problem = checkImage(file);
      if (problem) problems.push(problem);
      else if (accepted.length >= room) problems.push(`${MAX_IMAGES} photos maximum : « ${file.name} » n'a pas été ajoutée.`);
      else accepted.push({ key: newKey(), file, preview: URL.createObjectURL(file), alt: '' });
    }
    setError(problems.join(' ') || null);
    if (accepted.length) onChange([...photos, ...accepted]);
    input.current.value = '';
  }

  function remove(photo) {
    if (photo.preview && !photo.id) URL.revokeObjectURL(photo.preview);
    onChange(photos.filter((p) => p !== photo));
  }

  const setAlt = (photo, alt) => onChange(photos.map((p) => (p === photo ? { ...p, alt } : p)));

  return (
    <fieldset className="pc-fieldset">
      <legend>{label}</legend>
      <p className="pc-field__hint" id={`${id}-hint`}>JPEG, PNG ou WebP, 5 Mo maximum, {MAX_IMAGES} photos au plus.</p>
      {photos.length > 0 && (
        <ul className="pc-photos">
          {photos.map((photo, i) => (
            <li key={photo.id ?? photo.key} className="pc-photo">
              <div className="pc-photo__thumb"><Img image={photo} alt="" /></div>
              <div className="pc-photo__body">
                <label className="pc-field__label" htmlFor={`${id}-alt-${i}`}>Que montre la photo {i + 1} ?</label>
                <input className="pc-input" id={`${id}-alt-${i}`} maxLength={255} value={photo.alt}
                  onChange={(e) => setAlt(photo, e.target.value)} placeholder="Ex. : les enfants secouent le bâton de pluie" />
                {photo.progress !== undefined && !photo.id && (
                  <progress className="pc-photo__progress" max="100" value={photo.progress} aria-label={`Envoi de la photo ${i + 1}`} />
                )}
                {photo.error && <p className="pc-field__error"><Icon name="close" size="sm" /> {photo.error}</p>}
              </div>
              <button className="pc-action" type="button" onClick={() => remove(photo)} aria-label={`Retirer la photo ${i + 1}`}>
                <Icon name="close" /> Retirer
              </button>
            </li>
          ))}
        </ul>
      )}
      {photos.length < MAX_IMAGES && (
        <label className="pc-btn pc-btn--soft pc-photos__add">
          <Icon name="sparkle" size="sm" /> Ajouter des photos
          <input ref={input} className="pc-visually-hidden" type="file" multiple accept="image/jpeg,image/png,image/webp"
            aria-describedby={`${id}-hint`} onChange={(e) => add([...e.target.files])} />
        </label>
      )}
      {error && <p className="pc-field__error" role="alert"><Icon name="close" size="sm" /> {error}</p>}
    </fieldset>
  );
}

// Enregistre les photos d'un parent : supprime celles retirées, met à jour les textes alternatifs,
// envoie les nouvelles (progression via onPhoto). server : photos déjà en base, mis à jour au fil de l'eau
// pour qu'un « Réessayer » reprenne là où l'envoi s'est arrêté.
export async function syncPhotos({ uploadPath, photos, server, onPhoto, api, uploadImage }) {
  for (const saved of [...server]) {
    if (!photos.some((p) => p.id === saved.id)) {
      await api(`/images/${saved.id}`, { method: 'DELETE' });
      server.splice(server.indexOf(saved), 1);
    }
  }
  for (const photo of photos) {
    if (photo.id) {
      const saved = server.find((s) => s.id === photo.id);
      if (saved && saved.alt !== photo.alt) {
        await api(`/images/${photo.id}`, { method: 'PATCH', body: { alt_text: photo.alt } });
        saved.alt = photo.alt;
      }
      continue;
    }
    try {
      const image = await uploadImage(uploadPath, photo.file, photo.alt, (progress) => onPhoto(photo.key, { progress }));
      server.push({ id: image.id, alt: photo.alt });
      onPhoto(photo.key, { id: image.id, progress: 100, error: null });
    } catch (err) {
      onPhoto(photo.key, { error: err.message, progress: undefined });
      throw err;
    }
  }
}
