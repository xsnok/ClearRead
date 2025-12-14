import { useState } from "react";
import GameSelector from "./games/GameSelector.jsx";
import SyllableGame from "./games/SyllableGame.jsx";
import LetterSoundGame from "./games/LetterSoundGame.jsx";
import Dashboard from "./games/Dashboard.jsx";
import PageTransition from "./components/PageTransition.jsx";
import GradientBackground from "./components/GradientBackground.jsx";

function App() {
  const [currentGame, setCurrentGame] = useState(null);

  const handleSelectGame = (gameId) => {
    setCurrentGame(gameId);
  };

  const handleBack = () => {
    setCurrentGame(null);
  };

  // Render game selector or selected game
  if (currentGame === null) {
    return (
      <>
        <GradientBackground />
        <PageTransition key="selector">
          <GameSelector onSelectGame={handleSelectGame} />
        </PageTransition>
      </>
    );
  }

  // Route to specific games
  let gameComponent;
  switch (currentGame) {
    case "syllable":
      gameComponent = <SyllableGame onBack={handleBack} />;
      break;
    case "lettersound":
      gameComponent = <LetterSoundGame onBack={handleBack} />;
      break;
    case "dashboard":
      gameComponent = <Dashboard onBack={handleBack} />;
      break;
    default:
      gameComponent = <GameSelector onSelectGame={handleSelectGame} />;
  }

  return (
    <>
      <GradientBackground />
      <PageTransition key={currentGame}>{gameComponent}</PageTransition>
    </>
  );
}

export default App;
