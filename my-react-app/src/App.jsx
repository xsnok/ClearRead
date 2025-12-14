import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import callGemini from "./ai.js";

// Speech function using Web Speech API
const speakText = (text) => {
  if ("speechSynthesis" in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }
};

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
      <div className="relative px-8 py-6 bg-gray-200 text-gray-400 rounded-xl font-bold text-2xl cursor-not-allowed opacity-30 transition-all">
        {syllable.text || syllable}
        <button
          onClick={handleSpeak}
          className="absolute -top-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
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
      </div>
    );
  }

  return (
    <div
      ref={drag}
      className={`relative px-8 py-6 bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-2xl shadow-lg cursor-grab active:cursor-grabbing transition-all hover:scale-105 hover:shadow-xl ${
        isDragging ? "opacity-50 scale-95" : "opacity-100"
      }`}
    >
      {syllable.text || syllable}
      <button
        onClick={handleSpeak}
        className="absolute -top-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110 z-10"
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
    </div>
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
    <div
      ref={(node) => drag(drop(node))}
      className={`relative px-8 py-6 bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-2xl shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${isOver ? "ring-4 ring-indigo-400 ring-offset-2" : ""}`}
      onClick={() => onRemove(index)}
      title="Click to remove or drag to reorder"
    >
      {item.syllable?.text || item.syllable}
      <button
        onClick={handleSpeak}
        className="absolute -top-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110 z-10"
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
    </div>
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
    <div
      ref={drop}
      className={`min-h-[200px] border-2 border-dashed rounded-2xl p-8 flex flex-wrap gap-6 items-center justify-center transition-all ${
        isOver ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-gray-50"
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
    </div>
  );
}

function App() {
  const [wordsInput, setWordsInput] = useState("");
  const [words, setWords] = useState([]); // Array of { word, syllables }
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scrambledSyllables, setScrambledSyllables] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

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

  const handleStartGame = async () => {
    if (!wordsInput.trim()) {
      setError("Please enter at least one word");
      return;
    }

    setLoading(true);
    setError("");
    setIsCorrect(null);
    setSelectedOrder([]);

    try {
      // Split by comma or newline, filter empty strings
      const wordsList = wordsInput
        .split(/[,\n]/)
        .map((w) => w.trim())
        .filter((w) => w.length > 0);

      if (wordsList.length === 0) {
        setError("Please enter at least one word");
        return;
      }

      // Process all words
      const processedWords = await processMultipleWords(wordsList);

      if (processedWords.length === 0) {
        throw new Error("No words were successfully processed");
      }

      setWords(processedWords);
      setCurrentQuestionIndex(0);
      setScrambledSyllables(scrambleArray(processedWords[0].syllables));
      setGameStarted(true);
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

    setIsCorrect(userAnswer === correctAnswer);
  };

  const handleNext = () => {
    if (currentQuestionIndex < words.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setScrambledSyllables(scrambleArray(words[nextIndex].syllables));
      setSelectedOrder([]);
      setIsCorrect(null);
    } else {
      // Game complete
      setGameStarted(false);
      setWords([]);
      setCurrentQuestionIndex(0);
      setSelectedOrder([]);
      setIsCorrect(null);
    }
  };

  const currentWord = words[currentQuestionIndex];

  // Show input screen if game hasn't started
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Syllable Challenge
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Enter one or more words (separated by commas or new lines), then
                drag and drop the syllables into the correct order!
              </p>
            </div>

            {/* Input Section */}
            <div className="space-y-4 mb-6">
              <textarea
                value={wordsInput}
                onChange={(e) => setWordsInput(e.target.value)}
                placeholder="Enter words separated by commas or new lines...&#10;Example: Functional, Beautiful, Amazing"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed min-h-[120px] resize-none"
                disabled={loading}
              />
              <button
                onClick={handleStartGame}
                disabled={loading || !wordsInput.trim()}
                className="w-full px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
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

  // Full screen game view
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-gray-700">
            Question {currentQuestionIndex + 1} of {words.length}
          </span>
          <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-600 to-purple-600 transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / words.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full py-4">
        {/* Phonetic Spelling Display */}
        <div className="text-center mb-8 w-full">
          <div className="inline-block p-8 bg-white rounded-3xl shadow-xl border-2 border-gray-200 relative">
            <button
              onClick={() => speakText(currentWord?.word || "")}
              className="absolute top-4 right-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
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
            </button>
            <h2 className="text-5xl md:text-6xl font-bold text-indigo-700 mb-3 font-mono">
              {currentWord?.phoneticSpelling || currentWord?.word}
            </h2>
            <p className="text-lg text-gray-600 font-medium">
              {currentWord?.syllables.length} syllable
              {currentWord?.syllables.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Drop Zone Section */}
        <div className="w-full mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
            Drag syllables here in order:
          </h3>
          <DropZone
            selectedOrder={selectedOrder}
            onDrop={handleDrop}
            onMove={handleMove}
            onRemove={handleRemove}
            onSpeak={speakText}
          />
        </div>

        {/* Available Syllables */}
        <div className="w-full mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
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
        </div>

        {/* Result Message and Next Button */}
        {isCorrect !== null && (
          <div className="w-full max-w-2xl">
            <div
              className={`p-8 rounded-2xl font-semibold text-2xl text-center mb-6 ${
                isCorrect
                  ? "bg-emerald-50 border-2 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-2 border-red-200 text-red-700"
              }`}
            >
              {isCorrect ? (
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
                  <span>Correct! Great job!</span>
                </div>
              ) : (
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>Not quite right. Try again!</span>
                </div>
              )}
            </div>

            {/* Next Button - only shows when correct */}
            {isCorrect && (
              <button
                onClick={handleNext}
                className="w-full py-6 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold text-2xl rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all animate-pulse hover:animate-none"
              >
                {currentQuestionIndex < words.length - 1
                  ? "Next Question →"
                  : "Finish Game"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
