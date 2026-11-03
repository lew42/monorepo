// demo-local-refine.mjs — proof for deliverable 3: Echo's own clean() + structure() (the exact
// two functions Servex/agents/Echo.js now calls on every owner prompt) running against
// qwen2.5-coder through the local proxy, on 3 real dictated prompts, at $0. `call` here is the
// same (prompt, {model, cwd}) -> {answer, cost_usd} shape engine.js/structure.js expect from
// Echo.js's own `this.call()` — just pointed straight at the local proxy by fetch instead of
// going through a whole spawned Claude Code session, so this demo runs in seconds, not minutes.
import { clean } from "../../../../../../../ext/Refine/engine.js";
import { structure } from "../../../../../../../ext/Refine/structure.js";

const PROXY = "http://127.0.0.1:8998/v1/chat/completions";

async function call(prompt, { model } = {}){
	const slug = String(model ?? "local/qwen2.5-coder").replace(/^local\//, "");
	const res = await fetch(PROXY, {
		method: "POST", headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ model: slug, temperature: 0.1, max_tokens: 800, messages: [{ role: "user", content: prompt }] })
	});
	if (!res.ok) throw new Error(`local HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
	const data = await res.json();
	return { answer: data.choices?.[0]?.message?.content ?? "", cost_usd: 0 };
}

// 3 real raw owner prompts, same ones new-brain's own litmus run used (level_c, which is where
// qwen2.5-coder scored 8/10 — the bar deliverable 3 asks for), picked here for variety: a short
// one, a medium one, a longer rambling one.
const PROMPTS = [
	{ id: "c5", raw: `this message, and the last, are coming from vs code sidebar` },
	{ id: "c7", raw: `you're our new vs-code mastermind\n\ncan you read the handoff?` },
	{ id: "c10", raw: `Is is my dev server running? I just tried to access it from my phone phone and I don't know if I had typed, you know, node server.js or if if you have the ability to run the server if it's not running, please do that so that I don't have to stand up and go type it in myself.` }
];

async function main(){
	const out = [];
	for (const p of PROMPTS){
		const t0 = Date.now();
		const { sentences, strikes, misheard, flags } = await clean(p.raw, { call, model: "local/qwen2.5-coder" });
		const built = await structure(sentences, { call, model: "local/qwen2.5-coder" });
		out.push({ id: p.id, raw: p.raw, ms: Date.now() - t0, sentences: sentences.map(s => s.text), structured_md: built.md, cost_usd: 0 });
		console.log(`--- ${p.id} (${Date.now() - t0}ms, $0) ---`);
		console.log(built.md || sentences.map((s, i) => `${i + 1}. ${s.text}`).join("\n"));
		console.log();
	}
	const fs = await import("node:fs");
	fs.writeFileSync(new URL("./demo-local-refine.json", import.meta.url), JSON.stringify(out, null, 2));
}

main().catch(e => { console.error("FATAL", e); process.exit(1); });
