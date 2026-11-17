import { useEffect, useRef } from 'react';
import Header from './components/Header.jsx';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import PublicationsPage from './pages/PublicationsPage.jsx';
import ActivitiesPage from './pages/ActivitiesPage.jsx';
import ActivityPage from './pages/ActivityPage.jsx';
import ActivityEditorPage from './pages/ActivityEditorPage.jsx';
import QuizListPage from './pages/QuizListPage.jsx';
import QuizPlayPage from './pages/QuizPlayPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import { LegalNoticePage, PrivacyPage, CookiesPage, TermsPage } from './pages/LegalPages.jsx';
import { Empty } from './components/States.jsx';
import { Link, useLocation } from './lib/router.jsx';

function route(path) {
  const m = (re) => path.match(re)?.[1];
  let id;
  if ((id = m(/^\/quiz\/(\d+)$/))) return ['Quiz', <QuizPlayPage key={id} id={id} />];
  // La grille reste affichée sous le modal : même clé, pas de rechargement de la liste.
  if ((id = m(/^\/publications\/(\d+)$/))) return ['Publication', <PublicationsPage key="publications" openId={id} />];
  if ((id = m(/^\/activites\/(\d+)\/modifier$/))) return ["Modifier l'activité", <ActivityEditorPage key={`edit-${id}`} id={id} />];
  if ((id = m(/^\/activites\/(\d+)$/))) return ['Activité', <ActivityPage key={id} id={id} />];
  switch (path) {
    case '/': return [null, <HomePage />];
    case '/publications': return ['Publications', <PublicationsPage key="publications" />];
    case '/activites': return ['Activités', <ActivitiesPage />];
    case '/activites/nouvelle': return ['Nouvelle activité', <ActivityEditorPage key="new" />];
    case '/quiz': return ['Quiz', <QuizListPage />];
    case '/connexion': return ['Connexion', <AuthPage mode="login" />];
    case '/inscription': return ['Créer un compte', <AuthPage mode="register" />];
    case '/a-propos': return ['À propos', <AboutPage />];
    case '/mentions-legales': return ['Mentions légales', <LegalNoticePage />];
    case '/confidentialite': return ['Politique de confidentialité', <PrivacyPage />];
    case '/cookies': return ['Politique de cookies', <CookiesPage />];
    case '/cgu': return ["Conditions générales d'utilisation", <TermsPage />];
    default: return ['Page introuvable', (
      <Empty action={<Link className="pc-btn" to="/">Retour à l'accueil</Link>}>Cette page n'existe pas ou a changé d'adresse.</Empty>
    )];
  }
}

export default function App() {
  const { path } = useLocation();
  const [title, page] = route(path);
  const main = useRef(null);
  const previous = useRef(path);

  useEffect(() => {
    document.title = title ? `${title} · Parents Connectés` : 'Parents Connectés';
    // Changement de page : le focus va au contenu, pour les lecteurs d'écran et le clavier.
    // (comparaison au chemin précédent : le double rendu de StrictMode ne doit pas voler le focus au chargement)
    const modalOnly = [previous.current, path].every((p) => p.startsWith('/publications'));
    if (previous.current !== path) {
      previous.current = path;
      if (!modalOnly) main.current?.focus({ preventScroll: true });
    }
  }, [path, title]);

  return (
    <div className="pc-app">
      <Header />
      <Nav path={path} />
      <main className="pc-container pc-page" ref={main} tabIndex={-1}>
        {page}
      </main>
      <Footer />
    </div>
  );
}
