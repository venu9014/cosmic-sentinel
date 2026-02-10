import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Brush,
} from 'recharts';
import { ArrowLeft, Star, Orbit, Telescope, Sparkles, ChevronDown, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarField } from '@/components/StarField';
import {
  generateLightCurve,
  STAR_SYSTEMS,
  type StarSystem,
  type LightCurvePoint,
  type DetectedPlanet,
} from '@/lib/lightCurveData';

function PlanetCard({ planet, index }: { planet: DetectedPlanet; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.15 }}
      className="card-space p-4 rounded-xl flex items-center gap-4"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: planet.color, opacity: 0.2 }}
      >
        <Orbit className="w-5 h-5" style={{ color: planet.color }} />
      </div>
      <div className="min-w-0">
        <p className="font-orbitron font-semibold text-sm truncate">{planet.name}</p>
        <p className="text-xs text-muted-foreground">{planet.type}</p>
      </div>
      <div className="ml-auto text-right shrink-0">
        <p className="text-sm font-mono">{planet.radius}</p>
        <p className="text-xs text-muted-foreground">P = {planet.period}h</p>
      </div>
      <Badge variant="outline" className="shrink-0 text-xs" style={{ borderColor: planet.color, color: planet.color }}>
        Depth: {(planet.depth * 100).toFixed(2)}%
      </Badge>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as LightCurvePoint;
  return (
    <div className="card-space p-3 rounded-lg border border-border text-sm">
      <p className="font-mono text-muted-foreground">T = {point.time.toFixed(2)} h</p>
      <p className="font-semibold">
        Flux: <span className="text-primary">{point.brightness.toFixed(5)}</span>
      </p>
      {point.isTransit && (
        <Badge variant="destructive" className="mt-1 text-xs">
          <Sparkles className="w-3 h-3 mr-1" />
          Transit Detected
        </Badge>
      )}
    </div>
  );
}

