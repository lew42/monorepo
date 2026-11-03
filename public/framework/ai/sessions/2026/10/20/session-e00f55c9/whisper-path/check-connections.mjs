#!/usr/bin/env node
/* check-connections.mjs — does a phone-shaped page run out of connections to its one host?
 *
 *   node check-connections.mjs [url] [--open-sheet]
 *
 * Loads the page headless from a LAN address (so servex_url() is same-origin, as on the phone),
 * waits, then lists every request to that host still open (EventSource streams, long polls).
 * A browser speaks HTTP/1.1 to the dev server and allows 6 connections per host: with N streams
 * held open, only 6 - N are left for Whisper's POSTs and everything else. Then it times
 * five POSTs of a saved clip to /whisper/inference from inside the page: the page-side round trip.
 */
import fs from "node:fs";
import path from "node:path";
import Browser from "../../../../../../../../../Server/Browser.mjs";

const url = process.argv.find(a => /^https?:/.test(a)) || "http://10.0.0.135:3104/";
const open_sheet = process.argv.includes("--open-sheet");
const clip = fs.readFileSync(path.resolve(import.meta.dirname, "../../../../09/22/whisper-servex/whisper-servex/clip.wav"));
const host = new URL(url).host;

const browser = await Browser.browser();
const ctx = await browser.newContext({ viewport: { width: 400, height: 860 }, isMobile: true, hasTouch: true, permissions: ["microphone"] });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.enable");
const open = new Map();
cdp.on("Network.requestWillBeSent", e => { if (new URL(e.request.url).host === host) open.set(e.requestId, { url: e.request.url.replace(/^https?:\/\/[^/]+/, ""), type: e.type, at: Date.now() }); });
const done = e => open.delete(e.requestId);
cdp.on("Network.loadingFinished", done);
cdp.on("Network.loadingFailed", done);

await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(6000);
if (open_sheet){
	const b = page.locator("button:has-text('✦'), [aria-label*='AI' i], .drawer-ai-button").first();
	if (await b.count()) await b.click().catch(() => {});
	await page.waitForTimeout(6000);
}
const now = Date.now();
const held = [...open.values()].filter(r => now - r.at > 3000);
console.log(`${url}${open_sheet ? " (sheet opened)" : ""}: ${held.length} requests to ${host} held open > 3 s`);
for (const r of held) console.log(`  ${r.type.padEnd(12)} ${r.url.slice(0, 110)}`);

const times = await page.evaluate(async b64 => {
	const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0)), out = [];
	for (let i = 0; i < 5; i++){
		const form = new FormData(); form.append("file", new Blob([bytes], { type: "audio/wav" }), "probe.wav"); form.append("response_format", "json");
		const t = performance.now();
		await (await fetch(location.origin + "/whisper/inference", { method: "POST", body: form })).json();
		out.push(Math.round(performance.now() - t));
	}
	return out;
}, clip.toString("base64"));
console.log(`whisper POST from the page, ms: ${times.join(", ")}`);
await Browser.close();
