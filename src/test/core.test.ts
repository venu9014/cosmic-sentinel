import { describe, it, expect } from "vitest";
import { getRiskLevel, formatDistance, formatVelocity, formatDiameter } from "@/lib/asteroidUtils";
import { generateLightCurve, STAR_SYSTEMS } from "@/lib/lightCurveData";
import { buildResearchDataset, computeStats, getOrbitalPeriodBins } from "@/lib/researchData";

describe("risk levels", () => {
  it("increases with score", () => {
    const order = ["low", "medium", "high", "critical"];
    const levels = [0, 30, 60, 99].map(getRiskLevel);
    for (let i = 1; i < levels.length; i++)
      expect(order.indexOf(levels[i])).toBeGreaterThanOrEqual(order.indexOf(levels[i - 1]));
  });
  it("formatters return strings", () => {
    expect(typeof formatDistance(1234567)).toBe("string");
    expect(typeof formatVelocity(12.3)).toBe("string");
    expect(typeof formatDiameter(0.5)).toBe("string");
  });
});

describe("light curve", () => {
  it("contains transits and stays near 1.0", () => {
    const pts = generateLightCurve(STAR_SYSTEMS[0], 100, 0.5);
    expect(pts.length).toBe(201);
    expect(pts.some((p) => p.isTransit)).toBe(true);
    pts.forEach((p) => expect(Math.abs(p.brightness - 1)).toBeLessThan(0.05));
  });
});

describe("research data", () => {
  it("computes consistent stats", () => {
    const recs = buildResearchDataset();
    const s = computeStats(recs);
    expect(s.confirmedPlanets).toBeLessThanOrEqual(s.candidatePlanets);
    expect(s.detectionAccuracy).toBeGreaterThanOrEqual(0);
    expect(s.detectionAccuracy).toBeLessThanOrEqual(100);
    const binTotal = getOrbitalPeriodBins(recs).reduce((a, b) => a + b.count, 0);
    expect(binTotal).toBe(recs.length);
  });
});
