/**
 * amngaze-background.js
 * AI content blur background manager adapted from AmniHaze.
 */

const SETTINGS_KEY = "AmniHaze-settings";

// Default Settings
const DEFAULT_SETTINGS = {
    status: false,
    blurryStartMode: false,
    blurAmount: 30,
    blurImages: true,
    blurVideos: true,
    blurMale: false,
    blurFemale: true,
    specificBlur: true,
    unblurImages: false,
    unblurVideos: false,
    gray: false,
    useSolidColor: false,
    solidColor: "#808080",
    strictness: 0.4,
    whitelist: [],
    detectionModel: "vZNq2WHrFm7b",
    scoreThreshold: 0.4,
    hideVideoToggle: false,
    passwordProtectionEnabled: false,
    uninstallPreventionEnabled: false,
    preventIncognitoGuestEnabled: false,
    protectionMode: "free",
    pageShieldEnabled: true,
    nuditySensitivity: "balanced",
    showShieldToast: true,
    syncRulesEnabled: true,
    syncAppUsageEnabled: true,
    syncWebUsageEnabled: true,
    smartRecommendationsEnabled: true
};

let creatingOffscreen = null;

// Initialize settings
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get([SETTINGS_KEY], (res) => {
        if (!res[SETTINGS_KEY]) {
            chrome.storage.sync.set({ [SETTINGS_KEY]: DEFAULT_SETTINGS });
        } else {
            // Merge defaults for new keys
            const merged = { ...DEFAULT_SETTINGS, ...res[SETTINGS_KEY] };
            chrome.storage.sync.set({ [SETTINGS_KEY]: merged });
        }
    });
});

// Create/manage offscreen document
async function ensureOffscreenDocument() {
    if (typeof chrome.offscreen === "undefined") {
        console.log("[amngaze-BG] Offscreen API not supported on this browser.");
        return;
    }
    try {
        const hasDoc = await chrome.offscreen.hasDocument();
        if (hasDoc) return;

        if (creatingOffscreen) {
            await creatingOffscreen;
            return;
        }

        creatingOffscreen = chrome.offscreen.createDocument({
            url: chrome.runtime.getURL("dist/offscreen.html"),
            reasons: ["DOM_PARSER", "IFRAME_SCRIPTING"],
            justification: "Process Images and Firebase Authentication"
        });

        await creatingOffscreen;
        console.log("[amngaze-BG] Offscreen document created.");
    } catch (err) {
        if (!err.message.includes("single")) {
            console.error("[amngaze-BG] Error creating offscreen document:", err);
        }
    } finally {
        creatingOffscreen = null;
    }
}

// Recreate offscreen document helper
async function recreateOffscreen() {
    if (typeof chrome.offscreen === "undefined") return;
    try {
        const hasDoc = await chrome.offscreen.hasDocument();
        if (hasDoc) {
            await chrome.offscreen.closeDocument();
        }
    } catch (e) { }
    setTimeout(() => {
        ensureOffscreenDocument();
    }, 1000);
}

// Watch settings changes and broadcast to tabs/offscreen
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    const settingsChange = changes["AmniHaze-settings"] || changes["amngaze-settings"];
    if (!settingsChange) return;

    const oldValue = settingsChange.oldValue || {};
    const newValue = settingsChange.newValue || {};

    // Check if status is changed to true
    if (newValue.status && !oldValue.status) {
        ensureOffscreenDocument();
    } else if (!newValue.status && oldValue.status) {
        // Close if disabled
        if (typeof chrome.offscreen !== "undefined") {
            chrome.offscreen.hasDocument().then(hasDoc => {
                if (hasDoc) chrome.offscreen.closeDocument();
            }).catch(() => { });
        }
    }

    // Broadcast incremental updates (updateSettings) to all tabs and extension runtimes
    for (let key in newValue) {
        if (newValue[key] !== oldValue[key]) {
            const updateMsg = {
                type: "updateSettings",
                newSetting: { key: key, value: newValue[key] }
            };

            // Broadcast to tabs
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach((tab) => {
                    try {
                        chrome.tabs.sendMessage(tab.id, updateMsg).catch(() => { });
                    } catch (e) { }
                });
            });

            // Broadcast to offscreen
            try {
                chrome.runtime.sendMessage(updateMsg).catch(() => { });
            } catch (e) { }
        }
    }
});

