import Icon from './Icon.jsx';

// Filtre à bascule (aria-pressed + coche : l'état ne passe pas que par la couleur).
export function Chip({ pressed, onClick, children }) {
  return (
    <button className="pc-chip" type="button" aria-pressed={pressed} onClick={onClick}>
      {pressed && <Icon name="check" size="sm" />} {children}
    </button>
  );
}
