import { motion } from "framer-motion";
import AnimatedCard from "../components/AnimatedCard.jsx";
import ScrollReveal from "../components/ScrollReveal.jsx";
import AnimatedButton from "../components/AnimatedButton.jsx";

export default function GameSelector({ onSelectGame }) {
  const games = [
    {
      id: "syllable",
      name: "Syllable Challenge",
      description:
        "Practice breaking words into syllables and arranging them in the correct order. Perfect for improving phonological awareness!",
      icon: "🔤",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      id: "lettersound",
      name: "Letter-Sound Match",
      description:
        "Match sounds (phonemes) to letters and letter combinations (graphemes). Great for understanding how letters make sounds!",
      icon: "🔗",
      gradient: "from-cyan-500 to-blue-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen py-12 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4"
            >
              Dyslexia Learning Games
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Interactive games designed to help with phonological awareness and
              reading skills
            </motion.p>
          </div>
        </ScrollReveal>

        {/* Games Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <AnimatedCard
                delay={index * 0.1}
                className="p-8 text-left h-full"
              >
                <button
                  onClick={() => onSelectGame(game.id)}
                  className="w-full text-left group"
                >
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {game.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {game.name}
                  </h2>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {game.description}
                  </p>
                  <div
                    className={`inline-block px-6 py-3 bg-gradient-to-r ${game.gradient} text-white font-semibold rounded-lg group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all transform group-hover:scale-105`}
                  >
                    Play Game →
                  </div>
                </button>
              </AnimatedCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Dashboard Button */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="flex justify-center mb-8">
            <AnimatedCard
              delay={0.4}
              className="p-8 text-center max-w-md w-full"
            >
              <button
                onClick={() => onSelectGame("dashboard")}
                className="w-full text-center group"
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  📊
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                  Progress Dashboard
                </h2>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  View your scores, track improvement, and see where you can
                  practice more
                </p>
                <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all transform group-hover:scale-105">
                  View Dashboard →
                </div>
              </button>
            </AnimatedCard>
          </div>
        </ScrollReveal>

        {/* Coming Soon Placeholder */}
        {games.length < 3 && (
          <ScrollReveal direction="up" delay={0.5}>
            <div className="mt-12 text-center">
              <p className="text-gray-400 text-lg">More games coming soon!</p>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
