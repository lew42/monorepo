// sources.mjs — the source library's own tool: look before you fetch, and the fetcher itself.
// Read the module first: public/framework/sources/readme.md
//
// usage:
//   node Server/sources.mjs --cite <topic>     what's already saved for <topic> (url + path,
//                                               so an agent checks before fetching again)
//   node Server/sources.mjs --cite             list every topic that has anything saved
//   node Server/sources.mjs "<question>" --topic <topic> [--n 2|3] [--model <name>]
//                                               spawn `--n` headless searchers (WebSearch +
//                                               WebFetch only), dedupe what they bring back,
//                                               and save each surviving page as markdown
//
// No npm dependency — spawn and fs are all this needs, per the root CLAUDE.md.
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const PUBLIC = path.resolve("public");
const SOURCES = path.join(PUBLIC, "framework", "sources");

// A searcher gets this long to finish both rounds of search before it is treated as failed —
// a real web fan-out with follow-ups regularly takes a couple of minutes.
const SEARCHER_TIMEOUT_MS = 5 * 60 * 1000;

// ---- small file helpers -----------------------------------------------------------------
function readJsonl(file){
	if (!fs.existsSync(file)) return [];
	return fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean)
		.map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
}

// A single fs.appendFileSync is one write() call, so two fan-outs racing on the same topic's
// index.jsonl each land a whole, un-torn line — never a rewrite, so neither can clobber the other.
function appendJsonl(file, obj){
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.appendFileSync(file, JSON.stringify(obj) + "\n");
}

function slugify(text){
	return String(text).toLowerCase().trim()
		.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "page";
}

function uniqueSlug(dir, title){
	const base = slugify(title);
	let slug = base, n = 2;
	while (fs.existsSync(path.join(dir, `${slug}.md`))) slug = `${base}-${n++}`;
	return slug;
}

// ---- deliverable 1: cite() — read before you fetch ---------------------------------------
function cite(topic){
	if (!topic) {
		// The same top-level index.jsonl page.js reads — not a directory scan, which would
		// also list doc/ (this module's own docs) as if it were a topic. Deduped: a race
		// between two fan-outs seeding the same new topic at once can still double-append
		// (the comment above appendJsonl(topicsFile, …) in fanOut() has the measurement).
		const topics = [...new Set(readJsonl(path.join(SOURCES, "index.jsonl")).map(r => r.topic))];
		if (!topics.length) return void console.log('No topics saved yet. Seed one: node Server/sources.mjs "<question>" --topic <name>');
		console.log("Topics with sources saved:");
		topics.forEach(t => console.log("  " + t));
		return;
	}

	const rows = readJsonl(path.join(SOURCES, topic, "index.jsonl"));
	if (!rows.length) return void console.log(`Nothing saved yet for "${topic}". Fetch it: node Server/sources.mjs "<question>" --topic ${topic}`);

	console.log(`${rows.length} source(s) already saved for "${topic}" — check here before fetching any of these again:\n`);
	rows.forEach(r => console.log(`${r.title}\n  ${r.url}\n  ${r.path}\n`));
}

// ---- deliverable 2: the fan-out ------------------------------------------------------------

// One searcher: a headless `claude -p` turn, tools trimmed to WebSearch/WebFetch only (the
// house pattern is Server/plugins/Ask.js:158-208), told to answer with nothing but a JSON
// array. Never throws — a dead or unparseable searcher resolves with `{ error }` so one bad
// searcher can't take the whole run down.
function searcher(question, model, i){
	return new Promise(resolve => {
		// ⚠ `--tools` alone only picks WHICH tools exist — it does not waive the prompt
		// each one still needs, and a headless `-p` searcher has nobody to answer that
		// prompt (measured live: `acceptEdits` still asked "I need permission to use
		// WebSearch" and produced nothing but a bill — acceptEdits waives an EDIT
		// prompt, not a tool-use one). `--permission-mode bypassPermissions` is what
		// actually runs unattended (measured live from an unrestricted parent: the
		// searcher used WebSearch with no prompt at all) — safe here because `--tools`
		// leaves this searcher nothing to edit anyway, only WebSearch/WebFetch.
		const args = ["-p", "--output-format", "stream-json", "--verbose", "--model", model,
			"--tools", "WebSearch,WebFetch", "--permission-mode", "bypassPermissions", "--session-id", randomUUID()];
		const child = spawn(process.env.CLAUDE_BIN || "claude", args, { windowsHide: true });

		const prompt = [
			"You already have WebSearch and WebFetch enabled and approved for this session — use them right away, do not ask for permission or say you need it.",
			`Search the web for: ${question}`,
			"Prefer official documentation sites and GitHub source over blog posts or forum answers.",
			"After your first round of search results, run one or two FOLLOW-UP searches from what you found, to go deeper or confirm what you learned.",
			"Then answer with ONLY a JSON array (no prose, no markdown code fence, nothing else) of the best 2 to 4 pages you found, this exact shape:",
			'[{"url":"...","title":"...","kind":"docs|source|article","authority":"high|medium|low","markdown":"..."}]',
			'"kind": docs = an official documentation site, source = source code (a GitHub file or repo README), article = anything else (a blog post, a forum answer).',
			'"authority": high = the project\'s own docs or source, medium = a well-known third party, low = unverified.',
			'"markdown" is that page\'s own content, already converted to markdown — clean up what WebFetch already gave you, do not re-fetch the page a second time just to convert it.',
		].join("\n");
		child.stdin.end(prompt);

		let buf = "", err = "", result = null;
		const timer = setTimeout(() => child.kill(), SEARCHER_TIMEOUT_MS);

		child.stdout.on("data", d => {
			buf += d;
			const lines = buf.split("\n");
			buf = lines.pop();
			lines.forEach(line => {
				if (!line.trim()) return;
				try { const e = JSON.parse(line); if (e.type === "result") result = e; } catch {}
			});
		});
		child.stderr.on("data", d => { err += d; });

		child.on("error", e => { clearTimeout(timer); resolve({ i, error: `spawn failed: ${e.message}` }); });
		child.on("close", code => {
			clearTimeout(timer);
			if (!result) return resolve({ i, error: err.trim().slice(-400) || `claude exited ${code} with no result` });

			const cost_usd = result.total_cost_usd || 0;
			const pages = parsePages(String(result.result || ""));
			if (!pages) return resolve({ i, error: `unparseable output: ${String(result.result || "").slice(0, 200)}`, cost_usd });
			resolve({ i, pages, cost_usd });
		});
	});
}

