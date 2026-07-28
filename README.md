# LaunchTape

**Turn a Playwright flow into launch-ready product demo assets.**

LaunchTape records the product flow you already know how to test, then produces
repeatable videos, screenshots, chapter metadata, and social-size variants.
It runs locally or in CI, requires no account, and uses no AI API.

```ts
import { test, expect } from "launchtape/playwright";

test("create a workspace", async ({ page, demo }) => {
  await page.goto("http://localhost:3000");

  await demo.chapter("Create a workspace", {
    description: "Go from signup to a working project in seconds."
  });

  await page.getByRole("button", { name: "New workspace" }).click();
  await page.getByLabel("Name").fill("Acme");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("Welcome to Acme")).toBeVisible();
  await demo.caption("Your workspace is ready.");
  await demo.shot("finished-workspace");
});
```

```bash
npx launchtape record demos/workspace.spec.ts \
  --format wide,vertical \
  --export webm,mp4,gif
```

## Why this exists

Screen recorders capture a performance. LaunchTape compiles a repeatable source:

- update one Playwright flow when the product changes;
- export wide, square, and vertical versions from the same demo;
- get smooth action highlights and cursor motion from Playwright;
- add deliberate chapter cards and captions in code;
- save named screenshots at the exact moments you care about;
- keep a JSON manifest for docs sites, release posts, and future editors;
- run the whole thing locally or in CI.

## Install

LaunchTape uses Playwright's screencast API, available in Playwright 1.59+.

Until the first npm release, install LaunchTape directly from GitHub:

```bash
npm install --save-dev github:BraedynMendonca/LaunchTape @playwright/test
npx playwright install chromium
```

FFmpeg is optional. WebM recording works without it; MP4 and GIF export use a
local FFmpeg installation.

## Demo cues

| Cue | Result |
| --- | --- |
| `demo.chapter(title, options)` | A centered chapter card and optional description |
| `demo.caption(text, options)` | A timed top or bottom caption |
| `demo.shot(name)` | A named PNG at the current product state |
| `demo.mark(name, description)` | A timestamp in the JSON manifest |
| `demo.pause(milliseconds)` | Deliberate breathing room in the recording |

Every normal Playwright action and assertion still works. LaunchTape is a small
fixture around Playwright, not a replacement test runner.

## Output

For a demo called `Create a workspace`, a wide export produces:

```text
launch-assets/
├── create-a-workspace.wide.webm
├── create-a-workspace.wide.mp4
├── create-a-workspace.wide.gif
├── create-a-workspace.wide.finished-workspace.png
└── create-a-workspace.wide.json
```

## Local development

```bash
npm install
npx playwright install chromium
npm test
npm run demo
```

## Roadmap

- branded browser frames and reusable themes;
- automatic dead-time compression;
- clip ranges generated from manifest marks;
- docs/README embeds generated from the manifest;
- locale and color-scheme matrices;
- a lightweight timeline viewer that never owns your source of truth.

## License

MIT
