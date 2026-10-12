// run-pipeline.mjs — the proof for items 1-2: run the REAL pipeline code (Asks.ensure_card +
// Cards.create_for_ask) over today's four named asks, so each card that appears exists because
// the code made it, not because an agent typed it by hand.
//
// Run this from wherever it lives — main tree or worktree — it always resolves paths from its
// own file location (`import.meta.url`), never the caller's cwd, so `node .../run-pipeline.mjs`
// works the same from any directory. It is NOT a live Servex tick: it is the same one-off-CLI
// pattern `Servex/asks/mark.mjs` already uses to work the ledger without a running Servex.
//
// ⚠ Cards/asks are the MAIN tree's live state (Servex/asks/readme.md: "Servex writes to the
// main tree's asks.jsonl... mark asks from the main tree"). Run this from the MAIN checkout —
// C:\Code\lew42\monorepo — not a worktree, or it will read/write a stale copy nobody sees.
//
// Usage: node public/framework/ai/2026-10-02/card-pipeline/run-pipeline.mjs [--dry]

import path from "node:path";
import { fileURLToPath } from "node:url";
import Asks from "../../../../../Servex/asks/Asks.js";
import Cards from "../../../../../Servex/cards/Cards.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../../");       // repo root
const AI_ROOT = path.resolve(ROOT, "public/framework/ai");
const ASKS_FILE = path.join(AI_ROOT, "asks.jsonl");
const DRY = process.argv.includes("--dry");

// Today's four named asks (card-pipeline/requirements.md, "Then"). Two of the four
// (ai-system-docs, framework-home) had no route line in the ledger at all — written here
// through `append_line` (never by hand into the file), so the ledger has an entry for every
// major ask of the day, which is the exact bug this task fixes.
const TODAY_IDS = ["page-extends-item-build", "panel2-sessions", "ai-system-docs", "framework-home"];

const asks = new Asks({ file: ASKS_FILE });
const cards = new Cards({ root: AI_ROOT });
asks.servex = { cards };

async function ensure_routed(){
	const folded = await asks.read();
	const missing = [];
	if (!folded["ai-system-docs"]) missing.push({
		ask: { at: "2026-10-02T18:12:43-05:00", id: "ai-system-docs",
			title: "AI system docs: the System tab now explains the whole thing",
			words: "ai/2026-10-02/ai-system-docs/requirements.md",
			owner: "task-mastermind-ai-system-docs", card: "", status: "landed",
			note: "owner (mobile): 'link me to our system documentation'; landed same day" } });
	if (!folded["framework-home"]) missing.push({
		ask: { at: "2026-10-02T00:00:00-05:00", id: "framework-home",
			title: "framework: new home page, dark class cards, sprawl layout",
			words: "ai/2026-10-02/framework-home/requirements.md",
			owner: "task-mastermind-framework-home",
			card: "2026/10/02/framework-home-sections-dark-class-cards", status: "building",
			note: "card already existed, made by hand before this pipeline; this line gives it a real ask route" } });
	for (const line of missing){
		console.log((DRY ? "[dry] would route: " : "routing: ") + line.ask.id);
		if (!DRY) await asks.append_line(line);
	}
	return missing.length;
}

async function run(){
	const routed = await ensure_routed();
	// Review round 2's own finding: the first cut of this script skipped `is_major()` for these
	// four, which meant "the pipeline made the cards" wasn't actually true — a script was just
	// told to. Fixed at its root (is_major() now also reads the brief TEXT, and treats a
	// `task-mastermind-*` owner as its own major signal, which is honestly what all four of
	// today's asks share) — so this calls the EXACT SAME `ensure_card()` the live 60s tick
	// calls, nothing re-implemented here, nothing gated out.
	if (!DRY) for (const id of TODAY_IDS){
		const ask = (await asks.read())[id];
		if (ask) await asks.ensure_card(ask);
	}
	const folded = await asks.read();
	const report = TODAY_IDS.map(id => {
		const ask = folded[id];
		if (!ask) return { id, result: "not in the ledger" };
		if (!ask.card) return { id, result: DRY ? "[dry] not checked" : "ensure_card left it uncarded — see is_major()" };
		return { id, result: "has a card", card: ask.card, by_this_run: ask.history?.at(-1)?.by === "servex-asks-card" };
	});
	console.log(JSON.stringify({ routed_missing_lines: routed, today: report }, null, 2));
}

run().catch(e => { console.error(e); process.exit(1); });
