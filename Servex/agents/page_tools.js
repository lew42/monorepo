import fs from "node:fs";
import SessionRecord from "../../Server/SessionRecord.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Subpages from "./Subpages.js";
import Promote from "./Promote.js";
import TaskHomes from "../../Server/TaskHomes.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const PUBLIC = path.join(ROOT, "public");

/* SIX TOOLS over `Item.Store` (core/Item/Store.js), so an agent writes a LIVE page the
 * same small way a browser tab would — one line at a time, through the SAME file every
 * tab already tails (ext/JSONL/live.js → Server/plugins/SocketServer/Tail.js). This runs
 * IN Servex (node), never in a browser, so there is no Store object to call: the line is
 * built here and appended straight to disk, exactly the shape `Item.Store.flush()` would
 * have sent to `Append.js` (core/Item/Store.js, Server/plugins/SocketServer/Append.js) —
 * the dev server's own file watcher picks up the write and tails it to every open tab, no
 * different from any other change to the file.
 *
 * The owner, 2026-10-02 (CLAUDE.md, "Pages are live"): "if an agent creates a page, we
 * want the agent to be able to update that page via the page.jsonl in real time… a
 * toolset… we don't want to bloat our toolset with thousands of cross-domain tools."
 *
 * WIRE FORMAT (2026-10-03, the owner via vscode-mastermind — "no `at`, no dots: the path
 * is the NESTING"): a line nests one hop per level, each hop a property name or a child's
 * id — `{"k2": {"answers": {"add": {...}}}}` means "k2 → its answers list → add". There is
 * no wrapper key for a LIST'S OWN property name in the nesting (`Item.get()`, core/Item/
 * Item.js, finds a child by scanning every list the current node owns) — so a top-level
 * content item is addressed by `["content"]` (the page's own `content` property, found as
 * a NAME before anything is ever tried as an id), and an EXISTING item is addressed by its
 * bare id, `[id]`, found by `get()`'s cross-list id scan. Verified live against the real
 * replay engine (not just read from the design doc) — see doc/jsonl.md, "Agent tools".
 * `page_call`/`page_set` build this; `page_add` is sugar for the single most common call
 * (`page_call` with target `["content"]`, method `"add"`). */

// A dynamic import with a safe fallback — the same reasoning as Append.js: a broken
// checker degrades validation, never the whole tool. check() also reads page.jsonl's
// schema as `open: true` (.claude/hooks/jsonl-schema.mjs), so a nesting key nobody has
// named a verb for is simply data no verb claims, never a refusal.
let check = () => null;
try { ({ check } = await import("../../.claude/hooks/jsonl-schema.mjs")); } catch {}

/* `url` is a page's address ("/framework/ai/sessions/2026/10/02/page-tools/demo/"); its page.jsonl
 * sits one join away. Refuses anything that resolves outside public/ — the same gate
 * Append.js and Tail.js keep on the browser's own writes. */
function resolve_file(url, item = false){
	let pathname = String(url ?? "").replace(/^[\\/]+/, "");
	const named = /\.jsonl$/.test(pathname) ? path.basename(pathname) : null;   // a url may name the log itself
	if (named) pathname = path.dirname(pathname);
	const dir = path.resolve(PUBLIC, pathname);
	if (dir !== PUBLIC && !dir.startsWith(PUBLIC + path.sep)) return null;
	if (named) return path.join(dir, named);
	// Item tool only: task.jsonl beside a page.jsonl means a TASK folder (the page is its view); then session.jsonl; else the page.
	// A folder with a task.jsonl and no page.jsonl is a task for EVERY page tool (page_set, page_call, page_log): never a stray page.jsonl beside it.
	if (item || !fs.existsSync(path.join(dir, "page.jsonl"))) for (const name of ["task.jsonl", "session.jsonl"]) if (fs.existsSync(path.join(dir, name))) return path.join(dir, name);
	return path.join(dir, "page.jsonl");
}

/* ROUTE PATHS (2026-10-09, the page tool): an agent names the page it SEES, and this finds
 * the file behind it, even when none exists yet. Today one family of routes keeps its file
 * somewhere else: a session page, `/framework/ai/sessions/<id>/`, is drawn by a template
 * (ai/AISession/AISessionDetail.js) and its page.jsonl lives in the session's own dated
 * folder, `sessions/YYYY/MM/DD/<slug>/` (AISession.locate() makes one for a session that has
 * none). `<id>` is a session uuid or a Servex agent id (its registry row holds the uuid). A
 * deeper path, `/framework/ai/sessions/<id>/notes/`, is a tab built from a line in that same
 * file, so its segments go on the front of the target: ["notes", ...target]. Anything else
 * resolves the plain way above. Returns { file, target } or null. */
const SESSION_ROUTE = /^\/?framework\/ai\/sessions\/([^/]+)\/(.*)$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

async function resolve(url, target = [], item = false){
	const hit = SESSION_ROUTE.exec(String(url ?? ""));
	if (hit && !/^\d{4}$/.test(hit[1])){
		const file = await session_file(hit[1]);
		if (file){
			// A real subpage folder (made by pages.add) wins; a segment with no folder is still a tab target.
			let dir = path.dirname(file), rest = hit[2].split("/").filter(Boolean), at = file;
			while (rest.length && fs.existsSync(path.join(dir, rest[0], "page.jsonl"))){ dir = path.join(dir, rest[0]); at = path.join(dir, "page.jsonl"); rest = rest.slice(1); }
			return { file: at, target: [...rest, ...(target ?? [])] };
		}
	}
	const file = resolve_file(url, item);
	return file ? { file, target: target ?? [] } : null;
}

async function session_file(id){
	// A folder made here is named for the agent (its Servex id), not left as session-<id8> (brief: "sessions get a name").
	let uuid = UUID.test(id) ? id : null, name = uuid ? null : id;
	try {
		const { default: Registry } = await import("./Registry.js"), agents = new Registry().read();
		if (!uuid) uuid = agents[id]?.session_id ?? null;
		else name = Object.entries(agents).find(([, a]) => a?.session_id === uuid)?.[0] ?? null;
	} catch {}
	if (!uuid) return null;
	const slug = /^[a-z0-9][a-z0-9-]{2,60}$/.test(name ?? "") ? `${name}-${uuid.slice(0, 8)}` : undefined;
	const { default: AISession } = await import("../../public/framework/ai/AISession/AISession.js");
	if (!AISession.days.has(uuid)) AISession.scanned = false;   // a long-lived Servex: a folder made since the last scan must be found, never doubled
	const file = fileURLToPath(new URL("page.jsonl", await AISession.locate(uuid, undefined, slug)));
	// A brand-new folder says whose it is on its first line, so AISession.scan() finds it again (never a second folder).
	if (!fs.existsSync(file)){ fs.mkdirSync(path.dirname(file), { recursive: true }); fs.appendFileSync(file, JSON.stringify({ session: uuid, ts: new Date().toISOString() }) + "\n"); }
	return file;
}

