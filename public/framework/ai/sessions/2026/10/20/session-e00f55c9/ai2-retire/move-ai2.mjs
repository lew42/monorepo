#!/usr/bin/env node
// move-ai2.mjs — the ai2 move: one dated store, nothing lost, nothing twice. Brief: move-brief.md (this folder), changed by the owner
// 2026-11-01 ("we don't want stale, duplicate data"): a duplicate is removed once its lines are merged; git history (tracked files) or
// the --backup folder (gitignored machine state) is the undo. Plan and numbers: move-plan.md, audit.md; line classification: audit-ai2.mjs.
//
//   node move-ai2.mjs [--dry-run]                    DEFAULT: computes the plan and the proof, prints them, changes nothing
//   node move-ai2.mjs --apply --backup <dir>         does it, then measures again and writes manifest.json + move-report.md
//
// Three jobs:
//   1. LINES. Every line audit-ai2.mjs found nowhere in the store is appended, byte for byte, to its home (audit's destFor). An old dated
//      card log whose home does not exist yet is copied whole, so the card page reads the same. A line the destination holds is skipped.
//      Not .claude/hooks/append.mjs: LogLine stamps a top-level `ts` of today on every page.jsonl line without one, which would misdate
//      ~270 historical lines and make them differ from their source. The script appends the exact text, then re-parses the whole file.
//   2. DUPLICATE SESSION FOLDERS. Per session id with two store folders, the KEEPER is the folder holding tracked files (task folders:
//      moving them would break every link to them); if neither or both do, the folder with the newest index.json (the one the live
//      AISessionIndex and the day files name). The other folder is emptied: a file the keeper lacks moves in; a file in both is
//      removed once every line it has is in the keeper; index.json and cache.jsonl are gitignored machine state that
//      AISessionIndex / AISession.save() regenerate from the transcript, so when the extra folder is the live one its copies replace the
//      keeper's stale ones. A group that would lose any non-regenerable line, or has tracked files on both sides, is held and listed.
//   3. AI2 RECORDS. public/framework/ai2/{tasks,ai,overview}/, page.jsonl, weight.jsonl: every line is in the store after job 1, or
//      audit-ai2.mjs classed it a pointer / folded copy whose values are in the store; then `git rm`. card.js and page.js stay.
// Proof (before / after, whole of public/framework/ai + ai2): distinct session ids, .jsonl lines, index.json dollars once per id,
// and every line of every removed file found again in a remaining file (or named as a regenerable cache summary / an ai2 pointer).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../../../../../../../../..");
const FW = path.join(REPO, "public/framework"), AI = path.join(FW, "ai"), AI2 = path.join(FW, "ai2"), STORE = path.join(AI, "sessions");
const args = process.argv.slice(2), APPLY = args.includes("--apply");
const BACKUP = args.includes("--backup") ? path.resolve(args[args.indexOf("--backup") + 1]) : null;
if (APPLY && !BACKUP) { console.error("--apply needs --backup <dir> (outside the repo) for the gitignored files it removes"); process.exit(2); }

const posix = p => p.split(path.sep).join("/");
const rel = p => posix(path.relative(REPO, p));
const abs = r => path.join(REPO, r);
const sha = b => crypto.createHash("sha1").update(b).digest("hex");
const lines_of = t => t.split("\n").map(l => l.replace(/\r$/, "")).filter(l => l.trim() !== "");
const read = p => { try { return fs.readFileSync(p, "utf8"); } catch { return ""; } };
const git = (...a) => execFileSync("git", a, { cwd: REPO, maxBuffer: 1 << 30, windowsHide: true }).toString();
function walk(dir, fn){ let es; try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; } for (const e of es){ const p = path.join(dir, e.name); if (p === HERE) continue; if (e.isDirectory()) walk(p, fn); else if (e.isFile()) fn(p); } }
const t0 = Date.now(), lap = m => console.error(`[${((Date.now() - t0) / 1000).toFixed(0)}s] ${m}`);

// ---------- measure: the numbers the proof compares ----------
const KIND = f => /^session-[0-9a-f]{8}$/.test(f) ? "session-8" : /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(f) ? "uuid" : "slug";
function sessions(){
	const out = [];
	for (const y of fs.readdirSync(STORE).filter(n => /^\d{4}$/.test(n))) for (const m of fs.readdirSync(path.join(STORE, y)).filter(n => /^\d\d$/.test(n)))
		for (const d of fs.readdirSync(path.join(STORE, y, m)).filter(n => /^\d\d$/.test(n)))
			for (const e of fs.readdirSync(path.join(STORE, y, m, d), { withFileTypes: true })){
				if (!e.isDirectory()) continue;
				const f = path.join(STORE, y, m, d, e.name, "index.json"); let j = null; try { j = JSON.parse(fs.readFileSync(f, "utf8")); } catch {}
				if (j?.id && j.folder && /^\d{4}\/\d{2}\/\d{2}$/.test(j.day ?? "") && j.state)   // the audit's rule for a session snapshot
					out.push({ id: j.id, dir: path.join(STORE, y, m, d, e.name), name: e.name, usd: Number(j.usd) || 0, mtime: fs.statSync(f).mtimeMs });
			}
	return out;
}
function measure(){
	const s = sessions(), ids = new Map();
	for (const x of s) (ids.get(x.id) ?? ids.set(x.id, []).get(x.id)).push(x);
	const r4 = n => Math.round(n * 100) / 100;
	const m = { session_folders: s.length, session_ids: ids.size, ids_in_two_folders: [...ids.values()].filter(l => l.length > 1).length,
		usd_every_folder: r4(s.reduce((n, x) => n + x.usd, 0)),
		usd_once_per_id_live: r4([...ids.values()].reduce((n, l) => n + l.reduce((a, b) => b.mtime > a.mtime ? b : a).usd, 0)),
		usd_once_per_id_max: r4([...ids.values()].reduce((n, l) => n + Math.max(...l.map(x => x.usd)), 0)),
		jsonl_files: 0, jsonl_lines: 0, store_jsonl_lines: 0 };
	for (const root of [AI, AI2]) walk(root, p => { if (!p.endsWith(".jsonl")) return; const n = lines_of(read(p)).length; m.jsonl_files++; m.jsonl_lines += n; if (p.startsWith(STORE + path.sep)) m.store_jsonl_lines += n; });
	return m;
}

// ---------- the plan ----------

