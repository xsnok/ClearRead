import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Vercel-style dark background */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Animated mesh gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(at 20% 30%, rgba(0, 217, 255, 0.15) 0px, transparent 50%),
            radial-gradient(at 80% 70%, rgba(168, 85, 247, 0.15) 0px, transparent 50%),
            radial-gradient(at 50% 50%, rgba(59, 130, 246, 0.1) 0px, transparent 50%)
          `,
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Subtle animated orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: `${300 + i * 150}px`,
            height: `${300 + i * 150}px`,
            background:
              i === 0
                ? "radial-gradient(circle, rgba(0, 217, 255, 0.3), transparent)"
                : i === 1
                ? "radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent)"
                : "radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent)",
            left: `${20 + i * 30}%`,
            top: `${20 + i * 25}%`,
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}
