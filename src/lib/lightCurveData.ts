// Simulated Kepler-style light curve data generator

export interface LightCurvePoint {
  time: number;        // hours
  brightness: number;  // relative flux (1.0 = normal)
  isTransit: boolean;
  planetId?: string;
}

export interface DetectedPlanet {
  id: string;
  name: string;
  period: number;       // hours
  depth: number;        // transit depth (fraction)
  duration: number;     // transit duration (hours)
  radius: string;       // estimated radius
  type: string;         // planet classification
  color: string;        // display color CSS var
}

const PLANET_PRESETS: DetectedPlanet[] = [
  {
    id: 'p1',
    name: 'Kepler-442b',
    period: 48,
    depth: 0.012,
    duration: 3.2,
    radius: '1.34 R⊕',
    type: 'Super-Earth',
    color: 'hsl(var(--success))',
  },
  {
    id: 'p2',
    name: 'Kepler-186f',
    period: 72,
    depth: 0.005,
    duration: 2.1,
    radius: '1.11 R⊕',
    type: 'Earth-like',
    color: 'hsl(var(--primary))',
  },
  {
    id: 'p3',
    name: 'Kepler-22b',
    period: 120,
    depth: 0.028,
    duration: 4.5,
    radius: '2.38 R⊕',
    type: 'Mini-Neptune',
    color: 'hsl(var(--cosmic-cyan))',
  },
];

export interface StarSystem {
  name: string;
  spectralType: string;
  magnitude: number;
  temperature: string;
  planets: DetectedPlanet[];
}

export const STAR_SYSTEMS: StarSystem[] = [
  {
    name: 'Kepler-442',
    spectralType: 'K-type',
    magnitude: 12.01,
    temperature: '4,402 K',
    planets: [PLANET_PRESETS[0]],
  },
  {
    name: 'Kepler-186',
    spectralType: 'M-dwarf',
    magnitude: 14.625,
    temperature: '3,788 K',
    planets: [PLANET_PRESETS[1]],
  },
  {
    name: 'Kepler-22',
    spectralType: 'G-type',
    magnitude: 11.664,
    temperature: '5,518 K',
    planets: [PLANET_PRESETS[2]],
  },
  {
    name: 'Kepler-Multi System',
    spectralType: 'G-type',
    magnitude: 11.2,
    temperature: '5,600 K',
    planets: [PLANET_PRESETS[0], PLANET_PRESETS[2]],
  },
];

function gaussianNoise(stddev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return stddev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function transitDip(t: number, center: number, duration: number, depth: number): number {
  const halfDur = duration / 2;
  const ingress = duration * 0.15;
  const dist = Math.abs(t - center);

  if (dist > halfDur) return 0;
  if (dist < halfDur - ingress) return -depth;

  // Smooth ingress/egress
  const progress = (halfDur - dist) / ingress;
  return -depth * progress;
}

export function generateLightCurve(
  system: StarSystem,
  durationHours: number = 200,
  resolution: number = 0.25
): LightCurvePoint[] {
  const points: LightCurvePoint[] = [];
  const noiseLevel = 0.001;

  for (let t = 0; t <= durationHours; t += resolution) {
    let brightness = 1.0 + gaussianNoise(noiseLevel);
    let isTransit = false;
    let planetId: string | undefined;

    // Add slow stellar variability
    brightness += 0.0008 * Math.sin(2 * Math.PI * t / 80);
    brightness += 0.0004 * Math.sin(2 * Math.PI * t / 35 + 1.2);

    // Apply transit dips for each planet
    for (const planet of system.planets) {
      const numTransits = Math.ceil(durationHours / planet.period) + 1;
      for (let n = 0; n < numTransits; n++) {
        const center = planet.period * 0.3 + n * planet.period;
        const dip = transitDip(t, center, planet.duration, planet.depth);
        if (dip < 0) {
          brightness += dip;
          isTransit = true;
          planetId = planet.id;
        }
      }
    }

    points.push({
      time: parseFloat(t.toFixed(2)),
      brightness: parseFloat(brightness.toFixed(6)),
      isTransit,
      planetId,
    });
  }

  return points;
}