// Setup context menus
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.remove("report-image", () => {
        const err = chrome.runtime.lastError; // silence errors
        chrome.contextMenus.create({
            id: "report-image",
            title: "AmniHaze - Report Image",
            contexts: ["image"],
            enabled: true
        });
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "report-image") {
        // Send a request to get image details from content script
        chrome.tabs.sendMessage(tab.id, {
            type: "get-reported-image-info",
            url: info.srcUrl
        }, (response) => {
            const originalSrc = response?.originalSrc;
            injectReportModal(tab.id, info.srcUrl, tab.url, originalSrc);
        });
    }
});

// Function to inject report modal
function injectReportModal(tabId, srcUrl, pageUrl, originalSrc) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (src, page, origSrc, extUrl) => {
            let existing = document.getElementById("amngaze-report-modal");
            if (existing) existing.remove();

            const html = `
            <div class="amngaze-report-modal" dir="ltr">
              <div class="amngaze-modal-content">
                <div class="amngaze-modal-header">
                  <div class="amngaze-header-title">
                    <img src="${extUrl}src/assets/amngaze-icon-48.png" width="24" height="24" alt="AmniHaze">
                    <h3>Report Image</h3>
                  </div>
                  <button class="amngaze-close-button">&times;</button>
                </div>
                <div class="amngaze-modal-body">
                  <p class="amngaze-description">Help us improve our detection by reporting any issues.</p>
                  <div class="amngaze-image-section">
                    <button class="amngaze-toggle-image amngaze-button amngaze-button-secondary">
                      <span class="amngaze-toggle-text">Show Image</span>
                      <span class="amngaze-toggle-arrow">▶</span>
                    </button>
                    <div class="amngaze-image-preview" style="display: none;">
                      <img src="${src}" alt="Content preview">
                    </div>
                  </div>
                  <div class="amngaze-report-options">
                    <p class="amngaze-label">What's wrong with this detection?</p>
                    <label class="amngaze-radio-label">
                      <input type="radio" name="report-type" value="false-positive">
                      <span>False Positive - Content was wrongly blurred</span>
                    </label>
                    <label class="amngaze-radio-label">
                      <input type="radio" name="report-type" value="false-negative">
                      <span>False Negative - Inappropriate content wasn't blurred</span>
                    </label>
                  </div>
                </div>
                <div class="amngaze-modal-footer">
                  <button class="amngaze-button amngaze-button-secondary amngaze-cancel-button">Cancel</button>
                  <button class="amngaze-button amngaze-button-primary amngaze-submit-button" disabled>Send Report</button>
                </div>
              </div>
            </div>
            `;

            const container = document.createElement("div");
            container.id = "amngaze-report-modal";
            const shadow = container.attachShadow({ mode: "closed" });

            const style = document.createElement("style");
            style.textContent = `
            :host { all: initial; display: block; }
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, sans-serif; }
            .amngaze-report-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999999; }
            .amngaze-modal-content { background: white; border-radius: 8px; width: 90%; max-width: 500px; max-height: 90vh; overflow: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); color: #333; }
            .amngaze-modal-header { padding: 16px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
            .amngaze-header-title { display: flex; align-items: center; gap: 8px; }
            .amngaze-header-title h3 { margin: 0; font-size: 18px; font-weight: 600; }
            .amngaze-close-button { border: none; background: none; font-size: 24px; cursor: pointer; opacity: 0.6; }
            .amngaze-close-button:hover { opacity: 1; }
            .amngaze-modal-body { padding: 16px; }
            .amngaze-description { margin: 0 0 16px; opacity: 0.7; font-size: 14px; }
            .amngaze-radio-label { display: flex; align-items: flex-start; padding: 8px 0; cursor: pointer; gap: 12px; }
            .amngaze-radio-label input[type="radio"] { margin-top: 3px; }
            .amngaze-radio-label span { font-size: 14px; color: #444; }
            .amngaze-report-options { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
            .amngaze-label { font-weight: 500; margin-bottom: 8px; font-size: 14px; }
            .amngaze-image-section { margin-bottom: 16px; }
            .amngaze-toggle-image { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; font-size: 14px; margin-bottom: 8px; }
            .amngaze-toggle-arrow { font-size: 12px; transition: transform 0.2s ease; }
            .amngaze-toggle-image.expanded .amngaze-toggle-arrow { transform: rotate(90deg); }
            .amngaze-image-preview { background: #f5f5f5; border-radius: 4px; text-align: center; padding: 8px; }
            .amngaze-image-preview img { max-width: 100%; max-height: 300px; object-fit: contain; }
            .amngaze-modal-footer { padding: 16px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 8px; }
            .amngaze-button { padding: 8px 16px; border-radius: 4px; border: none; font-weight: 500; cursor: pointer; font-size: 14px; }
            .amngaze-button:disabled { opacity: 0.5; cursor: not-allowed; }
            .amngaze-button-primary { background: #2196f3; color: white; }
            .amngaze-button-primary:not(:disabled):hover { background: #1976d2; }
            .amngaze-button-secondary { background: #f5f5f5; color: #333; }
            .amngaze-button-secondary:hover { background: #e5e5e5; }
            .amngaze-success-message { text-align: center; padding: 32px 16px; }
            .amngaze-success-message h3 { color: #4caf50; margin: 0 0 8px; }
            `;

            shadow.innerHTML = html;
            shadow.prepend(style);
            document.body.appendChild(container);

            const modal = shadow.querySelector(".amngaze-report-modal");
            const closeBtn = shadow.querySelector(".amngaze-close-button");
            const cancelBtn = shadow.querySelector(".amngaze-cancel-button");
            const submitBtn = shadow.querySelector(".amngaze-submit-button");
            const radios = shadow.querySelectorAll('input[name="report-type"]');
            const content = shadow.querySelector(".amngaze-modal-content");
            const toggleBtn = shadow.querySelector(".amngaze-toggle-image");
            const preview = shadow.querySelector(".amngaze-image-preview");
            const toggleText = shadow.querySelector(".amngaze-toggle-text");

            const close = () => container.remove();

            toggleBtn.addEventListener("click", () => {
                const isExpanded = toggleBtn.classList.contains("expanded");
                toggleBtn.classList.toggle("expanded");
                preview.style.display = isExpanded ? "none" : "block";
                toggleText.textContent = isExpanded ? "Show Image" : "Hide Image";
            });

            closeBtn.addEventListener("click", close);
            cancelBtn.addEventListener("click", close);
            modal.addEventListener("click", (e) => { if (e.target === modal) close(); });

            radios.forEach(r => r.addEventListener("change", () => { submitBtn.disabled = false; }));

            submitBtn.addEventListener("click", async () => {
                const type = shadow.querySelector('input[name="report-type"]:checked').value;
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending...";

                const settings = await chrome.storage.sync.get(SETTINGS_KEY);
                const gFormUrl = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfHbTsJaydX__sCbv7aGf0RiVBxTcbBSzv5LU-VALJm1TFnlg/formResponse";

                const formData = new URLSearchParams({
                    "entry.625186413": type,
                    "entry.1528363305": src,
                    "entry.928202137": origSrc || "",
                    "entry.2049916266": page,
                    "entry.2050137681": JSON.stringify(settings[SETTINGS_KEY] || {})
                });

                try {
                    if (type === "false-negative") {
                        chrome.runtime.sendMessage({ type: "relay-false-negative", tabId: tabId, imageUrl: src });
                    } else if (type === "false-positive") {
                        chrome.runtime.sendMessage({ type: "relay-false-positive", tabId: tabId, imageUrl: src });
                    }

                    await fetch(gFormUrl, { method: "POST", mode: "no-cors", body: formData });
                    content.innerHTML = `
                    <div class="amngaze-success-message">
                      <h3>Thank You!</h3>
                      <p>Your report has been submitted successfully.<br>We appreciate your help in improving AmniHaze.</p>
                    </div>
                    `;
                    setTimeout(close, 2000);
                } catch (err) {
                    console.error("Report failed:", err);
                    submitBtn.textContent = "Send Report";
                    submitBtn.disabled = false;
                }
            });
        },
        args: [srcUrl, pageUrl, originalSrc, chrome.runtime.getURL("")]
    }).catch(err => console.error("AmniHaze== executeScript failed:", err.message));
}