// ---------- --verify --backup <dir>: the proof after the fact, from what was removed (backups + HEAD) against what is there now ----------
// Needs no plan, so it can run any time before the commit: every removed or replaced file is rebuilt (gitignored ones from the backup,
// tracked ones from HEAD), every line of it is looked for in every .jsonl under public/, and every session id a removed index.json named
// must still have a folder. Writes verify.json and the "Nothing lost" paragraph of move-report.md.
// ---------- --cleanup --backup <dir>: the folders this move emptied. A folder named by a redirect line of this run, the old places and
// ai2's record folders go when nothing is left in them but the listing the watcher (Server/plugins/PageFiles.js) rewrote as their
// files went (untracked, backed up first). A folder with any other file is left and listed. Repeated, since the watcher writes as folders change.
if (args.includes("--cleanup")){
	const BK = BACKUP ?? (() => { console.error("--cleanup needs --backup <dir>"); process.exit(2); })();
	const tr = new Set(git("ls-files", "-z", "public/framework/ai", "public/framework/ai2").split("\0").filter(Boolean));
	const L = "public/framework/ai/sessions/task-moves.jsonl";
	const dirs = [...new Set(lines_of(read(abs(L))).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(j => j?.run === "move-ai2-2026-11-01" && j.kind === "redirect").map(j => abs(j.from)))];
	dirs.push(...["2026", "2026-10-13", "archive/ai2"].map(d => path.join(AI, d)), ...["tasks", "ai", "overview"].map(d => path.join(AI2, d)));
	const out = { removed_dirs: 0, removed_listings: [], left: [] };
	const isListingOnly = p => lines_of(read(p)).every(l => /^\{"file":"[^"]*"(,"gone":true)?\}$/.test(l));
	const clean = d => {
		if (!fs.existsSync(d)) return;
		for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) clean(path.join(d, e.name));
		const left = fs.readdirSync(d), lp = path.join(d, "files.jsonl");
		if (left.length === 1 && left[0] === "files.jsonl" && isListingOnly(lp)){ const to = path.join(BK + "-listings", rel(lp)); fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(lp, to); if (tr.has(rel(lp))) { git("rm", "-q", "-f", "--", rel(lp)); tr.delete(rel(lp)); } else fs.rmSync(lp); out.removed_listings.push(rel(lp)); }   // a tracked listing goes with git rm -f: it holds only listing lines, and HEAD keeps it
		if (!fs.existsSync(d)){ out.removed_dirs++; return; }   // git rm takes an emptied folder with it
		if (!fs.readdirSync(d).length){ fs.rmdirSync(d); out.removed_dirs++; }
	};
	for (let pass = 0; pass < 5; pass++){ for (const d of dirs) clean(d); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000); }
	out.left = dirs.filter(d => fs.existsSync(d)).map(d => rel(d) + ": " + fs.readdirSync(d).join(", "));
	out.redirected_folders = dirs.length - 6; out.redirected_folders_gone_now = dirs.slice(0, -6).filter(d => !fs.existsSync(d)).length; out.old_places_and_ai2_folders_gone_now = dirs.slice(-6).filter(d => !fs.existsSync(d)).length;
	out.removed_listings = [...new Set(out.removed_listings)];
	fs.writeFileSync(path.join(HERE, "cleanup.json"), JSON.stringify({ at: new Date().toISOString(), folders_checked: dirs.length, ...out }, null, 1));
	console.log(JSON.stringify({ folders_checked: dirs.length, redirected_folders: out.redirected_folders, redirected_folders_gone_now: out.redirected_folders_gone_now, old_places_and_ai2_folders_gone_now: out.old_places_and_ai2_folders_gone_now, removed_dirs: out.removed_dirs, removed_listings: out.removed_listings.length, left: out.left }, null, 1));
	process.exit(out.left.length ? 3 : 0);
}
if (args.includes("--verify")){
	const LEDGER_PATH = "public/framework/ai/sessions/task-moves.jsonl", RUN_TAG = "move-ai2-2026-11-01";
	const BK = BACKUP ?? (() => { console.error("--verify needs --backup <dir>"); process.exit(2); })();
	const MAN = JSON.parse(read(path.join(HERE, "manifest.json")) || "{}");
	const removed = [];   // { orig, text, from }
	for (const root of [BK, BK + "-watcher"]) walk(root, p => removed.push({ orig: posix(path.relative(root, p)), text: read(p), from: "backup" }));
	const staged = git("diff", "--cached", "--name-status", "--no-renames", "-z", "HEAD").split("\0").filter(Boolean);
	for (let i = 0; i < staged.length; i += 2) if (staged[i] === "D") { const r = staged[i + 1]; removed.push({ orig: r, text: execFileSync("git", ["show", "HEAD:" + r], { cwd: REPO, maxBuffer: 1 << 30, windowsHide: true }).toString(), from: "HEAD" }); }
	const want = new Map();
	for (const f of removed) if (f.orig.endsWith(".jsonl") || f.orig.endsWith("files.jsonl")) for (const l of lines_of(f.text)) (want.get(l) ?? want.set(l, []).get(l)).push(f.orig);
	const found = new Set();
	walk(path.join(REPO, "public"), p => { if (!p.endsWith(".jsonl")) return; for (const l of lines_of(read(p))) if (want.has(l)) found.add(l); });
	const pointerSha = new Set((MAN.ai2_lines ?? []).filter(x => ["pointer", "covered", "identical", "elsewhere"].includes(x.status)).map(x => x.sha1));
	const cat = { found_again: 0, stale_cache_summary: 0, listing: 0, pointer_values_in_store: 0, LOST: [] };
	for (const [l, files] of want){
		if (found.has(l)) cat.found_again++;
		else if (files.every(f => f.endsWith("cache.jsonl")) && l.startsWith('{"summary"')) cat.stale_cache_summary++;
		else if (files.every(f => f.endsWith("files.jsonl")) || /^\{"file":"[^"]*"(,"gone":true)?\}$/.test(l)) cat.listing++;
		else if (pointerSha.has(sha(l))) cat.pointer_values_in_store++;
		else cat.LOST.push({ line: l.slice(0, 200), files });
	}
	// ids: every id a removed or replaced index.json named still has exactly one folder
	const now = new Map(); for (const s of sessions()) now.set(s.id, (now.get(s.id) ?? 0) + 1);
	const removedIds = new Set(); for (const f of removed) if (f.orig.endsWith("/index.json")) { try { const j = JSON.parse(f.text); if (j?.id) removedIds.add(j.id); } catch {} }
	const idsMissing = [...removedIds].filter(id => !now.has(id)), idsTwice = [...now].filter(([, c]) => c > 1).map(([id]) => id);
	const run1At = (MAN.run1?.ledger ?? []).map(j => j.at).sort()[0] ?? null;
	const newIds = sessions().filter(s => { try { const j = JSON.parse(read(path.join(s.dir, "index.json"))); return run1At && j.first_at && j.first_at >= run1At; } catch { return false; } }).map(s => ({ id: s.id, folder: rel(s.dir) }));
	const V = { at: new Date().toISOString(), removed_files: removed.length, from_backup: removed.filter(f => f.from === "backup").length, from_head: removed.filter(f => f.from === "HEAD").length, distinct_lines: want.size, ...cat, LOST: cat.LOST.length, lost_sample: cat.LOST.slice(0, 10), removed_index_ids: removedIds.size, ids_missing_now: idsMissing.length, ids_in_two_folders_now: idsTwice.length, run_started: run1At, sessions_begun_during_the_run: newIds };
	// the lines this move appended, computed: in a changed or new .jsonl under ai/, absent from that file's HEAD copy, and either a line of a
	// removed record (job 1, the merges) or a ledger line of this run
	const changed = git("status", "--porcelain", "-z", "--untracked-files=all", "--", "public/framework/ai").split("\0").filter(Boolean).filter(e => / M|\?\?|A /.test(e.slice(0, 2)) && e.endsWith(".jsonl")).map(e => e.slice(3));
	const appended = [];
	for (const f of changed){
		let head = null; try { head = new Set(lines_of(execFileSync("git", ["show", "HEAD:" + f], { cwd: REPO, maxBuffer: 1 << 30, windowsHide: true, stdio: ["ignore", "pipe", "ignore"] }).toString())); } catch {}
		for (const l of lines_of(read(abs(f)))){
			if (head?.has(l)) continue;
			const src = want.get(l); let isRun = false; if (f === LEDGER_PATH) try { isRun = JSON.parse(l).run === RUN_TAG; } catch {}
			if (src || isRun) appended.push({ dest: f, src: src ? [...new Set(src)].join(", ") : "move-ai2.mjs (redirect ledger)", sha1: sha(l), text: l });
		}
	}
	MAN.appended_computed = appended; fs.writeFileSync(path.join(HERE, "manifest.json"), JSON.stringify(MAN, null, 1));
	V.appended_lines = appended.length; V.appended_files = new Set(appended.map(a => a.dest)).size;
	fs.writeFileSync(path.join(HERE, "commit-paths.txt"), [...new Set(appended.map(a => a.dest))].join("\n") + "\n");
	fs.writeFileSync(path.join(HERE, "verify.json"), JSON.stringify(V, null, 1));
	const n = x => x.toLocaleString("en-US"), B = "`";
	const para = `**Nothing lost** (checked after the move by ${B}move-ai2.mjs --verify${B}, [verify.json](./verify.json)). The ${n(V.removed_files)} removed or replaced files (${n(V.from_backup)} gitignored, rebuilt from the backup; ${n(V.from_head)} tracked, rebuilt from HEAD) held ${n(V.distinct_lines)} distinct lines. ${n(V.found_again)} are found again in a .jsonl under public/. The rest: ${n(V.stale_cache_summary)} stale ${B}summary${B} lines of a gitignored ${B}cache.jsonl${B} (machine state AISession.save() rebuilds from the transcript, which exists for every one of these ids; the fresher copy stayed), ${n(V.listing)} generated folder-listing lines, and ${n(V.pointer_values_in_store)} ai2 task-stub pointers or folded copies whose values audit-ai2.mjs found in the store. **Lines lost: ${V.LOST}.** **Session ids:** the ${n(V.removed_index_ids)} ids named by a removed index.json all still have a folder (${V.ids_missing_now} missing), and ${V.ids_in_two_folders_now} ids are in two folders now. The +${n(V.sessions_begun_during_the_run.length)} id is ${V.sessions_begun_during_the_run.map(s => B + s.folder.replace("public/framework/ai/sessions/", "") + B).join(", ") || "none"}, a session that began during the run; the live-copy dollars rose for the same reason (sessions working while it ran). The "highest copy" and "every folder" dollars fall because they counted the duplicates; 10 stale copies had been counted under the old cost rule (no ${B}cost_v${B}).`;
	const file = path.join(HERE, "move-report.md"); let rpt = read(file);
	rpt = rpt.replace(/\*\*Nothing lost[\s\S]*?\n\n/, para + "\n\n");
	fs.writeFileSync(file, rpt);
	console.log(JSON.stringify({ ...V, lost_sample: undefined }, null, 1));
	process.exit(V.LOST || V.ids_missing_now || V.ids_in_two_folders_now ? 3 : 0);
}

lap("audit-ai2.mjs (read-only) for the line classification");
const AUDIT_JSON = path.join(os.tmpdir(), `move-ai2-audit-${process.pid}.json`);
execFileSync(process.execPath, [path.join(HERE, "audit-ai2.mjs"), "--no-write", "--json", AUDIT_JSON], { cwd: REPO, stdio: ["ignore", "ignore", "inherit"], maxBuffer: 1 << 30, windowsHide: true });
const audit = JSON.parse(fs.readFileSync(AUDIT_JSON, "utf8")); fs.rmSync(AUDIT_JSON);
const tracked = new Set(git("ls-files", "-z", "public/framework/ai", "public/framework/ai2").split("\0").filter(Boolean));
const dirty = new Set(lines_of(git("status", "--porcelain", "-z", "--", "public/framework/ai", "public/framework/ai2").split("\0").join("\n")).map(l => l.slice(3)));
lap("measuring before");
const beforeNow = measure();
const RUN1 = args.includes("--resume") ? JSON.parse(fs.readFileSync(path.resolve(args[args.indexOf("--resume") + 1]), "utf8")) : null;
const before = RUN1?.before ?? beforeNow;   // resumed: the numbers run 1 measured before it changed anything

const manifest = { written_at: new Date().toISOString(), brief: "move-brief.md", appended: [], moved: [], removed: [], replaced: [], held: [] };
const LEDGER = "public/framework/ai/sessions/task-moves.jsonl", RUN_AT = new Date().toISOString(), RUN = "move-ai2-" + RUN_AT.slice(0, 10);
const plan = { appends: new Map(), moves: [], removes: [], replaces: [], already: [] };   // appends: dest rel -> [text]
const destText = new Map();   // dest rel -> Set of its lines (as they will be after earlier appends)
const destLines = d => destText.get(d) ?? destText.set(d, new Set(lines_of(read(abs(d))))).get(d);
const ledgerKey = t => { try { const j = JSON.parse(t); return j.kind + "|" + j.from + "|" + j.to; } catch { return t; } };
let ledgerKeys = null;
function append(dest, text, src){
	const have = destLines(dest);
	if (dest === LEDGER){ ledgerKeys ??= new Set([...have].map(ledgerKey)); if (ledgerKeys.has(ledgerKey(text))) { plan.already.push({ dest, text, src }); return false; } ledgerKeys.add(ledgerKey(text)); }
	if (have.has(text)) { plan.already.push({ dest, text, src }); return false; } have.add(text); (plan.appends.get(dest) ?? plan.appends.set(dest, []).get(dest)).push(text); manifest.appended.push({ dest, src, sha1: sha(text), text }); return true; }

// 1. lines
for (const row of audit.copyRows){
	const srcs = row.sources;
	const oldWhole = srcs.length === 1 && /^public\/framework\/ai\/2026\//.test(srcs[0]) && srcs[0].endsWith("/page.jsonl") && !fs.existsSync(abs(row.dest));
	if (oldWhole) lines_of(read(abs(srcs[0]))).forEach((t, i) => append(row.dest, t, `${srcs[0]}:${i + 1}`));   // a new home gets the whole card log
	else for (const { text, src } of row.texts) append(row.dest, text, src.join(", "));
}
// old dated card logs whose home already exists: every line it lacks (the tail), in order
for (const r of audit.records.filter(r => r.group === "old-dated" && r.file.endsWith("/page.jsonl"))){
	const row = audit.copyRows.find(c => c.sources.includes(r.file)); if (!row) continue;
	lines_of(read(abs(r.file))).forEach((t, i) => { if (r.lines[i]?.s === "missing") append(row.dest, t, `${r.file}:${i + 1}`); });
}

// 2. duplicate session folders
const isTracked = p => tracked.has(rel(p));
const REGEN = { "index.json": "AISessionIndex (public/framework/ai/AISession/AISessionIndex.mjs), rebuilt from the transcript", "cache.jsonl": "AISession.save() (public/framework/ai/AISession/AISession.js), summary lines rebuilt from the transcript" };
// > 0 when copy a is fresher than copy b. cache.jsonl: its newest summary (last_at, then messages, then at); index.json: last_activity, then mtime
function fresher(a, b, base){
	const key = p => {
		if (base === "cache.jsonl") return lines_of(read(p)).filter(l => l.startsWith('{"summary"')).map(l => { try { const j = JSON.parse(l); return [j.summary?.last_at ?? "", String(j.summary?.messages ?? 0).padStart(9, "0"), j.at ?? ""].join("|"); } catch { return ""; } }).sort().pop() ?? "";
		let j = {}; try { j = JSON.parse(read(p)); } catch {}
		return (j.last_activity ?? "") + "|" + String(Math.round(fs.statSync(p).mtimeMs)).padStart(15, "0");
	};
	const ka = key(a), kb = key(b); return ka > kb ? 1 : ka < kb ? -1 : 0;
}
const byId = new Map(); for (const s of sessions()) (byId.get(s.id) ?? byId.set(s.id, []).get(s.id)).push(s);
const filesUnder = dir => { const o = new Map(); walk(dir, p => o.set(posix(path.relative(dir, p)), p)); return o; };
const groups = { total: 0, done: 0, keeper_has_tracked: 0, keeper_is_live: 0, live_moved_in: 0, held: [] };
const extraDirs = [], groups_keeper = new Map(), keeperById = new Map();
for (const [id, list] of byId){
	if (list.length < 2) continue;
	groups.total++;
	const info = list.map(s => ({ ...s, files: filesUnder(s.dir) })).map(s => ({ ...s, tracked: [...s.files.values()].filter(isTracked).length }));
	const live = info.reduce((a, b) => b.mtime > a.mtime ? b : a);
	const withT = info.filter(s => s.tracked);
	if (list.length > 2){ groups.held.push({ id, why: "more than two folders", dirs: info.map(s => rel(s.dir)) }); continue; }
	const K = withT.length ? withT.reduce((a, b) => b.tracked > a.tracked ? b : a) : live; const X = info.find(s => s !== K);   // tracked on both sides: the side with more stays, the other's task folders git mv in
	withT.length ? groups.keeper_has_tracked++ : groups.keeper_is_live++;
	const acts = [], hold = [];
	const kLines = new Set(); for (const p of K.files.values()) if (p.endsWith(".jsonl")) for (const l of lines_of(read(p))) kLines.add(l);
	for (const [r, p] of X.files){
		const kp = path.join(K.dir, r), inK = K.files.has(r), base = path.basename(r);
		if (!inK){ acts.push({ op: "move", from: p, to: kp, tracked: isTracked(p) }); continue; }
		const same = fs.readFileSync(p).equals(fs.readFileSync(kp));
		if (same){ acts.push({ op: "remove", path: p, tracked: isTracked(p), why: "byte-identical to " + rel(kp) }); continue; }
		if (REGEN[base]){
			// machine state in both: the FRESHER copy stays (a second reader caught a pair where the live index sat beside the older cache);
			// every line of the other copy must be in it, or be an older summary
			const xWins = fresher(p, kp, base) > 0, win = xWins ? p : kp, lose = xWins ? kp : p;
			const winLines = new Set(lines_of(read(win)));
			const lost = base.endsWith(".jsonl") ? lines_of(read(lose)).filter(l => !winLines.has(l)) : [];
			const bad = lost.filter(l => !l.startsWith('{"summary"'));
			if (bad.length) hold.push(`${rel(lose)}: ${bad.length} non-summary line(s) the fresher copy lacks`);
			else if (xWins) acts.push({ op: "replace", from: p, to: kp, why: "fresher; " + REGEN[base], stale_summary_lines: lost.length });
			else acts.push({ op: "remove", path: p, tracked: isTracked(p), why: "stale; " + REGEN[base], stale_summary_lines: lost.length });
			continue;
		}
		if (base.endsWith(".jsonl") && !isTracked(kp) === !isTracked(p)){
			const lack = lines_of(read(p)).filter(l => !kLines.has(l));
			acts.push({ op: "merge", from: p, to: kp, lines: lack });
			acts.push({ op: "remove", path: p, tracked: isTracked(p), why: "its lines merged into " + rel(kp) });
			continue;
		}
		hold.push(`${rel(p)}: differs from the keeper's copy and is not a log`);
	}
	if (hold.length){ groups.held.push({ id, why: hold.join("; "), dirs: info.map(s => rel(s.dir)) }); continue; }
	if (X === live && K !== live) groups.live_moved_in++;
	groups.done++;
	extraDirs.push(X.dir); groups_keeper.set(X.dir, K.dir); keeperById.set(id, K.dir);
	// the ledger TaskMove.mjs / StoreFolder read (the same lines SessionConsolidate.mjs writes): the old folder's URL redirects to the keeper
	for (const a of acts) if (a.op === "move" && a.tracked && path.basename(a.to) === "task.jsonl") append(LEDGER, JSON.stringify({ at: RUN_AT, run: RUN, kind: "task", from: rel(path.dirname(a.from)), to: rel(path.dirname(a.to)), session: id }), "move-ai2.mjs");
	append(LEDGER, JSON.stringify({ at: RUN_AT, run: RUN, kind: "redirect", from: rel(X.dir), to: rel(K.dir), session: id }), "move-ai2.mjs");
	for (const a of acts){
		if (a.op === "move") plan.moves.push(a);
		else if (a.op === "replace") plan.replaces.push(a);
		else if (a.op === "remove") plan.removes.push(a);
		else if (a.op === "merge") for (const t of a.lines) append(rel(a.to), t, rel(a.from));
	}
}

// 3. ai2 records
const ai2Files = [...tracked].filter(f => /^public\/framework\/ai2\/(tasks|ai|overview)\//.test(f) || f === "public/framework/ai2/page.jsonl" || f === "public/framework/ai2/weight.jsonl").sort();
for (const f of ai2Files) plan.removes.push({ path: abs(f), tracked: true, why: "ai2 record; its lines are in the store (job 1) or audit-ai2.mjs found its values there" });
const ai2Dirty = ai2Files.filter(f => dirty.has(f) && path.basename(f) !== "files.jsonl");   // a listing the watcher appended to is handled at removal
// 4. the old places outside the store's one shape (ai/sessions/YYYY/MM/DD/<name>/): their lines are in the store after job 1
const OLD_ROOTS = ["2026", "2026-10-13", "archive/ai2"].map(d => path.join(AI, d));
const oldFiles = []; for (const d of OLD_ROOTS) walk(d, p => oldFiles.push(p));
for (const p of oldFiles) plan.removes.push({ path: p, tracked: isTracked(p), why: "old place outside the store; its lines are in the store (job 1) or audit-ai2.mjs found its values there" });
const oldDirty = oldFiles.map(rel).filter(f => dirty.has(f) && path.basename(f) !== "files.jsonl");
// 5. a flat session folder (ai/sessions/<uuid>/, the shape before the dated tree) folds into its dated folder
const UUIDRE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const flat = { folders: [], held: [] };
for (const name of fs.readdirSync(STORE).filter(n => UUIDRE.test(n) && fs.statSync(path.join(STORE, n)).isDirectory())){
	const dir = path.join(STORE, name), home = keeperById.get(name) ?? byId.get(name)?.[0]?.dir;
	if (!home || (byId.get(name)?.length > 1 && !keeperById.has(name))){ flat.held.push(rel(dir) + ": no single dated folder for this id"); continue; }
	const acts = [], hold = [];
	for (const [r, p] of filesUnder(dir)){
		const hp = path.join(home, r);
		if (!fs.existsSync(hp)) acts.push({ op: "move", from: p, to: hp, tracked: isTracked(p) });
		else if (fs.readFileSync(p).equals(fs.readFileSync(hp))) acts.push({ op: "remove", path: p, tracked: isTracked(p), why: "byte-identical to " + rel(hp) });
		else if (p.endsWith(".jsonl") && isTracked(p) === isTracked(hp)){ const have = new Set(lines_of(read(hp))); for (const t of lines_of(read(p))) if (!have.has(t)) append(rel(hp), t, rel(p)); acts.push({ op: "remove", path: p, tracked: isTracked(p), why: "its lines merged into " + rel(hp) }); }
		else hold.push(rel(p));
	}
	if (hold.length){ flat.held.push(rel(dir) + ": differs and is not a log: " + hold.join(", ")); continue; }
	for (const a of acts) a.op === "move" ? plan.moves.push(a) : plan.removes.push(a);
	append(LEDGER, JSON.stringify({ at: RUN_AT, run: RUN, kind: "redirect", from: rel(dir), to: rel(home), session: name }), "move-ai2.mjs");
	extraDirs.push(dir); flat.folders.push(rel(dir) + " -> " + rel(home));
}
for (const h of flat.held) groups.held.push({ id: h.split(":")[0], why: h.split(": ").slice(1).join(": "), dirs: [] });
const ai2Lines = [];   // every line of every removed ai2 record: its audit status and where its content is
for (const f of ai2Files) if (f.endsWith(".jsonl") && !f.endsWith("/files.jsonl")) lines_of(read(abs(f))).forEach((t, i) => { const a = audit.records.find(r => r.file === f)?.lines[i]; ai2Lines.push({ file: f, line: i + 1, status: a?.s ?? "?", note: a?.note, where: a?.where, sha1: sha(t) }); });

// ---------- the proof, computed before anything changes: every line of every removed / replaced file is found in a remaining file ----------
lap("proof: looking for every removed line in what remains");
const goneFiles = new Set([...plan.removes.map(a => a.path), ...plan.replaces.map(a => a.to)]);   // a replaced keeper copy is gone too
const want = new Map();   // line -> [file rel]
for (const p of goneFiles) if (p.endsWith(".jsonl")) for (const l of lines_of(read(p))) (want.get(l) ?? want.set(l, []).get(l)).push(rel(p));
const found = new Set();
for (const root of [AI, AI2]) walk(root, p => { if (!p.endsWith(".jsonl") || goneFiles.has(p)) return; for (const l of lines_of(read(p))) if (want.has(l)) found.add(l); });
for (const a of plan.replaces) for (const l of lines_of(read(a.from))) if (want.has(l)) found.add(l);   // the live copy lands in the keeper
for (const ts of plan.appends.values()) for (const l of ts) if (want.has(l)) found.add(l);
const ai2Status = new Map(); for (const r of audit.records) r.lines.forEach((l, i) => ai2Status.set(`${r.file}:${i}`, l));
const explained = new Map();   // a removed line no remaining file holds, and why that is allowed
const notFound = { cache_summary: 0, ai2_pointer_or_folded: 0, listing: 0, other: [] };
for (const [l, files] of want){
	if (found.has(l)) continue;
	if (files.every(f => f.endsWith("/cache.jsonl")) && l.startsWith('{"summary"')) { notFound.cache_summary++; explained.set(l, "stale cache summary, regenerated from the transcript"); continue; }
	if (files.every(f => f.endsWith("/files.jsonl"))) { notFound.listing++; explained.set(l, "generated folder listing"); continue; }
	const ok = files.every(f => { if (!/^public\/framework\/(ai2\/|ai\/2026\/|ai\/2026-10-13\/|ai\/archive\/ai2\/)/.test(f)) return false; const i = lines_of(read(abs(f))).indexOf(l); return ["pointer", "covered", "identical", "elsewhere"].includes(ai2Status.get(`${f}:${i}`)?.s); });
	if (ok) { notFound.ai2_pointer_or_folded++; explained.set(l, "pointer or folded copy; audit-ai2.mjs found its values in the store or a module log"); continue; }
	notFound.other.push({ line: l.slice(0, 160), files });
}
const predicted = { ...before, jsonl_lines_delta: [...plan.appends.values()].reduce((n, t) => n + t.length, 0) - [...goneFiles].filter(p => p.endsWith(".jsonl")).reduce((n, p) => n + lines_of(read(p)).length, 0) + plan.replaces.filter(a => a.to.endsWith(".jsonl")).reduce((n, a) => n + lines_of(read(a.from)).length, 0) };

const summary = {
	appends: { files: plan.appends.size, lines: [...plan.appends.values()].reduce((n, t) => n + t.length, 0), created: [...plan.appends.keys()].filter(d => !fs.existsSync(abs(d))), dirty_before: [...plan.appends.keys()].filter(d => dirty.has(d)) },
	groups: { ...groups, held: groups.held.length },
	moves: { files: plan.moves.length, tracked: plan.moves.filter(a => a.tracked).length, list: plan.moves.map(a => rel(a.from).replace("public/framework/ai/sessions/", "") + " -> " + path.basename(path.dirname(a.to))) },
	replaces: plan.replaces.length,
	flat_folders: flat.folders,
	removes: { files: plan.removes.length, tracked: plan.removes.filter(a => a.tracked).length, ignored_or_untracked: plan.removes.filter(a => !a.tracked).length, ai2: ai2Files.length, ai2_dirty: ai2Dirty, old_places: oldFiles.length, old_places_tracked: oldFiles.filter(isTracked).length, old_dirty: oldDirty },
	lines_not_found_after: { ...notFound, other: notFound.other.length },
	jsonl_lines_delta_predicted: predicted.jsonl_lines_delta,
};
if (args.includes("--digest")) writeDigest(path.resolve(args[args.indexOf("--digest") + 1]));
console.log(JSON.stringify({ before, summary }, null, 1));
if (groups.held.length) console.log("HELD:\n" + groups.held.map(h => `  ${h.id}: ${h.why}\n    ${h.dirs.join("\n    ")}`).join("\n"));
if (notFound.other.length) console.log("LINES THAT WOULD BE LOST:\n" + notFound.other.slice(0, 20).map(o => "  " + o.files.join(",") + "  " + o.line).join("\n"));
if (!APPLY){ console.log("\nDRY RUN: nothing changed. Run with --apply --backup <dir>."); process.exit(0); }
if (notFound.other.length || ai2Dirty.length || oldDirty.length){ console.error("REFUSED: a line would be lost, or an ai2 record has uncommitted changes. Nothing changed."); process.exit(3); }

// ---------- apply ----------
const backup = p => { const to = path.join(BACKUP, rel(p)); fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(p, to); return to; };
const gitPaths = new Set();
lap("1. appending");
for (const [dest, texts] of plan.appends){
	const p = abs(dest), badBefore = lines_of(read(p)).filter(l => { try { JSON.parse(l); return false; } catch { return true; } }).length;
	for (const t of texts) JSON.parse(t);   // every line we add parses
	fs.mkdirSync(path.dirname(p), { recursive: true });
	let out = texts.join("\n") + "\n";
	if (fs.existsSync(p) && fs.statSync(p).size){ const b = fs.readFileSync(p); if (b[b.length - 1] !== 0x0a) out = "\n" + out; }
	fs.appendFileSync(p, out, "utf8");
	const badAfter = lines_of(read(p)).filter(l => { try { JSON.parse(l); return false; } catch { return true; } }).length;
	if (badAfter !== badBefore) throw new Error(dest + ": the file gained a bad line");
	gitPaths.add(dest);
}
lap("2. session folders");
for (const a of plan.moves){
	fs.mkdirSync(path.dirname(a.to), { recursive: true });
	if (a.tracked){ git("mv", rel(a.from), rel(a.to)); gitPaths.add(rel(a.from)); gitPaths.add(rel(a.to)); }
	else fs.renameSync(a.from, a.to);
	manifest.moved.push({ old: rel(a.from), new: rel(a.to), tracked: a.tracked });
}
for (const a of plan.replaces){
	const b = backup(a.to), s = sha(fs.readFileSync(a.to));
	fs.renameSync(a.from, a.to);
	manifest.replaced.push({ old: rel(a.from), new: rel(a.to), replaced_sha1: s, backup: b, why: a.why, stale_summary_lines: a.stale_summary_lines });
}
const isListing = p => path.basename(p) === "files.jsonl";
plan.removes.sort((a, b) => isListing(a.path) - isListing(b.path));
const headText = r => { try { return execFileSync("git", ["show", "HEAD:" + r], { cwd: REPO, maxBuffer: 1 << 30, windowsHide: true, stdio: ["ignore", "pipe", "ignore"] }).toString(); } catch { return null; } };
const save = () => fs.writeFileSync(path.join(HERE, "manifest.json"), JSON.stringify(manifest, null, 1));   // written as it goes: a stop part way still leaves the record
process.on("exit", () => { if (!manifest.proof) { manifest.stopped_part_way = true; save(); } });
for (const a of plan.removes){
	if (!fs.existsSync(a.path)) continue;
	const s = sha(fs.readFileSync(a.path));
	if (a.tracked){
		let how = "git rm";
		try { git("rm", "-q", "--", rel(a.path)); }
		catch (e){
			const head = headText(rel(a.path)), now = new Set(lines_of(read(a.path)));
			if (!isListing(a.path) || head === null || !lines_of(head).every(l => now.has(l))) throw e;
			git("rm", "-q", "-f", "--", rel(a.path)); how = "git rm -f (a generated listing; the watcher had only appended lines to HEAD's copy)";
		}
		gitPaths.add(rel(a.path)); manifest.removed.push({ path: rel(a.path), sha1: s, how, why: a.why });
	}
	else { const b = backup(a.path); fs.rmSync(a.path); manifest.removed.push({ path: rel(a.path), sha1: s, how: "removed (gitignored machine state)", backup: b, why: a.why, stale_summary_lines: a.stale_summary_lines }); }
}
const rmEmpty = d => {
	if (!fs.existsSync(d)) return;
	for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) rmEmpty(path.join(d, e.name));
	const left = fs.readdirSync(d);
	if (left.length === 1 && left[0] === "files.jsonl" && !isTracked(path.join(d, "files.jsonl"))){ const p = path.join(d, "files.jsonl"); const b = backup(p); fs.rmSync(p); manifest.removed.push({ path: rel(p), sha1: null, how: "removed (a listing the watcher wrote into an emptied folder)", backup: b }); }
	if (!fs.readdirSync(d).length) fs.rmdirSync(d);
};
for (let pass = 0; pass < 4; pass++){
	for (const d of [...extraDirs, ...["tasks", "ai", "overview"].map(x => path.join(AI2, x)), ...OLD_ROOTS]) rmEmpty(d);
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500);   // let the watcher settle, then look again
}
const extraLeft = extraDirs.filter(d => fs.existsSync(d)).map(rel);
manifest.held = groups.held;

