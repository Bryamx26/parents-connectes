import { createContext, useCallback, useContext, useState } from 'react';
import Modal from '../components/Modal.jsx';

// Confirmation dans une fenêtre du site (pas window.confirm) : const ok = await confirm({ ... }).
const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);

  const confirm = useCallback((options) => new Promise((resolve) => setRequest({ ...options, resolve })), []);
  const answer = (value) => {
    request.resolve(value);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <Modal onClose={() => answer(false)} labelledBy="confirm-titre" size="small">
          <div className="pc-confirm">
            <h2 className="pc-confirm__title" id="confirm-titre">{request.title}</h2>
            {request.message && <p className="pc-confirm__text">{request.message}</p>}
            <div className="pc-form__actions">
              <button className="pc-btn" type="button" onClick={() => answer(true)}>{request.confirmLabel ?? 'Confirmer'}</button>
              <button className="pc-btn pc-btn--soft" type="button" autoFocus onClick={() => answer(false)}>{request.cancelLabel ?? 'Annuler'}</button>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