// Handle messaging routing & lifecycle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "amngaze-getSettings" || request.type === "AmniHaze-getSettings" || request.type === "AmnGaze-getSettings") {
        chrome.storage.sync.get(["AmniHaze-settings", "amngaze-settings", "AmnGaze-settings"], (res) => {
            const config = res["AmniHaze-settings"] || res["amngaze-settings"] || res["AmnGaze-settings"] || DEFAULT_SETTINGS;
            if (!Array.isArray(config.whitelist)) config.whitelist = [];
            sendResponse(config);
        });
        return true;
    }

    if (request.type === "ensureOffscreenDocument") {
        ensureOffscreenDocument().then(() => sendResponse({ success: true }));
        return true;
    }

    if (request.type === "recreateOffscreen") {
        recreateOffscreen();
        sendResponse({ success: true });
        return true;
    }

    if (request.type === "updateSettings") {
        const { key, value } = request.newSetting || {};
        chrome.storage.sync.get(["AmniHaze-settings", "amngaze-settings", "AmnGaze-settings"], (res) => {
            const config = res["AmniHaze-settings"] || res["amngaze-settings"] || res["AmnGaze-settings"] || { ...DEFAULT_SETTINGS };
            if (key !== undefined) config[key] = value;
            if (!Array.isArray(config.whitelist)) config.whitelist = [];
            chrome.storage.sync.set({
                "AmniHaze-settings": config,
                "amngaze-settings": config,
                "AmnGaze-settings": config
            }, () => {
                sendResponse({ success: true, key, value });
            });
        });
        return true;
    }

    if (request.type === "relay-false-negative") {
        chrome.tabs.sendMessage(request.tabId, {
            type: "process-false-negative",
            imageUrl: request.imageUrl
        }).catch(() => { });
        sendResponse({ success: true });
        return true;
    }

    if (request.type === "relay-false-positive") {
        chrome.tabs.sendMessage(request.tabId, {
            type: "process-false-positive",
            imageUrl: request.imageUrl
        }).catch(() => { });
        sendResponse({ success: true });
        return true;
    }
});