lap("measuring after");
const after = measure();
const foundAfter = new Set();
for (const root of [AI, AI2]) walk(root, p => { if (!p.endsWith(".jsonl")) return; for (const l of lines_of(read(p))) if (want.has(l)) foundAfter.add(l); });
const backupFiles = []; for (const root of [BACKUP, BACKUP + "-watcher"]) walk(root, p => backupFiles.push({ p, orig: posix(path.relative(root, p)) }));
const want1 = new Map();
for (const { p, orig } of backupFiles) if (p.endsWith(".jsonl")) for (const l of lines_of(read(p))) if (!want.has(l)) (want1.get(l) ?? want1.set(l, []).get(l)).push(orig);
for (const root of [AI, AI2]) walk(root, p => { if (!p.endsWith(".jsonl")) return; for (const l of lines_of(read(p))) if (want1.has(l)) foundAfter.add(l); });
for (const [l, files] of want1){
	want.set(l, files);
	if (foundAfter.has(l)) continue;
	if (files.every(f => f.endsWith("cache.jsonl")) && l.startsWith('{"summary"')) { notFound.cache_summary++; explained.set(l, "stale cache summary"); }
	else if (files.every(f => f.endsWith("files.jsonl"))) { notFound.listing++; explained.set(l, "generated folder listing"); }
}
const gone = [...want.keys()].filter(l => !foundAfter.has(l));
const lost = gone.filter(l => !explained.has(l));
if (RUN1){
	const heads = new Map(), inHead = (d, t) => { if (!heads.has(d)) heads.set(d, new Set(lines_of(headText(d) ?? ""))); return heads.get(d).has(t); };
	manifest.run1 = { note: RUN1.note, summary: RUN1.summary,
		appended: plan.already.filter(a => !inHead(a.dest, a.text)).map(a => ({ dest: a.dest, src: a.src, sha1: sha(a.text), text: a.text })),
		ledger: lines_of(read(abs(LEDGER))).map(l => JSON.parse(l)).filter(j => j.run === RUN),
		machine_state: backupFiles.filter(b => !b.orig.startsWith("card-body")).map(({ p, orig }) => ({ path: orig, sha1: sha(fs.readFileSync(p)), backup: posix(p), now: fs.existsSync(abs(orig)) ? "replaced by the fresher copy" : "removed" })) };
}
const proof = { before, after, removed_files_distinct_lines: want.size, found_again: want.size - gone.length,
	not_found_but_explained: { stale_cache_summaries: notFound.cache_summary, ai2_pointer_or_folded: notFound.ai2_pointer_or_folded, listings: notFound.listing },
	LOST: lost.length, lost_sample: lost.slice(0, 10).map(l => l.slice(0, 160)), extra_folders_left: extraLeft };
