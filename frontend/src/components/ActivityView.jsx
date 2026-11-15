import { useState } from 'react';
import Icon from './Icon.jsx';
import Lightbox from './Lightbox.jsx';
import { Gallery } from './Carousel.jsx';
import { ageRange } from '../lib/format.js';

// Affichage d'une activité : sert à la page de détail et à l'aperçu de l'éditeur (photos locales comprises).
// Tout le texte saisi est rendu comme du texte (jamais comme du HTML).
// titleLevel : 'h2' dans l'aperçu de l'éditeur, qui a déjà son propre titre de page.
export default function ActivityView({ activity, actions, children, titleLevel: Title = 'h1' }) {
  const [zoom, setZoom] = useState(null); // { images, start, title }
  const open = (images, title) => (start) => setZoom({ images, start, title });

  return (
    <article className="pc-activity">
      <header className="pc-activity__head">
        <Title className="pc-pill-title pc-pill-title--green pc-activity__title" id={Title === 'h1' ? 'page-titre' : undefined}>{activity.title || 'Activité sans titre'}</Title>
        <div className="pc-badges">
          <span className="pc-badge pc-badge--green"><Icon name="baby" /> {ageRange(activity.age_min_months, activity.age_max_months)}</span>
          {activity.duration_minutes && <span className="pc-badge"><Icon name="clock" /> {activity.duration_minutes} min</span>}
          {activity.visibility === 'private' && <span className="pc-badge pc-badge--yellow"><Icon name="user" /> Privé</span>}
        </div>
        {activity.author_name && <p className="pc-post__meta">Proposée par {activity.author_name}</p>}
        {activity.material && (
          <p className="pc-activity__material"><strong>Matériel :</strong> <span className="pc-text">{activity.material}</span></p>
        )}
        {actions}
      </header>

      <Gallery images={activity.images} label="Photos de l'activité" onOpen={open(activity.images, `Photos de « ${activity.title} »`)} />

      {activity.description && <p className="pc-text pc-activity__description">{activity.description}</p>}

      {activity.steps.length > 0 && (
        <section aria-labelledby="etapes-titre">
          <h2 className="pc-activity__subtitle" id="etapes-titre">Étapes</h2>
          <ol className="pc-steps">
            {activity.steps.map((step, i) => (
              <li key={step.id ?? step.key} className="pc-steps__item">
                <span className="pc-steps__number" aria-hidden="true">{i + 1}</span>
                <div className="pc-steps__body">
                  <h3 className="pc-steps__title">{step.title || `Étape ${i + 1}`}</h3>
                  <p className="pc-text">{step.content}</p>
                  <Gallery images={step.images} label={`Photos de l'étape ${i + 1}`}
                    onOpen={open(step.images, `Étape ${i + 1} : ${step.title}`)} />
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {children}
      {zoom && <Lightbox images={zoom.images} start={zoom.start} title={zoom.title} onClose={() => setZoom(null)} />}
    </article>
  );
}
