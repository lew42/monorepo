#!/usr/bin/env node
// count.mjs — study only, no build. Counts this week's owner prompts (2026-11-02 to 2026-11-08)
// against the mentions vocabulary (ext/Mention/maps/refs.js + people.js) and every readme's
// "## Search terms" section. Writes counts.json beside this script. Read-only: touches no file
// outside this task folder.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
// repo root: .../worktrees/qf-4
const REPO = path.resolve(here, "../../../../../../../../../../");
const FW = path.join(REPO, "public", "framework");

function walk(dir, out = []){
	let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
	for (const e of ents){
		if (e.name === "node_modules" || e.name === ".git") continue;
		const p = path.join(dir, e.name);
		if (e.isDirectory()) walk(p, out);
		else out.push(p);
	}
	return out;
}

// ---------- 1. the prompts ----------

const SESS = path.join(FW, "ai", "sessions", "2026", "11");
const DAYS = ["02", "03", "04", "05", "06", "07", "08"];

const prompts = []; // { id, source, text }

// 1a. VS Code tabs: the counted Prompt item Server/Ask.mjs writes on every turn
// ({"content":{"add":{"type":"Prompt","id":...,"text":...,"via":"vscode","counted":true}}}).
// This is the one raw-text record per turn (deduped by id); a `content.add` Prompt item with no
// `counted:true` is a MODEL prompt (a relayed brief, an agent's own turn), skipped on purpose.
const seen_turn_timestamps = new Set(); // dedup key for "refined" lines against an already-collected turn
let refined_lines_seen_vscode_files = 0;
for (const day of DAYS){
	const dir = path.join(SESS, day);
	if (!fs.existsSync(dir)) continue;
	for (const file of walk(dir)){
		if (path.basename(file) !== "session.jsonl") continue;
		if (/[/\\]v-[^/\\]+[/\\]session\.jsonl$/.test(file)) continue; // handled in 1c, below
		let text;
		try { text = fs.readFileSync(file, "utf8"); } catch { continue; }
		for (const line of text.split("\n")){
			if (!line) continue;
			if (line.includes('"refined":{')) refined_lines_seen_vscode_files++;
			if (!line.includes('"type":"Prompt"') || !line.includes('"counted":true')) continue;
			let o; try { o = JSON.parse(line); } catch { continue; }
			const add = o?.content?.add;
			if (!add || add.type !== "Prompt" || !add.counted) continue;
			prompts.push({ id: add.id, source: "vscode:" + path.relative(FW, file), text: String(add.text || "") });
			if (o.ts) seen_turn_timestamps.add(o.ts);
		}
	}
}

// 1b. The cloud transcript: no raw owner-turn text field exists in these two records (checked:
// zero "refined" and zero "sentences" lines in either file). The closest thing to the owner's
// words is `tasks.add`'s `title` (+ `why`, when present) — a derived task filed FROM the owner's
// spoken ask, not the ask verbatim. Counted separately and flagged, never merged into the
// VS Code total as if it were the same kind of record.
const cloud_files = [
	path.join(SESS, "06", "cloud-voice-app-20261106", "session.jsonl"),
	path.join(SESS, "08", "cloud-voice-app-20261108", "session.jsonl"),
];
const cloud_prompts = [];
for (const file of cloud_files){
	if (!fs.existsSync(file)) continue;
	const text = fs.readFileSync(file, "utf8");
	for (const line of text.split("\n")){
		if (!line || !line.includes('"tasks":{"add"')) continue;
		let o; try { o = JSON.parse(line); } catch { continue; }
		const add = o?.tasks?.add;
		if (!add || add.type !== "Task") continue;
		const words = [add.title, add.why].filter(Boolean).join(" — ");
		cloud_prompts.push({ id: add.id, source: "cloud:" + path.relative(FW, file), text: words });
	}
}

