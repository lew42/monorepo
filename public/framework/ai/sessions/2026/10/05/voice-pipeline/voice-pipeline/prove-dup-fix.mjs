import { browser, close } from "file:///C:/Code/lew42/monorepo/Server/browser.mjs";

const BASE = process.argv[2] || "http://localhost:61364";

const result = await (async () => {
	const b = await browser();
	const ctx = await b.newContext();
	const page = await ctx.newPage();
	const logs = [];
	page.on("console", m => logs.push(m.text()));
	await page.goto(BASE + "/framework/ux/Dictate/", { waitUntil: "load" });

	const out = await page.evaluate(async () => {
		const mod = await import("/framework/ux/Dictate/Dictate.js");
		const Dictate = mod.default;
		const calls = [];

		const fake = {
			settled: "", settled_lines: [], partial_text: "",
			segment_epoch: 0, req_seq: 0, applied_seq: 0,
			has_speech: false, skipped_silent: false,
			mic: { cut(){}, loudness(){ return { loud_ms: 999 }; }, rate(){ return 16000; } },
			speech_floor: 0.02, min_speech_ms: 120,
			draw_caption(){}, clear_guess(){ calls.push({ type: "clear" }); this.partial_text = ""; },
			log_step(){}, set_error(msg){ calls.push({ type: "error", msg }); },
			on_text: (chunk, reason) => calls.push({ type: "commit", chunk, reason }),
			on_guess: g => calls.push({ type: "guess", g }),
			annotation: Dictate.prototype.annotation,
			worth_sending: Dictate.prototype.worth_sending,
			commit: Dictate.prototype.commit,
			push_to_target(chunk, reason){ this.on_text?.(chunk, reason); },
			revise_chunk(){},
			next_chunk_id: Dictate.prototype.next_chunk_id,
			async log_prompt(){},
		};

		// Simulate the exact race: ONE prior partial already "in flight" that both
		// close_segment() calls will see and wait on — the real shared-`this.inflight`
		// hazard between a heartbeat "pause" close and a user-pressed "manual" stop.
		let tag = 0;
		fake.mic.snapshot = () => { tag++; return tag === 1 ? "A" : "B"; };
		fake.transcribe = samples => new Promise(res => {
			// A (the FIRST call, "pause") answers SLOW with a short, stale guess.
			// B (the SECOND call, "manual") answers FAST with the real, full text —
			// exactly the out-of-order shape the owner caught on the phone.
			if (samples === "A") setTimeout(() => res("ask not what your country can"), 150);
			else setTimeout(() => res("ask not what your country can do for you, ask what you can do for your country."), 20);
		});
		fake.inflight = new Promise(res => setTimeout(res, 5)); // the shared prior partial

		const pA = Dictate.prototype.close_segment.call(fake, "pause");
		const pB = Dictate.prototype.close_segment.call(fake, "manual");
		await Promise.all([pA, pB]);
		await new Promise(r => setTimeout(r, 300)); // let any stray late commit surface

		return { calls, settled: fake.settled };
	});

	await ctx.close();
	return { out, logs };
})();

console.log(JSON.stringify(result, null, 2));
await close();