// Auto-manage offscreen document on start
chrome.storage.sync.get(["AmniHaze-settings", "amngaze-settings"], (res) => {
    const config = res["AmniHaze-settings"] || res["amngaze-settings"] || DEFAULT_SETTINGS;
    if (config.status) {
        ensureOffscreenDocument();
    }
});

// Optional Guardian Desktop Sync (Silent 100% standalone fallback)
const GUARDIAN_API = "http://127.0.0.1:48192/status";
async function syncWithAmnShieldGuardian() {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(GUARDIAN_API, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) return;
        const status = await res.json();
        if (status) {
            if (typeof status.is_premium === "boolean") {
                chrome.storage.local.set({ "amngaze_guardian_is_premium": status.is_premium });
            }
            if (status.focus_mode_active) {
                // Activate strict visual blur mode when Windows Guardian has Focus Mode active
                chrome.storage.sync.get([SETTINGS_KEY], (stored) => {
                    const cfg = stored[SETTINGS_KEY] || { ...DEFAULT_SETTINGS };
                    if (!cfg.status) {
                        cfg.status = true;
                        chrome.storage.sync.set({ [SETTINGS_KEY]: cfg });
                    }
                });
            }
        }
    } catch {
        // Silent fallback for standalone execution
    }
}

// Alarm for periodic Guardian sync check
chrome.alarms.create("amngaze-guardian-sync", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "amngaze-guardian-sync") {
        syncWithAmnShieldGuardian();
    }
});

// ECDSA NIST P-256 License Verification for AmniHaze
const PUBLIC_KEY_BASE64 = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7EFR1qxpfZTMeR52M1+04+tPb6ItmVmhPbRCIJYje3jtglTdBbcct+/xvc1D1NZtXuvSb4Egtdqm/EJ6H67fEA==";

async function verifyAmnGazeLicense(licenseKey) {
    try {
        const parts = licenseKey.trim().split(".");
        if (parts.length !== 2) return null;
        const [payloadBase64, sigBase64] = parts;
        const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(payloadJson);
        if (!payload.expires || payload.expires < Date.now()) return null;

        const derBinary = atob(PUBLIC_KEY_BASE64);
        const derBytes = new Uint8Array(derBinary.length);
        for (let i = 0; i < derBinary.length; i++) derBytes[i] = derBinary.charCodeAt(i);

        const key = await crypto.subtle.importKey("spki", derBytes, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
        const sigBinary = atob(sigBase64.replace(/-/g, "+").replace(/_/g, "/"));
        const sigBytes = new Uint8Array(sigBinary.length);
        for (let i = 0; i < sigBinary.length; i++) sigBytes[i] = sigBinary.charCodeAt(i);

        const encoder = new TextEncoder();
        const isValid = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, sigBytes, encoder.encode(payloadJson));
        return isValid ? payload : null;
    } catch {
        return null;
    }
}

// Adult / Pornographic Domain & Dynamic Rules Management
const RULE_BASE_ID = 100;
const ALLOW_BASE_ID = 10000;

