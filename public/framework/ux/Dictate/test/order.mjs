// The misordered bubble, replayed: "Can you hear me?" then "now?" must read in that order in the chat.
//   node public/framework/ux/Dictate/test/order.mjs <base-url> [skew-ms]
// Headless, phone sheet at 400, every Servex call stubbed (nothing is posted). The mic is driven by hand, as in test/flicker.mjs.
// What it replays (session 2026/10/25/v-xhx7fmx, lines 30-31, and order/report.md): the phone and the PC have different clocks.
// The phone stamps each sentence when it leaves the draft (ComposerMic.stamp); Servex writes the line with ITS clock and answers
// with that `at`; chat.js retags the bubble piece to it, and Chat.js retag_piece moves the piece's `at` too. The next sentence,
// drawn with the phone's stamp, is then "earlier" than the one before it, and speak() splices it in front.
// Two runs: skew 0 (the control, both clocks agree) and skew SKEW_MS (the PC ahead of the phone). Exit 1 when any run reads out of order.
import path from "path";

const [base = "http://monorepo.localhost", skew_arg] = process.argv.slice(2);
const SKEW_MS = Number(skew_arg ?? 1500);   // the PC's clock ahead of the phone's; the incident's record proves at least 280 ms
const SAY_MS = 150;                          // Servex answers session/say quickly, so the first answer lands before the second sentence
const SAID = ["Can you hear me?", "now?"];
const { default: Browser } = await import(new URL("../../../../../Server/Browser.mjs", import.meta.url).href);   // the shared launcher: no window
const browser = await Browser.launch();
const kill = setTimeout(() => { console.log("FAIL killed after 120 s"); process.exit(2); }, 120000);

async function run(skew){
	const ctx = await browser.newContext({ viewport: { width: 400, height: 800 }, hasTouch: true, isMobile: true });
	const page = await ctx.newPage();
	const errors = [], lines = [];
	page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
	const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
	const json = (route, out) => route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(out) }).catch(() => {});
	await page.route(/\/api\/session\//, async route => {
		const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
		if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
		if (verb.endsWith("/stream")) return route.fulfill({ status: 200, contentType: "text/event-stream", headers: cors, body: "retry: 60000\n\n" });
		let body = {}; try { body = JSON.parse(req.postData() ?? "{}"); } catch {}
		if (verb === "say"){   // Servex stamps the line with its own clock, the way Session.say's `at` comes back
			const at = new Date(Date.now() + skew).toISOString();
			lines.push({ chat: { at, from: { kind: "owner" }, via: "voice", text: body.text } });
			await new Promise(r => setTimeout(r, SAY_MS));
			return json(route, { ok: true, at });
		}
		return json(route, verb === "new" || verb === "resume" ? { ok: true, session: "stub-session", file: "/stub-session.jsonl" } : { ok: true });
	});
	await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: lines.map(l => JSON.stringify(l)).join("\n") }));
	await page.route(/\/api\/sessions\?/, r => json(r, { ok: true, sessions: [] }));
	await page.route(/\/log\/prompts/, r => json(r, {}));
	await page.route(/\/api\/hitl/, r => json(r, { ok: true, marks: [{ mark: "ok" }] }));
	await page.route(/\/api\/refine\/live/, r => json(r, { ok: true, slots: [], outline: { sections: [] } }));
	await page.goto(base + "/framework/ext/drawer/", { waitUntil: "domcontentloaded" });
	await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
	await page.evaluate(async () => { const { default: Sheet } = await import("/framework/ext/drawer/Sheet.js"); window.$sheet = Sheet.of(); await window.$sheet.to("full", { listen: false }); });
	await page.waitForSelector(".drawer-rail-sheet.on .ux-dictate-widget", { timeout: 20000 });
	await page.waitForTimeout(800);

	// Say the first sentence, pause (it sends), wait for Servex's answer (the retag), then say the second and pause again.
	const trace = await page.evaluate(async ({ SAID, SAY_MS }) => {
		const m = globalThis.$dictate_widget.dictate, wait = ms => new Promise(r => setTimeout(r, ms));
		m.state = "listening";
		m.revise = false;
		let chunk = 0;
		const say = async text => {
			const words = text.replace(/[.!?]$/, "").split(" ");
			for (let n = 1; n <= words.length; n++){ m.partial_text = words.slice(0, n).join(" "); m.draw_caption(); await wait(120); }
			m.partial_text = "";
			m.log_prompt(text, ++chunk);   // Whisper's final
		};
		// every piece in the owner's bubbles, in DOM order, with the `at` it is ordered by
		const pieces = () => [...globalThis.$dictate_widget.$thread.el.querySelectorAll(".chatbox-you [data-re]")]
			.map(n => ({ text: n.querySelector(".chatbox-text")?.textContent.trim() ?? n.textContent.trim(), re: n.dataset.re }));
		const out = [];
		await wait(300);
		await say(SAID[0]);
		m.send_screen();
		await wait(SAY_MS + 600);    // the first send is answered: its piece now carries Servex's `at`
		out.push({ step: "first sent and answered", pieces: pieces() });
		await say(SAID[1]);
		m.send_screen();
		await wait(SAY_MS + 1500);   // the second is answered too, and the poll has run
		out.push({ step: "both sent and answered", pieces: pieces() });
		return out;
	}, { SAID, SAY_MS });

	const got = trace.at(-1).pieces.map(p => p.text);
	const norm = t => String(t).toLowerCase().replace(/[^a-z ]+/g, "").trim();
	const ok = got.length === SAID.length && got.every((t, i) => norm(t).endsWith(norm(SAID[i])));
	console.log(`${ok ? "ok  " : "FAIL"} skew ${skew} ms (${skew ? "PC clock ahead of the phone" : "clocks agree"}): the chat reads ${got.map(t => JSON.stringify(t)).join(" then ")}; said ${SAID.map(t => JSON.stringify(t)).join(" then ")}`);
	for (const s of trace) console.log(`       ${s.step}: ${s.pieces.map(p => `${JSON.stringify(p.text)} @${p.re}`).join(" | ")}`);
	console.log(`       Servex wrote: ${lines.map(l => `${JSON.stringify(l.chat.text)} @${l.chat.at}`).join(" | ")}`);
	if (errors.length) console.log(`FAIL skew ${skew} ms: page error — ${errors[0]}`);
	await ctx.close();
	return ok && !errors.length;
}

let all = true;
for (const skew of [0, SKEW_MS]) all = (await run(skew)) && all;
clearTimeout(kill);
await browser.close();
process.exit(all ? 0 : 1);
