import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Target, Gauge, Rocket, Orbit, Star, AlertTriangle, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RiskMeter } from '@/components/RiskMeter';
import { ProcessedAsteroid } from '@/types/asteroid';
import { formatDistance, formatVelocity, formatDiameter } from '@/lib/asteroidUtils';
import { cn } from '@/lib/utils';

interface AsteroidDetailModalProps {
  asteroid: ProcessedAsteroid | null;
  open: boolean;
  onClose: () => void;
}

export function AsteroidDetailModal({ asteroid, open, onClose }: AsteroidDetailModalProps) {
  if (!asteroid) return null;

  const getStatusConfig = () => {
    switch (asteroid.riskLevel) {
      case 'critical':
        return {
          bg: 'bg-destructive/10',
          border: 'border-destructive/50',
          text: 'text-destructive',
          label: 'CRITICAL THREAT',
          icon: AlertTriangle,
        };
      case 'high':
        return {
          bg: 'bg-warning/10',
          border: 'border-warning/50',
          text: 'text-warning',
          label: 'HIGH RISK',
          icon: AlertTriangle,
        };
      case 'medium':
        return {
          bg: 'bg-accent/10',
          border: 'border-accent/50',
          text: 'text-accent',
          label: 'MODERATE RISK',
          icon: Star,
        };
      default:
        return {
          bg: 'bg-success/10',
          border: 'border-success/50',
          text: 'text-success',
          label: 'LOW RISK - SAFE',
          icon: Shield,
        };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border overflow-hidden p-0">
        <div className={cn('h-2', asteroid.riskLevel === 'critical' && 'bg-gradient-to-r from-destructive via-warning to-destructive animate-pulse')} />
        
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-orbitron mb-2">
                  {asteroid.name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground font-mono">
                  NASA JPL ID: {asteroid.id}
                </p>
              </div>
              <RiskMeter score={asteroid.riskScore} size="lg" />
            </div>
          </DialogHeader>

          <div className={cn('p-4 rounded-xl mb-6 flex items-center gap-4', status.bg, 'border', status.border)}>
            <StatusIcon className={cn('w-8 h-8', status.text)} />
            <div>
              <h3 className={cn('font-orbitron font-bold', status.text)}>{status.label}</h3>
              <p className="text-sm text-muted-foreground">
                {asteroid.predictedHazardous
                  ? 'ML model predicts this asteroid as potentially hazardous.'
                  : 'ML model predicts this asteroid as safe.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {asteroid.isHazardousActual && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                NASA Potentially Hazardous Asteroid
              </Badge>
            )}
            <Badge variant={asteroid.predictedHazardous ? 'destructive' : 'secondary'}>
              ML Prediction: {asteroid.predictedHazardous ? 'HAZARDOUS' : 'SAFE'}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-orbitron font-semibold">Miss Distance</h4>
              </div>
              <p className="text-2xl font-bold">{formatDistance(asteroid.missDistance)}</p>
              <p className="text-sm text-muted-foreground">{asteroid.missDistanceLunar.toFixed(2)} Lunar Distances</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-cosmic-cyan/20">
                  <Gauge className="w-5 h-5 text-cosmic-cyan" />
                </div>
                <h4 className="font-orbitron font-semibold">Velocity</h4>
              </div>
              <p className="text-2xl font-bold">{formatVelocity(asteroid.velocity)}</p>
              <p className="text-sm text-muted-foreground">{(asteroid.velocity * 3600).toFixed(0)} km/h</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <Rocket className="w-5 h-5 text-secondary" />
                </div>
                <h4 className="font-orbitron font-semibold">Diameter</h4>
              </div>
              <p className="text-2xl font-bold">{formatDiameter(asteroid.diameterAvg)}</p>
              <p className="text-sm text-muted-foreground">
                Range: {formatDiameter(asteroid.diameterMin)} - {formatDiameter(asteroid.diameterMax)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-cosmic-gold/20">
                  <Orbit className="w-5 h-5 text-cosmic-gold" />
                </div>
                <h4 className="font-orbitron font-semibold">Close Approach</h4>
              </div>
              <p className="text-lg font-bold">{asteroid.closeApproachDate}</p>
              <p className="text-sm text-muted-foreground">Absolute Magnitude: {asteroid.absoluteMagnitude.toFixed(2)}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/20 border border-border mb-6">
            <h4 className="font-orbitron font-semibold mb-3">Risk Analysis Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size Factor</span>
                <span>{asteroid.diameterAvg > 0.14 ? 'Significant' : 'Minor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Velocity Factor</span>
                <span>{asteroid.velocity > 20 ? 'High Speed' : 'Moderate Speed'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proximity Factor</span>
                <span>{asteroid.missDistanceLunar < 10 ? 'Very Close' : asteroid.missDistanceLunar < 50 ? 'Close' : 'Distant'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NASA Classification</span>
                <span>{asteroid.isHazardousActual ? 'PHA (Potentially Hazardous)' : 'Non-PHA'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="glow" className="flex-1" asChild>
              <a href={asteroid.nasaUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on NASA JPL
              </a>
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
