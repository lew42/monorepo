/* node Server/ChatV1Compare.mjs <session.jsonl …>           (no args: the 5 largest voice sessions under ai/sessions)
 *
 * READ-ONLY (builder.md step 8, "V1 side by side"). For each real voice session it builds V1's bubble list two ways and prints
 * where they differ:
 *   - the V1 way: straight from the session's own `{chat}` lines (`V1Bubbles.from_chat_lines`, a plain-data mirror of
 *     ext/Chat/Chat.js's mergeable()/put_line() — read, never edited).
 *   - the adapter way: from `session.messages` (`V1Bubbles.from_session`, core/Session/Chat/V1Bubbles.js), after replaying the file.
 * A session with no `messages`/`sentences` lines yet is never written to: its lines are copied to a scratch file, and the
 * messages/sentences lines it would have had are computed in memory with `ChatToMessages.plan()` (the same dry-run plan the CLI
 * prints, read straight from the exported method instead of re-parsing stdout) — nothing is appended, `--apply` is never passed.
 *
 * Prints, per session: the two bubble counts (what builder.md step 8 calls "two numbers that must agree"), then one line per
 * differing bubble (index, sender and first 60 chars of text on each side), then a running total. Exit code is always 0 — this
 * is a report, not a gate.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Session from "../public/framework/core/Session/Session.js";
import V1Bubbles from "../public/framework/core/Session/Chat/V1Bubbles.js";
import ChatToMessages from "./ChatToMessages.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SESSIONS_DIR = path.join(ROOT, "public/framework/ai/sessions");

function read_lines(file){
	return fs.readFileSync(file, "utf8").split("\n").filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } });
}

/** The N largest voice sessions' session.jsonl under ai/sessions (folder name starts "v-"), by file size. */
function largest_voice_sessions(n){
	const hits = [];
	const walk = dir => {
		for (const name of fs.readdirSync(dir, { withFileTypes: true })){
			const full = path.join(dir, name.name);
			if (name.isDirectory()){ if (name.name.startsWith("v-")){ const f = path.join(full, "session.jsonl"); if (fs.existsSync(f)) hits.push(f); } else walk(full); }
		}
	};
	walk(SESSIONS_DIR);
	return hits.map(f => ({ f, size: fs.statSync(f).size })).sort((a, b) => b.size - a.size).slice(0, n).map(h => h.f);
}

/** The bubble list's text, first `n` chars, for a print line. */
const summary = b => (b ? `${b.sender}: ${b.pieces.map(p => p.text).join(" ").slice(0, 60)}` : "(none)");

function compare_one(file){
	const lines = read_lines(file);
	const has_messages = lines.some(l => l?.messages || l?.sentences);
	let replay_lines = lines, note = "";
	if (!has_messages){
		const scratch = path.join(os.tmpdir(), "chat-v1-compare-" + path.basename(path.dirname(file)) + ".jsonl");
		fs.writeFileSync(scratch, lines.filter(Boolean).map(l => JSON.stringify(l)).join("\n") + "\n");
		const copy_lines = read_lines(scratch);
		const planned = ChatToMessages.plan(copy_lines) ?? [];
		replay_lines = [...lines, ...planned];
		note = ` (no messages lines; ${planned.length} built in memory by ChatToMessages.plan() on a copy at ${scratch}, never --apply'd)`;
	}
	const session = Session.replay(replay_lines);
	const v1 = V1Bubbles.from_chat_lines(lines);
	const adapter = V1Bubbles.from_session(session);

	console.log(`\n${path.relative(ROOT, file).replaceAll("\\", "/")}${note}`);
	console.log(`  ${v1.length} bubbles via V1, ${adapter.length} bubbles via the adapter`);

	let diffs = 0;
	for (let i = 0; i < Math.max(v1.length, adapter.length); i++){
		const a = v1[i], b = adapter[i];
		const same = a && b && a.sender === b.sender && a.pieces.map(p => p.text).join(" ") === b.pieces.map(p => p.text).join(" ");
		if (!same){ diffs++; console.log(`  bubble ${i}: v1=[${summary(a)}]  adapter=[${summary(b)}]`); }
	}
	console.log(`  ${diffs} differing bubble${diffs === 1 ? "" : "s"} of ${Math.max(v1.length, adapter.length)}`);
	return { file, v1: v1.length, adapter: adapter.length, diffs };
}

function run(files){
	const rows = files.map(compare_one);
	console.log("\n--- totals ---");
	for (const r of rows) console.log(`${path.relative(ROOT, r.file).replaceAll("\\", "/")}: ${r.v1} via V1, ${r.adapter} via the adapter, ${r.diffs} differing`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const args = process.argv.slice(2);
	const files = args.length ? args.map(a => path.resolve(a)) : largest_voice_sessions(5);
	if (!files.length){ console.error("usage: node Server/ChatV1Compare.mjs <session.jsonl …>"); process.exit(1); }
	run(files);
}

export { compare_one, largest_voice_sessions, run };
