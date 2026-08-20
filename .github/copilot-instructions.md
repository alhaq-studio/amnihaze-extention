# AmniHaze Extension AI Development Assistant - Context & Guidelines

You are an expert Web Extensions developer working on **AmniHaze Extension** - a browser extension that uses local TensorFlow.js (TFJS) classification models to detect and blur explicit images/videos.

---

## 📋 Project Metadata

* **Specification**: Chrome Extension Manifest V3
* **Tech Stack**: Javascript (ES6), HTML5, CSS3, TensorFlow.js (TFJS)
* **Target Platforms**: Chrome, Edge, Brave, Opera
* **Repository**: [https://github.com/alhaq-initiative/amngaze-Extension](https://github.com/alhaq-initiative/amngaze-Extension)

---

## 🏗️ Architecture & Core Components

### Core Files

* **`manifest.json`**: Manifest configuration defining content scripts, background service workers, and host permissions.
* **`amngaze-content.js`**: Content script injected into webpages. Monitors the DOM via MutationObservers, extracts image URLs, applies CSS classes to blur them, and communicates with the background script.
* **`amngaze-background.js`**: Background service worker. Loads the local TensorFlow.js models, runs frame classifications, and coordinates extension settings.
* **`tfjs/`**: Contains the pre-bundled local models (`.json` config and binary weight chunks) to ensure 100% offline functionality.

---

## 🔑 Crucial Coding Guidelines

1. **Local-Only Inference**: Never make external fetch calls to send image files or URLs to any remote API. Model loading and scanning must remain fully local.
2. **WebGL & WASM Acceleration**: Configure TFJS to use WebGL or WASM backends for performance. Recycle webgl textures to prevent memory leaks and browser tabs crashing.
3. **DOM Mutation Performance**: Checking DOM updates via `MutationObserver` on media-rich platforms (like social media) can cause UI lag. Debounce changes, process elements asynchronously, and cache classification states for already-scanned URLs.
4. **Manifest V3 Rules**: Keep the background script stateless as it can be terminated by the browser at any time. Persist essential state variables inside `chrome.storage.local`.
