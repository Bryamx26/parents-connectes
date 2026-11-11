// Icônes de assets/icones/ insérées en ligne pour hériter de currentColor.
const files = import.meta.glob('../../../assets/icones/*.svg', { query: '?raw', import: 'default', eager: true });
const icons = Object.fromEntries(
  Object.entries(files).map(([path, svg]) => [path.match(/([\w-]+)\.svg$/)[1], svg.replace(/^<svg[^>]*>|<\/svg>\s*$/g, '')])
);

export default function Icon({ name, size }) {
  return (
    <svg
      className={size ? `pc-icon pc-icon--${size}` : 'pc-icon'}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  );
}
