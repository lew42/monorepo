/* `node Servex/ext/refine/test/LiveRefine.test.mjs` — no model, no server, no Servex: a fake `call`
 * stands in for RefineCall.run. Covers the checked-ops rules from the design doc
 * (`public/framework/ext/Refine/doc/live-refine-2026-10-12.md`): coverage holds, an unknown id
 * becomes an add, an uncited new sentence is force-placed and flagged `unplaced`, and coalescing
 * answers more POSTs than it spends amend calls. */
import LiveRefine from "../LiveRefine.js";

let fail = 0;
const check = (name, ok, extra) => { console.log(ok ? "PASS" : "FAIL", name, extra != null && !ok ? JSON.stringify(extra) : ""); if (!ok) fail++; };

/** A fake amend call: "clean" stage always answers empty (clean() falls back to the mechanical
 *  text, so no model and no extra ticks); "amend" stage runs `script(newNumbers, prompt)` ->
 *  {subject, ops}, JSON-stringified, with made-up but shaped cost/tokens. */
function fake_call(script){
	return async (prompt, opts) => {
		if (opts.stage === "clean") return { answer: "", cost_usd: 0, tokens: { in: 10, out: 2 }, duration_ms: 1, model: "fake" };
		const ns = [...prompt.matchAll(/^S(\d+):/gm)].map(m => +m[1]);
		const { subject = null, ops = [] } = script(ns, prompt) ?? {};
		return { answer: JSON.stringify({ subject, ops }), cost_usd: 0.0001, tokens: { in: 500, out: 60 }, duration_ms: 5, model: "fake" };
	};
}

const coverage_ok = out => {
	const cited = new Set(out.outline.sections.flatMap(s => s.cards.flatMap(c => c.cites)));
	return out.slots.every(s => cited.has(s.n));
};

// ---- 1: coverage holds + an uncited new sentence becomes unplaced -------------------------
await (async () => {
	const call = fake_call(ns => ({ ops: [{ add: { section: "🧩 Topic", text: "⬜ the first point", cites: [ns[0]] } }] }));   // cites only the first of the two new sentences
	const r = LiveRefine.get("test-1", { call });
	const out = await r.step({ prompt: "test-1", text: "One thing happened. Then another thing happened.", final: true });
	check("1a: every slot is cited somewhere (coverage)", coverage_ok(out), out.outline);
	check("1b: the uncited sentence is flagged unplaced", out.unplaced.length === 1 && out.unplaced[0] === out.slots[out.slots.length - 1].n, out.unplaced);
	check("1c: done after final", out.done === true);
})();

// ---- 2: an edit against an unknown id becomes an add, not a mutation -----------------------
await (async () => {
	let turn = 0;
	const call = fake_call(ns => {
		turn++;
		if (turn === 1) return { ops: [{ add: { section: "🧩 Topic", text: "⬜ known point", cites: ns } }] };
		return { ops: [{ edit: { id: "c999", text: "⬜ should become its own card", cites: ns } }] };   // c999 never existed
	});
	const r = LiveRefine.get("test-2", { call });
	const out1 = await r.step({ prompt: "test-2", text: "First sentence here. padding", final: false });
	const cards_after_1 = out1.outline.sections.flatMap(s => s.cards).length;
	const out2 = await r.step({ prompt: "test-2", text: "First sentence here. Second sentence here. padding", final: true });
	const cards = out2.outline.sections.flatMap(s => s.cards);
	check("2a: the first card landed", cards_after_1 === 1, out1.outline);
	check("2b: the unknown-id edit added a NEW card instead of mutating one", cards.length === 2 && cards.some(c => c.text === "⬜ should become its own card"), cards);
	check("2c: coverage still holds", coverage_ok(out2));
})();

// ---- 3: coalescing — three POSTs in flight cost fewer than three amend calls ----------------
await (async () => {
	let amend_calls = 0;
	const call = fake_call(ns => { amend_calls++; return { ops: [{ add: { section: "🎙️ Live", text: "⬜ point " + ns.join(","), cites: ns } }] }; });
	const r = LiveRefine.get("test-3", { call });
	const texts = [
		"Sentence one. padding",
		"Sentence one. Sentence two. padding",
		"Sentence one. Sentence two. Sentence three. padding",
	];
	const outs = await Promise.all(texts.map((text, i) => r.step({ prompt: "test-3", text, final: i === texts.length - 1 })));
	const last = outs[outs.length - 1];
	check("3a: all three sentences placed (coverage)", coverage_ok(last), last.outline);
	check("3b: coalescing spent fewer amend calls than POSTs", amend_calls < texts.length, { amend_calls });
})();

process.exit(fail ? 1 : 0);