// "This page" when an agent names none: its own session page. Servex passes the caller's
// agent id; a VS Code tab has none here, so it is told its path instead (the prompt hook).
const own_page = ctx => ctx?.caller && ctx.caller !== "owner" ? `/framework/ai/sessions/${ctx.caller}/` : null;

// Nests `payload` one level per step in `target`, innermost (the payload itself) last —
// `nest(["k2","answers"], {add: {...}})` → `{k2: {answers: {add: {...}}}}`. `nest([], x)`
// is `x` itself, flat — the exact same helper Store.js's own `wrap()` is, kept separate
// so this file never imports a browser module (core/Item/Store.js touches `location`).
function nest(target, payload){
	const path = [...(target ?? [])];
	return path.length === 0 ? payload : { [path[0]]: nest(path.slice(1), payload) };
}

/* ONE line, validated then appended — the same two steps Append.js takes for a browser's
 * line, so a page written by an agent and a page written by a live tab are written
 * identically. Throws with the refusal reason; the tool handlers turn that into
 * `{ok:false, why}` rather than letting the SDK wrap a raw exception. */
function write_line(file, line, own_check = false){
	let why = null;
	// own_check: the item tool already validated this line against its class (the task.jsonl schema is one-verb-per-line and has no by/ts).
	if (!own_check) try { why = check(file, line); } catch (e) { console.error("page_tools: check() threw, writing anyway:", e.message); }
	if (why) throw new Error(`refused: ${why}`);

	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.appendFileSync(file, JSON.stringify(line) + "\n");
	return size_of(file);
}

/* SIZE FEEDBACK (the owner, 2026-10-09 18:25): every write answers with the log's new size,
 * so the writer sees it growing. Past LARGE the answer says so; compaction is designed in
 * core/Page/doc/architecture.md ("Log growth"). */
const LARGE = 1024 * 1024;
function size_of(file){
	const buf = fs.readFileSync(file);
	let lines = 0;
	for (let i = 0; i < buf.length; i++) if (buf[i] === 10) lines++;
	return { file: path.relative(ROOT, file).replaceAll("\\", "/"), bytes: buf.length, lines, ...(buf.length > LARGE ? { large: true } : {}) };
}

/* Every `add` in a delta, at any depth, gets an id if it brought none — the agent never
 * invents ids (the owner, 2026-10-09: "the tool stamps those"). */
function stamp_ids(value, ids){
	if (Array.isArray(value)) return value.map(v => stamp_ids(v, ids));
	if (!is_plain(value)) return value;
	const out = {};
	for (const [key, v] of Object.entries(value)){
		if (key === "add" && is_plain(v)){
			const id = v.id ?? crypto.randomUUID();
			ids?.push(id);
			out[key] = { id, ...stamp_ids(v, ids) };
		} else out[key] = stamp_ids(v, ids);
	}
	return out;
}

/* A delta carries exactly what changed, at any depth: a nested plain object merges into the old one
 * key by key instead of replacing it (core/Page/doc/subpages.md, "Deep deltas"). Arrays and scalars replace. */
export function deep_merge(old, delta){
	if (!is_plain(old) || !is_plain(delta)) return delta;
	const out = { ...old };
	for (const [k, v] of Object.entries(delta)){
		if (k === "__proto__" || k === "constructor") continue;
		out[k] = is_plain(v) && is_plain(old[k]) ? deep_merge(old[k], v) : v;
	}
	return out;
}

const now = () => new Date().toISOString();
const is_plain = v => !!v && typeof v === "object" && !Array.isArray(v);

const tool = (name, description, properties, required, handler) =>
	({ name, description, inputSchema: { type: "object", required, properties }, handler });

const PAGE_PATH = { type: "string", description: "The page's url as the browser shows it, e.g. \"/framework/core/Page/tool/\" or a session page \"/framework/ai/sessions/<id>/\" (its file is found for you, even if none exists yet). Omit it to mean YOUR OWN page, /framework/ai/sessions/<your agent id>/." };
const TARGET = { type: "array", items: { type: "string" }, description: "The path to the target, as a list of hops — each one a property name (\"content\") or a child's id, never a string with slashes or dots. [] (or omit) targets the PAGE itself. [\"content\"] targets its content list. [\"k2\"] targets the existing item with id \"k2\", wherever it lives. [\"k2\",\"answers\"] walks into k2's own \"answers\" list." };

/* ---------- page_read's COMPUTED state (deliverable 2) ----------
 * No second copy of the page is ever stored: every call re-reads page.jsonl from disk and
 * replays it fresh, the same rule Item.Store.read() follows in the browser. This is a small,
 * deliberately partial replay — just enough to answer "what does this page say right now"
 * (title, content items one level deep, the log line), never the whole rendering engine
 * (core never needs the DOM to answer this). It understands both wire shapes: the current
 * nested one, and the old `{"at": "content", ...}` one (one release of compat, matching
 * core/Item/Item.js's own `apply()`), so a page that has lines from before 2026-10-03 still
 * reads correctly. */
function parse_lines(file){
	let text;
	try { text = fs.readFileSync(file, "utf8"); } catch { return []; }
	return text.split("\n").filter(line => line.trim()).flatMap(line => {
		try { return [JSON.parse(line)]; } catch { return []; }
	});
}

function replay(lines){
	const page = { title: undefined, icon: undefined, description: undefined, log: undefined };
	const items = new Map();   // id -> item data (one level deep — a nested sub-list is kept as raw data)
	let order = [];            // ids, in order

	const insert_after = (id, after) => {
		order = order.filter(x => x !== id);
		if (after === null || (after === undefined && !order.length)) return void order.unshift(id);
		if (after === undefined) return void order.push(id);
		const at = order.indexOf(after);
		order.splice(at === -1 ? order.length : at + 1, 0, id);
	};

	const content_verbs = rest => {
		if (rest.add){
			const { after, ...data } = rest.add;
			items.set(data.id, { ...items.get(data.id), ...data });
			insert_after(data.id, after);
		}
		if (typeof rest.remove === "string"){ items.delete(rest.remove); order = order.filter(x => x !== rest.remove); }
		if (rest.clear){ items.clear(); order = []; }
		if (rest.move){ insert_after(rest.move.id, rest.move.after); }
		if (Array.isArray(rest.order)){
			const listed = rest.order.filter(id => items.has(id));
			order = [...listed, ...order.filter(id => !listed.includes(id))];
		}
	};

	// One line is "a key naming a method" (add/remove/move/order on `content`, or the special
	// `log`/`note` data fields) OR "a child's id" (merge into that item) OR plain page data —
	// Item.get()'s own order, replayed here without a live object to call `.get()` on.
	const apply_top = obj => {
		for (const key in obj){
			if (key === "constructor" || key === "__proto__" || key.startsWith("_")) continue;
			const value = obj[key];

			if (key === "content" && is_plain(value)){ content_verbs(value); continue; }
			if (key === "tab" && is_plain(value) && value.name){ (page.tabs ??= {})[value.name] = { ...page.tabs?.[value.name], ...value }; continue; }
			if (page.tabs?.[key] && is_plain(value)){ const t = page.tabs[key]; if (is_plain(value.content?.add)) (t.items ??= []).push(value.content.add); continue; }
			if (key === "by" || key === "ts") continue;
			if (items.has(key) && is_plain(value)){ items.set(key, deep_merge(items.get(key), value)); continue; }
			page[key] = value;
		}
	};

	for (const raw of lines){
		const line = Array.isArray(raw) ? raw : [raw];
		for (const entry of line){
			if (!entry || typeof entry !== "object") continue;

			// ⚠ compat only, one release (2026-10-03) — an old line routed its REST to
			// whatever `at` named; never written any more, only read.
			if ("at" in entry){
				const { at, ...rest } = entry;
				if (at === "content") content_verbs(rest);
				else if (typeof at === "string" && at.startsWith("content/")){
					const id = at.slice("content/".length);
					if (items.has(id)) items.set(id, { ...items.get(id), ...rest });
				}
				continue;
			}

			apply_top(entry);
		}
	}

	return { page, items: order.map(id => items.get(id)).filter(Boolean) };
}

