import Icon from '../components/Icon.jsx';
import { Link } from '../lib/router.jsx';

// Liens repris tels quels de la page Contact du site Vitamines.
const EMAIL = 'rishingsilvabryam@gmail.com';
const DESIGNER_EMAIL = 'rajaemakhfi6@icloud.com';
const LINKEDIN = 'https://www.linkedin.com/in/bryam-rishing-silva-5a291b352';

export default function AboutPage() {
  return (
    <section className="pc-section pc-section--pink" aria-labelledby="about-title">
      <div className="pc-section__head pc-section__head--pink">
        <Icon name="family" size="lg" />
        <h1 className="pc-section__title" id="about-title">À propos</h1>
        <span className="pc-section__aside">Fait avec soin, pour vous</span>
      </div>
      <div className="pc-prose">
        <p>
          Parents Connectés rassemble des repères simples pour les parents d'enfants de 0 à 3 ans :
          conseils, défis de la semaine, quiz et activités à partager.
        </p>
        <h2>Crédits</h2>
        <dl>
          <dt>Conçu par</dt>
          <dd>Rajae Makhfi · <a href={`mailto:${DESIGNER_EMAIL}`}>{DESIGNER_EMAIL}</a></dd>
          <dt>Développé par</dt>
          <dd>Bryam Rishing Silva</dd>
        </dl>
        <h2>Nous contacter</h2>
        <ul>
          <li>E-mail : <a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
          <li>
            LinkedIn : <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
              Bryam Rishing Silva<span className="pc-visually-hidden"> (s'ouvre dans un nouvel onglet)</span>
            </a>
          </li>
        </ul>
        <p>
          Voir aussi les <Link to="/mentions-legales">mentions légales</Link> et
          la <Link to="/confidentialite">politique de confidentialité</Link>.
        </p>
      </div>
    </section>
  );
}
