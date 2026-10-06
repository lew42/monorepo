/* Server/crawl.mjs — Nightly full crawl of the site under /framework/.
 *
 * Crawls every page under /framework/ at viewport 1920:
 * - Follows all same-site links under /framework/
 * - Records HTTP 404s, page load errors, and console errors
 * - Takes one screenshot per page into <outDir>/shots/
 * - Runs the padding check (Server/padding-check.mjs)
 * - Writes crawl.jsonl and summary.md
 * - Appends failures to public/framework/ai/todo.md (unless --no-todo)
 *
 * Machine-time only, zero tokens. Designed for nightly scheduled runs.
 * Builds on smoke.mjs link-following and padding-check.mjs.
 *
 * Usage:
 *   node Server/crawl.mjs [--limit N] [--base URL] [--seed PATH] [--out DIR] [--no-shots] [--no-todo]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { browser as launch, close as closeBrowser } from "./browser.mjs";
import { check_page } from "./padding-check.mjs";

const root = path.resolve(fileURLToPath(import.meta.url), "../..");
const argv = process.argv.slice(2);
const opt = name => { const i = argv.indexOf("--" + name); if (i < 0) return null; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const hasFlag = name => { const i = argv.indexOf("--" + name); if (i < 0) return false; argv.splice(i, 1); return true; };

const baseRaw = opt("base");
const baseOpt = baseRaw || process.env.CRAWL_BASE || "http://monorepo.localhost";
const seedOpt = opt("seed") || "/framework/";
const limitRaw = opt("limit");
const limitOpt = limitRaw != null ? Number(limitRaw) : null;
const outOpt = opt("out");
const noShots = hasFlag("no-shots");
const noTodo = hasFlag("no-todo");
const dryRun = hasFlag("dry");

const now = () => {
	const d = new Date(), o = -d.getTimezoneOffset(), p = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${o < 0 ? "-" : "+"}${p(o / 60)}:${p(o % 60)}`;
};

const dateStr = () => {
	const d = new Date();
	const p = n => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const outDir = outOpt ? path.resolve(outOpt) : path.join(root, "public/framework/ai", dateStr(), "crawl");
const shotsDir = path.join(outDir, "shots");
const jsonlFile = path.join(outDir, "crawl.jsonl");
const summaryFile = path.join(outDir, "summary.md");
const todoFile = path.join(root, "public/framework/ai/todo.md");

const SKIP_EXT = new Set([
	"png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "pdf", "zip", "csv", "txt",
	"md", "json", "jsonl", "mp4", "mp3", "wav", "woff", "woff2", "ttf", "otf", "css", "js", "map"
]);

const slug = u => u.replace(/^https?:\/\/[^/]+/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root";

/** Collect initial seeds from filesystem under public/framework/ */
function discoverStaticRoutes() {
	const routes = new Set([seedOpt]);
	const fwDir = path.join(root, "public/framework");

	function walk(dir) {
		try {
			for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
				const p = path.join(dir, f.name);
				if (f.isDirectory()) {
					if (f.name !== "node_modules" && f.name !== ".git") walk(p);
				} else if (f.name === "page.js" || f.name === "page.jsonl") {
					const rel = path.relative(path.join(root, "public"), dir).replaceAll("\\", "/");
					if (rel.startsWith("framework/ai/") && /\/\d{4}\/\d{2}\/\d{2}\//.test(rel)) {
						// AI 2 card directory maps to /framework/ai2/YYYY/MM/DD/...
						const cardSub = rel.replace(/^framework\/ai\//, "");
						routes.add(`/framework/ai2/${cardSub}/`);
					} else {
						routes.add(`/${rel}/`);
					}
				}
			}
		} catch {}
	}

	walk(fwDir);
	return [...routes];
}

/** Extract same-origin links on the active page */
async function extractLinks(page, base) {
	try {
		const hrefs = await page.$$eval(
			".page.active-page a[href]",
			as => as.filter(a => !a.closest(".sidebar-rail, .page-crumbs, .dev-bar")).map(a => a.getAttribute("href"))
		);
		const out = [];
		const baseOrigin = new URL(base).origin;
		for (const href of hrefs) {
			if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) continue;
			let u;
			try { u = new URL(href, page.url()); } catch { continue; }
			if (u.origin !== baseOrigin) continue;
			if (!u.pathname.startsWith("/framework/")) continue;
			const ext = (u.pathname.match(/\.([a-z0-9]+)$/i)?.[1] ?? "").toLowerCase();
			if (SKIP_EXT.has(ext)) continue;
			out.push(u.pathname);
		}
		return out;
	} catch {
		return [];
	}
}

