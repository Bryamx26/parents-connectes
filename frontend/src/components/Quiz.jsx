import { useState } from 'react';
import Icon from './Icon.jsx';

export default function Quiz() {
  const [choice, setChoice] = useState(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <section className="pc-section pc-section--lavender" aria-labelledby="quiz-titre">
      <div className="pc-section__head pc-section__head--lavender">
        <Icon name="question" size="lg" />
        <h2 className="pc-section__title" id="quiz-titre">Quiz des parents</h2>
        <span className="pc-section__aside">Testez vos connaissances !</span>
      </div>
      <div className="pc-quiz pc-quiz--split">
        <fieldset className="pc-quiz__form">
          <legend className="pc-quiz__question">
            <Icon name="question" /> Les écrans sont-ils recommandés juste avant le coucher ?
          </legend>
          {['Oui', 'Non'].map((option) => (
            <label key={option} className="pc-radio">
              <input type="radio" name="q1" checked={choice === option} onChange={() => setChoice(option)} /> {option}
            </label>
          ))}
          <button className="pc-btn" type="button" onClick={() => setRevealed(true)}>Voir la réponse</button>
        </fieldset>
        <div className="pc-quiz__side" aria-live="polite">
          {revealed ? (
            <div className="pc-quiz__answer">
              <span className="pc-quiz__label">Réponse :</span>
              <strong>{choice === 'Non' ? 'Non, bravo !' : 'Non.'}</strong>
              Les écrans avant le coucher peuvent perturber le sommeil et retarder l'endormissement.
            </div>
          ) : (
            <p className="pc-quiz__hint">Choisissez une réponse, puis découvrez l'explication ici.</p>
          )}
          <span className="pc-quiz__deco"><Icon name="star" size="sm" /><Icon name="moon" /></span>
        </div>
      </div>
    </section>
  );
}