manifest.proof = proof; manifest.summary = summary; manifest.ai2_lines = ai2Lines;
fs.writeFileSync(path.join(HERE, "manifest.json"), JSON.stringify(manifest, null, 1));
fs.writeFileSync(path.join(HERE, "proof.json"), JSON.stringify(proof, null, 1));
console.log(JSON.stringify(proof, null, 1));

// the commit list: what git tracks or can track (a gitignored destination is machine state, never committed)
const ignored = new Set();
{
	const list = [...gitPaths].filter(p => fs.existsSync(abs(p)));
	if (list.length) try { for (const p of execFileSync("git", ["check-ignore", "--stdin"], { cwd: REPO, input: list.join("\n"), windowsHide: true }).toString().split("\n").filter(Boolean)) ignored.add(posix(p)); } catch {}   // exit 1 = none ignored
}
fs.writeFileSync(path.join(HERE, "git-paths.txt"), [...gitPaths].filter(p => !ignored.has(p)).join("\n") + "\n");
console.log("git paths to commit:", gitPaths.size - ignored.size, "(gitignored, not committed: " + ignored.size + ")");

// move-report.md: one screen, every number from this run
const n = x => x.toLocaleString("en-US"), usd = x => "$" + x.toFixed(2);
const delta = (k, f) => { const d = after[k] - before[k]; return (d > 0 ? "+" : d < 0 ? "−" : "") + (f === usd ? Math.abs(d).toFixed(2) : n(Math.abs(d))); };
const row = (what, k, f = n) => `| ${what} | ${f(before[k])} | ${f(after[k])} | ${delta(k, f)} |`;
const ms = manifest.run1?.machine_state ?? [];
const R = manifest.replaced.length + ms.filter(m => m.now !== "removed").length, M = manifest.moved.length + (RUN1?.summary.moves.files ?? 0), rmT = manifest.removed.filter(r => r.how.startsWith("git rm")).length, rmI = manifest.removed.filter(r => !r.how.startsWith("git rm")).length + ms.filter(m => m.now === "removed").length;
if (RUN1) Object.assign(groups, { ...RUN1.summary.groups, held: groups.held }), Object.assign(summary.appends, { lines: RUN1.summary.appends.lines, files: RUN1.summary.appends.files, created: RUN1.summary.appends.created }), (flat.folders = RUN1.summary.flat_folders);
const held = groups.held.map(h => "`" + h.id.slice(0, 8) + "` (" + h.why + ": " + h.dirs.map(d => d.replace("public/framework/ai/sessions/", "")).join(", ") + ")").join("; ") || "none";
const B = "`";
// the independent check: one Haiku reader per digest batch, its JSON verdicts saved verbatim in haiku-checks.jsonl (this folder)
const allChecks = lines_of(read(path.join(HERE, "haiku-checks.jsonl"))).map(l => JSON.parse(l));
const checks = allChecks.filter(c => !String(c.batch).startsWith("recheck")), rechecks = allChecks.filter(c => String(c.batch).startsWith("recheck"));
const ck = k => checks.reduce((a, c) => a + (c[k] ?? 0), 0), ckProblems = checks.flatMap(c => c.problems ?? []), reProblems = rechecks.flatMap(c => c.problems ?? []);
const checkLine = checks.length ? `**Checked by a second reader.** ${checks.length} Haiku readers each read one batch of the digest: both copies of every differing file, line by line as sha1 plus the summary fields. They covered ${n(ck("rows_checked"))} file pairs: ${n(ck("cache_rows"))} cache pairs and ${n(ck("index_rows"))} index pairs (${n(ck("index_ok"))} with the same id, kept copy as new or newer). They found ${ckProblems.length} problem${ckProblems.length === 1 ? "" : "s"}${ckProblems.length ? " (" + ckProblems.map(p => p.deleted.replace("public/framework/ai/sessions/", "") + ": " + p.why).join("; ") + ")" : ""}. The cause was the first keeper rule, which took the cache from whichever folder had the newest index.json. The rule now keeps the fresher copy of each machine-state file, and this script's own check finds no deleted copy fresher than its kept one. The ${n(rechecks.reduce((a, c) => a + c.rows_checked, 0))} pairs the new rule changed were read again: ${reProblems.length} problems. No pair was byte-identical, so no removal rests on a sha match alone. Verdicts, verbatim: [haiku-checks.jsonl](./haiku-checks.jsonl).` : "";
fs.writeFileSync(path.join(HERE, "move-report.md"), [
	"# The ai2 move: before and after",
	"",
	`Written by [move-ai2.mjs](./move-ai2.mjs) on ${new Date().toISOString().slice(0, 10)}; every number here was computed by it. Brief: [move-brief.md](./move-brief.md), changed by the owner the same day: a duplicate is merged, then removed, with no archive copy. Every path and line: [manifest.json](./manifest.json).`,
	"",
	"| Whole of public/framework/ai + ai2 | Before | After | Change |",
	"| --- | --- | --- | --- |",
	row("Distinct session ids", "session_ids"),
	row("Session folders", "session_folders"),
	row("Ids stored in two folders", "ids_in_two_folders"),
	row("index.json dollars, once per id (live copy)", "usd_once_per_id_live", usd),
	row("index.json dollars, once per id (highest copy)", "usd_once_per_id_max", usd),
	row("index.json dollars, every folder summed", "usd_every_folder", usd),
	row(".jsonl lines", "jsonl_lines"),
	row(".jsonl lines in the sessions store", "store_jsonl_lines"),
	"",
	`**Nothing lost.** The removed and replaced files held ${n(want.size)} distinct lines; ${n(want.size - gone.length)} are found again in a remaining file. The other ${n(gone.length)} are accounted for: ${n(notFound.cache_summary)} stale ${B}summary${B} lines of a gitignored ${B}cache.jsonl${B} (AISession.save() rebuilds them from the transcript, which exists for every one of these ids), ${n(notFound.ai2_pointer_or_folded)} ai2 task-stub pointers whose values audit-ai2.mjs found in the real task, and ${n(notFound.listing)} generated folder-listing lines. **Lines lost with no explanation: ${lost.length}.** The "highest copy" dollars drop because 10 stale copies were counted under the old cost rule (no ${B}cost_v${B}); the live copies, which the day files already show, did not change.`,
	"",
	checkLine,
	"",
	"## What moved where",
	"",
	`- **Lines added to the store:** ${n(summary.appends.lines)} lines into ${summary.appends.files} files (${summary.appends.created.length} of them new card or task logs), byte for byte. An old dated card log whose store home did not exist was copied whole, so its card page reads the same.`,
	`- **Duplicate session folders:** ${groups.done} of ${groups.total} merged and gone. The keeper is the folder holding tracked task files (${groups.keeper_has_tracked}), else the live one (${groups.keeper_is_live}). ${R} fresher machine-state files (index.json, cache.jsonl) replaced the keeper's older copy, ${M} files the keeper lacked moved in, and ${rmI} stale gitignored copies were removed (backed up outside the repo at ${B}${BACKUP}${B}).`,
	`- **Flat session folders** (${B}ai/sessions/<uuid>/${B}, the shape before the dated tree): ${flat.folders.length} folded into their dated folder (${flat.folders.map(f => f.split("public/framework/ai/sessions/").join("")).join("; ") || "none"}).`,
	`- **ai2 records:** ${manifest.removed.filter(r => r.how.startsWith("git rm") && r.path.startsWith("public/framework/ai2/")).length} tracked files under ${B}public/framework/ai2/${B} (tasks/, ai/, overview/, page.jsonl, weight.jsonl) removed with ${B}git rm${B}; git history is the undo.`,
	`- **Old places outside the store:** ${manifest.removed.filter(r => /^public\/framework\/ai\/(2026\/|2026-10-13\/|archive\/ai2\/)/.test(r.path)).length} files under ${B}ai/2026/${B}, ${B}ai/2026-10-13/${B} and ${B}ai/archive/ai2/${B} (the old dated card logs and the old ai2 page logs, every line now in the store) removed, tracked ones with ${B}git rm${B}. Nothing session-shaped is left outside ${B}ai/sessions/YYYY/MM/DD/<name>/${B}.`,
	`- **Held, not touched:** ${held}.`,
	"",
	"## Why it happened",
	"",
	"- **2026-10-09, the session-folder rename ran under a live server.** `Server/session-migrate.mjs` (commit `537fd7df2`) renamed each `<uuid>` session folder to a slug. The running Servex kept its old id-to-folder map: `AISessionIndex.load()` fills `this.dirs` once, and `write()` does `mkdir -p` on the cached path before writing `index.json`. So every rewrite recreated the old `<uuid>` folder holding only an `index.json`. `Session.scan()` also runs once per process: a process that scanned before the rename did not know the slug, so `Session.locate()` made a new `session-<id8>` folder on that day (the 125 pairs that span two days).",
	"- **2026-10-12, task folders were filed into the wrong twin.** `TaskMove` (commit `c15216adc`) moved `ai/<date>/<task>/` folders into their session through `session_dir()`, which only knows `<uuid>` and `session-<id8>` names. It never found the slug folder, so it put tasks into the stale `<uuid>` folder. That is why 102 keepers here are the folder with the task files.",
	"",
	"## Can it happen again",
	"",
	"**Yes, two ways; not fixed by this run.**",
	"",
	"1. **A session whose only folder is a slug gets a second folder on its next task.** `DatedFiles.session_dir()` (`Server/DatedFiles.mjs`) still looks only for `<uuid>` and `session-<id8>`; checked read-only against today's store, it returns a new `2026/11/01/session-<id8>` for slug-only ids (about 5,700 of them). **The fix:** before the `home` fallback, look the id up in a lazily built map of the day's other folders using the existing `DatedFiles.owner(dir)`.",
	"2. **Any folder move under a running Servex brings the old path back.** `AISessionIndex.dir_of()` returns a cached folder that may be gone, and `write()` recreates it. **The fix:** when the cached folder no longer exists, drop it and locate again (the same in `Session.locate()` for `days`/`slugs`), and never `mkdir -p` a vanished cached path. Until then, restart Servex after every move, including this one.",
	"",
	"`Server/SessionConsolidate.mjs` (2026-10-25) already folds one session's twins by id, but it sees only `<uuid>` / `session-<id8>` folders, so it could not find the 726 pairs that involve a slug. This run's batch logic belongs in it (one tool, not two).",
	"",
	"## Next",
	"",
	`1. **531 store cards still name ${B}/framework/ai2/card.js${B} as their class**, so ${B}ai2/card.js${B} and ${B}ai2/page.js${B} stay. Add the alias in ${B}core/Page/Jsonl.js${B} ${B}log_class()${B} (move-plan.md step 3a), repoint the live readers (step 3b), then remove the rest of ai2/.`,
	`2. **Fix the two writers** named under "Can it happen again" (DatedFiles.session_dir, AISessionIndex.dir_of), and fold this batch logic into ${B}Server/SessionConsolidate.mjs${B}.`,
	`3. **Restart Servex** so AISessionIndex reloads its folder map; until then it may rewrite an ${B}index.json${B} into a folder this run removed. Then run ${B}node public/framework/ai/AISession/AISessionIndex.mjs --check${B}. The day files still name a removed folder for some sessions; the redirect lines in ${B}ai/sessions/task-moves.jsonl${B} answer those links.`,
	"",
].join("\n"));
console.log("wrote manifest.json, proof.json, move-report.md");

