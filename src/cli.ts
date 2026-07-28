#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import type { ExportKind, FormatName } from "./types.js";

const validFormats = new Set<FormatName>(["wide", "square", "vertical"]);
const validExports = new Set<ExportKind>(["webm", "mp4", "gif"]);

interface CliOptions {
  spec: string;
  formats: FormatName[];
  exports: ExportKind[];
  outputDir: string;
  passthrough: string[];
}

function usage(): string {
  return `
LaunchTape — compile a Playwright flow into product demo assets

Usage:
  launchtape record <spec> [options]

Options:
  --format <names>   wide,square,vertical (default: wide)
  --export <types>   webm,mp4,gif (default: webm)
  --out <directory>  output directory (default: launch-assets)
  --                 pass remaining arguments to Playwright

Example:
  launchtape record demos/checkout.spec.ts --format wide,vertical --export webm,mp4
`.trim();
}

function splitList<T extends string>(raw: string, valid: Set<T>, flag: string): T[] {
  const values = raw.split(",").map((value) => value.trim()) as T[];
  const invalid = values.filter((value) => !valid.has(value));
  if (invalid.length > 0) {
    throw new Error(`Invalid ${flag}: ${invalid.join(", ")}`);
  }
  return [...new Set(values)];
}

export function parseArgs(argv: string[]): CliOptions {
  if (argv[0] !== "record" || !argv[1] || argv.includes("--help") || argv.includes("-h")) {
    throw new Error(usage());
  }

  const options: CliOptions = {
    spec: argv[1],
    formats: ["wide"],
    exports: ["webm"],
    outputDir: "launch-assets",
    passthrough: []
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") {
      options.passthrough = argv.slice(index + 1);
      break;
    }
    if (arg === "--format") {
      options.formats = splitList(argv[++index] ?? "", validFormats, "format");
      continue;
    }
    if (arg === "--export") {
      options.exports = splitList(argv[++index] ?? "", validExports, "export");
      continue;
    }
    if (arg === "--out") {
      options.outputDir = argv[++index] ?? "";
      if (!options.outputDir) throw new Error("--out requires a directory.");
      continue;
    }
    throw new Error(`Unknown option: ${arg}\n\n${usage()}`);
  }

  return options;
}

export function run(argv = process.argv.slice(2)): number {
  let options: CliOptions;
  try {
    options = parseArgs(argv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 1;
  }

  const require = createRequire(import.meta.url);
  let playwrightCli: string;
  try {
    playwrightCli = require.resolve("@playwright/test/cli");
  } catch {
    console.error("LaunchTape requires @playwright/test >= 1.59 in your project.");
    return 1;
  }

  for (const format of options.formats) {
    console.log(`\n● Recording ${format}…`);
    const result = spawnSync(
      process.execPath,
      [playwrightCli, "test", options.spec, ...options.passthrough],
      {
        stdio: "inherit",
        env: {
          ...process.env,
          LAUNCHTAPE_FORMAT: format,
          LAUNCHTAPE_EXPORTS: options.exports.join(","),
          LAUNCHTAPE_OUT: options.outputDir
        }
      }
    );
    if (result.status !== 0) return result.status ?? 1;
  }

  console.log(`\n✓ Launch assets saved to ${options.outputDir}`);
  return 0;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  process.exitCode = run();
}
