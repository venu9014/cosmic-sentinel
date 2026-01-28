import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ExternalLink, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProcessedAsteroid } from '@/types/asteroid';
import { formatDistance, formatVelocity } from '@/lib/asteroidUtils';

interface AlertPanelProps {
  criticalAsteroids: ProcessedAsteroid[];
  onDismiss?: (id: string) => void;
  onViewDetails?: (asteroid: ProcessedAsteroid) => void;
}

export function AlertPanel({ criticalAsteroids, onDismiss, onViewDetails }: AlertPanelProps) {
  if (criticalAsteroids.length === 0) {
    return (
      <Card className="card-space border-success/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/20">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="font-orbitron font-semibold text-success">All Clear</h3>
              <p className="text-sm text-muted-foreground">
                No critical asteroid threats detected in the next 7 days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-space border-destructive/50 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive via-warning to-destructive animate-pulse" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            Critical Alerts ({criticalAsteroids.length})
          </CardTitle>
          <Badge variant="destructive" className="animate-pulse">
            ACTIVE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {criticalAsteroids.map((asteroid, index) => (
            <motion.div
              key={asteroid.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 hover:border-destructive/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    <h4 className="font-orbitron font-semibold text-sm truncate">
                      {asteroid.name}
                    </h4>
                    <Badge variant="destructive" className="shrink-0">
                      {asteroid.riskScore}% RISK
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <p>Distance: <span className="text-foreground">{formatDistance(asteroid.missDistance)}</span></p>
                    <p>Velocity: <span className="text-foreground">{formatVelocity(asteroid.velocity)}</span></p>
                    <p className="col-span-2">Approach: <span className="text-foreground">{asteroid.closeApproachDate}</span></p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDismiss?.(asteroid.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={() => onViewDetails?.(asteroid)}
                >
                  View Analysis
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a href={asteroid.nasaUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
