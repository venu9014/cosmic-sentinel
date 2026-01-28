import { useQuery } from '@tanstack/react-query';
import { NasaNeoResponse, ProcessedAsteroid } from '@/types/asteroid';
import { processAsteroid } from '@/lib/asteroidUtils';

const NASA_API_KEY = 'YzHnGjYipUdFNW45rrKqf5YtgHJ5WY13Xo07hnnk';
const NASA_NEO_API = 'https://api.nasa.gov/neo/rest/v1/feed';

function getDateRange(days: number = 7): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  return {
    startDate: formatDate(today),
    endDate: formatDate(endDate),
  };
}

async function fetchNasaData(): Promise<ProcessedAsteroid[]> {
  const { startDate, endDate } = getDateRange(7);
  
  const url = `${NASA_NEO_API}?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`NASA API Error: ${response.status}`);
  }
  
  const data: NasaNeoResponse = await response.json();
  
  // Flatten all asteroids from all dates
  const allAsteroids: ProcessedAsteroid[] = [];
  
  Object.values(data.near_earth_objects).forEach(dateAsteroids => {
    dateAsteroids.forEach(asteroid => {
      allAsteroids.push(processAsteroid(asteroid));
    });
  });
  
  // Sort by risk score descending
  return allAsteroids.sort((a, b) => b.riskScore - a.riskScore);
}

export function useNasaData() {
  return useQuery({
    queryKey: ['nasa-neo-data'],
    queryFn: fetchNasaData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 3,
  });
}

export function useAsteroidById(asteroids: ProcessedAsteroid[], id: string) {
  return asteroids.find(a => a.id === id) || null;
}
