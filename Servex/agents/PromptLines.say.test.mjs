// Node test for the Chat-v2 Prompt logic in Sessions.js's `say()`/`hold_thought()`/`release_thought()`/`voice_say()` —
// a STUB Sessions, not the real class (Sessions.js transitively needs the Claude Agent SDK and a live Servex, which
// this worktree has neither of). The stub's methods are the same bodies as Sessions.js's (round 2, requirements-2.md
// §1-3), trimmed to the fast seat only (no WakePolicy/smart-seat machinery) — a change to the real file's logic
// should be mirrored here. `PromptLines.js` itself is imported for real, not reimplemented.
// Run: `node PromptLines.say.test.mjs`.
import * as PromptLines from "./PromptLines.js";
import ChatV2Model from "../../public/framework/ext/Chat/v2/ChatV2Model.js";

const results = [];
const check = (title, fn) => {
	let ok;
	try { ok = !!fn(); } catch (e){ ok = false; console.error(e); }
	results.push(ok);
	console.log(`${ok ? "PASS" : "FAIL"} — ${title}`);
};

class StubSessions {
	constructor(){ this.thoughts = new Map(); this.written = []; this.sent = []; }

	write(s, line){ this.written.push(line); }
	send(s, role, text){ this.sent.push({ role, text }); }

	assign_prompt(s, { text, raw }){
		if (s.prompt){
			this.write(s, PromptLines.push_raw(s.prompt, raw ?? text));
			this.write(s, PromptLines.append_paragraph(s.prompt, { para_id: "a", text: " " + text }));
			return s.prompt;
		}
		const id = PromptLines.prompt_id();
		this.write(s, PromptLines.add_prompt({ id, raw: raw ?? text, text }));
		s.prompt = id;
		return id;
	}

	hold_thought(s, line){
		const h = this.thoughts.get(s.id) ?? { lines: [] };
		h.lines.push(line);
		this.thoughts.set(s.id, h);
	}

	voice_say(s, fresh){
		const prompt = fresh[fresh.length - 1]?.prompt;
		this.send(s, "fast", `${fresh.map(l => l.text).join(" ")}` + (prompt ? `\n(prompt ${prompt})` : ""));
	}

	release_thought(s){
		const h = this.thoughts.get(s.id);
		if (!h?.lines.length) return false;
		this.thoughts.delete(s.id);
		s.prompt = null;
		this.voice_say(s, h.lines);
		return true;
	}

	// Trimmed `say()`: the kind branch, then the voice-floor thought-holding path only (what this test exercises).
	say(s, { text, raw, floor, kind = "speech" } = {}){
		if (kind !== "speech"){
			if (kind === "error") this.write(s, { log: { at: "2026-10-25T00:00:00.000-05:00", msg: text } });
			else ((s.notes ??= {}).smart ??= []).push(`(the page reports a ${kind}: ${text})`);
			return { ok: true };
		}
		const prompt = this.assign_prompt(s, { text, raw });
		const line = { at: new Date().toISOString(), text, prompt, ...(raw ? { raw } : {}), ...(floor ? { floor } : {}) };
		this.write(s, { chat: line });
		this.hold_thought(s, line);
		if (floor !== "speaking") this.release_thought(s);
		return { ok: true, line };
	}
}

const fold_written = lines => ChatV2Model.fold(lines);   // apply() already ignores a {chat:…} or {log:…} line (no matching by_id key)

const stub = new StubSessions();
const s = { id: "v-test", prompt: null };

stub.say(s, { text: "so the page should", floor: "speaking" });
stub.say(s, { text: "show every bubble in order", floor: "done" });   // releases the thought

check("exactly one Prompt was written, holding both raw lines and one grown paragraph", () => {
	const m = fold_written(stub.written);
	const prompts = m.root.filter(n => ChatV2Model.kind(n) === "Prompt");
	const p = prompts[0];
	return prompts.length === 1 && p.raw.join("|") === "so the page should|show every bubble in order"
		&& ChatV2Model.paragraphs(p)[0].text === "so the page should show every bubble in order";
});

check("the fast seat's message carries the Prompt id", () => {
	const m = fold_written(stub.written), pid = m.root[0].id;
	return stub.sent.at(-1).text.includes(`(prompt ${pid})`);
});

const written_before_respawn = stub.written.length;
const last_owner = { at: new Date().toISOString(), text: "show every bubble in order" };   // what a respawn re-sends — no .prompt: never minted one of its own
stub.voice_say(s, [last_owner]);

check("the respawn path (voice_say on its own, as woken() calls it) adds no Prompt", () => {
	return stub.written.length === written_before_respawn;   // voice_say never calls write(); only say()/release_thought do
});

const sent_before_error = stub.sent.length;
stub.say(s, { text: "something crashed", kind: "error" });

check('a kind:"error" line becomes a log line and never reaches a seat', () => {
	const last = stub.written.at(-1);
	return last?.log?.msg === "something crashed" && stub.sent.length === sent_before_error;
});

console.log(`${results.filter(Boolean).length} of ${results.length} passed`);
if (results.includes(false)) process.exit(1);
