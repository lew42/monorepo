// The misordered bubble, replayed: "Can you hear me?" then "now?" must read in that order in the chat.
//   node public/framework/ux/Dictate/test/order.mjs <base-url> [skew-ms]
// Headless, phone sheet at 400, every Servex call stubbed (nothing is posted). The mic is driven by hand, as in test/flicker.mjs.
// What it replays (session 2026/10/25/v-xhx7fmx, lines 30-31, and order/report.md): the phone and the PC have different clocks.
// The phone stamps each sentence when it leaves the draft (ComposerMic.stamp); Servex writes the line with ITS clock and answers
// with that `at`; chat.js retags the bubble piece to it, and Chat.js retag_piece moves the piece's `at` too. The next sentence,
// drawn with the phone's stamp, is then "earlier" than the one before it, and speak() splices it in front.
// Four runs: skew 0 (the control, both clocks agree), skew SKEW_MS (the PC ahead of the phone), skew SKEW_MS with the assistant's
// reply between the two sentences (the owner's bubble is closed by the reply that lands below it: the next sentence starts a new
// owner bubble below the reply, and nothing already shown moves — the owner, 2026-11-01, which replaced the 2026-10-25 rule that
// pulled the open bubble down past the reply; the full replay of the incident is test/v1-order.mjs),
// and a reload from a session file whose lines are out of order but carry `said_at` (Chat.js orders by said_at ?? at). Any run out of
// order fails the script (exit 1).
import path from "path";

const [base = "http://monorepo.localhost", skew_arg] = process.argv.slice(2);
const SKEW_MS = Number(skew_arg ?? 1500);   // the PC's clock ahead of the phone's; the incident's record proves at least 280 ms
const SAY_MS = 150;                          // Servex answers session/say quickly, so the first answer lands before the second sentence
const SAID = ["Can you hear me?", "now?"];
const REPLY = "Yes, I can hear you.";
const { default: Browser } = await import(new URL("../../../../../Server/Browser.mjs", import.meta.url).href);   // the shared launcher: no window
const browser = await Browser.launch();
const kill = setTimeout(() => { console.log("FAIL killed after 120 s"); process.exit(2); }, 120000);

async function run(skew, { reply = false, reload = false } = {}){
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
	if (reload){   // a file written in arrival order, not spoken order: B's send was slow, so it was written after A's... the other way round
		const T = Date.now();
		const ln = (at, said_at, text) => ({ chat: { at: new Date(T + at).toISOString(), said_at: new Date(T + said_at).toISOString(), from: { kind: "owner" }, via: "voice", text } });
		lines.push(ln(1000, 3000, SAID[1]), ln(2000, 1000, SAID[0]));   // file order: "now?" then "Can you hear me?"; spoken order the reverse
	}
	await page.goto(base + "/framework/ext/drawer/", { waitUntil: "domcontentloaded" });
	await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
	await page.evaluate(async () => { const { default: Sheet } = await import("/framework/ext/drawer/Sheet.js"); window.$sheet = Sheet.of(); await window.$sheet.to("full", { listen: false }); });
	await page.waitForSelector(".drawer-rail-sheet.on .ux-dictate-widget", { timeout: 20000 });
	await page.waitForTimeout(800);

	// Say the first sentence, pause (it sends), wait for Servex's answer (the retag), then say the second and pause again.
	const trace = reload ? await page.evaluate(async () => {
		await (await import("/framework/ux/Dictate/chat.js")).resume("stub-session");
		await new Promise(r => setTimeout(r, 2500));
		const pieces = [...globalThis.$dictate_widget.$thread.el.querySelectorAll(".chatbox-you [data-re], .chatbox-reply [data-re]")]
			.map(n => ({ text: n.querySelector(".chatbox-text")?.textContent.trim() ?? n.textContent.trim(), re: n.dataset.re })).filter(p => !p.text.startsWith("recite:"));   // Recite's own trace line, drawn as a reply bubble on session change: not part of the conversation
		return [{ step: "reloaded", pieces }];
	}) : await page.evaluate(async ({ SAID, SAY_MS, REPLY, reply, skew }) => {
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
		// every piece in the bubbles (the owner's, and the reply's in the third run), in DOM order, with the `at` it is ordered by
		const pieces = () => [...globalThis.$dictate_widget.$thread.el.querySelectorAll(".chatbox-you [data-re], .chatbox-reply [data-re]")]
			.map(n => ({ text: n.querySelector(".chatbox-text")?.textContent.trim() ?? n.textContent.trim(), re: n.dataset.re })).filter(p => !p.text.startsWith("recite:"));   // Recite's own trace line, drawn as a reply bubble on session change: not part of the conversation
		const out = [];
		await wait(300);
		await say(SAID[0]);
		m.send_screen();
		await wait(SAY_MS + 600);    // the first send is answered: its piece now carries Servex's `at`
		out.push({ step: "first sent and answered", pieces: pieces() });
		if (reply){   // the assistant answers, written by Servex with its own clock, the way chat.js draws a line from the live wire
			globalThis.$dictate_widget.say({ chat: { at: new Date(Date.now() + skew).toISOString(), from: { kind: "assistant", id: "smart" }, via: "text", text: REPLY } });
			await wait(300);
			out.push({ step: "the reply drawn", pieces: pieces() });
		}
		await say(SAID[1]);
		m.send_screen();
		await wait(SAY_MS + 1500);   // the second is answered too, and the poll has run
		out.push({ step: "both sent and answered", pieces: pieces() });
		return out;
	}, { SAID, SAY_MS, REPLY, reply, skew });

	const got = trace.at(-1).pieces.map(p => p.text);
	const norm = t => String(t).toLowerCase().replace(/[^a-z ]+/g, "").trim();
	// reply: true — the reply lands between the two owner sentences and stays where it landed: sentence, reply, sentence.
	const want = reply ? [SAID[0], REPLY, SAID[1]] : SAID;
	const ok = got.length === want.length && got.every((t, i) => norm(t).endsWith(norm(want[i])));
	const label = (ok ? "ok  " : "FAIL") + ` skew ${skew} ms (${reload ? "lines carry said_at" : skew ? "PC clock ahead of the phone" : "clocks agree"}${reply ? ", a reply between; it stays between" : ""})`;
	console.log(`${label}: ${reload ? "reload from a file out of order: " : ""}the chat reads ${got.map(t => JSON.stringify(t)).join(" then ")}; want ${want.map(t => JSON.stringify(t)).join(" then ")}`);
	for (const s of trace) console.log(`       ${s.step}: ${s.pieces.map(p => `${JSON.stringify(p.text)} @${p.re}`).join(" | ")}`);
	console.log(`       Servex wrote: ${lines.map(l => `${JSON.stringify(l.chat.text)} @${l.chat.at}`).join(" | ")}`);
	if (errors.length) console.log(`FAIL skew ${skew} ms: page error — ${errors[0]}`);
	await ctx.close();
	return ok && !errors.length;
}

let all = true;
for (const skew of [0, SKEW_MS]) all = (await run(skew)) && all;
all = (await run(SKEW_MS, { reply: true })) && all;   // the cross-bubble case: one clock (ComposerMic.stamp + clock.offset) fixes it
all = (await run(0, { reload: true })) && all;   // a reload orders by said_at, not by file order
clearTimeout(kill);
await browser.close();
process.exit(all ? 0 : 1);