// A registered-type item with `text` (+ optional `answer`) reads as a question card. Anything
// else falls back to its title, then its text, then its bare data — one line each.
function render_item(item){
	if (item.type === "Question" || ("text" in item && "answer" in item))
		return `Q: ${item.text} / A: ${item.answer ?? "…"}`;
	if (item.title) return item.title;
	if (item.text) return item.text;
	const { id, by, ts, after, type, ...data } = item;
	return Object.keys(data).length ? JSON.stringify(data) : "(empty)";
}

function render_markdown({ page, items }, subpages){
	const lines = [];
	lines.push(`# ${page.title ?? "(untitled)"}`);
	if (page.description) lines.push(page.description);
	if (page.log?.text) lines.push(`_doing: ${page.log.text}_`);
	const words = ["navigation", "width", "arrangement", "surface", "background", "type_size"].filter(w => page[w]).map(w => `${w}: ${page[w]}`);
	if (words.length) lines.push(`_layout: ${words.join(", ")}_`);
	for (const [name, t] of Object.entries(page.tabs ?? {})) lines.push(`- tab [${name}] ${t.title ?? name}${t.items?.length ? ` (${t.items.length} items)` : ""}`);

	lines.push("");
	lines.push("## Content");
	if (!items.length) lines.push("(empty)");
	else for (const item of items) lines.push(`- [${item.id}] (${item.type ?? "item"}) ${render_item(item)}`);

	if (subpages?.length){
		lines.push("", "## Subpages");
		for (const { name, url } of subpages) lines.push(`- ${name} ${url}`);
	}

	return lines.join("\n");
}

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Q/A as a small definition list; everything else as plain text — both escaped, both
// carrying the item's id as a data attribute, the one thing an agent needs to target it
// with a later page_set.
function render_item_html(item){
	const body = (item.type === "Question" || ("text" in item && "answer" in item))
		? `<dl><dt>Q</dt><dd>${esc(item.text)}</dd><dt>A</dt><dd>${esc(item.answer ?? "…")}</dd></dl>`
		: `<p>${esc(render_item(item))}</p>`;
	return `<li data-id="${esc(item.id)}" data-type="${esc(item.type ?? "item")}">${body}</li>`;
}

// The page's own CONTENT, as HTML — no nav, no tab strip, no sidebar: this never drew any
// chrome to begin with, so "without navigation chrome" costs nothing extra here. Structure
// an agent can parse (an id per `<li>`), not a styled page.
function render_html({ page, items }, subpages){
	const lines = [`<h1>${esc(page.title ?? "(untitled)")}</h1>`];
	if (page.description) lines.push(`<p>${esc(page.description)}</p>`);
	if (page.log?.text) lines.push(`<p class="muted">doing: ${esc(page.log.text)}</p>`);

	lines.push(items.length ? `<ul>${items.map(render_item_html).join("")}</ul>` : "<p>(empty)</p>");
	if (subpages?.length) lines.push(`<ul class="subpages">${subpages.map(s => `<li><a href="${esc(s.url)}">${esc(s.name)}</a></li>`).join("")}</ul>`);
	return lines.join("\n");
}

/* `{"pages":{"add":{name,title,icon,description}, "rename":{name,to}, "remove":"name"}}`:
 * folders sit beside the page's own page.jsonl, so a session page's subpage goes in the
 * session's own folder. Only on the page itself (no target): a subpage is a folder. */
function apply_pages(at, pages, url){
	if (at.target.length) return { why: "`pages` works on the page itself, not inside a target" };
	if (!is_plain(pages)) return { why: "`pages` must be {add|rename|remove: …}" };
	const subs = new Subpages(path.dirname(at.file)), base = String(url ?? "").replace(/\/?$/, "/"), done = [];
	try {
		for (const spec of [].concat(pages.add ?? [])){ subs.add(spec); done.push({ added: spec.name, url: base + spec.name + "/" }); }
		for (const spec of [].concat(pages.rename ?? [])){ subs.rename(spec); done.push({ renamed: spec.name, to: spec.to, url: base + spec.to + "/" }); }
		for (const name of [].concat(pages.remove ?? [])){ subs.remove(name); done.push({ removed: name }); }
		for (const spec of [].concat(pages.promote ?? [])){ new Promote(subs).promote(spec); done.push({ promoted: spec.id, url: base + spec.name + "/" }); }
	} catch (e){ return { why: e.message, done }; }
	return { done };
}

/* ---------- the item tool (plan section 4): page_set generalised to any Item class ----------
 * A delta is ONE log line, the object Item.set() takes; the file is replayed through the same
 * class code a browser would use. Only Task can be imported in node (Page touches the DOM,
 * Page touches the DOM), so Task and Session get the key refusals. */
const ITEM_PATH = { type: "string", description: "The item's url, e.g. a task folder \"/framework/ai/sessions/…/<slug>/\" (task.jsonl there wins over page.jsonl) or a page. Omit = your own session page." };
const ITEM_DESCRIPTION = "THE ITEM TOOL: `item({path, delta})`. `delta` is ONE log line, the exact object Item.set(delta) takes: a key naming a method calls it with the value as its arguments (`{\"start\":{}}`, `{\"wait\":{\"on\":\"owner\"}}`), a key naming a child walks into it (`{\"tasks\":{\"add\":{\"title\":\"x\"}}}`), any other key assigns. `\"a.b\": v` is shorthand for `{a:{b:v}}`. No `delta` = the current state. The first call per class also returns `instructions`; `{\"help\":{}}` returns them again.";

// improvements.jsonl: a folder's proposed fixes and moves, one nested Task each (Servex/agents/roles/mastermind.md, "Improvements").
const FILE_CLASS = { "task.jsonl": "Task", "session.jsonl": "Session", "page.jsonl": "Page", "improvements.jsonl": "Task" };
const LOADERS = {
	Task: async () => (await import("../../public/framework/core/Task/Task.js")).default,
	Session: async () => (await import("../../public/framework/core/Session/Session.js")).default,
	Process: async () => (await import("../../public/framework/core/Task/Process.js")).default,
};
const CLASS_SOURCES = { Task: ["core/Task/Task.js", "core/Item/Item.js"], Session: ["core/Session/Session.js", "core/Item/Item.js"], Process: ["core/Task/Process.js", "core/Task/Task.js", "core/Item/Item.js"] };
// Fields a Session line may carry: its identity, a title, and its tasks.
const SESSION_KEYS = ["id", "session", "title", "description", "module", "now", "tasks", "task", "by", "ts", "class"];

