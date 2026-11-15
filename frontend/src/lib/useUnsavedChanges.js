import { useEffect } from 'react';
import { setBlocker } from './router.jsx';
import { useConfirm } from './confirm.jsx';

// Modifications non enregistrées : confirmation avant une navigation interne (liens, retour)
// et avertissement natif du navigateur à la fermeture ou au rechargement de l'onglet.
export function useUnsavedChanges(dirty) {
  const confirm = useConfirm();
  useEffect(() => {
    if (!dirty) return undefined;
    const onUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onUnload);
    setBlocker(async (proceed) => {
      const ok = await confirm({
        title: 'Quitter sans enregistrer ?',
        message: 'Vos modifications seront perdues.',
        confirmLabel: 'Quitter la page',
        cancelLabel: 'Rester',
      });
      if (ok) proceed();
    });
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      setBlocker(null);
    };
  }, [dirty, confirm]);
}
