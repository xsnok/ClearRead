import { useState } from "react";
import GameSelector from "./games/GameSelector.jsx";
import SyllableGame from "./games/SyllableGame.jsx";
import LetterSoundGame from "./games/LetterSoundGame.jsx";

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
    return <GameSelector onSelectGame={handleSelectGame} />;
  }

  // Route to specific games
  switch (currentGame) {
    case "syllable":
      return <SyllableGame onBack={handleBack} />;
    case "lettersound":
      return <LetterSoundGame onBack={handleBack} />;
    default:
      return <GameSelector onSelectGame={handleSelectGame} />;
  }
}

export default App;
