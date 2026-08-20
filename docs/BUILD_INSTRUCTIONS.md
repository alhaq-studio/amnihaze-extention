# Build Instructions for AmniHaze Extension

## Prerequisites

- Node.js 18+ or later
- npm (comes with Node.js)

## Build Steps

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build Chrome and Firefox packages:**

   ```bash
   npm run build
   ```

3. **Create ZIP packages for distribution:**

   ```bash
   npm run dist
   ```

4. **Output locations:**
   - Chrome build: `build/chrome/`
   - Firefox build: `build/firefox/`
   - Chrome Zip: `dist/amnihaze-v0.2.0-Chrome.zip`
   - Firefox Zip: `dist/amnihaze-v0.2.0-Firefox.zip`

## Build Process Details

### File Processing

The build scripts perform the following operations:

1. **Copies core extension files** from root to `build/chrome/` and `build/firefox/`:
   - `manifest.json` for Chrome (manifest-v2.json renamed to `manifest.json` for Firefox)
   - All content scripts, HTML files, CSS, and JavaScript files

2. **Copies assets:**
   - `/images` and `/assets` folders with all icons, logos, and onboarding graphics
   - `/services` folder with prayer times and wellness features
   - `/data` folder with blocklists

3. **Creates distribution package:**
   - Zips the `build/chrome/` and `build/firefox/` directories
   - Outputs them to the `dist/` directory

## Verification

After building, verify that:
- `build/chrome/` and `build/firefox/` directories contain the correct assets.
- `dist/` contains both compiled ZIP files.

## Clean Build

To rebuild from scratch:

```bash
npm run build
npm run dist
```
