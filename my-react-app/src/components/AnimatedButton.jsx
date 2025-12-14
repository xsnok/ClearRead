import { useSpring, animated, config } from "@react-spring/web";
import { useState } from "react";

export default function AnimatedButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
  ...props
}) {
  const [isPressed, setIsPressed] = useState(false);

  const [spring, api] = useSpring(() => ({
    scale: 1,
    y: 0,
    boxShadow: "0 4px 14px rgba(0, 217, 255, 0.2)",
    config: config.gentle,
  }));

  const handleMouseEnter = () => {
    if (!disabled) {
      api.start({
        scale: 1.05,
        y: -2,
        boxShadow: "0 8px 24px rgba(0, 217, 255, 0.4)",
      });
    }
  };

  const handleMouseLeave = () => {
    api.start({
      scale: 1,
      y: 0,
      boxShadow: "0 4px 14px rgba(0, 217, 255, 0.2)",
    });
  };

  const handleMouseDown = () => {
    if (!disabled) {
      setIsPressed(true);
      api.start({
        scale: 0.95,
        y: 0,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    api.start({
      scale: 1.05,
      y: -2,
    });
  };

  const variantClasses = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white",
    secondary: "bg-white/10 text-white backdrop-blur-sm border border-white/20",
    success: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white",
  };

  return (
    <animated.button
      style={{
        transform: spring.scale.to(
          (s) => `scale(${s}) translateY(${spring.y.get()}px)`
        ),
        boxShadow: spring.boxShadow,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
        variantClasses[variant] || variantClasses.primary
      } ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      {...props}
    >
      {children}
    </animated.button>
  );
}
