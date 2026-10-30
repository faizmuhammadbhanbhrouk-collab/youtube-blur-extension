// Background service worker - v2.0 BLUR ONLY
// Sirf pehle se khule YouTube tabs me content script inject karo.
// Download ka koi code yahan nahi hai - download poora hata diya gaya hai.

async function injectIntoYouTubeTabs() {
  try {
    const tabs = await chrome.tabs.query({ url: "*://*.youtube.com/*" });
    for (const tab of tabs) {
      if (!tab.id) continue;
      try { await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["content.css"] }); } catch (e) {}
      try { await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] }); } catch (e) {}
    }
  } catch (e) {}
}

chrome.runtime.onInstalled.addListener(injectIntoYouTubeTabs);
chrome.runtime.onStartup.addListener(injectIntoYouTubeTabs);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && tab.url.includes("youtube.com")) {
    chrome.scripting.insertCSS({ target: { tabId }, files: ["content.css"] }).catch(() => {});
    chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] }).catch(() => {});
  }
});
