# AmniHaze Browser Extension

> 🛡️ **AmniHaze (Amni Blur / Mask) — Privacy-First AI Visual Content Protection, Real-Time Video & Image Blurring, and Screen Masking.**

**AmniHaze** is an open-source, on-device AI browser extension designed to protect your eyes and uphold digital modesty. It automatically scans web images and video streams in real-time, detects explicit content, pornography, full nudity, and visual distractions using local **TensorFlow.js** vision models, and applies instant full-frame blurring and optional full-page shield lockdowns.

---

## 🌟 Key Features

* 👁️ **100% Local & On-Device AI:** Vision models run entirely in your browser using WebGL/WASM. No image data, frames, URLs, or browsing history are ever sent to remote servers.
* 🛡️ **Full-Frame Explicit Content Blur:** When pornography, nudity, or explicit content is detected, AmniHaze enforces 100% full-frame blurring across the entire element container.
* 🚨 **Full-Page Indecency Shield:** Automatically shields all media on a webpage when explicit content is detected. Configure your preferred protection level with **Strict**, **Balanced**, and **Low** sensitivity presets.
* 💬 **Floating Warning Toast & Instant Unshielding:** Displays a non-intrusive glassmorphic safety pill when page shield activates, with a single-click **Unshield Page** override to restore innocent content while keeping explicit items blurred.
* 🎥 **Real-Time Video Blurring:** High-speed frame inspection pipeline for streaming video players across YouTube, social feeds, and web media.
* 🌐 **Adult Domain & Network Blocking:** Bundled offline adult domain blocklist (`data/blocklists/adult-domains.json`) and DeclarativeNetRequest dynamic rules redirecting adult navigation to Halal block pages.
* 🎨 **Custom Visual Masks:** Choose between smooth Gaussian blur, grayscale, or solid color privacy covers with adjustable intensity.
* 🌐 **Cross-Browser Manifest V3:** Compatible with Google Chrome, Microsoft Edge, Brave, Opera, Mozilla Firefox, and Firefox for Android.

---

## 🛠️ Architecture & Core Components

* `manifest.json`: Extension manifest declaring permissions, declarativeNetRequest rules, and content script injection.
* `amngaze-content.js` / `dist/content.js`: Injected content scripts managing DOM observers, canvas frame extractors, stylesheet rules, warning toasts, and element masking.
* `amngaze-background.js` / `dist/background.js`: Background service worker managing settings storage, dynamic declarativeNetRequest rules, and offscreen document lifecycle.
* `dist/offscreen.js`: Sandboxed offscreen environment running TensorFlow.js vision models and tensor inference without blocking UI threads.
* `background.html` / `dist/background.html`: Firefox MV3 isolated background page with ES module scoping.
* `data/blocklists/adult-domains.json`: Bundled offline adult domain dataset.
* `scripts/build-all.js`: Multi-target compiler generating ready-to-load `build/chrome` and `build/firefox` directories.
* `scripts/create-distribution.js`: Packager producing production release zip archives in `dist/`.
* `tests/`: Automated unit and integration test suite covering manifest validation, video blurring, network rules, settings, and page lockdown.

---

## 🚀 Getting Started (Testing Across Browsers)

### 1. Build the Extension
```bash
npm install
npm run build
```

### 2. Load in Chromium (Google Chrome, Microsoft Edge, Brave)
1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select the [`build/chrome/`](file:///media/habib/Dev/PROJECTS/AmnGaze/AmniHaze-Beta/build/chrome) directory.

### 3. Load in Mozilla Firefox
1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select [`build/firefox/manifest.json`](file:///media/habib/Dev/PROJECTS/AmnGaze/AmniHaze-Beta/build/firefox/manifest.json).

---

## 🧪 Automated Testing & Validation

Run the complete test suite:
```bash
npm test
```

Build production distribution packages:
```bash
npm run dist
```
Distribution packages are generated in `dist/`:
- `dist/amnihaze-v0.2.0-Chrome.zip` (For Chrome Web Store / Edge Add-ons)
- `dist/amnihaze-v0.2.0-Firefox.zip` (For Mozilla Add-ons / AMO)
- `dist/amnihaze-v0.2.0-Source.zip` (For Mozilla reviewer validation)

---

## ⌨️ Keyboard Shortcuts

* `Alt + L`: Quick toggle content blur on the current tab.
* `Alt + K`: Temporarily unblur / inspect the hovered element.

---

## 📄 License & Attribution

© 2026 Al-Haq Studio & Afrasyaab Meranai. Released under the MIT License.  
Part of the **Amn Ecosystem** (`AmnShield` & `AmnGaze`).
