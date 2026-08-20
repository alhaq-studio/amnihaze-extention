#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "build", "firefox");

const includeDirs = [
  "assets",
  "css",
  "data",
  "DeenTab",
  "dist",
  "offscreen.html",
  "offscreen.js",
  "images",
  "netRequestRules",
  "scripts",
  "services",
  "src",
  "tfjs"
];

const includeFiles = [
  "background-v2.js",
  "background.html",
  "amngaze-background.js",
  "amngaze-content.js",
  "block.html",
  "constants.js",
  "content.js",
  "guide.html",
  "guide.js",
  "help.html",
  "help.js",
  "LICENSE",
  "polyfill.js",
  "popup.css",
  "popup-ecosystem.js",
  "popup.html",
  "popup.js",
  "privacy.html",
  "privacy.js",
  "settings.html",
  "settings.js",
  "timetable-editor.html",
  "uninstall.html",
  "uninstall.js",
  "welcome.html",
  "welcome.js"
];

function resetDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(relativePath) {
  const source = path.join(rootDir, relativePath);
  if (!fs.existsSync(source)) return;
  const target = path.join(outDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true, force: true, filter: (src) => !src.endsWith('.zip') });
}

resetDir(outDir);
includeDirs.forEach(copyIfExists);
includeFiles.forEach(copyIfExists);

// Dynamically generate manifest.json for Firefox from standard manifest.json
const chromeManifestPath = path.join(rootDir, "manifest.json");
if (fs.existsSync(chromeManifestPath)) {
  const chromeManifest = JSON.parse(fs.readFileSync(chromeManifestPath, "utf8"));
  
  const firefoxManifest = { ...chromeManifest };
  
  // 1. Configure background.page for Firefox MV3
  // Using background.html with <script type="module"> isolates background.js and offscreen.js
  // scopes from each other, preventing variable collision while granting full DOM/canvas/WebGL access.
  if (firefoxManifest.background) {
    delete firefoxManifest.background.service_worker;
    delete firefoxManifest.background.scripts;
    delete firefoxManifest.background.type;
    firefoxManifest.background.page = "dist/background.html";
  }
  
  // 2. Add browser_specific_settings and data_collection_permissions for Firefox
  firefoxManifest.browser_specific_settings = {
    gecko: {
      id: "amngaze@alhaq.studio",
      strict_min_version: "109.0",
      data_collection_permissions: {
        required: ["none"]
      }
    },
    gecko_android: {
      strict_min_version: "142.0"
    }
  };
  
  // 3. Remove Chrome-specific properties and incompatible options
  delete firefoxManifest.update_url;
  delete firefoxManifest.minimum_chrome_version;
  delete firefoxManifest.incognito; // incognito: split is not supported in Firefox
  
  // 4. Remove offscreen permission since Firefox does not support/need it
  if (Array.isArray(firefoxManifest.permissions)) {
    firefoxManifest.permissions = firefoxManifest.permissions.filter(p => p !== "offscreen");
  }
  
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(firefoxManifest, null, 2), "utf8");
  console.log("Firefox manifest.json generated successfully.");
} else {
  console.error("Error: manifest.json not found in root.");
  process.exit(1);
}

console.log(`Firefox build created at ${outDir}`);
