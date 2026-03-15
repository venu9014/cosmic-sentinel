import { motion } from 'framer-motion';
import { Rocket, Shield, AlertTriangle, ArrowRight, Activity, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarField } from '@/components/StarField';
import { Link } from 'react-router-dom';
import spaceHero from '@/assets/space-hero.jpg';
import logo from '@/assets/logo.png';
import { LiveClock } from '@/components/LiveClock';

interface HeroSectionProps {
  onEnterDashboard: () => void;
}

  const features = [
    { icon: Activity, label: 'Live NASA Data', color: 'text-primary', description: 'Real-time asteroid tracking from NASA NEO API' },
    { icon: Rocket, label: 'ML Risk Scoring', color: 'text-secondary', description: 'Machine learning hazard classification' },
    { icon: Shield, label: 'Threat Detection', color: 'text-success', description: 'Automated threat level assessment' },
    { icon: AlertTriangle, label: 'Alert System', color: 'text-warning', description: 'Critical asteroid proximity alerts' },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${spaceHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10" />
      
      <StarField />

      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8"
          >
            <img src={logo} alt="AstroTracking AI" className="w-32 h-32 mx-auto rounded-2xl" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-orbitron text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient-cosmic"
          >
            AstroTracking AI
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Real-Time Asteroid Hazard Prediction and Monitoring System using NASA Near-Earth Object data and Machine Learning classification
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            {features.map((feature, index) => (
              <motion.button
                key={feature.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                onClick={onEnterDashboard}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg shadow-black/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                title={feature.description}
              >
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-sm font-medium">{feature.label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              variant="cosmic"
              size="xl"
              onClick={onEnterDashboard}
              className="group"
            >
              Enter Mission Control
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Link to="/chatbot">
              <Button
                variant="glow"
                size="xl"
                className="group w-full"
              >
                <Bot className="w-5 h-5" />
                AstroBot AI Chat
              </Button>
            </Link>
          </motion.div>

          {/* Live Clock */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-12 flex justify-center"
          >
            <LiveClock />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 2, duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/50 flex justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}