// Fields a Task line may carry beyond its getters (plan section 2) and the legacy line keys Task.replay reads.
const TASK_KEYS = ["id", "now", "title", "description", "state", "expected", "complete", "completion", "priority", "commits", "session", "session_id", "module", "tags", "tasks", "task", "path", "parent", "content", "mode", "waiting_on", "outcome", "why", "steps", "step", "checked_by", "verdict", "brief", "assign", "at", "log", "decision", "review", "note", "by", "ts"];

// A Process adds its own line-1 field and the lines only ProcessRunner writes (core/Task/doc/process.md).
const KEYS = { Task: TASK_KEYS, Session: SESSION_KEYS, Process: [...TASK_KEYS, "process", "class", "spawn", "queue", "pulse", "measure"] };

const told = new Map();   // `${caller}|${class}` -> true once its instructions went out

// "a.b": v -> {a: {b: v}}, the only dot handling there is.
function expand_dots(delta){
	const out = {};
	for (const [key, value] of Object.entries(delta)){
		const parts = key.split(".");
		if (parts.length < 2 || parts.some(p => !p)){ out[key] = value; continue; }
		let at = out;
		for (const p of parts.slice(0, -1)) at = at[p] = is_plain(at[p]) ? at[p] : {};
		at[parts.at(-1)] = value;
	}
	return out;
}

function class_of(file){
	const first = parse_lines(file)[0];
	return (is_plain(first) && typeof first.class === "string" ? first.class : null) ?? (SessionRecord.log_file(path.dirname(file)) === file ? "Task" : null) ?? FILE_CLASS[path.basename(file)] ?? "Page";
}

