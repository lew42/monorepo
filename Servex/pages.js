/* Page tools: list, read and make pages without a shell. Every write is ONE appended line
 * or one targeted edit — never a rewrite. Every tool takes an optional `root` (main tree or
 * a worktree) and a site `path` like /framework/core/Page/. Detail: core/Page/doc/jsonl.md. */
import fs from "node:fs";
import path from "node:path";

const MAIN = "C:\\Code\\lew42\\monorepo";
const json = v => JSON.stringify(v, null, 2);
const NAME = /^[a-z0-9-]+$/;

const root_of = a => path.resolve(a.root || MAIN);
const dir_of = (a, p) => path.join(root_of(a), "public", ...String(p || "/").split("/").filter(Boolean));
const kind_of = dir => fs.existsSync(path.join(dir, "page.js")) ? "page.js"
	: fs.existsSync(path.join(dir, "page.jsonl")) ? "page.jsonl" : null;

// Append one JSON line, making sure the file ends with a newline first.
const append = (file, obj) => {
	const text = fs.readFileSync(file, "utf8");
	fs.appendFileSync(file, (text.length && !text.endsWith("\n") ? "\n" : "") + JSON.stringify(obj) + "\n");
};

const layout_names = a => {
	const src = fs.readFileSync(path.join(root_of(a), "public/framework/core/Layout/layouts.js"), "utf8");
	return [...src.matchAll(/^\s*name:\s*"([a-z0-9-]+)"/gm)].map(m => m[1]);
};

// The child names a page declares, and their kind, without importing anything.
const children_of = dir => {
	const kind = kind_of(dir), out = [];
	if (kind === "page.jsonl") {
		for (const line of fs.readFileSync(path.join(dir, "page.jsonl"), "utf8").split("\n")) {
			try { const m = /^([^/]+)\/(page\.jsonl|page\.js)$/.exec(JSON.parse(line).file || ""); if (m && !out.some(o => o.name === m[1])) out.push({ name: m[1] }); } catch {}
		}
	} else if (kind === "page.js") {
		const m = /children:\s*"([^"]*)"/.exec(fs.readFileSync(path.join(dir, "page.js"), "utf8"));
		for (const w of (m?.[1] || "").split(/\s+/).filter(Boolean)) out.push({ name: w.split("/")[0] });
	}
	for (const c of out) c.kind = kind_of(path.join(dir, c.name)) || "missing";
	return out;
};

export const page_tools = () => {
	const P = { type: "string", description: "Site path of the page, like /framework/core/Page/" };
	const R = { type: "string", description: "Tree root: the main monorepo (default) or a worktree path." };
	const tool = (name, description, properties, required, run) => ({
		name, description, inputSchema: { type: "object", required, properties: { root: R, ...properties } },
		handler: async (args = {}) => { try { return json(await run(args)); } catch (e) { return json({ ok: false, why: e.message }); } }
	});

	return [
		tool("list_pages", "List a page's child pages, each as page.js or page.jsonl (page.js wins; a plain folder is not a page).",
			{ path: P }, ["path"], a => {
				const dir = dir_of(a, a.path);
				if (!kind_of(dir)) throw new Error(`${a.path} is not a page (no page.js or page.jsonl)`);
				return { ok: true, kind: kind_of(dir), children: children_of(dir) };
			}),

		tool("read_page", "Read a page: its page.jsonl lines, or for page.js its declared title, icon, children and layout words (read as text, never imported).",
			{ path: P }, ["path"], a => {
				const dir = dir_of(a, a.path), kind = kind_of(dir);
				if (!kind) throw new Error(`${a.path} is not a page`);
				const text = fs.readFileSync(path.join(dir, kind), "utf8");
				if (kind === "page.jsonl") return { ok: true, kind, lines: text.split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return { bad: l }; } }) };
				const pick = k => new RegExp(`\\b${k}:\\s*"([^"]*)"`).exec(text)?.[1] ?? null;
				return { ok: true, kind, title: pick("title"), icon: pick("icon"), children: pick("children"), layout: pick("layout"), cols: pick("cols"), room: pick("room") };
			}),

		tool("create_page", "Make a new child page: folder + page.jsonl line 1, then link it from the parent (one appended {file} line, or the name added to the parent page.js children string).",
			{ parent: P, name: { type: "string", description: "a-z0-9- only" }, title: { type: "string" }, icon: { type: "string" }, layout: { type: "string", description: "optional layout name" } },
			["parent", "name", "title", "icon"], a => {
				if (!NAME.test(a.name || "")) throw new Error("name must be a-z0-9- only");
				const pdir = dir_of(a, a.parent), pkind = kind_of(pdir);
				if (!pkind) throw new Error(`${a.parent} is not a page`);
				const dir = path.join(pdir, a.name);
				if (fs.existsSync(dir)) throw new Error(`${a.name} already exists under ${a.parent}`);
				if (a.layout && !layout_names(a).includes(a.layout)) throw new Error(`unknown layout; valid: ${layout_names(a).join(", ")}`);
				let parent_js = null;
				if (pkind === "page.js") {
					const file = path.join(pdir, "page.js"), src = fs.readFileSync(file, "utf8");
					const m = /(children:\s*")([^"]*)(")/.exec(src);
					if (!m) throw new Error("parent page.js has no `children: \"...\"` string to extend");
					parent_js = { file, src, m };
				}
				fs.mkdirSync(dir);
				const first = { title: a.title, icon: a.icon, ...(a.layout ? { layout: a.layout } : {}) };
				fs.writeFileSync(path.join(dir, "page.jsonl"), JSON.stringify(first) + "\n");
				if (parent_js) {
					const { file, src, m } = parent_js, i = m.index + m[1].length, sep = m[2].trim() ? " " : "";
					fs.writeFileSync(file, src.slice(0, i) + m[2].replace(/\s+$/, "") + sep + a.name + "/page.jsonl" + src.slice(i + m[2].length));
				} else append(path.join(pdir, "page.jsonl"), { file: `${a.name}/page.jsonl` });
				return { ok: true, made: `${a.parent.replace(/\/?$/, "/")}${a.name}/`, linked_in: pkind };
			}),

		tool("place", "Append {\"place\": what} to a page.jsonl. `what` is a .md name, a module .js name, or {module: \"x.js\", ...data}. page.js pages are refused.",
			{ path: P, what: { description: "a .md, a .js, or {module, ...data}" } }, ["path", "what"], a => {
				const dir = dir_of(a, a.path), kind = kind_of(dir);
				if (kind !== "page.jsonl") throw new Error(kind ? `${a.path} is a page.js page: place() only works on page.jsonl pages; edit its content() instead` : `${a.path} is not a page`);
				append(path.join(dir, "page.jsonl"), { place: a.what });
				return { ok: true };
			}),

		tool("set_layout", "Append {\"layout\": name} to a page.jsonl. Only names in core/Layout/layouts.js are accepted.",
			{ path: P, layout: { type: "string" } }, ["path", "layout"], a => {
				const names = layout_names(a);
				if (!names.includes(a.layout)) throw new Error(`unknown layout "${a.layout}"; valid: ${names.join(", ")}`);
				const dir = dir_of(a, a.path), kind = kind_of(dir);
				if (kind !== "page.jsonl") throw new Error(kind ? `${a.path} is a page.js page: set its layout in the file` : `${a.path} is not a page`);
				append(path.join(dir, "page.jsonl"), { layout: a.layout });
				return { ok: true };
			})
	];
};

export default page_tools;
