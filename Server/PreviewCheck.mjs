// Server/PreviewCheck.mjs: load pages of a deployed site (a Cloudflare branch preview, or production) in a
// real headless browser and say which ones are blank, throw, or get HTML where a JavaScript module should be.
// Why: on 2026-10-31 every page of the claude/replay-tests preview was blank while every test passed, because
// Cloudflare left a module out (.assetsignore) and answered it with index.html. Only a real browser on the real
// deploy shows that. Server/deploy-imports.test.mjs is the fast static check; this is the proof.
//
//   node Server/PreviewCheck.mjs https://claude-replay-tests-monorepo.lew42.workers.dev
//   node Server/PreviewCheck.mjs <base url> /framework/ /framework/core/Item/replay/      (your own page list)
//   node Server/PreviewCheck.mjs <base url> --all                                          (every page in the repo)
//
// Uses the shared browser (Server/Browser.mjs, global Playwright). Exit code 1 if any page is blank or broken.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import Browser from "./Browser.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEY_PAGES = ["/", "/framework/", "/framework/core/", "/framework/core/Item/", "/framework/core/Item/replay/",
	"/framework/core/Test/view/?file=core/Item/replay.test.mjs", "/framework/ai/", "/framework/core/Page/", "/framework/ext/Shots/"];

// Every page folder the deploy uploads: a tracked page.js or page.jsonl outside the session records and shot folders.
function all_pages(){
	const out = execSync("git ls-files public", { cwd: REPO, encoding: "utf8", maxBuffer: 64 << 20 });
	return [...new Set(out.split("\n")
		.filter(f => /\/page\.(js|jsonl)$/.test(f))
		.filter(f => !/^public\/framework\/ai\/sessions\/(20|[0-9a-f]{8}-)/.test(f) && !/\/(shots|screenshots)\//i.test(f))
		.map(f => f.replace(/^public/, "").replace(/page\.(js|jsonl)$/, "")))].sort();
}

const [base, ...rest] = process.argv.slice(2);
if (!base){ console.log("usage: node Server/PreviewCheck.mjs <base url> [--all | /page/ ...]"); process.exit(2); }
const pages = rest[0] === "--all" ? all_pages() : rest.length ? rest : KEY_PAGES;
const CONCURRENCY = 4, RENDER_MS = 15000;

const browser = await Browser.browser();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
const results = [];
let next = 0;
async function worker(){
	while (next < pages.length){
		const url = pages[next++];
		const p = await ctx.newPage();
		const r = { url, chars: 0, problems: [] };
		p.on("pageerror", e => r.problems.push("throws: " + e.message.slice(0, 160)));
		p.on("response", res => {
			const type = res.request().resourceType(), ct = res.headers()["content-type"] || "";
			if (type === "script" && !/javascript/.test(ct)) r.problems.push(`module came back as ${ct || "?"}: ${new URL(res.url()).pathname}`);
		});
		try {
			await p.goto(base.replace(/\/$/, "") + url, { waitUntil: "domcontentloaded", timeout: 30000 });
			await p.waitForFunction(() => (document.body?.innerText || "").trim().length > 30, null, { timeout: RENDER_MS }).catch(() => {});
			r.chars = await p.evaluate(() => (document.body?.innerText || "").trim().length);
		} catch (e){ r.problems.push("did not load: " + e.message.split("\n")[0]); }
		if (r.chars <= 30) r.problems.unshift(`blank (${r.chars} characters of text)`);
		await p.close();
		results.push(r);
	}
}
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pages.length) }, worker));
await Browser.close();

const bad = results.filter(r => r.problems.length);
for (const r of bad) console.log(`✗ ${r.url}\n    ${[...new Set(r.problems)].slice(0, 4).join("\n    ")}`);
console.log(`${results.length} pages: ${results.length - bad.length} render, ${bad.length} blank or broken (${base})`);
process.exitCode = bad.length ? 1 : 0;
