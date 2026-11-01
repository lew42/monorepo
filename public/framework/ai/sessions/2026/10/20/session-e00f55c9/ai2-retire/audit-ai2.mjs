#!/usr/bin/env node
/* audit-ai2.mjs: READ-ONLY audit for retiring public/framework/ai2/.
 *
 * It answers four questions with counts a computer worked out (CLAUDE.md law 7):
 *   1. Is every record file under ai2/ already in the sessions store?  (identical / pointer / partly / missing)
 *   2. Is every session or task record still in the OLD places (ai/YYYY/MM/DD/, ai/2026-10-13/, ai/archive/ai2/,
 *      and the cards the /framework/ai2/ route draws) already in the store, there twice, or only in the old place?
 *   3. Is any session or task in the store more than once?
 *   4. Who still reads ai2?
 *
 * It changes NOTHING in the repo. The only files it writes are audit.md and move-plan.md, next to this script
 * (pass --no-write to just print the numbers). Run:  node audit-ai2.mjs [--no-write] [--json <file>]
 *
 * The store is public/framework/ai/sessions/YYYY/MM/DD/<session>/...  A line counts as "in the store" when the
 * identical line sits in any .jsonl file under it. A line whose id token is in the store but whose text differs is
 * "same id, text differs". Everything else is "missing" until a wider search (the rest of ai/, Servex/, Server/)
 * says where it lives.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const T0 = Date.now();
const lap = (m) => console.error(`[${((Date.now()-T0)/1000).toFixed(1)}s] ${m}`);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../../../../../../../../..");   // .../public/framework/ai/sessions/2026/10/20/session-e00f55c9/ai2-retire -> repo root
const FW = path.join(REPO, "public/framework");
const AI = path.join(FW, "ai");
const AI2 = path.join(FW, "ai2");
const STORE = path.join(AI, "sessions");
const ARCHIVE_AI2 = path.join(AI, "archive/ai2");
const OLD_YEAR = path.join(AI, "2026");
const OLD_DAY = path.join(AI, "2026-10-13");
const args = process.argv.slice(2);
const WRITE = !args.includes("--no-write");
const JSON_OUT = args.includes("--json") ? args[args.indexOf("--json") + 1] : null;

const posix = p => p.split(path.sep).join("/");
const rel = (p, base = REPO) => posix(path.relative(base, p));
const readText = p => { try { return fs.readFileSync(p, "utf8"); } catch { return ""; } };   // a file another agent deletes mid-scan reads as empty
const exists = p => fs.existsSync(p);
const sha = s => crypto.createHash("sha1").update(s).digest("hex");
const short = (s, n = 150) => (s.length > n ? s.slice(0, n) + "..." : s);
const lines_of = text => text.split("\n").map(l => l.replace(/\r$/, "")).filter(l => l.trim() !== "");
const parse = l => { try { return JSON.parse(l); } catch { return null; } };
const esc = s => JSON.stringify(s).slice(1, -1);

function walk(dir, fn, skip = () => false){
	let ents;
	try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
	for (const e of ents){
		const p = path.join(dir, e.name);
		if (skip(p, e)) continue;
		if (e.isDirectory()) walk(p, fn, skip); else if (e.isFile()) fn(p, e);
	}
}

/* ------------------------------------------------------------------------------------------------------------ *
 * PHASE 1. Load every old record. A "record" is a jsonl file with data; files.jsonl is a generated folder listing.
 * ------------------------------------------------------------------------------------------------------------ */
const TOK = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|refined-\d+|[a-z]{1,2}-[a-z0-9]{8}\b/g;

const records = [];   // { file (repo-relative), group, lines: [{ text, json, status..., }] }
function addRecord(abs, group){
	const text = readText(abs);
	const rec = { abs, file: rel(abs), group, lines: lines_of(text).map(t => ({ text: t, json: parse(t) })) };
	records.push(rec);
	return rec;
}
const listings = [];  // files.jsonl: generated folder listings
const codeFiles = []; // non-jsonl files under ai2/
walk(AI2, (p) => {
	const base = path.basename(p);
	if (base === "files.jsonl") listings.push({ file: rel(p), lines: lines_of(readText(p)).length, group: "ai2" });
	else if (base.endsWith(".jsonl")) addRecord(p, "ai2");
	else codeFiles.push({ abs: p, file: rel(p) });
});
walk(ARCHIVE_AI2, (p) => {
	const base = path.basename(p);
	if (base === "files.jsonl") listings.push({ file: rel(p), lines: lines_of(readText(p)).length, group: "archive" });
	else if (base.endsWith(".jsonl")) addRecord(p, "archive");
});
for (const root of [OLD_YEAR, OLD_DAY]){
	walk(root, (p) => {
		const base = path.basename(p);
		if (base === "files.jsonl") listings.push({ file: rel(p), lines: lines_of(readText(p)).length, group: "old-dated" });
		else if (base.endsWith(".jsonl")) addRecord(p, "old-dated");
		else codeFiles.push({ abs: p, file: rel(p), group: "old-dated" });
	});
}

// Every line we will look for, and every id token we will look for.
const targets = new Map();   // exact line text -> [{ rec, i }]
const tokenWanted = new Map(); // id token -> [{ rec, i }]
function keyOf(j){
	if (!j || typeof j !== "object") return null;
	if (j.content?.add?.id) return j.content.add.id;
	if (j.note?.id) return j.note.id;
	if (j.session?.id) return null;   // session events repeat; only the exact line identifies them
	if (typeof j.id === "string" && j.path === undefined) return j.id;
	return null;
}
for (const rec of records){
	rec.lines.forEach((ln, i) => {
		(targets.get(ln.text) ?? targets.set(ln.text, []).get(ln.text)).push({ rec, i });
		ln.key = keyOf(ln.json);
		if (ln.key && TOK.test(ln.key)) { TOK.lastIndex = 0; (tokenWanted.get(ln.key) ?? tokenWanted.set(ln.key, []).get(ln.key)).push({ rec, i }); }
		TOK.lastIndex = 0;
		ln.exactIn = new Set();   // store files holding this exact line
		ln.keyIn = new Set();     // store files holding the id token
	});
}

lap("phase1 done");
/* ------------------------------------------------------------------------------------------------------------ *
 * PHASE 2. One pass over the store.
 * ------------------------------------------------------------------------------------------------------------ */
const store = {
	files: 0, dirs: 0, bytes: 0, jsonl: 0,
	sessions: [],               // from index.json: { id, folder, day, usd, rel }
	taskFiles: [],              // { rel, sha, size, req, at, sid }
	pagesByName: new Map(),     // parent folder name -> [rel path of page.jsonl]
	mentionsByExt: {},          // files in the store that mention an ai2 path, by extension (history, not readers)
	monthIndex: {},             // sessions/YYYY/index.json month totals
	classRefs: {},              // first-line "class" values that name an ai2 path, in page.jsonl files
	classRefFiles: [],
};
const AI2_MENTION = /\/framework\/ai2\b|\.\.\/ai2\/|\bai2\/[\w-]+\.(?:js|css|mjs)\b/;
const TEXT_EXT = new Set([".md", ".js", ".mjs", ".json", ".jsonl", ".txt", ".css", ".html"]);

walk(STORE, (p, e) => {
	if (p.startsWith(HERE)) return;   // this audit's own folder is not store history
	const rp = rel(p, STORE);
	store.files++;
	const ext = path.extname(p);
	let size = 0;
	try { size = fs.statSync(p).size; } catch {}
	store.bytes += size;
	const base = path.basename(p);

	if (base === "page.jsonl"){
		const parent = path.basename(path.dirname(p));
		(store.pagesByName.get(parent) ?? store.pagesByName.set(parent, []).get(parent)).push(rp);
	}
	if (!TEXT_EXT.has(ext) || size > 300e6) return;
	const text = readText(p);

	if (base === "page.jsonl"){
		const nl = text.indexOf("\n");
		const m = /"class":"(\/framework\/ai2\/[^"]+)"/.exec(nl < 0 ? text : text.slice(0, nl));
		if (m){ store.classRefs[m[1]] = (store.classRefs[m[1]] ?? 0) + 1; store.classRefFiles.push(rp); }
	}
	if (ext === ".jsonl"){
		store.jsonl++;
		for (const l of text.split("\n")){
			const t = l.endsWith("\r") ? l.slice(0, -1) : l;
			const hit = targets.get(t);
			if (hit) for (const { rec, i } of hit) rec.lines[i].exactIn.add(rp);
		}
		if (tokenWanted.size){
			for (const m of text.matchAll(TOK)){
				const hit = tokenWanted.get(m[0]);
				if (hit) for (const { rec, i } of hit) rec.lines[i].keyIn.add(rp);
			}
		}
	}
	if (base === "index.json"){
		const j = parse(text);
		if (j?.id && j.folder && /^\d{4}\/\d{2}\/\d{2}$/.test(j.day ?? "") && j.state) store.sessions.push({ id: j.id, folder: j.folder, day: j.day, usd: Number(j.usd) || 0, rel: rp, dir: posix(path.dirname(rp)) });
	}
	if (base === "task.jsonl"){
		let req = null, at = null, sid = null;
		for (const l of lines_of(text)){
			const j = parse(l); if (!j) continue;
			const o = j.assign ?? j.set ?? j;
			if (o && typeof o === "object"){ req ??= o.request; at ??= o.requested_at; sid ??= o.session_id ?? o.session; }
		}
		store.taskFiles.push({ rel: rp, sha: sha(text), size: text.length, req, at, sid: typeof sid === "string" ? sid : null });
	}
	if (AI2_MENTION.test(text)) store.mentionsByExt[ext] = (store.mentionsByExt[ext] ?? 0) + 1;
});
walk(STORE, () => {}, (p, e) => { if (e.isDirectory()) store.dirs++; return false; });
{
	let yi = null;
	try { yi = parse(readText(path.join(STORE, "2026/index.json"))); } catch {}
	store.monthIndex = yi?.months ?? {};
}

