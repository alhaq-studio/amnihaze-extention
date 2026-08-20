# Original User Request

## 2026-08-07T04:28:15Z

<USER_REQUEST>
Comprehensive architectural cleanup, build modern standardisation (Vite/Rollup or Esbuild for Manifest V3), root directory decluttering, cross-browser compatibility hardening, and robust unit/integration testing for AmniHaze Extension.

Working directory: d:/PROJECTS/AmniHaze/AmniHaze-Extention
Integrity mode: development

## Requirements

### R1. Modern Build & Bundling Pipeline
- Replace custom script-based file-copying (`scripts/build-all.js`, `build-chrome.js`, `build-firefox.js`) with a modern, industry-standard extension bundler (e.g. Vite with `@crxjs/vite-plugin` or Esbuild/Rollup).
- Produce clean, optimized builds for Chrome (MV3) and Firefox (MV3) into `dist/chrome` and `dist/firefox` (or `build/chrome` and `build/firefox`).
- Package dependencies cleanly via NPM rather than unchecked static files where appropriate.

### R2. Codebase Organization & Root Decluttering
- Restructure project directory by moving loose root JS/HTML files (`amngaze-background.js`, `amngaze-content.js`, `block.html`, `constants.js`, `guide.html`, `help.html`, `privacy.html`, `settings.html`, `welcome.html`, etc.) into structured directories (`src/background`, `src/content`, `src/pages`, `src/services`, `src/shared`).
- Remove redundant, leftover, or scratch files (`scratch/`, `extracted_zip/`, obsolete root duplicates).

### R3. Manifest V3 & Multi-Browser Hardening
- Audit `manifest.json` to ensure 100% Manifest V3 compliance across Chrome and Firefox.
- Resolve incognito mode warnings (`"incognito": "split"`), CSP permissions, offscreen document handling, and declarativeNetRequest rules.
- Maintain seamless web accessible resources scoping for TFJS / NSFWJS TensorFlow models.

### R4. Automated Testing & Quality Assurance
- Upgrade test suite to use a proper runner (Vitest or Jest) with browser API mocks (`chrome.*` / `browser.*`).
- Ensure all existing unit, integration, manifest, and scheduler tests pass reliably under automated execution (`npm test`).

## Acceptance Criteria

### Build & Pipeline
- [ ] `npm run build` executes without errors and outputs valid MV3 extensions in `build/chrome` and `build/firefox`.
- [ ] Extension source code builds without loose root file copy dependencies.

### Directory Structure
- [ ] Root directory contains only essential configuration files (`package.json`, `manifest.json`, `README.md`, `.gitignore`, bundler config).
- [ ] Source code is cleanly modularized under `src/`.

### Quality & Testing
- [ ] `npm test` runs all unit and integration tests cleanly with 100% pass rate.
- [ ] Chrome DevTools manifest validation passes with zero warnings or deprecation notices.
</USER_REQUEST>
