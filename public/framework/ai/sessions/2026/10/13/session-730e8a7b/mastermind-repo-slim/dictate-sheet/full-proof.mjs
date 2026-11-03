/* node full-proof.mjs origin tag — 400px: open sheet, mic runs, drag to full; assert tab row and shot. */
import path from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../../../../../../../../..");
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const [origin, tag] = [process.argv[2], process.argv[3] || "after"];
const b = await browser({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + path.join(REPO, "public/framework/ai/recordings/jfk.wav")] });
const ctx = await b.newContext({ viewport: { width: 400, height: 800 }, hasTouch: true, isMobile: true, ignoreHTTPSErrors: true, permissions: ["microphone"] });
const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.goto(origin + "/framework/", { waitUntil: "load" }); await p.waitForTimeout(2500);
await p.tap(".drawer-rail-ai"); await p.waitForTimeout(1500);
await p.evaluate(() => { const u = new URL(location.href); u.searchParams.set("sheet", "full"); history.pushState({}, "", u); dispatchEvent(new PopStateEvent("popstate")); });
await p.waitForTimeout(2500);
const r = await p.evaluate(() => ({ tabs: [...document.querySelectorAll(".drawer-rail-sheet-tabrow .drawer-tab")].map(e => e.textContent), full: !!document.querySelector(".drawer-rail-sheet-full"), links: !!document.querySelector(".drawer-rail-sheet-links:not(.drawer-rail-sheet-links-folded)") }));
await p.screenshot({ path: path.join(HERE, `full-400-${tag}.png`) });
await p.tap(".drawer-rail-sheet-tabrow .drawer-tab:nth-child(2)"); await p.waitForTimeout(2500); await p.screenshot({ path: path.join(HERE, `full-400-dictation.png`) });
console.log(JSON.stringify({ ...r, errs })); await close();
