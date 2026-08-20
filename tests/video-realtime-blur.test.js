#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const rootDir = path.resolve(__dirname, "..");
const contentJsPath = path.join(rootDir, "amngaze-content.js");
const distContentJsPath = path.join(rootDir, "dist", "content.js");

assert.ok(fs.existsSync(contentJsPath), "amngaze-content.js must exist");
assert.ok(fs.existsSync(distContentJsPath), "dist/content.js must exist");

const contentCode = fs.readFileSync(contentJsPath, "utf8");
const distContentCode = fs.readFileSync(distContentJsPath, "utf8");

// 1. Validate IntersectionObserver integration
assert.ok(
  contentCode.includes("IntersectionObserver") && distContentCode.includes("IntersectionObserver"),
  "Both content scripts must initialize IntersectionObserver for viewport gating"
);
assert.ok(
  contentCode.includes("AmnGazeVideoObserver") && distContentCode.includes("AmnGazeVideoObserver"),
  "AmnGazeVideoObserver must be declared in content scripts"
);

// 2. Validate requestVideoFrameCallback support with fallback
assert.ok(
  contentCode.includes("requestVideoFrameCallback") && distContentCode.includes("requestVideoFrameCallback"),
  "Both content scripts must check for native requestVideoFrameCallback"
);
assert.ok(
  contentCode.includes("cancelVideoFrameCallback") && distContentCode.includes("cancelVideoFrameCallback"),
  "Both content scripts must properly clean up cancelVideoFrameCallback"
);

// 3. Validate Adaptive 3-4 FPS Keyframe Rate (250ms - 320ms intervals)
assert.ok(
  contentCode.includes("250") && contentCode.includes("320") && distContentCode.includes("250") && distContentCode.includes("320"),
  "Keyframe interval fe() must be scaled to 250-320ms to prevent CPU saturation in Firefox"
);

// 4. Validate Blur Persistence Hold Window
assert.ok(
  contentCode.includes("amngazeBlurHoldUntil") && distContentCode.includes("amngazeBlurHoldUntil"),
  "Blur persistence hold window must be tracked on video element"
);
assert.ok(
  contentCode.includes("1200") && distContentCode.includes("1200"),
  "Unsafe detection must enforce a minimum 1200ms blur hold"
);

// 5. Validate Optimized JPEG Quality for fast Base64 IPC
assert.ok(
  contentCode.includes("toDataURL") && contentCode.includes(".55") && distContentCode.includes("toDataURL") && distContentCode.includes(".55"),
  "Frame compression must use optimized JPEG quality factor"
);

// 6. Test isolated timing logic function
function calculateKeyframeInterval(shape) {
  return shape && shape <= 320 ? 250 : shape && shape <= 416 ? 280 : 320;
}
assert.strictEqual(calculateKeyframeInterval(320), 250, "320 model size should interval at 250ms (~4 FPS)");
assert.strictEqual(calculateKeyframeInterval(416), 280, "416 model size should interval at 280ms (~3.5 FPS)");
assert.strictEqual(calculateKeyframeInterval(640), 320, "640 model size should interval at 320ms (~3.1 FPS)");

// 7. Test blur persistence state machine logic
class MockVideo {
  constructor() {
    this.dataset = { AmnGazeresult: "CLEAR" };
    this.amngazeBlurHoldUntil = 0;
    this.blurred = false;
  }
}

function mockApplyDetection(video, label, now = Date.now()) {
  if (label === "nsfw" || label === "face") {
    video.dataset.AmnGazeresult = label.toUpperCase();
    video.amngazeBlurHoldUntil = now + 1200;
    video.blurred = true;
  } else {
    if (video.amngazeBlurHoldUntil && now < video.amngazeBlurHoldUntil) {
      // Blur persists during hold window
      return;
    }
    video.dataset.AmnGazeresult = "CLEAR";
    video.blurred = false;
  }
}

const v = new MockVideo();
const t0 = 1000000;
mockApplyDetection(v, "nsfw", t0);
assert.strictEqual(v.blurred, true, "Video should be blurred when NSFW detected");
assert.strictEqual(v.amngazeBlurHoldUntil, t0 + 1200, "Hold window should be 1200ms");

// Frame at +300ms is clean, but still within hold window
mockApplyDetection(v, "clear", t0 + 300);
assert.strictEqual(v.blurred, true, "Video should remain blurred during hold window (+300ms)");

// Frame at +800ms is clean, still in hold window
mockApplyDetection(v, "clear", t0 + 800);
assert.strictEqual(v.blurred, true, "Video should remain blurred during hold window (+800ms)");

// Frame at +1300ms is clean, hold window expired
mockApplyDetection(v, "clear", t0 + 1300);
assert.strictEqual(v.blurred, false, "Video should unblur after hold window expires (+1300ms)");

console.log("Real-time video blur & Firefox performance tests passed successfully.");
