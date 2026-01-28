export interface NasaAsteroid {
  id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: {
    close_approach_date: string;
    close_approach_date_full: string;
    epoch_date_close_approach: number;
    relative_velocity: {
      kilometers_per_second: string;
      kilometers_per_hour: string;
    };
    miss_distance: {
      astronomical: string;
      lunar: string;
      kilometers: string;
    };
    orbiting_body: string;
  }[];
}

export interface ProcessedAsteroid {
  id: string;
  name: string;
  nasaUrl: string;
  absoluteMagnitude: number;
  diameterMin: number;
  diameterMax: number;
  diameterAvg: number;
  velocity: number;
  missDistance: number;
  missDistanceLunar: number;
  closeApproachDate: string;
  isHazardousActual: boolean;
  predictedHazardous: boolean;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface NasaNeoResponse {
  links: {
    next: string;
    previous: string;
    self: string;
  };
  element_count: number;
  near_earth_objects: {
    [date: string]: NasaAsteroid[];
  };
}

export interface DashboardStats {
  totalAsteroids: number;
  hazardousCount: number;
  safeCount: number;
  criticalAlerts: number;
  averageRiskScore: number;
  closestApproach: ProcessedAsteroid | null;
  fastestAsteroid: ProcessedAsteroid | null;
  largestAsteroid: ProcessedAsteroid | null;
}