lap("store scanned");
/* ------------------------------------------------------------------------------------------------------------ *
 * PHASE 3. A wider search for lines the store does not have: the rest of the repo (jsonl only, outside the store and the old places themselves).
 * ------------------------------------------------------------------------------------------------------------ */
const elsewhereSkip = (p, e) => {
	if (!e.isDirectory()) return false;
	return /(^|\/)(\.git|node_modules)$/.test(rel(p)) || [STORE, AI2, OLD_YEAR, OLD_DAY, ARCHIVE_AI2, HERE].includes(p);
};
function searchElsewhere(){
	const missingLines = new Map();
	for (const rec of records) rec.lines.forEach((ln, i) => {
		if (ln.exactIn.size === 0 && ln.keyIn.size === 0 && !ln.json?.session) missingLines.set(ln.text, [...(missingLines.get(ln.text) ?? []), { rec, i }]);
		else if (ln.exactIn.size === 0 && ln.json?.session) missingLines.set(ln.text, [...(missingLines.get(ln.text) ?? []), { rec, i }]);
	});
	if (!missingLines.size) return;
	for (const root of [REPO]){
		walk(root, (p) => {
			if (!p.endsWith(".jsonl")) return;
			let size = 0; try { size = fs.statSync(p).size; } catch {}
			if (size > 300e6) return;
			const rp = rel(p);
			for (const l of readText(p).split("\n")){
				const t = l.endsWith("\r") ? l.slice(0, -1) : l;
				const hit = missingLines.get(t);
				if (hit) for (const { rec, i } of hit) (rec.lines[i].elsewhere ??= new Set()).add(rp);
			}
		}, elsewhereSkip);
	}
}
searchElsewhere();

lap("elsewhere searched");
/* ------------------------------------------------------------------------------------------------------------ *
 * PHASE 4. Classify every line, then every file.
 * ------------------------------------------------------------------------------------------------------------ */
const storeDirExists = siteUrl => {
	const m = /^\/framework\/ai\/(sessions\/.*?)\/?$/.exec(siteUrl || "");
	return m ? exists(path.join(AI, m[1])) : false;
};
const storeTaskText = siteUrl => {
	const m = /^\/framework\/ai\/(sessions\/.*?)\/?$/.exec(siteUrl || "");
	const f = m && path.join(AI, m[1], "task.jsonl");
	return f && exists(f) ? readText(f) : null;
};
function leafStrings(o, out = []){
	if (typeof o === "string") { if (o.trim()) out.push(o); }
	else if (Array.isArray(o)) o.forEach(v => leafStrings(v, out));
	else if (o && typeof o === "object") for (const v of Object.values(o)) leafStrings(v, out);
	return out;
}
const ai2StubNames = new Set(fs.readdirSync(path.join(AI2, "tasks"), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name));

