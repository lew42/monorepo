/* InboxSources — the computed map of every file the inbox draws from: who writes it, who reads it, what it holds.
 *   node InboxSources.mjs            print the table
 *   node InboxSources.mjs --write    put it into doc/inbox-data.md, between the <!-- sources --> markers
 * Run it from the main tree so it counts the live files. Doc: doc/inbox-data.md. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Landings from "./Landings.mjs";

export default class InboxSources {
	static AI = Landings.AI;
	static PUBLIC = path.join(Landings.ROOT, "public");
	static DOC = path.join(Landings.HERE, "doc/inbox-data.md");

	static read(file){ return fs.existsSync(file) ? Landings.lines(file) : []; }
	static verbs(lines){ const c = {}; for (const l of lines) { const k = Object.keys(l)[0]; c[k] = (c[k] ?? 0) + 1; } return c; }
	static last(lines, at = l => l.at ?? Object.values(l)[0]?.at){ return lines.map(at).filter(v => Date.parse(v)).map(v => new Date(v).toISOString()).sort().at(-1)?.slice(0, 10) ?? "–"; }
	static kb(file){ return fs.existsSync(file) ? Math.round(fs.statSync(file).size / 1024) + " KB" : "missing"; }
	static top(c, n = 3){ return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} ${v}`).join(", "); }

	/** Every page.jsonl under a dir. */
	static pages(dir, out = []){
		if (!fs.existsSync(dir)) return out;
		for (const e of fs.readdirSync(dir, { withFileTypes: true })){
			if (e.name === "node_modules" || e.name.startsWith(".")) continue;
			const p = path.join(dir, e.name);
			if (e.isDirectory()) InboxSources.pages(p, out); else if (e.name === "page.jsonl") out.push(p);
		}
		return out;
	}

	static count(){
		const A = InboxSources.AI, f = n => path.join(A, n);
		const board = InboxSources.read(f("board.jsonl")), cards = InboxSources.read(f("cards.jsonl"));
		const card_dirs = InboxSources.pages(f("2026")).filter(p => path.relative(f("2026"), p).split(path.sep).length === 4);
		const card_lines = card_dirs.map(InboxSources.read);
		const card_notes = card_lines.flat().filter(l => l.owner_note);
		const cards_with_note = card_lines.filter(ls => ls.some(l => l.owner_note)).length;
		const index_notes = cards.filter(c => c.owner_note).length;
		const landings = Landings.all();
		const tasks = Landings.files();
		const all_pages = InboxSources.pages(InboxSources.PUBLIC).filter(p => !card_dirs.includes(p));
		let notes = 0, inbox = 0, noted_pages = 0;
		for (const p of all_pages){
			const text = fs.readFileSync(p, "utf8");
			if (!text.includes('"note"') && !text.includes('"inbox"')) continue;
			const ls = Landings.lines(p), n = ls.filter(l => l.note).length, i = ls.filter(l => l.inbox).length;
			notes += n; inbox += i; if (n + i) noted_pages++;
		}
		const board_ids = new Set(board.map(l => l.card?.id).filter(Boolean));
		const card_titles = new Set(cards.map(c => c.title));
		const board_titles = new Set(board.map(l => l.card?.title).filter(Boolean));
		const shared_titles = [...board_titles].filter(t => card_titles.has(t)).length;
		const asks = InboxSources.read(f("asks.jsonl")), verdicts = InboxSources.read(f("verdicts.jsonl"));
		const index = InboxSources.read(Landings.INDEX);
		const status = {}; cards.forEach(c => status[c.status] = (status[c.status] ?? 0) + 1);

		return [
			{ name: "card `page.jsonl` (ai/YYYY/MM/DD/slug/)", role: "**record** (cards, owner notes, chat)", writer: "Servex `Cards.js` (`create_card`, `append`, `owner_note`)", reader: "card page (`ai/cards/card.js`), `rail/inbox.js` `resolve_card`",
				holds: `${card_dirs.length} cards, ${card_lines.flat().length} lines; ${card_notes.length} owner_note lines on ${cards_with_note} cards`, last: InboxSources.last(card_lines.flat().map(l => ({ at: Object.values(l)[0]?.at }))) },
			{ name: "`ai/cards.jsonl`", role: "**index** (a cache of the above)", writer: "`Cards.js` (debounced whole rewrite)", reader: "`rail/inbox.js` `static_cards` (the AI Inbox tab), Timeline",
				holds: `${cards.length} rows (${InboxSources.top(status, 4)}); ${index_notes} with an owner_note`, last: InboxSources.last(cards, c => c.last) + " · " + InboxSources.kb(f("cards.jsonl")) },
			{ name: "task `task.jsonl` landing lines", role: "**record** (what was built)", writer: "every agent, `finish-task` (`assign.landed_at`)", reader: "`Server/PastWork.mjs`, day pages, Timeline (through the index)",
				holds: `${tasks.length} task logs, ${landings.length} landings (${landings.filter(Landings.big).length} big: a page link or a card)`, last: InboxSources.last(landings) },
			{ name: "`Inbox/timeline/landings.jsonl`", role: "**index** (a cache of the landings)", writer: "`node Landings.mjs --append` (append-only)", reader: "Timeline (`live()` tail)",
				holds: `${index.length} rows`, last: InboxSources.last(index, l => l.landed?.at) + " · " + InboxSources.kb(Landings.INDEX) },
			{ name: "`ai/board.jsonl`", role: "**retired** (the v/3 board), read-only", writer: "`every-prompt/say.mjs` (health-watch only, last)", reader: "`rail/inbox.js` `BOARD_URL` when the card index is missing",
				holds: `${board.length} lines (${InboxSources.top(InboxSources.verbs(board))}); ${board_ids.size} card ids, ${shared_titles} titles also in cards.jsonl`, last: InboxSources.last(board, l => l.card?.at ?? l.at) + " · " + InboxSources.kb(f("board.jsonl")) },
			{ name: "page `note` / `inbox` lines (any page.jsonl)", role: "**record** (coordination notes to a page's agent)", writer: "Servex `page_note`, `drop`", reader: "`Inbox.notes()`, the drawer's box (`Inbox.Compact`)",
				holds: `${notes} note + ${inbox} inbox lines on ${noted_pages} pages`, last: "–" },
			{ name: "`ai/asks.jsonl`", role: "record (owner asks and who owns them)", writer: "Servex asks ledger", reader: "`rail/inbox.js` stalled-ask rows",
				holds: `${asks.length} lines`, last: InboxSources.last(asks) },
			{ name: "`ai/verdicts.jsonl`", role: "record (Approve/Improve presses)", writer: "`Server/plugins/CardAnswer.js`", reader: "`rail/inbox.js`",
				holds: `${verdicts.length} lines`, last: InboxSources.last(verdicts) },
		];
	}

	static table(rows = InboxSources.count()){
		const head = "| Source | Role | Writer | Reader | Holds today | Last |\n|---|---|---|---|---|---|";
		return head + "\n" + rows.map(r => `| ${r.name} | ${r.role} | ${r.writer} | ${r.reader} | ${r.holds} | ${r.last} |`).join("\n")
			+ `\n\nCounted by \`node InboxSources.mjs\` on ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC.`;
	}

	static write(){
		const doc = fs.readFileSync(InboxSources.DOC, "utf8");
		const next = doc.replace(/<!-- sources -->[\s\S]*?<!-- \/sources -->/, `<!-- sources -->\n${InboxSources.table()}\n<!-- /sources -->`);
		fs.writeFileSync(InboxSources.DOC, next);
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	if (process.argv.includes("--write")) { InboxSources.write(); console.log("wrote", InboxSources.DOC); }
	else console.log(InboxSources.table());
}
