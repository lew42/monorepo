/* `node Server/NavCheck.mjs <worktree dir> [--range michael/dev...HEAD] [--base http://127.0.0.1:<port>] [--since "7 days ago"] [--urls /a/b/ /c/d/]`
 *
 * The click test (the owner, 2026-10-23: a page nobody can click to does not exist). For every page a diff ADDS
 * (a new page.js or page.jsonl), it loads the page's PARENT on the worktree's own dev server in headless Chromium and
 * looks for an `a[href]` that points at the new page. No link, no pass. Declared `children:` names do not count: a leaf
 * page draws no link for them, and a name in a list is not a click. merge.mjs calls `NavCheck.check` and refuses a merge
 * with an unlinked new page; `--no-nav "why"` overrides it and is logged. Doc: Server/doc/nav-check.md
 *
 *   --range   the diff to read added pages from (default michael/dev...HEAD)
 *   --since   read added pages from `git log --since` instead (the census: every page the last week made)
 *   --urls    skip git; check these page urls (parents are their dirnames)
 *
 * Skipped (they are history or reached another way): dated session and task folders, any `tasks/` folder (a task page is
 * linked from its module's task list), `shots/`, `archive/`, `node_modules`.
 * Exit: 0 every page linked, 1 at least one has no link, 2 usage. */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Browser from "./Browser.mjs";

const SKIP = [/\/sessions\/\d{4}\/\d{2}\/\d{2}\//, /\/ai\/\d{4}-\d{2}-\d{2}\//, /\/ai\/\d{4}\/\d{2}\/\d{2}\//, /\/tasks\//, /\/shots\//, /\/archive\//, /\/node_modules\//];

export default class NavCheck {
	/** A page file's own site url: public/framework/ai/merge/page.js → /framework/ai/merge/. null for anything that is not a page file. */
	static url_of(file){
		if (!file.startsWith("public/") || !/\/page\.(?:js|jsonl)$/.test(file)) return null;
		return "/" + file.slice("public/".length).replace(/page\.(?:js|jsonl)$/, "");
	}

	static parent_of(url){ return url.replace(/[^/]+\/$/, ""); }

	/** The page urls a diff adds, from `git diff --diff-filter=A` (or `git log --since`), minus the skipped kinds. */
	static added(dir, { range = "michael/dev...HEAD", since } = {}){
		const args = since ? ["log", `--since=${since}`, "--diff-filter=A", "--name-only", "--format=", "--", "public"]
			: ["diff", "--no-renames", "--diff-filter=A", "--name-only", range, "--", "public"];
		const out = spawnSync("git", args, { cwd: dir, encoding: "utf8", windowsHide: true, maxBuffer: 64 << 20 });
		if (out.status !== 0) throw new Error(`NavCheck: git ${args.join(" ")} failed: ${out.stderr.trim()}`);
		return this.pages_of(dir, out.stdout.split(/\r?\n/).filter(Boolean));
	}

	/** The page urls among these repo-relative files: only ones that exist in `dir`, are page files, and are not a skipped kind. merge.mjs passes the files it already knows were added. */
	static pages_of(dir, files){
		const here = [...new Set(files)].filter(f => fs.existsSync(path.join(dir, f)));
		return [...new Set(here.filter(f => !SKIP.some(re => re.test("/" + f))).map(f => this.url_of(f)).filter(Boolean))].sort();
	}

	/** The parent to load: the nearest ancestor that has a page file on disk (a bare folder is not a page). */
	static parent_page(dir, url){
		let p = this.parent_of(url);
		while (p.length > 1 && !["page.js", "page.jsonl"].some(f => fs.existsSync(path.join(dir, "public", p, f)))) p = this.parent_of(p);
		return p;
	}

	static norm(pathname){ return pathname.endsWith("/") ? pathname : pathname + "/"; }

	/** Load `parent` at `base` and wait up to `wait` ms for an a[href] to `child`. Returns { linked, hrefs, error }. */
	static async reaches(browser, base, parent, child, wait = 6000){
		const page = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
		try {
			await page.goto(base + parent, { waitUntil: "load", timeout: 30000 });
			const want = this.norm(child);
			const linked = await page.waitForFunction(w => [...document.querySelectorAll("a[href]")].some(a => {
				try { const p = new URL(a.href, location.href).pathname; return (p.endsWith("/") ? p : p + "/") === w; } catch { return false; }
			}), want, { timeout: wait }).then(() => true, () => false);
			return { linked, error: null };
		} catch (e) { return { linked: false, error: e.message.split("\n")[0] }; }
		finally { await page.close().catch(() => {}); }
	}

	/** Check every url. `pages` is [{ url, parent }]. Returns [{ url, parent, linked, error }]. */
	static async check(base, pages, { wait } = {}){
		const browser = await Browser.browser();
		const out = [];
		for (const { url, parent } of pages) out.push({ url, parent, ...await this.reaches(browser, base, parent, url, wait) });
		return out;
	}

	static refusal(results){
		const bad = results.filter(r => !r.linked);
		if (!bad.length) return null;
		return `${bad.length} new page(s) nobody can click to (no a[href] on the parent page points at them):\n` +
			bad.map(r => `  ${r.url}  <- not linked from ${r.parent}${r.error ? `  (parent did not load: ${r.error})` : ""}`).join("\n") +
			`\nLink each from its parent page's visible navigation (a real link, not a name in a leaf page's children:). Override: --no-nav "why".`;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2);
	const take = name => { const i = argv.indexOf(name); if (i < 0) return undefined; return argv.splice(i, 2)[1]; };
	const range = take("--range"), since = take("--since"), base_arg = take("--base");
	const ui = argv.indexOf("--urls"), urls = ui < 0 ? null : argv.splice(ui).slice(1);
	const dir = argv[0] && path.resolve(argv[0]);
	if (!dir || !fs.existsSync(dir)){ console.error("usage: node Server/NavCheck.mjs <worktree dir> [--range a...b | --since '7 days ago' | --urls /x/ /y/] [--base http://127.0.0.1:port]"); process.exit(2); }
	const mangled = (urls ?? []).find(u => /Program Files/i.test(u));
	if (mangled){ console.error(`NavCheck: "${mangled}" was rewritten by Git Bash; rerun as MSYS_NO_PATHCONV=1 node Server/NavCheck.mjs ...`); process.exit(2); }
	let base = base_arg;
	if (!base){
		const { worktreeBase } = await import("./review.mjs");
		const main = path.dirname(spawnSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], { cwd: dir, encoding: "utf8", windowsHide: true }).stdout.trim());
		base = worktreeBase(main, dir);
	}
	if (!base){ console.error("NavCheck: no dev server found for that worktree; pass --base"); process.exit(2); }
	const list = urls ?? NavCheck.added(dir, { range, since });
	const results = await NavCheck.check(base, list.map(url => ({ url, parent: NavCheck.parent_page(dir, url) })));
	for (const r of results) console.log(`${r.linked ? "LINKED  " : "MISSING "} ${r.url}  (parent ${r.parent})`);
	const why = NavCheck.refusal(results);
	if (why) console.error(why);
	else console.log(`NavCheck: ${results.length} page(s), all linked.`);
	await Browser.close();
	process.exit(why ? 1 : 0);
}