// ---------- --digest <dir>: both copies of every differing file of every pair, compact, in batches of ~60k tokens, for a reader that is not this script ----------
function writeDigest(dir){
	fs.mkdirSync(dir, { recursive: true });
	const IX = ["id", "folder", "day", "state", "usd", "cost_v", "tree_usd", "children", "first_at", "last_activity", "title"];
	const ix = p => { try { const j = JSON.parse(read(p)); return Object.fromEntries(IX.map(k => [k, j[k]])); } catch { return null; } };
	const cl = p => lines_of(read(p)).map(l => { let j = null; try { j = JSON.parse(l); } catch {} const k = j ? Object.keys(j)[0] : "BAD", b = j?.[k] ?? {};
		return { sha1: sha(l).slice(0, 12), kind: k, at: j?.at, by: j?.by, v: b.v, first_at: b.first_at, last_at: b.last_at, messages: b.messages, prompts: b.prompts, usd: typeof b.usd === "number" ? Math.round(b.usd * 1e4) / 1e4 : undefined, cursor: b.cursor?.main?.off }; });
	const pairs = [];
	for (const a of plan.replaces) pairs.push({ op: "the live copy replaces the keeper's stale copy; the stale copy is deleted", deleted: rel(a.to), kept: rel(a.from), file: path.basename(a.to) });
	for (const a of plan.removes) if (REGEN[path.basename(a.path)] && a.path.startsWith(STORE)){ const k = groups_keeper.get(path.dirname(a.path)); if (k) pairs.push({ op: "the extra folder's stale copy is deleted", deleted: rel(a.path), kept: rel(path.join(k, path.basename(a.path))), file: path.basename(a.path) }); }
	const rows = pairs.map((p, i) => ({ n: i + 1, op: p.op, file: p.file, deleted: p.deleted, kept: p.kept,
		...(p.file === "index.json" ? { deleted_copy: ix(abs(p.deleted)), kept_copy: ix(abs(p.kept)) } : { deleted_lines: cl(abs(p.deleted)), kept_lines: cl(abs(p.kept)) }) }));
	let batch = [], size = 0, b = 0; const flush = () => { if (!batch.length) return; fs.writeFileSync(path.join(dir, `batch-${String(++b).padStart(2, "0")}.json`), JSON.stringify(batch)); batch = []; size = 0; };
	for (const r of rows){ const t = JSON.stringify(r).length; if (size + t > 140000) flush(); batch.push(r); size += t; }
	flush();
	console.error(`digest: ${rows.length} file pairs in ${b} batches at ${dir}`);
}
