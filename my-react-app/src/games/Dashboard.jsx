import { useState, useEffect } from "react";
import {
  loadStats,
  getOverallStats,
  getImprovementSuggestions,
  clearStats,
} from "../utils/stats.js";

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
      <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Your Progress Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Track your learning journey and see where you can improve
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshStats}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md"
            >
              🔄 Refresh
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all shadow-md"
              >
                ← Back to Games
              </button>
            )}
          </div>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-3xl mb-2">🎮</div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {overallStats.totalGames}
            </div>
            <div className="text-gray-600">Total Games Played</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {overallStats.totalWords}
            </div>
            <div className="text-gray-600">Words Practiced</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {overallStats.totalCorrect}
            </div>
            <div className="text-gray-600">Words Correct</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-indigo-600 mb-1">
              {formatAccuracy(overallStats.overallAccuracy)}
            </div>
            <div className="text-gray-600">Overall Accuracy</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Game Type Stats */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Performance by Game Type
            </h2>
            <div className="space-y-6">
              {Object.entries(stats.gameStats).map(([gameType, difficulties]) => {
                const gameName =
                  gameType === "syllable" ? "Syllable Challenge" : "Letter-Sound Match";
                return (
                  <div key={gameType} className="border-b border-gray-200 pb-4 last:border-0">
                    <h3 className="text-xl font-semibold text-gray-700 mb-3">
                      {gameName}
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(difficulties)
                        .filter(([_, stat]) => stat.totalWords > 0)
                        .map(([difficulty, stat]) => (
                          <div key={difficulty} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                                  difficulty === "easy"
                                    ? "bg-green-500"
                                    : difficulty === "medium"
                                    ? "bg-yellow-500"
                                    : difficulty === "hard"
                                    ? "bg-red-500"
                                    : "bg-gray-500"
                                }`}
                              >
                                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                              </span>
                              <span className="text-gray-600">
                                {stat.totalWords} words
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className="h-full bg-linear-to-r from-indigo-600 to-purple-600 transition-all"
                                  style={{
                                    width: `${stat.averageAccuracy * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-lg font-semibold text-gray-800 w-16 text-right">
                                {formatAccuracy(stat.averageAccuracy)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              💡 Improvement Suggestions
            </h2>
            {suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg"
                  >
                    <p className="text-gray-700">{suggestion.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-green-50 border-l-4 border-green-400 rounded-lg">
                <p className="text-gray-700">
                  🎉 Great job! Keep practicing to maintain your progress.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Sessions</h2>
            {overallStats.recentSessions.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all text-sm"
              >
                Clear All Stats
              </button>
            )}
          </div>
          {overallStats.recentSessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      Game
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      Difficulty
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      Words
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      Accuracy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overallStats.recentSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(session.date)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {session.gameType === "syllable"
                          ? "Syllable Challenge"
                          : "Letter-Sound Match"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                            session.difficulty === "easy"
                              ? "bg-green-500"
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
                      <td className="py-3 px-4 text-gray-600">
                        {session.wordsCorrect}/{session.wordsCompleted}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            session.accuracy >= 0.8
                              ? "text-green-600"
                              : session.accuracy >= 0.6
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatAccuracy(session.accuracy)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No sessions yet</p>
              <p>Start playing games to see your progress here!</p>
            </div>
          )}
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Clear All Stats?
              </h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete all your game statistics. This action
                cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleClearStats}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

