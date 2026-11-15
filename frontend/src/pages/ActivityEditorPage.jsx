import { useEffect, useRef, useState } from 'react';
import ActivityView from '../components/ActivityView.jsx';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import PhotoPicker, { syncPhotos } from '../components/PhotoPicker.jsx';
import StepsEditor from '../components/StepsEditor.jsx';
import { Chip } from '../components/Chip.jsx';
import { Empty, Loading, LoadError } from '../components/States.jsx';
import { api, uploadImage } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { useAuth } from '../lib/auth.jsx';
import { Link, navigate, setBlocker } from '../lib/router.jsx';
import { useUnsavedChanges } from '../lib/useUnsavedChanges.js';
import { AGE_OPTIONS } from '../lib/format.js';

const EMPTY_INFO = { title: '', description: '', age_min_months: 0, age_max_months: 36, duration_minutes: '', material: '', visibility: 'public' };
const toPhotos = (images = []) => images.map((i) => ({ id: i.id, key: `i${i.id}`, alt: i.alt_text ?? '' }));

function fromActivity(a) {
  return {
    info: {
      title: a.title, description: a.description, age_min_months: a.age_min_months, age_max_months: a.age_max_months,
      duration_minutes: a.duration_minutes ?? '', material: a.material ?? '', visibility: a.visibility,
    },
    photos: toPhotos(a.images),
    steps: a.steps.map((s) => ({ key: `s${s.id}`, id: s.id, title: s.title, content: s.content, photos: toPhotos(s.images) })),
  };
}

// État déjà en base, mis à jour au fil de l'enregistrement : un « Réessayer » reprend où l'envoi s'est arrêté.
function serverFrom(id, draft) {
  return {
    id,
    info: id ? infoBody(draft.info) : null,
    photos: draft.photos.map(({ id: pid, alt }) => ({ id: pid, alt })),
    steps: draft.steps.map((s) => ({ id: s.id, title: s.title, content: s.content, photos: s.photos.map(({ id: pid, alt }) => ({ id: pid, alt })) })),
    order: draft.steps.map((s) => s.id),
  };
}

function infoBody(info) {
  return {
    title: info.title.trim(),
    description: info.description.trim(),
    age_min_months: Number(info.age_min_months),
    age_max_months: Number(info.age_max_months),
    duration_minutes: info.duration_minutes === '' ? null : Number(info.duration_minutes),
    material: info.material.trim() || null,
    visibility: info.visibility,
  };
}

// Empreinte comparable du brouillon (sans les fichiers) pour détecter les modifications.
const fingerprint = (d) => JSON.stringify([
  d.info, d.photos.map((p) => [p.id ?? p.key, p.alt]),
  d.steps.map((s) => [s.id ?? s.key, s.title, s.content, s.photos.map((p) => [p.id ?? p.key, p.alt])]),
]);

function validate(d) {
  const errors = {};
  if (!d.info.title.trim()) errors.title = "Donnez un nom à l'activité.";
  if (!d.info.description.trim()) errors.description = 'Décrivez l’activité en quelques phrases.';
  if (Number(d.info.age_min_months) > Number(d.info.age_max_months)) errors.age_max_months = "L'âge maximum doit être supérieur ou égal à l'âge minimum.";
  const d0 = d.info.duration_minutes;
  if (d0 !== '' && (!Number.isInteger(Number(d0)) || Number(d0) < 1 || Number(d0) > 1440)) errors.duration_minutes = 'Indiquez une durée entre 1 et 1440 minutes.';
  const steps = {};
  d.steps.forEach((s) => {
    const e = {};
    if (!s.title.trim()) e.title = "Donnez un titre à l'étape.";
    if (!s.content.trim()) e.content = "Expliquez ce qu'il faut faire.";
    if (e.title || e.content) steps[s.key] = e;
  });
  if (Object.keys(steps).length) errors.steps = steps;
  return errors;
}

