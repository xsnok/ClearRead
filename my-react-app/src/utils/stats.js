// Stats utility for localStorage operations

const STORAGE_KEY = "dyslexiaGameStats";

// Initialize stats structure
const getInitialStats = () => ({
  gameStats: {
    syllable: {
      easy: { totalGames: 0, totalWords: 0, correctWords: 0, averageAccuracy: 0 },
      medium: { totalGames: 0, totalWords: 0, correctWords: 0, averageAccuracy: 0 },
      hard: { totalGames: 0, totalWords: 0, correctWords: 0, averageAccuracy: 0 },
      custom: { totalGames: 0, totalWords: 0, correctWords: 0, averageAccuracy: 0 },
    },
    lettersound: {
      easy: { totalGames: 0, totalWords: 0, correctWords: 0, averageAccuracy: 0 },
      medium: { totalGames: 0, totalWords: 0, correctWords: 0, averageAccuracy: 0 },
      hard: { totalGames: 0, totalWords: 0, correctWords: 0, averageAccuracy: 0 },
      custom: { totalGames: 0, totalWords: 0, correctWords: 0, averageAccuracy: 0 },
    },
  },
  recentSessions: [],
  wordHistory: {},
});

// Load stats from localStorage
export const loadStats = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
  return getInitialStats();
};

// Save stats to localStorage
export const saveStats = (stats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Error saving stats:", error);
  }
};

// Record a game session
export const recordSession = (sessionData) => {
  const stats = loadStats();
  const { gameType, difficulty, wordsCompleted, wordsCorrect, timeSpent, words } = sessionData;

  // Determine difficulty (or 'custom' if not specified)
  const diff = difficulty || "custom";

  // Update game stats
  if (!stats.gameStats[gameType]) {
    stats.gameStats[gameType] = {};
  }
  if (!stats.gameStats[gameType][diff]) {
    stats.gameStats[gameType][diff] = {
      totalGames: 0,
      totalWords: 0,
      correctWords: 0,
      averageAccuracy: 0,
    };
  }

  const gameStat = stats.gameStats[gameType][diff];
  gameStat.totalGames += 1;
  gameStat.totalWords += wordsCompleted;
  gameStat.correctWords += wordsCorrect;
  gameStat.averageAccuracy =
    gameStat.correctWords / gameStat.totalWords || 0;

  // Add to recent sessions (keep last 50)
  const session = {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    gameType,
    difficulty: diff,
    date: new Date().toISOString(),
    wordsCompleted,
    wordsCorrect,
    accuracy: wordsCorrect / wordsCompleted || 0,
    timeSpent: timeSpent || 0,
  };

  stats.recentSessions.unshift(session);
  if (stats.recentSessions.length > 50) {
    stats.recentSessions = stats.recentSessions.slice(0, 50);
  }

  // Update word history
  if (words && Array.isArray(words)) {
    words.forEach((word) => {
      const wordKey = typeof word === "string" ? word : word.word || word.text || "";
      if (wordKey) {
        if (!stats.wordHistory[wordKey]) {
          stats.wordHistory[wordKey] = {
            attempts: 0,
            correct: 0,
            lastAttempt: null,
          };
        }
        stats.wordHistory[wordKey].attempts += 1;
        // We'll need to track per-word correctness separately if needed
        stats.wordHistory[wordKey].lastAttempt = new Date().toISOString();
      }
    });
  }

  saveStats(stats);
  return stats;
};

// Get overall statistics
export const getOverallStats = () => {
  const stats = loadStats();
  let totalGames = 0;
  let totalWords = 0;
  let totalCorrect = 0;

  Object.values(stats.gameStats).forEach((gameType) => {
    Object.values(gameType).forEach((diff) => {
      totalGames += diff.totalGames;
      totalWords += diff.totalWords;
      totalCorrect += diff.correctWords;
    });
  });

  return {
    totalGames,
    totalWords,
    totalCorrect,
    overallAccuracy: totalWords > 0 ? totalCorrect / totalWords : 0,
    recentSessions: stats.recentSessions.slice(0, 10),
    wordHistory: stats.wordHistory,
  };
};

// Get improvement suggestions
export const getImprovementSuggestions = () => {
  const stats = loadStats();
  const suggestions = [];

  // Check for difficulty levels with low accuracy
  Object.entries(stats.gameStats).forEach(([gameType, difficulties]) => {
    Object.entries(difficulties).forEach(([difficulty, stat]) => {
      if (stat.totalWords > 5 && stat.averageAccuracy < 0.7) {
        suggestions.push({
          type: "low_accuracy",
          gameType,
          difficulty,
          accuracy: stat.averageAccuracy,
          message: `Practice more ${difficulty} ${gameType} games. Current accuracy: ${Math.round(stat.averageAccuracy * 100)}%`,
        });
      }
    });
  });

  // Check for words with low success rate
  const problemWords = Object.entries(stats.wordHistory)
    .filter(([_, data]) => data.attempts >= 3 && data.correct / data.attempts < 0.5)
    .sort((a, b) => a[1].correct / a[1].attempts - b[1].correct / b[1].attempts)
    .slice(0, 5);

  if (problemWords.length > 0) {
    suggestions.push({
      type: "problem_words",
      words: problemWords.map(([word]) => word),
      message: `Focus on these words: ${problemWords.map(([word]) => word).join(", ")}`,
    });
  }

  return suggestions;
};

// Clear all stats
export const clearStats = () => {
  localStorage.removeItem(STORAGE_KEY);
};