async function fetchAndGenerateBlockingRules() {
    try {
        let blockData = null;
        try {
            const res = await fetch("https://raw.githubusercontent.com/alganzoryP/hb-related/refs/heads/main/blocklist.json", { cache: "no-cache" });
            if (res.ok) {
                blockData = await res.json();
                if (blockData?.blocked?.length) {
                    await chrome.storage.local.set({ "amngaze_cached_blocklist": blockData });
                }
            }
        } catch (fetchErr) {
            console.warn("[AmniHaze-BLOCK] Remote blocklist fetch failed:", fetchErr);
        }

        if (!blockData?.blocked?.length) {
            const cached = await chrome.storage.local.get("amngaze_cached_blocklist");
            blockData = cached?.amngaze_cached_blocklist;
        }

        if (!blockData?.blocked?.length) {
            try {
                const localRes = await fetch(chrome.runtime.getURL("data/blocklists/adult-domains.json"));
                if (localRes.ok) {
                    const localList = await localRes.json();
                    if (Array.isArray(localList) && localList.length) {
                        blockData = {
                            blocked: localList,
                            allowed: ["google.com", "bing.com", "duckduckgo.com", "youtube.com", "wikipedia.org", "github.com", "alhaq-initiative.org"]
                        };
                    }
                }
            } catch {}
        }

        if (!blockData?.blocked?.length) {
            blockData = {
                blocked: [
                    "pornhub.com", "xvideos.com", "xnxx.com", "xhamster.com", "redtube.com",
                    "youporn.com", "tube8.com", "beeg.com", "chaturbate.com", "stripchat.com",
                    "onlyfans.com", "camsoda.com", "livejasmin.com", "bonga.com", "spankbang.com",
                    "eporner.com", "tnaflix.com", "heavy-r.com", "hentaihaven.xxx", "nhentai.net",
                    "hanime.tv", "rule34.xxx", "gelbooru.com", "e-hentai.org", "luscious.net",
                    "brazzers.com", "bangbros.com", "realitykings.com", "naughtyamerica.com", "mofos.com",
                    "motherless.com", "daftsex.com", "hqporner.com", "fuq.com", "thumbzilla.com"
                ],
                allowed: ["google.com", "bing.com", "duckduckgo.com", "youtube.com", "wikipedia.org", "github.com", "alhaq-initiative.org"]
            };
        }

        const { blocked = [], allowed = [] } = blockData;
        const blockedChunks = [];
        const combined = blocked.reduce((acc, curr, idx) => {
            if (idx % 5 === 0) {
                blockedChunks.push(acc);
                return curr;
            }
            return `${acc}|${curr}`;
        });
        blockedChunks.push(combined);

        const blockRules = blockedChunks.map((chunk, idx) => ({
            id: RULE_BASE_ID + idx,
            priority: 1,
            action: {
                type: "redirect",
                redirect: { regexSubstitution: `${chrome.runtime.getURL("src/assets/blocked/blocked.html")}?url=\\0` }
            },
            condition: {
                regexFilter: `^[^:]*:\\/\\/(?:[^/]*(?:${chunk}))[^/]*\\/`,
                resourceTypes: ["main_frame"]
            }
        }));

        const allowRules = allowed.map((domain, idx) => ({
            id: ALLOW_BASE_ID + idx,
            priority: 2,
            action: { type: "allow" },
            condition: {
                regexFilter: `^[^:]*:\\/\\/(?:(?:www\\.)?(?:[^\\/]*\\.)?${domain}\\.[^\\/]*)\\/`,
                resourceTypes: ["main_frame"]
            }
        }));

        const customAllowed = ((await chrome.storage.sync.get("AmnGaze-allowed-sites"))["AmnGaze-allowed-sites"] || []).map((domain, idx) => ({
            id: ALLOW_BASE_ID + allowed.length + idx,
            priority: 3,
            action: { type: "allow" },
            condition: {
                urlFilter: `||${domain}^`,
                resourceTypes: ["main_frame"]
            }
        }));

        return [...blockRules, ...allowRules, ...customAllowed];
    } catch (err) {
        console.error("[AmniHaze-BLOCK] Error generating blocking rules:", err);
        return [];
    }
}

async function updateDynamicBlockingRules() {
    try {
        if (!chrome?.declarativeNetRequest) return;
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const removeRuleIds = existingRules.map(r => r.id);
        const newRules = await fetchAndGenerateBlockingRules();
        if (newRules && newRules.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules: newRules });
            console.log(`[AmniHaze-BLOCK] Dynamic adult blocking rules active (${newRules.length} rules)`);
        }
    } catch (err) {
        console.error("[AmniHaze-BLOCK] Error updating dynamic rules:", err);
    }
}

// Initialize dynamic network rules on startup
updateDynamicBlockingRules();
chrome.runtime.onInstalled?.addListener(() => {
    updateDynamicBlockingRules();
});
chrome.runtime.onStartup?.addListener(() => {
    updateDynamicBlockingRules();
});