// describe() with each method's doc filled: the first `//` line of the comment block above it, from the class's source.
function describe_class(Class){
	const d = Class.describe();
	const text = (CLASS_SOURCES[d.class] ?? []).map(f => { try { return fs.readFileSync(path.join(PUBLIC, "framework", f), "utf8"); } catch { return ""; } }).join("\n");
	const lines = text.split("\n");
	for (const m of d.methods){
		const at = lines.findIndex(l => new RegExp(`^\\s*(static\\s+)?(async\\s+)?${m.name}\\s*\\(`).test(l));
		let top = at;
		while (top > 0 && /^\s*\/\//.test(lines[top - 1])) top--;
		if (at > 0 && top < at) m.doc = lines[top].replace(/^\s*\/\/\s?/, "");
	}
	return d;
}

const GRAMMAR = "delta = one log line. A key naming a method calls it with the value as arguments; a key naming a child item walks into it; any other key assigns. Keys starting with _ are refused.";

async function instructions_for(kind, Class){
	return Class ? { ...describe_class(Class), task_keys: KEYS[kind], grammar: GRAMMAR, rules: RULES } : { class: kind, grammar: GRAMMAR };
}

// The owner's grouping rules (Servex/doc/item-tool.md), returned beside describe() on the first call.
export const RULES = [
	"A refinement of an existing task goes into that task: add to its `tasks`, or set its fields. It does not become a new task.",
	"New tasks are only for new asks.",
	"One goal task per module holds the long-lived work; new related work goes under it.",
	"An idea to keep beside a module while designing is a note, not a task.",
	"The tool files the session reference and picks the home folder; never write either by hand.",
];


/* ---------- task homes (plan step 14a) ----------
 * `tasks.add` on a parent makes the child its own folder + task.jsonl and writes ONE reference line `{"task": "<app path>"}`
 * on the parent; replay resolves the reference (Task.from_ref). Home: <module>/tasks/<slug>/ when public/framework/<module>/
 * already exists (never created here), else <parent folder>/<slug>/. ctx.module_root overrides the module root (tests). */
const FRAMEWORK = path.join(PUBLIC, "framework");
const MODULE_NAME = /^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*$/;
const app_path = dir => "/" + path.relative(PUBLIC, dir).split(path.sep).join("/") + "/";
export const slug_of = text => String(text ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/, "") || "task";

// The module an app path sits in: the nearest folder under public/framework/ with a readme.md. Never a dated ai/sessions/ folder.
function module_of(url, root = FRAMEWORK){
	const m = /^\/?framework\/(.+?)\/?$/.exec(String(url ?? ""));
	if (!m || /(^|\/)ai\/sessions(\/|$)/.test(m[1])) return "";
	const parts = m[1].split("/");
	for (; parts.length; parts.pop()){
		const rel = parts.join("/");
		if (MODULE_NAME.test(rel) && fs.existsSync(path.join(root, rel, "readme.md"))) return rel;
	}
	return "";
}

// Which folder a new module task lives in, and its slug. Never suffixes: `taken` is true when the folder exists, and the caller refuses (offering `free`).
// A child gets a folder only under a real module (explicit `module`, or the module the call's path sits in); everything else nests in the parent's task.jsonl.
function task_home(parent_dir, add, root = FRAMEWORK, from_path = ""){
	// A call made on a path already inside a `tasks/` folder (a goal's own folder, a module list) is a subtask: it nests.
	const inside_tasks = /(^|\/)tasks(\/|$)/.test(String(from_path ?? ""));
	const mod = typeof add.module === "string" ? add.module.replace(/^\/+|\/+$/g, "") : inside_tasks ? "" : module_of(from_path, root);
	const mod_dir = MODULE_NAME.test(mod) ? path.join(root, mod) : null;
	if (!(mod_dir && fs.existsSync(mod_dir) && fs.statSync(mod_dir).isDirectory())) return null;
	const base = path.join(mod_dir, "tasks"), slug = slug_of(add.id ?? add.title);
	let free = slug;
	for (let n = 2; fs.existsSync(path.join(base, free)); n++) free = `${slug}-${n}`.replace(/^(.{0,40})(-\d+)$/, (_, a, b) => a.slice(0, 40 - b.length) + b);
	return { slug, free, taken: free !== slug, dir: path.join(base, slug), list: { dir: base, module: mod } };
}

export const PAGE_JS = ['import { TaskPage } from "/framework/core/Task/TaskPage.js";', "export default new TaskPage({ meta: import.meta });", ""].join(String.fromCharCode(10));

// Who asked, for line 1 of a new task: an explicit ctx.source (voice-app | vscode | dictate), else the calling agent. Node fills it; an agent never types it.
const SOURCES = ["voice-app", "vscode", "dictate"];
const source_of = ctx => { const who = ctx?.caller && ctx.caller !== "owner" ? ctx.caller : process.env.SERVEX_AGENT; return ctx?.source ?? (SOURCES.includes(who) ? who : who ? `servex:${who}` : undefined); };

// One add -> child folder with line 1, returns { id, path }. Fields come from the add (a legacy `data` object is flattened).
function make_child(parent_dir, add, ctx, home){
	const { type: _t, id: _i, after: _a, data, ...fields } = add;
	const { slug, dir, list } = home;
	const child = path.join(dir, "task.jsonl"), url = app_path(dir);
	if (fs.existsSync(child)) throw new Error(`refused: ${app_path(dir)} already holds a task`);   // never overwrite
	const source = source_of(ctx), sess = ctx.caller && ctx.caller !== "owner" ? [{ id: ctx.caller, task: url }] : undefined;
	write_line(child, { id: slug, path: url, parent: app_path(parent_dir), ...(source ? { source } : {}), ...(sess ? { sessions: sess } : {}), ...data, ...fields, by: ctx.caller ?? "agent", ts: now() }, true);
	// Step 14b: the child's folder routes (TaskPage), and the module's list task holds a second reference to it.
	fs.writeFileSync(path.join(dir, "page.js"), PAGE_JS);
	if (list){
		const file = path.join(list.dir, "task.jsonl");
		if (!fs.existsSync(file)){
			write_line(file, { id: "tasks", path: app_path(list.dir), title: `${list.module} tasks`, mode: "parallel" }, true);
			TaskHomes.add(app_path(list.dir), ctx.caller ?? "agent");   // the new home joins /tasks/ (Server/TaskHomes.mjs)
		}
		write_line(file, { task: url, by: ctx.caller ?? "agent", ts: now() }, true);
	}
	return { id: slug, path: url };
}

/* A process (core/Task/doc/process.md) always gets its own folder inside the caller's folder, never a module home: line 1 and one
 * add per phase come from Process.DEFINITIONS, and ProcessRunner starts it (hooks.changed). Refused: an unknown process, a taken slug. */
async function process_home(parent_dir, add){
	const Process = await LOADERS.Process();
	if (!Process.DEFINITIONS[add.process]) return { why: `no process "${add.process}"; the processes are: ${Object.keys(Process.DEFINITIONS).join(", ")}` };
	const slug = slug_of(add.id ?? add.title), dir = path.join(parent_dir, slug);
	// A folder that only holds a brief is fine (write the brief, then start the process in it); one with a log is taken.
	if (["task.jsonl", "session.jsonl"].some(f => fs.existsSync(path.join(dir, f)))) return { why: `"${slug}" already holds a task in this folder; nothing was written. Give the process another id or title.` };
	return { slug, dir, list: null, process: Process };
}
function make_process(parent_dir, add, ctx, home){
	const [first, ...adds] = home.process.lines(add);
	const h = make_child(parent_dir, first, ctx, home), file = path.join(home.dir, "task.jsonl");
	for (const line of adds) write_line(file, { ...line, by: ctx.caller ?? "agent", ts: now() }, true);
	return { ...h, process: add.process, file };
}

/* DRAFT IN THE SESSION, THEN MOVE HOME (core/Task/doc/owner-2026-10-20-projects-and-completion.md §6). A task folder (a process once its
 * plan is approved) moves to <module>/tasks/<slug>/: git mv when tracked, else a rename. Then one line on each side:
 * - the task records its new path;
 * - the old parent and the module list reference the new path (a later reference with the same id replaces the earlier one, Task.js);
 * - the move is one {at, kind: "task", from, to, session} line in ai/sessions/task-moves.jsonl, the ledger Server/TaskMove.mjs keeps,
 *   so Server/TaskDirs.mjs redirects the old path and the move can be undone by hand.
 * Returns {from, to, file} or {why}. ProcessRunner calls it; the dated store's move_project is the same idea for project.jsonl folders. */
export const ledgers = { task_moves: path.join(PUBLIC, "framework", "ai", "sessions", "task-moves.jsonl") };   // a test points it at a scratch file
export async function move_home(file, module, by = "ProcessRunner"){
	const dir = path.dirname(path.resolve(file)), slug = path.basename(dir);
	const home = task_home(path.dirname(dir), { id: slug, module }, FRAMEWORK, "");
	if (!home) return { why: `no module folder public/framework/${module}` };
	if (path.resolve(home.dir) === dir) return { why: "already home" };
	if (fs.existsSync(home.dir)) return { why: `${app_path(home.dir)} already exists; the task stays in its session` };
	const from = app_path(dir), to = app_path(home.dir), rel = p => path.relative(ROOT, p).split(path.sep).join("/");
	const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
	const parent = (() => { try { return JSON.parse(lines[0]).parent; } catch { return null; } })();
	fs.mkdirSync(path.dirname(home.dir), { recursive: true });
	const { execFileSync } = await import("node:child_process");
	const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }).trim();
	let tracked = false; try { tracked = !!git("ls-files", "--", rel(dir)); } catch {}
	if (tracked) git("mv", rel(dir), rel(home.dir)); else fs.renameSync(dir, home.dir);
	const nf = path.join(home.dir, "task.jsonl"), at = now();
	write_line(nf, { set: { path: to, parent: app_path(home.list.dir), moved_from: from }, by, ts: at }, true);
	const pf = parent ? resolve_file(parent, true) : null;
	if (pf && fs.existsSync(pf)) write_line(pf, { task: to, moved_from: from, by, ts: at }, true);
	const list = path.join(home.list.dir, "task.jsonl");
	if (!fs.existsSync(list)){
		write_line(list, { id: "tasks", path: app_path(home.list.dir), title: `${home.list.module} tasks`, mode: "parallel" }, true);
		TaskHomes.add(app_path(home.list.dir), by);
	}
	write_line(list, { task: to, by, ts: at }, true);
	record_new_folder(home.list.dir, slug);
	fs.appendFileSync(ledgers.task_moves, JSON.stringify({ at, kind: "task", from: rel(dir), to: rel(home.dir), session: parent ?? null, module, by, git: tracked }) + "\n");
	return { from, to, file: nf };
}

/* Requests are logged items (Servex/agents/doc/messaging.md). After a write: each new request goes to its receiver, and each
 * request this write completed goes back to whoever asked (`from`), with its outcome. A completion is a `complete` line on a nested
 * child ({"<id>": {"complete": …}}, or a target of [<id>]), or on a request that has its own folder (the file's own root). */
function notify_requests(live, at, body, requests, by){
	for (const r of requests) if (hooks.requested) Promise.resolve(hooks.requested(r)).catch(() => {});
	if (!hooks.answered) return;
	const done = [];
	if (at.target.length === 1 && body.complete !== undefined) done.push(live._tasks?.find(at.target[0]));
	else if (!at.target.length){
		if (body.complete !== undefined) done.push(live);
		for (const [k, v] of Object.entries(body)) if (is_plain(v) && v.complete !== undefined) done.push(live._tasks?.find(k));
	}
	for (const t of done){
		const from = t?.get_one("from");
		if (!from || from === by || t.state !== "complete") continue;
		Promise.resolve(hooks.answered({ to: from, by, id: t.id, title: t.get_one("title") ?? t.id, outcome: t.get_one("outcome") ?? null, path: t === live ? (live.get_one("path") ?? app_path(path.dirname(at.file))) : app_path(path.dirname(at.file)) })).catch(() => {});
	}
}

