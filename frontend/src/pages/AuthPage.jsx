import { useState } from 'react';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { Link, navigate, safeReturn, useLocation } from '../lib/router.jsx';

// Connexion et inscription sur une même page ; connecté, elle sert de « Mon compte ».
export default function AuthPage({ mode }) {
  const { user, signIn, signOut } = useAuth();
  const { params } = useLocation();
  const back = safeReturn(params.get('retour'));
  const [state, setState] = useState({ busy: false, errors: {}, message: null });
  const register = mode === 'register';
  const keepReturn = back ? `?retour=${encodeURIComponent(back)}` : '';

  async function submit(e) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const body = { email: d.get('email'), password: d.get('password') };
    if (register) body.name = d.get('name');
    setState({ busy: true, errors: {}, message: null });
    try {
      signIn(await api(register ? '/auth/register' : '/auth/login', { method: 'POST', body }));
      navigate(back ?? '/publications');
    } catch (err) {
      const message = err.status === 401 ? "L'e-mail ou le mot de passe ne correspond pas. Vérifiez-les puis réessayez." : err.message;
      setState({ busy: false, errors: err.fields ?? {}, message });
    }
  }

  if (user) {
    return (
      <section className="pc-section pc-form--narrow" aria-labelledby="page-titre">
        <div className="pc-section__head pc-section__head--sky">
          <Icon name="user" size="lg" />
          <h1 className="pc-section__title" id="page-titre">Mon compte</h1>
        </div>
        <div className="pc-form">
          <p className="pc-alert pc-alert--success"><Icon name="check-circle" /> Vous êtes connecté·e en tant que {user.name} ({user.email}).</p>
          <div className="pc-form__actions">
            <Link className="pc-btn" to="/publications">Voir les publications</Link>
            <button className="pc-btn pc-btn--soft" type="button" onClick={signOut}>Se déconnecter</button>
          </div>
        </div>
      </section>
    );
  }

  const { errors } = state;
  return (
    <section className="pc-section pc-form--narrow" aria-labelledby="page-titre">
      <div className="pc-section__head pc-section__head--sky">
        <Icon name="user" size="lg" />
        <h1 className="pc-section__title" id="page-titre">{register ? 'Créer un compte' : 'Connexion'}</h1>
        <span className="pc-section__aside">Bienvenue !</span>
      </div>
      <form className="pc-form" onSubmit={submit}>
        {state.message && <p className="pc-alert" role="alert"><Icon name="question" /> {state.message}</p>}
        {register && <Field id="name" label="Votre prénom" autoComplete="given-name" required maxLength={100} error={errors.name} />}
        <Field id="email" type="email" label="Adresse e-mail" autoComplete="email" required maxLength={255} error={errors.email} />
        <Field id="password" type="password" label="Mot de passe" required minLength={register ? 8 : 1} maxLength={128}
          autoComplete={register ? 'new-password' : 'current-password'}
          hint={register ? '8 caractères minimum.' : undefined} error={errors.password} />
        {register && (
          <p className="pc-form__switch">
            En créant un compte, vous acceptez les <Link to="/cgu">conditions d'utilisation</Link> et confirmez
            avoir lu la <Link to="/confidentialite">politique de confidentialité</Link>.
          </p>
        )}
        <button className="pc-btn" type="submit" disabled={state.busy}>
          {state.busy ? 'Un instant…' : register ? 'Créer mon compte' : 'Se connecter'}
        </button>
        <p className="pc-form__switch">
          {register ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
          <Link to={`${register ? '/connexion' : '/inscription'}${keepReturn}`}>{register ? 'Se connecter' : 'Créer un compte'}</Link>
        </p>
      </form>
    </section>
  );
}
