import { describe, it, expect } from "vitest";
import { calculateEmissions } from "../lib/carbon";

describe("Calculator Logic", () => {
  it("calculates total emissions", () => {
    const result = calculateEmissions({
      transportMode: "car",
      transportKm: 10,
      electricityKwh: 5,
      foodType: "mixed",
      wasteKg: 1,
    });

    expect(result.total).toBeGreaterThan(0);
  });

  it("returns transport emissions", () => {
    const result = calculateEmissions({
      transportMode: "car",
      transportKm: 20,
      electricityKwh: 0,
      foodType: "vegetarian",
      wasteKg: 0,
    });

    expect(result.transport).toBeGreaterThan(0);
  });
});