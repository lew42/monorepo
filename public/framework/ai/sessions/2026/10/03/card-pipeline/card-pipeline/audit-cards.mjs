// audit-cards.mjs — item 4: the 20 most recently active cards, checked for an empty body or no
// task link. The CAUSE this task found: a card made for an ask (its id sits in some ask's own
// `card` field) but never got the "iceberg tip" section — because, before this task, nothing
// ever computed one (`ensure_card`/`create_for_ask` did not exist yet). The fix, by node, reuses
// the exact same `ask_tip()` a brand-new card gets, so one function produces every card's first
// section, old or new. A card with no matching ask at all is reported but left alone — there is
// nothing real to compute a tip FROM, and inventing one would be exactly the "an AI wrote it from
// memory" law 7 rules out.
//
// Run from the MAIN tree:  node public/framework/ai/sessions/2026/10/03/card-pipeline/card-pipeline/audit-cards.mjs [--apply]

import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import Cards from "../../../../../../../../../Servex/cards/Cards.js";
import { AskFold } from "../../../../../../asks/AskFold.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../../");
const AI_ROOT = path.resolve(ROOT, "public/framework/ai");
const APPLY = process.argv.includes("--apply");
const N = 20;

const cards = new Cards({ root: AI_ROOT });

/* A card's body is EMPTY when it carries none of the ways a card normally says something:
 * a message, a prompt, a refined/chat line, plain text/description, a link, a sub-card, or a
 * citation. "No task link" only means something for a card typed `request` or `task` — a
 * `question`, `note` or topic card is never expected to point at a task dir, and flagging every
 * one of those was the first version of this check, found while testing it on real cards: it
 * flagged all 20, because most of them are mastermind-servex's own proposal/topic cards that
 * were never meant to carry one. Narrowed to the cards the brief actually means: a request or
 * task with none of a `links` entry, a chat summary, a cite, or a sub-card (a group of requests
 * is its own kind of "linked to the work"). */
function diagnose(fold){
	const has_body = !!(fold.messages?.length || fold.prompts?.length || fold.chat || fold.text
		|| fold.description || fold.links?.length || fold.children?.length || fold.cites?.length);
	const work_type = fold.type === "request" || fold.type === "task";
	const has_task_link = !!(fold.links?.length || fold.chat || fold.cites?.length || fold.children?.length);
	return { empty: !has_body, no_task_link: work_type && !has_task_link };
}

async function main(){
	const asksText = await fs.readFile(path.join(AI_ROOT, "asks.jsonl"), "utf8").catch(() => "");
	const asks = Object.values(AskFold.fold(asksText.split("\n").filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean)));
	const asksByCard = new Map();
	for (const a of asks) if (a.card) asksByCard.set(a.card, a);

	const recent = (await cards.list({ view: "all" })).slice(0, N);
	const before = [];
	for (const row of recent){
		const fold = await cards.fold(row.id);
		if (!fold) continue;
		const d = diagnose(fold);
		if (d.empty || d.no_task_link) before.push({ id: row.id, title: row.title, ...d, matching_ask: asksByCard.get(row.id)?.id ?? null });
	}

	console.log(`${recent.length} most recent cards checked. ${before.length} flagged (empty body or no task link):`);
	for (const b of before) console.log(` ${b.id} — empty:${b.empty} no_task_link:${b.no_task_link} matching ask: ${b.matching_ask ?? "none"}`);

	let fixed = 0;
	if (APPLY){
		for (const b of before){
			const ask = asksByCard.get(b.id);
			if (!ask) continue;   // the cause named above: nothing real to compute a tip from — left alone, not invented
			const dir = /^(ai\/|public\/framework\/ai\/)/.test(ask.words ?? "") ? ask.words.replace(/^public\/framework\//, "").replace(/^ai\//, "").replace(/\/[^/]+$/, "") : null;
			const tip = await cards.ask_tip(ask, dir);
			if (!tip) continue;
			await cards.append(b.id, { chat: { level: "summary", text: tip, at: new Date().toISOString(), from: { kind: "system", id: "servex-asks" } } });
			fixed++;
			console.log("backfilled: " + b.id);
		}
	}

	const after = [];
	if (APPLY) for (const row of recent){
		const fold = await cards.fold(row.id);
		if (!fold) continue;
		const d = diagnose(fold);
		if (d.empty || d.no_task_link) after.push(row.id);
	}

	return { checked: recent.length, before: before.length, fixed, after: APPLY ? after.length : null, left_alone_no_matching_ask: before.length - fixed };
}

main().then(r => console.log("\n" + JSON.stringify(r))).catch(e => { console.error(e); process.exit(1); });