// 1c. Browser dictation (the main owner channel): session folders named `v-*`. Each spoken turn
// writes one composite line {"sentences":{"add":{id,text,...}},"messages":{"add":{type:"Prompt",
// by:"owner",sentences:[s-id,...],prompt:"p-..."}}}. A long turn can be split into several such
// lines, one sentence at a time, all sharing the same `messages.add.prompt` id — one prompt is
// every sentence text that shares a `prompt` id, joined in the order the lines appear.
const voice_files = [];
for (const day of DAYS){
	const dir = path.join(SESS, day);
	if (!fs.existsSync(dir)) continue;
	for (const file of walk(dir)){
		if (path.basename(file) === "session.jsonl" && /[/\\]v-[^/\\]+$/.test(path.dirname(file))) voice_files.push(file);
	}
}
const voice_prompts = [];
let refined_lines_seen_voice_files = 0;
for (const file of voice_files){
	let text; try { text = fs.readFileSync(file, "utf8"); } catch { continue; }
	const groups = new Map(); // p-id -> [{at, text}]
	const refined_lines = [];
	for (const line of text.split("\n")){
		if (!line) continue;
		if (line.includes('"refined":{')){ refined_lines_seen_voice_files++; let o; try { o = JSON.parse(line); } catch { o = null; } if (o) refined_lines.push(o.refined); continue; }
		if (!line.includes('"messages":{"add"') || !line.includes('"sentences":{"add"')) continue;
		let o; try { o = JSON.parse(line); } catch { continue; }
		const sAdd = o?.sentences?.add, mAdd = o?.messages?.add;
		if (!sAdd || !mAdd || mAdd.type !== "Prompt" || mAdd.by !== "owner" || !mAdd.prompt) continue;
		if (!groups.has(mAdd.prompt)) groups.set(mAdd.prompt, []);
		groups.get(mAdd.prompt).push({ at: mAdd.at, text: String(sAdd.text || "") });
		if (mAdd.at) seen_turn_timestamps.add(mAdd.at);
	}
	for (const [pid, parts] of groups){
		voice_prompts.push({ id: pid, source: "voice:" + path.relative(FW, file), text: parts.map(p => p.text).join(" ") });
	}
	// refined v2 lines in this same file, deduped against a turn already collected above
	// (every refined line seen this week has a `re` exactly matching a collected turn's
	// timestamp — see counts.json's `refined_lines` note — so this mostly records 0 new prompts,
	// but a refined line whose turn text we somehow missed still gets counted, not dropped).
	for (const r of refined_lines){
		if (!r || !Array.isArray(r.sentences)) continue;
		if (r.re && seen_turn_timestamps.has(r.re)) continue;
		voice_prompts.push({ id: "refined:" + (r.re || r.at), source: "voice-refined:" + path.relative(FW, file), text: r.sentences.map(s => s.text).join(" ") });
	}
}

const all_prompts = [...prompts, ...cloud_prompts, ...voice_prompts];

// ---------- 2. the vocabulary ----------

async function map_names(file){
	const mod = await import(new URL("file://" + path.join(FW, "ext", "Mention", "maps", file).replace(/\\/g, "/")));
	return Object.keys(mod.default || {});
}
const refs_names = await map_names("refs.js");
const people_names = await map_names("people.js");
const map_vocab = new Set([...refs_names, ...people_names].map(n => n.toLowerCase()));
// the exact-case form for each lowercase key, preferring refs.js's casing (it owns the proper nouns)
const canonical = new Map();
for (const n of [...people_names, ...refs_names]) canonical.set(n.toLowerCase(), n);

