import ApiImage from './ApiImage.jsx';

// Photo enregistrée (servie par l'API) ou photo locale pas encore envoyée (aperçu).
export default function Img({ image, alt }) {
  const text = alt ?? image.alt_text ?? image.alt ?? '';
  return image.preview ? <img src={image.preview} alt={text} /> : <ApiImage id={image.id} alt={text} />;
}
