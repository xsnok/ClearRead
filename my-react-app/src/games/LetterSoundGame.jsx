import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import callGemini from "../ai.js";
import { speakText } from "../utils/speech.js";
import { recordSession } from "../utils/stats.js";
import easyWords from "../data/easy.json";
import mediumWords from "../data/medium.json";
import hardWords from "../data/hard.json";
import AnimatedCard from "../components/AnimatedCard.jsx";
import AnimatedButton from "../components/AnimatedButton.jsx";

// Sound tile component - just a speaker icon
function SoundTile({ sound, index, isMatched, isSelected, onClick, onSpeak }) {
  const [spring, api] = useSpring(() => ({
    scale: 1,
    boxShadow: "0 4px 14px rgba(0, 217, 255, 0.2)",
  }));

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
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        className="w-16 h-16 bg-white/5 rounded-xl cursor-not-allowed flex items-center justify-center backdrop-blur-sm border border-white/10"
      >
        <svg
          className="w-8 h-8 text-gray-500"
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
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
      onMouseEnter={() => {
        if (!isSelected) {
          api.start({
            scale: 1.1,
            boxShadow: "0 8px 24px rgba(0, 217, 255, 0.4)",
          });
        }
      }}
      onMouseLeave={() => {
        if (!isSelected) {
          api.start({
            scale: 1,
            boxShadow: "0 4px 14px rgba(0, 217, 255, 0.2)",
          });
        }
      }}
    >
      <animated.div
        onClick={handleClick}
        style={{
          transform: spring.scale.to((s) => `scale(${s})`),
          boxShadow: spring.boxShadow,
        }}
        className={`w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl cursor-pointer flex items-center justify-center ${
          isSelected
            ? "ring-4 ring-cyan-400 ring-offset-2 ring-offset-[#0a0a0a]"
            : ""
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
      </animated.div>
    </motion.div>
  );
}

// Letter tile component
function LetterTile({ letter, index, isMatched, isSelected, onClick }) {
  const [spring, api] = useSpring(() => ({
    scale: 1,
    boxShadow: "0 4px 14px rgba(168, 85, 247, 0.2)",
  }));

  if (isMatched) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        className="px-6 py-4 bg-white/5 text-gray-500 rounded-xl font-bold text-xl cursor-not-allowed backdrop-blur-sm border border-white/10"
      >
        {letter.grapheme}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
      onMouseEnter={() => {
        if (!isSelected) {
          api.start({
            scale: 1.05,
            boxShadow: "0 8px 24px rgba(168, 85, 247, 0.4)",
          });
        }
      }}
      onMouseLeave={() => {
        if (!isSelected) {
          api.start({
            scale: 1,
            boxShadow: "0 4px 14px rgba(168, 85, 247, 0.2)",
          });
        }
      }}
    >
      <animated.div
        onClick={() => onClick(index)}
        style={{
          transform: spring.scale.to((s) => `scale(${s})`),
          boxShadow: spring.boxShadow,
        }}
        className={`px-6 py-4 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl font-bold text-xl cursor-pointer ${
          isSelected
            ? "ring-4 ring-purple-400 ring-offset-2 ring-offset-[#0a0a0a]"
            : ""
        }`}
        title="Click to match with selected sound"
      >
        {letter.grapheme}
      </animated.div>
    </motion.div>
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
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200 }}
      onClick={onUnmatch}
      className={`px-6 py-4 rounded-xl font-bold text-lg shadow-lg cursor-pointer transition-all hover:scale-105 flex items-center gap-3 backdrop-blur-sm ${
        pair.isCorrect
          ? "bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300"
          : "bg-red-500/20 border-2 border-red-400 text-red-300"
      }`}
      title="Click to unmatch"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleSpeak}
        className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full p-2 flex items-center justify-center transition-all"
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
      </motion.button>
      <span className="text-xl text-white">→</span>
      <span className="bg-gradient-to-br from-purple-500 to-pink-600 text-white px-4 py-2 rounded text-xl">
        {pair.letter.grapheme}
      </span>
      {pair.isCorrect ? (
        <svg
          className="w-5 h-5 text-emerald-400"
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
          className="w-5 h-5 text-red-400"
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
    </motion.div>
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <AnimatedCard className="p-8 md:p-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
                Letter-Sound Match
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Enter words, then match sounds to letters and letter
                combinations! Click a sound, then click the matching letter.
              </p>
            </motion.div>

            {/* Back Button */}
            {onBack && (
              <AnimatedButton
                onClick={onBack}
                variant="secondary"
                className="mb-4"
              >
                ← Back to Games
              </AnimatedButton>
            )}

            {/* Practice Mode Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <h3 className="text-xl font-semibold text-gray-200 mb-4 text-center">
                Choose Practice Mode:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowCustomInput(false);
                    handleStartGame("easy");
                  }}
                  disabled={loading}
                  className="px-6 py-4 bg-gradient-to-br from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed glass-card"
                >
                  <div className="text-2xl mb-2">🟢</div>
                  <div className="font-bold text-lg">Practice Easy</div>
                  <div className="text-sm opacity-90">
                    Simple 3-4 letter words
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowCustomInput(false);
                    handleStartGame("medium");
                  }}
                  disabled={loading}
                  className="px-6 py-4 bg-gradient-to-br from-yellow-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-yellow-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed glass-card"
                >
                  <div className="text-2xl mb-2">🟡</div>
                  <div className="font-bold text-lg">Practice Medium</div>
                  <div className="text-sm opacity-90">
                    Complex letter combinations
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowCustomInput(false);
                    handleStartGame("hard");
                  }}
                  disabled={loading}
                  className="px-6 py-4 bg-gradient-to-br from-red-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed glass-card"
                >
                  <div className="text-2xl mb-2">🔴</div>
                  <div className="font-bold text-lg">Practice Hard</div>
                  <div className="text-sm opacity-90">
                    Tricky irregular words
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowCustomInput(!showCustomInput);
                    setSelectedDifficulty(null);
                  }}
                  disabled={loading}
                  className={`px-6 py-4 font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed glass-card ${
                    showCustomInput
                      ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-2 border-cyan-400"
                      : "bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
                  }`}
                >
                  <div className="text-2xl mb-2">✏️</div>
                  <div className="font-bold text-lg">Input Your Own</div>
                  <div className="text-sm opacity-90">Enter custom words</div>
                </motion.button>
              </div>
            </motion.div>

            {/* Custom Input Section - Show when "Input your own" is selected */}
            <AnimatePresence>
              {showCustomInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 mb-6 p-6 glass-card border-2 border-cyan-500/30"
                >
                  <h3 className="text-xl font-semibold text-gray-200 text-center">
                    Enter Your Own Words:
                  </h3>
                  <textarea
                    value={wordsInput}
                    onChange={(e) => setWordsInput(e.target.value)}
                    placeholder="Enter words separated by commas or new lines...&#10;Example: ship, chat, thing"
                    className="w-full px-6 py-4 text-lg bg-white/5 border-2 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:bg-white/5 disabled:cursor-not-allowed min-h-[120px] resize-none text-white placeholder:text-gray-500"
                    disabled={loading}
                  />
                  <AnimatedButton
                    onClick={() => handleStartGame(null)}
                    disabled={loading || !wordsInput.trim()}
                    variant="primary"
                    className="w-full text-lg"
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
                  </AnimatedButton>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-500/20 border-2 border-red-400 text-red-300 rounded-xl font-medium backdrop-blur-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="min-h-screen w-full flex flex-col p-6">
      {/* Back Button */}
      {onBack && (
        <AnimatedButton
          onClick={onBack}
          variant="secondary"
          className="mb-4 self-start"
        >
          ← Back to Games
        </AnimatedButton>
      )}

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-gray-200">
              Word {currentWordIndex + 1} of {words.length}
            </span>
            {selectedDifficulty && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                  selectedDifficulty === "easy"
                    ? "bg-emerald-500"
                    : selectedDifficulty === "medium"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                {selectedDifficulty.charAt(0).toUpperCase() +
                  selectedDifficulty.slice(1)}
              </motion.span>
            )}
          </div>
          <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((currentWordIndex + 1) / words.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
            />
          </div>
        </div>
      </motion.div>

      {/* Game Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto w-full py-4">
        {/* Word Display - Just speaker icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 w-full"
        >
          <AnimatedCard className="inline-block p-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => speakText(currentWord?.word || "")}
              className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full p-4 shadow-lg transition-all"
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
            </motion.button>
            <p className="text-sm text-gray-300 font-medium mt-3">
              Click to hear the word
            </p>
          </AnimatedCard>
        </motion.div>

        {/* Matching Area */}
        <AnimatePresence>
          {matchedPairs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mb-8"
            >
              <h3 className="text-2xl font-semibold text-gray-200 mb-4 text-center">
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two Column Layout: Sounds (speaker icons) and Letters */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Sounds Column - Just speaker icons */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold text-gray-200 mb-4 text-center">
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
          </motion.div>

          {/* Letters Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-2xl font-semibold text-gray-200 mb-4 text-center">
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
          </motion.div>
        </div>

        {/* Result Message and Next Button */}
        <AnimatePresence>
          {allCorrect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-full max-w-2xl"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="p-8 rounded-2xl font-semibold text-2xl text-center mb-6 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center gap-4">
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
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
                  </motion.svg>
                  <span>Perfect! All matches are correct!</span>
                </div>
              </motion.div>

              <AnimatedButton
                onClick={handleNext}
                variant="success"
                className="w-full py-6 text-2xl"
              >
                {currentWordIndex < words.length - 1
                  ? "Next Word →"
                  : "Finish Game"}
              </AnimatedButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
