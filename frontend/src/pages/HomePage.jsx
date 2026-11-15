import Hero from '../components/Hero.jsx';
import Feed from '../components/Feed.jsx';
import Rules from '../components/Rules.jsx';
import Challenge from '../components/Challenge.jsx';
import Quiz from '../components/Quiz.jsx';
import Takeaways from '../components/Takeaways.jsx';

export default function HomePage() {
  return (
    <>
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
    </>
  );
}