// Node's resolver for Task.from_ref: an app path -> that folder's parsed task.jsonl, or null. While a root is being replayed, `collect` gathers every child file it read.
let collect = null;
const sig = file => { try { const st = fs.statSync(file); return `${st.size}:${st.mtimeMs}`; } catch { return "none"; } };
export function link_refs(Task){
	Task.resolver ??= ref => {
		const dir = path.resolve(PUBLIC, String(ref).replace(/^[\/]+/, ""));
		if (!dir.startsWith(PUBLIC + path.sep)) return null;
		const file = SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl");
		collect?.push([file, sig(file)]);
		return fs.existsSync(file) ? parse_lines(file) : null;
	};
}

/* ONE LIVE INSTANCE PER FILE (plan, Amendments 4): the root is replayed once into `Item.Store.for(url)` and every later call on the
 * path reaches that same object. It is advanced with the line the tool just wrote (the same replay_line a browser's Store.read runs),
 * never re-read, unless the file (or a child file it replayed) changed on disk from outside: size/mtime differ -> replay again. */
function live_root(Class, file){
	const store = Class.Store.for("/" + path.relative(PUBLIC, file).split(path.sep).join("/"));
	if (store.host && store.sig === sig(file) && store.deps.every(([f, s]) => sig(f) === s)) return store.host;
	const deps = [];
	collect = deps;
	let root;
	try { root = Class.replay(parse_lines(file)); } finally { collect = null; }
	Object.assign(store, { host: root, sig: sig(file), deps, file });
	root.store = store;
	return root;
}

// The line was appended; move the cached root forward with it and re-stamp the file's signature.
function advance(root, line){
	collect = root.store.deps;   // a {task} / {file} line reads a child file: watch it too
	try { root.replay_line(line); } catch (e) { root.store.host = null; throw e; } finally { collect = null; }
	root.store.sig = sig(root.store.file);
}

function task_state(Task, task){
	const tasks = [...(task._tasks ?? [])].map(t => ({ id: t.id, title: t.get_one("title"), state: t.state }));
	if (Task.name === "Process") return { class: "Process", process: task.process, state: task.state, phase: task.phase?.id ?? null, next: task.next(), completion: task.completion, data: { ...task.data }, tasks: [...(task._tasks ?? [])].map(t => ({ id: t.id, title: t.get_one("title"), state: t.state, outcome: t.get_one("outcome") ?? null })) };
	if (Task.name === "Session") return { class: "Session", completion: task.completion, progress: task.progress(), data: { ...task.data }, tasks };
	return { class: "Task", state: task.state, completion: task.completion, data: { ...task.data }, tasks };
}

function refusal(why, Class){
	const d = describe_class(Class);
	return { ok: false, why, exists: [...d.methods.map(m => m.name), ...new Set([...d.fields, ...(KEYS[Class.name] ?? [])])] };
}

// Task and Session: a top-level key must be a public method, a known field, or an existing child.
function validate(Task, task, delta){
	const known = new Set([...Task.describe().fields, ...(KEYS[Task.name] ?? []), "folder"]);
	for (const key of Object.keys(delta)){
		if (key === "help") continue;
		if (key.startsWith("_")) return refusal(`"${key}" starts with _ (private)`, Task);
		if (typeof task[key] === "function" || known.has(key) || task.get(key) !== undefined) continue;
		return refusal(`"${key}" names no method, field or child of ${Task.name}`, Task);
	}
	return null;
}

// A new folder is one more line in its parent's files.jsonl, through ModuleLog (a failure here never fails the write).
async function record_new_folder(parent, name){
	try { (await import("../../Server/ModuleLog.mjs")).default.record(parent, `${name}/page.js`); } catch {}
}

/* `{"folder":"<child id>"}`: a nested subtask gets its OWN folder on demand. The child's line 1 carries its current data; the parent
 * records {"file":"<id>/task.jsonl"} and replay swaps the nested child for that file. A child with subtasks of its own is refused (give those a folder first). */
async function give_folder(root, at, ids, ctx){
	const parent_dir = path.dirname(at.file), made = [], by = ctx.caller ?? "agent";
	for (const id of [].concat(ids)){
		const kid = root._tasks?.find(String(id));
		if (!kid) return { why: `"${id}" is not a subtask of this task` };
		if ([...(kid._tasks ?? [])].length) return { why: `"${id}" has subtasks of its own; give them folders first` };
		const slug = slug_of(kid.id), dir = path.join(parent_dir, slug);
		if (fs.existsSync(dir)) return { why: `${app_path(dir)} already exists` };
		if (root.data.path === undefined){   // the parent must know where it lives for the {"file"} line to resolve
			const own = { path: app_path(parent_dir), by, ts: now() };
			write_line(at.file, own, true);
			advance(root, own);
		}
		write_line(path.join(dir, "task.jsonl"), { id: kid.id, path: app_path(dir), parent: root.data.path, set: { ...kid.data, path: app_path(dir) }, by, ts: now() }, true);
		fs.writeFileSync(path.join(dir, "page.js"), PAGE_JS);
		const line = { file: `${slug}/task.jsonl`, by, ts: now() };
		write_line(at.file, line, true);
		advance(root, line);
		await record_new_folder(parent_dir, slug);
		made.push({ id: kid.id, path: app_path(dir) });
	}
	return { made };
}

/* templates.md: Servex sets this to `file => task_loop.launch(file)`; run_item calls it right after an `approve` line lands. */
export const hooks = { approved: null, changed: null, requested: null, answered: null };   // requested/answered: Servex sends the one-line notices (Servex/agents/doc/messaging.md, "Requests are logged items")   // changed: Servex sets it to `file => process_runner.step(file)` (a process moves on after any write)

