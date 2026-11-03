/**
 * The Node half: read a topic's file, assemble it, append one legal line.
 *
 * The CLI (`research.mjs`) and the MCP tools (`Server/plugins/Research.js`)
 * both call these — one code path, so an agent cannot reach a shape the CLI
 * cannot. Files are small and appends are single-line, so a plain
 * `appendFileSync` is the whole concurrency story: parallel minions interleave
 * lines and never collide.
 */
import fs from "fs";
import path from "path";
import { VERBS, KINDS, STATES, validate, id, line, score } from "./verbs.js";

export { VERBS, KINDS, STATES, id, score };

/** The repo root is wherever the caller was started from. */
export const dir = slug => path.resolve(process.cwd(), "public/framework/research", slug);
export const file = slug => path.join(dir(slug), "research.jsonl");

/** ⚠ A slug becomes a path — a topic is a plain name, never a traversal. */
export function slugged(slug){
	if (!/^[a-z0-9][a-z0-9-]*$/.test(String(slug ?? ""))) throw new Error(`bad slug "${slug}" — lowercase letters, digits and dashes`);
	return slug;
}

/** ISO with this machine's offset, from the clock. */
export function now(){
	const d = new Date();
	const off = -d.getTimezoneOffset(), pad = n => String(Math.abs(Math.trunc(n))).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
		+ `${off < 0 ? "-" : "+"}${pad(off / 60)}:${pad(off % 60)}`;
}

/** The file, replayed. A torn or unknown line is counted, never fatal. */
export function state(slug){
	const s = { slug: slugged(slug), head: {}, nodes: [], votes: [], verdicts: [], agents: [], logs: [], bad: 0, index: {} };
	const text = fs.existsSync(file(slug)) ? fs.readFileSync(file(slug), "utf8") : "";

	for (const raw of text.split("\n")){
		if (!raw.trim()) continue;
		let entry;
		try { entry = JSON.parse(raw); } catch { s.bad++; continue; }

		for (const [verb, value] of Object.entries(entry)){
			if (verb === "assign") Object.assign(s.head, value);
			else if (verb === "node"){ s.nodes.push(value); s.index[value.id] = value; }
			else if (verb === "verdict") s.verdicts.push(value);
			else if (verb === "agent"){
				const known = s.agents.find(a => a.name === value.name);
				known ? Object.assign(known, value) : s.agents.push(value);
			}
			else if (VERBS[verb]) s[verb + "s"].push(value);
			else s.bad++;
		}
	}
	return s;
}

/* Score and verdict are derived, never stored: votes and verdicts keep arriving. */
export const ranked = (s, node) => score(node, s.votes.filter(v => v.node === node.id));
export const verdict = (s, node) => s.verdicts.filter(v => v.node === node.id).at(-1);
export const kids = (s, parent) => s.nodes.filter(n => (n.parent && s.index[n.parent] ? n.parent : null) === parent);

/**
 * Append one line. `at` comes from the clock, ids are made here, and a `parent`
 * that is not already in the file is refused — a node nobody can reach is worse
 * than a rejected write.
 */
export function write(slug, verb, value){
	const s = state(slug);
	const v = { ...value, at: now() };

	if (verb === "node"){
		v.id ??= id(v.kind);
		if (v.parent && !s.index[v.parent])
			throw new Error(`no node "${v.parent}" in ${slug} — run \`outline\` and pick a real parent`);
	}
	if ((verb === "vote" || verb === "verdict") && !s.index[v.node])
		throw new Error(`no node "${v.node}" in ${slug} — run \`outline\` and pick a real one`);

	const text = line(verb, v);   // throws the validate() reason; nothing is written
	fs.mkdirSync(dir(slug), { recursive: true });
	fs.appendFileSync(file(slug), text);
	return v;
}

/**
 * The tree as indented text — what a minion reads INSTEAD of the file, so a
 * round costs a screen and not a transcript. `min` keeps a low-scoring node
 * when something under it qualifies, or the path to it would vanish.
 */
export function outline(slug, { under, depth = 9, min = 0 } = {}){
	const s = state(slug);
	if (under && !s.index[under]) throw new Error(`no node "${under}" in ${slug}`);

	let keep = null;
	if (min > 0){
		keep = new Set();
		for (const n of s.nodes)
			if (ranked(s, n) >= min) for (let c = n; c && !keep.has(c.id); c = s.index[c.parent]) keep.add(c.id);
	}

	const out = [];
	const walk = (parent, level) => {
		if (level > depth) return;
		for (const n of kids(s, parent)){
			if (keep && !keep.has(n.id)) continue;
			const v = verdict(s, n);
			out.push([
				"  ".repeat(level) + n.id, n.kind, ranked(s, n),
				v ? v.state + (v.into ? ` → ${v.into}` : "") : "-", n.by, n.text
			].join(" · "));
			walk(n.id, level + 1);
		}
	};

	under ? walk(under, 0) : walk(null, 0);
	return out.join("\n") || `${slug}: nothing to show${min ? ` at score ≥ ${min}` : ""}`;
}

/** The report: header, the orchestrator's summary, the top roots, who is running. */
export function summary(slug, { top = 7 } = {}){
	const s = state(slug);
	const roots = kids(s, null).sort((a, b) => ranked(s, b) - ranked(s, a)).slice(0, top);
	const out = [
		`${s.head.title ?? slug} — ${s.head.status ?? "open"} · ${s.nodes.length} nodes · ${s.votes.length} votes · ${s.verdicts.length} verdicts`,
		s.head.question && `Q: ${s.head.question}`,
		...(s.head.summary ?? []).map(l => `• ${l}`),
		"",
		...roots.map(n => `${n.id} · ${n.kind} · ${ranked(s, n)} · ${verdict(s, n)?.state ?? "-"} · ${n.text}`),
		s.agents.length && "",
		...s.agents.map(a => `@${a.name} (${a.model ?? "?"}) ${a.done ? "done: " + a.done : "doing: " + a.doing}`),
		s.bad && `⚠ ${s.bad} line(s) unreadable or unknown`
	];
	return out.filter(l => typeof l === "string").join("\n");
}