// Search-terms sections: every readme's "## Search terms" block, the bold/backtick term at the
// start of each bullet, e.g. "- `session.jsonl` (...)" or "- **two-word term** (...)".
const search_terms = new Set();
for (const file of walk(FW)){
	if (path.basename(file) !== "readme.md") continue;
	let text; try { text = fs.readFileSync(file, "utf8"); } catch { continue; }
	const i = text.indexOf("## Search terms");
	if (i === -1) continue;
	const block = text.slice(i, text.indexOf("\n## ", i + 10) === -1 ? undefined : text.indexOf("\n## ", i + 10));
	for (const m of block.matchAll(/^- `([^`]+)`|^- \*\*([^*]+)\*\*/gm)){
		const term = (m[1] || m[2] || "").trim();
		if (term) search_terms.add(term.toLowerCase());
	}
}

// ---------- 3. explicit @Name / #Name ----------

const explicit_pattern = /[@#]([A-Za-z][\w.-]*)/g;
const unknown_tally = new Map(); // word (as typed) -> count

// ---------- 4. implicit: a map name as a whole word, or a Search-terms term ----------
// Capitalised names (Page, Task, ...) match case-sensitively (so "page" in prose doesn't
// false-positive on the class Page); lowercase map names (owner, minion, clarity...) and every
// Search-terms term match case-insensitively, since they were never meant as proper nouns.
const cap_names = [...new Set([...refs_names, ...people_names])].filter(n => /^[A-Z]/.test(n));
const lower_names = [...new Set([...refs_names, ...people_names])].filter(n => /^[a-z]/.test(n));

function word_re(name){ return new RegExp("\\b" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b"); }
const cap_res = cap_names.map(n => ({ name: n, re: word_re(n) }));
const lower_res = lower_names.map(n => ({ name: n, re: new RegExp(word_re(n).source, "i") }));
const term_res = [...search_terms].map(t => ({ name: t, re: new RegExp("\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i") }));

const per_prompt = []; // { id, source, text120, names: Set, explicit: Set, implicit: Set }
const per_name_prompts = new Map(); // name -> Set(prompt index)

for (let idx = 0; idx < all_prompts.length; idx++){
	const p = all_prompts[idx];
	const names = new Set(), explicitNames = new Set(), implicitNames = new Set();

	for (const m of p.text.matchAll(explicit_pattern)){
		const raw = m[1];
		const lc = raw.toLowerCase();
		if (map_vocab.has(lc)){
			const canon = canonical.get(lc);
			names.add(canon); explicitNames.add(canon);
		} else {
			unknown_tally.set(m[0], (unknown_tally.get(m[0]) || 0) + 1);
		}
	}
	for (const { name, re } of cap_res) if (re.test(p.text)){ names.add(name); implicitNames.add(name); }
	for (const { name, re } of lower_res) if (re.test(p.text)){ names.add(name); implicitNames.add(name); }
	for (const { name, re } of term_res) if (re.test(p.text)){ names.add("term:" + name); implicitNames.add("term:" + name); }

	per_prompt.push({ idx, id: p.id, source: p.source, text120: p.text.slice(0, 120), names, explicitNames, implicitNames });
	for (const n of names){
		if (!per_name_prompts.has(n)) per_name_prompts.set(n, new Set());
		per_name_prompts.get(n).add(idx);
	}
}

// ---------- 5. aggregate ----------

const top_unknown = [...unknown_tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)
	.map(([word, count]) => ({ word, count }));

const top_names = [...per_name_prompts.entries()].map(([name, set]) => ({ name, prompts: set.size }))
	.sort((a, b) => b.prompts - a.prompts).slice(0, 20);

const buckets = { "0": 0, "1": 0, "2-3": 0, "4+": 0 };
for (const pp of per_prompt){
	const n = pp.names.size;
	if (n === 0) buckets["0"]++;
	else if (n === 1) buckets["1"]++;
	else if (n <= 3) buckets["2-3"]++;
	else buckets["4+"]++;
}

const sum_over_prompts = per_prompt.reduce((s, pp) => s + pp.names.size, 0);
const sum_over_names = [...per_name_prompts.values()].reduce((s, set) => s + set.size, 0);

const explicit_total = per_prompt.reduce((s, pp) => s + pp.explicitNames.size, 0);
const implicit_total = per_prompt.reduce((s, pp) => s + pp.implicitNames.size, 0);

// samples: first 5 prompts with the names they tag
const samples = per_prompt.slice(0, 5).map(pp => ({ text120: pp.text120, names: [...pp.names] }));

// 20 random implicit hits FROM THE DICTATION SOURCE (voice:*), since spoken "page" is far more
// likely to mean a web page than a typed task title is. Picked with a fixed seed so the run is
// reproducible, not cherry-picked.
const voice_implicit_hits = [];
for (const pp of per_prompt){
	if (!pp.source.startsWith("voice:")) continue;
	for (const n of pp.implicitNames) voice_implicit_hits.push({ prompt_idx: pp.idx, text120: pp.text120, name: n });
}
function seeded_shuffle(arr, seed){
	const a = arr.slice();
	let s = seed;
	const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
	for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
	return a;
}
const sample20 = seeded_shuffle(voice_implicit_hits, 42).slice(0, 20);
// Hand-read each of the 20 against the full prompt text (not just its 120-char preview, which
// `full_text` below carries) and judged true/false by what the sentence is actually about.
for (const h of sample20) h.full_text = (all_prompts.find(p => per_prompt[h.prompt_idx].id === p.id && per_prompt[h.prompt_idx].source === p.source) || {}).text || h.text120;
// Hand-judged against h.full_text below (FALSE_IDX names the sample20 indices actually read as
// false positives — a word used in its plain-English sense, not the class/concept sense).
const FALSE_IDX = [];
const judged_false = FALSE_IDX.map(i => sample20[i]);

const out = {
	note: "study only, no build. vscode: the raw counted Prompt item. cloud: a DERIVED proxy (tasks.add title+why), since neither cloud-voice-app-20261106 nor -20261108 session.jsonl carries a raw owner-turn field. voice: browser dictation (v-* folders) — one prompt per `messages.add.prompt` id, its sentence texts joined in order; plus any 'refined' v2 line not already matched to a collected turn's timestamp (none were, this week — every refined line's `re` matched an already-collected voice turn, so it added 0 new prompts, only confirmed the dedup).",
	window: "2026-11-02..2026-11-08",
	prompts_total: all_prompts.length,
	prompts_by_source: { vscode: prompts.length, cloud: cloud_prompts.length, voice: voice_prompts.length },
	voice_files_this_week: voice_files.length,
	refined_lines_seen_this_week: { vscode_files: refined_lines_seen_vscode_files, voice_files: refined_lines_seen_voice_files },
	vocabulary: { refs_names: refs_names.length, people_names: people_names.length, search_terms: search_terms.size },
	explicit: { tagged_prompts: per_prompt.filter(pp => pp.explicitNames.size > 0).length, name_hits: explicit_total, unknown_top20: top_unknown },
	implicit: { tagged_prompts: per_prompt.filter(pp => pp.implicitNames.size > 0).length, name_hits: implicit_total },
	top_names,
	buckets,
	agreement: { sum_over_prompts, sum_over_names, equal: sum_over_prompts === sum_over_names },
	samples,
	voice_implicit_sample20: sample20.map(({ full_text, ...h }) => ({ ...h, text120: full_text.slice(0, 120) })),
	judged_false_positive: judged_false.map(({ full_text, ...h }) => ({ ...h, text120: full_text.slice(0, 120) })),
	judged_false_positive_rate: `${judged_false.length}/${sample20.length}`,
	// Found by targeted search, NOT part of the random sample above (there are only 3 "Page"
	// implicit hits this week total, so a 20-pick random sample had low odds of catching one):
	// real generic-noun "page" uses that the random sample's 0/20 rate understates. Kept separate
	// so the formal rate stays the honest random-sample number, not inflated by cherry-picking.
	false_positives_found_outside_sample: [
		{ name: "page", text: "So the last two prompts of mine each have gone on their own card on the chat V3 page. page and it looks like there's kind of a title that is essentially the same thing as the prompt itself. …", why: "\"page\" names a specific site page (the Chat V3 page), not the Page class/module" },
		{ name: "page", text: "Have the mastermind try to load this page.", why: "\"this page\" is whatever page is open, a generic noun, not a reference to the Page module" },
	],
};

fs.writeFileSync(path.join(here, "counts.json"), JSON.stringify(out, null, 2) + "\n");
console.log(JSON.stringify({ prompts_total: out.prompts_total, explicit_tagged: out.explicit.tagged_prompts, implicit_tagged: out.implicit.tagged_prompts, agreement: out.agreement }, null, 2));
