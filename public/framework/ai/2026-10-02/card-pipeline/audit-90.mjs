// audit-90.mjs — item 3's audit: every card scoring 90+ right now, with its score and its
// reason (the rule that fired), computed the same way `importance()` (ai2/needs-rule.js)
// already scores every row everywhere else — never a second idea of "important". Cards whose
// only open "need" is the heuristic kind (a card typed `question`, or one whose last message
// ends in "?") AND whose matching ask in the ledger already landed are STALE — the owner
// finished that work, nothing is really waiting on them — and get archived (a status line,
// never deleted), per the brief: "a landed task is not 'needs the owner today'".
//
// Run from the MAIN tree so the card writes (the archive lines) land on the live board:
//   node public/framework/ai/2026-10-02/card-pipeline/audit-90.mjs [--apply]
// Without --apply it only PRINTS the findings — the before/after counts on the card come from
// one --apply run.

import path from "node:path";
import { fileURLToPath } from "node:url";
import Cards from "../../../../../Servex/cards/Cards.js";
import { card_needs, importance, reason_of } from "../../../ai2/needs-rule.js";
import { fold_asks } from "../../asks/fold.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../../");
const AI_ROOT = path.resolve(ROOT, "public/framework/ai");
const APPLY = process.argv.includes("--apply");

const cards = new Cards({ root: AI_ROOT });

async function main(){
	const fs = await import("node:fs/promises");
	const asksText = await fs.readFile(path.join(AI_ROOT, "asks.jsonl"), "utf8").catch(() => "");
	const askLines = asksText.split("\n").filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
	const asks = Object.values(fold_asks(askLines));
	const asksByCard = new Map();
	for (const a of asks) if (a.card) asksByCard.set(a.card, a);

	const ids = await cards.walk();
	const now = Date.now();
	const found = [];
	for (const id of ids){
		const lines = await cards.read(id);
		const folded = await cards.fold(id);
		if (!folded || folded.status === "done" || folded.status === "archived") continue;
		const needs = card_needs(id, lines, { title: folded.title, type: folded.type, status: folded.status, last: folded.last, created: folded.created });
		if (!needs.length) continue;
		const scored = needs.map(n => ({ ...n, score: importance(n, now) })).sort((a, b) => b.score - a.score);
		const top = scored[0];
		if (top.score < 90) continue;
		const ask = asksByCard.get(id);
		const heuristic_only = scored.every(n => n.ask === "card" || n.ask === "last");
		const stale = heuristic_only && ask?.status === "landed";
		found.push({ id, title: folded.title, score: top.score, reason: reason_of(top, top, now), stale, ask_status: ask?.status ?? null });
	}

	found.sort((a, b) => b.score - a.score);
	console.log(`${found.length} card(s) at 90+ right now:`);
	for (const f of found) console.log(` ${f.score}  ${f.stale ? "[STALE] " : ""}${f.id} — ${f.reason}${f.ask_status ? " (ask: " + f.ask_status + ")" : ""}`);

	const stale = found.filter(f => f.stale);
	console.log(`\n${stale.length} of those are stale (their only open "need" is the heuristic kind, and the ledger says the matching task already landed).`);
	if (APPLY && stale.length){
		for (const f of stale){
			await cards.append(f.id, { status: "archived" });
			await cards.append(f.id, { message: { by: "servex-asks", kind: "note",
				text: "Archived by the 90+ audit (card-pipeline, 2026-10-02): this card's only open item was the automatic "
					+ "\"looks like a question\" check, and the ledger shows its ask already landed — nothing is really waiting on you here." } });
			console.log("archived: " + f.id);
		}
	}
	return { total_90_plus: found.length, stale: stale.length, applied: APPLY };
}

main().then(r => console.log("\n" + JSON.stringify(r))).catch(e => { console.error(e); process.exit(1); });
