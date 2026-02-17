import { STAR_SYSTEMS, generateLightCurve, type LightCurvePoint, type DetectedPlanet } from './lightCurveData';

export interface ResearchStats {
  totalStars: number;
  candidatePlanets: number;
  confirmedPlanets: number;
  detectionAccuracy: number;
}

export interface DetectionDistribution {
  category: string;
  count: number;
  fill: string;
}

export interface OrbitalPeriodBin {
  range: string;
  count: number;
}

export interface PlanetRecord {
  starId: string;
  starName: string;
  planet: DetectedPlanet;
  detectionStatus: 'confirmed' | 'candidate';
}

// Build a research dataset from the existing star systems
export function buildResearchDataset() {
  const planets: PlanetRecord[] = [];

  STAR_SYSTEMS.forEach((system) => {
    system.planets.forEach((planet) => {
      // Classify based on transit depth — deeper transits are "confirmed"
      const status: 'confirmed' | 'candidate' =
        planet.depth >= 0.01 ? 'confirmed' : 'candidate';

      planets.push({
        starId: system.name,
        starName: system.name,
        planet,
        detectionStatus: status,
      });
    });
  });

  return planets;
}

export function computeStats(records: PlanetRecord[]): ResearchStats {
  const uniqueStars = new Set(records.map((r) => r.starId));
  const candidates = records.filter((r) => r.detectionStatus === 'candidate').length;
  const confirmed = records.filter((r) => r.detectionStatus === 'confirmed').length;
  const total = candidates + confirmed;

  return {
    totalStars: uniqueStars.size,
    candidatePlanets: candidates + confirmed, // total detections
    confirmedPlanets: confirmed,
    detectionAccuracy: total > 0 ? parseFloat(((confirmed / total) * 100).toFixed(1)) : 0,
  };
}

export function getDetectionDistribution(records: PlanetRecord[]): DetectionDistribution[] {
  const confirmed = records.filter((r) => r.detectionStatus === 'confirmed').length;
  const candidate = records.filter((r) => r.detectionStatus === 'candidate').length;
  // "No Detection" — stars analyzed minus stars with detections
  const starsWithDetections = new Set(records.map((r) => r.starId)).size;
  const noDetection = Math.max(0, STAR_SYSTEMS.length - starsWithDetections);

  return [
    { category: 'Confirmed', count: confirmed, fill: 'hsl(var(--success))' },
    { category: 'Candidate', count: candidate, fill: 'hsl(var(--primary))' },
    { category: 'No Detection', count: noDetection + 1, fill: 'hsl(var(--muted-foreground))' },
  ];
}

export function getOrbitalPeriodBins(records: PlanetRecord[]): OrbitalPeriodBin[] {
  const periods = records.map((r) => r.planet.period);
  const bins: Record<string, number> = {
    '0–30h': 0,
    '30–60h': 0,
    '60–90h': 0,
    '90–120h': 0,
    '120h+': 0,
  };

  periods.forEach((p) => {
    if (p < 30) bins['0–30h']++;
    else if (p < 60) bins['30–60h']++;
    else if (p < 90) bins['60–90h']++;
    else if (p < 120) bins['90–120h']++;
    else bins['120h+']++;
  });

  return Object.entries(bins).map(([range, count]) => ({ range, count }));
}

export function getSampleLightCurve(): LightCurvePoint[] {
  return generateLightCurve(STAR_SYSTEMS[0], 100, 0.25);
}
