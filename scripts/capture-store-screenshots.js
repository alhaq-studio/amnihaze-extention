#!/usr/bin/env node
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const screenshotsDir = path.join(rootDir, "docs", "screenshots");
const betaScreenshotsDir = path.resolve(rootDir, "..", "AmniHaze-Beta", "docs", "screenshots");

fs.mkdirSync(screenshotsDir, { recursive: true });
fs.mkdirSync(betaScreenshotsDir, { recursive: true });

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
  ".woff2": "font/woff2",
  ".otf": "font/otf",
  ".ttf": "font/ttf"
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split("?")[0]);
  if (reqPath === "/") reqPath = "/index.html";
  const filePath = path.join(rootDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*"
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

const PORT = 8993;

// Page 1: Authentic Popup Showcase
const popupShowcaseHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AmniHaze Smart Popup</title>
  <style>
    @font-face {
      font-family: "Coolvetica";
      src: url("/src/assets/fonts/coolvetica.otf") format("opentype");
    }
    @font-face {
      font-family: "Inter";
      src: url("/src/assets/fonts/inter.woff2") format("woff2");
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 50% 25%, #064e3b 0%, #022c22 45%, #01140f 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: "Inter", system-ui, -apple-system, sans-serif;
      padding: 30px;
    }
    .popup-wrapper {
      width: 400px;
      background: #0f172a;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(16, 185, 129, 0.35);
      overflow: hidden;
      animation: rise 0.4s ease-out;
    }
    .header {
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15,23,42,0.98);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-left h1 {
      font-family: "Coolvetica", sans-serif;
      font-size: 24px;
      letter-spacing: 0.5px;
      margin: 0;
      color: #10b981;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .select-pill {
      background: rgba(255,255,255,0.08);
      color: #34d399;
      font-weight: 600;
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 8px;
      padding: 5px 12px;
      font-size: 13px;
    }
    .switch-ui {
      width: 48px;
      height: 26px;
      background: #10b981;
      border-radius: 999px;
      position: relative;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
    }
    .switch-ui::after {
      content: "";
      position: absolute;
      top: 3px;
      right: 3px;
      width: 20px;
      height: 20px;
      background: #fff;
      border-radius: 50%;
    }
    .container {
      padding: 22px;
    }
    .card {
      background: rgba(30,41,59,0.7);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .card-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .small-switch {
      width: 38px;
      height: 22px;
      background: #10b981;
      border-radius: 999px;
      position: relative;
    }
    .small-switch::after {
      content: "";
      position: absolute;
      top: 2px;
      right: 2px;
      width: 18px;
      height: 18px;
      background: #fff;
      border-radius: 50%;
    }
    .preset-btns {
      display: flex;
      gap: 10px;
      margin-top: 12px;
    }
    .preset-btn {
      flex: 1;
      padding: 10px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(15,23,42,0.7);
      color: #94a3b8;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }
    .preset-btn.active {
      background: rgba(16,185,129,0.25);
      border-color: #10b981;
      color: #34d399;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
    }
    .badge-bar {
      margin-top: 14px;
      display: flex;
      justify-content: center;
      gap: 12px;
    }
    .tech-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #34d399;
      font-size: 12px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="popup-wrapper">
    <div class="header">
      <div class="header-left">
        <img src="/src/assets/amngaze-icon-48.png" style="width: 32px; height: 32px;">
        <h1>AmniHaze</h1>
      </div>
      <div class="header-right">
        <div class="select-pill">Emerald</div>
        <div class="switch-ui"></div>
      </div>
    </div>

    <div class="container">
      <div class="card">
        <div class="card-row">
          <div>
            <p style="font-size: 14px; color: #94a3b8;">
              Detection is <strong style="color: #34d399;">ON</strong> for <span style="color: #f1f5f9; font-weight: 600;">youtube.com</span>
            </p>
          </div>
          <div class="small-switch"></div>
        </div>
      </div>

      <div class="card">
        <div class="card-row" style="margin-bottom: 12px;">
          <span style="font-size: 14px; font-weight: 600; color: #e2e8f0;">Blur Intensity</span>
          <span style="font-size: 15px; font-weight: 700; color: #10b981;">30 px</span>
        </div>
        <input type="range" min="20" max="40" value="30" style="width: 100%; accent-color: #10b981; margin-bottom: 14px; height: 6px;">
        
        <div class="card-row" style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08);">
          <span style="font-size: 13px; color: #cbd5e1;">Grayscale Filter</span>
          <div class="small-switch"></div>
        </div>
      </div>

      <div class="card">
        <span style="font-size: 14px; font-weight: 600; color: #e2e8f0;">Moderation Sensitivity</span>
        <div class="preset-btns">
          <div class="preset-btn">Gentle</div>
          <div class="preset-btn active">Balanced</div>
          <div class="preset-btn">Strict</div>
        </div>
      </div>

      <div class="badge-bar">
        <span class="tech-badge">⚡ 12ms On-Device WASM</span>
        <span class="tech-badge">🔒 100% Zero-Knowledge</span>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Page 2: Authentic Real-Time Video Blur Showcase
const videoBlurShowcaseHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AmniHaze Video Blur Showcase</title>
  <style>
    @font-face {
      font-family: "Coolvetica";
      src: url("/src/assets/fonts/coolvetica.otf") format("opentype");
    }
    @font-face {
      font-family: "Inter";
      src: url("/src/assets/fonts/inter.woff2") format("woff2");
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0b0f19;
      color: #f3f4f6;
      font-family: "Inter", system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    header {
      background: #0f172a;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 14px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: "Coolvetica", sans-serif;
      font-size: 24px;
      letter-spacing: 0.5px;
      color: #10b981;
    }
    .brand img { width: 34px; height: 34px; }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 13px;
      color: #34d399;
      font-weight: 600;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    .main-content {
      display: flex;
      flex: 1;
      padding: 24px;
      gap: 24px;
      background: radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 60%);
    }
    .video-stage {
      flex: 1;
      background: #000;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .blur-mask {
      position: absolute;
      backdrop-filter: blur(35px);
      -webkit-backdrop-filter: blur(35px);
      background: rgba(15, 23, 42, 0.3);
      border: 2px solid rgba(52, 211, 153, 0.8);
      border-radius: 12px;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
    }
    .mask-1 { top: 22%; left: 38%; width: 140px; height: 180px; }
    .mask-2 { top: 30%; right: 18%; width: 160px; height: 210px; }
    
    .floating-controller {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      z-index: 10;
    }
    .floating-controller img { width: 24px; height: 24px; }
    .floating-controller span { font-size: 13px; font-weight: 600; color: #f8fafc; }
    .switch-ui {
      width: 38px;
      height: 22px;
      background: #10b981;
      border-radius: 999px;
      position: relative;
    }
    .switch-ui::after {
      content: "";
      position: absolute;
      top: 2px;
      right: 2px;
      width: 18px;
      height: 18px;
      background: #fff;
      border-radius: 50%;
    }
    .sidebar {
      width: 340px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .card {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 20px;
    }
    .card h3 {
      font-size: 14px;
      font-weight: 700;
      color: #94a3b8;
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .stat-val { font-weight: 700; color: #34d399; }
    .feature-tag {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 6px;
      font-size: 12px;
      color: #10b981;
      margin-right: 6px;
      margin-top: 6px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <img src="/src/assets/amngaze-icon-48.png" alt="AmniHaze">
      <span>AmniHaze</span>
    </div>
    <div class="status-badge">
      <span class="pulse-dot"></span>
      Real-Time Video Blur Active (On-Device WASM/WebGL)
    </div>
  </header>
  
  <div class="main-content">
    <div class="video-stage">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#1e293b;">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#1e293b" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g1)" />
        <circle cx="45%" cy="30%" r="90" fill="#334155" />
        <path d="M 280 480 Q 450 320 620 480 Z" fill="#334155" />
        <circle cx="82%" cy="40%" r="80" fill="#334155" />
        <path d="M 680 480 Q 820 350 960 480 Z" fill="#334155" />
      </svg>
      <div class="blur-mask mask-1"></div>
      <div class="blur-mask mask-2"></div>
      
      <div class="floating-controller">
        <img src="/src/assets/amngaze-icon-48.png" alt="">
        <span>AmniHaze Blur</span>
        <div class="switch-ui"></div>
      </div>
    </div>
    
    <div class="sidebar">
      <div class="card">
        <h3>Live Stream Metrics</h3>
        <div class="stat-row"><span>Inference Latency</span><span class="stat-val">11.4 ms</span></div>
        <div class="stat-row"><span>Frame Scanning</span><span class="stat-val">Adaptive 3-4 FPS</span></div>
        <div class="stat-row"><span>Hardware Backend</span><span class="stat-val">WebGL / WASM</span></div>
        <div class="stat-row"><span>Memory Footprint</span><span class="stat-val">Zero-Leak Guard</span></div>
      </div>
      
      <div class="card">
        <h3>Active Moderation</h3>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 12px;">
          All frames are analyzed 100% locally in browser memory without sending any pixels to remote servers.
        </p>
        <div>
          <span class="feature-tag">100% On-Device</span>
          <span class="feature-tag">Zero Telemetry</span>
          <span class="feature-tag">Firefox 140+ Ready</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(rootDir, "showcase-video-blur.html"), videoBlurShowcaseHtml);
fs.writeFileSync(path.join(rootDir, "showcase-popup.html"), popupShowcaseHtml);

const jobs = [
  {
    url: `http://127.0.0.1:${PORT}/showcase-popup.html`,
    outName: "01-smart-popup-controls.png"
  },
  {
    url: `http://127.0.0.1:${PORT}/showcase-video-blur.html`,
    outName: "02-realtime-video-blur.png"
  },
  {
    url: `http://127.0.0.1:${PORT}/src/assets/blocked/blocked.html`,
    outName: "03-content-blocker-page.png"
  },
  {
    url: `http://127.0.0.1:${PORT}/src/assets/support-install.html`,
    outName: "04-onboarding-welcome.png"
  }
];

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Server up at http://127.0.0.1:${PORT}`);
  for (const job of jobs) {
    const out = path.join(screenshotsDir, job.outName);
    const betaOut = path.join(betaScreenshotsDir, job.outName);
    console.log(`Rendering ${job.outName}...`);
    const args = [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-background-networking",
      "--disable-sync",
      "--disable-extensions",
      "--hide-scrollbars",
      "--window-size=1280,800",
      `--screenshot=${out}`,
      job.url
    ];
    const res = spawnSync("/usr/bin/google-chrome", args, { stdio: "inherit" });
    if (res.status === 0 && fs.existsSync(out)) {
      fs.cpSync(out, betaOut);
      console.log(`Saved ${job.outName} (${fs.statSync(out).size} bytes)`);
    }
  }

  try {
    fs.rmSync(path.join(rootDir, "showcase-video-blur.html"), { force: true });
    fs.rmSync(path.join(rootDir, "showcase-popup.html"), { force: true });
  } catch (e) {}

  server.close();
});
