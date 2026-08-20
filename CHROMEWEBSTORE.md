# Chrome Web Store Listing & Publication Metadata

> **Extension Name:** AmniHaze (Amni Blur / Mask) — AI Visual Content Moderation  
> **Version:** 0.2.0  
> **Category:** Productivity / Privacy & Security / Accessibility  
> **Single Purpose:** On-device AI visual content moderation, real-time smart blurring, and screen masking to protect users from explicit imagery, pornography, and visual distractions across the web.

---

## 1. Store Listing Metadata

### Short Description (Max 132 Characters)
```
On-device AI visual content moderation, smart real-time image & video blurring, and screen masking to protect your browsing.
```

### Detailed Description (Markdown formatted for CWS)
```markdown
🛡️ **AmniHaze — Smart, Privacy-First AI Visual Content Moderation**

AmniHaze (formerly AmnGaze) is an open-source, on-device AI content shield designed to protect your eyes, uphold digital modesty, and maintain focus. It automatically detects and blurs explicit imagery, full nudity, pornography, and distracting visual content across any webpage in real-time — running 100% locally in your browser.

---

### ✨ Key Features

* 👁️ **On-Device AI Moderation:** Powered by lightweight, optimized TensorFlow.js computer vision models. Model inference runs entirely on your local GPU/CPU (WebGL/WASM) with **zero latency** and **zero data transmission**.
* 🛡️ **Full-Frame Pornography & Nudity Protection:** Automatically enforces 100% full-frame blurring on detected explicit content, pornography, and nudity.
* 🚨 **Full-Page Indecency Shield:** Instantly shields all media across a page if explicit content is detected, preventing accidental exposure. Easily customize with **Strict**, **Balanced**, and **Low** sensitivity presets.
* 💬 **Non-Intrusive Safety Toast:** Displays a sleek glassmorphic status pill with one-click **Unshield Page** override if you wish to unblur innocent content on that tab.
* 🎥 **Real-Time Video Blurring:** High-performance video frame inspection for streaming video players across YouTube, social feeds, and web media.
* 🌐 **Adult Network & Domain Blocking:** Bundled offline adult domain blocklist and dynamic network redirect rules to Halal block pages.
* 🔒 **Zero-Knowledge Privacy:** No images, video frames, URLs, browsing history, or personal data ever leave your machine. Completely offline-capable.
* ⚡ **Custom Visual Masks:** Choose between smooth Gaussian blur, grayscale, or solid color privacy covers with adjustable intensity.
* 🎯 **Smart Whitelisting:** Easily toggle protection on or off for trusted educational, news, or work websites.

---

### 🔒 Privacy & Zero-Knowledge Architecture

Your privacy is sacred. Unlike traditional cloud-based content filters:
1. **100% On-Device Processing:** Media is analyzed strictly inside your browser's sandboxed offscreen environment.
2. **Zero Telemetry / Analytics:** No browsing activity or image data is ever logged or sent to remote servers.
3. **Open-Source & Auditable:** Transparent code adhering to the highest privacy and ethical standards.

---

### ⌨️ Shortcuts & Fast Controls
* **Alt + L:** Toggle content blur on the current tab.
* **Alt + K:** Temporarily inspect/unblur a specific hovered element.
```

---

## 2. Permissions Justifications (For Review Team)

| Permission | Plain-English Justification |
| :--- | :--- |
| `storage` | Required to save user preferences (blur intensity, sensitivity presets, solid color choices, whitelist) locally in `chrome.storage.sync` and `chrome.storage.local`. |
| `declarativeNetRequest` | Required to block network requests to known adult/pornographic domains and redirect them to the bundled local safety block page (`src/assets/blocked/blocked.html`). |
| `declarativeNetRequestWithHostAccess` | Required to dynamically update and evaluate domain blocking rules based on user-configured whitelist exceptions. |
| `alarms` | Required to schedule periodic background blocklist cache refreshes and health checks without keeping background service workers permanently active. |
| `tabs` | Required to detect the active tab's hostname for domain whitelisting, show tab-specific shield status, and relay blur settings to the current page. |
| `scripting` | Required to inject content scripts and CSS stylesheets into web pages to apply visual blurring filters and overlays on detected elements. |
| `offscreen` | Required in Manifest V3 to host the TensorFlow.js / WebGL machine learning models and perform local image/video frame tensor classification without blocking UI threads. |
| `contextMenus` | Required to provide a right-click "Report False Positive / False Negative" option for users to report misclassified images locally. |
| `unlimitedStorage` | Required to cache machine learning model weights (`.bin` and `.json`) locally in IndexedDB / Cache API for fast offline execution without redownloading. |

### Host Permissions (`<all_urls>`)
* **Justification:** AmniHaze is a universal visual content shield that must inspect DOM image elements and video players on any website the user browses to protect against explicit content in real-time.

---

## 3. Privacy & Data Use Disclosure

* **Single Purpose Statement:** Real-time visual content moderation and distraction blocking via local AI models.
* **Personal Data Collection:** None. The extension does NOT collect, transmit, sell, or monetize user data of any kind.
* **Remote Code:** None. All TensorFlow.js models, scripts, and stylesheets are 100% pre-bundled inside the extension package.
* **Privacy Policy URL:** `https://alhaq-initiative.org/privacy.html` (and bundled in `docs/PRIVACY_POLICY.md`).

---

## 4. Version History

* **v0.2.0 (August 2026):**
  * Added Real-Time Video Frame Blurring for streaming players.
  * Added Full-Frame Pornography & Nudity Enforcement.
  * Added Full-Page Indecency Shield with Strict/Balanced/Low sensitivity controls.
  * Added Non-intrusive on-page warning toast with one-click page unshielding.
  * Added bundled offline adult domain blocklist and DeclarativeNetRequest dynamic redirect rules.
  * Added Firefox Manifest V3 background module isolation (`dist/background.html`).
  * Performance optimizations with WebGL texture recycling and DOM MutationObserver throttling.
* **v0.1.0 (Initial Release):**
  * Core on-device image blurring using local TensorFlow.js models.
  * Popup dashboard with blur sliders, grayscale, and solid color covers.
