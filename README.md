# mf-types-path-repro

Minimal reproduction for: when a webpack producer does not configure an explicit `output.path`, `@module-federation/enhanced`'s DTS/type-sharing feature writes the type declarations archive (`@mf-types.zip`) and API file (`@mf-types.d.ts`) into a doubly-nested `dist/dist/` folder instead of directly under the build output. The generated `mf-manifest.json` gives no indication of this extra nesting, so consumers resolving the archive from the manifest cannot find it.

## Steps

```bash
npm install
npm run build
find dist -type f
cat dist/mf-manifest.json
```

## Observed

`webpack.config.js` in this repro has no `output.path` set (webpack falls back to its own default). After building:

```
dist/__federation_expose_Component.js
dist/dist/@mf-types.d.ts
dist/dist/@mf-types.zip
dist/main.js
dist/mf-manifest.json
dist/mf-stats.json
dist/remoteEntry.js
```

`@mf-types.zip` and `@mf-types.d.ts` land under an extra, doubly-nested `dist/dist/` directory — every other emitted asset lands directly under `dist/`.

Meanwhile `dist/mf-manifest.json` reports:

```json
"types": {
  "path": "",
  "name": "",
  "zip": "@mf-types.zip",
  "api": "@mf-types.d.ts"
}
```

`types.path` is an empty string, giving no indication that an extra `dist` segment needs to be prepended to locate the archive. A consumer resolving `@mf-types.zip` using `types.path` + `types.zip` looks for it directly at the manifest's base location and fails to find it, since the real file is one directory deeper.

## For comparison

Setting an explicit `output.path` in `webpack.config.js` (e.g. `path.resolve(__dirname, 'dist')`) avoids the double nesting — the zip is emitted directly at `dist/@mf-types.zip`. But `types.path` is still reported as `""` either way, so the manifest never actually signals which layout is in effect.

## Expected

The type declarations archive should be emitted at a single, predictable location under the compiler's output directory regardless of whether `output.path` is explicitly configured, and `metaData.types.path` should reflect the real relative location so consumers can reliably resolve `@mf-types.zip`.
