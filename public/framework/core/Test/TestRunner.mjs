// Finds, runs, watches and records node tests (X.test.mjs). Node only. Design: tasks/test-system/plan.md
import fs from "node:fs";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");
const SKIP = new Set(["node_modules", ".git", "worktrees", ".merge-base"]);
const IMPORT_RE = /(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s+)["']([^"']+)["']/gm;

export default class TestRunner {
	root = ROOT;
	results = process.env.TESTRUNNER_RESULTS || path.join(HERE, "results.jsonl");   // the env var is for proofs
	timeout = Number(process.env.TESTRUNNER_TIMEOUT) || 60000;   // 60 s; the env var is for proofs
	parallel = 4;
	cache = new Map();   // abs file -> { mtime, deps }
	running = new Set();

	rel(f){ return path.relative(this.root, f).split(path.sep).join("/"); }

	// Every *.test.mjs under the folders (repo-relative; default the whole repo).
	find(folders = [""]){
		const out = [];
		const walk = dir => {
			let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of ents) {
				const p = path.join(dir, e.name);
				if (e.isDirectory()) {
					if (SKIP.has(e.name) || this.rel(p) === "public/framework/ai/sessions") continue;
					walk(p);
				} else if (e.name.endsWith(".test.mjs")) out.push(this.rel(p));
			}
		};
		for (const f of folders.length ? folders : [""]) {
			const abs = path.resolve(this.root, f);
			if (fs.existsSync(abs) && fs.statSync(abs).isFile()) out.push(this.rel(abs));   // a file path runs that file
			else walk(abs);
		}
		return [...new Set(out)].sort();
	}

	// Files this file imports (relative or /framework/…), absolute paths, cached per mtime.
	deps(abs){
		let st; try { st = fs.statSync(abs); } catch { return []; }
		const c = this.cache.get(abs);
		if (c && c.mtime === st.mtimeMs) return c.deps;
		const src = fs.readFileSync(abs, "utf8"), deps = [];
		for (const m of src.matchAll(IMPORT_RE)) {
			let spec = m[1].split(/[?#]/)[0], target;
			if (spec.startsWith("/framework/")) target = path.join(this.root, "public", spec);
			else if (spec.startsWith(".")) target = path.resolve(path.dirname(abs), spec);
			else continue;
			if (fs.existsSync(target) && fs.statSync(target).isFile()) deps.push(target);
		}
		this.cache.set(abs, { mtime: st.mtimeMs, deps });
		return deps;
	}

	closure(abs){
		const seen = new Set(), todo = [abs];
		while (todo.length) {
			const f = todo.pop();
			if (seen.has(f)) continue;
			seen.add(f);
			if (/\.m?js$/.test(f)) todo.push(...this.deps(f));
		}
		return seen;
	}

	// Tests covering a changed file: same folder, or importing it transitively.
	covers(file, tests = this.find()){
		const abs = path.resolve(this.root, file), dir = path.dirname(abs);
		return tests.filter(t => {
			const ta = path.resolve(this.root, t);
			return path.dirname(ta) === dir || this.closure(ta).has(abs);
		});
	}

	// Tests near a changed file: the *.test.mjs in its own folder, plus the tests that import it directly (one level; deps() is the resolver covers() uses).
	near(file, tests = this.find()){
		const abs = path.resolve(this.root, file), dir = path.dirname(abs);
		return tests.filter(t => {
			const ta = path.resolve(this.root, t);
			return ta === abs || path.dirname(ta) === dir || this.deps(ta).includes(abs);
		});
	}

	/* In a git worktree Servex/node_modules is absent (it is gitignored); node gets a resolver that falls back to the main checkout's copy. Read-only: nothing is linked. */
	node_args(){
		if (this._args) return this._args;
		this._args = [];
		try {
			if (!fs.existsSync(path.join(this.root, "Servex", "node_modules"))) {
				const main = execFileSync("git", ["worktree", "list", "--porcelain"], { cwd: this.root, windowsHide: true, encoding: "utf8" }).split(String.fromCharCode(10))[0].replace(/^worktree /, "").trim();
				if (main && path.resolve(main) !== path.resolve(this.root) && fs.existsSync(path.join(main, "Servex", "node_modules"))) {
					this._args = ["--import", pathToFileURL(path.join(HERE, "fallback-modules.mjs")).href];
					this._env = { ...process.env, TEST_FALLBACK_FROM: main };
				}
			}
		} catch {}
		return this._args;
	}

	/* SITE_URL: the dev server for THIS checkout, so a browser test checks the code it sits beside, not the live site.
	   A worktree registered in the main repo's .worktrees.json is <name>.localhost; the main checkout is monorepo.localhost.
	   (2026-11-01: ChatV3.test ran a branch's new check against the live site's old code, and the merge was refused.) */
	site_url(){
		if (this._site) return this._site;
		this._site = "http://monorepo.localhost";
		try {
			const main = execFileSync("git", ["worktree", "list", "--porcelain"], { cwd: this.root, windowsHide: true, encoding: "utf8" }).split(String.fromCharCode(10))[0].replace(/^worktree /, "").trim();
			const reg = JSON.parse(fs.readFileSync(path.join(main, ".worktrees.json"), "utf8"));
			const hit = Object.values(reg).find(e => e.path && path.resolve(e.path).toLowerCase() === path.resolve(this.root).toLowerCase());
			if (hit) this._site = `http://${hit.name}.localhost`;
		} catch {}
		return this._site;
	}

	one(file, trigger, extra = {}){
		return new Promise(resolve => {
			const t0 = Date.now(); let out = "", timedOut = false;
			const child = spawn(process.execPath, [...this.node_args(), file], { cwd: this.root, windowsHide: true, env: { ...(this._env ?? process.env), SITE_URL: process.env.SITE_URL || this.site_url() } });
			const timer = setTimeout(() => { timedOut = true; child.kill(); }, this.timeout);
			child.stdout.on("data", d => out += d);
			child.stderr.on("data", d => out += d);
			child.on("close", code => {
				clearTimeout(timer);
				const ok = code === 0 && !timedOut;
				const line = { file, ok, ms: Date.now() - t0, at: new Date().toISOString(), trigger, ...extra };
				if (!ok) line.tail = (timedOut ? "TIMED OUT after " + this.timeout + "ms\n" : "") + out.trim().split(/\r?\n/).slice(-15).join("\n");
				if (timedOut) line.timeout = true;
				fs.appendFileSync(this.results, JSON.stringify(line) + "\n");
				console.log(`${ok ? "PASS" : timedOut ? "TIME" : "FAIL"} ${file} (${line.ms} ms)`);
				resolve(line);
			});
			child.on("error", e => { clearTimeout(timer); resolve({ file, ok: false, ms: 0, tail: String(e) }); });
		});
	}

	async run(files, { trigger = "manual", extra = {} } = {}){
		files = files.filter(f => !this.running.has(f));
		files.forEach(f => this.running.add(f));
		const out = [], queue = [...files];
		const worker = async () => { for (let f; (f = queue.shift());) { out.push(await this.one(f, trigger, extra)); this.running.delete(f); } };
		await Promise.all(Array.from({ length: Math.min(this.parallel, files.length) }, worker));
		const bad = out.filter(r => !r.ok), slow = out.filter(r => r.timeout);
		console.log(`${out.length - bad.length} passed, ${bad.length} failed (${slow.length} timed out), ${out.length} total`);
		return out;
	}

	watch(folders){
		let pending = new Set(), timer;
		const fire = () => {
			const changed = [...pending]; pending = new Set();
			const tests = this.find();
			for (const f of changed) {
				const hit = f.endsWith(".test.mjs") ? [f] : this.covers(f, tests);
				if (hit.length) this.run(hit, { trigger: "change:" + f }).catch(e => console.error("watch run failed:", e));
			}
		};
		for (const folder of folders) {
			fs.watch(path.resolve(this.root, folder), { recursive: true }, (_ev, name) => {
				if (!name || !/\.m?js$/.test(name) || /(^|[\\/])(node_modules|\.git)[\\/]/.test(name)) return;
				pending.add(this.rel(path.resolve(this.root, folder, name)));
				clearTimeout(timer); timer = setTimeout(fire, 300);
			});
			console.log("watching " + folder);
		}
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const args = process.argv.slice(2), r = new TestRunner();
	const norm = a => r.rel(path.resolve(process.cwd(), a)) || "";
	const i = args.indexOf("--covers"), n = args.indexOf("--near");
	if (args[0] === "--watch") r.watch(args.slice(1).map(norm));
	else if (args[0] === "--list" || i > -1 || n > -1) {
		const files = n > -1 ? r.near(norm(args[n + 1])) : i > -1 ? r.covers(norm(args[i + 1])) : r.find(args.filter(a => a !== "--list").map(norm));
		console.log(files.join("\n"));
	} else {
		const files = r.find(args.map(norm));
		const res = await r.run(files);
		process.exitCode = res.some(x => !x.ok) ? 1 : 0;
	}
}
