// Server/ai2-overview.mjs — builds public/framework/ai2/overview/overview.json
//
// Plain node, no dependency, run it with:  node Server/ai2-overview.mjs
// (must be run from the repo root, so its relative reads below find the files)
//
// What it does, in one sentence: it reads every task's task.jsonl, sorts
// each task into ONE familiar concept (Servex, Page, View, App, AI 2,
// Dictation, Research & Collab), and writes one small JSON file the
// Overview tab's page.js reads straight off disk — no server route, no
// live computation in the browser.
//
// See public/framework/ai2/doc/overview.md for how a task joins a concept
// and how to change the concept list.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd(); // must be the repo root — see the header comment
const AI_DIR = path.join(ROOT, "public/framework/ai");
const OUT_FILE = path.join(ROOT, "public/framework/ai2/overview/overview.json");
const PROMPTS_DIR = path.join(ROOT, ".claude/prompts");

// ---------------------------------------------------------------------------
// 1. THE CONCEPTS — fixed, in importance order. A task joins the FIRST one
//    whose `match` words appear in its slug, its group, or its request text
//    (all compared lowercase). No match -> the task is "unfiled", not forced
//    into the wrong bucket. `url` is that concept's real page on the site,
//    not a guess.
// ---------------------------------------------------------------------------
const CONCEPTS = [
	{ id: "servex", name: "Servex", icon: "dns", url: "/framework/servex/",
		match: ["servex"] },
	{ id: "page", name: "Page", icon: "description", url: "/framework/core/Page/",
		match: ["page.js", "page.jsonl", "paging", "pages-markdown", "page-drawer",
			"page-cms", "page-health", "page class", "page cms"] },
	{ id: "view", name: "View", icon: "widgets", url: "/framework/core/View/",
		match: ["view class", "web-ui", "panels", "popovers", "widgets"] },
	{ id: "app", name: "App", icon: "apps", url: "/framework/core/App/",
		match: ["apps", "app class"] },
	{ id: "ai2", name: "AI 2", icon: "dashboard", url: "/framework/ai2/",
		match: ["ai2", "ai-2", "ai 2", "dashboard", "ai-log", "ai-ops", "ai-dashboard",
			"ai-server", "ai-v3", "inbox", "card-to-task", "devbar-chat", "ai2-cards",
			"card-folders", "cards-content"] },
	{ id: "dictation", name: "Dictation", icon: "mic", url: "/framework/ux/Dictate/",
		match: ["dictate", "dictation", "transcri", "whisper", "voice", "mic"] },
	{ id: "research", name: "Research & Collab", icon: "science", url: "/framework/research/",
		match: ["research", "collab"] },
];

// ---------------------------------------------------------------------------
// 2. WALK every public/framework/ai/<date>/<slug>/task.jsonl (about 800 of
//    them) and merge its `assign` lines, latest value per key wins.
// ---------------------------------------------------------------------------
const FIELDS = ["request", "requested_at", "landed_at", "outcome", "cost_usd", "group", "links"];

function findTaskFiles() {
	const out = [];
	for (const dateDir of fs.readdirSync(AI_DIR, { withFileTypes: true })) {
		if (!dateDir.isDirectory() || !/^\d{4}-\d{2}-\d{2}$/.test(dateDir.name)) continue;
		const dateDirPath = path.join(AI_DIR, dateDir.name);
		for (const slugDir of fs.readdirSync(dateDirPath, { withFileTypes: true })) {
			if (!slugDir.isDirectory()) continue;
			const file = path.join(dateDirPath, slugDir.name, "task.jsonl");
			if (fs.existsSync(file)) out.push({ date: dateDir.name, slug: slugDir.name, file });
		}
	}
	return out;
}

function readTask({ date, slug, file }) {
	const task = { date, slug, id: `${date}/${slug}` };
	let text;
	try { text = fs.readFileSync(file, "utf8"); } catch { return task; }
	for (const line of text.split("\n")) {
		if (!line.trim()) continue;
		let obj;
		try { obj = JSON.parse(line); } catch { continue; }
		if (obj.assign) for (const k of FIELDS) if (k in obj.assign) task[k] = obj.assign[k];
		// A few tasks log a bare {"group": "..."} line outside `assign` — the
		// same grouping event, just not wrapped. Take it too.
		if (typeof obj.group === "string") task.group = obj.group;
	}
	return task;
}

// ---------------------------------------------------------------------------
// 3. THE OWNER'S OWN WORDS — link a task to the prompt it came from, when
//    one clearly matches, so the card can quote the owner verbatim instead
//    of a paraphrase. No match is fine; most tasks won't have one, either
//    because the prompt predates this log or the request was written by a
//    mastermind summarizing several prompts.
// ---------------------------------------------------------------------------
function readOwnerPrompts() {
	const prompts = [];
	if (!fs.existsSync(PROMPTS_DIR)) return prompts; // not every checkout has this
	for (const name of fs.readdirSync(PROMPTS_DIR)) {
		if (!name.endsWith(".jsonl")) continue;
		let text;
		try { text = fs.readFileSync(path.join(PROMPTS_DIR, name), "utf8"); } catch { continue; }
		for (const line of text.split("\n")) {
			if (!line.trim()) continue;
			let obj;
			try { obj = JSON.parse(line); } catch { continue; }
			if (obj.prompt && obj.prompt.author === "owner" && obj.prompt.text) prompts.push(obj.prompt.text);
		}
	}
	return prompts;
}

