// A sentence goes out when it ends, not when you pause. Headless; the mic is driven by hand (guesses and finals are fed in).
//   node public/framework/ux/Dictate/test/sentences.mjs <base-url>
// A: three sentences, no pause, the guess grows word by word: 3 sends in order, each sent as soon as the next words follow it,
//    and the final (same three sentences) adds no duplicate.
// B: a final that holds three sentences and was never guessed leaves as three lines, in order.
// C: the final hears an early sentence differently: still no second copy (the early wording stays, the difference is logged).
// D: early_sentences off: nothing leaves before the final.
const [base = "http://monorepo.localhost"] = process.argv.slice(2);
const { default: Browser } = await import(new URL("../../../../../Server/Browser.mjs", import.meta.url).href);
const browser = await Browser.launch();
const page = await (await browser.newContext()).newPage();
const errors = []; page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
await page.route(/\/(cards\?|api\/agents)/, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: "[]" }));
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };
await page.goto(base + "/framework/ux/Dictate/", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.querySelector(".page"), null, { timeout: 20000 });
const out = await page.evaluate(async () => {
	const { View } = await import("/framework/core/View/View.js");
	const { ComposerMic, SETTINGS } = await import("/framework/ext/Chat/Mic.js");
	const wait = ms => new Promise(r => setTimeout(r, ms));
	SETTINGS.send_mode = "pause"; SETTINGS.sentences_per_send = 1;
	async function scenario(guesses, final, { early = true } = {}){
		SETTINGS.early_sentences = early;
		const host = document.createElement("div"); document.body.append(host);
		const sent = [];
		let m; new View({ el: host, capture: false }).append(() => { m = new ComposerMic({ deliver: async e => { sent.push({ t: Math.round(performance.now()), text: e.text }); return true; } }); });
		m.state = "listening"; m.base = ""; m.segment_epoch = 0;
		const marks = [];   // which guess index was being fed when each send appeared
		for (let i = 0; i < guesses.length; i++){
			const epoch = m.segment_epoch;
			m.partial_text = guesses[i]; m.early_from_guess(guesses[i], epoch);
			await wait(120);
			marks.push(sent.length);
		}
		m.segment_epoch++; m.final_epoch = m.segment_epoch - 1;   // what close_segment() does just before commit()
		m.commit(final, "pause");
		await wait(600);
		return { sent: sent.map(s => s.text), marks };
	}
	const G = ["One thing is first.", "One thing is first. Then", "One thing is first. Then the second thing happens.", "One thing is first. Then the second thing happens. And", "One thing is first. Then the second thing happens. And finally the third?", "One thing is first. Then the second thing happens. And finally the third? Done"];
	const F = "One thing is first. Then the second thing happens. And finally the third?";
	return {
		a: await scenario(G, F),
		b: await scenario([], "Open the window now. The dog barked loudly. Tomorrow we ship it."),
		c: await scenario(["The cat sat down. And"], "The cat sat down! And then it slept."),
		d: await scenario(G, F, { early: false }),
	};
});
console.log(JSON.stringify(out));
const A = out.a;
check(JSON.stringify(A.sent) === JSON.stringify(["One thing is first.", "Then the second thing happens.", "And finally the third?"]), "A: three sends in order, no duplicates: " + JSON.stringify(A.sent));
check(A.marks[0] === 0 && A.marks[1] === 1 && A.marks[2] === 1 && A.marks[3] === 2 && A.marks[4] === 2 && A.marks[5] === 3, "A: each went out as its sentence ended, before the pause: " + A.marks.join(","));
check(JSON.stringify(out.b.sent) === JSON.stringify(["Open the window now.", "The dog barked loudly.", "Tomorrow we ship it."]), "B: a final of three sentences leaves as three lines: " + JSON.stringify(out.b.sent));
check(out.c.sent.length === 2 && out.c.sent[0] === "The cat sat down." && /then it slept/.test(out.c.sent[1]), "C: no second copy of the early sentence: " + JSON.stringify(out.c.sent));
check(out.d.sent.length === 3, "D: early off, the final still sends all three: " + JSON.stringify(out.d.sent));
check(!errors.length, "no page errors: " + errors.join(" | "));
await browser.close();
console.log(failed ? `${failed} FAILED` : "all passed");
process.exit(failed ? 1 : 0);
