import { motion } from 'framer-motion';
import { ExternalLink, Rocket, Gauge, Target, AlertTriangle, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RiskMeter } from '@/components/RiskMeter';
import { ProcessedAsteroid } from '@/types/asteroid';
import { formatDistance, formatVelocity, formatDiameter } from '@/lib/asteroidUtils';
import { exportAsteroidToPdf } from '@/lib/pdfExport';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AsteroidCardProps {
  asteroid: ProcessedAsteroid;
  index?: number;
  onViewDetails?: (asteroid: ProcessedAsteroid) => void;
}

export function AsteroidCard({ asteroid, index = 0, onViewDetails }: AsteroidCardProps) {
  const getRiskBorderClass = () => {
    switch (asteroid.riskLevel) {
      case 'critical':
        return 'border-destructive/50 hover:border-destructive';
      case 'high':
        return 'border-warning/50 hover:border-warning';
      case 'medium':
        return 'border-accent/50 hover:border-accent';
      default:
        return 'border-success/50 hover:border-success';
    }
  };

  const getRiskGlowClass = () => {
    switch (asteroid.riskLevel) {
      case 'critical':
        return 'hover:shadow-destructive/20';
      case 'high':
        return 'hover:shadow-warning/20';
      case 'medium':
        return 'hover:shadow-accent/20';
      default:
        return 'hover:shadow-success/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Card
        className={cn(
          'card-space transition-all duration-300 hover:scale-[1.02] cursor-pointer group overflow-hidden',
          getRiskBorderClass(),
          getRiskGlowClass(),
          'hover:shadow-xl'
        )}
        onClick={() => onViewDetails?.(asteroid)}
      >
        {asteroid.riskLevel === 'critical' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive via-warning to-destructive animate-pulse" />
        )}
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                {asteroid.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                ID: {asteroid.id}
              </p>
            </div>
            <RiskMeter score={asteroid.riskScore} size="sm" showLabel={false} animated={false} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {asteroid.isHazardousActual && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                NASA PHA
              </Badge>
            )}
            <Badge
              variant={asteroid.predictedHazardous ? 'destructive' : 'secondary'}
              className="gap-1"
            >
              {asteroid.predictedHazardous ? 'HAZARDOUS' : 'SAFE'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs opacity-70">Distance</p>
                <p className="text-foreground font-medium">
                  {formatDistance(asteroid.missDistance)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Gauge className="w-4 h-4 text-cosmic-cyan" />
              <div>
                <p className="text-xs opacity-70">Velocity</p>
                <p className="text-foreground font-medium">
                  {formatVelocity(asteroid.velocity)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Rocket className="w-4 h-4 text-cosmic-purple" />
              <div>
                <p className="text-xs opacity-70">Diameter</p>
                <p className="text-foreground font-medium">
                  {formatDiameter(asteroid.diameterAvg)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-4 h-4 text-cosmic-gold">🌙</span>
              <div>
                <p className="text-xs opacity-70">Lunar Distance</p>
                <p className="text-foreground font-medium">
                  {asteroid.missDistanceLunar.toFixed(2)} LD
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Close Approach: <span className="text-foreground">{asteroid.closeApproachDate}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="glow"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(asteroid);
              }}
            >
              View Analysis
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toast.info('Generating PDF...');
                exportAsteroidToPdf(asteroid);
                toast.success('PDF downloaded!');
              }}
              title="Download PDF Report"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a href={asteroid.nasaUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
