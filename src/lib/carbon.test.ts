import { describe, it, expect } from "vitest";
import { calculateEmissions, generateRecommendations } from "./carbon";

describe("calculateEmissions", () => {
  it("returns a valid emissions result", () => {
    const result = calculateEmissions({
      transportMode: "car",
      transportKm: 20,
      electricityKwh: 10,
      foodType: "mixed",
      wasteKg: 2,
    });

    expect(result).toHaveProperty("transport");
    expect(result).toHaveProperty("electricity");
    expect(result).toHaveProperty("food");
    expect(result).toHaveProperty("waste");
    expect(result).toHaveProperty("total");

    expect(result.total).toBeGreaterThan(0);
  });
});

describe("generateRecommendations", () => {
  it("generates recommendations for heavy carbon usage", () => {
    const recommendations = generateRecommendations({
      transportMode: "car",
      transportKm: 30,
      electricityKwh: 20,
      foodType: "heavy_meat",
      wasteKg: 3,
    });

    expect(recommendations.length).toBeGreaterThan(0);
  });

  it("includes transport recommendation for car users", () => {
    const recommendations = generateRecommendations({
      transportMode: "car",
      transportKm: 30,
      electricityKwh: 5,
      foodType: "vegetarian",
      wasteKg: 0.5,
    });

    expect(
      recommendations.some((r) => r.category === "transport")
    ).toBe(true);
  });
});