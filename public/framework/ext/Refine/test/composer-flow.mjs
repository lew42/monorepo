// Proof that the Refine page keeps every sentence: dictate with a fake microphone (the jfk.wav recording),
// let the mic auto-send, then type and send a second line. The Cleaned list must hold BOTH, in order.
//
//   PWENTRY=<path to playwright/index.mjs> node public/framework/ext/Refine/test/composer-flow.mjs <base-url> [shot.png]
//
// HARD CAPS (each /api/refine call is a real Haiku session, 64 of them ran in 3 minutes on 2026-10-16): at most MAX_REFINE_CALLS
// (env, default 6) refine requests per run, the rest are aborted at the browser; the whole run is killed after MAX_SECONDS (default 90).
//
// Needs the local Whisper server (:8178) and Servex for the refine call. Headless only: never the owner's tabs.
import { pathToFileURL } from "url";

const [base = "http://monorepo.localhost", shot] = process.argv.slice(2);
const wav = process.env.WAV ?? new URL("../../../ai/recordings/jfk.wav", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const { chromium } = await import(pathToFileURL(process.env.PWENTRY).href);
const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${wav}`] });
const ctx = await browser.newContext({ viewport: { width: 400, height: 1000 }, permissions: ["microphone"] });
const page = await ctx.newPage();
const MAX_CALLS = +(process.env.MAX_REFINE_CALLS ?? 6), MAX_SECONDS = +(process.env.MAX_SECONDS ?? 90);
let calls = 0, aborted = 0;
await page.route("**/api/refine**", route => { if (route.request().method() !== "POST") return route.continue(); if (++calls > MAX_CALLS){ aborted++; return route.abort(); } route.continue(); });
const kill = setTimeout(() => { console.log("FAIL run longer than MAX_SECONDS, killed"); process.exit(2); }, MAX_SECONDS * 1000);
const errors = [];
page.on("pageerror", e => errors.push(String(e).slice(0, 200)));

const read = () => page.evaluate(() => ({
	clean: [...document.querySelectorAll(".refine-result .refine-sentence .refine-s-text")].map(e => e.textContent),
	raw: document.querySelector(".refine-result .refine-prompt-raw")?.textContent ?? "",
	box: document.querySelector(".refine-toolbar textarea")?.value ?? "",
}));
const fail = msg => { console.log("FAIL", msg, errors); process.exitCode = 1; };

await page.goto(base + "/framework/ext/Refine/", { waitUntil: "networkidle" });
await page.waitForSelector(".refine-toolbar textarea", { timeout: 15000 });
await page.locator(".chatbox-mic .ux-dictate-btn, .chatbox-mic button").first().click();

// 1. dictation: words stream in, then the first utterance auto-sends and the box empties while the Cleaned list keeps it.
let first = null, sent = false;
for (let i = 0; i < 40 && !sent; i++){
	await page.waitForTimeout(1000);
	const s = await read();
	if (s.clean.length && s.box) first = s.clean.slice();
	if (first && !s.box && s.clean.length) sent = true;
}
if (!first) fail("no words reached the Cleaned list while dictating");
else if (!sent) fail("the first utterance never auto-sent (box never emptied)");
else console.log("ok 1: dictated, auto-sent, box empty; Cleaned =", JSON.stringify((await read()).clean));

// 2. stop the mic, type a second line and send it: the first sentence must still be there.
await page.locator(".chatbox-mic .ux-dictate-btn, .chatbox-mic button").first().click();
await page.waitForTimeout(2500);
const before = (await read()).clean;
await page.locator(".refine-toolbar textarea").fill("Now the second line is typed. It has two sentences.");
await page.locator(".refine-toolbar button", { hasText: /^Send$/ }).first().click();
await page.waitForTimeout(1500);
const after = (await read()).clean;
if (after.length < before.length + 2) fail(`second send did not add its sentences (before ${before.length}, after ${after.length})`);
else if (before.some((t, i) => after[i] !== t && !/^$/.test(t)) && !after.join(" ").includes(before[0].slice(0, 12))) fail("an earlier sentence was overwritten");
else console.log("ok 2: typed send added sentences, earlier ones kept:", JSON.stringify(after));

if (shot) await page.screenshot({ path: shot, fullPage: true });
clearTimeout(kill);
await browser.close();
console.log(`refine calls: ${Math.min(calls, MAX_CALLS)} sent, ${aborted} aborted (cap ${MAX_CALLS})`);
if (!process.exitCode) console.log("PASS");
