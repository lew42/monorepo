import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

/* `url` is a page's address ("/framework/ai/2026-10-02/page-tools/demo/"); its page.jsonl
 * sits one join away. Refuses anything that resolves outside public/ — the same gate
 * Append.js and Tail.js keep on the browser's own writes. */
function resolve_file(url){
	const pathname = String(url ?? "").replace(/^[\\/]+/, "");
	const dir = path.resolve(PUBLIC, pathname);
	if (dir !== PUBLIC && !dir.startsWith(PUBLIC + path.sep)) return null;
	return path.join(dir, "page.jsonl");
}

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
function write_line(file, line){
	let why = null;
	try { why = check(file, line); } catch (e) { console.error("page_tools: check() threw, writing anyway:", e.message); }
	if (why) throw new Error(`refused: ${why}`);

	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.appendFileSync(file, JSON.stringify(line) + "\n");
}

const now = () => new Date().toISOString();
const is_plain = v => !!v && typeof v === "object" && !Array.isArray(v);

const tool = (name, description, properties, required, handler) =>
	({ name, description, inputSchema: { type: "object", required, properties }, handler });

const PAGE_PATH = { type: "string", description: "The page's own url, e.g. \"/framework/ai/2026-10-02/page-tools/demo/\" — its page.jsonl is public<path>page.jsonl. The folder must already exist (create_page, or a task's own dir)." };
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
			if (items.has(key) && is_plain(value)){ items.set(key, { ...items.get(key), ...value }); continue; }
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

function render_markdown({ page, items }){
	const lines = [];
	lines.push(`# ${page.title ?? "(untitled)"}`);
	if (page.description) lines.push(page.description);
	if (page.log?.text) lines.push(`_doing: ${page.log.text}_`);

	lines.push("");
	lines.push("## Content");
	if (!items.length) lines.push("(empty)");
	else for (const item of items) lines.push(`- [${item.id}] ${render_item(item)}`);

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
	return `<li data-id="${esc(item.id)}">${body}</li>`;
}

// The page's own CONTENT, as HTML — no nav, no tab strip, no sidebar: this never drew any
// chrome to begin with, so "without navigation chrome" costs nothing extra here. Structure
// an agent can parse (an id per `<li>`), not a styled page.
function render_html({ page, items }){
	const lines = [`<h1>${esc(page.title ?? "(untitled)")}</h1>`];
	if (page.description) lines.push(`<p>${esc(page.description)}</p>`);
	if (page.log?.text) lines.push(`<p class="muted">doing: ${esc(page.log.text)}</p>`);

	lines.push(items.length ? `<ul>${items.map(render_item_html).join("")}</ul>` : "<p>(empty)</p>");
	return lines.join("\n");
}

/* ---------- the six tools ---------- */

