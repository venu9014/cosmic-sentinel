import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Globe, CheckCircle2, Target, FlaskConical, Info, Search, BarChart3, Layers, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceArea,
} from 'recharts';
import {
  buildResearchDataset,
  computeStats,
  getDetectionDistribution,
  getOrbitalPeriodBins,
  getSampleLightCurve,
} from '@/lib/researchData';
import { StarField } from '@/components/StarField';

// ─── Stat Card ───────────────────────────────────────────────
interface StatItemProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  variant: 'primary' | 'success' | 'warning' | 'accent';
  index: number;
}

const variantMap = {
  primary: { border: 'border-primary/30 hover:border-primary/50', icon: 'bg-primary/20 text-primary', glow: 'hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]' },
  success: { border: 'border-success/30 hover:border-success/50', icon: 'bg-success/20 text-success', glow: 'hover:shadow-[0_0_30px_hsl(var(--success)/0.25)]' },
  warning: { border: 'border-warning/30 hover:border-warning/50', icon: 'bg-warning/20 text-warning', glow: 'hover:shadow-[0_0_30px_hsl(var(--warning)/0.25)]' },
  accent: { border: 'border-accent/30 hover:border-accent/50', icon: 'bg-accent/20 text-accent', glow: 'hover:shadow-[0_0_30px_hsl(var(--accent)/0.25)]' },
};

