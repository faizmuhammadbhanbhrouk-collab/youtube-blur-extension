// YouTube Blur v2.0 popup - BLUR ONLY, simple card
document.addEventListener("DOMContentLoaded", () => {
  const videoBlurCheck = document.getElementById("videoBlurCheck");
  const titlesCheck = document.getElementById("titlesCheck");
  const descCheck = document.getElementById("descCheck");
  const commentsCheck = document.getElementById("commentsCheck");
  const focusCheck = document.getElementById("focusCheck");
  const blurRange = document.getElementById("blurRange");
  const blurValue = document.getElementById("blurValue");
  const whitelistInput = document.getElementById("whitelistInput");
  const whitelistAdd = document.getElementById("whitelistAdd");
  const whitelistList = document.getElementById("whitelistList");
  const reloadBtn = document.getElementById("reloadBtn");
  const diagStatus = document.getElementById("diagStatus");
  const statusEl = document.getElementById("status");
  const DEFAULTS = { videoBlur: true, blur: 18, blurTitles: false, blurDescription: false, blurComments: false, focusMode: false, whitelist: [] };
  function renderWhitelist(list) {
    whitelistList.innerHTML = "";
    (list || []).forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = entry;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "×";
      btn.addEventListener("click", () => {
        chrome.storage.sync.get(DEFAULTS, (s) => {
          const next = (s.whitelist || []).filter((x) => x !== entry);
          chrome.storage.sync.set({ whitelist: next }, () => renderWhitelist(next));
        });
      });
      li.appendChild(btn);
      whitelistList.appendChild(li);
    });
  }
  function save() {
    chrome.storage.sync.set({
      videoBlur: videoBlurCheck.checked,
      blur: parseInt(blurRange.value, 10),
      blurTitles: titlesCheck.checked,
      blurDescription: descCheck.checked,
      blurComments: commentsCheck.checked,
      focusMode: focusCheck.checked
    });
    blurValue.textContent = blurRange.value + "px";
  }
  chrome.storage.sync.get(DEFAULTS, (s) => {
    const videoBlur = (s.videoBlur !== undefined) ? !!s.videoBlur : (s.enabled !== false);
    videoBlurCheck.checked = videoBlur;
    titlesCheck.checked = !!s.blurTitles;
    descCheck.checked = !!s.blurDescription;
    commentsCheck.checked = !!s.blurComments;
    focusCheck.checked = !!s.focusMode;
    blurRange.value = s.blur || 18;
    blurValue.textContent = (s.blur || 18) + "px";
    renderWhitelist(s.whitelist || []);
  });
  [videoBlurCheck, titlesCheck, descCheck, commentsCheck, focusCheck].forEach((el) => el.addEventListener("change", save));
  blurRange.addEventListener("input", save);
  whitelistAdd.addEventListener("click", () => {
    const v = (whitelistInput.value || "").trim();
    if (!v) return;
    chrome.storage.sync.get(DEFAULTS, (s) => {
      const list = s.whitelist || [];
      if (!list.includes(v)) list.push(v);
      chrome.storage.sync.set({ whitelist: list }, () => { renderWhitelist(list); whitelistInput.value = ""; });
    });
  });
  whitelistInput.addEventListener("keydown", (e) => { if (e.key === "Enter") whitelistAdd.click(); });
  reloadBtn.addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].id) chrome.tabs.reload(tabs[0].id);
  });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url || !tab.url.includes("youtube.com")) {
      diagStatus.textContent = "YouTube tab kholo, phir popup kholo.";
      return;
    }
    chrome.tabs.sendMessage(tab.id, { type: "ytBlurPing" }, (resp) => {
      if (chrome.runtime.lastError || !resp) {
        diagStatus.textContent = "Script page par nahi mila. YouTube reload karo (F5).";
        return;
      }
      diagStatus.textContent = "Script chal raha hai • Video blur: " + (resp.videoBlur ? "ON" : "OFF") + " • Thumbnails: " + resp.thumbCount;
      statusEl.textContent = "Jo option ON hai, wahi blur hoga.";
    });
  });
});
