import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import { useDrag, useDrop } from "react-dnd";
import callGemini from "../ai.js";
import { speakText } from "../utils/speech.js";
import { recordSession } from "../utils/stats.js";
import easySyllableWords from "../data/syllable-easy.json";
import mediumSyllableWords from "../data/syllable-medium.json";
import hardSyllableWords from "../data/syllable-hard.json";
import AnimatedCard from "../components/AnimatedCard.jsx";
import AnimatedButton from "../components/AnimatedButton.jsx";

// Draggable syllable component
function DraggableSyllable({ syllable, index, isUsed, onSpeak }) {
  const [{ isDragging }, drag] = useDrag({
    type: "syllable",
    item: { syllable, index },
    canDrag: !isUsed,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleSpeak = (e) => {
    e.stopPropagation();
    // Use pronunciation if available, otherwise use text
    const textToSpeak = syllable.pronunciation || syllable.text || syllable;
    onSpeak(textToSpeak);
  };

  if (isUsed) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        className="relative px-8 py-6 bg-white/5 text-gray-500 rounded-xl font-bold text-2xl cursor-not-allowed backdrop-blur-sm border border-white/10"
      >
        {syllable.text || syllable}
        <button
          onClick={handleSpeak}
          className="absolute -top-2 -right-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
          title="Speak syllable"
        >
          <svg
            className="w-4 h-4"
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
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={drag}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isDragging ? 0.95 : 1, opacity: isDragging ? 0.5 : 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`relative px-8 py-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl font-bold text-2xl shadow-lg cursor-grab active:cursor-grabbing transition-all hover:scale-105 hover:shadow-xl`}
    >
      {syllable.text || syllable}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleSpeak}
        className="absolute -top-2 -right-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-2 shadow-lg transition-all z-10"
        title="Speak syllable"
      >
        <svg
          className="w-4 h-4"
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
    </motion.div>
  );
}

