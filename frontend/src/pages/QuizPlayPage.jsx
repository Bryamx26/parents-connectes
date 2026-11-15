import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Loading, LoadError } from '../components/States.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { useAuth } from '../lib/auth.jsx';
import { Link } from '../lib/router.jsx';

export default function QuizPlayPage({ id }) {
  const { user } = useAuth();
  const quiz = useApi(`/quizzes/${id}`);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState({ busy: false, error: null });

  const head = (title) => (
    <div className="pc-section__head pc-section__head--lavender">
      <Icon name="question" size="lg" />
      <h1 className="pc-section__title" id="page-titre">{title}</h1>
    </div>
  );
  const wrap = (children, title = 'Quiz') => (
    <section className="pc-section pc-section--lavender" aria-labelledby="page-titre">{head(title)}{children}</section>
  );

  if (quiz.status === 'loading') return wrap(<Loading label="Chargement du quiz" count={1} />);
  if (quiz.status === 'error') {
    return wrap(quiz.error.status === 404
      ? <LoadError>Ce quiz n'existe pas ou n'est plus disponible. <Link to="/quiz">Voir les autres quiz</Link></LoadError>
      : <LoadError onRetry={quiz.reload} />);
  }

  const { title, description, questions } = quiz.data;
  if (!user) {
    return wrap(
      <div className="pc-quiz">
        {description && <p className="pc-quiz-card__text">{description}</p>}
        <p className="pc-alert pc-alert--info">
          <Icon name="user" /> Connectez-vous pour répondre et connaître votre score.
          <Link className="pc-btn" to={`/connexion?retour=/quiz/${id}`}>Se connecter</Link>
        </p>
      </div>, title);
  }
  if (!questions.length) return wrap(<LoadError>Ce quiz n'a pas encore de question. Revenez bientôt !</LoadError>, title);

  function restart() {
    setStep(0);
    setAnswers({});
    setResult(null);
  }

  if (result) {
    const perfect = result.score === result.total;
    return wrap(
      <div className="pc-quiz pc-score" role="status">
        <p className="pc-score__value">{result.score} / {result.total}</p>
        <p>{perfect ? 'Bravo, tout est juste !' : "Merci d'avoir participé ! Chaque question est une occasion d'en apprendre un peu plus."}</p>
        <div className="pc-form__actions">
          <Link className="pc-btn" to="/quiz">Voir les autres quiz</Link>
          <button className="pc-btn pc-btn--soft" type="button" onClick={restart}>Recommencer</button>
        </div>
      </div>, title);
  }

  const question = questions[step];
  const last = step === questions.length - 1;

  async function next(e) {
    e.preventDefault();
    if (!last) return setStep(step + 1);
    setSending({ busy: true, error: null });
    try {
      const body = { answers: questions.map((q) => ({ question_id: q.id, choice_id: answers[q.id] })) };
      setResult(await api(`/quizzes/${id}/results`, { method: 'POST', body }));
      setSending({ busy: false, error: null });
    } catch (err) {
      setSending({ busy: false, error: err.message });
    }
  }

  return wrap(
    <form className="pc-quiz" onSubmit={next}>
      <div className="pc-progress">
        <span>Question {step + 1} sur {questions.length}</span>
        <div className="pc-progress__bar" aria-hidden="true"><span style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
      </div>
      <fieldset className="pc-quiz__form" key={question.id}>
        <legend className="pc-quiz__question"><Icon name="question" /> {question.label}</legend>
        {question.choices.map((c) => (
          <label key={c.id} className="pc-radio">
            <input type="radio" name={`q${question.id}`} value={c.id} checked={answers[question.id] === c.id}
              onChange={() => setAnswers({ ...answers, [question.id]: c.id })} /> {c.label}
          </label>
        ))}
      </fieldset>
      {sending.error && <p className="pc-alert" role="alert"><Icon name="question" /> {sending.error}</p>}
      <div className="pc-form__actions">
        <button className="pc-btn" type="submit" disabled={!answers[question.id] || sending.busy}>
          {last ? 'Voir mon score' : 'Question suivante'}
        </button>
        {step > 0 && <button className="pc-btn pc-btn--soft" type="button" onClick={() => setStep(step - 1)}>Précédente</button>}
      </div>
    </form>, title);
}
