/* `node Server/owner-check.mjs <task dir>` — does a landed task actually do what the OWNER
 * asked, item by item, not just what its requirements.md says? (the owner, 2026-10-01: every
 * task's landing review should check "the OWNER'S WORDS … item by item, not just the brief".)
 *
 * FINDING THE OWNER'S WORDS, in order, first one found wins:
 *   1. `<task dir>/owner-words.md` — the session-smart convention (session-smart.md item 5):
 *      a voice session that polishes a brief into its own task folder saves the raw dictation
 *      here, verbatim.
 *   2. The NEAREST ANCESTOR task dir's own `owner-words.md` — walking up the `parent_task`
 *      chain every nested task's assign line already records (Agents.js's `open_task`), for a
 *      sub-task that shares its parent's words instead of repeating them (proposal-flow and its
 *      own sub-tasks all point at one owner-words.md this way).
 *   3. The task's own brief (its assign line 1's `brief` field, usually requirements.md): a
 *      pointer to another file — "Owner's words: `path`" (review.mjs's own convention) or a
 *      markdown link `[owner-words.md](...)` — resolved and read; or, failing that, an EMBEDDED
 *      quote shaped like requirements.md files already write them, `The owner's words (date, …):
 *      "…"` — every quote found is read as the owner's words.
 *   4. A SESSION this task's first assign line points at: a `session` field (a voice session id
 *      directly), or an `agent` field shaped `session-fast-<id>` / `session-smart-<id>` (how a
 *      voice-session agent's OWN id is built, Sessions.js) — looked up in Servex's `sessions.json`
 *      for that session's own file, and every line the OWNER said in it (`chat.from.kind ===
 *      "owner"`) joined together.
 *   Nothing found anywhere: one line, `owner-check: no owner words found`, and exit 0 — a task
 *   with no dictation behind it (most minion quick-fixes) is not a failure, just not this check's
 *   business.
 *
 * SPLITTING INTO ITEMS. The brief for this script asked for three tiers — numbered lines,
 * bullet lines, else whole sentences — but every real owner-words.md in this repo (checked
 * before writing this) is shaped as `## <date> — <topic>` sections of running dictation, no
 * numbers or bullets inside it. Splitting that into individual SENTENCES would hand the
 * reviewer a wall of hundreds of fragments with no topic to check them against, so a FOURTH,
 * higher tier is added ahead of the brief's three: two or more `##`/`###` headings split one
 * item per heading section (label = the heading's own words, already a one-line summary of what
 * was asked there); only text with no headings falls through to numbered / bulleted / sentences,
 * exactly as asked.
 *
 * THE REVIEW ITSELF is one fresh Sonnet agent, spawned inside Servex the same way
 * `Server/clarity.mjs` and `Server/review.mjs` already do (spawn_agent, wait_for_agent,
 * stop_agent over the loopback `/mcp`) — never a resume, so it has not seen the task's own
 * conversation. It is given every item, the landing's own `outcome` text, and (best-effort) a
 * `git diff --stat` of the commit the outcome names as the merge, and writes
 * `<task dir>/owner-check.md` itself, a markdown table of verdicts. This script only reads that
 * table back, to log one line and nag the card for any `missing` item — same shape as
 * `doc-check.mjs`'s own nag, right beside it in `on-landing.mjs`.
 *
 * Never throws: any failure becomes one log line, same discipline as doc-check.mjs and
 * on-landing.mjs beside it, and the exit code is always 0. */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { HOME } from "../Servex/home.js";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const MCP = `http://127.0.0.1:${process.env.SERVEX_PORT || 8090}/mcp`;
const rel = p => path.relative(ROOT, path.resolve(p)).replaceAll("\\", "/");

function read_jsonl(file){
	try { return fs.readFileSync(file, "utf8").split("\n").flatMap(l => { try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; } }); }
	catch { return []; }
}
function merged_assign(dir){
	const state = {};
	for (const e of read_jsonl(path.join(dir, "task.jsonl"))) if (e.assign) Object.assign(state, e.assign);
	return state;
}

/* The three "point at another file" shapes a brief (requirements.md) already uses in this repo:
 * review.mjs's own "Owner's words: `path`" convention, and a plain markdown link to a file named
 * owner-words.md (proposal-flow/requirements.md: "verbatim in [owner-words.md](owner-words.md)"). */
