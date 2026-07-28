import { describe, expect, it } from "vitest";
import { parseArgs } from "../src/cli.js";

describe("LaunchTape CLI", () => {
  it("parses multiple formats and exports", () => {
    expect(
      parseArgs([
        "record",
        "demo.spec.ts",
        "--format",
        "wide,vertical",
        "--export",
        "webm,mp4",
        "--out",
        "assets",
        "--",
        "--headed"
      ])
    ).toEqual({
      spec: "demo.spec.ts",
      formats: ["wide", "vertical"],
      exports: ["webm", "mp4"],
      outputDir: "assets",
      passthrough: ["--headed"]
    });
  });

  it("rejects unknown formats", () => {
    expect(() =>
      parseArgs(["record", "demo.spec.ts", "--format", "cinema"])
    ).toThrow("Invalid format");
  });
});
