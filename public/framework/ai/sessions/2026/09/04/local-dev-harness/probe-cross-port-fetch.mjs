// Isolate: is the cross-port cookie miss a WebSocket-specific thing, or does
// even a plain cross-port fetch() lose the cookie? Same setup as
// probe-cross-port-cookie.mjs, swapping the WS for fetch(credentials:"include").
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto("http://localhost:8787/api/dev/login?as=alice&to=/imagine/platform/local/");
console.log("cookies after login (page still on :8787):", (await page.context().cookies()).map(c => `${c.name}@${c.domain}:${c.path}`));

await page.goto("http://localhost:8092/imagine/platform/local/");
console.log("cookies visible to :8092 page:", (await page.context().cookies("http://localhost:8092")).map(c => c.name));
console.log("cookies visible to :8787 (context-wide lookup):", (await page.context().cookies("http://localhost:8787")).map(c => c.name));

const result = await page.evaluate(async () => {
    const r = await fetch("http://localhost:8787/api/me", { credentials: "include" });
    return r.json();
});
console.log("fetch /api/me from :8092 page to :8787 →", JSON.stringify(result));

await browser.close();
