import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import Img from './Img.jsx';

// Carrousel de photos : boutons, compteur, et flèches du clavier (sauf pendant une saisie).
export default function Carousel({ images, label, start = 0 }) {
  const [index, setIndex] = useState(start);
  const count = images.length;
  const go = (delta) => setIndex((i) => (i + delta + count) % count);

  useEffect(() => {
    if (count < 2) return undefined;
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select')) return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count]);

  if (!count) return null;
  const image = images[Math.min(index, count - 1)];
  return (
    <section className="pc-carousel" aria-roledescription="carrousel" aria-label={label}>
      <div className="pc-carousel__frame">
        <Img key={image.id ?? image.key} image={image} />
      </div>
      {count > 1 && (
        <div className="pc-carousel__nav">
          <button className="pc-icon-btn pc-carousel__btn" type="button" aria-label="Photo précédente" onClick={() => go(-1)}>
            <span className="pc-icon--flip"><Icon name="chevron-right" /></span>
          </button>
          <p className="pc-carousel__count" aria-live="polite">Photo {index + 1} sur {count}</p>
          <button className="pc-icon-btn pc-carousel__btn" type="button" aria-label="Photo suivante" onClick={() => go(1)}>
            <Icon name="chevron-right" />
          </button>
        </div>
      )}
    </section>
  );
}

// Galerie de vignettes ; un clic agrandit la photo dans un carrousel plein écran.
export function Gallery({ images, label, onOpen }) {
  if (!images.length) return null;
  return (
    <ul className="pc-gallery" aria-label={label}>
      {images.map((image, i) => (
        <li key={image.id ?? image.key}>
          <button className="pc-gallery__item" type="button" onClick={() => onOpen(i)}
            aria-label={`Agrandir la photo ${i + 1}${image.alt_text || image.alt ? ` : ${image.alt_text || image.alt}` : ''}`}>
            <Img image={image} alt="" />
          </button>
        </li>
      ))}
    </ul>
  );
}
