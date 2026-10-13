/* node mic-proof.mjs [origin] — phone-width headless: opens the ✦ AI sheet, fake mic plays jfk.wav, waits for transcribed text. */
import path from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../../../../../../../../..");
const wav = path.join(REPO, "public/framework/ai/recordings/jfk.wav");
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const origin = process.argv[2] || "https://127.0.0.1:13104";
const b = await browser({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + wav] });
const ctx = await b.newContext({ viewport: { width: 400, height: 800 }, hasTouch: true, isMobile: true, ignoreHTTPSErrors: true, permissions: ["microphone"] });
const p = await ctx.newPage(); const t0 = Date.now(), say = s => console.log(`[${Date.now() - t0}ms] ${s}`);
p.on("pageerror", e => say("PAGEERROR " + e.message)); p.on("requestfailed", r => say("REQFAIL " + r.url()));
p.on("response", r => { if (/whisper|inference/.test(r.url())) say("whisper " + r.status() + " " + r.url()); });
await p.goto(origin + "/framework/", { waitUntil: "load" }); await p.waitForTimeout(2500);
say("secure=" + await p.evaluate(() => isSecureContext));
await p.tap(".drawer-rail-ai"); say("tapped AI");
const read = () => p.evaluate(() => { const s = document.querySelector(".drawer-rail-sheet"); return { text: [...(s?.querySelectorAll("textarea,input,.chat-bubble,[class*=bubble],[class*=caption]") || [])].map(e => (e.value || e.textContent || "").trim()).filter(Boolean).join(" | "), status: s?.querySelector("[class*=status],[class*=strip]")?.textContent?.trim() }; });
let got = "";
for (let i = 0; i < 30; i++) { await p.waitForTimeout(1000); const r = await read(); if (i % 5 === 0) say(JSON.stringify(r)); if (/country/i.test(r.text)) { got = r.text; break; } }
await p.screenshot({ path: path.join(HERE, "sheet-400.png") });
say(got ? "PASS: " + got.slice(0, 200) : "FAIL: no transcript text");
await close(); process.exit(got ? 0 : 1);
