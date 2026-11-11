import Header from './components/Header.jsx';
import Feed from './components/Feed.jsx';
import Rules from './components/Rules.jsx';
import Challenge from './components/Challenge.jsx';
import Quiz from './components/Quiz.jsx';
import Takeaways from './components/Takeaways.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main className="pc-container pc-page">
        <section className="pc-hero">
          <h1 className="pc-hero__title">Les écrans chez les enfants<br />de <em>0 à 3 ans</em></h1>
          <p className="pc-hero__text">Informer les parents pour accompagner leur enfant vers un usage équilibré des écrans.</p>
        </section>
        <Feed />
        <Rules />
        <div className="pc-duo">
          <Challenge />
          <Quiz />
        </div>
        <Takeaways />
      </main>
      <Footer />
    </>
  );
}
