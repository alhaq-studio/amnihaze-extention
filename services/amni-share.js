/**
 * Amni Ecosystem Smart Share Module
 * 100% Zero-Knowledge, Zero-Telemetry, Privacy-Preserving Sharing
 * Compatible across AmniHaze, AmniShield, and Web Portals
 */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.AmniShare = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const DEFAULT_SHARE_DATA = {
    title: "AmniHaze (Amni Blur/Mask)",
    text: "Protect your gaze online with on-device AI real-time visual content moderation and smart blurring.",
    url: "https://amnshield.com"
  };

  /**
   * Share content using native OS share sheet if available,
   * otherwise fallback to direct platform intent URL or clipboard copy.
   */
  async function share(options = {}) {
    const data = { ...DEFAULT_SHARE_DATA, ...options };

    // 1. Try Native Web Share API (Mobile, Android, macOS, Win11)
    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(data)) {
      try {
        await navigator.share(data);
        return { success: true, method: "native" };
      } catch (err) {
        if (err.name === "AbortError") {
          return { success: false, method: "cancelled" };
        }
        console.warn("[AmniShare] Native share failed, falling back to direct share", err);
      }
    }

    // 2. Direct Fallback: Trigger platform intent or copy to clipboard
    if (options.platform) {
      return openPlatformShare(options.platform, data);
    }

    // 3. Default fallback: Copy link to clipboard
    return copyToClipboard(data.url);
  }

  /**
   * Direct, privacy-preserving social sharing intents (no external tracking scripts)
   */
  function getShareUrl(platform, data = DEFAULT_SHARE_DATA) {
    const encodedUrl = encodeURIComponent(data.url);
    const encodedText = encodeURIComponent(`${data.title} - ${data.text}`);

    switch (platform.toLowerCase()) {
      case "whatsapp":
        return `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
      case "telegram":
        return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
      case "twitter":
      case "x":
        return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      case "reddit":
        return `https://reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(data.title)}`;
      case "email":
        return `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(data.text + "\n\n" + data.url)}`;
      default:
        return data.url;
    }
  }

  function openPlatformShare(platform, data) {
    const url = getShareUrl(platform, data);
    if (url.startsWith("mailto:")) {
      window.location.href = url;
    } else if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
    }
    return { success: true, method: platform, url };
  }

  async function copyToClipboard(text) {
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return { success: true, method: "clipboard", text };
      } catch (err) {
        console.error("[AmniShare] Clipboard write failed", err);
      }
    }
    return { success: false, method: "clipboard" };
  }

  return {
    share,
    getShareUrl,
    openPlatformShare,
    copyToClipboard,
    DEFAULT_SHARE_DATA
  };
});
