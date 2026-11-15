export function when(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 864e5);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  return `Il y a ${days} jours`;
}

const years = (m) => `${m / 12} an${m > 12 ? 's' : ''}`;
const fmt = (m) => (m % 12 === 0 && m > 0 ? years(m) : `${m} mois`);

// « 6 – 12 mois », « 1 – 3 ans », « 18 mois – 3 ans »
export function ageRange(min, max) {
  if (max <= 12) return `${min} – ${max} mois`;
  if (min % 12 === 0 && max % 12 === 0) return `${min / 12} – ${max / 12} ans`;
  return `${fmt(min)} – ${fmt(max)}`;
}

// Tranches d'âge du site (skill ux-ui) : bornes en mois pour le filtre de chevauchement.
export const AGE_BANDS = [
  { label: '0 – 6 mois', min: 0, max: 5 },
  { label: '6 – 12 mois', min: 6, max: 11 },
  { label: '1 – 2 ans', min: 12, max: 23 },
  { label: '2 – 3 ans', min: 24, max: 36 },
];

export const AGE_OPTIONS = [0, 3, 6, 9, 12, 18, 24, 30, 36].map((m) => ({ value: m, label: m === 0 ? 'Naissance' : fmt(m) }));
