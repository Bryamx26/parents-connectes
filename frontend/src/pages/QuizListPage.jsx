import Icon from '../components/Icon.jsx';
import { Empty, Loading, LoadError } from '../components/States.jsx';
import { useApi } from '../lib/useApi.js';
import { Link } from '../lib/router.jsx';

export default function QuizListPage() {
  const list = useApi('/quizzes?limit=50');
  return (
    <section className="pc-section pc-section--lavender" aria-labelledby="page-titre">
      <div className="pc-section__head pc-section__head--lavender">
        <Icon name="question" size="lg" />
        <h1 className="pc-section__title" id="page-titre">Quiz des parents</h1>
        <span className="pc-section__aside">Testez vos connaissances !</span>
      </div>
      <p className="pc-section__lead">Quelques questions, sans piège ni jugement, pour faire le point en quelques minutes.</p>

      {list.status === 'loading' && <Loading label="Chargement des quiz" count={2} />}
      {list.status === 'error' && <LoadError onRetry={list.reload} />}
      {list.status === 'ready' && list.data.length === 0 && <Empty>Pas encore de quiz. Revenez bientôt !</Empty>}
      {list.status === 'ready' && list.data.length > 0 && (
        <div className="pc-cards">
          {list.data.map((quiz) => (
            <article key={quiz.id} className="pc-quiz-card">
              <h2 className="pc-pill-title pc-pill-title--lavender">{quiz.title}</h2>
              {quiz.description && <p className="pc-quiz-card__text">{quiz.description}</p>}
              {!quiz.is_published && <span className="pc-badge pc-badge--yellow">Brouillon, visible par l'équipe</span>}
              <Link className="pc-btn" to={`/quiz/${quiz.id}`}>Commencer <Icon name="chevron-right" size="sm" /></Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
