import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(HERE, "..", "..", "public");
const NAME = /^[a-z0-9-]+$/;

/* The subpages of ONE parent folder: add, rename, remove. The one implementation behind
 * `page_set({pages:{add|rename|remove}})` and `create_page` (doc: core/Page/doc/ai-api.md,
 * "How a subpage is stored"). The parent is always linked by appended `file`/`gone` lines in ITS page.jsonl (made if missing); no page.js is ever edited. Nothing is deleted: remove moves the
 * folder to `<parent>/_removed/<name>-<time>/`. `dry: true` returns the plan and touches nothing.
 * CLI: node Servex/agents/Subpages.js <add|rename|remove> <parent-url> <name> [to] [--dry] [--root <tree>] */
export default class Subpages {

	constructor(dir, { dry = false } = {}){
		this.dir = path.resolve(dir);
		this.dry = dry;
	}

	/** The Subpages of a page url like "/framework/ai/x/" inside a tree (the main one by default). */
	static at(url, { root, ...opts } = {}){
		const pub = root ? path.join(path.resolve(root), "public") : PUBLIC;
		return new Subpages(path.join(pub, ...String(url || "/").split("/").filter(Boolean)), opts);
	}

	get kind(){
		return fs.existsSync(path.join(this.dir, "page.js")) ? "page.js"
			: fs.existsSync(path.join(this.dir, "page.jsonl")) ? "page.jsonl" : null;
	}

	/** Make `<name>/page.jsonl` (line 1 = the labels) and link it from this parent. */
	add({ name, title, icon, description, ...more }){
		this.check_name(name);
		const dir = path.join(this.dir, name), kind = this.need_kind();
		if (fs.existsSync(dir)) throw new Error(`${name} already exists under ${this.dir}`);
		const first = { title: title ?? name, ...(icon ? { icon } : {}), ...(description ? { description } : {}), ...more };
		const plan = { action: "add", name, make: rel(dir + "/page.jsonl"), first, link: this.link_plan(kind, name) };
		if (this.dry) return { ok: true, dry: true, ...plan };
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, "page.jsonl"), JSON.stringify(first) + "\n");
		this.append({ file: `${name}/page.jsonl` });
		return { ok: true, ...plan };
	}

	/** Move the folder `name` to `to` and relink: a `gone` line for the old name, a `file` line for the new. */
	rename({ name, to }){
		this.check_name(name); this.check_name(to);
		const from = path.join(this.dir, name), dest = path.join(this.dir, to), kind = this.need_kind();
		if (!fs.existsSync(from)) throw new Error(`${name} does not exist under ${this.dir}`);
		if (fs.existsSync(dest)) throw new Error(`${to} already exists under ${this.dir}`);
		const plan = { action: "rename", moves: [{ from: rel(from), to: rel(dest) }] };
		if (this.dry) return { ok: true, dry: true, ...plan };
		fs.renameSync(from, dest);
		this.append({ file: `${name}/page.jsonl`, gone: true });
		this.append({ file: `${to}/page.jsonl` });
		return { ok: true, ...plan };
	}

	/** Move the folder aside to `_removed/<name>-<time>/` and unlink it. Never deletes. */
	remove(name){
		this.check_name(name);
		const from = path.join(this.dir, name), kind = this.need_kind();
		if (!fs.existsSync(from)) throw new Error(`${name} does not exist under ${this.dir}`);
		const dest = path.join(this.dir, "_removed", `${name}-${stamp()}`);
		const plan = { action: "remove", moves: [{ from: rel(from), to: rel(dest) }] };
		if (this.dry) return { ok: true, dry: true, ...plan };
		fs.mkdirSync(path.dirname(dest), { recursive: true });
		fs.renameSync(from, dest);
		this.append({ file: `${name}/page.jsonl`, gone: true });
		return { ok: true, ...plan };
	}

	/** The subpages a parent's page.jsonl lists right now (file lines minus gone), in order. */
	static listed(file){
		const out = new Map();
		let text = ""; try { text = fs.readFileSync(file, "utf8"); } catch {}
		for (const line of text.split("\n")){
			let obj; try { obj = JSON.parse(line); } catch { continue; }
			const m = /^([^/]+)\/page\.jsonl$/.exec(obj?.file ?? "");
			if (m) obj.gone ? out.delete(m[1]) : out.set(m[1], obj);
		}
		return [...out.keys()];
	}

	// ---- the parent's link, one place ----

	need_kind(){
		const kind = this.kind;
		if (!kind) throw new Error(`${this.dir} is not a page (no page.js or page.jsonl)`);
		return kind;
	}

	check_name(name){ if (!NAME.test(name || "")) throw new Error("name must be a-z0-9- only"); }

	link_plan(kind, name){ return { in: "page.jsonl", line: { file: `${name}/page.jsonl` } }; }

	link(kind, edit, line){ if (line) this.append(line); }

	// A targeted append that makes sure the file ended with a newline first; never a rewrite.
	append(obj){
		const file = path.join(this.dir, "page.jsonl"), text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
		fs.appendFileSync(file, (text.length && !text.endsWith("\n") ? "\n" : "") + JSON.stringify(obj) + "\n");
	}

}

const rel = p => p.replaceAll("\\", "/");   // absolute, so a dry run on another tree reads true
const stamp = () => new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);

// ---- CLI: a move is scriptable ----
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const args = process.argv.slice(2), flag = (f) => { const i = args.indexOf(f); return i < 0 ? undefined : args.splice(i, i + 1 < args.length && f !== "--dry" ? 2 : 1)[1]; };
	const dry = args.includes("--dry"); if (dry) args.splice(args.indexOf("--dry"), 1);
	const root = flag("--root");
	const [verb, url, name, to] = args;
	try {
		const sub = Subpages.at(url, { dry, root });
		const out = verb === "add" ? sub.add({ name, title: to ?? name })
			: verb === "rename" ? sub.rename({ name, to })
			: verb === "remove" ? sub.remove(name) : (() => { throw new Error("usage: Subpages.js <add|rename|remove> <parent-url> <name> [to] [--dry] [--root <tree>]"); })();
		console.log(JSON.stringify(out, null, 2));
	} catch (e){ console.error(e.message); process.exit(1); }
}
