# Contributing to LaunchTape

Thanks for helping make product demos reproducible.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

To record the included browser demo:

```bash
npx playwright install chromium
npm run demo
```

## Pull requests

- Keep changes focused and explain the user-facing benefit.
- Add or update tests when behavior changes.
- Do not commit generated recordings, `dist`, or `node_modules`.
- For larger features, open an issue first so the design can be discussed.

By contributing, you agree that your contributions are licensed under the MIT
License.
