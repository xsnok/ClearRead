import { useState, useRef } from "react";
import callGemini from "../ai.js";
import { speakText } from "../utils/speech.js";
import { recordSession } from "../utils/stats.js";
import easyWords from "../data/easy.json";
import mediumWords from "../data/medium.json";
import hardWords from "../data/hard.json";

// Sound tile component - just a speaker icon
function SoundTile({ sound, index, isMatched, isSelected, onClick, onSpeak }) {
  const handleClick = (e) => {
    e.stopPropagation();
    // Play sound when clicked - use readablePhonetic which sounds like it does in the word
    const textToSpeak =
      sound.readablePhonetic ||
      sound.grapheme ||
      sound.phoneme.replace(/[\/\[\]]/g, "");
    onSpeak(textToSpeak);
    onClick(index);
  };

  if (isMatched) {
    return (
      <div className="w-16 h-16 bg-gray-200 rounded-xl cursor-not-allowed opacity-30 transition-all flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`w-16 h-16 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-110 hover:shadow-xl flex items-center justify-center ${
        isSelected
          ? "ring-4 ring-yellow-400 ring-offset-2 scale-110"
          : "opacity-100"
      }`}
      title="Click to hear sound and select"
    >
      <svg
        className="w-10 h-10 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
        />
      </svg>
    </div>
  );
}

// Letter tile component
function LetterTile({ letter, index, isMatched, isSelected, onClick }) {
  if (isMatched) {
    return (
      <div className="px-6 py-4 bg-gray-200 text-gray-400 rounded-xl font-bold text-xl cursor-not-allowed opacity-30 transition-all">
        {letter.grapheme}
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(index)}
      className={`px-6 py-4 bg-linear-to-br from-purple-500 to-pink-600 text-white rounded-xl font-bold text-xl shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${
        isSelected
          ? "ring-4 ring-yellow-400 ring-offset-2 scale-105"
          : "opacity-100"
      }`}
      title="Click to match with selected sound"
    >
      {letter.grapheme}
    </div>
  );
}

// Match pair component
function MatchPair({ pair, onUnmatch, onSpeak }) {
  const handleSpeak = (e) => {
    e.stopPropagation();
    // Use readablePhonetic which sounds like it does in the word
    const textToSpeak = pair.sound.readablePhonetic || pair.letter.grapheme;
    onSpeak(textToSpeak);
  };

  return (
    <div
      onClick={onUnmatch}
      className={`px-6 py-4 rounded-xl font-bold text-lg shadow-lg cursor-pointer transition-all hover:scale-105 flex items-center gap-3 ${
        pair.isCorrect
          ? "bg-emerald-100 border-2 border-emerald-400 text-emerald-800"
          : "bg-red-100 border-2 border-red-400 text-red-800"
      }`}
      title="Click to unmatch"
    >
      <button
        onClick={handleSpeak}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 flex items-center justify-center transition-all"
        title="Hear sound"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      </button>
      <span className="text-xl">→</span>
      <span className="bg-purple-500 text-white px-4 py-2 rounded text-xl">
        {pair.letter.grapheme}
      </span>
      {pair.isCorrect ? (
        <svg
          className="w-5 h-5 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
    </div>
  );
}

export default function LetterSoundGame({ onBack }) {
  const [wordsInput, setWordsInput] = useState("");
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [availableSounds, setAvailableSounds] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedSoundIndex, setSelectedSoundIndex] = useState(null);
  const [selectedLetterIndex, setSelectedLetterIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const gameStartTime = useRef(null);
  const wordResults = useRef([]); // Track correct/incorrect for each word

  const letterSoundSchema = {
    type: "object",
    properties: {
      words: {
        type: "array",
        description: "Array of word objects with their letter-sound breakdowns",
        items: {
          type: "object",
          properties: {
            word: {
              type: "string",
              description: "The original word",
            },
            phoneticSpelling: {
              type: "string",
              description:
                "The phonetic spelling of the entire word (e.g., /ʃɪp/ or ship)",
            },
            letterSounds: {
              type: "array",
              description:
                "Array of letter-sound pairs. Each pair should identify the grapheme (letter or letter combination like sh, th, ch, qu) and its corresponding phoneme (sound).",
              items: {
                type: "object",
                properties: {
                  grapheme: {
                    type: "string",
                    description:
                      "The letter(s) - can be a single letter or letter combination (e.g., 'sh', 'th', 'ch', 'qu', 'ck', 'ng')",
                  },
                  phoneme: {
                    type: "string",
                    description:
                      "The sound this grapheme makes in this word in IPA notation (e.g., '/ʃ/', '/ɪ/', '/p/')",
                  },
                  readablePhonetic: {
                    type: "string",
                    description:
                      "A phonetic spelling that text-to-speech can read to pronounce this sound as it appears in the word. Use simple phonetic spelling like 'shuh' for /ʃ/, 'ih' for /ɪ/, 'puh' for /p/. This should sound like how the letter(s) sound in the context of this specific word.",
                  },
                  position: {
                    type: "number",
                    description:
                      "The position of this grapheme in the word (0-indexed)",
                  },
                },
                required: [
                  "grapheme",
                  "phoneme",
                  "readablePhonetic",
                  "position",
                ],
              },
            },
          },
          required: ["word", "phoneticSpelling", "letterSounds"],
        },
      },
    },
    required: ["words"],
  };

  // Scramble array function
  const scrambleArray = (array) => {
    const scrambled = [...array];
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    return scrambled;
  };

  // Process multiple words in a single API call
  const processMultipleWords = async (wordsList) => {
    if (wordsList.length === 0) {
      return [];
    }

    try {
      const wordsString = wordsList.map((w) => w.trim()).join(", ");
      const prompt = `Break each of the following words into letter-sound pairs: ${wordsString}. 

For each word:
1. Provide the phonetic spelling of the entire word
2. Break down the word into graphemes (letters or letter combinations) and their corresponding phonemes (sounds)
3. Identify letter combinations that make single sounds (like sh, ch, th, ph, wh, ck, ng, qu, tch, dge)
4. For each grapheme, provide:
   - Its phoneme in IPA notation (e.g., '/ʃ/')
   - A readablePhonetic field: a simple phonetic spelling that text-to-speech can read to pronounce the sound as it appears in THIS word. For example, 'sh' in 'ship' should have readablePhonetic like 'shuh' (sounding like it does in 'ship'), not just 'sh'. Use phonetic spellings like 'shuh', 'ih', 'puh', 'chuh', 'thuh', etc.
   - Its position in the word

Return a JSON object with an array of word objects, where each object contains:
- 'word': the original word
- 'phoneticSpelling': the phonetic spelling of the entire word
- 'letterSounds': an array of objects with 'grapheme', 'phoneme', 'readablePhonetic', and 'position' fields`;

      const result = await callGemini(prompt, letterSoundSchema);

      if (result.words && Array.isArray(result.words)) {
        const processedWords = result.words.map((item) => ({
          word: item.word.trim(),
          phoneticSpelling: item.phoneticSpelling || item.word.trim(),
          letterSounds: item.letterSounds.map((ls) => ({
            grapheme: ls.grapheme,
            phoneme: ls.phoneme,
            readablePhonetic: ls.readablePhonetic || ls.grapheme,
            position: ls.position,
          })),
        }));

        if (processedWords.length !== wordsList.length) {
          console.warn(
            `Expected ${wordsList.length} words but got ${processedWords.length}`
          );
        }

        return processedWords;
      } else {
        throw new Error("Invalid response format: expected 'words' array");
      }
    } catch (err) {
      throw new Error(`Failed to process words: ${err.message}`);
    }
  };

  const handleStartGame = async (difficulty = null) => {
    setLoading(true);
    setError("");
    setMatchedPairs([]);
    setSelectedSoundIndex(null);
    setSelectedLetterIndex(null);
    setAllCorrect(false);
    setSelectedDifficulty(difficulty);

    try {
      let processedWords = [];

      if (difficulty) {
        // Load from JSON file
        let wordData;
        switch (difficulty) {
          case "easy":
            wordData = easyWords;
            break;
          case "medium":
            wordData = mediumWords;
            break;
          case "hard":
            wordData = hardWords;
            break;
          default:
            throw new Error("Invalid difficulty level");
        }

        processedWords = wordData.words.map((item) => ({
          word: item.word.trim(),
          phoneticSpelling: item.phoneticSpelling || item.word.trim(),
          letterSounds: item.letterSounds.map((ls) => ({
            grapheme: ls.grapheme,
            phoneme: ls.phoneme,
            readablePhonetic: ls.readablePhonetic || ls.grapheme,
            position: ls.position,
          })),
        }));
      } else {
        // Custom input - process with Gemini
        if (!wordsInput.trim()) {
          setError("Please enter at least one word");
          setLoading(false);
          return;
        }

        const wordsList = wordsInput
          .split(/[,\n]/)
          .map((w) => w.trim())
          .filter((w) => w.length > 0);

        if (wordsList.length === 0) {
          setError("Please enter at least one word");
          setLoading(false);
          return;
        }

        processedWords = await processMultipleWords(wordsList);
      }

      if (processedWords.length === 0) {
        throw new Error("No words were successfully processed");
      }

      setWords(processedWords);
      setCurrentWordIndex(0);
      initializeGame(processedWords[0]);
      setGameStarted(true);
      // Initialize tracking
      gameStartTime.current = Date.now();
      wordResults.current = processedWords.map(() => false); // Initialize all as incorrect
    } catch (err) {
      setError(err.message || "Failed to process words");
    } finally {
      setLoading(false);
    }
  };

  const initializeGame = (word) => {
    const sounds = word.letterSounds.map((ls, idx) => ({
      grapheme: ls.grapheme,
      phoneme: ls.phoneme,
      readablePhonetic: ls.readablePhonetic || ls.grapheme,
      originalIndex: idx,
    }));
    const letters = word.letterSounds.map((ls, idx) => ({
      grapheme: ls.grapheme,
      phoneme: ls.phoneme,
      readablePhonetic: ls.readablePhonetic || ls.grapheme,
      originalIndex: idx,
    }));

    setAvailableSounds(scrambleArray(sounds));
    setAvailableLetters(scrambleArray(letters));
    setMatchedPairs([]);
    setSelectedSoundIndex(null);
    setSelectedLetterIndex(null);
    setAllCorrect(false);
  };

  const handleSoundClick = (index) => {
    if (selectedSoundIndex === index) {
      setSelectedSoundIndex(null);
    } else {
      setSelectedSoundIndex(index);
      setSelectedLetterIndex(null);
    }
  };

  const handleLetterClick = (index) => {
    if (selectedLetterIndex === index) {
      setSelectedLetterIndex(null);
    } else if (selectedSoundIndex !== null) {
      // Try to match
      const sound = availableSounds[selectedSoundIndex];
      const letter = availableLetters[index];

      // Check if they match (same originalIndex means they belong together)
      const isCorrect = sound.originalIndex === letter.originalIndex;

      // Create match pair
      const newPair = {
        sound: { ...sound },
        letter: { ...letter },
        isCorrect,
        soundIndex: selectedSoundIndex,
        letterIndex: index,
      };

      // Add to matched pairs
      setMatchedPairs([...matchedPairs, newPair]);

      // Remove from available arrays
      const newSounds = availableSounds.filter(
        (_, i) => i !== selectedSoundIndex
      );
      const newLetters = availableLetters.filter((_, i) => i !== index);

      setAvailableSounds(newSounds);
      setAvailableLetters(newLetters);
      setSelectedSoundIndex(null);
      setSelectedLetterIndex(null);

      // Check if all pairs are matched
      checkCompletion(newSounds, newLetters, [...matchedPairs, newPair]);
    } else {
      setSelectedLetterIndex(index);
      setSelectedSoundIndex(null);
    }
  };

  const handleUnmatch = (pairIndex) => {
    const pair = matchedPairs[pairIndex];
    const newPairs = matchedPairs.filter((_, i) => i !== pairIndex);

    // Restore to available arrays
    const soundToRestore = { ...pair.sound };
    const letterToRestore = { ...pair.letter };

    setAvailableSounds([...availableSounds, soundToRestore]);
    setAvailableLetters([...availableLetters, letterToRestore]);
    setMatchedPairs(newPairs);
    setAllCorrect(false);
  };

  const checkCompletion = (remainingSounds, remainingLetters, allPairs) => {
    if (remainingSounds.length === 0 && remainingLetters.length === 0) {
      // All matched - check if all are correct
      const allPairsCorrect = allPairs.every((pair) => pair.isCorrect);
      setAllCorrect(allPairsCorrect);
      // Update word result
      wordResults.current[currentWordIndex] = allPairsCorrect;
    }
  };

  const handleNext = () => {
    if (currentWordIndex < words.length - 1) {
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      initializeGame(words[nextIndex]);
      setAllCorrect(false); // Reset for next word
    } else {
      // Game complete - save stats
      const timeSpent = gameStartTime.current
        ? Math.round((Date.now() - gameStartTime.current) / 1000)
        : 0;
      const wordsCorrect = wordResults.current.filter((r) => r).length;
      const wordsCompleted = wordResults.current.length;

      // Record session stats
      recordSession({
        gameType: "lettersound",
        difficulty: selectedDifficulty,
        wordsCompleted,
        wordsCorrect,
        timeSpent,
        words: words.map((w) => w.word),
      });

      setGameStarted(false);
      setWords([]);
      setCurrentWordIndex(0);
      setMatchedPairs([]);
      setAvailableSounds([]);
      setAvailableLetters([]);
      setAllCorrect(false);
      setSelectedDifficulty(null);
      setShowCustomInput(false);
      gameStartTime.current = null;
      wordResults.current = [];
    }
  };

  const currentWord = words[currentWordIndex];

  // Show input screen if game hasn't started
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                Letter-Sound Match
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Enter words, then match sounds to letters and letter
                combinations! Click a sound, then click the matching letter.
              </p>
            </div>

            {/* Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all"
              >
                ← Back to Games
              </button>
            )}

            {/* Practice Mode Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                Choose Practice Mode:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    handleStartGame("easy");
                  }}
                  disabled={loading}
                  className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="text-2xl mb-2">🟢</div>
                  <div className="font-bold text-lg">Practice Easy</div>
                  <div className="text-sm opacity-90">
                    Simple 3-4 letter words
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    handleStartGame("medium");
                  }}
                  disabled={loading}
                  className="px-6 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="text-2xl mb-2">🟡</div>
                  <div className="font-bold text-lg">Practice Medium</div>
                  <div className="text-sm opacity-90">
                    Complex letter combinations
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    handleStartGame("hard");
                  }}
                  disabled={loading}
                  className="px-6 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="text-2xl mb-2">🔴</div>
                  <div className="font-bold text-lg">Practice Hard</div>
                  <div className="text-sm opacity-90">
                    Tricky irregular words
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(!showCustomInput);
                    setSelectedDifficulty(null);
                  }}
                  disabled={loading}
                  className={`px-6 py-4 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    showCustomInput
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-800"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  <div className="text-2xl mb-2">✏️</div>
                  <div className="font-bold text-lg">Input Your Own</div>
                  <div className="text-sm opacity-90">Enter custom words</div>
                </button>
              </div>
            </div>

            {/* Custom Input Section - Show when "Input your own" is selected */}
            {showCustomInput && (
              <div className="space-y-4 mb-6 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h3 className="text-xl font-semibold text-gray-700 text-center">
                  Enter Your Own Words:
                </h3>
                <textarea
                  value={wordsInput}
                  onChange={(e) => setWordsInput(e.target.value)}
                  placeholder="Enter words separated by commas or new lines...&#10;Example: ship, chat, thing"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed min-h-[120px] resize-none"
                  disabled={loading}
                />
                <button
                  onClick={() => handleStartGame(null)}
                  disabled={loading || !wordsInput.trim()}
                  className="w-full px-8 py-4 bg-linear-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing words...
                    </span>
                  ) : (
                    "Start Game"
                  )}
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-medium">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col p-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-all shadow-md self-start"
        >
          ← Back to Games
        </button>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-gray-700">
              Word {currentWordIndex + 1} of {words.length}
            </span>
            {selectedDifficulty && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                  selectedDifficulty === "easy"
                    ? "bg-green-500"
                    : selectedDifficulty === "medium"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                {selectedDifficulty.charAt(0).toUpperCase() +
                  selectedDifficulty.slice(1)}
              </span>
            )}
          </div>
          <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-blue-600 to-cyan-600 transition-all duration-300"
              style={{
                width: `${((currentWordIndex + 1) / words.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto w-full py-4">
        {/* Word Display - Just speaker icon */}
        <div className="text-center mb-8 w-full">
          <div className="inline-block p-6 bg-white rounded-3xl shadow-xl border-2 border-gray-200">
            <button
              onClick={() => speakText(currentWord?.word || "")}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
              title="Speak word"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            </button>
            <p className="text-sm text-gray-600 font-medium mt-3">
              Click to hear the word
            </p>
          </div>
        </div>

        {/* Matching Area */}
        {matchedPairs.length > 0 && (
          <div className="w-full mb-8">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
              Matched Pairs:
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {matchedPairs.map((pair, index) => (
                <MatchPair
                  key={index}
                  pair={pair}
                  onUnmatch={() => handleUnmatch(index)}
                  onSpeak={speakText}
                />
              ))}
            </div>
          </div>
        )}

        {/* Two Column Layout: Sounds (speaker icons) and Letters */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Sounds Column - Just speaker icons */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
              Sounds (Click to hear and select):
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {availableSounds.map((sound, index) => (
                <SoundTile
                  key={index}
                  sound={sound}
                  index={index}
                  isMatched={false}
                  isSelected={selectedSoundIndex === index}
                  onClick={handleSoundClick}
                  onSpeak={speakText}
                />
              ))}
            </div>
          </div>

          {/* Letters Column */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
              Letters (Click to match):
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {availableLetters.map((letter, index) => (
                <LetterTile
                  key={index}
                  letter={letter}
                  index={index}
                  isMatched={false}
                  isSelected={selectedLetterIndex === index}
                  onClick={handleLetterClick}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Result Message and Next Button */}
        {allCorrect && (
          <div className="w-full max-w-2xl">
            <div className="p-8 rounded-2xl font-semibold text-2xl text-center mb-6 bg-emerald-50 border-2 border-emerald-200 text-emerald-700">
              <div className="flex flex-col items-center gap-4">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Perfect! All matches are correct!</span>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-6 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold text-2xl rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all animate-pulse hover:animate-none"
            >
              {currentWordIndex < words.length - 1
                ? "Next Word →"
                : "Finish Game"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
