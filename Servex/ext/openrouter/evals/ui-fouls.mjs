#!/usr/bin/env node
/* ui-fouls.mjs — the vision rung, after the ladder (test-library requirements.md,
 * "Amendment 3: Phase 7"). Three tiny fixture pages, each with exactly ONE planted
 * design foul (zero padding, 400px overflow, low contrast). A model is shown a
 * screenshot and asked to describe the UI, then name its worst fouls — scored on
 * whether it found the planted one, and whether it invented fouls that aren't there.
 *
 * Reuses the same pieces as library.mjs and websearch.mjs rather than building a
 * second harness (CLAUDE.md law 6): Server/browser.mjs for the screenshot,
 * provider.js's env_for/disallowed_tools_for for the model call, and the Claude
 * Agent SDK's own Read tool to hand the model the screenshot — no image content
 * block plumbing needed, and it proves the same path an OpenRouter tool-capable
 * model would use.
 *
 *   node Servex/ext/openrouter/evals/ui-fouls.mjs [--models a,b] [--only id]
 *
 * One screenshot per fixture, taken once and reused for every model (the page
 * never changes). Results: one line per run in ui-fouls-results.jsonl next to
 * this file.
 */
import { query } from "@anthropic-ai/claude-agent-sdk";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env_for, provider_for, disallowed_tools_for } from "../provider.js";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const FOULS_DIR = path.join(HERE, "ui-fouls");
const OUT_JSONL = path.join(FOULS_DIR, "ui-fouls-results.jsonl");
// Shots need to be on a URL the running site can load as a real page (Page/app.js
// module system), so they're written into the test-library task's own runs/ dir,
// which the filesystem probe already resolves (test-library/page.js, committed
// earlier this task) — not under evals/, which the site never serves.
const SHOTS_ROOT = path.join(HERE, "../../../../public/framework/ai/2026-09-30/openrouter-harness/test-library/runs/ui-fouls");
const SITE_BASE = process.env.LIBRARY_SITE_BASE || "http://monorepo.localhost";

function loadFouls(only){
	const ids = fs.readdirSync(FOULS_DIR).filter(n => fs.existsSync(path.join(FOULS_DIR, n, "test.json")));
	return ids.filter(id => !only || id === only).map(id => ({
		id, dir: path.join(FOULS_DIR, id),
		...JSON.parse(fs.readFileSync(path.join(FOULS_DIR, id, "test.json"), "utf8"))
	}));
}

/* One screenshot per fixture, taken once (not per model — the page is static).
 * Copies the fixture's page.js into a real site run dir so it loads through the
 * normal Page/app.js module system, then shoots it with Server/browser.mjs at the
 * test's own viewport. */
async function shootFixture(foul){
	const runDir = path.join(SHOTS_ROOT, foul.id);
	fs.mkdirSync(runDir, { recursive: true });
	fs.copyFileSync(path.join(foul.dir, "page.js"), path.join(runDir, "page.js"));
	const shotPath = path.join(runDir, "shot.png");
	if (fs.existsSync(shotPath)) return shotPath; // reuse — the page is static

	const { browser } = await import("../../../../Server/browser.mjs");
	const b = await browser();
	const url = `${SITE_BASE}/framework/ai/2026-09-30/openrouter-harness/test-library/runs/ui-fouls/${foul.id}/`;
	const ctx = await b.newContext({ viewport: foul.viewport });
	const page = await ctx.newPage();
	await page.goto(url, { waitUntil: "load" });
	await page.waitForTimeout(600); // let layout/fonts settle — no animation on these pages
	await page.screenshot({ path: shotPath });
	await ctx.close();
	return shotPath;
}

const TURN_TIMEOUT_MS = 90_000;
const MAX_TURNS = 4;

async function runOne(model, foul, shotPath){
	const env = { ...process.env, ...env_for(provider_for(model)) };
	const prompt = `Read the screenshot at ${shotPath}. Describe this UI in a sentence or two, `
		+ `then name its worst design fouls, most serious first. Be specific about what's wrong `
		+ `and where — don't just say "it looks fine".`;

	const aborter = new AbortController();
	const timer = setTimeout(() => aborter.abort(), TURN_TIMEOUT_MS);
	let result_text = null, is_error = false, cost_sdk = 0;
	try {
		const stream = query({
			prompt,
			options: {
				model, cwd: process.cwd(), env,
				permissionMode: "bypassPermissions",
				allowDangerouslySkipPermissions: true,
				maxTurns: MAX_TURNS,
				abortController: aborter,
				...(disallowed_tools_for(model).length ? { disallowedTools: disallowed_tools_for(model) } : {})
			}
		});
		for await (const message of stream){
			if (message.type === "result"){
				is_error = !!message.is_error;
				result_text = message.result ?? null;
				cost_sdk = message.total_cost_usd ?? 0;
			}
		}
	} catch (e){
		is_error = true; result_text = String(e?.message || e);
	} finally {
		clearTimeout(timer);
	}

	const lower = (result_text ?? "").toLowerCase();
	const found_planted = foul.keywords.some(k => lower.includes(k.toLowerCase()));
	return { model, foul: foul.id, planted_foul: foul.planted_foul, found_planted,
		is_error, cost_usd: cost_sdk, response: result_text };
}

async function main(){
	const args = process.argv.slice(2);
	const flag = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
	const models = (flag("--models") || "claude-opus-5-5").split(",").map(s => s.trim()).filter(Boolean);
	const only = flag("--only");
	const fouls = loadFouls(only);
	if (!fouls.length) throw new Error(`no ui-fouls test "${only}" under ${FOULS_DIR}`);

	console.log(`ui-fouls.mjs: ${fouls.length} fixture(s) x ${models.length} model(s)`);
	const rows = [];
	for (const foul of fouls){
		const shotPath = await shootFixture(foul);
		console.log(`  ${foul.id}: shot at ${path.relative(process.cwd(), shotPath)} (planted: ${foul.planted_foul})`);
		for (const model of models){
			console.log(`    ${model} ...`);
			const row = { at: new Date().toISOString(), ...(await runOne(model, foul, shotPath)) };
			rows.push(row);
			fs.appendFileSync(OUT_JSONL, JSON.stringify(row) + "\n");
			console.log(`      found_planted=${row.found_planted} cost=$${row.cost_usd?.toFixed(4) ?? "?"} error=${row.is_error}`);
		}
	}

	console.log("\n" + "=".repeat(72));
	console.log("fixture".padEnd(16), "model".padEnd(26), "found?", "$");
	for (const r of rows) console.log(r.foul.padEnd(16), r.model.padEnd(26), String(r.found_planted).padEnd(6), r.cost_usd?.toFixed(4) ?? "?");
	console.log(`\nFull rows in ${path.relative(process.cwd(), OUT_JSONL)}`);
}

main()
	.catch(e => { console.error(String(e?.stack || e)); process.exitCode = 1; })
	.finally(async () => { try { (await import("../../../../Server/browser.mjs")).close?.(); } catch {} });