export async function run_item({ path: url, target, delta } = {}, ctx = {}, alias = false){
	url ??= own_page(ctx);
	let caller_log = ctx.caller_log ?? null;
	try { caller_log ??= ctx.resolve_log?.(ctx.caller) ?? null; } catch { caller_log = null; }   // a broken resolver never breaks the call
	const at = await resolve(url, target, true);
	if (!at) return { ok: false, why: `"${url}" is not a page under public/` };

	const kind = class_of(at.file);
	const Class = LOADERS[kind] ? await LOADERS[kind]().catch(() => null) : null;
	if (Class) link_refs(await LOADERS.Task());   // references on a parent resolve to live children
	const root = () => live_root(Class, at.file);
	const first_time = () => !told.has(`${ctx.caller}|${kind}`) && told.set(`${ctx.caller}|${kind}`, true);
	const state = () => Class?.replay ? task_state(Class, root()) : (fs.existsSync(at.file) ? render_markdown(replay(parse_lines(at.file)), Subpages.listed(at.file).map(name => ({ name, url: String(url).replace(/\/?$/, "/") + name + "/" }))) : null);
	const extra = async () => alias ? {} : { ...(first_time() ? { instructions: await instructions_for(kind, Class) } : {}), state: state() };

	if (delta === undefined) return { ok: true, ...(await extra()), ...(alias ? { state: state() } : {}) };
	if (!is_plain(delta)) return { ok: false, why: "`delta` must be one object (a log line)" };
	const flat = expand_dots(delta);
	// A verdict verb given as a bare note ({"approve":"ok"}) would be written but ignored on replay (Task.replay_line reads verbs as objects): make it {note}.
	for (const v of ["approve", "improve", "reject"]) if (typeof flat[v] === "string") flat[v] = { note: flat[v] };
	if (Object.keys(flat).length === 1 && flat.help){
		told.set(`${ctx.caller}|${kind}`, true);
		return { ok: true, instructions: await instructions_for(kind, Class) };
	}
	// An improvement proposed again adds weight, never a duplicate (the owner, 2026-10-22; readme-system.md): the same title becomes
	// {"<id>": {"reinforce": {why}}} on the existing one, and Task.weight counts them.
	if (path.basename(at.file) === "improvements.jsonl" && is_plain(flat.tasks?.add) && Object.keys(flat).length === 1 && Object.keys(flat.tasks).length === 1){
		const a = flat.tasks.add, id = slug_of(a.id ?? a.title);
		if (root()._tasks?.find(id)) { delete flat.tasks; flat[id] = { reinforce: { ...(a.why ? { why: a.why } : {}) } }; }
	}
	if (Class?.replay){ const no = validate(Class, root(), flat); if (no) return no; }

	// `pages` and `folder` are the keys the tool handles itself: a folder is made on disk (Subpages.js, give_folder).
	const { pages, folder, ...rest } = flat;
	const made = pages === undefined ? null : apply_pages(at, pages, url);
	if (made?.why) return { ok: false, why: made.why, done: made.done };

	const ids = [], homes = [], requests = [], by = ctx.caller ?? "agent";
	let line = null, size;
	// Every write to a Task/Session goes through here: append the line, then advance the live root with it.
	const put = (l, own = true) => { const live = Class?.replay ? root() : null; size = write_line(at.file, l, own); if (live) advance(live, l); line = l; };   // root BEFORE the write: after it the file's size differs and root() would re-read

	let body = pages === undefined && folder === undefined ? flat : rest;
	if (Class?.replay && !at.target.length && is_plain(body.tasks) && body.tasks.add !== undefined){
		const { add, ...others } = body.tasks;
		// A REQUEST (the owner, 2026-10-22: logs over chat): a task added to another agent's task is a request to that agent. Node stamps
		// `from` on it, tells the receiver once, and tells the sender when it completes (hooks.requested / hooks.answered, below).
		const owner_agent = root().get_one("agent"), asker = ctx.caller && ctx.caller !== owner_agent && owner_agent ? ctx.caller : null;
		// Check everything first: a refused slug writes nothing at all.
		const plan = [];
		for (const a of [].concat(add)){
			if (!is_plain(a)) return { ok: false, why: "`tasks.add` takes an object (the new task's fields)" };
			const home = typeof a.process === "string" ? await process_home(path.dirname(at.file), a) : path.basename(at.file) === "improvements.jsonl" ? null : task_home(path.dirname(at.file), a, ctx.module_root, url);   // an improvement nests in its folder's list (mastermind role readme)
			if (home?.why) return { ok: false, why: home.why };
			if (home?.taken) return { ok: false, why: `a task "${home.slug}" already exists under ${home.list.module}/tasks/; nothing was written. Use the id "${home.free}" (or a different title), or work on the existing one.`, suggest: home.free };
			const id = home ? null : slug_of(a.id ?? a.title);
			if (id && (root()._tasks?.find(id) || plan.some(p => p.id === id)))
				return { ok: false, why: `this task already has a subtask "${id}"; nothing was written. Use the id "${id}-2" (or a different title), or change the existing one.`, suggest: id + "-2" };
			plan.push({ a: asker && a.from === undefined ? { ...a, from: asker } : a, home, id });
		}
		for (const { a, home, id } of plan){
			if (home){
				const h = home.process ? make_process(path.dirname(at.file), a, ctx, home) : make_child(path.dirname(at.file), a, ctx, home);
				homes.push(h); ids.push(h.id);
				if (asker) requests.push({ to: owner_agent, from: asker, id: h.id, title: a.title ?? h.id, path: h.path, own_folder: true });
				put({ task: h.path, by, ts: now() });
				await record_new_folder(path.dirname(home.dir), home.slug);
				// Step 16: the caller's own log gets the same reference (never the parent twice, never an error).
				if (caller_log && path.resolve(caller_log) !== path.resolve(at.file)) try { write_line(caller_log, line, true); } catch {}
			} else {
				// A subtask nests in this file: {"tasks":{"add":{…}}}, no folder.
				const { type: _t, data, ...fields } = a;
				ids.push(id);
				if (asker) requests.push({ to: owner_agent, from: asker, id, title: a.title ?? id, path: app_path(path.dirname(at.file)) });
				put({ tasks: { add: { type: "Task", ...data, ...stamp_ids(fields, ids), id } }, by, ts: now() });
			}
		}
		const { tasks: _t, ...more } = body;
		body = Object.keys(others).length ? { ...more, tasks: others } : more;
	}
	if (folder !== undefined && Class?.replay){
		const g = await give_folder(root(), at, folder, ctx);
		if (g.why) return { ok: false, why: g.why };
		homes.push(...g.made);
		size = size_of(at.file);
	}
	if ((pages === undefined && folder === undefined && !homes.length && !ids.length) || Object.keys(body).length){
		put(nest(at.target, { ...stamp_ids(body, ids), by, ts: now() }), !!Class?.replay);
	} else if (size === undefined) size = size_of(at.file);
	// An approve line starts a templated task's agent (TaskLoop.launch); never awaited into the answer, a failure never reaches the tool.
	if (Class?.replay && !at.target.length && body.approve !== undefined && hooks.approved) try { Promise.resolve(hooks.approved(at.file)).catch(() => {}); } catch {}
	// A process moves on after any write to it, and a new one starts at once (ProcessRunner.step).
	if (hooks.changed) for (const f of [...(kind === "Process" ? [at.file] : []), ...homes.filter(h => h.process).map(h => h.file)]) try { Promise.resolve(hooks.changed(f)).catch(() => {}); } catch {}
	if (Class?.replay) try { notify_requests(root(), at, body, requests, by); } catch {}
	// Node records who worked on the task: one appended line carrying the full list, only when the caller is new to it.
	if (Class?.replay && Class.FIELDS?.includes("sessions") && ctx.caller && ctx.caller !== "owner") try {
		const live = root(), list = live.sessions;
		if (!list.some(s => s?.id === ctx.caller)) { const keep = line; put({ sessions: [...list, { id: ctx.caller, task: live.get_one("path") ?? app_path(path.dirname(at.file)) }], by, ts: now() }); line = keep; }
	} catch {}
	return { ok: true, ids, line, size, ...(homes.length ? { homes } : {}), ...(made ? { pages: made.done } : {}), ...(Class?.replay || !alias ? await extra() : {}) };
}

/* ---------- the six tools ---------- */

