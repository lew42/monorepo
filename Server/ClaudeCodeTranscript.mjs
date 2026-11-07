// ClaudeCodeTranscript: reads ONE raw Claude Code / Agent SDK transcript file (~/.claude/projects/<project>/<session-id>.jsonl, or a cloud
// session's copy in ~/.claude/cloud-transcripts/) and gives the owner's own turns, in order. No LLM calls, nothing written.
// Not our session logs (those are session.jsonl, read by core/Session); the batch condenser for many transcripts is Server/Transcripts.mjs.
// owner_text is THE owner-prompt filter: Server/RefineQueue.mjs and Server/PromptAudit.mjs reach it as RefineQueue.owner_text.
//   node Server/ClaudeCodeTranscript.mjs <file> [--from N] [--to N] [--json]     (N is the turn number this prints)
// Doc: Server/doc/transcripts.md
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import RefinedCard from "../public/framework/ext/Refine/RefinedCard.js";

export default class ClaudeCodeTranscript {
	constructor(file){
		this.file = file;
		// one entry per line of the file (null for a blank or broken line), so an index is the file's own line number, 0-based
		this.lines = fs.readFileSync(file, "utf8").split("\n").map(l => { try { return l ? JSON.parse(l) : null; } catch { return null; } });
	}

	/** One user line -> the owner's words, or null when it is not the owner speaking: a tool result, a meta line (a skill, a reminder),
	 *  a task notification, a slash command, an agent relay or brief ("[from: ", "[You are "), a compaction summary, an interruption note. */
	static owner_text(l){
		if (l?.type !== "user" || l.isMeta || l.isSidechain || l.turnOrigin === "task_notification") return null;
		const c = l.message?.content;
		if (Array.isArray(c) && c.some(b => b?.type === "tool_result")) return null;
		const t = typeof c === "string" ? c : Array.isArray(c) ? c.filter(b => b?.type === "text").map(b => b.text).join("\n") : "";
		const text = RefinedCard.strip(t);
		if (!text || /^<(command-|local-command|task-notification)/.test(text) || /^(Caveat:|\[from: |\[You are |This session is being continued|\[Request interrupted)/.test(text)) return null;
		return text;
	}

	/** [{n, at, line, text}]: every owner turn, numbered from 1 in file order; `line` is its 0-based line in the file (RefineQueue's key). */
	owner_turns(){
		let n = 0;
		return this.lines.flatMap((l, line) => { const text = ClaudeCodeTranscript.owner_text(l); return text ? [{ n: ++n, at: l.timestamp ?? null, line, text }] : []; });
	}

	/** The turn's sentences: RefinedCard.sentences, so a cite [3] means the same sentence here and on a refined card. */
	static sentences(text){ return RefinedCard.sentences(text); }

	static main(argv){
		const file = argv[0], arg = k => { const i = argv.indexOf(k); return i < 0 ? null : argv[i + 1]; };
		if (!file) { console.error("usage: node Server/ClaudeCodeTranscript.mjs <file> [--from N] [--to N] [--json]"); process.exit(1); }
		const from = Number(arg("--from") ?? 1), to = Number(arg("--to") ?? Infinity);
		const turns = new ClaudeCodeTranscript(file).owner_turns().filter(t => t.n >= from && t.n <= to);
		if (argv.includes("--json")) console.log(JSON.stringify(turns, null, 1));
		else for (const t of turns) console.log(`#${t.n} ${t.at} (line ${t.line})\n${t.text}\n`);
	}
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) ClaudeCodeTranscript.main(process.argv.slice(2));
