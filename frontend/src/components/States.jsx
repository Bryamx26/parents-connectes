// États de chargement, vide et erreur, communs à toutes les listes.
// Squelette en forme de carte : la page garde sa mise en page pendant le chargement.
export function Skeleton({ media = true }) {
  return (
    <div className="pc-skeleton pc-skeleton--card" aria-hidden="true">
      <div className="pc-skeleton__head">
        <span className="pc-skeleton__circle" />
        <span className="pc-skeleton__line pc-skeleton__line--short" />
      </div>
      {media && <span className="pc-skeleton__media" />}
      <span className="pc-skeleton__line pc-skeleton__line--title" />
      <span className="pc-skeleton__line" />
      <span className="pc-skeleton__line pc-skeleton__line--short" />
    </div>
  );
}

export function Loading({ label, count = 3 }) {
  return (
    <div className="pc-cards" role="status" aria-busy="true">
      <span className="pc-visually-hidden">{label}…</span>
      {Array.from({ length: count }, (_, i) => <Skeleton key={i} />)}
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
