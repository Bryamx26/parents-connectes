import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

// Fenêtre modale sur <dialog> natif : focus enfermé, Échap, arrière-plan inerte.
// Se ferme aussi par la croix et par un clic hors du contenu ; bloque le défilement de la page.
export default function Modal({ onClose, labelledBy, size = 'large', children }) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    document.documentElement.classList.add('pc-scroll-lock');
    return () => {
      document.documentElement.classList.remove('pc-scroll-lock');
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={`pc-modal pc-modal--${size}`}
      aria-labelledby={labelledBy}
      onCancel={(e) => { e.preventDefault(); close.current(); }}
      onClick={(e) => { if (e.target === ref.current) close.current(); }}
    >
      <div className="pc-modal__content">
        <button className="pc-icon-btn pc-modal__close" type="button" aria-label="Fermer" onClick={() => close.current()}>
          <Icon name="close" />
        </button>
        {children}
      </div>
    </dialog>
  );
}
