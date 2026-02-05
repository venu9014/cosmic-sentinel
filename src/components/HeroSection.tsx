import { motion } from 'framer-motion';
import { Orbit, Rocket, Shield, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarField } from '@/components/StarField';
import spaceHero from '@/assets/space-hero.jpg';

interface HeroSectionProps {
  onEnterDashboard: () => void;
}

export function HeroSection({ onEnterDashboard }: HeroSectionProps) {
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
            <div className="relative inline-block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="w-32 h-32 mx-auto"
              >
                <Orbit className="w-full h-full text-primary" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cosmic-gold to-cosmic-orange shadow-lg shadow-cosmic-gold/50" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-orbitron text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient-cosmic"
          >
            Asteroid Threat Detection
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
            {[
              { icon: Activity, label: 'Live NASA Data', color: 'text-primary' },
              { icon: Rocket, label: 'ML Risk Scoring', color: 'text-secondary' },
              { icon: Shield, label: 'Threat Detection', color: 'text-success' },
              { icon: AlertTriangle, label: 'Alert System', color: 'text-warning' },
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border backdrop-blur-sm"
              >
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-sm font-medium">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
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
          </motion.div>

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: '7 Days', label: 'Forecast Window' },
              { value: 'Real-Time', label: 'NASA API' },
              { value: 'ML', label: 'Classification' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-orbitron text-xl md:text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
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
