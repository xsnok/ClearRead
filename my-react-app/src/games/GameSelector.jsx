export default function GameSelector({ onSelectGame }) {
  const games = [
    {
      id: "syllable",
      name: "Syllable Challenge",
      description:
        "Practice breaking words into syllables and arranging them in the correct order. Perfect for improving phonological awareness!",
      icon: "🔤",
      color: "from-indigo-600 to-purple-600",
    },
    {
      id: "lettersound",
      name: "Letter-Sound Match",
      description:
        "Match sounds (phonemes) to letters and letter combinations (graphemes). Great for understanding how letters make sounds!",
      icon: "🔗",
      color: "from-blue-600 to-cyan-600",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Dyslexia Learning Games
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interactive games designed to help with phonological awareness and
            reading skills
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transform hover:scale-105 transition-all text-left group"
            >
              <div className="text-5xl mb-4">{game.icon}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {game.name}
              </h2>
              <p className="text-gray-600 mb-6">{game.description}</p>
              <div
                className={`inline-block px-6 py-3 bg-linear-to-r ${game.color} text-white font-semibold rounded-lg group-hover:shadow-lg transition-all`}
              >
                Play Game →
              </div>
            </button>
          ))}
        </div>

        {/* Coming Soon Placeholder */}
        {games.length < 3 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-lg">
              More games coming soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

