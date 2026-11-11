import Icon from './Icon.jsx';

const rules = [
  { color: 'green', icon: 'fork-plate', text: "Pas d'écran pendant les repas." },
  { color: 'sky', icon: 'moon', text: "Pas d'écran avant le coucher." },
  { color: 'yellow', icon: 'family', text: "Accompagner l'enfant lorsqu'il utilise un écran." },
  { color: 'pink', icon: 'clock', text: 'Prévoir des moments sans écran chaque jour.' },
];

export default function Rules() {
  return (
    <section className="pc-section pc-section--pink" aria-labelledby="conseils-titre">
      <div className="pc-section__head pc-section__head--pink">
        <span style={{ color: 'var(--pc-yellow-500)' }}><Icon name="bulb" size="lg" /></span>
        <h2 className="pc-section__title" id="conseils-titre">Nos conseils</h2>
        <span className="pc-section__aside">4 règles simples à retenir !</span>
      </div>
      <div className="pc-rules">
        {rules.map((rule, i) => (
          <div key={rule.icon} className={`pc-rule pc-rule--${rule.color}`}>
            <span className="pc-rule__label">Règle n°{i + 1}</span>
            <Icon name={rule.icon} size="xl" />
            <p className="pc-rule__text">{rule.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