/* resolve_log(agent id) -> that agent's task.jsonl path or null; the host supplies it (Agents.task_dir_for). */
export function page_tools(resolve_log = null){
	const not_a_page = url => JSON.stringify({ ok: false, why: `"${url}" is not a page under public/` });

	return [

		tool("page_call",
			"Alias of page_set: one method call at one target, `page_call(path, [\"k2\",\"answers\"], \"add\", {…})` = `{\"k2\":{\"answers\":{\"add\":{…}}}}`. Prefer page_set (core/Page/doc/ai-api.md).",
			{ path: PAGE_PATH, target: TARGET,
				method: { type: "string", description: "The verb to call at the target — a method on whatever `target` resolves to: `add`, `remove`, `move`, `order`, or any method the item's own class defines." },
				args: { description: "The method's one argument — an object for `add`, a string id for `remove`, etc. If it's a plain object, `by` and `ts` are stamped onto it." } },
			["method"],
			async ({ path: url, target, method, args }, ctx = {}) => {
				url ??= own_page(ctx);
				const at = await resolve(url, target, true);
				if (!at) return not_a_page(url);
				if (path.basename(at.file) !== "page.jsonl") return JSON.stringify(await run_item({ path: url, target, delta: { [method]: is_plain(args) ? args : {} } }, { resolve_log, ...ctx }, true));   // a task / session: the item path

				const stamped = is_plain(args) ? { ...(method === "add" ? { id: crypto.randomUUID() } : {}), ...stamp_ids(args), by: ctx.caller ?? "agent", ts: now() } : args;
				const line = nest(at.target, { [method]: stamped });

				const size = write_line(at.file, line);
				return JSON.stringify({ ok: true, line, size });
			}),

		tool("page_add",
			"Alias of page_set `{\"content\":{\"add\":item}}`: add one card (type part-heading | part-text | part-card). Prefer page_set (core/Page/doc/ai-api.md).",
			{ path: PAGE_PATH,
				item: { type: "object", description: "The item's own fields — whatever the content list draws: `title`, `text`, `type` (a registered class name, e.g. \"Question\", with its own `text`/`answer`), or any plain data. `id` is optional; one is made for you." },
				after: { type: "string", description: "The id to land after. Omit to append at the end; `null` to land first." } },
			["item"],
			async ({ path: url, item, after }, ctx = {}) => {
				url ??= own_page(ctx);
				const at = await resolve(url, ["content"], true);
				if (!at) return not_a_page(url);
				if (path.basename(at.file) !== "page.jsonl") return JSON.stringify(await run_item({ path: url, delta: { content: { add: { ...item, ...(after !== undefined ? { after } : {}) } } } }, { resolve_log, ...ctx }, true));

				const id = item?.id ?? crypto.randomUUID();
				const add = { ...item, id, by: ctx.caller ?? "agent", ts: now(), ...(after !== undefined ? { after } : {}) };
				const line = nest(at.target, { add });

				const size = write_line(at.file, line);
				return JSON.stringify({ ok: true, id, line, size });
			}),

		tool("page_set",
			"THE PAGE TOOL: append one JSON delta to a page's log; every open tab redraws within a second, no reload."
			+ " `path` = the page's url (omit = your own session page). `by`, `ts` and every missing `id` are stamped"
			+ " for you, and the answer lists them as `ids` (use one to change that card later). THREE KEY RULES:"
			+ " a plain key is a property `{\"title\":\"Notes\",\"description\":\"…\"}` (also the layout words navigation,"
			+ " width, arrangement, surface, background, type_size); a key naming a method calls it"
			+ " `{\"content\":{\"add\":{…}}}` (also remove \"id\", move {id,after}, order [ids]); a key that is a card id"
			+ " walks into that card `{\"<id>\":{\"text\":\"new\"}}`. CARD TYPES, added with content.add: heading"
			+ " `{\"type\":\"part-heading\",\"text\":\"…\"}`, paragraph `{\"type\":\"part-text\",\"text\":\"markdown\"}`, card"
			+ " `{\"type\":\"part-card\",\"title\":\"…\",\"text\":\"…\"}` (`after:\"<id>\"` places it). A SUBPAGE (own folder"
			+ " and url, made on disk for you): `{\"pages\":{\"add\":{\"name\":\"notes\",\"title\":\"Notes\",\"icon\":\"📝\","
			+ " \"description\":\"One line.\"}}}`, also `rename:{name,to}` and `remove:\"name\"` (moved aside, never deleted);"
			+ " write on it with `path` = its url. Look first with page_read. Full model: /framework/core/Page/doc/ai-api.md.",
			{ path: PAGE_PATH, target: TARGET,
				delta: { type: "object", description: "The fields to change, e.g. {\"answer\": \"42\"} or {\"title\": \"Renamed\"}." } },
			["delta"],
			async (args, ctx = {}) => JSON.stringify(await run_item(args, { resolve_log, ...ctx }, true))),

		tool("item", ITEM_DESCRIPTION,
			{ path: ITEM_PATH, delta: { type: "object", description: "ONE JSONL line, exactly what Item.set(delta) takes and the log holds. Omit it to read the current state. {\"help\":{}} returns the instructions again." } },
			[],
			async (args, ctx = {}) => JSON.stringify(await run_item(args, { resolve_log, ...ctx }))),

		tool("page_log",
			"Alias of page_set `{\"log\":{\"text\":…}}`: the \"now doing X\" line, overwritten each time; post it BEFORE a long step (core/Page/doc/ai-api.md).",
			{ path: PAGE_PATH,
				text: { type: "string", description: "What you're doing right now, in a few words, e.g. \"researching X\"." } },
			["text"],
			async ({ path: url, text }, ctx = {}) => {
				url ??= own_page(ctx);
				const at = await resolve(url, undefined, true);
				if (!at) return not_a_page(url);
				if (path.basename(at.file) !== "page.jsonl") return JSON.stringify(await run_item({ path: url, delta: { now: { preview: text } } }, { resolve_log, ...ctx }, true));   // a task has no page log: its "now"

				const line = nest(at.target, { log: { text, by: ctx.caller ?? "agent", ts: now() } });
				const size = write_line(at.file, line);
				return JSON.stringify({ ok: true, line, size });
			}),

		tool("page_read",
			"The page's CURRENT state, replayed fresh from page.jsonl: title, the `doing:` line, every card as `[id] (type) text`, and its subpages with their urls. Read it before you change anything; `format:\"html\"` gives the cards' markup (core/Page/doc/ai-api.md).",
			{ path: PAGE_PATH,
				format: { type: "string", enum: ["markdown", "html"], description: "\"markdown\" (default, fewest tokens) or \"html\" (the content's own markup, no nav chrome)." } },
			[],
			async ({ path: url, format }, ctx = {}) => {
				url ??= own_page(ctx);
				const at = await resolve(url);
				if (!at) return not_a_page(url);
				const file = at.file;
				if (!fs.existsSync(file)) return JSON.stringify({ ok: false, why: `no page.jsonl at "${url}" yet` });

				const state = replay(parse_lines(file));
				const base = String(url ?? "").replace(/\/?$/, "/");
				const subpages = Subpages.listed(file).map(name => ({ name, url: base + name + "/" }));
				return format === "html" ? render_html(state, subpages) : render_markdown(state, subpages);
			}),
	];
}

export default page_tools;
