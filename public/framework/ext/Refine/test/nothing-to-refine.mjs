/* `node test/nothing-to-refine.mjs <base url> [shots dir]` — the 2026-10-09 bug, headless.
 * Forces the failing moment: the mic is "listening", the words sit only in Dictate's caption
 * guess (partial_text), and stop() settles them into the box a beat later. Pressing Refine must
 * wait for that and refine the words; the old go() read the empty box and said "Nothing to refine yet." */
import path from "path";
import { pathToFileURL } from "url";
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const { default: Browser } = await import(pathToFileURL(path.join(here, "../../../../../Server/Browser.mjs")).href);
const base = process.argv[2], dir = process.argv[3];
const b = await Browser.browser({}); let fail = 0;
for (const w of [400, 1920]) {
	const p = await b.newPage({ viewport: { width: w, height: 900 } });
	const errs = []; p.on("pageerror", e => errs.push(String(e)));
	await p.route("**/ext/Refine/RefineDemo.js", async r => {
		const u = new URL(r.request().url()); const res = await r.fetch({ url: u.href.replace(u.host, "127.0.0.1" + (u.port ? ":" + u.port : "")), headers: { ...r.request().headers(), host: u.host } }); let t = await res.text();
		t += "\n;{const s=RefineDemo.prototype.render;RefineDemo.prototype.render=function(...a){const r=s.apply(this,a);(window.__rd??=[]).push(this);return r}}";
		await r.fulfill({ response: res, body: t });
	});
	await p.goto(base + "/framework/ext/Refine/", { waitUntil: "networkidle" });
	await p.evaluate(() => { const d = window.__rd?.[0]?.dictate; if (!d) throw new Error("no RefineDemo instance");
		d.state = "listening"; d.partial_text = "the page should show a flag when unclear";
		d.stop = async function(){ await new Promise(r => setTimeout(r, 200)); const el = window.__rd[0].$box.el; el.value = "the page should show a flag when unclear"; el.dispatchEvent(new Event("input", { bubbles: true })); this.partial_text = ""; this.state = "idle"; }; });
	await p.getByRole("button", { name: "Refine", exact: true }).click();
	await p.waitForTimeout(1500);
	const note = await p.locator(".refine-input-note").innerText();
	const box = (await p.locator(".refine-result").innerText()).replace(/\s+/g, " ").slice(0, 200);   // go() empties the box once the words are sent, so the proof is the result column
	const ok = !/Nothing to refine/i.test(note) && /flag when unclear/i.test(box);
	console.log(w, ok ? "PASS" : "FAIL", JSON.stringify({ note, box, errs }));
	if (!ok || errs.length) fail++;
	if (dir) await p.screenshot({ path: `${dir}/refine-${w}.png` });
	await p.close();
}
await Browser.close(); process.exit(fail ? 1 : 0);