function findOwnerQuote(request, prompts) {
	if (!request) return null;
	const head = request.slice(0, 40).toLowerCase();
	if (head.length < 10) return null; // too short to match safely
	for (const text of prompts) {
		const low = text.toLowerCase();
		const promptHead = low.slice(0, 40);
		if (low.includes(head)) return text;
		if (promptHead.length >= 20 && head.includes(promptHead)) return text;
	}
	return null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// A match word counts only as a WHOLE word (or whole hyphenated/dotted token),
// never a plain substring — "mic" must not hit "michael/dev", and "page.js"
// must not hit every request that happens to mention a page.js file in
// passing. \b doesn't stop at "." or "/", so this builds the boundary by hand.
function containsWord(hay, word) {
	const esc = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const re = new RegExp(`(?:^|[^a-z0-9])${esc}(?:$|[^a-z0-9])`, "i");
	return re.test(hay);
}

function conceptFor(task) {
	// The slug and group are the task's own filing, chosen once, on purpose —
	// far less noisy than the free-text request. Try them first; only fall
	// back to the request when neither names a concept.
	const named = `${task.slug} ${task.group || ""}`.toLowerCase();
	for (const c of CONCEPTS) if (c.match.some(w => containsWord(named, w))) return c.id;
	const requested = (task.request || "").toLowerCase();
	for (const c of CONCEPTS) if (c.match.some(w => containsWord(requested, w))) return c.id;
	return null;
}

function truncate(str, n) {
	if (!str) return "";
	str = str.trim();
	return str.length > n ? str.slice(0, n - 1).trimEnd() + "…" : str;
}

// Strip the markdown an `outcome` is written in, down to plain words: bold,
// italics, links (keep the label), images, and inline code marks.
function stripMarkdown(str) {
	return str
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/[*_`#]/g, "")
		.trim();
}

function firstLine(str) {
	if (!str) return "";
	return str.split("\n").find(l => l.trim().length) || "";
}

// ---------------------------------------------------------------------------
// 4. BUILD
// ---------------------------------------------------------------------------
function build() {
	const now = new Date();
	const sevenDaysAgo = now.getTime() - 7 * 24 * 3600 * 1000;
	const prompts = readOwnerPrompts();

	const buckets = new Map(CONCEPTS.map(c => [c.id, { open: [], done: [], cost_usd: 0, stale_count: 0 }]));
	let unfiled = 0;

	for (const ref of findTaskFiles()) {
		const task = readTask(ref);
		const conceptId = conceptFor(task);
		if (!conceptId) { unfiled++; continue; }
		const bucket = buckets.get(conceptId);

		if (typeof task.cost_usd === "number") bucket.cost_usd += task.cost_usd;

		const requestedAt = task.requested_at ? new Date(task.requested_at) : null;
		const landedAt = task.landed_at ? new Date(task.landed_at) : null;
		const endTime = landedAt || now;
		const hours = requestedAt ? Math.round(((endTime - requestedAt) / 3600000) * 10) / 10 : null;

		const quote = findOwnerQuote(task.request, prompts) || task.request || "";
		const outcomeFirstLine = stripMarkdown(firstLine(task.outcome || ""));
		const links = Array.isArray(task.links) ? task.links : [];
		const taskUrl = `/framework/ai/${task.date}/${task.slug}/`;

		const ask = {
			task: task.id,
			quote: truncate(quote, 120),
			words_url: taskUrl,
			asked_at: task.requested_at || null,
			landed_at: task.landed_at || null,
			hours,
			cost_usd: typeof task.cost_usd === "number" ? task.cost_usd : null,
			outcome: truncate(outcomeFirstLine, 140),
			result_url: links[0]?.url || taskUrl,
			state: landedAt ? "done" : "open",
		};

		if (landedAt) {
			bucket.done.push(ask);
		} else if (requestedAt && requestedAt.getTime() >= sevenDaysAgo) {
			bucket.open.push(ask);
		} else {
			bucket.stale_count++;
		}
	}

	const concepts = CONCEPTS.map(c => {
		const b = buckets.get(c.id);
		b.open.sort((a, z) => (z.asked_at || "").localeCompare(a.asked_at || ""));
		b.done.sort((a, z) => (z.landed_at || "").localeCompare(a.landed_at || ""));
		return {
			id: c.id,
			name: c.name,
			icon: c.icon,
			url: c.url,
			open: b.open,
			done: b.done.slice(0, 30),
			done_count: b.done.length,
			stale_count: b.stale_count,
			cost_usd: Math.round(b.cost_usd * 100) / 100,
		};
	});

	return { built_at: now.toISOString(), unfiled, concepts };
}

const result = build();
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, "\t") + "\n");

console.log(`wrote ${OUT_FILE}`);
console.log(`unfiled: ${result.unfiled}`);
for (const c of result.concepts) {
	console.log(`  ${c.name}: open ${c.open.length}, done ${c.done_count} (showing ${c.done.length}), stale ${c.stale_count}, cost $${c.cost_usd}`);
}