// Dropped syllable in the answer area (can be reordered)
function DroppedSyllable({ item, index, onRemove, onMove, onSpeak }) {
  const [{ isDragging }, drag] = useDrag({
    type: "dropped-syllable",
    item: { ...item, dropIndex: index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ["syllable", "dropped-syllable"],
    drop: (draggedItem) => {
      if (draggedItem.dropIndex !== undefined) {
        onMove(draggedItem.dropIndex, index);
      } else {
        onMove(-1, index, draggedItem);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleSpeak = (e) => {
    e.stopPropagation();
    // Use pronunciation if available, otherwise use text
    const textToSpeak =
      item.syllable?.pronunciation || item.syllable?.text || item.syllable;
    onSpeak(textToSpeak);
  };

  return (
    <motion.div
      ref={(node) => drag(drop(node))}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isDragging ? 0.9 : 1, opacity: isDragging ? 0.5 : 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`relative px-8 py-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-2xl shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${
        isOver ? "ring-4 ring-cyan-400 ring-offset-2 ring-offset-[#0a0a0a]" : ""
      }`}
      onClick={() => onRemove(index)}
      title="Click to remove or drag to reorder"
    >
      {item.syllable?.text || item.syllable}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleSpeak}
        className="absolute -top-2 -right-2 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full p-2 shadow-lg transition-all z-10"
        title="Speak syllable"
      >
        <svg
          className="w-4 h-4"
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
    </motion.div>
  );
}

// Drop zone component
function DropZone({ selectedOrder, onDrop, onMove, onRemove, onSpeak }) {
  const [{ isOver }, drop] = useDrop({
    accept: "syllable",
    drop: (item) => {
      onDrop(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <motion.div
      ref={drop}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`min-h-[200px] border-2 border-dashed rounded-2xl p-8 flex flex-wrap gap-6 items-center justify-center transition-all backdrop-blur-sm ${
        isOver ? "border-cyan-500 bg-cyan-500/10" : "border-white/20 bg-white/5"
      }`}
    >
      {selectedOrder.length === 0 ? (
        <div className="w-full text-center text-gray-400 text-xl font-medium py-12">
          Drop syllables here to build the word
        </div>
      ) : (
        selectedOrder.map((item, index) => (
          <DroppedSyllable
            key={`${item.index}-${index}`}
            item={item}
            index={index}
            onRemove={onRemove}
            onMove={onMove}
            onSpeak={onSpeak}
          />
        ))
      )}
    </motion.div>
  );
}

export default function SyllableGame({ onBack }) {
  const [wordsInput, setWordsInput] = useState("");
  const [words, setWords] = useState([]); // Array of { word, syllables }
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scrambledSyllables, setScrambledSyllables] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const gameStartTime = useRef(null);
  const wordResults = useRef([]); // Track correct/incorrect for each word

  const multipleWordsSchema = {
    type: "object",
    properties: {
      words: {
        type: "array",
        description:
          "Array of word objects with their syllables and pronunciations",
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
                "The phonetic spelling of the entire word (e.g., /fʌŋkʃənəl/ or fuhngk-shuh-nuhl)",
            },
            syllables: {
              type: "array",
              description: "Array of syllable objects for this word",
              items: {
                type: "object",
                properties: {
                  text: {
                    type: "string",
                    description: "The syllable text as it appears in the word",
                  },
                  pronunciation: {
                    type: "string",
                    description:
                      "How to pronounce this syllable as it sounds in the word (phonetic spelling or pronunciation guide)",
                  },
                },
                required: ["text", "pronunciation"],
              },
            },
          },
          required: ["word", "phoneticSpelling", "syllables"],
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
      // Create a prompt that requests syllables with pronunciations for all words at once
      const wordsString = wordsList.map((w) => w.trim()).join(", ");
      const prompt = `Break each of the following words into syllables: ${wordsString}. For each word, provide:
1. The phonetic spelling of the entire word (use IPA notation like /fʌŋkʃənəl/ or simple phonetic spelling like "fuhngk-shuh-nuhl")
2. For each syllable, provide both the text (as it appears in the word) and its pronunciation (how it sounds when spoken in the context of the word)

Return a JSON object with an array of word objects, where each object contains:
- 'word': the original word
- 'phoneticSpelling': the phonetic spelling of the entire word
- 'syllables': an array of syllable objects with 'text' and 'pronunciation' fields`;

      const result = await callGemini(prompt, multipleWordsSchema);

      if (result.words && Array.isArray(result.words)) {
        // Process the words and syllables with pronunciations
        const processedWords = result.words.map((item) => ({
          word: item.word.trim(),
          phoneticSpelling: item.phoneticSpelling || item.word.trim(),
          syllables: item.syllables.map((syllable) => ({
            text: syllable.text,
            pronunciation: syllable.pronunciation,
          })),
        }));

        // Check if we got all words
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
    setIsCorrect(null);
    setSelectedOrder([]);
    setSelectedDifficulty(difficulty);

    try {
      let processedWords = [];

      if (difficulty) {
        // Load from JSON file
        let wordData;
        switch (difficulty) {
          case "easy":
            wordData = easySyllableWords;
            break;
          case "medium":
            wordData = mediumSyllableWords;
            break;
          case "hard":
            wordData = hardSyllableWords;
            break;
          default:
            throw new Error("Invalid difficulty level");
        }

        processedWords = wordData.words.map((item) => ({
          word: item.word.trim(),
          phoneticSpelling: item.phoneticSpelling || item.word.trim(),
          syllables: item.syllables.map((syllable) => ({
            text: syllable.text,
            pronunciation: syllable.pronunciation,
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
      setCurrentQuestionIndex(0);
      setScrambledSyllables(scrambleArray(processedWords[0].syllables));
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

  const handleDrop = (item) => {
    const isAlreadyUsed = selectedOrder.some(
      (orderItem) => orderItem.index === item.index
    );

    if (!isAlreadyUsed) {
      const newOrder = [...selectedOrder, item];
      setSelectedOrder(newOrder);
      checkAnswer(newOrder);
    }
  };

  const handleMove = (fromIndex, toIndex, newItem = null) => {
    const newOrder = [...selectedOrder];

    if (fromIndex === -1 && newItem) {
      const isAlreadyUsed = newOrder.some(
        (orderItem) => orderItem.index === newItem.index
      );
      if (!isAlreadyUsed) {
        newOrder.splice(toIndex, 0, newItem);
      }
    } else if (fromIndex !== toIndex) {
      const [movedItem] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedItem);
    }

    setSelectedOrder(newOrder);
    checkAnswer(newOrder);
  };

  const handleRemove = (index) => {
    const newOrder = selectedOrder.filter((_, i) => i !== index);
    setSelectedOrder(newOrder);
    checkAnswer(newOrder);
  };

  const checkAnswer = (order) => {
    if (!words[currentQuestionIndex]) return;

    if (order.length !== words[currentQuestionIndex].syllables.length) {
      setIsCorrect(null);
      return;
    }

    // Compare using text property if syllable is an object, otherwise use the syllable directly
    const userAnswer = order
      .map((item) => {
        const syllable = item.syllable;
        return syllable?.text || syllable;
      })
      .join("");
    const correctAnswer = words[currentQuestionIndex].syllables
      .map((syllable) => syllable.text || syllable)
      .join("");

    const isCorrect = userAnswer === correctAnswer;
    setIsCorrect(isCorrect);
    // Update word result
    wordResults.current[currentQuestionIndex] = isCorrect;
  };

  const handleNext = () => {
    if (currentQuestionIndex < words.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setScrambledSyllables(scrambleArray(words[nextIndex].syllables));
      setSelectedOrder([]);
      setIsCorrect(null);
    } else {
      // Game complete - save stats and return to input screen
      const timeSpent = gameStartTime.current
        ? Math.round((Date.now() - gameStartTime.current) / 1000)
        : 0;
      const wordsCorrect = wordResults.current.filter((r) => r).length;
      const wordsCompleted = wordResults.current.length;

      // Record session stats
      recordSession({
        gameType: "syllable",
        difficulty: selectedDifficulty,
        wordsCompleted,
        wordsCorrect,
        timeSpent,
        words: words.map((w) => w.word),
      });

      setGameStarted(false);
      setWords([]);
      setCurrentQuestionIndex(0);
      setSelectedOrder([]);
      setIsCorrect(null);
      setSelectedDifficulty(null);
      setShowCustomInput(false);
      gameStartTime.current = null;
      wordResults.current = [];
    }
  };

  const currentWord = words[currentQuestionIndex];

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
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
                Syllable Challenge
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Enter one or more words (separated by commas or new lines), then
                drag and drop the syllables into the correct order!
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
                    Simple 1-2 syllable words
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
                  <div className="text-sm opacity-90">2-4 syllable words</div>
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
                    Complex multi-syllable words
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
                      ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white border-2 border-purple-400"
                      : "bg-gradient-to-br from-purple-500 to-pink-600 text-white"
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
                  className="space-y-4 mb-6 p-6 glass-card border-2 border-purple-500/30"
                >
                  <h3 className="text-xl font-semibold text-gray-200 text-center">
                    Enter Your Own Words:
                  </h3>
                  <textarea
                    value={wordsInput}
                    onChange={(e) => setWordsInput(e.target.value)}
                    placeholder="Enter words separated by commas or new lines...&#10;Example: Functional, Beautiful, Amazing"
                    className="w-full px-6 py-4 text-lg bg-white/5 border-2 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-white/5 disabled:cursor-not-allowed min-h-[120px] resize-none text-white placeholder:text-gray-500"
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

  // Full screen game view
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
              Question {currentQuestionIndex + 1} of {words.length}
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
                width: `${((currentQuestionIndex + 1) / words.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
            />
          </div>
        </div>
      </motion.div>

      {/* Game Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full py-4">
        {/* Phonetic Spelling Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 w-full"
        >
          <AnimatedCard className="inline-block p-8 relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => speakText(currentWord?.word || "")}
              className="absolute top-4 right-4 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full p-3 shadow-lg transition-all"
              title="Speak word"
            >
              <svg
                className="w-6 h-6"
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
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-3 font-mono">
              {currentWord?.phoneticSpelling || currentWord?.word}
            </h2>
            <p className="text-lg text-gray-300 font-medium">
              {currentWord?.syllables.length} syllable
              {currentWord?.syllables.length !== 1 ? "s" : ""}
            </p>
          </AnimatedCard>
        </motion.div>

        {/* Drop Zone Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full mb-8"
        >
          <h3 className="text-2xl font-semibold text-gray-200 mb-4 text-center">
            Drag syllables here in order:
          </h3>
          <DropZone
            selectedOrder={selectedOrder}
            onDrop={handleDrop}
            onMove={handleMove}
            onRemove={handleRemove}
            onSpeak={speakText}
          />
        </motion.div>

        {/* Available Syllables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full mb-8"
        >
          <h3 className="text-2xl font-semibold text-gray-200 mb-4 text-center">
            Available syllables:
          </h3>
          <div className="flex flex-wrap gap-6 justify-center">
            {scrambledSyllables.map((syllable, index) => {
              const isUsed = selectedOrder.some((item) => item.index === index);
              return (
                <DraggableSyllable
                  key={index}
                  syllable={syllable}
                  index={index}
                  isUsed={isUsed}
                  onSpeak={speakText}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Result Message and Next Button */}
        <AnimatePresence>
          {isCorrect !== null && (
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
                className={`p-8 rounded-2xl font-semibold text-2xl text-center mb-6 backdrop-blur-sm ${
                  isCorrect
                    ? "bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300"
                    : "bg-red-500/20 border-2 border-red-400 text-red-300"
                }`}
              >
                {isCorrect ? (
                  <div className="flex flex-col items-center gap-4">
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.2,
                      }}
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
                    <span>Correct! Great job!</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <motion.svg
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.2,
                      }}
                      className="w-12 h-12"
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
                    </motion.svg>
                    <span>Not quite right. Try again!</span>
                  </div>
                )}
              </motion.div>

              {/* Next Button - only shows when correct */}
              {isCorrect && (
                <AnimatedButton
                  onClick={handleNext}
                  variant="success"
                  className="w-full py-6 text-2xl"
                >
                  {currentQuestionIndex < words.length - 1
                    ? "Next Question →"
                    : "Finish Game"}
                </AnimatedButton>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
