/* `PW_ROOT=<dir containing node_modules/playwright> node test/dictate-flow.mjs <base url> <speech.wav> [shots dir]`
 * The whole Refine flow, headless, with a real recorded voice as the fake microphone:
 * mic on -> Whisper answers -> transcript fills -> Refine -> result. Also records, for the Whisper
 * flow note (doc/whisper-flow-2026-10-09.md): every request to whisper-server and how it ended, and
 * whether the buttons (mic, Refine, Record next) moved while words arrived. Exit 1 on any failure. */
import { createRequire } from "module";
const { chromium } = createRequire(process.env.PW_ROOT + "/")("playwright");
const [base, wav, dir] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${wav}`] });
let fail = 0;
for (const w of [1400, 400]) {
	const ctx = await b.newContext({ viewport: { width: w, height: 1000 }, permissions: ["microphone"] });
	const p = await ctx.newPage();
	const errs = [], whisper = [];
	p.on("pageerror", e => errs.push("pageerror " + e));
	p.on("console", m => { if (m.type() === "error") errs.push("console " + m.text().slice(0, 160)); });
	p.on("requestfailed", r => { const e = r.failure()?.errorText; (r.url().includes(":8178") ? whisper : errs).push((r.url().includes(":8178") ? "FAILED " : "requestfailed ") + r.url().slice(0, 90) + " " + e); });
	p.on("response", r => { if (r.url().includes(":8178")) whisper.push(`${r.request().method()} ${r.url().split("8178")[1]} ${r.status()}`); });
	await p.goto(base + "/framework/ext/Refine/", { waitUntil: "networkidle" });
	const conn = () => p.locator(".voice-conn").innerText().then(t => t.replace(/\s+/g, " "));
	console.log(w, "on load:", await conn());
	const boxes = async () => p.evaluate(() => [...document.querySelectorAll(".voice-strip-bar .ux-dictate-btn,.voice-strip-bar > button")].map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(","); }).join(" | "));
	const before = await boxes();
	await p.locator(".ux-dictate-btn").click();
	let moved = 0;
	for (let i = 0; i < 24; i++) { await p.waitForTimeout(500); if (await boxes() !== before) moved++; }
	console.log(w, "while talking:", await conn());
	if (dir && w === 1400) await p.screenshot({ path: `${dir}/refine-talking-${w}.png` });
	await p.getByRole("button", { name: "Refine", exact: true }).click();
	await p.waitForFunction(() => /done|error/.test(document.querySelector('[data-step="refine"]')?.dataset.state === "ok" ? "done" : document.querySelector('[data-step="refine"]')?.dataset.state === "bad" ? "error" : ""), null, { timeout: 90000 }).catch(() => {});
	await p.waitForTimeout(500);
	const box = await p.locator(".refine-input textarea").inputValue();
	const result = (await p.locator(".refine-result").innerText()).replace(/\s+/g, " ").slice(0, 160);
	const after = await boxes();
	const ok = box.length > 5 && !moved && after === before && !errs.length && !whisper.some(x => x.startsWith("FAILED") || / [45]\d\d$/.test(x)) && !/Could not|Refining…|^Say or type/.test(result);
	console.log(w, ok ? "PASS" : "FAIL", JSON.stringify({ box, moved, steady: after === before, result, whisper_requests: whisper.length, whisper_bad: whisper.filter(x => x.startsWith("FAILED") || / [45]\d\d$/.test(x)), errs, final: await conn() }));
	if (!ok) fail++;
	if (dir) await p.screenshot({ path: `${dir}/refine-${w}.png`, fullPage: true });
	await ctx.close();
}
await b.close(); process.exit(fail ? 1 : 0);
