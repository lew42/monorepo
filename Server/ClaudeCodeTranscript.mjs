// ClaudeCodeTranscript: reads ONE raw Claude Code / Agent SDK transcript file (~/.claude/projects/<project>/<session-id>.jsonl, or a cloud
// session's copy in ~/.claude/cloud-transcripts/) and gives the owner's own turns, in order. No LLM calls, nothing written.
// Not our session logs (those are session.jsonl, read by core/Session); the batch condenser for many transcripts is Server/Transcripts.mjs.
//   node Server/ClaudeCodeTranscript.mjs <file> [--from N] [--to N] [--json]     (N is the turn number this prints)
// Doc: Server/doc/transcripts.md
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export default class ClaudeCodeTranscript {
	constructor(file){
		this.file = file;
		this.lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean).flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } });
	}

	/** The text of a user line: a plain string, or its text blocks joined (a tool_result is not the owner speaking). */
	static text_of(line){
		const c = line?.message?.content;
		if (typeof c === "string") return c;
		return Array.isArray(c) ? c.filter(b => b?.type === "text").map(b => b.text).join("\n") : "";
	}

	/** Is this line the owner speaking? A user line, not meta (a skill or reminder), not a task notification, with text, and not a harness note. */
	static is_owner(line){
		if (line?.type !== "user" || line.isMeta || line.isSidechain) return false;
		if (line.turnOrigin === "task_notification" || line.origin?.kind === "task-notification") return false;
		const t = ClaudeCodeTranscript.text_of(line).trim();
		return !!t && !/^(<system-reminder>|<task-notification>|<local-command|<command-name>|\[Request interrupted)/.test(t);
	}

	/** [{n, at, text}]: every owner turn, numbered from 1 in file order. */
	owner_turns(){
		let n = 0;
		return this.lines.filter(ClaudeCodeTranscript.is_owner).map(l => ({ n: ++n, at: l.timestamp ?? null, text: ClaudeCodeTranscript.text_of(l).trim() }));
	}

	/** Sentences of one turn, numbered from 1 (a plain split on . ? ! followed by a space; good enough to point at). */
	static sentences(text){
		return String(text).replace(/\s+/g, " ").split(/(?<=[.?!])\s+(?=\S)/).map(s => s.trim()).filter(Boolean);
	}

	static main(argv){
		const file = argv[0], arg = k => { const i = argv.indexOf(k); return i < 0 ? null : argv[i + 1]; };
		if (!file) { console.error("usage: node Server/ClaudeCodeTranscript.mjs <file> [--from N] [--to N] [--json]"); process.exit(1); }
		const from = Number(arg("--from") ?? 1), to = Number(arg("--to") ?? Infinity);
		const turns = new ClaudeCodeTranscript(file).owner_turns().filter(t => t.n >= from && t.n <= to);
		if (argv.includes("--json")) console.log(JSON.stringify(turns, null, 1));
		else for (const t of turns) console.log(`#${t.n} ${t.at}\n${t.text}\n`);
	}
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) ClaudeCodeTranscript.main(process.argv.slice(2));
