import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'primary';
  index?: number;
   onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  index = 0,
   onClick,
}: StatsCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return {
          card: 'border-destructive/30 hover:border-destructive/50',
          icon: 'bg-destructive/20 text-destructive',
          glow: 'group-hover:shadow-destructive/20',
        };
      case 'warning':
        return {
          card: 'border-warning/30 hover:border-warning/50',
          icon: 'bg-warning/20 text-warning',
          glow: 'group-hover:shadow-warning/20',
        };
      case 'success':
        return {
          card: 'border-success/30 hover:border-success/50',
          icon: 'bg-success/20 text-success',
          glow: 'group-hover:shadow-success/20',
        };
      case 'primary':
        return {
          card: 'border-primary/30 hover:border-primary/50',
          icon: 'bg-primary/20 text-primary',
          glow: 'group-hover:shadow-primary/20',
        };
      default:
        return {
          card: 'border-border hover:border-muted-foreground/30',
          icon: 'bg-muted text-muted-foreground',
          glow: '',
        };
    }
  };

  const classes = getVariantClasses();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card
        className={cn(
           'card-space group transition-all duration-300 hover:scale-[1.02] cursor-pointer',
          classes.card,
          classes.glow,
          'hover:shadow-xl'
        )}
         onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                {title}
              </p>
              <motion.p
                className="text-3xl font-orbitron font-bold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
              >
                {value}
              </motion.p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className={cn('p-3 rounded-xl', classes.icon)}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
