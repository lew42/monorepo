/* extract-and-match.mjs — the ask -> delivered audit, step 2 (owner add-on, 2026-10-08).
 *
 * WHAT: scripts the first two steps of the audit so a model never has to read the 6.5 GB of raw
 * Claude Code session files directly (doc/log-sources.md, source 1, is the map this reads from).
 *   1. Walk every session .jsonl under ~/.claude/projects/**, pull out turns that look like the
 *      OWNER actually typed them (never a tool_result, never an orchestrator's spawn prompt).
 *   2. For each one, try to match it — by plain word overlap, script-computed, no model call —
 *      against (a) an asks.jsonl title/words entry, (b) a task's requirements.md, (c) a git commit
 *      message near that date. A match above the threshold is "delivered" (its asks.jsonl status)
 *      or "found a task" (task dir exists, landed_at present/absent decides partial vs delivered).
 * Everything the script could NOT match becomes the shortlist for step 3 (a Haiku judge pass,
 * judge-shortlist.mjs, sibling script) — kept deliberately small, because that is the only part
 * of this audit that costs any model tokens at all.
 *
 * usage:
 *   node extract-and-match.mjs extract [--all-dirs]   -- writes candidates.jsonl
 *   node extract-and-match.mjs match                  -- reads candidates.jsonl, writes ask-ledger.jsonl + shortlist.json
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../../.."); // .../ai/sessions/2026/10/08/mastermind-cheap-models/mastermind-cheap-models/ask-ledger -> repo root
const PROJECTS_DIR = path.join(os.homedir(), ".claude", "projects");
const CANDIDATES_PATH = path.join(HERE, "candidates.jsonl");
const LEDGER_PATH = path.join(HERE, "ask-ledger.jsonl");
const SHORTLIST_PATH = path.join(HERE, "shortlist.json");
const ASKS_PATH = path.join(ROOT, "public/framework/ai/asks.jsonl");
const AI_DIR = path.join(ROOT, "public/framework/ai");

/* ── step 1: which raw "user" turns are really the owner typing ──
 * Same boilerplate patterns Server/council.mjs's isOwnerPrompt() already uses for a DIFFERENT
 * source (.claude/prompts/<day>.jsonl) — reused here rather than re-invented (CLAUDE.md law 6). */
function looksLikeOwnerText(text){
	if (!text || text.length < 3) return false;
	if (text.startsWith("[You are Servex agent") || text.startsWith("[You are an assistant")) return false;
	if (text.startsWith("[from: ") && !text.startsWith("[from: owner")) return false;
	if (text.startsWith("<system-reminder>") || text.startsWith("<command-")) return false;
	if (text.startsWith("[Request interrupted")) return false;
	if (text.includes("You are checking whether a landed task actually did what the owner asked")) return false;
	if (text.startsWith("Load the `") && text.includes("skill")) return false; // skill-trigger boilerplate
	if (/^You are (the|a|on duty)\b/.test(text)) return false; // mastermind/minion/assistant role prompts
	if (text.startsWith("[Servex") || text.startsWith("[tool_result]")) return false;
	if (/^Your brief is at/.test(text)) return false;
	// Found on the first real sample pull (2026-10-08): these are harness/tool noise that still
	// LOOKS like a typed turn (same "user" role in the transcript) but is never the owner's own
	// words — a hook's automated nag, a background-task ping Claude Code injects, or the raw
	// clipboard metadata line a pasted screenshot carries.
	if (text.startsWith("<task-notification>") || text.startsWith("<command-")) return false;
	if (text.startsWith("Stop hook feedback:")) return false;
	if (text.startsWith("[Image: original")) return false;
	return true;
}

function* walkFiles(dir){
	let entries;
	try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
	for (const e of entries){
		const p = path.join(dir, e.name);
		if (e.isDirectory()) yield* walkFiles(p);
		else if (e.name.endsWith(".jsonl")) yield p;
	}
}

function extractTextFromContent(content){
	if (typeof content === "string") return content;
	if (Array.isArray(content)){
		const texts = content.filter(c => c?.type === "text").map(c => c.text);
		if (texts.length) return texts.join(" ");
		return null; // an array with no real text item (pure tool_result/tool_use) — not a real turn
	}
	return null;
}

export function extract({ allDirs = false } = {}){
	const dirs = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
		.filter(d => d.isDirectory())
		.map(d => d.name)
		.filter(name => allDirs || !/worktree/i.test(name)); // doc/log-sources.md: worktree dirs are almost always agent work
	const candidates = [];
	let filesScanned = 0, linesScanned = 0;
	for (const dirName of dirs){
		for (const file of walkFiles(path.join(PROJECTS_DIR, dirName))){
			filesScanned++;
			let raw;
			try { raw = fs.readFileSync(file, "utf8"); } catch { continue; }
			const lines = raw.split("\n");
			for (const line of lines){
				if (!line || !line.includes('"role":"user"')) continue; // cheap pre-filter before JSON.parse
				linesScanned++;
				let o; try { o = JSON.parse(line); } catch { continue; }
				if (o?.type !== "user" || o?.message?.role !== "user") continue;
				const text = extractTextFromContent(o.message.content);
				if (!text || !looksLikeOwnerText(text.trim())) continue;
				candidates.push({
					text: text.trim().slice(0, 2000),
					at: o.timestamp || null,
					session_id: o.sessionId || null,
					cwd: o.cwd || null,
					file: path.relative(PROJECTS_DIR, file).replaceAll("\\", "/"),
					dir: dirName,
				});
			}
		}
	}
	// Two more filters, found necessary the hard way on the first real run (2026-10-08): 16,051
	// raw candidates, only 4,560 of them even textually unique (the same brief/dictation gets
	// re-sent to several sessions verbatim), and 10,891 were 80+ words — mostly long context
	// dumps and task briefs that slipped past looksLikeOwnerText's prefix checks, not the owner
	// typing. Dedupe by exact text (keep the EARLIEST occurrence — that is the original ask, any
	// later identical text is a re-send), and drop anything outside a plausible "one request"
	// length window. A genuine long dictation still fits under 150 words most of the time; the
	// council.mjs skill already sends anything longer through Server/refine.mjs instead of raw.
	const seen = new Map();
	for (const c of candidates){
		const key = c.text.trim().toLowerCase();
		const prev = seen.get(key);
		if (!prev || (c.at && prev.at && c.at < prev.at)) seen.set(key, c);
	}
	const deduped = [...seen.values()].filter(c => { const n = (c.text.match(/\S+/g) || []).length; return n >= 5 && n <= 150; });
	deduped.sort((a, b) => String(a.at).localeCompare(String(b.at)));

	fs.mkdirSync(path.dirname(CANDIDATES_PATH), { recursive: true });
	fs.writeFileSync(CANDIDATES_PATH, deduped.map(c => JSON.stringify(c)).join("\n") + "\n");
	return { files_scanned: filesScanned, lines_scanned: linesScanned, candidates_raw: candidates.length, candidates_deduped_and_sized: deduped.length, dirs_scanned: dirs.length, wrote: CANDIDATES_PATH };
}

