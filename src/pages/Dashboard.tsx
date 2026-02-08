import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Rocket,
  Target,
  Gauge,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useNasaData } from '@/hooks/useNasaData';
import { calculateDashboardStats } from '@/lib/asteroidUtils';
import { exportAllAsteroidsToPdf } from '@/lib/pdfExport';
import { ProcessedAsteroid } from '@/types/asteroid';
import { StarField } from '@/components/StarField';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { AlertPanel } from '@/components/AlertPanel';
import { AsteroidCard } from '@/components/AsteroidCard';
import { AsteroidDetailModal } from '@/components/AsteroidDetailModal';
import { FilterControls } from '@/components/FilterControls';
import { LoadingScreen } from '@/components/LoadingScreen';
import { StatsDetailModal, StatsType } from '@/components/StatsDetailModal';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { data: asteroids, isLoading, error, refetch, dataUpdatedAt } = useNasaData();
  const [selectedAsteroid, setSelectedAsteroid] = useState<ProcessedAsteroid | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('risk');
   const [statsModalType, setStatsModalType] = useState<StatsType | null>(null);

  const stats = useMemo(() => {
    return calculateDashboardStats(asteroids || []);
  }, [asteroids]);

  const criticalAsteroids = useMemo(() => {
    return (asteroids || [])
      .filter((a) => a.riskLevel === 'critical' && !dismissedAlerts.has(a.id));
  }, [asteroids, dismissedAlerts]);

  const filteredAsteroids = useMemo(() => {
    if (!asteroids) return [];

    let filtered = [...asteroids];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.id.toLowerCase().includes(query)
      );
    }

    // Risk filter
    switch (riskFilter) {
      case 'critical':
        filtered = filtered.filter((a) => a.riskLevel === 'critical');
        break;
      case 'high':
        filtered = filtered.filter((a) => a.riskLevel === 'high' || a.riskLevel === 'critical');
        break;
      case 'hazardous':
        filtered = filtered.filter((a) => a.predictedHazardous);
        break;
      case 'safe':
        filtered = filtered.filter((a) => !a.predictedHazardous);
        break;
    }

    // Sort
    switch (sortBy) {
      case 'risk':
        filtered.sort((a, b) => b.riskScore - a.riskScore);
        break;
      case 'distance':
        filtered.sort((a, b) => a.missDistance - b.missDistance);
        break;
      case 'velocity':
        filtered.sort((a, b) => b.velocity - a.velocity);
        break;
      case 'diameter':
        filtered.sort((a, b) => b.diameterAvg - a.diameterAvg);
        break;
      case 'date':
        filtered.sort((a, b) => new Date(a.closeApproachDate).getTime() - new Date(b.closeApproachDate).getTime());
        break;
    }

    return filtered;
  }, [asteroids, searchQuery, riskFilter, sortBy]);

  if (isLoading && !asteroids) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-pattern">
        <div className="text-center p-8 card-space rounded-xl max-w-md">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="font-orbitron text-xl text-destructive mb-2">Connection Error</h2>
          <p className="text-muted-foreground mb-4">
            Unable to fetch NASA NEO data. Please check your connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <StarField />
      
      <Header
        isLoading={isLoading}
        lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt) : undefined}
        criticalCount={criticalAsteroids.length}
        onRefresh={() => {
          toast.info('Refreshing asteroid data...');
          refetch();
        }}
      />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Tracked"
            value={stats.totalAsteroids}
            subtitle="Near-Earth Objects"
            icon={Activity}
            variant="primary"
            index={0}
             onClick={() => setStatsModalType('total')}
          />
          <StatsCard
            title="Hazardous"
            value={stats.hazardousCount}
            subtitle="Potential Threats"
            icon={AlertTriangle}
            variant="danger"
            index={1}
             onClick={() => setStatsModalType('hazardous')}
          />
          <StatsCard
            title="Safe"
            value={stats.safeCount}
            subtitle="Non-Threatening"
            icon={Shield}
            variant="success"
            index={2}
             onClick={() => setStatsModalType('safe')}
          />
          <StatsCard
            title="Avg Risk Score"
            value={`${stats.averageRiskScore}%`}
            subtitle="System-wide"
            icon={TrendingUp}
            variant="warning"
            index={3}
             onClick={() => setStatsModalType('riskScore')}
          />
        </div>

        {/* Notable Objects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          {stats.closestApproach && (
            <div
              className="card-space p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedAsteroid(stats.closestApproach)}
            >
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Closest Approach</span>
              </div>
              <p className="font-orbitron font-semibold truncate">{stats.closestApproach.name}</p>
              <p className="text-sm text-primary">{stats.closestApproach.missDistanceLunar.toFixed(2)} LD</p>
            </div>
          )}
          
          {stats.fastestAsteroid && (
            <div
              className="card-space p-4 rounded-xl cursor-pointer hover:border-cosmic-cyan/50 transition-colors"
              onClick={() => setSelectedAsteroid(stats.fastestAsteroid)}
            >
              <div className="flex items-center gap-3 mb-2">
                <Gauge className="w-5 h-5 text-cosmic-cyan" />
                <span className="text-sm text-muted-foreground">Fastest Object</span>
              </div>
              <p className="font-orbitron font-semibold truncate">{stats.fastestAsteroid.name}</p>
              <p className="text-sm text-cosmic-cyan">{stats.fastestAsteroid.velocity.toFixed(2)} km/s</p>
            </div>
          )}
          
          {stats.largestAsteroid && (
            <div
              className="card-space p-4 rounded-xl cursor-pointer hover:border-secondary/50 transition-colors"
              onClick={() => setSelectedAsteroid(stats.largestAsteroid)}
            >
              <div className="flex items-center gap-3 mb-2">
                <Rocket className="w-5 h-5 text-secondary" />
                <span className="text-sm text-muted-foreground">Largest Object</span>
              </div>
              <p className="font-orbitron font-semibold truncate">{stats.largestAsteroid.name}</p>
              <p className="text-sm text-secondary">
                {stats.largestAsteroid.diameterAvg >= 1
                  ? `${stats.largestAsteroid.diameterAvg.toFixed(2)} km`
                  : `${(stats.largestAsteroid.diameterAvg * 1000).toFixed(0)} m`}
              </p>
            </div>
          )}
        </motion.div>

        {/* Alerts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <AlertPanel
            criticalAsteroids={criticalAsteroids}
            onDismiss={(id) => setDismissedAlerts((prev) => new Set([...prev, id]))}
            onViewDetails={setSelectedAsteroid}
          />
        </motion.div>

        {/* Filter Controls */}
        <FilterControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          riskFilter={riskFilter}
          onRiskFilterChange={setRiskFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Asteroid Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-xl font-semibold">
              Near-Earth Objects
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Showing {filteredAsteroids.length} of {asteroids?.length || 0}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.info('Generating PDF report...');
                  exportAllAsteroidsToPdf(filteredAsteroids);
                  toast.success('PDF report downloaded!');
                }}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export All PDF
              </Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAsteroids.map((asteroid, index) => (
              <AsteroidCard
                key={asteroid.id}
                asteroid={asteroid}
                index={index}
                onViewDetails={setSelectedAsteroid}
              />
            ))}
          </div>

          {filteredAsteroids.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No asteroids match your filters.</p>
            </div>
          )}
        </motion.div>
      </main>

      <AsteroidDetailModal
        asteroid={selectedAsteroid}
        open={!!selectedAsteroid}
        onClose={() => setSelectedAsteroid(null)}
      />
       
       <StatsDetailModal
         open={!!statsModalType}
         onClose={() => setStatsModalType(null)}
         type={statsModalType}
         asteroids={asteroids || []}
         onAsteroidClick={(asteroid) => {
           setStatsModalType(null);
           setSelectedAsteroid(asteroid);
         }}
       />
    </div>
  );
}
