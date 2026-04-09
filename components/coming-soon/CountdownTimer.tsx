"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CountdownProps {
  targetDate: string; // Date in "YYYY-MM-DD HH:mm:ss" format
}

const CountdownTimer: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();

    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const getUnitName = (unit: string, value: number) => {
    if (value === 1) {
      return unit.slice(0, -1); // Remove the "s" for singular
    }
    return unit;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 w-8/12 md:w-10/12 mx-auto mt-2">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <motion.div
          key={unit}
          className="glass flex flex-col items-center justify-center rounded-lg p-3 shadow-md"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-xl md:text-5xl font-bold text-white mb-2"
            key={`${unit}-${value}`}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {value}
          </motion.div>
          <div className="text-white text-opacity-70 text-[12px] sm:text-xl uppercase md:tracking-wide">
            {getUnitName(unit, value)}
          </div>
        </motion.div>
      ))}
      <motion.p
        className="text-xl text-center text-white mt-4 col-span-full"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        until we go live!
      </motion.p>
    </div>
  );
};

export default CountdownTimer;
