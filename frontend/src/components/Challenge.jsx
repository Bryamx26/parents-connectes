import { useState } from 'react';
import Icon from './Icon.jsx';

const ideas = ['Lire une histoire', 'Faire un puzzle', 'Dessiner', 'Jouer à cacher un objet'];

export default function Challenge() {
  const [done, setDone] = useState(ideas.map(() => false));
  const [success, setSuccess] = useState(false);
  const count = done.filter(Boolean).length;

  return (
    <section className="pc-section pc-section--green" id="defi" aria-labelledby="defi-titre">
      <div className="pc-section__head pc-challenge__head">
        <span style={{ color: 'var(--pc-yellow-500)' }}><Icon name="trophy" size="lg" /></span>
        <h2 className="pc-section__title" id="defi-titre">Défi de la semaine</h2>
        <span className="pc-section__aside">{count}/{ideas.length} idées</span>
      </div>
      <p className="pc-challenge__goal"><span className="pc-challenge__highlight">Une soirée sans écran !</span></p>
      <div className="pc-challenge__card">
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
          <li className="pc-challenge__success">
            <label className="pc-check">
              <input type="checkbox" checked={success} onChange={() => setSuccess(!success)} />
              <strong>Nous avons réussi le défi !</strong>
            </label>
          </li>
        </ul>
        <p className="pc-challenge__note"><span className="pc-sticky">Petits gestes, grands bienfaits !</span></p>
      </div>
    </section>
  );
}
