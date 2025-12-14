import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import callGemini from "./ai.js";

// Draggable syllable component
function DraggableSyllable({ syllable, index, isUsed }) {
  const [{ isDragging }, drag] = useDrag({
    type: "syllable",
    item: { syllable, index },
    canDrag: !isUsed,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  if (isUsed) {
    return (
      <div className="px-6 py-4 bg-gray-200 text-gray-400 rounded-xl font-bold text-xl cursor-not-allowed opacity-30 transition-all">
        {syllable}
      </div>
    );
  }

  return (
    <div
      ref={drag}
      className={`px-6 py-4 bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-xl shadow-lg cursor-grab active:cursor-grabbing transition-all hover:scale-105 hover:shadow-xl ${
        isDragging ? "opacity-50 scale-95" : "opacity-100"
      }`}
    >
      {syllable}
    </div>
  );
}

// Dropped syllable in the answer area (can be reordered)
function DroppedSyllable({ item, index, onRemove, onMove }) {
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

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`px-6 py-4 bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-xl shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${isOver ? "ring-4 ring-indigo-400 ring-offset-2" : ""}`}
      onClick={() => onRemove(index)}
      title="Click to remove or drag to reorder"
    >
      {item.syllable}
    </div>
  );
}

// Drop zone component
function DropZone({ selectedOrder, onDrop, onMove, onRemove }) {
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
      className={`min-h-[140px] border-2 border-dashed rounded-2xl p-6 flex flex-wrap gap-4 items-center justify-center transition-all ${
        isOver ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-gray-50"
      }`}
    >
      {selectedOrder.length === 0 ? (
        <div className="w-full text-center text-gray-400 text-lg font-medium py-8">
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
          />
        ))
      )}
    </div>
  );
}

function App() {
  const [word, setWord] = useState("");
  const [originalSyllables, setOriginalSyllables] = useState([]);
  const [scrambledSyllables, setScrambledSyllables] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);

  const syllableSchema = {
    type: "object",
    properties: {
      syllables: {
        type: "array",
        description: "Break the word into syllables and return as an array",
        items: {
          type: "string",
        },
      },
    },
    required: ["syllables"],
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

  const handleStartGame = async () => {
    if (!word.trim()) {
      setError("Please enter a word");
      return;
    }

    setLoading(true);
    setError("");
    setIsCorrect(null);
    setSelectedOrder([]);

    try {
      const result = await callGemini(
        `Break the word "${word.trim()}" into syllables. Return only the syllables as an array.`,
        syllableSchema
      );

      if (result.syllables && Array.isArray(result.syllables)) {
        setOriginalSyllables(result.syllables);
        setScrambledSyllables(scrambleArray(result.syllables));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err.message || "Failed to get syllables");
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
    if (order.length !== originalSyllables.length) {
      setIsCorrect(null);
      return;
    }

    const userAnswer = order.map((item) => item.syllable).join("");
    const correctAnswer = originalSyllables.join("");

    setIsCorrect(userAnswer === correctAnswer);
  };

  const handleReset = () => {
    setSelectedOrder([]);
    setIsCorrect(null);
    setScrambledSyllables(scrambleArray(originalSyllables));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Syllable Challenge
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter a word, then drag and drop the syllables into the correct
              order!
            </p>
          </div>

          {/* Input Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleStartGame()}
              placeholder="Enter a word..."
              className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={loading}
            />
            <button
              onClick={handleStartGame}
              disabled={loading || !word.trim()}
              className="px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
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
                  Loading...
                </span>
              ) : (
                "Start Game"
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Game Area */}
          {originalSyllables.length > 0 && (
            <div className="space-y-8">
              {/* Word Display */}
              <div className="text-center p-6 bg-linear-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                  {word}
                </h2>
                <p className="text-lg text-gray-600 font-medium">
                  {originalSyllables.length} syllable
                  {originalSyllables.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Drop Zone Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  Drag syllables here in order:
                </h3>
                <DropZone
                  selectedOrder={selectedOrder}
                  onDrop={handleDrop}
                  onMove={handleMove}
                  onRemove={handleRemove}
                />
              </div>

              {/* Available Syllables */}
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  Available syllables:
                </h3>
                <div className="flex flex-wrap gap-4 justify-center">
                  {scrambledSyllables.map((syllable, index) => {
                    const isUsed = selectedOrder.some(
                      (item) => item.index === index
                    );
                    return (
                      <DraggableSyllable
                        key={index}
                        syllable={syllable}
                        index={index}
                        isUsed={isUsed}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Result Message */}
              {isCorrect !== null && (
                <div
                  className={`p-6 rounded-2xl font-semibold text-xl text-center flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 ${
                    isCorrect
                      ? "bg-emerald-50 border-2 border-emerald-200 text-emerald-700"
                      : "bg-red-50 border-2 border-red-200 text-red-700"
                  }`}
                >
                  {isCorrect ? (
                    <>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Correct! Great job!</span>
                    </>
                  ) : (
                    <>
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span>Not quite right. Try again!</span>
                    </>
                  )}
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all hover:shadow-lg"
              >
                Reset & Scramble Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
