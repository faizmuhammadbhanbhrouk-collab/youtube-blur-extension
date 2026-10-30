// YouTube Blur v2.0 - BLUR ONLY (download poora hata diya gaya hai)
// Simple card, alag alag options, har option azaad kaam karta hai:
//  - Video blur: thumbnails + player (blur strength slider ke saath)
//  - Title blur: video titles
//  - Description blur: watch page description
//  - Comments blur: comments ka text
//  - Focus Mode: Shorts, sidebar recommendations aur comments hide
//  - Whitelist: ye channels hamesha clear rahenge
// Har option ka apna body class hai, is liye ek option band ho to
// doosra phir bhi kaam karta hai. Cursor jis video par jaye, sirf
// woh video clear hoti hai (video blur ke liye).

(function () {
  if (window.__ytBlurV200) return;
  window.__ytBlurV200 = true;

  const DEFAULTS = { videoBlur: true, blur: 18, blurTitles: false, blurDescription: false, blurComments: false, focusMode: false, whitelist: [] };
  let current = { ...DEFAULTS, whitelist: [] };

  const THUMB_SELECTORS = [
    "ytd-thumbnail img",
    "yt-lockup-view-model img",
    "yt-thumbnail-view-model img",
    ".ytThumbnailViewModelImage img",
    "a.yt-lockup-view-model__content-image img",
    "a[href^=\"/watch\"] img",
    "a[href^=\"/shorts\"] img",
    "img.ytCoreImageHost",
    "video"
  ].join(", ");

  const CARD_SELECTORS = "yt-lockup-view-model, ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-reel-item-renderer, #movie_player, .html5-video-player";

  function ensureStyle(blur) {
    let el = document.getElementById("yt-blur-injected-style");
    if (!el) {
      el = document.createElement("style");
      el.id = "yt-blur-injected-style";
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent =
      "body.yt-blur-on ytd-thumbnail img, body.yt-blur-on yt-lockup-view-model img, body.yt-blur-on yt-thumbnail-view-model img, body.yt-blur-on .ytThumbnailViewModelImage img, body.yt-blur-on a.yt-lockup-view-model__content-image img, body.yt-blur-on a[href^=\"/watch\"] img, body.yt-blur-on a[href^=\"/shorts\"] img, body.yt-blur-on img.ytCoreImageHost, body.yt-blur-on video { filter: blur(" + blur + "px) brightness(0.85) !important; transition: filter 0.25s ease !important; }" +
      "body.yt-blur-on .yt-whitelisted img, body.yt-blur-on .yt-whitelisted video { filter: none !important; }" +
      "body.yt-blur-on yt-lockup-view-model:hover img, body.yt-blur-on ytd-rich-item-renderer:hover img, body.yt-blur-on img:hover, body.yt-blur-on video:hover, body.yt-blur-on #movie_player:hover video, body.yt-blur-on .html5-video-player:hover video { filter: none !important; }" +
      "body.yt-focus-on ytd-reel-shelf-renderer, body.yt-focus-on #secondary, body.yt-focus-on #comments, body.yt-focus-on ytd-comments { display: none !important; }";
  }

  function anyBlurOn() {
    return !!(current.videoBlur || current.blurTitles || current.blurDescription || current.blurComments || current.focusMode);
  }

  function ensureBadge(show) {
    let badge = document.getElementById("yt-blur-badge");
    if (!show) { if (badge) badge.remove(); return; }
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "yt-blur-badge";
      badge.textContent = current.focusMode ? "YT Blur ON • Focus ON" : "YT Blur ON";
      if (document.body) document.body.appendChild(badge);
    } else {
      badge.textContent = current.focusMode ? "YT Blur ON • Focus ON" : "YT Blur ON";
    }
  }

  function getWhitelist() {
    return Array.isArray(current.whitelist) ? current.whitelist : [];
  }

  function isWhitelistedEl(el) {
    try {
      const list = getWhitelist();
      if (!list.length) return false;
      let card = null;
      try { card = el.closest ? el.closest(CARD_SELECTORS) : null; } catch (e) {}
      let haystack = "";
      if (card && card.textContent) haystack = card.textContent;
      if (!haystack && el.closest && el.closest("#movie_player, .html5-video-player, ytd-player")) {
        const owner = document.querySelector("ytd-video-owner-renderer, #owner");
        if (owner && owner.textContent) haystack = owner.textContent;
      }
      if (!haystack) return false;
      const lower = haystack.toLowerCase();
      return list.some((entry) => {
        const e = String(entry).toLowerCase().trim().replace(/^@/, "");
        return e && lower.includes(e);
      });
    } catch (e) { return false; }
  }

  function isThumbnailEl(el) {
    if (!el || !el.tagName) return false;
    if (el.tagName === "VIDEO") return true;
    if (el.tagName !== "IMG") return false;
    try {
      return !!el.closest("yt-lockup-view-model, yt-thumbnail-view-model, ytd-thumbnail, a[href^=\"/watch\"], a[href^=\"/shorts\"]");
    } catch (e) { return false; }
  }

  function applyDirectBlur(root) {
    if (!current.videoBlur) return;
    const scope = root || document;
    let nodes = [];
    try { nodes = scope.querySelectorAll ? Array.from(scope.querySelectorAll(THUMB_SELECTORS)) : []; } catch (e) {}
    if (scope.tagName && (scope.tagName === "IMG" || scope.tagName === "VIDEO")) nodes.unshift(scope);
    nodes.forEach((el) => {
      if (!isThumbnailEl(el)) return;
      if (isWhitelistedEl(el)) {
        el.style.filter = "none";
        try {
          const card = el.closest(CARD_SELECTORS);
          if (card && card.classList) card.classList.add("yt-whitelisted");
        } catch (e) {}
        return;
      }
      try {
        const card = el.closest(CARD_SELECTORS);
        if (card && card.classList) card.classList.remove("yt-whitelisted");
      } catch (e) {}
      el.style.filter = "blur(" + current.blur + "px) brightness(0.85)";
    });
  }

  function clearDirectBlur() {
    try {
      document.querySelectorAll("img, video").forEach((el) => { el.style.filter = ""; });
    } catch (e) {}
  }

  function applyFocusJS() {
    try {
      document.querySelectorAll("ytd-rich-shelf-renderer, ytd-reel-shelf-renderer").forEach((shelf) => {
        const titleEl = shelf.querySelector("#title, h2, yt-formatted-string");
        const titleText = titleEl && titleEl.textContent ? titleEl.textContent.trim().toLowerCase() : "";
        const isShortsShelf = titleText === "shorts" || (shelf.textContent && shelf.querySelector("a[href^=\"/shorts\"]") && titleText.includes("shorts"));
        if (current.focusMode && isShortsShelf) {
          shelf.style.display = "none";
          shelf.dataset.ytFocusHidden = "1";
        } else if (shelf.dataset.ytFocusHidden === "1" && !current.focusMode) {
          shelf.style.display = "";
          delete shelf.dataset.ytFocusHidden;
        }
      });
    } catch (e) {}
  }

  function applySettings(s) {
    // Purani setting (enabled) se nayi setting (videoBlur) me migrate karo
    const videoBlur = (s.videoBlur !== undefined) ? !!s.videoBlur : (s.enabled !== false);
    current = {
      videoBlur: videoBlur,
      blur: s.blur || 18,
      blurTitles: !!s.blurTitles,
      blurDescription: !!s.blurDescription,
      blurComments: !!s.blurComments,
      focusMode: !!s.focusMode,
      whitelist: Array.isArray(s.whitelist) ? s.whitelist : []
    };
    if (!document.body) return;
    document.documentElement.style.setProperty("--yt-blur-px", current.blur + "px");
    ensureStyle(current.blur);
    // Har option azaad: ek band ho to doosra phir bhi chale
    document.body.classList.toggle("yt-blur-on", current.videoBlur);
    document.body.classList.toggle("yt-blur-titles", current.blurTitles);
    document.body.classList.toggle("yt-blur-desc", current.blurDescription);
    document.body.classList.toggle("yt-blur-comments", current.blurComments);
    document.body.classList.toggle("yt-focus-on", current.focusMode);
    if (current.videoBlur) {
      applyDirectBlur(document);
    } else {
      clearDirectBlur();
    }
    ensureBadge(anyBlurOn());
    applyFocusJS();
  }

  function loadAndApply() {
    try { chrome.storage.sync.get(DEFAULTS, applySettings); }
    catch (e) { applySettings(DEFAULTS); }
  }

  if (document.body) {
    document.body.classList.add("yt-blur-on");
    ensureStyle(DEFAULTS.blur);
    applyDirectBlur(document);
    ensureBadge(true);
  }
  loadAndApply();

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync") loadAndApply();
    });
  } catch (e) {}

  try {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg && msg.type === "ytBlurPing") {
        let count = 0;
        try { count = document.querySelectorAll(THUMB_SELECTORS).length; } catch (e) {}
        sendResponse({ alive: true, videoBlur: current.videoBlur, blur: current.blur, blurTitles: current.blurTitles, blurDescription: current.blurDescription, blurComments: current.blurComments, focusMode: current.focusMode, whitelistCount: getWhitelist().length, thumbCount: count, badge: !!document.getElementById("yt-blur-badge") });
      }
      return true;
    });
  } catch (e) {}

  document.addEventListener("mouseover", (e) => {
    if (!current.videoBlur) return;
    const card = e.target && e.target.closest ? e.target.closest(CARD_SELECTORS) : null;
    if (card) {
      card.querySelectorAll("img, video").forEach((el) => { if (isThumbnailEl(el)) el.style.filter = "none"; });
    } else if (e.target && (e.target.tagName === "IMG" || e.target.tagName === "VIDEO")) {
      if (isThumbnailEl(e.target)) e.target.style.filter = "none";
    }
  }, true);
  document.addEventListener("mouseout", (e) => {
    if (!current.videoBlur) return;
    const card = e.target && e.target.closest ? e.target.closest(CARD_SELECTORS) : null;
    if (card) {
      card.querySelectorAll("img, video").forEach((el) => {
        if (!isThumbnailEl(el)) return;
        if (isWhitelistedEl(el)) { el.style.filter = "none"; return; }
        el.style.filter = "blur(" + current.blur + "px) brightness(0.85)";
      });
    } else if (e.target && (e.target.tagName === "IMG" || e.target.tagName === "VIDEO")) {
      if (isThumbnailEl(e.target)) {
        if (isWhitelistedEl(e.target)) { e.target.style.filter = "none"; return; }
        e.target.style.filter = "blur(" + current.blur + "px) brightness(0.85)";
      }
    }
  }, true);

  function startObservers() {
    if (!document.body) return;
    const bodyObs = new MutationObserver(() => {
      if (current.videoBlur && !document.body.classList.contains("yt-blur-on")) {
        document.body.classList.add("yt-blur-on");
        ensureBadge(true);
      }
      if (current.videoBlur) applyDirectBlur(document);
      if (current.focusMode) applyFocusJS();
    });
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    const domObs = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (current.videoBlur) applyDirectBlur(node);
            if (current.focusMode) applyFocusJS();
          }
        });
      });
    });
    domObs.observe(document.body, { childList: true, subtree: true });
  }
  startObservers();
})();
