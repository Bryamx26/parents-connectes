import Icon from './Icon.jsx';
import ContentCard from './ContentCard.jsx';
import LikeButton from './LikeButton.jsx';
import { Empty, Loading, LoadError } from './States.jsx';
import { postArt } from '../illustrations.js';
import { useApi } from '../lib/useApi.js';
import { Link } from '../lib/router.jsx';

// Pastels alternés (DESIGN.md) : la table publications n'a pas de thème.
const THEMES = ['pink', 'sky', 'green'];

function PostActions({ post }) {
  return (
    <>
      <LikeButton publication={post} />
      <Link className="pc-action" to={`/publications/${post.id}`}>
        <Icon name="comment" /> {post.comment_count ? `Commentaires · ${post.comment_count}` : 'Commenter'}
      </Link>
    </>
  );
}

export default function Feed() {
  const list = useApi('/publications?limit=3');

  return (
    <section className="pc-section" aria-labelledby="fil-titre">
      <div className="pc-section__head">
        <Icon name="send" size="lg" />
        <h2 className="pc-section__title" id="fil-titre">Fil d'actualités</h2>
        <span className="pc-section__aside">Des idées, des conseils, pour le quotidien !</span>
      </div>

      {list.status === 'loading' && <Loading label="Chargement des publications" />}
      {list.status === 'error' && <LoadError onRetry={list.reload}>Le fil n'a pas pu se charger. Vérifiez votre connexion puis réessayez.</LoadError>}
      {list.status === 'ready' && list.data.length === 0 && <Empty>Pas encore de publication. Revenez bientôt, de nouvelles idées arrivent !</Empty>}
      {list.status === 'ready' && list.data.length > 0 && (
        <div className="pc-feed">
          {list.data.map((post, i) => (
            <ContentCard key={post.id} item={post} theme={THEMES[i % THEMES.length]} icon="family"
              art={postArt[i % postArt.length]} footer={<PostActions post={post} />}>
              <p className="pc-post__text">{post.content}</p>
            </ContentCard>
          ))}
        </div>
      )}
    </section>
  );
}
