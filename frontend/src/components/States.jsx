// États de chargement, vide et erreur, communs à toutes les listes.
export function Loading({ label, count = 3 }) {
  return (
    <div className="pc-cards" aria-busy="true" aria-label={label}>
      {Array.from({ length: count }, (_, i) => <div key={i} className="pc-skeleton" />)}
    </div>
  );
}

export function LoadError({ onRetry, children = "Le contenu n'a pas pu se charger. Vérifiez votre connexion puis réessayez." }) {
  return (
    <div className="pc-feed-message" role="alert">
      <p>{children}</p>
      {onRetry && <button className="pc-btn pc-btn--soft" type="button" onClick={onRetry}>Réessayer</button>}
    </div>
  );
}

export function Empty({ children, action }) {
  return (
    <div className="pc-feed-message">
      <p>{children}</p>
      {action}
    </div>
  );
}
