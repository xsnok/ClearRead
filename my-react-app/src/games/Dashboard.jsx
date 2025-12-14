import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import {
  loadStats,
  getOverallStats,
  getImprovementSuggestions,
  clearStats,
} from "../utils/stats.js";
import AnimatedCard from "../components/AnimatedCard.jsx";
import ScrollReveal from "../components/ScrollReveal.jsx";
import AnimatedButton from "../components/AnimatedButton.jsx";

// Animated number component
function AnimatedNumber({ value, accent = false }) {
  const { number } = useSpring({
    from: { number: 0 },
    to: {
      number:
        typeof value === "string"
          ? parseFloat(value.replace("%", "")) || 0
          : value,
    },
    config: { duration: 1000 },
  });

  if (typeof value === "string" && value.includes("%")) {
    return (
      <animated.div
        className={`text-3xl font-bold mb-1 ${
          accent
            ? "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
            : "text-white"
        }`}
      >
        {number.to((n) => `${Math.round(n)}%`)}
      </animated.div>
    );
  }

  return (
    <animated.div
      className={`text-3xl font-bold mb-1 ${
        accent
          ? "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          : "text-white"
      }`}
    >
      {number.to((n) => Math.round(n).toLocaleString())}
    </animated.div>
  );
}

export default function Dashboard({ onBack }) {
  const [stats, setStats] = useState(null);
  const [overallStats, setOverallStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    refreshStats();
  }, []);

  const refreshStats = () => {
    const loadedStats = loadStats();
    const overall = getOverallStats();
    const improvementSuggestions = getImprovementSuggestions();

    setStats(loadedStats);
    setOverallStats(overall);
    setSuggestions(improvementSuggestions);
  };

  const handleClearStats = () => {
    clearStats();
    refreshStats();
    setShowClearConfirm(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAccuracy = (accuracy) => {
    return `${Math.round(accuracy * 100)}%`;
  };

  if (!stats || !overallStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"
          ></motion.div>
          <p className="text-gray-300">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
                Your Progress Dashboard
              </h1>
              <p className="text-lg text-gray-300">
                Track your learning journey and see where you can improve
              </p>
            </div>
            <div className="flex gap-3">
              <AnimatedButton onClick={refreshStats} variant="primary">
                🔄 Refresh
              </AnimatedButton>
              {onBack && (
                <AnimatedButton onClick={onBack} variant="secondary">
                  ← Back to Games
                </AnimatedButton>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: "🎮",
              value: overallStats.totalGames,
              label: "Total Games Played",
              delay: 0.1,
            },
            {
              icon: "📝",
              value: overallStats.totalWords,
              label: "Words Practiced",
              delay: 0.2,
            },
            {
              icon: "✅",
              value: overallStats.totalCorrect,
              label: "Words Correct",
              delay: 0.3,
            },
            {
              icon: "🎯",
              value: formatAccuracy(overallStats.overallAccuracy),
              label: "Overall Accuracy",
              delay: 0.4,
              accent: true,
            },
          ].map((stat, index) => (
            <ScrollReveal key={index} direction="up" delay={stat.delay}>
              <AnimatedCard className="p-6">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <AnimatedNumber value={stat.value} accent={stat.accent} />
                <div className="text-gray-300 mt-1">{stat.label}</div>
              </AnimatedCard>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Game Type Stats */}
          <ScrollReveal direction="up" delay={0.2}>
            <AnimatedCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Performance by Game Type
              </h2>
              <div className="space-y-6">
                {Object.entries(stats.gameStats).map(
                  ([gameType, difficulties]) => {
                    const gameName =
                      gameType === "syllable"
                        ? "Syllable Challenge"
                        : "Letter-Sound Match";
                    return (
                      <div
                        key={gameType}
                        className="border-b border-gray-200 pb-4 last:border-0"
                      >
                        <h3 className="text-xl font-semibold text-gray-200 mb-3">
                          {gameName}
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(difficulties)
                            .filter(([_, stat]) => stat.totalWords > 0)
                            .map(([difficulty, stat], idx) => (
                              <motion.div
                                key={difficulty}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                                      difficulty === "easy"
                                        ? "bg-emerald-500"
                                        : difficulty === "medium"
                                        ? "bg-yellow-500"
                                        : difficulty === "hard"
                                        ? "bg-red-500"
                                        : "bg-gray-500"
                                    }`}
                                  >
                                    {difficulty.charAt(0).toUpperCase() +
                                      difficulty.slice(1)}
                                  </span>
                                  <span className="text-gray-300">
                                    {stat.totalWords} words
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="w-32 bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${stat.averageAccuracy * 100}%`,
                                      }}
                                      transition={{
                                        duration: 0.8,
                                        delay: idx * 0.1,
                                      }}
                                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                                    />
                                  </div>
                                  <span className="text-lg font-semibold text-white w-16 text-right">
                                    {formatAccuracy(stat.averageAccuracy)}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </AnimatedCard>
          </ScrollReveal>

          {/* Improvement Suggestions */}
          <ScrollReveal direction="up" delay={0.3}>
            <AnimatedCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                💡 Improvement Suggestions
              </h2>
              {suggestions.length > 0 ? (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-yellow-500/20 border-l-4 border-yellow-400 rounded-lg backdrop-blur-sm"
                    >
                      <p className="text-gray-200">{suggestion.message}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-emerald-500/20 border-l-4 border-emerald-400 rounded-lg backdrop-blur-sm"
                >
                  <p className="text-gray-200">
                    🎉 Great job! Keep practicing to maintain your progress.
                  </p>
                </motion.div>
              )}
            </AnimatedCard>
          </ScrollReveal>
        </div>

        {/* Recent Sessions */}
        <ScrollReveal direction="up" delay={0.4}>
          <AnimatedCard className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Sessions</h2>
              {overallStats.recentSessions.length > 0 && (
                <AnimatedButton
                  onClick={() => setShowClearConfirm(true)}
                  variant="danger"
                  className="text-sm"
                >
                  Clear All Stats
                </AnimatedButton>
              )}
            </div>
            {overallStats.recentSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                        Game
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                        Difficulty
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                        Words
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                        Accuracy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {overallStats.recentSessions.map((session, index) => (
                      <motion.tr
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 text-gray-300">
                          {formatDate(session.date)}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {session.gameType === "syllable"
                            ? "Syllable Challenge"
                            : "Letter-Sound Match"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                              session.difficulty === "easy"
                                ? "bg-emerald-500"
                                : session.difficulty === "medium"
                                ? "bg-yellow-500"
                                : session.difficulty === "hard"
                                ? "bg-red-500"
                                : "bg-gray-500"
                            }`}
                          >
                            {session.difficulty.charAt(0).toUpperCase() +
                              session.difficulty.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {session.wordsCorrect}/{session.wordsCompleted}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold ${
                              session.accuracy >= 0.8
                                ? "text-emerald-400"
                                : session.accuracy >= 0.6
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatAccuracy(session.accuracy)}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-400"
              >
                <p className="text-lg mb-2">No sessions yet</p>
                <p>Start playing games to see your progress here!</p>
              </motion.div>
            )}
          </AnimatedCard>
        </ScrollReveal>

        {/* Clear Confirmation Modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowClearConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card p-8 max-w-md w-full"
              >
                <h3 className="text-2xl font-bold text-white mb-4">
                  Clear All Stats?
                </h3>
                <p className="text-gray-300 mb-6">
                  This will permanently delete all your game statistics. This
                  action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <AnimatedButton
                    onClick={handleClearStats}
                    variant="danger"
                    className="flex-1"
                  >
                    Yes, Clear All
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={() => setShowClearConfirm(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </AnimatedButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
