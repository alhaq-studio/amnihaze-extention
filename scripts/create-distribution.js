#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const buildDir = path.join(rootDir, "build");
const distDir = path.join(rootDir, "dist");
const pkg = require(path.join(rootDir, "package.json"));

function zipDirectory(sourceDir, outPath) {
  if (fs.existsSync(outPath)) {
    fs.rmSync(outPath, { force: true });
  }
  if (process.platform === "win32") {
    const result = spawnSync("powershell", ["-NoProfile", "-Command", `Compress-Archive -Path '${sourceDir}\\*' -DestinationPath '${outPath}' -Force`], { stdio: "inherit" });
    if (result.status !== 0) {
      throw new Error(`Failed to create archive: ${outPath}`);
    }
  } else {
    let result = spawnSync("zip", ["-r", outPath, "."], { cwd: sourceDir, stdio: "inherit" });
    if (result.status !== 0) {
      result = spawnSync("tar", ["-a", "-c", "-f", outPath, "-C", sourceDir, "."], { stdio: "inherit" });
      if (result.status !== 0) {
        throw new Error(`Failed to create archive: ${outPath}`);
      }
    }
  }
}

function main() {
  fs.mkdirSync(distDir, { recursive: true });
  const version = pkg.version || "0.0.0";
  const chromeSrc = path.join(buildDir, "chrome");
  const firefoxSrc = path.join(buildDir, "firefox");

  if (!fs.existsSync(chromeSrc) || !fs.existsSync(firefoxSrc)) {
    throw new Error("Build outputs are missing. Run `npm run build` first.");
  }

  const chromeCwsSrc = path.join(buildDir, "chrome-cws");
  if (fs.existsSync(chromeCwsSrc)) fs.rmSync(chromeCwsSrc, { recursive: true, force: true });
  fs.cpSync(chromeSrc, chromeCwsSrc, { recursive: true });

  const manifestPath = path.join(chromeCwsSrc, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    delete manifest.key;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  zipDirectory(chromeCwsSrc, path.join(distDir, `amngaze-v${version}-Chrome.zip`));
  zipDirectory(firefoxSrc, path.join(distDir, `amngaze-v${version}-Firefox.zip`));

  // Also build the source code package for Firefox store reviewer validation
  console.log("Creating source code distribution package...");
  const sourceOut = path.join(distDir, `amngaze-v${version}-Source.zip`);
  if (fs.existsSync(sourceOut)) {
    fs.rmSync(sourceOut, { force: true });
  }
  let result = spawnSync("zip", [
    "-r", sourceOut, ".",
    "-x", "node_modules/*", "build/*", "dist/*", "extracted_zip/*", ".git/*", ".github/*", ".gemini/*", "scratch/*"
  ], {
    cwd: rootDir,
    stdio: "inherit"
  });
  if (result.status !== 0) {
    result = spawnSync("tar", [
      "-a", "-c", "-f", sourceOut,
      "--exclude=node_modules",
      "--exclude=build",
      "--exclude=dist",
      "--exclude=extracted_zip",
      "--exclude=.git",
      "--exclude=.github",
      "--exclude=.gemini",
      "--exclude=scratch",
      "."
    ], {
      cwd: rootDir,
      stdio: "inherit"
    });
  }
  if (result.status !== 0) {
    throw new Error(`Failed to create source code archive: ${sourceOut}`);
  }

  console.log("Distribution packages created successfully.");
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
