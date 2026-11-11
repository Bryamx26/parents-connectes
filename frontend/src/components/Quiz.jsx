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
      <div className="pc-quiz" role="radiogroup" aria-labelledby="quiz-q1">
        <div className="pc-quiz__question" id="quiz-q1">
          <Icon name="question" /> Les écrans sont-ils recommandés juste avant le coucher ?
        </div>
        {['Oui', 'Non'].map((option) => (
          <label key={option} className="pc-radio">
            <input type="radio" name="q1" checked={choice === option} onChange={() => setChoice(option)} /> {option}
          </label>
        ))}
        <button className="pc-btn" type="button" onClick={() => setRevealed(true)}>Voir la réponse</button>
        <div aria-live="polite">
          {revealed && (
            <div className="pc-quiz__answer">
              <strong>{choice === 'Non' ? 'Bravo, c’est non !' : 'Non.'}</strong>
              Les écrans avant le coucher peuvent perturber le sommeil et retarder l'endormissement.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
