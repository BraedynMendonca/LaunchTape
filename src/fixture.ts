import { test as base, expect } from "@playwright/test";
import { LaunchTape } from "./demo.js";
import type { ExportKind, FormatName } from "./types.js";

type LaunchTapeFixtures = {
  demo: LaunchTape;
};

function envList<T extends string>(value: string | undefined, fallback: T[]): T[] {
  return value
    ? (value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean) as T[])
    : fallback;
}

export const test = base.extend<LaunchTapeFixtures>({
  demo: async ({ page }, use, testInfo) => {
    const format = (process.env.LAUNCHTAPE_FORMAT ?? "wide") as FormatName;
    const exports = envList<ExportKind>(process.env.LAUNCHTAPE_EXPORTS, ["webm"]);
    const demo = new LaunchTape(page, {
      name: process.env.LAUNCHTAPE_NAME ?? testInfo.title,
      outputDir: process.env.LAUNCHTAPE_OUT ?? "launch-assets",
      format,
      exports
    });

    await demo.start();
    try {
      await use(demo);
    } finally {
      if (!page.isClosed()) {
        await demo.stop();
      }
    }
  }
});

export { expect };
export type { LaunchTape };
