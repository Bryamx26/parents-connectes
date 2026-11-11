// Illustrations « dessin au crayon » de assets/illustrations/ (format 16/10 pour les posts).
import parentChildReading from '../../assets/illustrations/parent-child-reading.svg';
import buildingBlocks from '../../assets/illustrations/building-blocks.svg';
import sleepingChild from '../../assets/illustrations/sleeping-child.svg';
import childDrawing from '../../assets/illustrations/child-drawing.svg';
import kidsReading from '../../assets/illustrations/kids-reading-book.webp';
import trophy from '../../assets/illustrations/trophy.svg';
import bulb from '../../assets/illustrations/bulb.svg';

export const heroArt = { src: parentChildReading, alt: 'Une maman lit un livre à son enfant, blottis sur le canapé.' };
// Petits dessins décoratifs des titres de section (alt vide : le titre suffit).
export const sectionArt = { trophy, bulb };

export const challengeArt = { src: kidsReading, alt: 'Deux enfants lisent un livre ensemble.' };

// Illustration d'un post du fil, choisie d'après son icône (colonne `icon` de la table posts).
export const postArt = {
  family: { src: buildingBlocks, alt: 'Un papa et son enfant construisent une tour de blocs.' },
  moon: { src: sleepingChild, alt: 'Un enfant dort paisiblement avec son doudou, sous la lune.' },
  puzzle: { src: childDrawing, alt: 'Un enfant dessine avec des crayons de couleur.' },
};