function StatCard({ title, value, icon: Icon, variant, index }: StatItemProps) {
  const v = variantMap[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className={`card-space group transition-all duration-300 hover:scale-[1.03] ${v.border} ${v.glow}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
              <motion.p
                className="text-3xl font-orbitron font-bold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                {value}
              </motion.p>
            </div>
            <div className={`p-3 rounded-xl ${v.icon}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────
function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          {p.name}: <span className="font-mono text-foreground">{typeof p.value === 'number' ? p.value.toFixed(4) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function ResearchDashboard() {
  const records = useMemo(() => buildResearchDataset(), []);
  const stats = useMemo(() => computeStats(records), [records]);
  const distribution = useMemo(() => getDetectionDistribution(records), [records]);
  const periodBins = useMemo(() => getOrbitalPeriodBins(records), [records]);
  const lightCurve = useMemo(() => getSampleLightCurve(), []);

  const hasData = records.length > 0;

  // Find transit windows for highlighting
  const transitStart = lightCurve.find((p) => p.isTransit)?.time;
  const transitPoints = lightCurve.filter((p) => p.isTransit);
  const transitEnd = transitPoints.length ? transitPoints[transitPoints.length - 1].time : undefined;

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
            <Link to="/" state={{ showDashboard: true }}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/20">
                <FlaskConical className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <h1 className="font-orbitron text-xl md:text-2xl font-bold text-gradient-cosmic">
                  Research Dashboard
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Kepler Exoplanet Transit Analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 relative z-10 space-y-8">
        {!hasData ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Card className="card-space p-12 text-center max-w-md">
              <FlaskConical className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Upload dataset to view research dashboard</p>
            </Card>
          </div>
        ) : (
          <>
            {/* ── Stats ────────────────────────────── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Stars Analyzed" value={stats.totalStars} icon={Star} variant="primary" index={0} />
              <StatCard title="Candidate Planets" value={stats.candidatePlanets} icon={Globe} variant="warning" index={1} />
              <StatCard title="Confirmed Planets" value={stats.confirmedPlanets} icon={CheckCircle2} variant="success" index={2} />
              <StatCard title="Detection Accuracy" value={`${stats.detectionAccuracy}%`} icon={Target} variant="accent" index={3} />
            </section>

            {/* ── Chart 1: Light Curve ──────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="card-space">
                <CardHeader>
                  <CardTitle className="text-lg">Sample Light Curve with Transit Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lightCurve} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} label={{ value: 'Time (hours)', position: 'insideBottom', offset: -2, style: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 } }} />
                        <YAxis domain={['dataMin - 0.005', 'dataMax + 0.005']} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} label={{ value: 'Brightness', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 } }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        {transitStart !== undefined && transitEnd !== undefined && (
                          <ReferenceArea x1={transitStart} x2={transitEnd} fill="hsl(var(--primary) / 0.12)" stroke="hsl(var(--primary) / 0.3)" strokeDasharray="4 4" />
                        )}
                        <Line type="monotone" dataKey="brightness" stroke="hsl(var(--cosmic-cyan))" dot={false} strokeWidth={1.5} name="Brightness" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Charts Row: Distribution + Histogram ─ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 2: Detection Distribution */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                <Card className="card-space h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Detection Results Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distribution} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                          <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} allowDecimals={false} />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]}>
                            {distribution.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Chart 3: Orbital Period Histogram */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
                <Card className="card-space h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Orbital Period Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={periodBins} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                          <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} allowDecimals={false} />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" name="Planets" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ── About Section ────────────────────── */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20">
                  <Info className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-orbitron text-xl md:text-2xl font-bold text-gradient-cosmic">
                  About the Research Dashboard
                </h2>
              </div>

              <Card className="card-space">
                <CardContent className="p-6 md:p-8 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    The Research Dashboard aggregates data from NASA's Kepler mission star catalogue to provide a real-time overview of exoplanet transit detections. Every metric and chart updates automatically as the underlying dataset is processed, giving researchers an at-a-glance summary of detection progress.
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="card-space group transition-all duration-300 hover:scale-[1.02] border-primary/20 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">How Statistics Are Computed</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                    <p><span className="text-foreground font-medium">Total Stars Analyzed</span> — unique star systems in the dataset.</p>
                    <p><span className="text-foreground font-medium">Candidate Planets</span> — objects flagged by transit-depth thresholds but awaiting confirmation.</p>
                    <p><span className="text-foreground font-medium">Confirmed Planets</span> — candidates verified by deeper transit signatures (depth ≥ 0.01).</p>
                    <p><span className="text-foreground font-medium">Detection Accuracy</span> — ratio of confirmed to total detections, expressed as a percentage.</p>
                  </CardContent>
                </Card>

                <Card className="card-space group transition-all duration-300 hover:scale-[1.02] border-success/20 hover:border-success/40 hover:shadow-[0_0_30px_hsl(var(--success)/0.15)]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success/20">
                        <Search className="w-5 h-5 text-success" />
                      </div>
                      <CardTitle className="text-base">Light-Curve Chart</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                    <p>The <span className="text-foreground font-medium">Sample Light Curve</span> plot renders brightness over time for a selected star system.</p>
                    <p>A shaded <span className="text-foreground font-medium">reference area</span> highlights the transit window — the interval where a planet crosses the stellar disk, causing a measurable dip in flux.</p>
                    <p>This visualisation mirrors the primary technique used by the Kepler space telescope to discover thousands of exoplanets.</p>
                  </CardContent>
                </Card>

                <Card className="card-space group transition-all duration-300 hover:scale-[1.02] border-warning/20 hover:border-warning/40 hover:shadow-[0_0_30px_hsl(var(--warning)/0.15)]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-warning/20">
                        <Layers className="w-5 h-5 text-warning" />
                      </div>
                      <CardTitle className="text-base">Detection Distribution</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                    <p>The bar chart breaks down results into three categories:</p>
                    <p><span className="text-foreground font-medium">Confirmed</span> — high-confidence detections with strong, repeatable transit signals.</p>
                    <p><span className="text-foreground font-medium">Candidate</span> — potential signals that require additional observation or vetting.</p>
                    <p><span className="text-foreground font-medium">No Detection</span> — stars where no planetary transit was identified in the observation window.</p>
                  </CardContent>
                </Card>

                <Card className="card-space group transition-all duration-300 hover:scale-[1.02] border-secondary/20 hover:border-secondary/40 hover:shadow-[0_0_30px_hsl(var(--secondary)/0.15)]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary/20">
                        <FlaskConical className="w-5 h-5 text-secondary" />
                      </div>
                      <CardTitle className="text-base">Analysis Workflow</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground leading-relaxed">
                    <ol className="list-decimal list-inside space-y-2">
                      <li><span className="text-foreground font-medium">Data Ingestion</span> — Star system catalogue is loaded and normalised.</li>
                      <li><span className="text-foreground font-medium">Transit Search</span> — Each star's light curve is scanned for periodic brightness dips using depth thresholds.</li>
                      <li><span className="text-foreground font-medium">Classification</span> — Detections are tagged as <em>confirmed</em> or <em>candidate</em> based on transit depth.</li>
                      <li><span className="text-foreground font-medium">Aggregation</span> — Statistics, distribution counts, and orbital-period bins are computed and rendered in real time.</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </motion.section>
          </>
        )}
      </main>
    </div>
  );
}
