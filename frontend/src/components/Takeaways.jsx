import Icon from './Icon.jsx';

const items = [
  'Les écrans peuvent être utilisés avec modération.',
  "Les interactions avec les parents restent essentielles au développement de l'enfant.",
  'Les jeux, les histoires et les activités motrices sont les meilleures alternatives.',
  'Chaque petit geste compte pour un grand avenir !',
];

export default function Takeaways() {
  return (
    <section className="pc-section pc-section--lavender" aria-labelledby="retenir-titre">
      <div className="pc-section__head pc-section__head--lavender">
        <span style={{ color: 'var(--pc-blue-700)' }}><Icon name="megaphone" size="lg" /></span>
        <h2 className="pc-section__title" id="retenir-titre">À retenir</h2>
      </div>
      <ul className="pc-takeaways">
        {items.map((item) => <li key={item}><Icon name="check-circle" /> {item}</li>)}
      </ul>
      <p className="pc-takeaways__cta">
        <a className="pc-btn pc-btn--pill" href="#defi">
          Moins d'écrans, plus de moments qui comptent ! <Icon name="heart" size="sm" />
        </a>
      </p>
    </section>
  );
}
