import { useEffect } from "react";
import { BarberPole } from "@/components/ui/barber-pole";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SplashProps {
  onGetStarted: () => void;
}

export default function Splash({ onGetStarted }: SplashProps) {
  useEffect(() => {
    // Auto-hide splash screen after 3 seconds for demo
    const timer = setTimeout(() => {
      onGetStarted();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onGetStarted]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <BarberPole size="xl" className="mx-auto shadow-2xl" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-5xl font-bold text-white mb-4"
        >
          BarberPro
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xl text-blue-100 mb-8"
        >
          "Easy scheduling, perfect haircut."
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button
            onClick={onGetStarted}
            className="bg-white text-primary px-8 py-3 text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
