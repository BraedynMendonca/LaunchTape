import type { DemoFormat, FormatName } from "./types.js";

export const formats: Record<FormatName, DemoFormat> = {
  wide: { name: "wide", width: 1440, height: 900 },
  square: { name: "square", width: 1080, height: 1080 },
  vertical: { name: "vertical", width: 1080, height: 1920 }
};

export function resolveFormat(format: FormatName | DemoFormat = "wide"): DemoFormat {
  if (typeof format === "string") {
    return formats[format];
  }

  if (format.width <= 0 || format.height <= 0) {
    throw new Error("LaunchTape format dimensions must be positive.");
  }

  return format;
}

export function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return slug || "demo";
}
