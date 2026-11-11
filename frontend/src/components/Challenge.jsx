import { useState } from 'react';
import Icon from './Icon.jsx';
import { challengeArt, sectionArt } from '../illustrations.js';

const ideas = ['Lire une histoire', 'Faire un puzzle', 'Dessiner', 'Jouer à cacher un objet'];

export default function Challenge() {
  const [done, setDone] = useState(ideas.map(() => false));
  const [success, setSuccess] = useState(false);
  const count = done.filter(Boolean).length;

  return (
    <section className="pc-section pc-section--green" id="defi" aria-labelledby="defi-titre">
      <div className="pc-section__head pc-challenge__head">
        <img className="pc-section__art" src={sectionArt.trophy} alt="" width="40" height="40" />
        <h2 className="pc-section__title" id="defi-titre">Défi de la semaine</h2>
        <span className="pc-section__aside">{count}/{ideas.length} idées</span>
      </div>
      <p className="pc-challenge__goal"><span className="pc-challenge__highlight">Une soirée sans écran !</span></p>
      <div className="pc-challenge__card">
        <div className="pc-challenge__body">
          <div>
            <p className="pc-challenge__lead">À la place :</p>
            <ul className="pc-checklist">
              {ideas.map((idea, i) => (
                <li key={idea}>
                  <label className="pc-check">
                    <input
                      type="checkbox" checked={done[i]}
                      onChange={() => setDone(done.map((d, j) => (j === i ? !d : d)))}
                    /> {idea}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <figure className="pc-challenge__art">
            <img src={challengeArt.src} alt={challengeArt.alt} width="466" height="346" />
            <figcaption className="pc-sticky">Petits gestes, grands bienfaits !</figcaption>
          </figure>
        </div>
        <label className="pc-check pc-challenge__success">
          <input type="checkbox" checked={success} onChange={() => setSuccess(!success)} />
          <strong>Nous avons réussi le défi !</strong>
          <span className="pc-challenge__heart"><Icon name="heart" /></span>
        </label>
      </div>
    </section>
  );
}
