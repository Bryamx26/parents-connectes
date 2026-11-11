import Icon from './Icon.jsx';
import { heroArt } from '../illustrations.js';

export default function Hero() {
  return (
    <section className="pc-hero pc-hero--split" aria-labelledby="hero-titre">
      <div className="pc-hero__content">
        <span className="pc-hero__deco"><Icon name="leaf" size="xl" /></span>
        <h1 className="pc-hero__title" id="hero-titre">Les écrans chez les enfants<br />de <em>0 à 3 ans</em></h1>
        <p className="pc-hero__text">Informer les parents pour accompagner leur enfant vers un usage équilibré des écrans.</p>
      </div>
      <figure className="pc-hero__media">
        <img src={heroArt.src} alt={heroArt.alt} width="242" height="204" />
        <figcaption className="pc-hero__note">
          Plus de moments vraiment ensemble ! <Icon name="heart" size="sm" />
        </figcaption>
      </figure>
    </section>
  );
}
