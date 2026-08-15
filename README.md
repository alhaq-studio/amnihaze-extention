# AmniHaze Browser Extension

> 🛡️ **AmniHaze (Amni Blur / Mask) — On-device AI visual content protection, real-time image blurring, and screen masking for your browser.**

**AmniHaze Extension** is a privacy-first browser extension designed to protect your eyes and uphold digital purity. It automatically scans images and video frames on any webpage you visit, detects explicit or NSFW content using local **TensorFlow.js** models, and blurs/masks them instantly before they can be displayed.

---

## 🌟 Key Features

*   **Real-Time AI Moderation**: Scans web images and video thumbnails dynamically as the page loads.
*   **100% Local & Private**: Model inference runs entirely in your browser using WebGL/WebAssembly. No image data or URLs are ever transmitted to any remote server.
*   **Smart Blurring & Masking Overlay**: Replaces explicit visual assets with an elegant blur or solid color mask, customizable via your dashboard.
*   **Cross-Browser Support**: Manifest V3 compliant, compatible with Google Chrome, Microsoft Edge, Brave, Mozilla Firefox, and Firefox for Android.

---

## 🛠️ Architecture & Core Components

*   `manifest.json`: Extension entry point configuring permissions, declarative net requests, and scripts.
*   `amngaze-content.js`: Content script injected into webpages to monitor DOM changes, select images, and apply blurring stylesheets.
*   `amngaze-background.js`: Background coordinator managing settings, storage sync, and extension updates.
*   `dist/offscreen.js`: Offscreen/background execution scripts hosting local TensorFlow.js models and weights.
*   `scripts/build-firefox.js`: Build script that dynamically translates the standard Manifest V3 specification into a fully Gecko-compliant and Android-ready Firefox extension manifest.
*   `tfjs/`: Pre-bundled TensorFlow.js models and weights for local execution.
*   `tests/`: Suite for manifest validation and scheduler integrations.

---

## 🚀 Getting Started

### Local Development Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/alhaq-studio/amngaze-extension.git
   ```
2. Open your browser and navigate to the extensions page (e.g., `chrome://extensions` or `about:debugging` in Firefox).
3. Enable **Developer mode** / **Temporary Add-on loading**.
4. Click **Load unpacked** / **Load Temporary Add-on** and select:
   *   `build/chrome/` for Chromium-based browsers (Chrome, Edge, Brave).
   *   `build/firefox/` for Mozilla Firefox.

---

## 🛠️ Development & Building

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Build Chrome and Firefox extensions:**
   ```bash
   npm run build
   ```
   *Note: This script automatically generates browser-specific folders in `build/` and converts the manifest configuration dynamically for Firefox.*
3. **Generate ZIP packages for distribution:**
   ```bash
   npm run dist
   ```
   *Note: Requires system `tar` (built-in on Windows 10/11 and Unix) to ensure POSIX-compliant forward slash path separators in compiled archives.*
4. **Run the local test suite:**
   ```bash
   npm run test
   ```

---

© 2026 Al-Haq Studio & Afrasyaab Meranai. All rights reserved.
