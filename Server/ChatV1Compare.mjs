/* node Server/ChatV1Compare.mjs <session.jsonl …>           (no args: the 5 largest voice sessions under ai/sessions)
 *
 * READ-ONLY (builder.md step 8, "V1 side by side"). For each real voice session it builds V1's bubble list two ways and prints
 * where they differ:
 *   - the V1 way: straight from the session's own `{chat}` lines (`V1Bubbles.from_chat_lines`, a plain-data mirror of
 *     ext/Chat/Chat.js's mergeable()/put_line()/place() — read, never edited).
 *   - the adapter way: from `session.messages` (`V1Bubbles.from_session`, core/Session/Chat/V1Bubbles.js).
 *
 * MIRROR COVERAGE, checked first, from the session as it stands on disk (no planning): every owner/reply `{chat}` line's `at`
 * must show up on a mirrored Sentence or Message for the file to count as "full". A file with NONE mirrored gets the lines it
 * would have had computed in memory with `ChatToMessages.plan()` (the same dry-run plan the CLI prints, called directly — no
 * file is written, `--apply` is never passed) so the adapter side still has something to compare; a file with SOME but not all
 * mirrored (`plan()` refuses to add to a file that already has any `messages`/`sentences` line, by design) is reported "partial"
 * and compared as-is — its adapter bubble count is expected to undercount V1's, and that undercount IS the finding.
 *
 * Prints, per session: the coverage status, the two bubble counts ("two numbers that must agree" once coverage is full), then
 * one line per differing bubble, then a running total. Exit code is always 0 — this is a report, not a gate.
 */
import fs from "node:fs";
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

/** Every `{chat}` line's own `at`, mirrored or not, in file order. */
const chat_ats = lines => lines.filter(l => l?.chat).map(l => l.chat.at);

/** The `at`s a session's sentences and non-Prompt messages already mirror, from the file as it stands (no planning). */
function mirrored_ats(session){
	const out = new Set();
	for (const s of session.sentences) if (s.at) out.add(s.at);
	for (const m of session.messages.messages) if (!("sentences" in m) && m.at) out.add(m.at);   // Reply / plain Message, not Prompt
	return out;
}

/** "full" (every {chat} line mirrored), "none" (not one is), or "partial" (some but not all — the case `plan()` can't fill). */
function coverage(lines, session){
	const ats = chat_ats(lines);
	if (!ats.length) return { status: "none", total: 0, mirrored: 0 };
	const seen = mirrored_ats(session), mirrored = ats.filter(at => seen.has(at)).length;
	return { status: mirrored === ats.length ? "full" : mirrored === 0 ? "none" : "partial", total: ats.length, mirrored };
}

const summary = b => (b ? `${b.sender}: ${b.pieces.map(p => p.text).join(" ").slice(0, 60)}` : "(none)");

function compare_one(file){
	const lines = read_lines(file);
	const now = coverage(lines, Session.replay(lines));
	let replay_lines = lines, note = ` — ${now.status} mirror (${now.mirrored}/${now.total} {chat} lines)`;
	if (now.status === "none"){
		const planned = ChatToMessages.plan(lines) ?? [];
		replay_lines = [...lines, ...planned];
		note += `, ${planned.length} lines built in memory by ChatToMessages.plan() (never --apply'd) to compare against`;
	} else if (now.status === "partial"){
		note += " — plan() refuses a file that already has messages lines, so the adapter side below is genuinely short, not a bug";
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
	return { file, status: now.status, v1: v1.length, adapter: adapter.length, diffs };
}

function run(files){
	const rows = files.map(compare_one);
	console.log("\n--- totals ---");
	for (const r of rows) console.log(`${path.relative(ROOT, r.file).replaceAll("\\", "/")}: ${r.status} mirror, ${r.v1} via V1, ${r.adapter} via the adapter, ${r.diffs} differing`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const args = process.argv.slice(2);
	const files = args.length ? args.map(a => path.resolve(a)) : largest_voice_sessions(5);
	if (!files.length){ console.error("usage: node Server/ChatV1Compare.mjs <session.jsonl …>"); process.exit(1); }
	run(files);
}

export { compare_one, largest_voice_sessions, coverage, run };
