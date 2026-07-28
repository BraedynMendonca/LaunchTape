import { mkdir, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import type { Page } from "@playwright/test";
import { resolveFormat, slugify } from "./presets.js";
import { exportVideo } from "./render.js";
import type {
  CaptionOptions,
  ChapterOptions,
  DemoEvent,
  DemoManifest,
  ExportKind,
  LaunchTapeOptions
} from "./types.js";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export class LaunchTape {
  readonly page: Page;
  readonly options: Required<Omit<LaunchTapeOptions, "format">> & {
    format: ReturnType<typeof resolveFormat>;
  };

  private events: DemoEvent[] = [];
  private startedAt = 0;
  private recordingPath = "";
  private started = false;

  constructor(page: Page, options: LaunchTapeOptions) {
    this.page = page;
    this.options = {
      name: options.name,
      outputDir: options.outputDir ?? "launch-assets",
      format: resolveFormat(options.format),
      exports: options.exports ?? ["webm"],
      actionTitles: options.actionTitles ?? true
    };
  }

  async start(): Promise<void> {
    if (this.started) {
      throw new Error("LaunchTape is already recording.");
    }

    const outputDir = resolve(this.options.outputDir);
    await mkdir(outputDir, { recursive: true });
    await this.page.setViewportSize({
      width: this.options.format.width,
      height: this.options.format.height
    });

    const stem = `${slugify(this.options.name)}.${this.options.format.name}`;
    this.recordingPath = join(outputDir, `${stem}.webm`);
    this.startedAt = Date.now();
    this.started = true;

    await this.page.screencast.start({
      path: this.recordingPath,
      size: {
        width: this.options.format.width,
        height: this.options.format.height
      }
    });

    if (this.options.actionTitles) {
      await this.page.screencast.showActions({
        cursor: "pointer",
        duration: 650,
        fontSize: 22,
        position: "top-right"
      });
    }
  }

  async chapter(title: string, options: ChapterOptions = {}): Promise<void> {
    this.assertStarted();
    const duration = options.duration ?? 1600;
    this.events.push({
      type: "chapter",
      at: this.elapsed(),
      title,
      description: options.description
    });
    await this.page.screencast.showChapter(title, {
      description: options.description,
      duration
    });
    await this.page.waitForTimeout(duration);
  }

  async caption(text: string, options: CaptionOptions = {}): Promise<void> {
    this.assertStarted();
    const duration = options.duration ?? 1200;
    const position = options.position ?? "bottom";
    const alignment = position === "top" ? "top: 32px" : "bottom: 32px";
    const html = [
      `<div style="position:fixed;${alignment};left:50%;transform:translateX(-50%);`,
      "max-width:72%;padding:14px 20px;border-radius:14px;",
      "background:rgba(12,14,20,.88);color:#fff;font:600 22px/1.35 system-ui;",
      "box-shadow:0 12px 40px rgba(0,0,0,.28);text-align:center;",
      `backdrop-filter:blur(12px)">${escapeHtml(text)}</div>`
    ].join("");

    this.events.push({ type: "caption", at: this.elapsed(), title: text });
    await this.page.screencast.showOverlay(html, { duration });
    await this.page.waitForTimeout(duration);
  }

  async shot(name: string): Promise<string> {
    this.assertStarted();
    const filename = `${slugify(this.options.name)}.${this.options.format.name}.${slugify(name)}.png`;
    const path = join(resolve(this.options.outputDir), filename);
    await this.page.screenshot({ path });
    this.events.push({
      type: "shot",
      at: this.elapsed(),
      title: name,
      path: this.displayPath(path)
    });
    return path;
  }

  mark(name: string, description?: string): void {
    this.assertStarted();
    this.events.push({
      type: "mark",
      at: this.elapsed(),
      title: name,
      description
    });
  }

  async pause(milliseconds = 700): Promise<void> {
    this.assertStarted();
    await this.page.waitForTimeout(milliseconds);
  }

  async stop(): Promise<DemoManifest> {
    this.assertStarted();
    await this.page.screencast.stop();
    this.started = false;

    const created: string[] = [this.recordingPath];
    for (const kind of this.options.exports) {
      if (kind === "webm") continue;
      const target = this.recordingPath.replace(/\.webm$/, `.${kind}`);
      exportVideo(this.recordingPath, target, kind);
      created.push(target);
    }

    const manifest: DemoManifest = {
      name: this.options.name,
      format: this.options.format,
      createdAt: new Date(this.startedAt).toISOString(),
      durationMs: this.elapsed(),
      video: this.displayPath(this.recordingPath),
      exports: created.map((path) => this.displayPath(path)),
      events: this.events
    };
    const manifestPath = this.recordingPath.replace(/\.webm$/, ".json");
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    return manifest;
  }

  private assertStarted(): void {
    if (!this.started) {
      throw new Error("Call demo.start() before adding LaunchTape cues.");
    }
  }

  private elapsed(): number {
    return Math.max(0, Date.now() - this.startedAt);
  }

  private displayPath(path: string): string {
    return isAbsolute(path) ? relative(process.cwd(), path) || path : path;
  }
}
