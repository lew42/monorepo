/* `node test-whisper-log.mjs <base url> [shots dir]` (PW_ROOT = a folder under Playwright node_modules).
 * Drives the real Dictate.transcribe() on the Refine page with a stubbed whisper-server reply, then opens the Whisper log page
 * (/framework/audio/Whisper/log/) and checks it shows an interim row and a final row, numbered, read back from the day file. */
import { createRequire } from "module";
const { chromium } = createRequire(process.env.PW_ROOT + "/")("playwright");
const base = process.argv[2], dir = process.argv[3];
const b = await chromium.launch(); let fail = 0;
for (const w of [400, 1920]) {
	const p = await b.newPage({ viewport: { width: w, height: 1000 } });
	const errs = []; p.on("pageerror", e => errs.push(String(e)));
	await p.addInitScript(() => { window.$WHISPER_LOG_FORCE = true; });   // this test checks the log itself, so it opts in to writing
	await p.route("**/ux/Dictate/Dictate.js", async r => {
		const res = await r.fetch(); let t = await res.text();
		t += "\n;{const s=Dictate.prototype.render;Dictate.prototype.render=function(...a){(window.__ds??=[]).push(this);return s.apply(this,a)}}";
		await r.fulfill({ response: res, body: t });
	});
	await p.route("**/inference", r => r.fulfill({ json: { text: " Testing the mic,\n it works." } }));
	await p.goto(base + "/framework/ext/Refine/", { waitUntil: "networkidle" });
	await p.evaluate(async () => { const d = window.__ds[0];
		d.mic = { wav: () => new Blob(["x"]) }; d.dump = () => {};
		await d.transcribe(new Float32Array(10), "interim");
		await d.transcribe(new Float32Array(10), "final"); });
	await p.waitForTimeout(1500);
	await p.goto(base + "/framework/audio/Whisper/log/", { waitUntil: "networkidle" });
	await p.waitForSelector(".wl-row.k-final", { timeout: 8000 }).catch(() => {});
	const rows = await p.locator(".wl-row:not(.wl-headrow)").allInnerTexts();
	const ok = rows.some(r => /interim/.test(r)) && rows.some(r => /final/.test(r) && /it works\./.test(r));
	console.log(w, ok ? "PASS" : "FAIL", JSON.stringify({ rows, errs }));
	if (!ok || errs.length) fail++;
	if (dir){ await p.locator(".wl").scrollIntoViewIfNeeded(); await p.screenshot({ path: `${dir}/whisper-${w}.png` }); }
	await p.close();
}
await b.close(); process.exit(fail ? 1 : 0);