// Searchers are told to answer with ONLY a JSON array; this tolerates one wrapped in a
// ```json fence anyway, since a model saying "only JSON" and then fencing it is common.
function parsePages(text){
	const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
	try {
		const data = JSON.parse(cleaned);
		return Array.isArray(data) ? data.filter(p => p && typeof p.url === "string") : null;
	} catch { return null; }
}

async function fanOut(question, topic, n, model){
	const dir = path.join(SOURCES, topic);
	fs.mkdirSync(dir, { recursive: true });

	const indexFile = path.join(dir, "index.jsonl");
	const already = new Set(readJsonl(indexFile).map(r => r.url));

	console.log(`Searching "${question}" for topic "${topic}" — ${n} searcher(s), model ${model}…`);
	const results = await Promise.all(Array.from({ length: n }, (_, i) => searcher(question, model, i + 1)));

	const ok = results.filter(r => !r.error);
	const failed = results.filter(r => r.error);
	const totalCost = results.reduce((sum, r) => sum + (r.cost_usd || 0), 0);
	const found = ok.flatMap(r => r.pages);

	// Dedupe by url — across every searcher in this run, AND against what the topic already
	// has, so a rerun never saves the same page twice.
	const seen = new Set(already);
	const kept = [];
	for (const page of found) {
		if (!page?.url || seen.has(page.url)) continue;
		seen.add(page.url);
		kept.push(page);
	}

	const written = [];
	for (const page of kept) {
		const slug = uniqueSlug(dir, page.title || page.url);
		const relPath = `${topic}/${slug}.md`;
		const fetched_at = new Date().toISOString();
		const kind = ["docs", "source", "article"].includes(page.kind) ? page.kind : "article";
		const authority = ["high", "medium", "low"].includes(page.authority) ? page.authority : "low";

		const frontmatter = ["---",
			`url: ${JSON.stringify(page.url)}`,
			`title: ${JSON.stringify(page.title || page.url)}`,
			`kind: ${kind}`,
			`authority: ${authority}`,
			`fetched_at: ${fetched_at}`,
			"---", "", String(page.markdown || "").trim(), ""].join("\n");

		fs.writeFileSync(path.join(dir, `${slug}.md`), frontmatter);
		appendJsonl(indexFile, { slug, url: page.url, title: page.title || page.url, kind, authority, fetched_at, path: relPath });
		written.push(relPath);
	}

	// Re-checked right here, not cached from the top of this function — a run takes a couple
	// of minutes of real searching, so caching "is this a new topic?" from the start would
	// race a second fan-out on the same topic started around the same time (measured: two
	// concurrent runs on "openrouter" both saw no top-level entry yet and both appended one).
	const topicsFile = path.join(SOURCES, "index.jsonl");
	if (written.length && !readJsonl(topicsFile).some(r => r.topic === topic)) appendJsonl(topicsFile, { topic });

	console.log(`\n${found.length} page(s) came back, ${kept.length} were new, ${written.length} written.`);
	console.log(`Cost: $${totalCost.toFixed(4)} across ${ok.length}/${n} searcher(s).`);
	if (failed.length) failed.forEach(f => console.log(`  searcher ${f.i} failed: ${f.error}`));
	written.forEach(p => console.log(`  wrote sources/${p}`));
	if (!written.length && !failed.length) console.log("  (every page the searchers found was already in the library)");
}

// ---- CLI ------------------------------------------------------------------------------------
const args = process.argv.slice(2);
function flag(name){
	const i = args.indexOf(name);
	if (i < 0) return null;
	const v = args[i + 1];
	args.splice(i, v === undefined ? 1 : 2);
	return v === undefined ? null : v;
}

async function main(){
	if (args.includes("--cite")) {
		const i = args.indexOf("--cite");
		const topic = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : null;
		return void cite(topic);
	}

	const topic = flag("--topic");
	const nFlag = parseInt(flag("--n"), 10);   // ⚠ flag() splices the arg out — call it once, not twice
	const n = [2, 3].includes(nFlag) ? nFlag : 2;
	const model = flag("--model") || "haiku";
	const question = args.find(a => !a.startsWith("--"));

	if (!question || !topic) {
		console.error('usage: node Server/sources.mjs --cite [<topic>]\n' +
			'   or: node Server/sources.mjs "<question>" --topic <topic> [--n 2|3] [--model <name>]');
		process.exit(2);
	}

	await fanOut(question, topic, n, model);
}

main().catch(e => { console.error("sources.mjs: " + (e?.message || e)); process.exit(1); });
