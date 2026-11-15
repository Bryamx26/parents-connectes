// Images de assets/illustrations/, reprises de la maquette (format 16/10 pour les posts).
import parentChildReading from '../../assets/illustrations/parent-child-reading.webp';
import buildingBlocks from '../../assets/illustrations/building-blocks.webp';
import sleepingChild from '../../assets/illustrations/sleeping-child.webp';
import childDrawing from '../../assets/illustrations/child-drawing.webp';
import kidsReading from '../../assets/illustrations/kids-reading-book.webp';
import trophy from '../../assets/illustrations/trophy.webp';
import bulb from '../../assets/illustrations/bulb.webp';

export const heroArt = { src: parentChildReading, alt: 'Une maman souriante lit un livre avec sa fille sur ses genoux.' };

// Petits dessins décoratifs des titres de section (alt vide : le titre suffit).
export const sectionArt = { trophy, bulb };

export const challengeArt = { src: kidsReading, alt: 'Deux enfants lisent un livre ensemble.' };

// Illustrations des posts du fil, en rotation tant que les publications n'ont pas leurs propres images.
export const postArt = [
  { src: buildingBlocks, alt: 'Un papa et sa fille construisent avec des blocs en bois.' },
  { src: sleepingChild, alt: 'Une petite fille dort paisiblement avec son doudou.' },
  { src: childDrawing, alt: 'Une petite fille dessine avec des crayons de couleur.' },
];