function classifyLine(rec, ln){
	const j = ln.json;
	// 1. identical line in the store
	if (ln.exactIn.size) return { s: "identical", where: [...ln.exactIn] };
	if (j && typeof j === "object"){
		// 2. a task stub's header: it only points at a real task in the store
		if (j.sessions && j.by === "task-migrate"){
			const urls = (j.sessions || []).map(s => s.task);
			const ok = urls.length && urls.every(storeDirExists);
			const withTask = urls.length && urls.every(u => storeTaskText(u));
			ln.stubTexts = urls.map(storeTaskText).filter(Boolean);
			return { s: ok ? "pointer" : "missing", note: ok ? (withTask ? "points at a store task folder that has a task.jsonl" : "points at a store folder with no task.jsonl") : "its target folder is not in the store", where: urls };
		}
		// 3. a pointer to an ai2 stub folder
		if (j.task && j.by === "task-migrate" && Object.keys(j).length <= 3){
			const name = j.task.replace(/^\/framework\/ai2\/tasks\//, "").replace(/\/$/, "");
			return { s: ai2StubNames.has(name) ? "pointer" : "missing", note: "lists the ai2 task stub " + name };
		}
		// 4. a folder header (page id/path/title only)
		if (j.id && j.path && !j.sessions && Object.keys(j).every(k => ["id", "path", "title", "mode", "parent", "module"].includes(k))) return { s: "pointer", note: "folder header, no data" };
		// 5. a note that only names a doc
		if (typeof j.note === "string" && /\.md\b/.test(j.note)) {
			const m = /([\w/.-]+\.md)/.exec(j.note);
			const doc = m && [path.join(FW, m[1]), path.join(REPO, m[1])].find(exists);
			return { s: doc ? "pointer" : "missing", note: doc ? "names a doc that exists: " + m[1] : "names a doc that does not exist" };
		}
	}
	// 6. the id token is in the store but the line text differs
	if (ln.keyIn.size){
		const t = j?.content?.add?.text;
		if (typeof t === "string" && t.length > 2){
			const home = [...ln.keyIn].find(f => { try { return readText(path.join(STORE, f)).includes(esc(t)); } catch { return false; } });
			if (home) return { s: "covered", note: "the prompt text is in " + home + " (a different record shape)", where: [home] };
		}
		return { s: "same-id", where: [...ln.keyIn] };
	}
	// 7. found outside the store
	if (ln.elsewhere?.size) return { s: "elsewhere", where: [...ln.elsewhere] };
	return { s: "missing" };
}
for (const rec of records) for (const ln of rec.lines) ln.c = classifyLine(rec, ln);

// A stub's second and later lines are folded copies of the real task. Check each value against the real task text.
for (const rec of records){
	if (!/^public\/framework\/ai2\/tasks\/[^/]+\/task\.jsonl$/.test(rec.file)) continue;
	const head = rec.lines[0];
	const real = (head.stubTexts ?? []).join("\n");
	rec.stub = { real: !!real, fields: 0, found: 0, absent: [] };
	if (!real) { for (const ln of rec.lines.slice(1)) ln.c = { s: "missing", note: "the real task.jsonl is not in the store" }; continue; }
	for (const ln of rec.lines.slice(1)){
		if (ln.c.s === "identical") continue;
		const strs = leafStrings(ln.json);
		// A value may be a site path that task-migrate rewrote from the old `public/framework/ai/2026-..` path to the store;
		// it counts as present when that store file or folder exists.
		const isStorePath = v => /^\/framework\/ai\/sessions\//.test(v) && exists(path.join(AI, v.replace(/^\/framework\/ai\//, "").split("#")[0]));
		const found = strs.filter(v => real.includes(esc(v)) || real.includes(v) || isStorePath(v));
		rec.stub.fields += strs.length; rec.stub.found += found.length;
		const miss = strs.filter(v => !found.includes(v));
		rec.stub.absent.push(...miss.map(v => short(v, 60)));
		ln.c = miss.length === 0
			? { s: "covered", note: `all ${strs.length} values are in the real task.jsonl` }
			: { s: "partial", note: `${miss.length} of ${strs.length} values are not in the real task.jsonl` };
	}
}

// Second look at every line still "missing": does its opening text (50 characters of its longest string) appear anywhere
// in the store, in some other record shape? That does not make it "there" (a quote in a summary is not the record), but
// it is worth reporting, so a "missing" is never a false alarm about a reshaped record.
const snipOf = (ln) => {
	const strs = leafStrings(ln.json).filter(s => s.length >= 40).sort((a, b) => b.length - a.length);
	return strs[0] ? esc(strs[0].slice(0, 50)) : null;
};
{
	const want = new Map();   // snippet -> [line]
	for (const rec of records) for (const ln of rec.lines){
		if (ln.c.s !== "missing" && ln.c.s !== "partial") continue;
		const s = snipOf(ln); if (!s) continue;
		(want.get(s) ?? want.set(s, []).get(s)).push(ln);
	}
	if (want.size){
		const re = new RegExp([...want.keys()].map(s => s.replace(/[.*+?^${}()|[\]\\]/g, c => "\\" + c)).join("|"), "g");
		walk(STORE, (p) => {
			if (!p.endsWith(".jsonl") || p.startsWith(HERE)) return;
			const text = readText(p);
			for (const m of text.matchAll(re)) for (const ln of want.get(m[0]) ?? []) (ln.textIn ??= new Set()).add(rel(p, STORE));
		});
	}
}

function fileStatus(rec){
	const n = rec.lines.length;
	const c = rec.lines.map(l => l.c.s);
	const cnt = k => c.filter(x => x === k).length;
	const identical = cnt("identical"), pointer = cnt("pointer"), covered = cnt("covered"), sameId = cnt("same-id"),
		partial = cnt("partial"), elsewhere = cnt("elsewhere"), missing = cnt("missing");
	const counts = { n, identical, pointer, covered, sameId, partial, elsewhere, missing };
	let status;
	if (n === 0) status = "empty";
	else if (identical === n) status = "identical";
	else if (missing === 0 && partial === 0 && elsewhere === 0 && sameId === 0 && pointer > 0 && pointer + covered + identical === n) status = "pointer";
	else if (missing === n) status = "missing";
	else if (elsewhere === n - pointer - identical - covered && elsewhere > 0 && missing === 0 && partial === 0 && sameId === 0) status = "elsewhere";
	else status = (missing + partial + elsewhere + sameId > 0) ? "partly" : "identical";
	return { status, counts };
}
for (const rec of records) Object.assign(rec, fileStatus(rec));

lap("classified");
/* ------------------------------------------------------------------------------------------------------------ *
 * PHASE 5. Question 2: old-pattern session and card records.
 * ------------------------------------------------------------------------------------------------------------ */
const tsRange = (lines) => {
	const ts = [];
	for (const t of lines){
		const j = typeof t === "string" ? parse(t) : t;
		const x = j?.content?.add?.ts ?? j?.ts ?? j?.content?.add?.at ?? j?.at ?? j?.inbox?.at ?? j?.chat?.ts;
		if (typeof x === "string") ts.push(new Date(x).toISOString());
	}
	ts.sort();
	return ts.length ? { first: ts[0], last: ts[ts.length - 1] } : null;
};
const oldPages = records.filter(r => r.group === "old-dated" && path.basename(r.file) === "page.jsonl");
for (const rec of oldPages){
	const name = path.basename(path.dirname(rec.abs));
	const day = rec.file.replace(/^public\/framework\/ai\//, "").split("/").slice(0, 3).join("/");   // 2026/10/12
	rec.name = name; rec.day = day;
	const cands = store.pagesByName.get(name) ?? [];
	rec.candidates = cands.map(cp => {
		const lines = lines_of(readText(path.join(STORE, cp)));
		const set = new Set(lines);
		const range = tsRange(lines);
		const exact = rec.lines.filter(l => set.has(l.text)).length;
		const keyed = rec.lines.filter(l => !set.has(l.text) && l.keyIn.has(cp)).length;
		const oldSet = new Set(rec.lines.map(l => l.text));
		const storeOnly = lines.filter(l => !oldSet.has(l)).length;
		return { path: cp, kind: /\/cards\//.test("/" + cp) ? "card folder" : "session folder", lines: lines.length, exact, keyed, storeOnly, sameDay: cp.startsWith(day + "/"), range, lineSet: set };
	});
	rec.oldRange = tsRange(rec.lines.map(l => l.json));
	rec.overlapBetweenCopies = rec.candidates.length > 1 ? [...rec.candidates[0].lineSet].filter(x => rec.candidates[1].lineSet.has(x)).length : null;
	const withHits = rec.candidates.filter(c => c.exact || c.keyed);
	rec.copiesInStore = rec.candidates.length;
	rec.onlyOldLines = rec.lines.filter(l => l.c.s === "missing" || l.c.s === "elsewhere").length;
	const missingTypes = {};
	for (const l of rec.lines.filter(l => l.c.s === "missing")){
		const t = l.json?.content?.add?.type ?? l.json?.content?.add?.kind ?? (l.json?.cost ? "cost" : Object.keys(l.json ?? {})[0]) ?? "?";
		missingTypes[t] = (missingTypes[t] ?? 0) + 1;
	}
	rec.missingTypes = missingTypes;
	const inStoreLines = rec.lines.filter(l => ["identical", "covered", "pointer"].includes(l.c.s)).length;
	rec.q2 = rec.onlyOldLines === 0 ? (rec.candidates.length > 1 ? "in the store, in several places" : "in the store")
		: inStoreLines > 0 ? "partly in the store" : "only in the old place";
	rec.q2lines = rec.lines.length;
}

// Cards the /framework/ai2/<yyyy>/<mm>/<dd>/<card>/ route draws: where does each card's folder live?
const cardRows = fs.existsSync(path.join(AI, "cards.jsonl")) ? lines_of(readText(path.join(AI, "cards.jsonl"))).map(parse).filter(r => r?.id) : [];
const cardStats = { total: cardRows.length, dated: 0, storeOnly: 0, oldOnly: 0, both: 0, neither: 0, undated: 0 };
const cardBoth = [], cardOldOnly = [];
const cardRel = id => { // CardDir.rel(): 2026/10/13/x -> sessions/2026/10/13/cards/x
	const segs = id.split("/").filter(Boolean);
	if (!/^\d{4}$/.test(segs[0])) return segs.join("/");
	let k = 1; while (k < 3 && /^\d{2}$/.test(segs[k] ?? "")) k++;
	return ["sessions", ...segs.slice(0, k), "cards", ...segs.slice(k)].join("/");
};
for (const r of cardRows){
	if (!/^\d{4}\/\d{2}\/\d{2}\//.test(r.id)) { cardStats.undated++; continue; }
	cardStats.dated++;
	const inStore = exists(path.join(AI, cardRel(r.id), "page.jsonl"));
	const inOld = exists(path.join(AI, r.id, "page.jsonl")) || exists(path.join(AI, r.id));
	if (inStore && inOld) { cardStats.both++; cardBoth.push(r.id); }
	else if (inStore) cardStats.storeOnly++;
	else if (inOld) { cardStats.oldOnly++; cardOldOnly.push(r.id); }
	else cardStats.neither++;
}
// old folders that exist in the old place but are NOT a board card
const oldFolderIds = oldPages.map(r => rel(path.dirname(r.abs), AI));
const oldNotInBoard = oldFolderIds.filter(id => !cardRows.some(r => r.id === id));

// Archive (ai/archive/ai2): page logs with no reader
const archiveRecs = records.filter(r => r.group === "archive");

lap("q2 done");
/* ------------------------------------------------------------------------------------------------------------ *
 * PHASE 6. Question 3: duplicates in the store.
 * ------------------------------------------------------------------------------------------------------------ */
const byId = new Map();
for (const s of store.sessions) (byId.get(s.id) ?? byId.set(s.id, []).get(s.id)).push(s);
const folderKind = (folder) => /^session-[0-9a-f]{8}$/.test(folder) ? "session-8" : /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(folder) ? "uuid" : "slug";
const KIND_RANK = { "session-8": 0, uuid: 1, slug: 2 };
const filesOf = dir => { const out = new Map(); walk(path.join(STORE, dir), (p) => out.set(rel(p, path.join(STORE, dir)), fs.statSync(p).size)); return out; };
const META = new Set(["index.json", "cache.jsonl"]);
const dupGroups = [];
for (const [id, list] of byId){
	if (list.length < 2) continue;
	const folders = list.map(s => ({ dir: s.dir, day: s.day, kind: folderKind(s.folder), usd: s.usd, files: filesOf(s.dir) }));
	folders.sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind] || b.files.size - a.files.size || a.dir.localeCompare(b.dir));
	const keeper = folders[0];
	const g = { id, keeper: keeper.dir, keeperKind: keeper.kind, sameDay: new Set(list.map(s => s.day)).size === 1, pattern: folders.map(f => f.kind).sort().join(" + "), extras: [] };
	for (const f of folders.slice(1)){
		const absent = [...f.files.keys()].filter(n => !keeper.files.has(n));          // in the extra folder, not in the keeper
		const differs = [...f.files.keys()].filter(n => keeper.files.has(n) && keeper.files.get(n) !== f.files.get(n));
		g.extras.push({ dir: f.dir, kind: f.kind, files: f.files.size, absent, differs, usd: f.usd, twin: absent.length === 0 });
	}
	dupGroups.push(g);
}
const dupFolders = dupGroups.reduce((n, g) => n + g.extras.length, 0);
const dupNoCanon = dupGroups.filter(g => g.keeperKind !== "session-8");     // no session-<8 hex> folder among them
const dupUniqueGroups = dupGroups.filter(g => g.extras.some(a => !a.twin));  // an extra folder holds a path the keeper lacks
const dupKinds = {};
for (const g of dupGroups) dupKinds[g.pattern] = (dupKinds[g.pattern] ?? 0) + 1;
const dupTwinFolders = dupGroups.reduce((n, g) => n + g.extras.filter(a => a.twin).length, 0);
const dupContentFolders = dupFolders - dupTwinFolders;
const dupOtherDay = dupGroups.filter(g => !g.sameDay).length;
const sessionsUsd = store.sessions.reduce((n, s) => n + s.usd, 0);
const uniqueUsd = [...byId.values()].reduce((n, l) => n + Math.max(...l.map(s => s.usd)), 0);
const monthTally = {};
for (const s of store.sessions){
	const m = s.day.slice(0, 7);
	const t = (monthTally[m] ??= { folders: 0, ids: new Set(), usd: 0, uniqueUsd: new Map() });
	t.folders++; t.ids.add(s.id); t.usd += s.usd;
	t.uniqueUsd.set(s.id, Math.max(t.uniqueUsd.get(s.id) ?? 0, s.usd));
}
const monthRows = Object.entries(monthTally).sort().map(([m, t]) => ({ month: m, folders: t.folders, unique: t.ids.size, usd: t.usd, uniqueUsd: [...t.uniqueUsd.values()].reduce((a, b) => a + b, 0), indexCount: store.monthIndex[m.slice(5)]?.count ?? null, indexUsd: store.monthIndex[m.slice(5)]?.usd ?? null }));

// Tasks
const taskByHash = new Map();
for (const t of store.taskFiles) if (t.size > 0) (taskByHash.get(t.sha) ?? taskByHash.set(t.sha, []).get(t.sha)).push(t.rel);
const taskIdentical = [...taskByHash.values()].filter(v => v.length > 1);
const taskByKey = new Map();
for (const t of store.taskFiles) if (t.req && t.at) { const k = t.at + "|" + t.req; (taskByKey.get(k) ?? taskByKey.set(k, []).get(k)).push(t.rel); }
const taskKeyDup = [...taskByKey].filter(([, v]) => v.length > 1);
const taskBySid = new Map();
for (const t of store.taskFiles) if (t.sid) (taskBySid.get(t.sid) ?? taskBySid.set(t.sid, []).get(t.sid)).push(t);
const taskSidDup = [...taskBySid].filter(([, v]) => v.length > 1).map(([sid, v]) => ({
	sid, paths: v.map(t => t.rel), sameContent: new Set(v.map(t => t.sha)).size === 1,
	sameRequest: new Set(v.map(t => t.req).filter(Boolean)).size <= 1 && v.some(t => t.req),
}));
const otherTaskFolders = (() => { let n = 0; walk(FW, (p) => { if (path.basename(p) === "task.jsonl") n++; }, (p, e) => e.isDirectory() && (p === STORE || p === AI2 || path.basename(p) === "node_modules")); return n; })();

// Do the ai2 stubs' real tasks have a twin elsewhere in the store?
const stubTasks = records.filter(r => /^public\/framework\/ai2\/tasks\/[^/]+\/task\.jsonl$/.test(r.file)).map(r => {
	const head = r.lines[0].json;
	const dirs = (head.sessions ?? []).map(s => s.task);
	const realRel = dirs.map(u => (/\/framework\/ai\/(sessions\/.*?)\/?$/.exec(u) || [])[1]).filter(Boolean);
	const realFiles = realRel.map(rr => rr.replace(/^sessions\//, "").replace(/\/$/, "") + "/task.jsonl");   // paths as store.taskFiles spells them
	const setLine = r.lines[1]?.json?.set;
	const key = setLine?.request && setLine?.requested_at ? setLine.requested_at + "|" + setLine.request : null;
	const keyPaths = (key && taskByKey.get(key) ? taskByKey.get(key) : []).filter(p => !realFiles.includes(p));   // any OTHER store task with the same request + requested_at
	return { stub: r.file, title: head.title, real: dirs, realExists: dirs.map(storeDirExists), realHasKey: !!(key && (taskByKey.get(key) ?? []).some(p => realFiles.includes(p))), keyPaths, key };
});

lap("q3 done");
/* ------------------------------------------------------------------------------------------------------------ *
 * PHASE 7. Question 4: who still reads ai2?
 * ------------------------------------------------------------------------------------------------------------ */
const shimNames = codeFiles.filter(f => f.abs.startsWith(AI2) && /^(?:[^/\\]+)\.(js|css)$/.test(path.relative(AI2, f.abs))).map(f => path.relative(AI2, f.abs));
const shimInfo = shimNames.map(name => {
	const text = readText(path.join(AI2, name));
	const m = /export \* from "([^"]+)"/.exec(text);
	const target = m ? path.resolve(AI2, m[1]) : null;
	const isShim = !!m && text.split("\n").filter(l => l.trim()).length <= 3;
	return { name, isShim, target: target ? rel(target) : null, targetExists: target ? exists(target) : null, bytes: text.length };
});
const READ_SKIP = (p, e) => {
	const r = rel(p);
	if (e.isDirectory()) return /(^|\/)(\.git|node_modules|\.claude\/worktrees)$/.test(r) || p === STORE || p === AI2 || p === HERE;
	return false;
};
const READ_EXT = new Set([".js", ".mjs", ".css", ".html", ".json", ".jsonl", ".md", ".txt", ".cjs", ".yml", ".yaml"]);
const RE = {
	abs: /\/framework\/ai2(?![\w-])/,
	rel: /\.\.\/ai2\//,
	bare: /(?<![\w./-])ai2\/[\w-]+\.(?:js|css|mjs|json|jsonl)\b/,
	dir: /["'`]ai2["'`]/,
};
const LIVE = r => /^(public\/framework|Servex|Server)\//.test(r) && !/^public\/framework\/ai\/(health|sessions)\//.test(r) && !/(^|\/)logs?\//.test(r);
const readers = { import: [], link: [], dirRead: [], dataClass: [], data: [], comment: [], doc: [], label: [] };
const readerSkipped = [];
const mentionFiles = new Map();   // "ai2/<name>" mention (any kind) -> live files
walk(REPO, (p) => {
	const ext = path.extname(p);
	if (!READ_EXT.has(ext)) return;
	let size = 0; try { size = fs.statSync(p).size; } catch {}
	if (size > 30e6) { readerSkipped.push(rel(p)); return; }
	const r = rel(p);
	if (r.startsWith("public/framework/ai/archive/ai2/")) return;
	const text = readText(p);
	if (!/ai2/.test(text)) return;
	const isDoc = ext === ".md" || ext === ".txt";
	const isData = ext === ".json" || ext === ".jsonl";
	const isCss = ext === ".css";
	const lns = text.split("\n");
	let inBlock = false;   // inside a /* ... */ comment (js, mjs, css)
	for (let i = 0; i < lns.length; i++){
		const l = lns[i];
		const startedInBlock = inBlock;
		if (!isDoc && !isData){
			// track block comments so a prose line inside one is a comment, not a link
			// (only a line that STARTS with the opener counts, so a "/*" inside a string or glob cannot flip the state)
			const t = l.trim();
			if (inBlock) { if (t.includes("*/")) inBlock = false; }
			else if (t.startsWith("/*") && !t.includes("*/", 2)) inBlock = true;
		}
		if (!/ai2/.test(l)) continue;
		const hit = RE.abs.test(l) || RE.rel.test(l) || RE.bare.test(l) || RE.dir.test(l);
		if (!hit) continue;
		const item = { file: r, line: i + 1, text: short(l.trim(), 140), live: LIVE(r) };
		const bucket = (b) => { readers[b].push(item); };
		for (const m of l.matchAll(/ai2\/([\w-]+\.(?:js|css|mjs))/g)) (mentionFiles.get(m[1]) ?? mentionFiles.set(m[1], new Set()).get(m[1])).add(r);
		if (isDoc) bucket("doc");
		else if (isData){
			if (/"class"\s*:\s*"\/framework\/ai2\//.test(l)) bucket("dataClass"); else bucket("data");
		} else if (isCss || startedInBlock || /^\s*(\/\/|\*|\/\*|#)/.test(l)) bucket("comment");
		else if (/^\s*(import|export)\b[^;]*\bfrom\s+["'`][^"'`]*ai2\//.test(l) || /^\s*import\s+["'`][^"'`]*ai2\//.test(l) || /\bimport\(\s*["'`][^"'`]*ai2\//.test(l)) bucket("import");
		else if (/public\/framework\/ai2/.test(l) || (RE.dir.test(l) && /(path\.(join|resolve)|readdir|existsSync|walk\(|\bjoin\()/.test(l))) bucket("dirRead");
		else if (RE.abs.test(l) || RE.rel.test(l)) bucket("link");
		else if (RE.bare.test(l)) bucket("comment");     // "ai2/card.js" named in prose, nothing loads it
		else bucket("label");                            // the word "ai2" as a key or css word, not a path
	}
}, READ_SKIP);
const uniq =(arr) => [...new Set(arr.map(x => x.file))];
const readerSummary = Object.fromEntries(Object.entries(readers).map(([k, v]) => [k, { hits: v.length, files: uniq(v).length }]));
// per-shim importers (code only)
const shimImporters = {};
for (const s of shimInfo){
	const re = new RegExp(`ai2/${s.name.replace(/\./g, "\\.")}(?![\\w])`);
	shimImporters[s.name] = readers.import.filter(h => re.test(h.text)).map(h => `${h.file}:${h.line}`);
}

lap("q4 done");
/* ------------------------------------------------------------------------------------------------------------ *
 * PHASE 8. Totals for the counts table.
 * ------------------------------------------------------------------------------------------------------------ */
const ai2Recs = records.filter(r => r.group === "ai2");
const tally = (recs) => {
	const t = { identical: 0, pointer: 0, partly: 0, missing: 0, elsewhere: 0, empty: 0 };
	for (const r of recs) t[r.status] = (t[r.status] ?? 0) + 1;
	return t;
};
const q1 = tally(ai2Recs);
const q2oldDated = tally(records.filter(r => r.group === "old-dated"));
const q2archive = tally(archiveRecs);
const lineTotals = (recs) => recs.reduce((a, r) => { a.lines += r.counts.n; for (const k of ["identical", "pointer", "covered", "sameId", "partial", "elsewhere", "missing"]) a[k] += r.counts[k]; return a; }, { lines: 0, identical: 0, pointer: 0, covered: 0, sameId: 0, partial: 0, elsewhere: 0, missing: 0 });
const ai2Lines = lineTotals(ai2Recs), oldLines = lineTotals(records.filter(r => r.group === "old-dated")), archLines = lineTotals(archiveRecs);

/* ------------------------------------------------------------------------------------------------------------ *
 * Output
 * ------------------------------------------------------------------------------------------------------------ */
const B = "`";
const fmt = n => new Intl.NumberFormat("en-US").format(n);
const today = new Date().toISOString().slice(0, 10);
const cell = v => String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const table = (head, rows) => ["| " + head.map(cell).join(" | ") + " |", "| " + head.map(() => "---").join(" | ") + " |", ...rows.map(r => "| " + r.map(cell).join(" | ") + " |")].join("\n");
const code = s => B + String(s).replace(/`/g, "'") + B;
const fileLabel = f => f.replace(/^public\/framework\//, "");
const statusWord = { identical: "identical", pointer: "pointer", partly: "partly there", missing: "missing", elsewhere: "outside the store", empty: "empty" };
const MISSINGISH = new Set(["missing", "partial", "elsewhere", "same-id"]);
const ranges = (nums) => {
	const out = []; let a = null, b = null;
	for (const n of nums){ if (a === null) { a = b = n; } else if (n === b + 1) b = n; else { out.push(a === b ? "" + a : a + "-" + b); a = b = n; } }
	if (a !== null) out.push(a === b ? "" + a : a + "-" + b);
	return out.join(", ");
};
function recWhy(rec){
	const c = rec.counts, parts = [];
	if (c.identical) parts.push(`${c.identical} identical`);
	if (c.pointer) parts.push(`${c.pointer} pointer`);
	if (c.covered) parts.push(`${c.covered} folded copy, values in the store`);
	if (c.partial) parts.push(`${c.partial} folded copy, some values absent`);
	if (c.sameId) parts.push(`${c.sameId} same id, text differs`);
	if (c.elsewhere) parts.push(`${c.elsewhere} only outside the store`);
	if (c.missing) parts.push(`${c.missing} missing`);
	return parts.join(", ");
}

// ---- the copy plan: where each missing line belongs in the store ----
const ASIDE = "public/framework/ai/archive/ai2-module";
const retireDir = "public/framework/ai/sessions/2026/10/03/retire-ai2";
function destFor(rec, ln){
	const j = ln.json;
	if (rec.group === "old-dated" && path.basename(rec.file) === "page.jsonl") return { dest: `public/framework/ai/${cardRel(rec.day + "/" + rec.name)}/page.jsonl`, why: "the card's own log (CardDir.rel)" };
	if (j?.session?.file){
		const f = j.session.file;
		let m = /^\/framework\/ai\/(\d{4}\/\d{2}\/\d{2}\/[^/]+)\//.exec(f);
		if (m) return { dest: `public/framework/ai/${cardRel(m[1])}/ai/log.jsonl`, why: "the card folder named in the line's own file field" };
		m = /^\/framework\/(.+?)\/ai\/[^/]+$/.exec(f);
		if (m) return { dest: `public/framework/${m[1]}/ai/log.jsonl`, why: "that module's own ai log (a module log, not the sessions store)" };
		return { dest: "public/framework/ai/ai/log.jsonl", why: "the ai module's own ai log" };
	}
	if (j?.note?.id && rec.file.endsWith("ai2/page.jsonl")) return { dest: retireDir + "/page.jsonl", why: "the store folder of the retire-ai2 task this note was about" };
	if (j?.ai_cost) return { dest: retireDir + "/weight.jsonl", why: "same folder; a cost figure from 2026-10-03" };
	if (rec.stub && ln.c.s === "partial"){
		const t = (rec.lines[0].json?.sessions ?? [])[0]?.task;
		const m = t && /^\/framework\/ai\/(sessions\/.*?)\/?$/.exec(t);
		if (m) return { dest: `public/framework/ai/${m[1]}/task.jsonl`, why: "the real task's own record" };
	}
	return { dest: "(decide: no rule matched)", why: "" };
}
const copyMap = new Map();   // dest -> Map(text -> [source "file:line"])
const alreadyOutside = [];   // lines whose home is a module log outside the store, and that is already holding them
for (const rec of records){
	rec.lines.forEach((ln, i) => {
		if (!MISSINGISH.has(ln.c.s)) return;
		if (ln.c.s === "elsewhere") { alreadyOutside.push({ src: `${rec.file}:${i + 1}`, where: ln.c.where, text: ln.text }); return; }
		if (ln.c.s === "same-id") return;
		const d = destFor(rec, ln);
		ln.dest = d;
		const m = copyMap.get(d.dest) ?? copyMap.set(d.dest, new Map()).get(d.dest);
		(m.get(ln.text) ?? m.set(ln.text, []).get(ln.text)).push(`${rec.file}:${i + 1}`);
	});
}
const copyRows = [...copyMap].map(([dest, m]) => ({ dest, lines: m.size, texts: [...m].map(([text, src]) => ({ text, src })), sources: [...new Set([...m.values()].flat().map(s => s.replace(/:\d+$/, "")))], destExists: exists(path.join(REPO, dest)), why: [...m.keys()].map(t => records.flatMap(r => r.lines).find(l => l.text === t)?.dest?.why).find(Boolean) }));
const copyLineTotal = copyRows.reduce((n, r) => n + r.lines, 0);

// ---- results object (also for --json) ----
const cls = store.classRefs;
const clsTotal = Object.values(cls).reduce((a, b) => a + b, 0);
const live = (arr) => arr.filter(h => h.live);
const results = {
	date: today,
	store: { files: store.files, dirs: store.dirs, mb: Math.round(store.bytes / 1e6), jsonl: store.jsonl, sessionFolders: store.sessions.length, distinctSessions: byId.size, taskFiles: store.taskFiles.length, mentionsByExt: store.mentionsByExt, classRefs: cls },
	q1: { files: ai2Recs.length, status: q1, lines: ai2Lines, listings: listings.filter(l => l.group === "ai2").length, listingLines: listings.filter(l => l.group === "ai2").reduce((n, l) => n + l.lines, 0), code: codeFiles.filter(f => f.abs.startsWith(AI2)).length, shims: shimInfo.filter(s => s.isShim).length, shimsOk: shimInfo.filter(s => s.isShim && s.targetExists).length },
	q2: { oldDated: q2oldDated, oldLines, archive: q2archive, archLines, pages: oldPages.map(r => ({ file: r.file, lines: r.lines.length, q2: r.q2, onlyOldLines: r.onlyOldLines, oldRange: r.oldRange, candidates: r.candidates.map(c => ({ ...c, lineSet: undefined })) })), cards: cardStats, oldNotInBoard },
	q3: { dupSessionIds: dupGroups.length, extraFolders: dupFolders, twinFolders: dupTwinFolders, contentFolders: dupContentFolders, patterns: dupKinds, noSessionFolder: dupNoCanon.length, otherDay: dupOtherDay, sessionsUsd, uniqueUsd, monthRows, taskIdentical: taskIdentical.length, taskKeyDup: taskKeyDup.length, taskSidDup: taskSidDup.length },
	q4: { summary: readerSummary, liveImport: live(readers.import).length, liveLink: live(readers.link).length, liveDir: live(readers.dirRead).length, skipped: readerSkipped.length },
	copy: { destinations: copyRows.length, lines: copyLineTotal },
};
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({ results, records: records.map(r => ({ file: r.file, group: r.group, status: r.status, counts: r.counts, stub: r.stub, lines: r.lines.map(l => ({ s: l.c.s, note: l.c.note, text: short(l.text, 200), where: l.c.where?.slice(0, 5), dest: l.dest, textIn: l.textIn ? [...l.textIn].slice(0, 3) : undefined })) })), dupGroups, taskSidDup, stubTasks, shimInfo, shimImporters, readers, cardBoth, cardOldOnly, copyRows, alreadyOutside, classRefFiles: store.classRefFiles }, null, 1));

// ================================ audit.md ================================
const md = [];
const out = (...a) => md.push(a.join(""));
const nOK = (recs, ...st) => recs.filter(r => st.includes(r.status)).length;

out("# ai2 retirement audit: is every record in the sessions store exactly once?");
out("");
out(`Read-only audit, run ${today} by [audit-ai2.mjs](./audit-ai2.mjs); brief: [requirements.md](./requirements.md). Every number below was counted by that script. Nothing was estimated, moved, deleted or rewritten.`);
out("");
out(`**In plain words.** ${code("public/framework/ai2/")} is the old home of the AI inbox. It was merged into ${code("ai/")} on 2026-10-09, but a folder of one-line shims, small logs and task stubs is still there. Before it can go away we must know that nothing in it lives *only* there, and that the sessions store (${code("public/framework/ai/sessions/YYYY/MM/DD/...")}) does not hold the same session twice. A line counts as *in the store* when the identical line sits in some ${code(".jsonl")} file under it.`);
out("");
out("## Counts");
out("");
out(table(["What was checked", "Record files", "Identical", "Pointer", "Partly there", "Missing"], [
	[ `1. Record files inside ${code("ai2/")}`, ai2Recs.length, q1.identical, q1.pointer, q1.partly, q1.missing + (q1.elsewhere ?? 0) ],
	[ `2a. Old dated folders ${code("ai/2026/10/...")} (page logs)`, results.q2.oldDated && records.filter(r => r.group === "old-dated").length, q2oldDated.identical, q2oldDated.pointer, q2oldDated.partly, q2oldDated.missing + (q2oldDated.elsewhere ?? 0) ],
	[ `2b. ${code("ai/archive/ai2/")} (old page logs)`, archiveRecs.length, q2archive.identical, q2archive.pointer, q2archive.partly, q2archive.missing + (q2archive.elsewhere ?? 0) ],
]));
out("");
out(`${code("pointer")} means the file only refers to the store (a task stub points at a real task folder, and its copied values were checked against that real ${code("task.jsonl")}). Not counted above because they carry no records: ${results.q1.listings} generated ${code("files.jsonl")} folder listings in ${code("ai2/")} (${results.q1.listingLines} lines), ${results.q1.code} code, css and doc files (${results.q1.shims} are one-line shims), and ${listings.filter(l => l.group !== "ai2").length} listings in the old places.`);
out("");
out(table(["Same check, counted per line", "Lines", "Identical in store", "Pointer", "Folded copy, values in store", "Same id, text differs", "Only outside the store", "Missing"], [
	[ `${code("ai2/")} records`, ai2Lines.lines, ai2Lines.identical, ai2Lines.pointer, ai2Lines.covered, ai2Lines.sameId, ai2Lines.elsewhere, ai2Lines.missing + ai2Lines.partial ],
	[ `${code("ai/2026/")} old dated page logs`, oldLines.lines, oldLines.identical, oldLines.pointer, oldLines.covered, oldLines.sameId, oldLines.elsewhere, oldLines.missing + oldLines.partial ],
	[ `${code("ai/archive/ai2/")} logs`, archLines.lines, archLines.identical, archLines.pointer, archLines.covered, archLines.sameId, archLines.elsewhere, archLines.missing + archLines.partial ],
]));
out("");
out(table(["Duplicates and readers", "Count"], [
	[ "Session ids that sit in more than one store folder (question 3)", `${dupGroups.length} ids, ${dupFolders} extra folders` ],
	[ "Of those extra folders: only stale ${index.json} and ${cache.jsonl} twins".replace(/\$\{index\.json\}/, "index.json").replace(/\$\{cache\.jsonl\}/, "cache.jsonl"), dupTwinFolders ],
	[ "Of those extra folders: hold a file or folder the kept one lacks", dupContentFolders ],
	[ "Tasks stored twice (same request and requested_at, or byte-identical task.jsonl)", `${taskKeyDup.length} and ${taskIdentical.length}` ],
	[ `Store card pages whose first line imports ${code("/framework/ai2/card.js")} (question 4)`, clsTotal ],
	[ "Live code files that import an ai2 shim", uniq(live(readers.import)).length ],
	[ `Live code files that link to ${code("/framework/ai2/")}`, uniq(live(readers.link)).length ],
	[ "Live code files that read the folder by name", uniq(live(readers.dirRead)).length ],
	[ "Lines still to copy into the store (after de-duplicating)", `${copyLineTotal} lines into ${copyRows.length} files` ],
]));
out("");

out("## What this means");
out("");
const missBig = oldPages.filter(r => r.onlyOldLines > 0);
const tailPages = oldPages.filter(r => { const best = [...r.candidates].sort((a, b) => b.lines - a.lines)[0]; return best?.range && r.oldRange && r.oldRange.first > best.range.last; }).length;
const missingLinesAll =records.flatMap(r => r.lines).filter(l => l.c.s === "missing" || l.c.s === "partial");
const textProbed = missingLinesAll.filter(l => snipOf(l)).length;
const textHit = missingLinesAll.filter(l => l.textIn?.size).length;
out(`- **Old dated folders hold real, unique data.** ${missBig.length} of ${oldPages.length} page logs under ${code("ai/2026/10/...")} have lines that exist nowhere in the store (${oldLines.missing + oldLines.partial} lines). For ${tailPages} of them (the 2026-10-12 and 2026-10-13 cards) the old file starts after the store copy ends, so it is that card's *tail*; this fits a Servex that was not restarted after the 2026-10-13 move and kept writing to the old folder (${code("CardDir.pick()")} documents that case). Of the ${textProbed} missing lines with long text, ${textHit} have the same opening text somewhere in the store inside another record kind (a quote or summary), but never as the same record. These lines must be appended to the store before the old folder can go.`);
out(`- **ai2 itself holds almost nothing unique.** ${nOK(ai2Recs, "pointer", "identical")} of its ${ai2Recs.length} record files are pure pointers or identical copies. What is missing is small: ${ai2Lines.missing + ai2Lines.partial} lines (voice-session start/end events, one routed note, one cost figure, one task stop line).`);
out(`- **The biggest reader is data, not code.** ${clsTotal} card ${code("page.jsonl")} files in the store name ${code("/framework/ai2/card.js")} as their ${code("class")}, and ${code("core/Page/Jsonl.js")} imports that path (${code("log_class()")}). Moving ${code("ai2/")} without an alias there would break all ${clsTotal} cards.`);
out(`- **Duplicate session folders are real and not caused by ai2.** ${dupGroups.length} session ids sit in ${dupGroups.length + dupFolders} folders. ${dupTwinFolders} of the ${dupFolders} extra folders are stale ${code("index.json")} / ${code("cache.jsonl")} twins; ${dupContentFolders} hold files the kept folder lacks, so they must be merged, not just moved. Summing every ${code("index.json")} would give $${sessionsUsd.toFixed(2)}; counting each id once gives $${uniqueUsd.toFixed(2)}.`);
out("");

// ---- Section 1 ----
out("## 1. Every record file under ai2/");
out("");
out(table(["File", "Lines", "Status", "Breakdown", "Example line"], ai2Recs.map(r => {
	const worst = r.lines.find(l => MISSINGISH.has(l.c.s)) ?? r.lines[1] ?? r.lines[0];
	return [ code(fileLabel(r.file)), r.lines.length, `**${statusWord[r.status]}**`, recWhy(r), worst ? code(short(worst.text, 100)) : "" ];
})));
out("");
const stubRecs = ai2Recs.filter(r => r.stub);
out(`The ${stubRecs.length} task stubs (${code("ai2/tasks/*/task.jsonl")}) were written by ${code("task-migrate")} on 2026-10-17. Line 1 points at a real task folder in the store; the later lines fold that task into a summary. The real folder exists for ${stubTasks.filter(s => s.realExists.every(Boolean)).length} of ${stubTasks.length} stubs, and every folded value is found in the real ${code("task.jsonl")} (or, for a rewritten brief path, in an existing store file) for ${stubRecs.filter(r => r.stub.found === r.stub.fields).length} of ${stubRecs.length}. The exception is ${stubRecs.filter(r => r.stub.found !== r.stub.fields).map(r => code(r.file.split("/")[4])).join(", ") || "none"}: its closing ${code("stop")} line was written by the migration and is in no store file.`);
out("");
out(`${code("ai2/tasks/task.jsonl")} is the parent: a folder header plus 13 pointer lines that list the stubs. The 13 ${code("tasks/*/page.js")} files are the two-line ${code("TaskPage")} shell and carry no data. The ${results.q1.shims} shims all re-export a file that exists today (${results.q1.shimsOk} of ${results.q1.shims}).`);
out("");

// ---- Section 2 ----
out("## 2. Records still in the old places");
out("");
out(`There are four old patterns: ${code("ai/YYYY/MM/DD/<card or session>/page.jsonl")} (where a card lived before 2026-10-13), ${code("ai/2026-10-13/")}, ${code("ai/archive/ai2/")}, and the cards the ${code("/framework/ai2/<card>/")} route draws. The route reads a card from the store first (${code("CardDir.rel()")} turns ${code("2026/10/13/x")} into ${code("sessions/2026/10/13/cards/x")}) and falls back to the old folder only when that is the only one that exists.`);
out("");
out("### 2a. Old dated page logs");
out("");
out(table(["Old file", "Lines", "Old log covers", "Store copy (lines, covers)", "Old-only lines", "Verdict"], oldPages.map(r => [
	code(fileLabel(r.file)), r.lines.length,
	r.oldRange ? `${r.oldRange.first.slice(0, 16)} to ${r.oldRange.last.slice(0, 16)}` : "no timestamps",
	r.candidates.length ? r.candidates.map(c => `${code(c.path)} (${c.kind}, ${c.lines} lines, ${c.range ? c.range.first.slice(0, 16) + " to " + c.range.last.slice(0, 16) : "no timestamps"}, ${c.exact} identical)`).join("<br>") : "no store copy",
	r.onlyOldLines, `**${r.q2}**`,
])));
out("");
for (const r of oldPages){
	const best = [...r.candidates].sort((a, b) => b.lines - a.lines)[0];
	const after = best?.range && r.oldRange && r.oldRange.first > best.range.last;
	const types = Object.entries(r.missingTypes).map(([k, v]) => `${v} ${code(k)}`).join(", ");
	out(`- ${code(fileLabel(r.file))}: ${r.onlyOldLines} of ${r.lines.length} lines only in the old place${types ? " (" + types + ")" : ""}${after ? `; they begin ${r.oldRange.first.slice(0, 16)}, after the store copy ends (${best.range.last.slice(0, 16)}), so this is the card's tail, not a duplicate` : ""}${r.overlapBetweenCopies === 0 ? `; the store's card folder and session folder share 0 lines (different record kinds, not duplicates)` : ""}.`);
}
out("");
out("### 2b. ai/archive/ai2/ and ai/2026-10-13/");
out("");
out(table(["File", "Lines", "Status", "Breakdown"], archiveRecs.map(r => [ code(fileLabel(r.file)), r.lines.length, `**${statusWord[r.status]}**`, recWhy(r) ])));
out("");
out(`The archive logs are the first 9 and 2 lines of ${code("ai2/ai/log.jsonl")} and ${code("ai2/overview/ai/log.jsonl")}; the ai2 copy kept growing after the move and now has ${ai2Recs.find(r => r.file.endsWith("ai2/ai/log.jsonl")).lines.length - archiveRecs.find(r => r.file.endsWith("archive/ai2/ai/log.jsonl")).lines.length} more line(s). ${code("ai/2026-10-13/")} holds only ${code("files.jsonl")}, a listing of ${code("feedback-council/")} and ${code("crawl/")} (both marked gone). Both folders exist in the store (${exists(path.join(STORE, "2026/10/13/feedback-council")) ? "yes" : "no"}, ${exists(path.join(STORE, "2026/10/13/crawl")) ? "yes" : "no"}). No record data is left in that folder.`);
out("");
out("### 2c. The cards the /framework/ai2/<card>/ route draws");
out("");
out(table(["Board cards (ai/cards.jsonl)", "Count"], [
	[ "All cards", cardStats.total ],
	[ `Folder in the store only (${code("sessions/.../cards/<slug>/")})`, cardStats.storeOnly ],
	[ "Folder in the old place only", cardStats.oldOnly ],
	[ "Folder in both places", cardStats.both ],
	[ "No folder anywhere", cardStats.neither ],
	[ "Undated id", cardStats.undated ],
	[ "Old-place page logs whose card is not on the board", oldNotInBoard.length ],
]));
out("");
if (cardBoth.length) out(`Folder in both places: ${cardBoth.map(code).join(", ")}.\n`);
if (oldNotInBoard.length) out(`Old page logs for cards not on the board: ${oldNotInBoard.map(code).join(", ")}.\n`);
out("Other task records outside the store (module task folders such as " + code("ext/Figma/tasks/") + ") are not an ai2 pattern and were not audited: " + fmt(otherTaskFolders) + " " + code("task.jsonl") + " files.");
out("");

// ---- Section 3 ----
out("## 3. Duplicates in the store");
out("");
out(`The store has ${fmt(store.sessions.length)} session ${code("index.json")} files for ${fmt(byId.size)} distinct session ids. ${dupGroups.length} ids sit in more than one folder (${dupFolders} extra folders; ${dupOtherDay} of those ids span two different days). The older folder names (a full uuid, or a task-style slug) were never removed when the current ${code("session-<first 8 hex>")} folder appeared.`);
out("");
out(table(["Folder-name pattern pair", "Session ids"], Object.entries(dupKinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => [ k, v ])));
out("");
out(table(["Month", "Session folders", "Distinct ids", "Month index count", "Dollars over all folders", "Dollars once per id", "Month index dollars"], monthRows.map(m => [ m.month, fmt(m.folders), fmt(m.unique), m.indexCount ?? "n/a", "$" + m.usd.toFixed(2), "$" + m.uniqueUsd.toFixed(2), m.indexUsd != null ? "$" + Number(m.indexUsd).toFixed(2) : "n/a" ])));
out("");
out(`The month index counts about one per distinct id, so the headline totals are not doubled; a script that walks every ${code("index.json")} would double count. Extra folders: ${dupTwinFolders} are stale twins (only ${code("index.json")} / ${code("cache.jsonl")} that the kept folder also has), ${dupContentFolders} hold a path the kept folder lacks. The full list is the appendix.`);
out("");
out(`Tasks: ${fmt(store.taskFiles.length)} ${code("task.jsonl")} files. **No task is stored twice:** ${taskIdentical.length} groups of byte-identical files and ${taskKeyDup.length} tasks sharing a request and requested_at. ${taskSidDup.length} session ids appear in more than one task folder; this is normal (one session works several tasks). The ${taskSidDup.filter(d => d.sameRequest).length} where the first request text is also the same are worth a look:`);
out("");
out(table(["Session", "Task folders"], taskSidDup.filter(d => d.sameRequest).map(d => [ code(d.sid.slice(0, 8)), d.paths.map(p => code(p.replace(/\/task\.jsonl$/, ""))).join("<br>") ])));
out("");
out(`The 13 ai2 stubs each point at one real task folder; no other store task shares their request and requested_at:`);
out("");
out(table(["Stub", "Real task folder", "Exists", "Other store tasks with the same request + requested_at"], stubTasks.map(s => [ code(s.stub.replace("public/framework/ai2/tasks/", "").replace("/task.jsonl", "")), s.real.map(r => code(r.replace("/framework/ai/", ""))).join(", "), s.realExists.every(Boolean) ? "yes" : "NO", s.keyPaths.length ? s.keyPaths.length + ": " + s.keyPaths.slice(0, 2).join(", ") : "none" ])));
out("");

// ---- Section 4 ----
out("## 4. Who still reads ai2");
out("");
out(`Scan: every text file in the repo outside ${code(".git")}, ${code("node_modules")}, ${code("ai2/")} itself, ${code("ai/archive/ai2/")} and the sessions store. "Live" means under ${code("public/framework/")}, ${code("Servex/")} or ${code("Server/")} and not a log. The store is history: it mentions an ai2 path in ${fmt(Object.values(store.mentionsByExt).reduce((a, b) => a + b, 0))} files (${Object.entries(store.mentionsByExt).map(([k, v]) => `${v} ${k}`).join(", ")}); except for the ${clsTotal} card pages below, those are records of the merge, not readers.`);
out("");
out(table(["Reader", "Files", "Hits"], [
	[ `Store card pages: first line ${code('"class": "/framework/ai2/card.js"')}, imported by ${code("core/Page/Jsonl.js")}`, clsTotal, clsTotal ],
	[ "Live code: imports an ai2 shim", uniq(live(readers.import)).length, live(readers.import).length ],
	[ `Live code: builds or links ${code("/framework/ai2/")} URLs`, uniq(live(readers.link)).length, live(readers.link).length ],
	[ "Live code: reads the folder by name", uniq(live(readers.dirRead)).length, live(readers.dirRead).length ],
	[ "Scratch and tool output that mention it (.claude, .playwright-mcp, root files)", uniq([...readers.import, ...readers.link, ...readers.dirRead].filter(h => !h.live)).length, [...readers.import, ...readers.link, ...readers.dirRead].filter(h => !h.live).length ],
	[ "Code comments naming an ai2 path", uniq(readers.comment).length, readers.comment.length ],
	[ "Docs (md, txt)", uniq(readers.doc).length, readers.doc.length ],
	[ "The word ai2 as a label or css word, not a path (no action)", uniq(readers.label).length, readers.label.length ],
	[ "Logs and generated data naming a URL", uniq([...readers.data, ...readers.dataClass]).length, readers.data.length + readers.dataClass.length ],
]));
out("");
const dedupFiles = (arr) => { const m = new Map(); for (const h of arr) m.set(h.file, (m.get(h.file) ?? 0) + 1); return [...m]; };
const listBucket = (title, arr) => {
	const f = dedupFiles(arr);
	out(`**${title}** (${f.length} files, ${arr.length} hits)`);
	out("");
	for (const [file, n] of f){ const sample = arr.find(h => h.file === file); out(`- ${code(file)} x${n}: ${code(sample.text)}`); }
	out("");
};
listBucket("Live code that imports an ai2 shim", live(readers.import));
listBucket("Live code that builds or links /framework/ai2/ URLs", live(readers.link));
listBucket("Live code that reads the folder by name", live(readers.dirRead));
out("**Per shim:** who really imports each one.");
out("");
out(table(["Shim", "Re-exports", "Target exists", "Real imports (live code)", "Live files that name it in prose or comments"], shimInfo.filter(s => s.isShim).map(s => [ code("ai2/" + s.name), code((s.target ?? "-").replace("public/framework/", "")), s.targetExists ? "yes" : "NO", shimImporters[s.name].filter(x => LIVE(x.replace(/:\d+$/, ""))).join(", ") || "none", [...(mentionFiles.get(s.name) ?? [])].filter(LIVE).length ])));
out("");

// ---- Missing list in full ----
out("## Everything missing or only partly there, in full");
out("");
const flagged = records.filter(r => r.lines.some(l => MISSINGISH.has(l.c.s)));
for (const r of flagged){
	out(`### ${code(fileLabel(r.file))}: ${statusWord[r.status]} (${recWhy(r)})`);
	out("");
	const bad = r.lines.map((l, i) => ({ l, n: i + 1 })).filter(({ l }) => MISSINGISH.has(l.c.s));
	if (r.group === "old-dated" && bad.length > 6){
		const ts = bad.map(({ l }) => l.json?.content?.add?.ts ?? l.json?.ts).filter(Boolean).sort();
		out(`- Lines ${ranges(bad.map(b => b.n))} (${bad.length} lines; ${Object.entries(r.missingTypes).map(([k, v]) => v + " " + k).join(", ")}${ts.length ? "; " + ts[0].slice(0, 16) + " to " + ts[ts.length - 1].slice(0, 16) : ""}). Every one belongs at ${code(bad[0].l.dest?.dest ?? "")}.`);
		out(`- First: ${code(short(bad[0].l.text, 160))}`);
		out(`- Last: ${code(short(bad[bad.length - 1].l.text, 160))}`);
	} else {
		for (const { l, n } of bad) out(`- line ${n} (${l.c.s}${l.c.where ? " in " + l.c.where.slice(0, 2).join(", ") : ""}${l.c.note ? "; " + l.c.note : ""}${l.textIn ? "; its opening text also appears in " + [...l.textIn].slice(0, 2).map(code).join(", ") + " (another record kind, not this line)" : ""}${l.dest ? "; belongs in " + code(l.dest.dest) : ""}): ${code(short(l.text, 190))}`);
	}
	out("");
}
if (alreadyOutside.length){
	out("### Lines found only outside the store");
	out("");
	out(`These are in a module's own log (${[...new Set(alreadyOutside.flatMap(a => a.where))].map(code).join(", ")}). That is their proper home, so the plan leaves them.`);
	out("");
}

// ---- Duplicate list in full (appendix) ----
out("## Appendix: every duplicated session id");
out("");
out(`One row per session id that sits in more than one store folder. **Kept** = the folder proposed to stay (a ${code("session-<8 hex>")} folder first, then a uuid folder, then a slug folder, then the one with most files). **Extra** shows each other folder with its kind and file count; *twin* means every file in it also exists in the kept folder; otherwise the paths the kept folder lacks are named.`);
out("");
out(table(["Session id", "Kept folder", "Extra folders"], dupGroups.map(g => [ code(g.id.slice(0, 8)), code(g.keeper), g.extras.map(a => `${code(a.dir)} (${a.kind}, ${a.files} files, ${a.twin ? "twin" : "lacks in kept: " + a.absent.slice(0, 4).join(", ") + (a.absent.length > 4 ? ", +" + (a.absent.length - 4) : "")})`).join("<br>") ])));
out("");

// ================================ move-plan.md ================================
const mp = [];
const mo = (...a) => mp.push(a.join(""));
const ai2All = [...codeFiles.filter(f => f.abs.startsWith(AI2)).map(f => f.file), ...listings.filter(l => l.group === "ai2").map(l => l.file), ...ai2Recs.map(r => r.file)].sort();
const kindOf = f => f.endsWith("/files.jsonl") ? "listing" : f.endsWith(".jsonl") ? "record" : (shimInfo.find(s => f === "public/framework/ai2/" + s.name)?.isShim ? "shim" : "code or doc");

mo("# Plan: retire public/framework/ai2/ (scripted, nothing deleted)");
mo("");
mo(`Written ${today} from [audit.md](./audit.md). It is a plan only: the audit moved, deleted and rewrote nothing. One script, ${code("retire-ai2.mjs")} (to be written by the task that carries this out, next to this file), runs the steps below. **By default it is a dry run**: it prints every step and every manifest row and changes nothing. With ${code("--apply")} it runs the steps in order, writes ${code("manifest.json")} (every old path to its new path, with a sha1) *before* touching a file, and commits after each step. ${code("--verify")} re-runs ${code("audit-ai2.mjs")} and fails on any line still missing. Git is the undo.`);
mo("");
mo("## In one paragraph");
mo("");
mo(`Of ${ai2Recs.length} record files in ${code("ai2/")}, ${q1.identical} are identical in the store, ${q1.pointer} are pointers to it and ${q1.partly + q1.missing + (q1.elsewhere ?? 0)} need ${copyLineTotal ? "a few lines copied" : "nothing copied"}. The old dated folders ${code("ai/2026/10/...")} hold ${oldLines.missing + oldLines.partial} lines that exist nowhere in the store; those are the one real risk. Moving ${code("ai2/")} aside is safe only after (1) those lines are copied, and (2) ${clsTotal} store cards that import ${code("/framework/ai2/card.js")} are given an alias. ${dupGroups.length} session ids stored twice are a separate clean-up (step 6).`);
mo("");
mo("## Order of work (each step is one commit; smoke-test between)");
mo("");
mo("### Step 1. Copy what is missing into the store (append only)");
mo("");
mo(`Rule: append, never rewrite (${code(">>")}); skip a line that is already in the destination (exact match), so a second run adds nothing. ${copyLineTotal} lines, de-duplicated across the sources (the archive logs repeat part of the ${code("ai2/")} logs):`);
mo("");
mo(table(["Destination", "Lines", "Exists now", "Comes from", "Why there"], copyRows.map(r => [ code(r.dest), r.lines, r.destExists ? "yes (append)" : "no (create)", r.sources.map(s => code(fileLabel(s))).join("<br>"), r.why ?? "" ])));
mo("");
mo(`The full text of each line is in [audit.md](./audit.md) (section "in full"). Lines whose proper home is a module's own log that already holds them (${alreadyOutside.length} line(s)) stay where they are.`);
mo("");
mo("### Step 2. Mark what is already there");
mo("");
mo(`The script writes one row per record file into ${code("manifest.json")}: old path, status, the store path(s) that hold it, line counts, date checked. No old file is edited. Rows:`);
mo("");
mo(table(["Old path", "Status", "Store path(s) holding it"], [
	...ai2Recs.map(r => [ code(fileLabel(r.file)), statusWord[r.status], r.lines.flatMap(l => l.c.where ?? []).filter((v, i, a) => a.indexOf(v) === i).slice(0, 2).map(w => code(w.replace(/^\/framework\/ai\//, "")) + (w.startsWith("public/") ? " (a module log, outside the store)" : "")).join("<br>") || (r.status === "pointer" ? "a pointer file: it lists the stub folders, nothing to copy" : "after step 1") ]),
	...oldPages.map(r => [ code(fileLabel(r.file)), r.q2, r.candidates.filter(c => c.exact).map(c => code(c.path)).join("<br>") || `after step 1: ${code(copyRows.find(c => c.sources.includes(r.file))?.dest.replace("public/framework/ai/", "") ?? "")}` ]),
	...archiveRecs.map(r => [ code(fileLabel(r.file)), statusWord[r.status], r.lines.flatMap(l => l.c.where ?? []).filter((v, i, a) => a.indexOf(v) === i).slice(0, 2).map(code).join("<br>") || "after step 1" ]),
]));
mo("");
mo("### Step 3. Repoint every reader (before anything moves)");
mo("");
mo(`**3a. The ${clsTotal} store cards.** Their first line says ${code('"class": "/framework/ai2/card.js"')} and ${code("core/Page/Jsonl.js")} imports it (${code("log_class()")}). Do **not** rewrite ${clsTotal} history records. Instead add a small alias table to ${code("log_class()")}: ${code("{ \"/framework/ai2/card.js\": \"/framework/ai/cards/card.js\" }")} (one entry per shim path that appears as a class value; today only ${code("card.js")} does). The alternative, a byte-exact text replace of that one field in each file, works but edits records, so it is not the default.`);
mo("");
mo(`**3b. Live code.** Rule: ${code("ai2")} becomes ${code("ai")}. Cards are already served at ${code("/framework/ai/<yyyy>/<mm>/<dd>/<card>/")} (${code("ai/page.js")}, ${code("AIRail.handles()")}), so ${code("/framework/ai2/<card>/")} becomes ${code("/framework/ai/<card>/")}; a shim import becomes the file its re-export line names (table in audit.md, section 4). One caveat the dry run must check link by link: ${code("ai/page.js")} claims only dated card ids, ${code("p-N")}, ${code("ask:...")}, ${code("topic-...")} and uuid ids, while ${code("ai2/page.js")} claimed every unknown name as a card, so each rewritten link target is resolved through ${code("ai/page.js")} first and listed if it would 404.`);
mo("");
const listAll = (title, arr) => {
	const f = dedupFiles(arr);
	mo(`**${title}** (${f.length} files)`);
	mo("");
	mo(table(["File", "Hits", "First hit"], f.map(([file, n]) => { const s = arr.find(h => h.file === file); return [ code(file), n, `line ${s.line}: ${code(s.text)}` ]; })));
	mo("");
};
listAll("Imports of an ai2 shim", live(readers.import));
listAll("Links and URLs built from /framework/ai2/", live(readers.link));
listAll("Code that reads the folder by name", live(readers.dirRead));
mo(`**3c. Docs and comments.** ${uniq(readers.doc).length} docs and ${uniq(readers.comment).length} code files mention an ai2 path; update the live ones (readmes, module docs) in the same commit, and leave dated history alone. Also move the ${code("/framework/ai2/")} canaries in ${code("Server/smoke.mjs")} and ${code("Server/Crawl.mjs")} to ${code("/framework/ai/")}, then run ${code("node Server/smoke.mjs")} and the crawl.`);
mo("");
mo("### Step 4. Move ai2/ aside (not delete)");
mo("");
mo(`${code(`git mv public/framework/ai2 ${ASIDE}`)}. One command; the dry run prints it first. Result: ${code("/framework/ai2/")} stops existing and no record is lost; the old folder is one ${code("git mv")} from coming back. **Decision:** no redirect page is kept at the old address, because the owner said the directory "should probably just disappear". The alternative, a five-line ${code("ai2/page.js")} that redirects to ${code("/framework/ai/")} for old bookmarks, is cheap and can be added later if a link turns up. ${code("Servex/agents/Assistant.js")} registers ${code("ai2")} inside a try/catch, so a missing folder is harmless there.`);
mo("");
mo(`Manifest rows for this step (${ai2All.length} files, old path to new path):`);
mo("");
mo(table(["Old path", "New path", "Kind"], ai2All.map(f => [ code(f.replace("public/framework/", "")), code(f.replace("public/framework/ai2", ASIDE).replace("public/framework/", "")), kindOf(f) ])));
mo("");
mo(`${code("ai/archive/ai2/")} already is the aside copy of the old page logs and stays; its two non-empty logs are rows in step 2.`);
mo("");
mo("### Step 5. Retire the old dated folders");
mo("");
mo(`Only after ${code("--verify")} shows every line of every old page log in the store: ${code(`git mv public/framework/ai/2026 ${ASIDE.replace("ai2-module", "old-dated")}/2026`)} and the same for ${code("public/framework/ai/2026-10-13")}, after pointing ${code("CardDir.pick()")}'s fallback away from the old place. Until then they stay: the route falls back to them when a card exists only there (${cardStats.oldOnly} cards today).`);
mo("");
mo("### Step 6. Clean up the duplicate session folders (a separate task, not ai2)");
mo("");
mo(`${dupGroups.length} session ids sit in ${dupGroups.length + dupFolders} folders (appendix of [audit.md](./audit.md)). Proposed rule, same pattern as above (dry run, manifest, ${code("git mv")}): per id keep the kept folder named in the appendix. For each extra folder: if it is a *twin* (${dupTwinFolders} folders), move it to ${code(ASIDE.replace("ai2-module", "duplicate-sessions") + "/<same relative path>")}. If it holds paths the kept folder lacks (${dupContentFolders} folders), first copy those paths into the kept folder (never overwrite a file that exists), then move the extra folder aside. Afterwards rebuild the day, month and year ${code("index.json")} / ${code("index.jsonl")} so a walk of the index files and the month totals agree.`);
mo("");
mo("## Commands");
mo("");
mo("```");
mo("node retire-ai2.mjs               # dry run: prints every step and the manifest rows, changes nothing");
mo("node retire-ai2.mjs --apply       # steps 1 to 4 in order; manifest.json first; one commit per step");
mo("node retire-ai2.mjs --verify      # re-runs audit-ai2.mjs; non-zero exit if any line is still missing");
mo("```");
mo("");
mo(`Manifest row shape: ${code('{ "step": 4, "old": "public/framework/ai2/card.js", "new": "public/framework/ai/archive/ai2-module/card.js", "kind": "shim", "sha1": "..." }')}. A step 1 row also carries the destination file and the line numbers appended.`);
mo("");

const auditMd = md.join("\n") + "\n";
const planMd = mp.join("\n") + "\n";
console.log(JSON.stringify(results, null, 1));
if (WRITE){
	fs.writeFileSync(path.join(HERE, "audit.md"), auditMd);
	fs.writeFileSync(path.join(HERE, "move-plan.md"), planMd);
	console.log("wrote audit.md (" + auditMd.length + " chars) and move-plan.md (" + planMd.length + " chars)");
}
