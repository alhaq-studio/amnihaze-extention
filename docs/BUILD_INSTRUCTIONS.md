# Build & Publication Instructions for AmniHaze Extension

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- npm (bundled with Node.js)
- Standard system `zip` or `tar` utility

---

## Quick Build & Test Workflow

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Full Test Suite:**
   ```bash
   npm test
   ```
   *Runs 8 test suites verifying manifest schema, blocklists, scheduler, video blur, settings communication, and NSFW protection.*

3. **Compile Browser Targets:**
   ```bash
   npm run build
   ```
   *Compiles clean distribution builds for Chromium (`build/chrome/`) and Firefox (`build/firefox/`).*

4. **Create Production Release ZIPs:**
   ```bash
   npm run dist
   ```
   *Packages store-ready `.zip` archives into `dist/`.*

---

## Output Artifacts

| Output Directory / Archive | Target Browser | Description |
| :--- | :--- | :--- |
| `build/chrome/` | Chrome / Edge / Brave | Unpacked Chromium Manifest V3 directory for local testing. |
| `build/firefox/` | Mozilla Firefox | Unpacked Firefox Manifest V3 directory with isolated background page. |
| `dist/amnihaze-v0.2.0-Chrome.zip` | Chrome Web Store / Edge Store | Production zip package stripped of development keys. |
| `dist/amnihaze-v0.2.0-Firefox.zip` | Mozilla Add-ons (AMO) | Gecko-compliant production zip package. |
| `dist/amnihaze-v0.2.0-Source.zip` | Firefox Reviewer Source | Clean source archive for Mozilla add-on review validation. |

---

## Browser Testing Verification Steps

### Google Chrome / Microsoft Edge / Brave
1. Navigate to `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode** toggle.
3. Click **Load unpacked** and select `build/chrome/`.
4. Test real-time image blurring, video streaming blur on YouTube, Full-Page Shield toggle in popup, and warning toast dismiss/unshield actions.

### Mozilla Firefox
1. Navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select `build/firefox/manifest.json`.
4. Test video playback inspection, background network blocking, and settings synchronization.
