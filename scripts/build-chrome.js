#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "build", "chrome");

const includeDirs = [
  "assets",
  "css",
  "data",
  "dist",
  "images",
  "netRequestRules",
  "services",
  "src",
  "tfjs"
];

const includeFiles = [
  "manifest.json",
  "LICENSE"
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
  fs.cpSync(source, target, {
    recursive: true,
    force: true,
    filter: (src) => !src.endsWith('.zip') && !src.endsWith('.xpi') && !src.endsWith('.tar') && !src.endsWith('.tgz') && !src.includes('buymeacoffee.min.js')
  });
}

resetDir(outDir);
includeDirs.forEach(copyIfExists);
includeFiles.forEach(copyIfExists);

console.log(`Chrome build created at ${outDir}`);
