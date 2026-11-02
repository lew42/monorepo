#!/usr/bin/env node
/* check-ink.mjs — the dim-to-strong pair in the three chat views: computed colour and contrast of the
 * still-moving guess against the written text, from the real stylesheets, plus a shot at 400 and 1200.
 *   node check-ink.mjs [base url] [shots dir] */
import fs from "node:fs";
import Browser from "../../../../../../../../../Server/Browser.mjs";

const base = process.argv[2] || "http://localhost:61255", shots = process.argv[3] || ".";
fs.mkdirSync(shots, { recursive: true });
const browser = await Browser.browser();
for (const width of [400, 1200]){
	const page = await (await browser.newContext({ viewport: { width, height: 520 } })).newPage();
	await page.goto(base + "/framework/ext/Chat/v3/", { waitUntil: "domcontentloaded" });
	await page.waitForTimeout(1500);
	const rows = await page.evaluate(async () => {
		await import("/framework/ext/Chat/Chat.js"); await import("/framework/ext/Chat/v2/ChatV2.js"); await import("/framework/ext/Chat/v3/ChatV3.js");
		await import("/framework/ux/Dictate/Widget.js");
		await new Promise(r => setTimeout(r, 800));
		const host = document.createElement("div");
		host.style.cssText = "position:fixed;inset:0;z-index:99999;background:#fff;color:#1a1a1a;padding:1em;display:flex;flex-direction:column;gap:1em;font:16px system-ui";
		host.innerHTML = `
			<div><b>V1</b><div class="chatbox"><div class="chatbox-text ux-dictate-raw" data-k="v1-written">Written to the session, full ink. <span class="chatbox-guess" data-k="v1-guess">and these words are still being spoken</span></div></div></div>
			<div><b>V2</b><p class="chat-v2-raw-line" data-k="v2-written">A raw line once written: full ink.</p></div>
			<div><b>V3</b><div class="chat-v3-text is-moving" data-k="v3-written">Written to the session, full ink. <span class="chat-v3-guess" data-k="v3-guess">and these words are still being spoken</span></div></div>`;
		document.body.append(host);
		const rgb = s => { const n = s.match(/[\d.]+/g).map(Number); return s.startsWith("color(") ? [n[0] * 255, n[1] * 255, n[2] * 255, n[3] ?? 1] : n; };   // color(srgb 0..1 / a) or rgb(0..255)
		const lum = ([r, g, b, a = 1]) => { const mix = c => (c * a + 255 * (1 - a)) / 255; return [r, g, b].map(c => { c = mix(c); return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0); };
		return [...host.querySelectorAll("[data-k]")].map(el => { const c = getComputedStyle(el).color;
			let a = 1; for (let e = el; e && e !== host; e = e.parentElement) a *= +getComputedStyle(e).opacity;   // opacity on the element or a parent dims it too
			const [r, g, b, al = 1] = rgb(c), l = lum([r, g, b, al * a]); return { k: el.dataset.k, color: c, contrast: +((1.05) / (l + 0.05)).toFixed(1), opacity: +a.toFixed(2) }; });
	});
	if (width === 400) for (const r of rows) console.log(`${r.k.padEnd(11)} ${r.color.padEnd(34)} contrast on white ${r.contrast}:1  effective opacity ${r.opacity}`);
	await page.screenshot({ path: `${shots}/ink-${width}.png` });
	await page.close();
}
console.log(`shots: ${shots}/ink-400.png, ink-1200.png`);
await Browser.close();
