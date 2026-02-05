 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Badge } from '@/components/ui/badge';
 import { RiskMeter } from '@/components/RiskMeter';
 import { ProcessedAsteroid } from '@/types/asteroid';
 import { formatDistance, formatVelocity, formatDiameter } from '@/lib/asteroidUtils';
 import { Activity, AlertTriangle, Shield, TrendingUp, Target, Gauge, Rocket } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 export type StatsType = 'total' | 'hazardous' | 'safe' | 'riskScore';
 
 interface StatsDetailModalProps {
   open: boolean;
   onClose: () => void;
   type: StatsType | null;
   asteroids: ProcessedAsteroid[];
   onAsteroidClick: (asteroid: ProcessedAsteroid) => void;
 }
 
 const statsConfig = {
   total: {
     title: 'All Near-Earth Objects',
     icon: Activity,
     color: 'text-primary',
     bgColor: 'bg-primary/20',
     description: 'Complete list of tracked asteroids in the current dataset',
   },
   hazardous: {
     title: 'Hazardous Asteroids',
     icon: AlertTriangle,
     color: 'text-destructive',
     bgColor: 'bg-destructive/20',
     description: 'Asteroids classified as potentially hazardous based on ML prediction',
   },
   safe: {
     title: 'Safe Asteroids',
     icon: Shield,
     color: 'text-success',
     bgColor: 'bg-success/20',
     description: 'Asteroids classified as non-threatening based on ML prediction',
   },
   riskScore: {
     title: 'Risk Score Analysis',
     icon: TrendingUp,
     color: 'text-warning',
     bgColor: 'bg-warning/20',
     description: 'System-wide risk assessment and distribution breakdown',
   },
 };
 
 export function StatsDetailModal({
   open,
   onClose,
   type,
   asteroids,
   onAsteroidClick,
 }: StatsDetailModalProps) {
   if (!type) return null;
 
   const config = statsConfig[type];
   const Icon = config.icon;
 
   const getFilteredAsteroids = () => {
     switch (type) {
       case 'hazardous':
         return asteroids.filter((a) => a.predictedHazardous);
       case 'safe':
         return asteroids.filter((a) => !a.predictedHazardous);
       case 'total':
       case 'riskScore':
       default:
         return asteroids;
     }
   };
 
   const filteredAsteroids = getFilteredAsteroids();
 
   const getRiskDistribution = () => {
     const critical = asteroids.filter((a) => a.riskLevel === 'critical').length;
     const high = asteroids.filter((a) => a.riskLevel === 'high').length;
     const medium = asteroids.filter((a) => a.riskLevel === 'medium').length;
     const low = asteroids.filter((a) => a.riskLevel === 'low').length;
     return { critical, high, medium, low };
   };
 
   const distribution = type === 'riskScore' ? getRiskDistribution() : null;
 
   return (
     <Dialog open={open} onOpenChange={onClose}>
       <DialogContent className="max-w-3xl bg-card border-border overflow-hidden p-0 max-h-[85vh]">
         <div className={cn('h-2', config.bgColor)} />
         
         <div className="p-6">
           <DialogHeader className="mb-4">
             <div className="flex items-center gap-3">
               <div className={cn('p-3 rounded-xl', config.bgColor)}>
                 <Icon className={cn('w-6 h-6', config.color)} />
               </div>
               <div>
                 <DialogTitle className="text-xl font-orbitron">
                   {config.title}
                 </DialogTitle>
                 <p className="text-sm text-muted-foreground mt-1">
                   {config.description}
                 </p>
               </div>
             </div>
           </DialogHeader>
 
           {type === 'riskScore' && distribution && (
             <div className="grid grid-cols-4 gap-3 mb-4">
               <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-center">
                 <p className="text-2xl font-orbitron font-bold text-destructive">{distribution.critical}</p>
                 <p className="text-xs text-muted-foreground">Critical</p>
               </div>
               <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 text-center">
                 <p className="text-2xl font-orbitron font-bold text-warning">{distribution.high}</p>
                 <p className="text-xs text-muted-foreground">High</p>
               </div>
               <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 text-center">
                 <p className="text-2xl font-orbitron font-bold text-accent">{distribution.medium}</p>
                 <p className="text-xs text-muted-foreground">Medium</p>
               </div>
               <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-center">
                 <p className="text-2xl font-orbitron font-bold text-success">{distribution.low}</p>
                 <p className="text-xs text-muted-foreground">Low</p>
               </div>
             </div>
           )}
 
           <div className="flex items-center justify-between mb-3">
             <span className="text-sm text-muted-foreground">
               {filteredAsteroids.length} asteroid{filteredAsteroids.length !== 1 ? 's' : ''}
             </span>
           </div>
 
           <ScrollArea className="h-[400px] pr-4">
             <div className="space-y-2">
               {filteredAsteroids.map((asteroid) => (
                 <div
                   key={asteroid.id}
                   className="p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/50 transition-colors cursor-pointer"
                   onClick={() => onAsteroidClick(asteroid)}
                 >
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-3">
                       <h4 className="font-orbitron font-semibold">{asteroid.name}</h4>
                       <Badge
                         variant={
                           asteroid.riskLevel === 'critical'
                             ? 'destructive'
                             : asteroid.riskLevel === 'high'
                             ? 'destructive'
                             : asteroid.riskLevel === 'medium'
                             ? 'secondary'
                             : 'outline'
                         }
                         className="text-xs"
                       >
                         {asteroid.riskLevel.toUpperCase()}
                       </Badge>
                     </div>
                     <RiskMeter score={asteroid.riskScore} size="sm" />
                   </div>
                   
                   <div className="grid grid-cols-3 gap-4 text-sm">
                     <div className="flex items-center gap-2">
                       <Target className="w-4 h-4 text-primary" />
                       <span className="text-muted-foreground">Distance:</span>
                       <span>{formatDistance(asteroid.missDistance)}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Gauge className="w-4 h-4 text-cosmic-cyan" />
                       <span className="text-muted-foreground">Velocity:</span>
                       <span>{formatVelocity(asteroid.velocity)}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Rocket className="w-4 h-4 text-secondary" />
                       <span className="text-muted-foreground">Size:</span>
                       <span>{formatDiameter(asteroid.diameterAvg)}</span>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </ScrollArea>
         </div>
       </DialogContent>
     </Dialog>
   );
 }