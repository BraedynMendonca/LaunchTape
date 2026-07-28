import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { extname } from "node:path";
import type { ExportKind } from "./types.js";

export function hasFfmpeg(): boolean {
  const result = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  return result.status === 0;
}

export function exportVideo(
  source: string,
  target: string,
  kind: Exclude<ExportKind, "webm">
): void {
  if (!existsSync(source)) {
    throw new Error(`LaunchTape could not find its recording at ${source}`);
  }

  if (!hasFfmpeg()) {
    throw new Error(
      `FFmpeg is required for ${kind.toUpperCase()} export. The WebM recording is still available.`
    );
  }

  const args =
    kind === "mp4"
      ? [
          "-y",
          "-i",
          source,
          "-an",
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-movflags",
          "+faststart",
          target
        ]
      : [
          "-y",
          "-i",
          source,
          "-filter_complex",
          "[0:v]fps=15,scale='min(960,iw)':-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
          target
        ];

  const result = spawnSync("ffmpeg", args, { stdio: "pipe", encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`FFmpeg failed to create ${extname(target)}:\n${result.stderr}`);
  }
}
