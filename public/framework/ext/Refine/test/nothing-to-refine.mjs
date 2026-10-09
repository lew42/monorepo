/* `node test/nothing-to-refine.mjs <base url> [shots dir]` — the 2026-10-09 bug, headless.
 * Forces the failing moment: the mic is "listening", the words sit only in Dictate's caption
 * guess (partial_text), and stop() settles them into the box a beat later. Pressing Refine must
 * wait for that and refine the words; the old go() read the empty box and said "Nothing to refine yet." */
import { createRequire } from "module";
const { chromium } = createRequire(process.env.PW_ROOT + "/")("playwright");
const base = process.argv[2], dir = process.argv[3];
const b = await chromium.launch(); let fail = 0;
for (const w of [400, 1920]) {
	const p = await b.newPage({ viewport: { width: w, height: 900 } });
	const errs = []; p.on("pageerror", e => errs.push(String(e)));
	await p.route("**/ux/Dictate/Dictate.js", async r => {
		const res = await r.fetch(); let t = await res.text();
		t += "\n;{const s=Dictate.prototype.render;Dictate.prototype.render=function(...a){(window.__ds??=[]).push(this);return s.apply(this,a)}}";
		await r.fulfill({ response: res, body: t });
	});
	await p.goto(base + "/framework/ext/Refine/", { waitUntil: "networkidle" });
	await p.evaluate(() => { const d = window.__ds?.[0]; if (!d) throw new Error("no Dictate instance");
		d.state = "listening"; d.partial_text = "the page should show a flag when unclear";
		d.stop = async function(){ await new Promise(r => setTimeout(r, 200)); this.push_to_target("the page should show a flag when unclear","manual"); this.partial_text = ""; this.state = "idle"; }; });
	await p.getByRole("button", { name: "Refine", exact: true }).click();
	await p.waitForTimeout(1500);
	const note = await p.locator(".refine-input-note").innerText();
	const box = await p.locator(".refine-input textarea").inputValue();
	const ok = !/Nothing to refine/i.test(note) && box.length > 0;
	console.log(w, ok ? "PASS" : "FAIL", JSON.stringify({ note, box, errs }));
	if (!ok || errs.length) fail++;
	if (dir) await p.screenshot({ path: `${dir}/refine-${w}.png` });
	await p.close();
}
await b.close(); process.exit(fail ? 1 : 0);
