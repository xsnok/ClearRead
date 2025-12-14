import { motion } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";

export default function AnimatedCard({
  children,
  className = "",
  delay = 0,
  ...props
}) {
  const [spring, api] = useSpring(() => ({
    scale: 1,
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
  }));

  const handleMouseEnter = () => {
    api.start({
      scale: 1.02,
      boxShadow: "0 20px 60px rgba(0, 217, 255, 0.3)",
    });
  };

  const handleMouseLeave = () => {
    api.start({
      scale: 1,
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <animated.div
        style={{
          transform: spring.scale.to((s) => `scale(${s})`),
          boxShadow: spring.boxShadow,
        }}
        className={`glass-card ${className}`}
      >
        {children}
      </animated.div>
    </motion.div>
  );
}
