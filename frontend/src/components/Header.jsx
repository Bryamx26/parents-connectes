import Icon from './Icon.jsx';

export default function Header() {
  return (
    <header className="pc-header">
      <a className="pc-icon-btn" href="/" aria-label="Accueil"><Icon name="home" /></a>
      <div className="pc-header__brand">
        <div className="pc-header__logo">Parents Connectés</div>
        <div className="pc-header__tagline">Des repères aujourd'hui pour un meilleur demain !</div>
      </div>
      <nav className="pc-header__actions">
        <button className="pc-icon-btn" type="button" aria-label="Rechercher"><Icon name="search" /></button>
        <button className="pc-icon-btn" type="button" aria-label="Notifications"><Icon name="bell" /></button>
        <button className="pc-icon-btn" type="button" aria-label="Menu"><Icon name="menu" /></button>
      </nav>
    </header>
  );
}
