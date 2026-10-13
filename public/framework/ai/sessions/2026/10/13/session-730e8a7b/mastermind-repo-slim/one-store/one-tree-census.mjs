#!/usr/bin/env node
// one-tree-census.mjs — the numbers behind the one-tree decision (doc/one-tree.md): how big each year tree is, where the two
// collide, and how many mentions each option must relink. Reads only. node <this file> [--json]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../../../../../../..");
const AI = path.join(REPO, "public/framework/ai"), SESS = path.join(AI, "sessions");
const ls = d => { try { return fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name); } catch { return []; } };
const days = root => ls(root).filter(y => /^\d{4}$/.test(y)).flatMap(y => ls(path.join(root, y)).flatMap(m => ls(path.join(root, y, m)).map(d => `${y}/${m}/${d}`)));
const count = d => { let n = 0; const w = p => { for (const e of fs.readdirSync(p, { withFileTypes: true })) e.isDirectory() ? w(path.join(p, e.name)) : n++; }; try { w(d); } catch {} return n; };

const cardDays = days(AI), sessDays = days(SESS);
let cards = 0, sessionCards = 0, cardFiles = 0, sessFolders = 0, sessFiles = 0;
const collide = [];
for (const d of cardDays) for (const c of ls(path.join(AI, d))){
	cards++; if (/-[0-9a-f]{8}$/.test(c) || /^session-[0-9a-f]{8}$/.test(c)) sessionCards++;
	cardFiles += count(path.join(AI, d, c));
	if (fs.existsSync(path.join(SESS, d, c))) collide.push(`${d}/${c}`);
}
for (const d of sessDays){ const k = ls(path.join(SESS, d)); sessFolders += k.length; sessFiles += count(path.join(SESS, d)); }

// mentions, in files the relinker rewrites (md/js/mjs/html) and in records it does not (.jsonl/.json)
const CARD = /\/?framework\/ai\/20\d\d\/\d\d\/\d\d\//g, STORE = /\/?framework\/ai\/sessions\/20\d\d\/\d\d\/\d\d\//g, ID = /"card":\s*"20\d\d\/\d\d\/\d\d\//g;
const m = { card: { text: 0, files: 0, data: 0, ids: 0 }, store: { text: 0, files: 0, data: 0 } };
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })){
	if (["node_modules", ".git", "worktrees"].includes(e.name)) continue;
	const f = path.join(d, e.name);
	if (e.isDirectory()){ walk(f); continue; }
	const ext = path.extname(e.name), text = [".md", ".js", ".mjs", ".html"].includes(ext), data = [".jsonl", ".json"].includes(ext);
	if (!text && !data) continue;
	let s; try { if (fs.statSync(f).size > 5e6) continue; s = fs.readFileSync(f, "utf8"); } catch { continue; }
	const c = (s.match(CARD) ?? []).length, t = (s.match(STORE) ?? []).length;
	if (text){ m.card.text += c; m.store.text += t; if (c) m.card.files++; if (t) m.store.files++; }
	else { m.card.data += c; m.store.data += t; m.card.ids += (s.match(ID) ?? []).length; }
} };
for (const d of ["public", "Server", "Servex", ".claude"]) walk(path.join(REPO, d));

const out = {
	card_tree: { root: "public/framework/ai/YYYY/MM/DD/", days: cardDays.length, folders: cards, session_card_folders: sessionCards, files: cardFiles },
	store: { root: "public/framework/ai/sessions/YYYY/MM/DD/", days: sessDays.length, top_folders: sessFolders, files: sessFiles },
	same_name_in_both: collide.length, same_name_examples: collide.slice(0, 8),
	mentions: m,
	option_a: { moves: sessDays.length + " day folders of the store go up one level (" + sessFiles + " files)", relink_text: m.store.text + " mentions in " + m.store.files + " md/js/html files", records_left: m.store.data + " in .json/.jsonl (redirect)", merges: collide.length + " same-name folders must merge" },
	option_b: { moves: cards + " card folders into sessions/YYYY/MM/DD/cards/ (" + cardFiles + " files)", relink_text: m.card.text + " mentions in " + m.card.files + " md/js/html files", records_left: m.card.data + " in .json/.jsonl, " + m.card.ids + " of them card ids (resolver)", merges: 0 },
};
console.log(process.argv.includes("--json") ? JSON.stringify(out) : JSON.stringify(out, null, 1));
