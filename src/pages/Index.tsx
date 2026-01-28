import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroSection } from '@/components/HeroSection';
import Dashboard from './Dashboard';

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!showDashboard ? (
        <motion.div
          key="hero"
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <HeroSection onEnterDashboard={() => setShowDashboard(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Dashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
