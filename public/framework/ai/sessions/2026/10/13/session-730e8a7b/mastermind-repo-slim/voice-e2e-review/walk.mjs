/* node walk.mjs <phone|desk> <outdir> [base] — the owner's dictation flow, headless, through real Whisper:
 * Chromium's fake mic plays four.wav (four sentences, 9-12 s gaps). A shot after every gesture and after every new bubble.
 * Writes <outdir>/steps.json and NN-<step>.png. */
import fs from "node:fs"; import path from "node:path";
import { browser, close } from "file:///C:/Code/lew42/monorepo/Server/browser.mjs";
const HERE = "C:/Users/mike/.claude/projects/C--Code-lew42-monorepo/8d2cdcd2-c42a-452a-a348-5af50c8fc52d/scratch/";
const [kind = "phone", OUT = HERE + "walk-" + kind, base = "http://monorepo.localhost"] = process.argv.slice(2);
const WAV = process.env.WAV || HERE + "four.wav", LISTEN_MS = Number(process.env.LISTEN_MS || 80000);
fs.mkdirSync(OUT, { recursive: true });
const PUB = "C:/Code/lew42/monorepo/public";
const b = await browser({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${WAV}`] });
const phone = kind === "phone";
const ctx = await b.newContext(phone ? { viewport: { width: 400, height: 800 }, isMobile: true, hasTouch: true, permissions: ["microphone"] } : { viewport: { width: 1200, height: 800 }, permissions: ["microphone"] });
if (process.env.OVERLAY){ /* serve the worktree copy of these files on the main site: real session data, new code */
	const files = ["framework/ux/Dictate/chat.js", "framework/ext/drawer/rail.js", "framework/ext/drawer/rail.css"];
	await ctx.route(u => files.some(f => new URL(u).pathname === "/" + f), (r) => { const f = files.find(f => new URL(r.request().url()).pathname === "/" + f); r.fulfill({ status: 200, contentType: f.endsWith(".css") ? "text/css" : "text/javascript", body: fs.readFileSync(process.env.OVERLAY + "/public/" + f) }); });
}
const p = await ctx.newPage();
const errs = []; p.on("pageerror", e => errs.push("pageerror " + e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
p.on("response", r => r.status() >= 400 && errs.push(r.status() + " " + r.url()));
const steps = []; let n = 0; const T0 = Date.now();
const ROOT = phone ? ".drawer-rail-sheet.on" : ".drawer";
async function state(){
	return p.evaluate(ROOT => {
		const root = document.querySelector(ROOT) ?? document.body;
		const bubbles = [...root.querySelectorAll(".chatbox-you, .chatbox-reply")].filter(e => e.getBoundingClientRect().height > 0 || true)
			.map(e => (e.classList.contains("chatbox-you") ? "you" : "reply") + (e.classList.contains("chatbox-streaming") ? "~" : "") + ": " + e.textContent.replace(/\s+/g, " ").trim().slice(0, 70));
		const mi = [...document.querySelectorAll(".ux-dictate-mic-indicator")].map(e => { const r = e.getBoundingClientRect(); return { open: e.classList.contains("open"), shown: r.width > 0 && getComputedStyle(e).display !== "none", y: Math.round(r.y) }; });
		const sheet = document.querySelector(".drawer-rail-sheet.on"); const sr = sheet?.getBoundingClientRect();
		const mic = [...document.querySelectorAll(".ux-dictate-btn")].filter(e => e.getBoundingClientRect().width > 0).map(e => e.className);
		let saved = null; try { saved = JSON.parse(sessionStorage.getItem("lew42-voice-session")); } catch {}
		return { bubbles, mi, sheet: sr ? { h: Math.round(sr.height), top: Math.round(sr.top), full: sheet.classList.contains("drawer-rail-sheet-full"), tabs: [...sheet.querySelectorAll(".drawer-rail-sheet-tabrow .drawer-tab")].map(t => t.textContent) } : null, mic, session: saved?.session ?? null, file: saved?.file ?? null };
	}, ROOT);
}
async function shot(name, extra = {}){
	const s = await state(); const file = `${String(++n).padStart(2, "0")}-${name}.png`;
	await p.screenshot({ path: path.join(OUT, file) });
	const row = { n, name, t: Date.now() - T0, file, errors: errs.splice(0), ...s, ...extra };
	steps.push(row); console.log(JSON.stringify({ n, name, t: row.t, bubbles: s.bubbles.length, session: s.session, mic: s.mic, errors: row.errors.length, ...extra }));
	return s;
}
const file_lines = f => { try { return fs.readFileSync(PUB + f, "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l)); } catch { return []; } };

await p.goto(base + "/framework/", { waitUntil: "load" }); await p.waitForTimeout(2500);
await shot("loaded");
// 1 open the surface
if (phone){ await p.tap(".drawer-rail-ai"); await p.waitForTimeout(400); await shot("tap-AI"); await p.tap(".drawer-rail-sheet.on .ux-dictate-btn"); await p.waitForTimeout(600); await shot("mic-stop"); }
else { await p.click(".drawer-menu"); await p.waitForTimeout(1500); await shot("open-drawer"); }
const before = (await state()).session;
// 2 New session
if (phone){
	const vis = await p.locator(".drawer-rail-sheet.on .ux-dictate-chat-new-session").isVisible();
	if (!vis){ await p.tap(".drawer-rail-sheet.on .drawer-rail-sheet-more"); await p.waitForTimeout(400); await shot("tap-More"); }
	await p.tap(".drawer-rail-sheet.on .ux-dictate-chat-new-session");
} else await p.click(".drawer .ux-dictate-chat-new-session");
await p.waitForTimeout(800); await shot("new-session", { before });
// 3 mic on, speak four sentences (the WAV), shoot every new bubble
const mic_sel = phone ? ".drawer-rail-sheet.on .ux-dictate-btn" : ".drawer .ux-dictate-btn";
if (phone) await p.tap(mic_sel); else await p.click(mic_sel);
const t_mic = Date.now(); await p.waitForTimeout(700);
const s_open = await shot("mic-on");
let last = s_open.bubbles.join("|"), expanded = false, ticks = 0;
while (Date.now() - t_mic < LISTEN_MS){
	await p.waitForTimeout(500); ticks++;
	const s = await state(); const sig = s.bubbles.filter(x => !x.startsWith("reply~")).join("|");
	if (sig !== last){ last = sig; await shot("bubble", { since_mic: Date.now() - t_mic, last: s.bubbles.at(-1) }); }
	if (phone && !expanded && Date.now() - t_mic > 40000){
		expanded = true;
		const g = await p.locator(".drawer-rail-sheet.on .grip").first().boundingBox();
		if (g){ const x = g.x + g.width / 2, y = g.y + g.height / 2; await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 15; i++) await p.mouse.move(x, y - (y - 5) * i / 15); await p.mouse.up(); }
		await p.waitForTimeout(800); await shot("drag-to-full", { grip: g });
	}
}
await shot("before-mic-off");
if (phone) await p.tap(mic_sel).catch(e => console.log("mic tap", e.message.slice(0, 80))); else await p.click(mic_sel).catch(e => console.log("mic click", e.message.slice(0, 80)));
await p.waitForTimeout(6000);
const fin = await shot("mic-off");
// session-file order vs bubble order
const lines = fin.file ? file_lines(fin.file) : [];
const file_order = lines.filter(l => l.chat).map(l => `${l.chat.from.kind === "owner" ? "you" : "reply"}(${l.chat.from.id ?? l.chat.from.kind}) @${l.chat.at}: ${l.chat.text.replace(/\s+/g, " ").slice(0, 70)}`);
const firsts = []; let pending = null;
for (const l of lines.filter(l => l.chat)){
	if (l.chat.from.kind === "owner"){ if (!pending) pending = Date.parse(l.chat.at); }
	else if (pending){ firsts.push({ by: l.chat.from.id ?? l.chat.from.kind, ms: Date.parse(l.chat.at) - pending }); pending = null; }
}
// 4 the Refine page, same tab (sessionStorage carries the session)
await p.goto(base + "/framework/ext/Refine/", { waitUntil: "load" }); await p.waitForTimeout(6000);
const refine = await p.evaluate(() => document.querySelector(".refine-demo")?.innerText.replace(/\s+/g, " ").slice(0, 600) ?? null);
await shot("refine-page", { refine });
fs.writeFileSync(path.join(OUT, "steps.json"), JSON.stringify({ kind, base, session: fin.session, file: fin.file, steps, file_order, firsts, lines: lines.map(l => JSON.stringify(l).slice(0, 220)) }, null, 1));
console.log("FILE ORDER\n" + file_order.join("\n") + "\nDOM ORDER\n" + fin.bubbles.join("\n") + "\nFIRSTS " + JSON.stringify(firsts) + "\nREFINE " + refine);
await close();
