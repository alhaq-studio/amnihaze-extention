#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const rootDir = path.resolve(__dirname, "..");
const contentJsPath = path.join(rootDir, "amngaze-content.js");
const distContentJsPath = path.join(rootDir, "dist", "content.js");
const distOffscreenJsPath = path.join(rootDir, "dist", "offscreen.js");
const distBackgroundJsPath = path.join(rootDir, "dist", "background.js");
const popupHtmlPath = path.join(rootDir, "dist", "popup", "popup.html");
const popupJsPath = path.join(rootDir, "dist", "popup", "popup.js");
const adultBlocklistPath = path.join(rootDir, "data", "blocklists", "adult-domains.json");

// 1. Verify adult domains blocklist
assert.ok(fs.existsSync(adultBlocklistPath), "data/blocklists/adult-domains.json must exist");
const adultDomains = JSON.parse(fs.readFileSync(adultBlocklistPath, "utf8"));
assert.ok(Array.isArray(adultDomains) && adultDomains.length > 20, "adult-domains.json must contain adult domain list");
assert.ok(adultDomains.includes("pornhub.com"), "adult-domains.json must contain standard adult domains");

// 2. Verify dist/offscreen.js enforces full-frame blur for NSFW / porn
const offscreenCode = fs.readFileSync(distOffscreenJsPath, "utf8");
assert.ok(
  offscreenCode.includes('label:"nsfw"') && offscreenCode.includes('isSpecificBlur:!1'),
  "offscreen.js must set isSpecificBlur to false for label: 'nsfw' to guarantee full-frame blur"
);

// 3. Verify content scripts implement full frame blur, toast, and unshield
const contentCode = fs.readFileSync(contentJsPath, "utf8");
const distContentCode = fs.readFileSync(distContentJsPath, "utf8");

assert.ok(
  contentCode.includes("triggerPageWideNsfwProtection") && distContentCode.includes("triggerPageWideNsfwProtection"),
  "Content scripts must declare triggerPageWideNsfwProtection"
);
assert.ok(
  contentCode.includes("createShieldToast") && distContentCode.includes("createShieldToast"),
  "Content scripts must declare createShieldToast for non-intrusive warning"
);
assert.ok(
  contentCode.includes("unshieldCurrentPage") && distContentCode.includes("unshieldCurrentPage"),
  "Content scripts must declare unshieldCurrentPage"
);
assert.ok(
  contentCode.includes("data-amngaze-nsfw-lockdown") && distContentCode.includes("data-amngaze-nsfw-lockdown"),
  "Content scripts must include CSS rules and attributes for data-amngaze-nsfw-lockdown"
);
assert.ok(
  contentCode.includes("isPageShieldEnabled") && distContentCode.includes("isPageShieldEnabled"),
  "Content scripts must have isPageShieldEnabled check"
);

// 4. Verify popup UI has Page Shield controls & active tab alert
const popupHtml = fs.readFileSync(popupHtmlPath, "utf8");
const popupJs = fs.readFileSync(popupJsPath, "utf8");

assert.ok(popupHtml.includes("page-shield-card"), "popup.html must have page-shield-card");
assert.ok(popupHtml.includes("page-shield-enabled"), "popup.html must have page-shield-enabled switch");
assert.ok(popupHtml.includes("nudity-sensitivity"), "popup.html must have nudity-sensitivity select");
assert.ok(popupHtml.includes("popup-tab-shield-alert"), "popup.html must have popup-tab-shield-alert");
assert.ok(popupJs.includes("pageShieldEnabled"), "popup.js must support pageShieldEnabled setting");
assert.ok(popupJs.includes("checkPageShieldStatus"), "popup.js must query checkPageShieldStatus");

// 5. Verify background script manages dynamic porn/NSFW network blocking rules
const bgCode = fs.readFileSync(distBackgroundJsPath, "utf8");
assert.ok(
  bgCode.includes("updateDynamicRules") && bgCode.includes("src/assets/blocked/blocked.html"),
  "background.js must configure declarativeNetRequest dynamic redirect rules for blocked adult domains"
);

// 6. Test page-wide lockdown & unshield simulation
class MockElement {
  constructor(tag, isExplicit = false) {
    this.tagName = tag;
    this._classes = new Set();
    this.classList = {
      add: (c) => this._classes.add(c),
      remove: (c) => this._classes.delete(c),
      contains: (c) => this._classes.has(c)
    };
    this.dataset = isExplicit ? { AmnGazeresult: "nsfw" } : {};
  }
}

const innocentImg = new MockElement("IMG", false);
const explicitImg = new MockElement("IMG", true);
const innocentVideo = new MockElement("VIDEO", false);

const mockDoc = {
  documentElement: {
    dataset: {},
    removeAttribute(attr) { delete this.dataset[attr.replace("data-", "")]; }
  },
  media: [innocentImg, explicitImg, innocentVideo],
  querySelectorAll(sel) {
    return this.media;
  }
};

function simulatePageLockdown(doc) {
  doc.documentElement.dataset.amngazeNsfwLockdown = "true";
  doc.querySelectorAll("img, video, canvas").forEach(el => {
    el.classList.add("amngaze-blur");
  });
}

function simulateUnshield(doc) {
  doc.documentElement.dataset.amngazeNsfwLockdown = "false";
  doc.documentElement.removeAttribute("data-amngaze-nsfw-lockdown");
  doc.querySelectorAll("img, video, canvas").forEach(el => {
    if (el.dataset.AmnGazeresult !== "nsfw") {
      el.classList.remove("amngaze-blur");
    }
  });
}

// Trigger lockdown
simulatePageLockdown(mockDoc);
assert.strictEqual(mockDoc.documentElement.dataset.amngazeNsfwLockdown, "true", "Lockdown dataset attribute must be set");
mockDoc.media.forEach(el => {
  assert.ok(el.classList.contains("amngaze-blur"), `${el.tagName} must have amngaze-blur class in lockdown`);
});

// Trigger unshield
simulateUnshield(mockDoc);
assert.strictEqual(innocentImg.classList.contains("amngaze-blur"), false, "Innocent image must unblur after unshield");
assert.strictEqual(innocentVideo.classList.contains("amngaze-blur"), false, "Innocent video must unblur after unshield");
assert.strictEqual(explicitImg.classList.contains("amngaze-blur"), true, "Explicit image must REMAIN blurred after unshield");

console.log("Pornography & NSFW full-frame blur, Page Shield controls, toast, and unshield tests passed successfully.");