function brief_pointers(text){
	return [...text.matchAll(/Owner'?s words:[^\n]*?`([^`]+)`/gi)].map(m => m[1])
		.concat([...text.matchAll(/\[owner-words\.md\]\(([^)]+)\)/gi)].map(m => m[1]));
}

/* Finds the owner's words for `taskDir`, per the four tiers in the header comment.
 * Returns `{text, source}` (source: a path, for the reviewer prompt to cite), or null. */
function find_owner_words(taskDir){
	const direct = path.join(taskDir, "owner-words.md");
	if (fs.existsSync(direct)) return { text: fs.readFileSync(direct, "utf8"), source: rel(direct) };

	// tier 2: walk the parent_task chain up to 12 levels (deeper than any real nesting here)
	let dir = taskDir, seen = new Set([path.resolve(taskDir)]);
	for (let i = 0; i < 12; i++){
		const parent = merged_assign(dir).parent_task;
		if (!parent) break;
		const parentDir = path.isAbsolute(parent) ? parent : path.join(ROOT, parent);
		if (seen.has(path.resolve(parentDir))) break;
		seen.add(path.resolve(parentDir));
		const pw = path.join(parentDir, "owner-words.md");
		if (fs.existsSync(pw)) return { text: fs.readFileSync(pw, "utf8"), source: rel(pw) };
		dir = parentDir;
	}

	// tier 3: the task's own brief file — a pointer to another file, or an embedded quote
	const first = merged_assign(taskDir);
	if (first.brief){
		const briefPath = path.isAbsolute(first.brief) ? first.brief : path.join(taskDir, first.brief);
		if (fs.existsSync(briefPath)){
			const text = fs.readFileSync(briefPath, "utf8");
			for (const p of brief_pointers(text)){
				const f = path.isAbsolute(p) ? p : (p.startsWith("/") ? path.join(ROOT, "public/framework/ai", p.replace(/^\/+/, "")) : path.join(taskDir, p));
				if (fs.existsSync(f)) return { text: fs.readFileSync(f, "utf8"), source: rel(f) };
			}
			const quotes = [...text.matchAll(/owner'?s words\b[^:]*:\s*"([^"]+)"/gi)].map(m => m[1]);
			if (quotes.length) return { text: quotes.join("\n\n"), source: rel(briefPath) + " (quoted)" };
		}
	}

	// tier 4: a voice session this task's own assign line points at
	const sessionId = first.session ?? (/^session-(?:fast|smart)-(.+)$/.exec(first.agent ?? "")?.[1] ?? null);
	if (sessionId){
		try {
			const map = JSON.parse(fs.readFileSync(path.join(HOME, "sessions.json"), "utf8"));
			const s = map[sessionId];
			const file = s?.file && path.join(ROOT, "public", ...String(s.file).split("/").filter(Boolean));
			const owner_lines = file && fs.existsSync(file)
				? read_jsonl(file).filter(l => l.chat?.from?.kind === "owner").map(l => l.chat.text).filter(Boolean)
				: [];
			if (owner_lines.length) return { text: owner_lines.join("\n\n"), source: `session ${sessionId} (${rel(file)})` };
		} catch {}
	}
	return null;
}

/* Splits owner-words text into items — see the header comment's "SPLITTING INTO ITEMS". */
export function split_items(text){
	const body = text.replace(/\r\n/g, "\n").trim();
	const headings = [...body.matchAll(/^#{2,3}\s+(.+)$/gm)];
	if (headings.length >= 2)
		return headings.map((h, i) => ({ label: h[1].trim(),
			text: body.slice(h.index, i + 1 < headings.length ? headings[i + 1].index : body.length).trim() }));

	const lines = body.split("\n");
	const marks = re => lines.map((l, i) => (re.test(l) ? i : -1)).filter(i => i >= 0);
	const numbered = marks(/^\s*\d+\.\s+/), bulleted = marks(/^\s*[-*]\s+/);
	const idx = numbered.length >= 2 ? numbered : (bulleted.length >= 2 ? bulleted : null);
	if (idx)
		return idx.map((start, i) => {
			const chunk = lines.slice(start, i + 1 < idx.length ? idx[i + 1] : lines.length).join("\n").trim();
			return { label: chunk.slice(0, 80).replace(/\s+/g, " "), text: chunk };
		});

	return body.split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/).map(s => s.trim()).filter(s => s.length > 12)
		.map(s => ({ label: s.slice(0, 80).replace(/\s+/g, " "), text: s }));
}

/* The landing's own outcome text, and — best-effort, never required — a `git diff --stat` of
 * the commit the outcome names as the merge ("… (merge 1ebc924e)", the convention every landed
 * task's outcome already uses). No merge named, or `git show` fails: diff is just left out. */
function landing_of(taskDir){
	const entries = read_jsonl(path.join(taskDir, "task.jsonl"));
	const outcome = entries.filter(e => e.assign?.landed_at).pop()?.assign?.outcome ?? null;
	if (!outcome) return { outcome: null, diffStat: null };
	const sha = /\bmerge\s+([0-9a-f]{7,40})\b/i.exec(outcome)?.[1];
	let diffStat = null;
	if (sha) try { diffStat = execFileSync("git", ["show", "--stat", "--no-color", sha], { cwd: ROOT, windowsHide: true, encoding: "utf8", timeout: 20000 }).slice(0, 4000); } catch {}
	return { outcome, diffStat };
}

async function mcp(name, args, ms = 30000){
	const r = await fetch(MCP, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
		body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }), signal: AbortSignal.timeout(ms) });
	const j = await r.json();
	const text = j.result?.content?.[0]?.text ?? j.error?.message ?? "";
	try { return JSON.parse(text); } catch { return { raw: text }; }
}

/* `owner-check.md`'s own table, read back: one `{n, item, verdict, evidence}` per data row.
 * Lenient on purpose — a reviewer's own formatting wobbles are not this script's business to
 * refuse, only to read what it can. */
export function parse_table(text){
	const rows = [];
	for (const line of text.split(/\r?\n/)){
		if (!line.trim().startsWith("|")) continue;
		const cells = line.split("|").map(c => c.trim());
		if (cells[0] === "") cells.shift();
		if (cells.at(-1) === "") cells.pop();
		if (cells.length < 3 || !/^\d+$/.test(cells[0])) continue;
		const verdictCell = cells.slice(1, -1).find(c => /\b(done|partly|missing)\b/i.test(c)) ?? cells[1];
		const verdict = /missing/i.test(verdictCell) ? "missing" : /partly/i.test(verdictCell) ? "partly" : /done/i.test(verdictCell) ? "done" : "unclear";
		rows.push({ n: Number(cells[0]), item: cells[1], verdict, evidence: cells.slice(-1)[0] ?? "" });
	}
	return rows;
}

function log_line(taskJsonl, msg){
	const tmp = path.join(os.tmpdir(), `owner-check-${process.pid}-${Date.now()}.json`);
	try {
		fs.writeFileSync(tmp, JSON.stringify([{ log: { at: "NOW", msg } }]));
		spawnSync(process.execPath, [path.join(ROOT, ".claude/hooks/append.mjs"), taskJsonl, tmp], { windowsHide: true, encoding: "utf8" });
	} finally { try { fs.unlinkSync(tmp); } catch {} }
}

async function card_nag(taskDir, text){
	const card = merged_assign(taskDir).card;
	if (!card) return;
	try { await mcp("card_reply", { card, from: "owner-check", text }, 5000); } catch {}
}

async function main(){
	const taskDir = path.resolve(process.argv[2] || ".");
	const taskJsonl = path.join(taskDir, "task.jsonl");
	const found = find_owner_words(taskDir);
	if (!found){ log_line(taskJsonl, "owner-check: no owner words found"); return; }

	const items = split_items(found.text);
	if (!items.length){ log_line(taskJsonl, "owner-check: no owner words found"); return; }

	const { outcome, diffStat } = landing_of(taskDir);
	const list = items.map((it, i) => `${i + 1}. ${it.text}`).join("\n\n");
	const prompt = `You are checking whether a landed task actually did what the owner asked, ITEM BY ITEM — not just whether it matches a requirements.md summary of the ask. Repo root: ${ROOT.replaceAll("\\", "/")}.\n\n`
		+ `The owner's own words, from ${found.source}, split into ${items.length} item(s):\n\n${list}\n\n`
		+ `What the task reports as its outcome:\n${outcome ?? "(the task's task.jsonl has no landing outcome)"}\n\n`
		+ (diffStat ? `What the merge actually changed (git show --stat):\n${diffStat}\n\n` : "")
		+ `For EACH item above, read the actual files in the repo (not only the outcome text) and decide: "done" (fully built), "partly" (started or partially covers it), or "missing" (not addressed at all). `
		+ `Write ${rel(path.join(taskDir, "owner-check.md"))}: a markdown table, header row "| # | item | verdict | evidence |", one data row per item, the item column a short paraphrase (not the full quote), verdict exactly one of done/partly/missing, evidence a file, a line, or a one-sentence reason. Make no code edits. One pass, then stop.`;

	let table = null, spawnErr = null;
	try {
		const spawned = await mcp("spawn_agent", { role: "reviewer", name: `owner-check-${path.basename(taskDir)}`.replace(/[^a-z0-9-]+/gi, "-").slice(0, 60),
			prompt, model: "claude-sonnet-5", effort: "medium", permission_mode: "bypassPermissions", cwd: ROOT });
		if (!spawned.id) throw new Error(spawned.raw || spawned.why || "spawn_agent did not return an id");
		await mcp("wait_for_agent", { id: spawned.id, timeout_s: 900 }, 910000);
		await mcp("stop_agent", { id: spawned.id }, 20000);
		const reportPath = path.join(taskDir, "owner-check.md");
		if (fs.existsSync(reportPath)) table = parse_table(fs.readFileSync(reportPath, "utf8"));
		else spawnErr = "the reviewer wrote no owner-check.md";
	} catch (e){ spawnErr = String(e?.message || e).slice(0, 200); }

	if (spawnErr){ log_line(taskJsonl, `owner-check: not run — ${spawnErr}`); return; }

	const done = table.filter(r => r.verdict === "done").length;
	const partly = table.filter(r => r.verdict === "partly").length;
	const missing = table.filter(r => r.verdict === "missing");
	log_line(taskJsonl, `owner-check: ${items.length} items, ${done} done, ${partly} partly, ${missing.length} missing — owner-check.md`);
	if (missing.length) await card_nag(taskDir, `Owner-check found ${missing.length} item(s) the owner asked for that aren't done: `
		+ missing.map(r => `#${r.n} ${r.item}`).join("; ") + `. See ${rel(path.join(taskDir, "owner-check.md"))}.`);
}

main().catch(() => {}).finally(() => { process.exitCode = 0; });
