import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RiskMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

export function RiskMeter({ score, size = 'md', showLabel = true, animated = true }: RiskMeterProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const strokeWidths = {
    sm: 4,
    md: 6,
    lg: 8,
  };

  const radius = {
    sm: 28,
    md: 42,
    lg: 56,
  };

  const circumference = 2 * Math.PI * radius[size];
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return 'stroke-destructive';
    if (score >= 60) return 'stroke-warning';
    if (score >= 40) return 'stroke-accent';
    return 'stroke-success';
  };

  const getGlowColor = () => {
    if (score >= 80) return 'drop-shadow-[0_0_10px_hsl(var(--destructive))]';
    if (score >= 60) return 'drop-shadow-[0_0_10px_hsl(var(--warning))]';
    if (score >= 40) return 'drop-shadow-[0_0_10px_hsl(var(--accent))]';
    return 'drop-shadow-[0_0_10px_hsl(var(--success))]';
  };

  const getLabel = () => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const getLabelColor = () => {
    if (score >= 80) return 'text-destructive';
    if (score >= 60) return 'text-warning';
    if (score >= 40) return 'text-accent';
    return 'text-success';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative', sizeClasses[size])}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${radius[size] * 2 + 16} ${radius[size] * 2 + 16}`}>
          {/* Background circle */}
          <circle
            cx={radius[size] + 8}
            cy={radius[size] + 8}
            r={radius[size]}
            fill="none"
            className="stroke-muted"
            strokeWidth={strokeWidths[size]}
          />
          {/* Progress circle */}
          <motion.circle
            cx={radius[size] + 8}
            cy={radius[size] + 8}
            r={radius[size]}
            fill="none"
            className={cn(getColor(), getGlowColor())}
            strokeWidth={strokeWidths[size]}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={cn('font-orbitron font-bold', textSizes[size], getLabelColor())}
            initial={animated ? { opacity: 0, scale: 0.5 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}%
          </motion.span>
        </div>
      </div>
      {showLabel && (
        <motion.span
          className={cn('font-orbitron text-xs font-semibold tracking-wider', getLabelColor())}
          initial={animated ? { opacity: 0 } : {}}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {getLabel()}
        </motion.span>
      )}
    </div>
  );
}
