import { NasaAsteroid, ProcessedAsteroid, DashboardStats } from '@/types/asteroid';

// ML-inspired hazard classification algorithm
// Uses weighted feature scoring based on asteroid characteristics
export function calculateRiskScore(asteroid: {
  absoluteMagnitude: number;
  diameterAvg: number;
  velocity: number;
  missDistance: number;
  isHazardousActual: boolean;
}): number {
  const { absoluteMagnitude, diameterAvg, velocity, missDistance, isHazardousActual } = asteroid;

  // Normalize features (0-1 scale)
  // Lower magnitude = brighter = larger asteroid
  const magnitudeScore = Math.max(0, Math.min(1, (30 - absoluteMagnitude) / 15));
  
  // Larger diameter = higher risk
  const diameterScore = Math.min(1, diameterAvg / 1); // 1km+ is max danger
  
  // Higher velocity = higher risk
  const velocityScore = Math.min(1, velocity / 30); // 30 km/s is very fast
  
  // Closer distance = higher risk (log scale for distances)
  const distanceScore = Math.max(0, 1 - (Math.log10(missDistance + 1) / 8));

  // Weighted combination (ML model simulation)
  const weights = {
    magnitude: 0.15,
    diameter: 0.30,
    velocity: 0.20,
    distance: 0.25,
    actualHazard: 0.10, // NASA's classification as a feature
  };

  let score = 
    magnitudeScore * weights.magnitude +
    diameterScore * weights.diameter +
    velocityScore * weights.velocity +
    distanceScore * weights.distance +
    (isHazardousActual ? 1 : 0) * weights.actualHazard;

  // Apply sigmoid-like transformation for more realistic distribution
  score = 1 / (1 + Math.exp(-10 * (score - 0.3)));

  return Math.round(score * 100);
}

export function getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
  if (riskScore >= 80) return 'critical';
  if (riskScore >= 60) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
}

export function processAsteroid(raw: NasaAsteroid): ProcessedAsteroid {
  const closeApproach = raw.close_approach_data[0];
  
  const diameterMin = raw.estimated_diameter.kilometers.estimated_diameter_min;
  const diameterMax = raw.estimated_diameter.kilometers.estimated_diameter_max;
  const diameterAvg = (diameterMin + diameterMax) / 2;
  const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_second);
  const missDistance = parseFloat(closeApproach.miss_distance.kilometers);
  const missDistanceLunar = parseFloat(closeApproach.miss_distance.lunar);

  const riskScore = calculateRiskScore({
    absoluteMagnitude: raw.absolute_magnitude_h,
    diameterAvg,
    velocity,
    missDistance,
    isHazardousActual: raw.is_potentially_hazardous_asteroid,
  });

  return {
    id: raw.id,
    name: raw.name.replace(/[()]/g, '').trim(),
    nasaUrl: raw.nasa_jpl_url,
    absoluteMagnitude: raw.absolute_magnitude_h,
    diameterMin,
    diameterMax,
    diameterAvg,
    velocity,
    missDistance,
    missDistanceLunar,
    closeApproachDate: closeApproach.close_approach_date_full,
    isHazardousActual: raw.is_potentially_hazardous_asteroid,
    predictedHazardous: riskScore >= 50,
    riskScore,
    riskLevel: getRiskLevel(riskScore),
  };
}

export function calculateDashboardStats(asteroids: ProcessedAsteroid[]): DashboardStats {
  if (asteroids.length === 0) {
    return {
      totalAsteroids: 0,
      hazardousCount: 0,
      safeCount: 0,
      criticalAlerts: 0,
      averageRiskScore: 0,
      closestApproach: null,
      fastestAsteroid: null,
      largestAsteroid: null,
    };
  }

  const hazardousCount = asteroids.filter(a => a.predictedHazardous).length;
  const criticalAlerts = asteroids.filter(a => a.riskLevel === 'critical').length;
  const averageRiskScore = Math.round(
    asteroids.reduce((sum, a) => sum + a.riskScore, 0) / asteroids.length
  );

  const closestApproach = [...asteroids].sort((a, b) => a.missDistance - b.missDistance)[0];
  const fastestAsteroid = [...asteroids].sort((a, b) => b.velocity - a.velocity)[0];
  const largestAsteroid = [...asteroids].sort((a, b) => b.diameterAvg - a.diameterAvg)[0];

  return {
    totalAsteroids: asteroids.length,
    hazardousCount,
    safeCount: asteroids.length - hazardousCount,
    criticalAlerts,
    averageRiskScore,
    closestApproach,
    fastestAsteroid,
    largestAsteroid,
  };
}

export function formatDistance(km: number): string {
  if (km >= 1000000) {
    return `${(km / 1000000).toFixed(2)}M km`;
  }
  return `${km.toLocaleString(undefined, { maximumFractionDigits: 0 })} km`;
}

export function formatVelocity(kmPerSec: number): string {
  return `${kmPerSec.toFixed(2)} km/s`;
}

export function formatDiameter(km: number): string {
  if (km < 1) {
    return `${(km * 1000).toFixed(0)} m`;
  }
  return `${km.toFixed(2)} km`;
}
