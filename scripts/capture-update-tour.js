const puppeteer = require("puppeteer");
const path = require("path");
const http = require("http");
const fs = require("fs");

const distDir = path.resolve(__dirname, "..", "dist");
const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".otf": "font/otf"
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split("?")[0];
  let filePath = path.join(distDir, reqPath === "/" ? "options/options.html" : reqPath.replace(/^\/dist\//, ""));
  if (!fs.existsSync(filePath)) {
    filePath = path.join(path.resolve(__dirname, ".."), reqPath);
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end("Not found: " + req.url);
  }
});

server.listen(8994, async () => {
  console.log("Server up at http://127.0.0.1:8994");
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

    await page.goto("http://127.0.0.1:8994/options/options.html?tour=update", { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 1200));

    const outPath = path.resolve(__dirname, "..", "docs", "screenshots", "05-update-tour-modern.png");
    await page.screenshot({ path: outPath, fullPage: false });
    console.log("Captured modern update tour at:", outPath);

    await browser.close();
    server.close();
  } catch (err) {
    console.error("Screenshot error:", err);
    server.close();
    process.exit(1);
  }
});
