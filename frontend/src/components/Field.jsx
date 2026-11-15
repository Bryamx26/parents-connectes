// Champ de formulaire : label visible, aide et erreur reliées au champ pour les lecteurs d'écran.
import Icon from './Icon.jsx';

export default function Field({ as: Tag = 'input', id, label, hint, error, children, ...props }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="pc-field">
      <label className="pc-field__label" htmlFor={id}>{label}</label>
      <Tag id={id} name={id} className="pc-input" aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy} {...props}>
        {children}
      </Tag>
      {hint && <p className="pc-field__hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="pc-field__error" id={`${id}-error`}><Icon name="close" size="sm" /> {error}</p>}
    </div>
  );
}
