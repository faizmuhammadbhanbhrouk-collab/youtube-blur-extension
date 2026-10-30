# YouTube Blur - Hover to Reveal (v2.0, blur only)

Chrome extension (Manifest V3) jo YouTube videos ko blur karta hai.
Cursor jis video par jaye, sirf woh video clear hoti hai.

**Download is version me nahi hai.** Ye sirf blur ke liye hai.

## Install (Load unpacked)

1. Is repo ko download / clone karo.
2. Chrome me `chrome://extensions` kholo, Developer mode ON karo.
3. **Load unpacked** dabao aur is folder ko chuno.
4. YouTube kholo aur F5 dabao.

> Note: `icon128.png` binary file hone ki wajah se is snapshot push me
> shamil nahi ho saki, is liye GitHub wale `manifest.json` me icon
> reference hataya gaya hai taake clone kar ke load ho sake. Extension
> phir bhi poori tarah kaam karegi, bas toolbar me default icon dikhega.
> Original v2.0 ZIP me icon wahi hai.

## Options (popup me simple card, har option alag hai)

- **Video blur** — thumbnails aur player blur, strength slider 6-30px (default 18px)
- **Title blur** — video titles blur
- **Description blur** — watch page ki description blur
- **Comments blur** — comments ka text blur
- **Focus Mode** — Shorts, sidebar recommendations aur comments hide karo
- **Whitelist Channels** — ye channels hamesha clear rahenge, blur nahi honge

Har option ka apna alag setting hai — ek option band ho to doosra phir bhi kaam karta hai.
Purani `enabled` setting nayi `videoBlur` setting me migrate ho jati hai.

## Files

- `manifest.json` — Manifest V3, permissions: storage, scripting, tabs
- `content.js` / `content.css` — YouTube page par blur lagana
- `popup.html` / `popup.css` / `popup.js` — popup card aur settings
- `background.js` — pehle se khule YouTube tabs me script inject karna
