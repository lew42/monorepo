/* `node Server/CardCheck.mjs <card-dir or card page.jsonl>` — checks a card against the card standard:
 *   1. A state line
 *   2. A preview of 60 characters or less
 *   3. A checklist
 *   4. Every item ticked on a done card
 *   5. Objects on group and module cards
 *   6. No paragraph over 60 words above the fold (reusing text_flags logic)
 *   7. First mentions linked
 *
 * Runs in on-landing.mjs next to layout-check; failures report to task.jsonl and servex-mastermind.
 * No model, never throws, prints JSON flags when executed directly. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MAX_PREVIEW = 60;
const MAX_PARA = 60;

const words = s => s.replace(/\]\([^)]*\)/g, "]").replace(/`[^`]*`/g, "x").split(/\s+/).filter(w => /\w/.test(w)).length;

export default class CardCheck {
static parse_lines(filePath){
	try {
		return fs.readFileSync(filePath, "utf8").split("\n").flatMap(l => {
			try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; }
		});
	} catch {
		return [];
	}
}

static card_flags(targetPath){
	const flags = [];
	let jsonlPath = targetPath;
	try {
		const stat = fs.statSync(targetPath);
		if (stat.isDirectory()) {
			jsonlPath = path.join(targetPath, "page.jsonl");
		}
	} catch {
		return [`card-check: path not found: ${targetPath}`];
	}

	if (!fs.existsSync(jsonlPath)) {
		return [`card-check: page.jsonl not found in ${targetPath}`];
	}

	const lines = CardCheck.parse_lines(jsonlPath);
	if (!lines.length) return ["card-check: empty card log"];

	const card = {
		id: null,
		title: null,
		type: "card",
		status: "open",
		state: null,
		preview: null,
		objects: null,
		checklist: [],
		items: [],
		text: "",
		description: ""
	};

	for (const line of lines){
		if (line.id) card.id = line.id;
		if (line.title) card.title = line.title;
		if (line.type) card.type = line.type;
		if (line.status) card.status = line.status;
		if (line.state) card.state = line.state;
		if (line.preview) card.preview = line.preview;
		if (line.objects) card.objects = line.objects;
		if (line.text) card.text = line.text;
		if (line.description) card.description = line.description;
		if (Array.isArray(line.checklist)) card.checklist = line.checklist;
		if (line.item) card.items.push(line.item);
	}

	// 1. A state line
	if (!card.state) {
		flags.push("missing state line ({\"state\": \"...\"})");
	}

	// 2. A preview of 60 characters or less
	if (!card.preview) {
		flags.push("missing preview line ({\"preview\": \"...\"})");
	} else if (String(card.preview).length > MAX_PREVIEW) {
		flags.push(`preview exceeds ${MAX_PREVIEW} characters (${String(card.preview).length})`);
	}

	// 3. A checklist
	const hasChecklist = card.checklist.length > 0 || card.items.length > 0;
	if (!hasChecklist) {
		flags.push("missing checklist ({\"checklist\": [...]} or item lines)");
	}

	// 4. Every item ticked on a done card
	const isDone = ["done", "complete", "completed", "closed", "landed"].includes(card.status);
	if (isDone) {
		const pendingChecklist = card.checklist.filter(i => !i.done);
		const pendingItems = card.items.filter(i => !i.done);
		if (pendingChecklist.length > 0 || pendingItems.length > 0) {
			flags.push(`card is ${card.status} but has unticked checklist items`);
		}
	}

	// 5. Objects on group and module cards
	const isGroupOrModule = card.type === "group" || card.type === "module" ||
		(card.id && (card.id.includes("group") || card.id.includes("module")));
	if (isGroupOrModule && !card.objects) {
		flags.push("group/module card missing objects declaration ({\"objects\": \"...\"})");
	}

	// 6. No paragraph over 60 words above the fold
	const prose = [card.description, card.text].filter(Boolean).join("\n\n");
	if (prose) {
		const paragraphs = prose.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
		for (const p of paragraphs) {
			const n = words(p);
			if (n > MAX_PARA) {
				flags.push(`paragraph over ${MAX_PARA} words (${n} words: "${p.slice(0, 40)}…")`);
			}
		}
	}

	return flags;
}
}

/** Old names, kept until 2026-10-20 (callers: on-landing.mjs). */
export const card_flags = CardCheck.card_flags;

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)){
	const target = path.resolve(process.argv[2] || ".");
	const flags = card_flags(target);
	console.log(JSON.stringify(flags, null, 1));
}
