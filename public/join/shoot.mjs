// Walks /join/ headless and shoots every state at 400 and 1920 wide.
//   node public/join/shoot.mjs [base-url] [out-dir]      e.g. node public/join/shoot.mjs https://staging.lew42.com/ shots
// Needs Playwright installed globally. Also runs the whole mock flow and prints console errors and any failed check.
import { pathToFileURL } from "node:url";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const { chromium } = await import(pathToFileURL(join(execSync("npm root -g").toString().trim(), "playwright", "index.mjs")).href);
const base = (process.argv[2] || "http://127.0.0.1:57506/").replace(/\/$/, "");
const out = process.argv[3] || "public/framework/ai/sessions/2026/11/25/spawned/mastermind-forms/signin-demo/join/shots";
mkdirSync(out, { recursive: true });

const UA = {
	ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
	insta: "Mozilla/5.0 (Linux; Android 13; Pixel 7 Build/TQ3A.230901.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 Instagram 320.0.0.34.109 Android (33/13; 420dpi; 1080x2400; Google; Pixel 7; panther; tensor; en_US; 123456789)",
};
const SIZES = { 400: { width: 400, height: 800 }, 1920: { width: 1920, height: 1080 } };
const SEED = { user: { id: 1, name: "Demo Person", handle: "demo", email: "demo@example.com", avatar_url: "" } };

const browser = await chromium.launch({ channel: "chromium" });
const errors = [], fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); console.log(ok ? "ok  " : "FAIL", name); };

async function open({ w, ua, db, grant, query = "" }){
	const ctx = await browser.newContext({ viewport: SIZES[w], userAgent: ua, hasTouch: !!ua, permissions: grant ? ["notifications"] : [], serviceWorkers: "allow" });
	if (db) await ctx.addInitScript(d => { if (!localStorage.getItem("join-seeded")){ localStorage.setItem("join-mock", d); localStorage.setItem("join-seeded", "1"); } }, JSON.stringify(db));
	const page = await ctx.newPage();
	page.on("console", m => m.type() === "error" && errors.push(`${m.text()} (${page.url()})`));
	page.on("pageerror", e => errors.push(String(e)));
	await page.goto(`${base}/join/${query}`, { waitUntil: "networkidle" });
	await page.waitForTimeout(500);
	return { ctx, page };
}
const shot = async (page, name, w) => { await page.screenshot({ path: `${out}/${name}-${w}.png` }); };

const states = {
	"1-google": { open: {} },
	"2-allow": { open: { db: SEED } },
	"3-ios-sheet": { open: { db: SEED, ua: UA.ios }, then: p => p.click(".main") },
	"4-done": { open: { db: { ...SEED, push: true }, grant: true } },
	"5-settings": { open: { db: { ...SEED, push: true }, grant: true }, then: p => p.click(".avatar") },
	"6-inapp": { open: { ua: UA.insta } },
	"7-debug": { open: { db: SEED, query: "?debug=1" } },
};
for (const w of [400, 1920]) for (const [name, s] of Object.entries(states)){
	const { ctx, page } = await open({ w, ...s.open });
	if (s.then){ await s.then(page); await page.waitForTimeout(300); }
	await shot(page, name, w);
	await ctx.close();
}

// The whole flow, as a first-time visitor on the mock path: count the taps.
{
	const { ctx, page } = await open({ w: 400, grant: true });
	const state = () => page.evaluate(() => document.querySelector(".frame").dataset.state);
	let taps = 0;
	check("starts on google", await state() === "google");
	await page.click(".ux-auth-google-btn"); taps++; await page.waitForTimeout(300);
	check("tap 1 signs in -> allow", await state() === "allow");
	await page.click(".main"); taps++; await page.waitForTimeout(600);
	check("tap 2 allows -> done", await state() === "done");
	await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(400);
	check("reload stays done", await state() === "done");
	await page.click(".main"); await page.waitForTimeout(500);
	check("test notification reports sent", /Sent/.test(await page.textContent(".note")));
	await page.click(".avatar"); await page.click(".sheet .wide:nth-of-type(2)"); await page.waitForTimeout(400);
	check("turn off notifications -> allow", await state() === "allow");
	await page.click(".avatar"); await page.click(".sheet .wide:nth-of-type(1)"); await page.waitForTimeout(400);
	check("sign out -> google", await state() === "google");
	await page.click(".ux-auth-google-btn"); await page.waitForTimeout(300);
	await page.click(".avatar"); await page.click(".sheet .wide.danger"); await page.click(".confirm .danger"); await page.waitForTimeout(400);
	check("delete account -> google, mock db cleared", await state() === "google" && !(await page.evaluate(() => localStorage.getItem("join-mock"))));
	console.log("taps for a first-time visitor (after landing):", taps);
	await ctx.close();
}

await browser.close();
console.log(errors.length ? "CONSOLE ERRORS:\n" + errors.join("\n") : "no console errors");
if (fails.length || errors.length) process.exitCode = 1;
