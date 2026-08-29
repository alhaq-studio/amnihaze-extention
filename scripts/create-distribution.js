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
    const normalizedZipPath = path.resolve(outPath).replace(/'/g, "''");
    const normalizedSrcDir = path.resolve(sourceDir).replace(/'/g, "''");
    const psScript = `
      Add-Type -AssemblyName System.IO.Compression;
      Add-Type -AssemblyName System.IO.Compression.FileSystem;
      $fileStream = [System.IO.File]::Open('${normalizedZipPath}', [System.IO.FileMode]::Create);
      $zip = New-Object System.IO.Compression.ZipArchive($fileStream, [System.IO.Compression.ZipArchiveMode]::Create);
      $src = (Get-Item '${normalizedSrcDir}').FullName;
      Get-ChildItem -Path $src -Recurse | ForEach-Object {
        if (-not $_.PSIsContainer) {
          $relPath = $_.FullName.Substring($src.Length + 1).Replace('\\', '/');
          [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $relPath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null;
        }
      };
      $zip.Dispose();
      $fileStream.Dispose();
    `;
    const result = spawnSync("powershell", ["-NoProfile", "-Command", psScript], { stdio: "inherit" });
    if (result.status !== 0) {
      throw new Error(`Failed to create archive: ${outPath}`);
    }
  } else {
    const result = spawnSync("zip", ["-r", outPath, "."], { cwd: sourceDir, stdio: "inherit" });
    if (result.status !== 0) {
      throw new Error(`Failed to create archive: ${outPath}`);
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
    delete manifest.update_url;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  const edgeZip = path.join(distDir, `amnihaze-v${version}-Edge.zip`);
  const chromeZip = path.join(distDir, `amnihaze-v${version}-Chrome.zip`);
  const firefoxZip = path.join(distDir, `amnihaze-v${version}-Firefox.zip`);

  zipDirectory(chromeCwsSrc, chromeZip);
  zipDirectory(chromeCwsSrc, edgeZip);
  zipDirectory(firefoxSrc, firefoxZip);

  // Provide canonical fixed names for CI publishing
  fs.copyFileSync(edgeZip, path.join(distDir, "amnihaze-Edge.zip"));
  fs.copyFileSync(chromeZip, path.join(distDir, "amnihaze-Chrome.zip"));
  fs.copyFileSync(firefoxZip, path.join(distDir, "amnihaze-Firefox.zip"));

  // Also build the source code package for Firefox store reviewer validation
  console.log("Creating source code distribution package...");
  const sourceOut = path.join(distDir, `amnihaze-v${version}-Source.zip`);
  if (fs.existsSync(sourceOut)) {
    fs.rmSync(sourceOut, { force: true });
  }
  let result = spawnSync("tar", [
    "-a", "-c", "-f", sourceOut,
    "--exclude=node_modules",
    "--exclude=build",
    "--exclude=dist",
    "--exclude=extracted_zip",
    "--exclude=.git",
    "--exclude=.github",
    "--exclude=.gemini",
    "--exclude=scratch",
    "-C", rootDir, "."
  ], { stdio: "inherit" });

  if (result.status !== 0) {
    result = spawnSync("zip", [
      "-r", sourceOut, ".",
      "-x", "node_modules/*", "build/*", "dist/*", "extracted_zip/*", ".git/*", ".github/*", ".gemini/*", "scratch/*"
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
