import { useState } from 'react';
import Field from './Field.jsx';
import Icon from './Icon.jsx';
import PhotoPicker, { newKey } from './PhotoPicker.jsx';
import { useConfirm } from '../lib/confirm.jsx';

export const blankStep = () => ({ key: newKey(), id: null, title: '', content: '', photos: [] });

// Liste d'étapes modifiable : glisser-déposer par la poignée (souris), boutons monter/descendre
// (clavier, mobile, lecteurs d'écran), suppression confirmée. Chaque déplacement est annoncé.
export default function StepsEditor({ steps, onChange, errors = {} }) {
  const confirm = useConfirm();
  const [announce, setAnnounce] = useState('');
  const [drag, setDrag] = useState({ armed: null, from: null, over: null });

  const update = (key, fields) => onChange(steps.map((s) => (s.key === key ? { ...s, ...fields } : s)));

  function move(from, to, focusId) {
    if (to < 0 || to >= steps.length || from === to) return;
    const next = [...steps];
    const [step] = next.splice(from, 1);
    next.splice(to, 0, step);
    onChange(next);
    setAnnounce(`Étape « ${step.title || 'sans titre'} » déplacée en position ${to + 1} sur ${steps.length}.`);
    // Le nœud est déplacé dans le DOM : on remet le focus sur le bouton utilisé (ou son voisin en bout de liste).
    if (focusId) {
      requestAnimationFrame(() => {
        const target = document.getElementById(focusId);
        (target && !target.disabled ? target : document.getElementById(`step-${step.key}-title`))?.focus();
      });
    }
  }

  async function remove(step, index) {
    const ok = await confirm({
      title: `Supprimer l'étape ${index + 1} ?`,
      message: step.title ? `« ${step.title} » et ses photos seront retirées de l'activité.` : 'Ses photos seront retirées aussi.',
      confirmLabel: "Supprimer l'étape",
    });
    if (!ok) return;
    step.photos.forEach((p) => p.preview && !p.id && URL.revokeObjectURL(p.preview));
    onChange(steps.filter((s) => s.key !== step.key));
    setAnnounce(`Étape ${index + 1} supprimée.`);
  }

  function add() {
    const step = blankStep();
    onChange([...steps, step]);
    requestAnimationFrame(() => document.getElementById(`step-${step.key}-title`)?.focus());
  }

  const endDrag = () => setDrag({ armed: null, from: null, over: null });

  return (
    <div className="pc-step-editor">
      <p className="pc-visually-hidden" aria-live="polite">{announce}</p>
      {steps.length === 0 && <p className="pc-field__hint">Pas encore d'étape. Un tutoriel se lit mieux en étapes courtes, une action par étape.</p>}
      <ol className="pc-step-editor__list">
        {steps.map((step, i) => {
          const err = errors[step.key] ?? {};
          const classes = ['pc-step-editor__item'];
          if (drag.from === i) classes.push('pc-step-editor__item--dragging');
          if (drag.over === i && drag.from !== i) classes.push('pc-step-editor__item--over');
          return (
            <li key={step.key} className={classes.join(' ')}
              draggable={drag.armed === step.key}
              onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', step.key); setDrag((d) => ({ ...d, from: i })); }}
              onDragOver={(e) => { if (drag.from === null) return; e.preventDefault(); if (drag.over !== i) setDrag((d) => ({ ...d, over: i })); }}
              onDrop={(e) => { e.preventDefault(); if (drag.from !== null) move(drag.from, i); endDrag(); }}
              onDragEnd={endDrag}
            >
              <div className="pc-step-editor__bar">
                <span className="pc-step-editor__handle" title="Glisser pour déplacer" aria-hidden="true"
                  onPointerDown={() => setDrag((d) => ({ ...d, armed: step.key }))} onPointerUp={endDrag}>
                  <Icon name="menu" />
                </span>
                <h3 className="pc-step-editor__number">Étape {i + 1}</h3>
                <div className="pc-step-editor__tools">
                  <button id={`step-${step.key}-up`} className="pc-icon-btn" type="button" disabled={i === 0}
                    aria-label={`Monter l'étape ${i + 1}`} onClick={() => move(i, i - 1, `step-${step.key}-up`)}>
                    <span className="pc-icon--up"><Icon name="chevron-right" /></span>
                  </button>
                  <button id={`step-${step.key}-down`} className="pc-icon-btn" type="button" disabled={i === steps.length - 1}
                    aria-label={`Descendre l'étape ${i + 1}`} onClick={() => move(i, i + 1, `step-${step.key}-down`)}>
                    <span className="pc-icon--down"><Icon name="chevron-right" /></span>
                  </button>
                  <button className="pc-icon-btn" type="button" aria-label={`Supprimer l'étape ${i + 1}`} onClick={() => remove(step, i)}>
                    <Icon name="close" />
                  </button>
                </div>
              </div>
              <Field id={`step-${step.key}-title`} label="Titre de l'étape" required maxLength={150} value={step.title}
                onChange={(e) => update(step.key, { title: e.target.value })} error={err.title} />
              <Field id={`step-${step.key}-content`} as="textarea" label="Ce qu'il faut faire" required maxLength={10000} rows={3}
                value={step.content} onChange={(e) => update(step.key, { content: e.target.value })} error={err.content} />
              <PhotoPicker id={`step-${step.key}-photos`} label={`Photos de l'étape ${i + 1} (facultatif)`} photos={step.photos}
                onChange={(photos) => update(step.key, { photos })} />
            </li>
          );
        })}
      </ol>
      <button className="pc-btn pc-btn--soft" type="button" onClick={add}><Icon name="sparkle" size="sm" /> Ajouter une étape</button>
    </div>
  );
}
