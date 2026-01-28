import { motion } from 'framer-motion';
import { Orbit } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-space-pattern">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="inline-block mb-6"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-primary/30" />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <Orbit className="w-24 h-24 text-primary" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-4 h-4 rounded-full bg-cosmic-gold" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-orbitron text-xl text-foreground mb-2"
        >
          Scanning Near-Earth Objects
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground text-sm"
        >
          Fetching real-time data from NASA NEO API...
        </motion.p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent mt-6 max-w-xs mx-auto rounded-full"
        />
      </div>
    </div>
  );
}
