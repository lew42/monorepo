// Assumption 3 probe: does a cookie set at :8787 reach a WebSocket handshake
// opened from a page whose origin is :8092 (same hostname, different port)?
// RFC 6265 §8.5 says cookies are not port-scoped — this checks it for real,
// in a real browser, against our own worker/room.js which echoes back who it
// resolved the caller as.
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";

const browser = await chromium.launch();
const page = await browser.newPage();

// 1. Set the session cookie at :8787 (host "localhost", port 8787).
await page.goto("http://localhost:8787/api/dev/login?as=alice&to=/imagine/platform/local/");

// 2. Switch the page's own origin to :8092 (node server.js) — same hostname, different port.
await page.goto("http://localhost:8092/imagine/platform/local/");

// 3. From THIS origin, open a raw WebSocket to :8787 and see whether the room
//    resolves us as alice (cookie arrived) or as anonymous (it didn't).
const result = await page.evaluate(() => new Promise((resolve) => {
    const ws = new WebSocket("ws://localhost:8787/api/room?url=" + encodeURIComponent("/imagine/platform/local/room/cross-port-probe"));
    const timer = setTimeout(() => resolve({ error: "timeout, no message" }), 4000);
    ws.addEventListener("open", () => ws.send(JSON.stringify({ text: "cross-port probe" })));
    ws.addEventListener("message", (e) => {
        clearTimeout(timer);
        resolve(JSON.parse(e.data));
        ws.close();
    });
    ws.addEventListener("error", () => { clearTimeout(timer); resolve({ error: "ws error" }); });
}));

console.log("RESULT:", JSON.stringify(result));
await browser.close();
