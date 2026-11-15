import { useEffect, useState } from 'react';
import Field from './Field.jsx';
import Icon from './Icon.jsx';
import PhotoPicker, { syncPhotos } from './PhotoPicker.jsx';
import { api, uploadImage } from '../lib/api.js';

const toPhotos = (images = []) => images.map((i) => ({ id: i.id, key: `i${i.id}`, alt: i.alt_text ?? '' }));

// Création ou modification d'une publication, photos comprises (aperçu, progression, reprise après erreur).
export default function PublicationForm({ item, onSaved, onCancel }) {
  const [values, setValues] = useState({
    title: item?.title ?? '', content: item?.content ?? '', visibility: item?.visibility ?? 'public', activity_id: item?.activity_id ?? '',
  });
  const [photos, setPhotos] = useState(toPhotos(item?.images));
  const [server] = useState(() => ({ id: item?.id ?? null, photos: toPhotos(item?.images).map(({ id, alt }) => ({ id, alt })) }));
  const [state, setState] = useState({ busy: false, errors: {}, message: null });
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    api('/activities?limit=50&sort=title&order=asc').then(setActivities).catch(() => setActivities([]));
  }, []);

  const set = (field) => (e) => setValues({ ...values, [field]: e.target.value });
  const onPhoto = (key, fields) => setPhotos((list) => list.map((p) => (p.key === key ? { ...p, ...fields } : p)));

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, errors: {}, message: null });
    const body = { ...values, activity_id: values.activity_id ? Number(values.activity_id) : null };
    try {
      const saved = await api(server.id ? `/publications/${server.id}` : '/publications', { method: server.id ? 'PATCH' : 'POST', body });
      server.id = saved.id;
      await syncPhotos({ uploadPath: `/publications/${saved.id}/images`, photos, server: server.photos, onPhoto, api, uploadImage });
      onSaved(saved.id);
    } catch (err) {
      const message = server.id && !err.fields ? `Le texte est enregistré, mais une photo n'a pas pu être envoyée : ${err.message} Vous pouvez réessayer.` : err.message;
      setState({ busy: false, errors: err.fields ?? {}, message });
    }
  }

  const { errors } = state;
  return (
    <form className="pc-form pc-form--flat" onSubmit={submit}>
      <h2 className="pc-form__title" id="publication-form-titre">{item ? 'Modifier la publication' : 'Nouvelle publication'}</h2>
      {state.message && <p className="pc-alert" role="alert"><Icon name="question" /> {state.message}</p>}
      <Field id="title" label="Titre" required maxLength={150} value={values.title} onChange={set('title')} error={errors.title} />
      <Field id="content" as="textarea" label="Votre message" required maxLength={10000} value={values.content} onChange={set('content')}
        hint="Une idée, un moment partagé, une astuce…" error={errors.content} />
      <Field id="activity_id" as="select" label="Activité liée (facultatif)" value={values.activity_id} onChange={set('activity_id')} error={errors.activity_id}>
        <option value="">Aucune</option>
        {activities.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
      </Field>
      <fieldset className="pc-fieldset">
        <legend>Qui peut voir cette publication ?</legend>
        {[['public', 'Tout le monde'], ['private', 'Moi seulement']].map(([value, text]) => (
          <label key={value} className="pc-radio pc-radio--sm">
            <input type="radio" name="visibility" value={value} checked={values.visibility === value} onChange={set('visibility')} /> {text}
          </label>
        ))}
      </fieldset>
      <PhotoPicker id="publication-photos" label="Photos (facultatif)" photos={photos} onChange={setPhotos} />
      <div className="pc-form__actions">
        <button className="pc-btn" type="submit" disabled={state.busy}>{state.busy ? 'Enregistrement…' : item ? 'Enregistrer' : 'Publier'}</button>
        <button className="pc-btn pc-btn--soft" type="button" onClick={onCancel}>Annuler</button>
      </div>
    </form>
  );
}
