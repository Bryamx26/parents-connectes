import Icon from './Icon.jsx';

export default function Footer() {
  return (
    <footer className="pc-footer pc-container">
      <span className="pc-footer__quote">
        Aujourd'hui, des choix équilibrés pour demain ! <span style={{ color: 'var(--pc-red-500)' }}><Icon name="heart" size="sm" /></span>
      </span>
      <Icon name="smile" />
      <span className="pc-footer__brand"><Icon name="family" /> Parents Connectés</span>
    </footer>
  );
}
