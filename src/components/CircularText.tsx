import React from "react";
import { motion } from "framer-motion";

interface CircularTextProps {
  text: string;
  radius?: number;
  fontSize?: string;
  letterSpacing?: number;
  duration?: number;
  className?: string;
}

const CircularText: React.FC<CircularTextProps> = ({
  text,
  radius = 100,
  fontSize = "1rem",
  letterSpacing = 0.05,
  duration = 10,
  className = "",
}) => {
  const characters = text.split("");
  const angleStep = 360 / characters.length;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: radius * 2, height: radius * 2 }}
    >
      <motion.div
        className="absolute w-full h-full"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: duration,
          ease: "linear",
        }}
      >
        {characters.map((char, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-0 origin-bottom"
            style={{
              height: `${radius}px`,
              transform: `rotate(${i * angleStep}deg) translateX(-50%)`,
              transformOrigin: "bottom center",
              fontSize,
              letterSpacing: `${letterSpacing}em`,
            }}
          >
            {char}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default CircularText;