/* ── step 2: script-only matching, no model call — word-overlap against asks.jsonl + task briefs + git log ── */
const STOPWORDS = new Set("the a an is are was were be been being to of in on for with and or but if then than that this these those i you he she it we they what which who whom whose do does did can could will would should may might must not no yes so very just also it's don't".split(" "));
function words(text){
	return new Set((text.toLowerCase().match(/[a-z0-9']+/g) || []).filter(w => w.length > 2 && !STOPWORDS.has(w)));
}
function jaccard(a, b){
	if (!a.size || !b.size) return 0;
	let inter = 0;
	for (const w of a) if (b.has(w)) inter++;
	return inter / (a.size + b.size - inter);
}

function loadAsks(){
	const lines = fs.readFileSync(ASKS_PATH, "utf8").split("\n").filter(Boolean);
	const byId = new Map();
	for (const l of lines){
		let o; try { o = JSON.parse(l).ask; } catch { continue; }
		if (!o) continue;
		const id = o.id || (o.title ? o.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 50) : null);
		if (!id) continue;
		byId.set(id, { ...byId.get(id), ...o, id });
	}
	return [...byId.values()];
}

function recentGitLog(){
	try {
		const out = execSync('git log --since="2026-08-01" --pretty=format:"%H|%ad|%s" --date=short', { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString("utf8");
		return out.split("\n").filter(Boolean).map(l => { const [hash, date, ...rest] = l.split("|"); return { hash, date, subject: rest.join("|") }; });
	} catch { return []; }
}

export function matchAll(){
	const candidates = fs.readFileSync(CANDIDATES_PATH, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
	const asks = loadAsks();
	const askWords = asks.map(a => ({ ask: a, w: words(`${a.title || ""} ${a.why || ""}`) }));
	const commits = recentGitLog();
	const commitWords = commits.map(c => ({ commit: c, w: words(c.subject) }));

	const ledger = [], shortlist = [];
	for (const c of candidates){
		const cw = words(c.text);
		if (cw.size < 2){ continue; } // too short to match meaningfully either way — not an "ask"
		let bestAsk = null, bestAskScore = 0;
		for (const { ask, w } of askWords){ const s = jaccard(cw, w); if (s > bestAskScore){ bestAskScore = s; bestAsk = ask; } }
		let bestCommit = null, bestCommitScore = 0;
		for (const { commit, w } of commitWords){ const s = jaccard(cw, w); if (s > bestCommitScore){ bestCommitScore = s; bestCommit = commit; } }

		const THRESHOLD = 0.2;
		const row = {
			at: c.at, session_id: c.session_id, dir: c.dir, text: c.text.slice(0, 300),
			matched_ask: bestAskScore >= THRESHOLD ? { id: bestAsk.id, title: bestAsk.title, status: bestAsk.status, score: +bestAskScore.toFixed(2) } : null,
			matched_commit: bestCommitScore >= THRESHOLD ? { hash: bestCommit.hash.slice(0, 10), date: bestCommit.date, subject: bestCommit.subject, score: +bestCommitScore.toFixed(2) } : null,
		};
		row.delivered = row.matched_ask?.status === "landed" ? "delivered" : row.matched_ask ? row.matched_ask.status : row.matched_commit ? "likely delivered (git match only)" : "unmatched";
		ledger.push(row);
		if (!row.matched_ask && !row.matched_commit) shortlist.push(row);
	}

	fs.writeFileSync(LEDGER_PATH, ledger.map(r => JSON.stringify(r)).join("\n") + "\n");
	fs.writeFileSync(SHORTLIST_PATH, JSON.stringify(shortlist, null, "\t"));
	const byDelivered = {};
	for (const r of ledger) byDelivered[r.delivered] = (byDelivered[r.delivered] || 0) + 1;
	return { total: ledger.length, by_delivered: byDelivered, shortlist_size: shortlist.length, wrote: [LEDGER_PATH, SHORTLIST_PATH] };
}

function main(){
	const cmd = process.argv[2];
	if (cmd === "extract") console.log(JSON.stringify(extract({ allDirs: process.argv.includes("--all-dirs") }), null, "\t"));
	else if (cmd === "match") console.log(JSON.stringify(matchAll(), null, "\t"));
	else console.error("usage: node extract-and-match.mjs extract|match [--all-dirs]");
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
