#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const rootDir = path.resolve(__dirname, "..");

console.log("Running AmniHaze settings & port communication tests...");

// 1. Check dist/offscreen.js port listener accepts AmniHaze-img-det-port and AmniHaze-vid-det-port
const offscreenPath = path.join(rootDir, "dist", "offscreen.js");
const offscreenContent = fs.readFileSync(offscreenPath, "utf8");

assert.ok(
  offscreenContent.includes('AmniHaze-img-det-port') && offscreenContent.includes('AmnGaze-img-det-port'),
  "dist/offscreen.js must support both AmniHaze-img-det-port and AmnGaze-img-det-port"
);
assert.ok(
  offscreenContent.includes('AmniHaze-vid-det-port') && offscreenContent.includes('AmnGaze-vid-det-port'),
  "dist/offscreen.js must support both AmniHaze-vid-det-port and AmnGaze-vid-det-port"
);

// 2. Check dist/background.js handles getSettings and updateSettings with response
const bgPath = path.join(rootDir, "dist", "background.js");
const bgContent = fs.readFileSync(bgPath, "utf8");

assert.ok(
  bgContent.includes('AmniHaze-getSettings'),
  "dist/background.js must handle AmniHaze-getSettings message"
);
assert.ok(
  bgContent.includes('key:s,value:n,success:!0') || bgContent.includes('key: s, value: n, success: true'),
  "dist/background.js must respond to updateSettings with key, value, and success"
);

// 3. Check dist/popup/popup.js validates whitelist safely and avoids destructuring errors
const popupPath = path.join(rootDir, "dist", "popup", "popup.js");
const popupContent = fs.readFileSync(popupPath, "utf8");

assert.ok(
  popupContent.includes('Array.isArray(a.whitelist)') || popupContent.includes('Array.isArray(e.whitelist)'),
  "dist/popup/popup.js must ensure whitelist is an array"
);
assert.ok(
  popupContent.includes('if(n&&n.key!==void 0)') || popupContent.includes('if (n && n.key'),
  "dist/popup/popup.js must guard against undefined response in updateSettings"
);

// 4. Check dist/content.js loads settings with defaults and fallback
const contentPath = path.join(rootDir, "dist", "content.js");
const contentContent = fs.readFileSync(contentPath, "utf8");

assert.ok(
  contentContent.includes('AmniHaze-img-det-port'),
  "dist/content.js must connect to AmniHaze-img-det-port"
);
assert.ok(
  contentContent.includes('AmniHaze-vid-det-port'),
  "dist/content.js must connect to AmniHaze-vid-det-port"
);

console.log("AmniHaze settings & port communication tests passed successfully.");