export function page_tools(){
	const not_a_page = url => JSON.stringify({ ok: false, why: `"${url}" is not a page under public/` });

	return [

		tool("page_call",
			"The general tool: ONE verb call at ONE target, written as the canonical nested line"
			+ " (2026-10-03, \"no at, no dots: the path is the nesting\") — `page_call(path, [\"k2\",\"answers\"],"
			+ " \"add\", {...})` writes `{\"k2\":{\"answers\":{\"add\":{...}}}}`, meaning \"k2 → its answers list →"
			+ " add\". `target` is an array of hops (property names or ids), never a slash- or dot-path. Reach"
			+ " for `page_add`/`page_set` for the two common cases; reach for this one for anything else — a"
			+ " deeper list, `remove`/`move`/`order`, or a method on a specific item.",
			{ path: PAGE_PATH, target: TARGET,
				method: { type: "string", description: "The verb to call at the target — a method on whatever `target` resolves to: `add`, `remove`, `move`, `order`, or any method the item's own class defines." },
				args: { description: "The method's one argument — an object for `add`, a string id for `remove`, etc. If it's a plain object, `by` and `ts` are stamped onto it." } },
			["path", "method"],
			({ path: url, target, method, args }, ctx = {}) => {
				const file = resolve_file(url);
				if (!file) return not_a_page(url);

				const stamped = is_plain(args) ? { ...args, by: ctx.caller ?? "agent", ts: now() } : args;
				const line = nest(target ?? [], { [method]: stamped });

				write_line(file, line);
				return JSON.stringify({ ok: true, line });
			}),

		tool("page_add",
			"Add ONE item to a live page's own content list — sugar for `page_call(path, [\"content\"], \"add\","
			+ " item)`. One line appended to page.jsonl, picked up by every open tab with no reload. Stamps a"
			+ " fresh id (unless `item.id` is given), the calling agent as `by`, and the time as `ts`.",
			{ path: PAGE_PATH,
				item: { type: "object", description: "The item's own fields — whatever the content list draws: `title`, `text`, `type` (a registered class name, e.g. \"Question\", with its own `text`/`answer`), or any plain data. `id` is optional; one is made for you." },
				after: { type: "string", description: "The id to land after. Omit to append at the end; `null` to land first." } },
			["path", "item"],
			({ path: url, item, after }, ctx = {}) => {
				const file = resolve_file(url);
				if (!file) return not_a_page(url);

				const id = item?.id ?? crypto.randomUUID();
				const add = { ...item, id, by: ctx.caller ?? "agent", ts: now(), ...(after !== undefined ? { after } : {}) };
				const line = nest(["content"], { add });

				write_line(file, line);
				return JSON.stringify({ ok: true, id, line });
			}),

		tool("page_set",
			"Change data at one target — sugar for `page_call` with no verb: the delta is handed straight to"
			+ " the target's own `set()` (core/Item/Item.js's rule — a plain nested delta IS a set, no `\"set\"`"
			+ " key needed in the line). `page_set(path, [], {\"title\":\"New\"})` changes the PAGE's own title;"
			+ " `page_set(path, [\"k2\"], {\"answer\":\"42\"})` changes item k2's data, wherever it lives. Stamps"
			+ " `by` and `ts` onto the same line.",
			{ path: PAGE_PATH, target: TARGET,
				delta: { type: "object", description: "The fields to change, e.g. {\"answer\": \"42\"} or {\"title\": \"Renamed\"}." } },
			["path", "delta"],
			({ path: url, target, delta }, ctx = {}) => {
				const file = resolve_file(url);
				if (!file) return not_a_page(url);

				const stamped = { ...delta, by: ctx.caller ?? "agent", ts: now() };
				const line = nest(target ?? [], stamped);

				write_line(file, line);
				return JSON.stringify({ ok: true, line });
			}),

		tool("page_log",
			"A \"now doing X\" line — post BEFORE a long step so the owner can watch the page grow"
			+ " while you work, not just at the end (CLAUDE.md, \"Pages are live\"). Overwrites the"
			+ " page's own `log` field each time — this is a status line, not a running list; use"
			+ " `page_add` for anything that should stay on the page.",
			{ path: PAGE_PATH,
				text: { type: "string", description: "What you're doing right now, in a few words, e.g. \"researching X\"." } },
			["path", "text"],
			({ path: url, text }, ctx = {}) => {
				const file = resolve_file(url);
				if (!file) return not_a_page(url);

				const line = { log: { text, by: ctx.caller ?? "agent", ts: now() } };
				write_line(file, line);
				return JSON.stringify({ ok: true, line });
			}),

		tool("page_read",
			"The page's CURRENT state, computed fresh from page.jsonl every time — never a second,"
			+ " stored copy (CLAUDE.md law 7). Replays the log into title, the `doing:` line if one is"
			+ " set, and every content item with its id, a question card drawn as \"Q: … / A: …\"."
			+ " Default `format` is markdown — the fewest tokens, read this before deciding what to add"
			+ " or change next. `format: \"html\"` gives the same replay as the page's own content HTML,"
			+ " no navigation chrome, when you need the structure (each item's `<li data-id>`) instead.",
			{ path: PAGE_PATH,
				format: { type: "string", enum: ["markdown", "html"], description: "\"markdown\" (default, fewest tokens) or \"html\" (the content's own markup, no nav chrome)." } },
			["path"],
			({ path: url, format }) => {
				const file = resolve_file(url);
				if (!file) return not_a_page(url);
				if (!fs.existsSync(file)) return JSON.stringify({ ok: false, why: `no page.jsonl at "${url}" yet` });

				const state = replay(parse_lines(file));
				return format === "html" ? render_html(state) : render_markdown(state);
			}),
	];
}

export default page_tools;