export default function LightCurve() {
  const [selectedSystem, setSelectedSystem] = useState<StarSystem>(STAR_SYSTEMS[0]);
  const [showSystemPicker, setShowSystemPicker] = useState(false);
  const [highlightTransits, setHighlightTransits] = useState(true);

  const lightCurveData = useMemo(() => generateLightCurve(selectedSystem), [selectedSystem]);

  // Find transit windows for reference areas
  const transitWindows = useMemo(() => {
    const windows: { start: number; end: number; planetId: string }[] = [];
    let currentWindow: { start: number; end: number; planetId: string } | null = null;

    for (const point of lightCurveData) {
      if (point.isTransit && point.planetId) {
        if (!currentWindow || currentWindow.planetId !== point.planetId || point.time - currentWindow.end > 0.5) {
          if (currentWindow) windows.push(currentWindow);
          currentWindow = { start: point.time, end: point.time, planetId: point.planetId };
        } else {
          currentWindow.end = point.time;
        }
      } else if (currentWindow) {
        windows.push(currentWindow);
        currentWindow = null;
      }
    }
    if (currentWindow) windows.push(currentWindow);
    return windows;
  }, [lightCurveData]);

  const getPlanetColor = useCallback(
    (planetId: string) => {
      const planet = selectedSystem.planets.find((p) => p.id === planetId);
      return planet?.color ?? 'hsl(var(--primary))';
    },
    [selectedSystem]
  );

  // Downsample for performance
  const chartData = useMemo(() => {
    const step = Math.max(1, Math.floor(lightCurveData.length / 1200));
    return lightCurveData.filter((_, i) => i % step === 0);
  }, [lightCurveData]);

  const yDomain = useMemo(() => {
    const vals = chartData.map((p) => p.brightness);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.3;
    return [parseFloat((min - pad).toFixed(5)), parseFloat((max + pad).toFixed(5))];
  }, [chartData]);

  return (
    <div className="min-h-screen relative">
      <StarField />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="p-2 rounded-xl bg-cosmic-cyan/20">
              <Telescope className="w-6 h-6 text-cosmic-cyan" />
            </div>
            <div>
              <h1 className="font-orbitron text-lg md:text-xl font-bold text-gradient-cosmic">
                Light-Curve Analysis
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Kepler Transit Photometry</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={highlightTransits ? 'glow' : 'outline'}
              size="sm"
              onClick={() => setHighlightTransits(!highlightTransits)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Transits</span>
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Star System Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <button
              onClick={() => setShowSystemPicker(!showSystemPicker)}
              className="card-space w-full p-4 rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Sun className="w-6 h-6 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-orbitron font-semibold">{selectedSystem.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSystem.spectralType} · {selectedSystem.temperature} · mag {selectedSystem.magnitude}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{selectedSystem.planets.length} planet{selectedSystem.planets.length !== 1 ? 's' : ''}</Badge>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showSystemPicker ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {showSystemPicker && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 card-space rounded-xl border border-border overflow-hidden z-20"
              >
                {STAR_SYSTEMS.map((sys) => (
                  <button
                    key={sys.name}
                    onClick={() => {
                      setSelectedSystem(sys);
                      setShowSystemPicker(false);
                    }}
                    className={`w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left ${
                      sys.name === selectedSystem.name ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                    }`}
                  >
                    <Star className="w-5 h-5 text-accent shrink-0" />
                    <div>
                      <p className="font-orbitron font-semibold text-sm">{sys.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sys.spectralType} · {sys.planets.length} planet{sys.planets.length !== 1 ? 's' : ''} · {sys.temperature}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Light Curve Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-space p-4 md:p-6 rounded-xl mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-orbitron text-lg font-semibold">Brightness vs Time</h2>
              <p className="text-xs text-muted-foreground">Relative flux normalized to 1.0</p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {chartData.length} data points
            </Badge>
          </div>

          <div className="h-[350px] md:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" strokeOpacity={0.5} />
                <XAxis
                  dataKey="time"
                  stroke="hsl(215 20% 45%)"
                  tick={{ fontSize: 11, fill: 'hsl(215 20% 65%)' }}
                  label={{ value: 'Time (hours)', position: 'insideBottomRight', offset: -5, fill: 'hsl(215 20% 65%)', fontSize: 11 }}
                />
                <YAxis
                  domain={yDomain}
                  stroke="hsl(215 20% 45%)"
                  tick={{ fontSize: 11, fill: 'hsl(215 20% 65%)' }}
                  tickFormatter={(v: number) => v.toFixed(3)}
                  label={{ value: 'Relative Flux', angle: -90, position: 'insideLeft', offset: 20, fill: 'hsl(215 20% 65%)', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Transit highlight areas */}
                {highlightTransits &&
                  transitWindows.map((w, i) => (
                    <ReferenceArea
                      key={i}
                      x1={w.start}
                      x2={w.end}
                      fill={getPlanetColor(w.planetId)}
                      fillOpacity={0.08}
                      stroke={getPlanetColor(w.planetId)}
                      strokeOpacity={0.3}
                      strokeDasharray="4 2"
                    />
                  ))}

                <ReferenceLine y={1} stroke="hsl(215 20% 35%)" strokeDasharray="6 3" label="" />

                <Line
                  type="monotone"
                  dataKey="brightness"
                  stroke="hsl(199 89% 48%)"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, fill: 'hsl(199 89% 48%)', stroke: 'hsl(222 47% 4%)', strokeWidth: 2 }}
                />
                <Brush
                  dataKey="time"
                  height={28}
                  stroke="hsl(222 30% 25%)"
                  fill="hsl(222 47% 6%)"
                  travellerWidth={8}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Detected Planets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Orbit className="w-5 h-5 text-primary" />
            <h2 className="font-orbitron text-lg font-semibold">Detected Exoplanets</h2>
            <Badge variant="secondary">{selectedSystem.planets.length}</Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {selectedSystem.planets.map((planet, i) => (
              <PlanetCard key={planet.id} planet={planet} index={i} />
            ))}
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-space p-6 rounded-xl"
        >
          <h3 className="font-orbitron text-base font-semibold mb-3 flex items-center gap-2">
            <Telescope className="w-5 h-5 text-cosmic-cyan" />
            Transit Photometry Method
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            When an exoplanet passes in front of its host star (a "transit"), it blocks a small fraction of the star's
            light, producing a characteristic dip in the light curve. The depth of the dip reveals the planet's size
            relative to the star, while the period between dips gives the orbital period. The highlighted regions above
            mark detected transit events where the brightness drops below the baseline flux of 1.0.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
