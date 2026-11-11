import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
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
        <Hero />
        <Feed />
        <div className="pc-duo pc-duo--wide">
          <Rules />
          <Challenge />
        </div>
        <div className="pc-duo">
          <Quiz />
          <Takeaways />
        </div>
      </main>
      <Footer />
    </>
  );
}