async function main() {
	console.log(`Starting site crawl at ${now()}`);
	console.log(`Base URL: ${baseOpt}`);
	console.log(`Output directory: ${outDir}`);

	fs.mkdirSync(shotsDir, { recursive: true });

	const initialSeeds = discoverStaticRoutes();
	console.log(`Discovered ${initialSeeds.length} route seeds under /framework/`);

	if (dryRun) {
		console.log(`Dry run complete. Found ${initialSeeds.length} routes.`);
		return;
	}

	const queue = [...initialSeeds];
	const seen = new Set(queue);
	const results = [];
	const failures = [];

	let browserInstance;
	try {
		browserInstance = await launch();
	} catch (e) {
		console.error("Failed to launch browser:", e.message);
		return;
	}

	const context = await browserInstance.newContext();
	let scannedCount = 0;

	for (let i = 0; i < queue.length; i++) {
		if (limitOpt && scannedCount >= limitOpt) {
			console.log(`Hit page limit of ${limitOpt}. Stopping crawl.`);
			break;
		}

		const route = queue[i];
		scannedCount++;
		const fullUrl = new URL(route, baseOpt).href;
		const startTime = Date.now();

		const pageErrors = [];
		const consoleErrors = [];
		const network404s = [];

		const page = await context.newPage();
		await page.setViewportSize({ width: 1920, height: 1080 });

		page.on("console", msg => {
			if (msg.type() === "error") {
				const text = msg.text();
				if (!/Failed to load resource|blocked by CORS/.test(text)) {
					consoleErrors.push(text);
				}
			}
		});

		page.on("pageerror", err => {
			pageErrors.push(err.message);
		});

		page.on("response", resp => {
			const u = resp.url();
			if (resp.status() >= 400 && u.startsWith(baseOpt)) {
				// Ignore expected fallback probes
				if (!u.endsWith("/favicon.ico") && !u.endsWith("/files.jsonl") && !u.endsWith("/page.jsonl") && !u.endsWith("/spend.json")) {
					network404s.push(`${resp.status()} on ${u.replace(baseOpt, "")}`);
				}
			}
		});

		let loadFailed = false;
		let appLoadError = false;
		let paddingResult = null;
		let shotPath = null;

		try {
			const resp = await page.goto(fullUrl, { timeout: 15000, waitUntil: "domcontentloaded" });
			if (resp && resp.status() >= 400) {
				loadFailed = true;
				network404s.push(`HTTP ${resp.status()} on page document`);
			}

			await page.waitForTimeout(400);

			// Check App.js Page Load Error screen
			appLoadError = await page.evaluate(() => {
				const active = document.querySelector(".page.active-page");
				if (!active) return false;
				const h1 = active.querySelector("h1");
				return h1 && h1.textContent.includes("Page Load Error") && active.querySelector("pre.error") !== null;
			}).catch(() => false);

			// Extract newly linked pages
			const discovered = await extractLinks(page, baseOpt);
			for (const link of discovered) {
				if (!seen.has(link)) {
					seen.add(link);
					queue.push(link);
				}
			}

			// Screenshot
			if (!noShots) {
				const shotFile = path.join(shotsDir, `${slug(route)}.png`);
				await page.screenshot({ path: shotFile, fullPage: false }).catch(() => {});
				shotPath = path.relative(root, shotFile).replaceAll("\\", "/");
			}

			// Run padding check
			try {
				paddingResult = await check_page(page, 1920);
			} catch (pe) {
				paddingResult = { error: pe.message, violations: null };
			}

		} catch (e) {
			loadFailed = true;
			pageErrors.push(e.message);
		} finally {
			await page.close().catch(() => {});
		}

		const duration = Date.now() - startTime;
		const paddingViolations = paddingResult?.violations || 0;
		const isClean = !loadFailed && !appLoadError && !pageErrors.length && !consoleErrors.length && !network404s.length && paddingViolations === 0;

		const resultRow = {
			url: route,
			status: isClean ? "ok" : "fail",
			duration_ms: duration,
			errors: pageErrors,
			console_errors: consoleErrors,
			network_404s: network404s,
			page_load_error: appLoadError,
			padding_violations: paddingViolations,
			shot: shotPath
		};

		results.push(resultRow);
		fs.appendFileSync(jsonlFile, JSON.stringify(resultRow) + "\n");

		if (!isClean) {
			failures.push(resultRow);
			console.log(`[FAIL] ${route} (${duration}ms) — 404s:${network404s.length} errs:${pageErrors.length} console:${consoleErrors.length} pad:${paddingViolations}`);
		} else {
			if (scannedCount % 50 === 0 || scannedCount === 1) {
				console.log(`[OK] (${scannedCount}/${queue.length}) ${route} (${duration}ms)`);
			}
		}
	}

	await closeBrowser();

	// Write summary markdown
	const summaryMd = `# Site Crawl Summary — ${now()}

- **Base URL:** ${baseOpt}
- **Total Pages Checked:** ${results.length}
- **Clean Pages:** ${results.filter(r => r.status === "ok").length}
- **Pages with Issues:** ${failures.length}

${failures.length === 0 ? "All scanned pages loaded cleanly with zero console errors, 404s, or padding violations." : "## Failures\n\n" + failures.map(f => {
	const issues = [];
	if (f.page_load_error) issues.push("Page Load Error");
	if (f.network_404s.length) issues.push(`404s: ${f.network_404s.join(", ")}`);
	if (f.errors.length) issues.push(`Errors: ${f.errors.join("; ")}`);
	if (f.console_errors.length) issues.push(`Console: ${f.console_errors.join("; ")}`);
	if (f.padding_violations > 0) issues.push(`Padding violations: ${f.padding_violations}`);
	return `- [ ] **${f.url}** — ${issues.join(" | ")}${f.shot ? ` ([screenshot](/${f.shot}))` : ""}`;
}).join("\n")}
`;

	fs.writeFileSync(summaryFile, summaryMd, "utf8");
	console.log(`Crawl completed. Summary written to ${summaryFile}`);

	// Update todo.md with failures if requested
	if (!noTodo && failures.length > 0 && fs.existsSync(todoFile)) {
		try {
			const todoContent = fs.readFileSync(todoFile, "utf8");
			const failureNote = `\n### Nightly Crawl Findings (${dateStr()})\n${failures.slice(0, 15).map(f => `- **${f.url}**: ${f.network_404s.concat(f.errors).concat(f.console_errors).join(", ") || `${f.padding_violations} padding violations`}`).join("\n")}\n`;
			fs.appendFileSync(todoFile, failureNote, "utf8");
			console.log("Appended crawl failures to todo.md");
		} catch {}
	}
}

main().catch(err => {
	console.error("Crawl error:", err);
}).finally(() => {
	process.exitCode = 0;
});
