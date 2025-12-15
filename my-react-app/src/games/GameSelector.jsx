import { motion } from "framer-motion";
import AnimatedCard from "../components/AnimatedCard.jsx";
import ScrollReveal from "../components/ScrollReveal.jsx";
import AnimatedButton from "../components/AnimatedButton.jsx";

export default function GameSelector({ onSelectGame }) {
  const allCards = [
    {
      id: "syllable",
      name: "Syllable Challenge",
      description:
        "Practice breaking words into syllables and arranging them in the correct order. Perfect for improving phonological awareness!",
      icon: "🔤",
      gradient: "from-purple-500 to-pink-600",
      textAlign: "text-center",
    },
    {
      id: "lettersound",
      name: "Letter-Sound Match",
      description:
        "Match sounds (phonemes) to letters and letter combinations (graphemes). Great for understanding how letters make sounds!",
      icon: "🔗",
      gradient: "from-cyan-500 to-blue-600",
      textAlign: "text-center",
    },
    {
      id: "dashboard",
      name: "Progress Dashboard",
      description:
        "View your scores, track improvement, and see where you can practice more",
      icon: "📊",
      gradient: "from-purple-500 to-pink-600",
      textAlign: "text-center",
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
              className="text-6xl md:text-7xl font-bold text-white mb-4"
              style={{
                fontFamily: "'Plaster', cursive",
                textShadow:
                  "0 0 10px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.2), 0 0 30px rgba(59, 130, 246, 0.1)",
              }}
            >
              Funlexia
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

        {/* All Cards in a Row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch"
        >
          {allCards.map((card, index) => (
            <motion.div
              key={card.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              className="flex"
            >
              <AnimatedCard
                delay={index * 0.1}
                className={`p-8 ${card.textAlign} h-full flex flex-col w-full`}
              >
                <button
                  onClick={() => onSelectGame(card.id)}
                  className={`w-full ${card.textAlign} group flex flex-col h-full`}
                >
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>
                  <h2
                    className={`text-2xl font-bold text-white mb-3 transition-colors ${
                      card.id === "dashboard"
                        ? "group-hover:text-purple-400"
                        : "group-hover:text-cyan-400"
                    }`}
                  >
                    {card.name}
                  </h2>
                  <p className="text-gray-300 mb-6 leading-relaxed flex-grow">
                    {card.description}
                  </p>
                  <div
                    className={`block mx-auto px-6 py-3 bg-gradient-to-r ${
                      card.gradient
                    } text-white font-semibold rounded-lg transition-all transform group-hover:scale-105 w-fit ${
                      card.id === "dashboard"
                        ? "group-hover:shadow-lg group-hover:shadow-purple-500/50"
                        : "group-hover:shadow-lg group-hover:shadow-cyan-500/50"
                    }`}
                  >
                    {card.id === "dashboard"
                      ? "View Dashboard →"
                      : "Play Game →"}
                  </div>
                </button>
              </AnimatedCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
