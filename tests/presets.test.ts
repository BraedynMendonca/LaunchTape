import { describe, expect, it } from "vitest";
import { resolveFormat, slugify } from "../src/presets.js";

describe("slugify", () => {
  it("creates safe, readable asset names", () => {
    expect(slugify("Ship a focused day!")).toBe("ship-a-focused-day");
  });

  it("always returns a filename", () => {
    expect(slugify("✨")).toBe("demo");
  });
});

describe("resolveFormat", () => {
  it("resolves a named social preset", () => {
    expect(resolveFormat("vertical")).toEqual({
      name: "vertical",
      width: 1080,
      height: 1920
    });
  });

  it("rejects invalid custom dimensions", () => {
    expect(() =>
      resolveFormat({ name: "wide", width: 0, height: 900 })
    ).toThrow("dimensions must be positive");
  });
});
