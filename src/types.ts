export type FormatName = "wide" | "square" | "vertical";
export type ExportKind = "webm" | "mp4" | "gif";

export interface DemoFormat {
  name: FormatName;
  width: number;
  height: number;
}

export interface ChapterOptions {
  description?: string;
  duration?: number;
}

export interface CaptionOptions {
  duration?: number;
  position?: "top" | "bottom";
}

export interface LaunchTapeOptions {
  name: string;
  outputDir?: string;
  format?: FormatName | DemoFormat;
  exports?: ExportKind[];
  actionTitles?: boolean;
}

export interface DemoEvent {
  type: "chapter" | "caption" | "shot" | "mark";
  at: number;
  title: string;
  description?: string;
  path?: string;
}

export interface DemoManifest {
  name: string;
  format: DemoFormat;
  createdAt: string;
  durationMs: number;
  video: string;
  exports: string[];
  events: DemoEvent[];
}