function Editor({ activity }) {
  const { user } = useAuth();
  const initial = useRef(null);
  if (!initial.current) initial.current = activity ? fromActivity(activity) : { info: EMPTY_INFO, photos: [], steps: [] };
  const [draft, setDraft] = useState(initial.current);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const server = useRef(serverFrom(activity?.id ?? null, initial.current));
  const [baseline, setBaseline] = useState(() => fingerprint(initial.current));
  const [view, setView] = useState('edit');
  const [state, setState] = useState({ saving: false, errors: {}, message: null });
  const summary = useRef(null);

  const dirty = fingerprint(draft) !== baseline;
  // Message d'erreur : le focus y va une fois affiché, pour qu'il soit lu tout de suite.
  useEffect(() => {
    if (state.message) summary.current?.focus();
  }, [state.message]);
  useUnsavedChanges(dirty && !state.saving);

  const setInfo = (field) => (e) => setDraft((d) => ({ ...d, info: { ...d.info, [field]: e.target.value } }));
  const patchPhoto = (stepKey, key, fields) => setDraft((d) => {
    const apply = (photos) => photos.map((p) => (p.key === key ? { ...p, ...fields } : p));
    if (!stepKey) return { ...d, photos: apply(d.photos) };
    return { ...d, steps: d.steps.map((s) => (s.key === stepKey ? { ...s, photos: apply(s.photos) } : s)) };
  });
  const patchStep = (key, fields) => setDraft((d) => ({ ...d, steps: d.steps.map((s) => (s.key === key ? { ...s, ...fields } : s)) }));

  async function save() {
    const d = draftRef.current;
    const errors = validate(d);
    if (Object.keys(errors).length) {
      setState({ saving: false, errors, message: 'Quelques informations manquent : elles sont signalées ci-dessous.' });
      setView('edit');
      return;
    }
    setState({ saving: true, errors: {}, message: null });
    const s = server.current;
    let part = "les informations de l'activité";
    try {
      const info = infoBody(d.info);
      if (!s.id) {
        s.id = (await api('/activities', { method: 'POST', body: info })).id;
        s.info = info;
      } else if (JSON.stringify(info) !== JSON.stringify(s.info)) {
        await api(`/activities/${s.id}`, { method: 'PATCH', body: info });
        s.info = info;
      }

      part = "les photos de l'activité";
      await syncPhotos({ uploadPath: `/activities/${s.id}/images`, photos: d.photos, server: s.photos,
        onPhoto: (key, f) => patchPhoto(null, key, f), api, uploadImage });

      for (const saved of [...s.steps]) {
        if (!d.steps.some((st) => st.id === saved.id)) {
          part = 'la suppression d’une étape';
          await api(`/steps/${saved.id}`, { method: 'DELETE' });
          s.steps.splice(s.steps.indexOf(saved), 1);
        }
      }

      const order = [];
      for (const [i, step] of d.steps.entries()) {
        part = `l'étape ${i + 1}`;
        const body = { title: step.title.trim(), content: step.content.trim() };
        let saved = s.steps.find((x) => x.id === step.id);
        if (!saved) {
          const created = await api(`/activities/${s.id}/steps`, { method: 'POST', body });
          saved = { id: created.id, ...body, photos: [] };
          s.steps.push(saved);
          patchStep(step.key, { id: created.id });
        } else if (saved.title !== body.title || saved.content !== body.content) {
          await api(`/steps/${saved.id}`, { method: 'PATCH', body });
          Object.assign(saved, body);
        }
        part = `les photos de l'étape ${i + 1}`;
        await syncPhotos({ uploadPath: `/steps/${saved.id}/images`, photos: step.photos, server: saved.photos,
          onPhoto: (key, f) => patchPhoto(step.key, key, f), api, uploadImage });
        order.push(saved.id);
      }

      if (order.length && JSON.stringify(order) !== JSON.stringify(s.order)) {
        part = "l'ordre des étapes";
        await api(`/activities/${s.id}/steps/order`, { method: 'PUT', body: { step_ids: order } });
      }
      s.order = order;

      setBaseline(fingerprint(draftRef.current));
      setBlocker(null); // tout est enregistré : on quitte sans demander
      navigate(`/activites/${s.id}`);
    } catch (err) {
      const fields = err.fields ?? {};
      const already = s.id ? ' Ce qui précède est enregistré : « Réessayer » reprend à cet endroit.' : '';
      setState({ saving: false, errors: fields, message: `Impossible d'enregistrer ${part} : ${err.message}${already}` });
    }
  }

  const { errors } = state;
  const preview = {
    ...infoBody(draft.info),
    title: draft.info.title, author_name: activity?.author_name ?? user?.name,
    images: draft.photos, steps: draft.steps.map((st) => ({ ...st, images: st.photos })),
  };

  return (
    <section className="pc-section pc-editor" aria-labelledby="editeur-titre">
      <div className="pc-section__head pc-section__head--green">
        <Icon name="puzzle" size="lg" />
        <h1 className="pc-section__title" id="editeur-titre">{activity ? "Modifier l'activité" : 'Nouvelle activité'}</h1>
        <span className="pc-section__aside">{dirty ? 'Modifications non enregistrées' : 'Tout est enregistré'}</span>
      </div>

      <div className="pc-chips" role="group" aria-label="Mode d'affichage">
        <Chip pressed={view === 'edit'} onClick={() => setView('edit')}>Modifier</Chip>
        <Chip pressed={view === 'preview'} onClick={() => setView('preview')}>Aperçu</Chip>
      </div>

      {state.message && (
        <p className="pc-alert" role="alert" tabIndex={-1} ref={summary}><Icon name="question" /> {state.message}</p>
      )}

      {view === 'preview' ? (
        <div className="pc-editor__preview" aria-label="Aperçu de l'activité">
          <ActivityView activity={preview} titleLevel="h2" />
        </div>
      ) : (
        <form className="pc-editor__form" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
          <fieldset className="pc-form pc-editor__block">
            <legend className="pc-form__title">Informations générales</legend>
            <Field id="title" label="Nom de l'activité" required maxLength={150} value={draft.info.title} onChange={setInfo('title')} error={errors.title} />
            <Field id="description" as="textarea" label="Description" required maxLength={10000} value={draft.info.description}
              onChange={setInfo('description')} hint="À quoi sert l'activité, ce que l'enfant découvre." error={errors.description} />
            <div className="pc-form__row">
              <Field id="age_min_months" as="select" label="À partir de" value={draft.info.age_min_months} onChange={setInfo('age_min_months')} error={errors.age_min_months}>
                {AGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Field>
              <Field id="age_max_months" as="select" label="Jusqu'à" value={draft.info.age_max_months} onChange={setInfo('age_max_months')} error={errors.age_max_months}>
                {AGE_OPTIONS.filter((o) => o.value > 0).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Field>
              <Field id="duration_minutes" type="number" inputMode="numeric" min={1} max={1440} label="Durée en minutes (facultatif)"
                value={draft.info.duration_minutes} onChange={setInfo('duration_minutes')} error={errors.duration_minutes} />
            </div>
            <Field id="material" as="textarea" rows={3} label="Matériel (facultatif)" maxLength={10000}
              value={draft.info.material} onChange={setInfo('material')} error={errors.material} />
            <fieldset className="pc-fieldset">
              <legend>Qui peut voir cette activité ?</legend>
              {[['public', 'Tout le monde'], ['private', 'Moi seulement']].map(([value, text]) => (
                <label key={value} className="pc-radio pc-radio--sm">
                  <input type="radio" name="visibility" value={value} checked={draft.info.visibility === value} onChange={setInfo('visibility')} /> {text}
                </label>
              ))}
            </fieldset>
            <PhotoPicker id="activity-photos" label="Photos de l'activité (facultatif)" photos={draft.photos}
              onChange={(photos) => setDraft((d) => ({ ...d, photos }))} />
          </fieldset>

          <section className="pc-form pc-editor__block" aria-labelledby="etapes-editeur-titre">
            <h2 className="pc-form__title" id="etapes-editeur-titre">Étapes</h2>
            <StepsEditor steps={draft.steps} errors={errors.steps} onChange={(steps) => setDraft((d) => ({ ...d, steps }))} />
          </section>
        </form>
      )}

      <div className="pc-editor__actions">
        <button className="pc-btn" type="button" onClick={save} disabled={state.saving}>
          {state.saving ? 'Enregistrement…' : state.message && server.current.id ? 'Réessayer' : 'Enregistrer'}
        </button>
        <Link className="pc-editor__cancel" to={activity ? `/activites/${activity.id}` : '/activites'}>Annuler</Link>
      </div>
    </section>
  );
}

// /activites/nouvelle et /activites/:id/modifier : le même éditeur.
export default function ActivityEditorPage({ id }) {
  const { user, ready, canEdit } = useAuth();
  const activity = useApi(id ? `/activities/${id}` : null);

  if (!ready || (id && activity.status === 'loading')) return <Loading label="Chargement de l'éditeur" count={1} />;
  if (!user) {
    const back = id ? `/activites/${id}/modifier` : '/activites/nouvelle';
    return <Empty action={<Link className="pc-btn" to={`/connexion?retour=${back}`}>Se connecter</Link>}>Connectez-vous pour partager une activité.</Empty>;
  }
  if (!id) return <Editor key="new" />;
  if (activity.status === 'error') {
    return activity.error.status === 404
      ? <Empty action={<Link className="pc-btn" to="/activites">Voir les activités</Link>}>Cette activité n'existe pas ou n'est pas visible.</Empty>
      : <LoadError onRetry={activity.reload} />;
  }
  if (!canEdit(activity.data)) {
    return <Empty action={<Link className="pc-btn" to={`/activites/${id}`}>Voir l'activité</Link>}>Seule la personne qui a proposé cette activité peut la modifier.</Empty>;
  }
  return <Editor key={id} activity={activity.data} />;
}
