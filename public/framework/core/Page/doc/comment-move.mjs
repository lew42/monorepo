// Moves every 4+ line comment block of Page.class.js into the doc that owns it and leaves a short pointer.
// usage: node public/framework/core/Page/doc/comment-move.mjs [--dry]   (plan: comment-plan.md; blocks keyed by their ORIGINAL start line)
// Proof: after writing, every moved line is searched for in its doc; the script exits 1 if one is missing.
import fs from "node:fs"; import path from "node:path";
const dir = import.meta.dirname, file = path.join(dir, "../Page.class.js"), dry = process.argv.includes("--dry");
const D = "decisions.md", W = "watch-out.md";
// line -> [doc, keep]  (keep: lines that stay, "" = nothing stays; a "doc/…" pointer is added when the keep text has none)
const T = {
 25: [D, "// \"kid/page.jsonl\" → [\"kid\", \"jsonl\"]; key_of() keys a file line by its FIRST path segment, latest wins."],
 33: [D, "// Page extends Item directly (no PageLog middle class)."],
 43: ["jsonl.md", "// ════ EXTENSIONS, CODE-REGISTERED — Page.use(Ext) runs Ext.setup(page) on EVERY page ═══\n// ⚠ Nobody calls it by default, so the loop below is empty for a page with no extensions."],
 53: [W, "// ⚠ Nothing is FETCHED here: a module page constructs itself at import. The caller budgets (doc/declaring.md)."],
 74: ["jsonl.md", "// A page's own preferences (today: `nav`). Never a plain object, so a repeat `settings` line merges."],
 92: [D, "// `title`/`icon`/`description` live in `data`, read through Item's define_fields() accessors."],
 102: ["jsonl.md", "// Item.apply() routing, plus: an array of lines, every line kept for late listeners, one `line` event each, lazy content."],
 126: [D, "// Compat, one release (2026-10-03): an old {\"at\": \"content/…\"} line needs page.content to exist first."],
 136: ["jsonl.md", "// Made on the first content delta, never up front."],
 145: ["jsonl.md", "// My sub-pages, the real storage. `of: null` keeps a stub plain."],
 152: ["jsonl.md", "// A Map-shaped view over `pages` for the ~215 `.children` callers. New code says `page.pages`."],
 159: [W, "// ⚠ A config `children: […]` is only STAGED here; declare() reads it. A `new Map()` means \"forget everything\"."],
 180: ["jsonl.md", "// ════ EXTENSIONS — a page.jsonl line names one: {\"ext\": \"Inbox\"} (the data path) ═══\n// ⚠ core never statically imports ext, and the import is ASYNC: a late setup() catches up from `jsonl_lines`."],
 198: ["jsonl.md", "// ════ STEP 1 — the file EXISTS (recorded, never rendered; a code call returns the real FsFile) ═══"],
 226: ["jsonl.md", "// ════ STEP 2 — a child page is LINKED, automatically (\"kid/page.jsonl\" → child \"kid\") ═══"],
 248: ["jsonl.md", "// ════ TAB STATE — {\"tab\": {\"name\": \"x\", \"disabled\": true, \"nav\": false, \"order\": 3}} ═══\n// ⚠ Repeat lines for a name MERGE, never replace."],
 292: ["jsonl.md", "// ════ THE SIX WORDS AS A DELTA — a word on a live page.jsonl reshapes the page, redrawn once ═══"],
 314: ["jsonl.md", "// A log on top of a template: only the SHAPE of a line applies (the words, `tab`, `title`)."],
 337: [W, "// Draw me again in place, no reload. ⚠ Not `redraw()`: Card already has its own."],
 368: ["jsonl.md", "// ════ NAV VISIBILITY — one rule for the rail, the tab strip and the drawer's checkbox ═══\n// Synchronous and optimistic (true first, corrected by nav_redraw()); nav_ready() is the awaited answer."],
 438: [W, "// The page shows its own folder (page.jsonl and the files its lines name). ⚠ core does not import ext: dynamic import."],
 520: [D, "// Every `data` key that is not a declared field."],
 542: [W, "// THE LOADER: `url` is the folder; line 1 builds the page, later lines are set(). Streams on localhost.\n// ⚠ Two callers can race for one url: `reader._building` joins them."],
 582: [D, "// A folder's own file list: a loaded page's lines, else files.jsonl, else page.jsonl, else null. Memoised per folder."],
 628: [W, "// ⚠ Folders inside a dated task folder get no log (PageFiles.js covers()): answer null at once."],
 656: [D, "// `put()`, not `this.title = …`: a construction-time default is not a change."],
 664: [D, "// A page's id is its folder name; new_id() returns undefined on purpose, so this is the only place one is set."],
 674: ["words.md", "// ════ THE SIX PAGE WORDS — resolved ONCE here; every default is undefined ═══\n// ⚠ Idempotent on purpose (naming() runs twice for an adopted page). There is no word for `type`: the key is `type_size`."],
 698: [D, "// The classes the words stamp on the page. `surface` is NOT here: it paints the Frame's box, not the page."],
 721: [W, "// My sub-pages, in declaration order: undefined = not mine, null = declared, Page = here.\n// ⚠ `list` is the declaration; a second call ADDS; a function is a data source (doc/data-children.md)."],
 777: ["words.md", "// Quietly: declaring a child is not a live edit (a stub holding the name is replaced in place)."],
 805: ["roles.md", "// ════ ROLES — the nearest ancestor that claims one ═══"],
 815: [W, "// A `children()` function is called ONCE, on the first ask. ⚠ Memoised on `this.sourcing`."],
 825: ["declaring.md", "// Memory, then route(), then a filesystem probe. `levels` is how deep the child then loads."],
 857: ["declaring.md", "// A loaded page.jsonl listing says which file makes `name`, so the probe is skipped; a stale list never hides a page."],
 892: [D, "// This directory's real files, full screen, at my own `fs/` (`?v=1` is the old view). ⚠ Dynamic import."],
 940: [D, "// Draw the doc inside me with a way back, at its own address `<my url>md/<doc>/`."],
 1008: ["open.md", "// A .md file's page when nothing nearer claims it: `<module>/md/<path>/` (module = the folder above doc/).\n// ⚠ The trailing slash is load-bearing: a url ending in `.js` is answered as a file."],
 1031: [W, "// Last resort: a `.md` beside me IS a page. ⚠ The SPA fallback answers a miss with index.html at 200: content-type is the 404."],
 1052: [W, "// A module that throws is NOT a module that isn't there. ⚠ `levels` bounds its subtree (nothing = its own `depth`)."],
 1070: [D, "// ⚠ The SPA fallback answers a miss with index.html at 200: content-type is the 404. `opts` goes to fetch."],
 1082: [D, "// A page.json (an object, or a directory url) AS A REAL PAGE: parents first, children by directory name.\n// ⚠ Not in child()'s probe chain. ⚠ `new this` / `this.from`, never `new Page`. The keys are props()."],
 1122: ["api.md", "// What a page.json becomes: the six words plus three labels. A subclass overrides props() alone."],
 1170: [W, "// ⚠ The fallback for a page whose own render() replaced this class's (ext/Doc): related still draws."],
 1189: ["api.md", "// Dev only: an unmarked .page is display:none and nothing throws, so say so."],
 1206: [D, "// ⚠ Going UP the chain activates nothing, so the columns host is told here."],
 1217: [D, "// Is an ancestor drawn by ext/Doc? Then its Files tab already covers the Folder link (read off the DOM class).\n// ⚠ `page.view` is a View: the class list is `page.view.el.classList`."],
 1248: [D, "// No floating \"Folder\" link here: deleted on purpose (2026-09-28); read doc/decisions.md before re-adding one."],
 1260: [W, "// A page that said any of the six words gets a Frame (Frame.js). ⚠ `page-frame-page` marks THIS frame as the page's own."],
 1279: [W, "// ⚠ Appended, not woven into the callback above: those branches return their own value on purpose."],
 1287: [D, "// \"$N.NN of AI work · M tasks\": computed by Server/page-ai-cost.mjs, drawn at the END of the page."],
 1304: [D, "// What is in the box: a function, text, or a \"/…\" address to render (Frame draws it too).\n// ⚠ A plain string becomes a paragraph, never a bare text node (the grid has no track for it)."],
 1322: ["content.md", "// ════ A CONTENT LIVELIST, DRAWN — one row per item, drag to reorder (ext/Draggable, dynamic import) ═══\n// ⚠ `item: { items: list }` on the container's Sortable, `item` on each row's."],
 1350: [D, "// A ref row ({\"ref\": \"/framework/core/Page/\"}) is drawn as that page's dark class card."],
 1361: [D, "// The text under the title, as markdown (dynamic import; the box is captured now, filled in the callback)."],
 1373: [D, "// A ref row is the inline \"#Page\" chip upgraded to a card; only its header links through."],
 1385: ["content.md", "// build_row nulls View.captor and returns the raw element: appended by hand so draw_body() can follow."],
 1406: [D, "// ⚠ A block body, not `() => list.forEach(draw_row)`: forEach's return value would append \"[object Object]\"."],
 1425: [D, "// A page or file at an address, drawn in this page's box (`content: \"/notes/x.md\"`).\n// ⚠ A loop fuse: two levels draw, the third is a link."],
 1478: ["property/related.md", "// Is there already a heading with this word on my view? Checked synchronously: the aside is appended last."],
 1487: [D, "// The aside: a Related heading, then one row per url, icon and title read live.\n// ⚠ `Page.load(url, 0)`, not `Page.from`; a url that 404s drops its row silently (doc/property/related.md)."],
 1526: ["columns.md", "// ════ COLUMNS — the Finder shape ═══\n// ⚠ `this.columns({ even: true })`, never a declared `columns:` field: it would shadow this method.\n// `fit`: \"floor\" (default) never narrower than recommended; \"round\" fills tighter."],
 1553: ["columns.md", "// The narrowest a DRAG may leave a column. A field, so `new Page({ column_floor: 140 })` wins."],
 1559: [D, "// Asked at render time, never walked. ⚠ A page under a tab strip is a tab, not a column."],
 1570: [W, "// My column, then the region my children mount in. ⚠ No `page-title` or `flow` here; `classes` is additive."],
 1584: [D, "// ⚠ The host builds a `default` child (nothing routes to it) and hands down `app`."],
 1611: [D, "// The child that opens when nothing deeper is routed (the `default` word).\n// ⚠ Not `opens()`: a core method named for a noun gets shadowed by page state."],
 1632: [D, "// ⚠ `render_content()`, not a hand-written two-branch copy: one reader decides what is in the box."],
 1645: [W, "// ⚠ `index: true` — my content already shows my children, so no rail. A field, not a method."],
 1661: ["columns.md", "// A column is already a rail, so `related:` is a short list at its end."],
 1671: [W, "// ── the seam — drag it and this column keeps the width you left it at ──\n// ⚠ `lostpointercapture` ends the drag however it ended; `preventDefault` on the DOWN."],
 1698: [W, "// The width a drag leaves behind, as the same three tokens the width words set. ⚠ No `px` = back to the page's word."],
 1716: [W, "// ── `even` — N columns of equal width, N computed from the ROW's room ──\n// ⚠ STATIC, so the lab sizes with the host's own arithmetic. The stamp comes off BEFORE the read. `max-width: none` = the phone regime."],
 1761: [D, "// The room changed, or a column opened: size first, scroll second. `slide` is true only for a navigation."],
 1771: [W, "// Slide or jump? Native smooth scroll beat FLIP and View Transitions (measured).\n// ⚠ Reduced motion is read HERE. Only `even` slides."],
 1793: [W, "// ⚠ The row has no box on a cold load: the observer fires when it gets one, and on every resize."],
 1799: [W, "// ⚠ One frame later: Router.mark() marks after activate(). This is the one settle that SLIDES."],
 1806: [W, "// The deepest column on screen, by the smallest move. ⚠ `scrollBy` on the row, never `scrollIntoView`."],
 1833: ["previews.md", "// A card per child, drawn by the child; a declared-but-unresolved one gets the default card."],
 1852: [W, "// One rung per child: its name, then ITS children as cards. ⚠ `leaf` opts a child out whole.\n// wall_rungs() is the array (built detached); walls() is the one flex column."],
 1897: [W, "// ⚠ The thumb is INERT (Page.css): a live render here would nest an <a> in an <a>. `class_card` wears the dark surface."],
 1912: ["previews.md", "// The thumb, plus the one measurement CSS can't make: `.capped` when a live render is taller than --stage-max."],
 1938: ["declaring.md", "// How deep my declared subtree is FETCHED (default 2; 1 = my children; 0 = none). A declared `depth:` wins."],
 1947: [W, "// My children fetched, and theirs, until the budget runs out. ⚠ Idempotent; a `leaf` child spends none of it."],
 1960: [D, "// ⚠ The guard above is why the wait belongs here in core (no \"Chaining cycle detected for promise\")."],
 1973: ["method/prefs.md", "// ════ PREFERENCES — the page's own url IS the id (localStorage) ═══\n// ⚠ Storage, not STATE: nothing here notifies."],
 1991: [W, "// The box the six page words open. ⚠ `PageFrame`, never `Frame`/`Stage`: View.classify() mints a CSS class from the name."],
 1999: [D, "// Registered so define_fields() builds the title/icon/description accessors."],
 2005: [D, "// The shim: a Map-shaped view over `page.pages`; `instanceof Map` stays true."],
 2040: [D, "// put() skips List.insert()'s owner-property guard (a child may share a config key's name)."],
 2072: ["method/prefs.md", "// `Item.Store` for a page.jsonl file, one per URL (`Reader.for`); `page.store` IS this once a jsonl page loaded."],
 2118: [D, "// A `tab`/`file` line redraws MY tab strip; a `settings` line redraws my PARENT's. No reload."],
 2142: [D, "// What listing() answers: files, dirs, pages (Map kid → js/jsonl), page (is this log a page?), log (the source file)."],
 2180: [D, "// Opt-in instance tracking, installed once so every Page shares one list (core/track/track.js)."],
 2188: ["method/prefs.md", "// Fallback store when localStorage will not take a save (private mode, full quota): memory for the session."],
 2212: [D, "// `id` is the seam for a caller that is not a page; `store_key` for a page that MOVED."],
 2221: ["method/prefs.md", "// The guarded pair (read_raw/write_raw/clear_raw): one JSON value under one key, never throwing."],
};
const L = fs.readFileSync(file, "utf8").split("\n");
const blocks = []; let cur = null, inB = false;
L.forEach((l, i) => { const t = l.trim(); const c = inB || t.startsWith("//") || t.startsWith("/*"); if (t.startsWith("/*") && !t.includes("*/")) inB = true; else if (inB && t.includes("*/")) inB = false;
  if (c) { (cur ??= { s: i, n: 0 }).n++; } else if (cur) { if (cur.n >= 4) blocks.push(cur); cur = null; } });
const missing = blocks.filter(b => !T[b.s + 1]), unused = Object.keys(T).filter(k => !blocks.some(b => b.s + 1 === +k));
if (missing.length || unused.length) { console.error("not in table:", missing.map(b => b.s + 1), "table lines with no block:", unused); process.exit(1); }

const strip = raw => raw.map((l, i) => { let t = l.replace(/^\t+/, ""); const o = t; if (/^\s*\/\//.test(t)) return t.replace(/^\s*\/\/ ?/, "");
  t = t.replace(/^\s*\/\*+ ?/, "").replace(/ ?\*\/\s*$/, ""); return o.trimStart().startsWith("/*") ? t : t.replace(/^ {0,3}/, ""); });
const docs = {}; const moved = [];
const out = []; let at = 0;
for (const b of blocks) {
  const [doc, keep] = T[b.s + 1], raw = L.slice(b.s, b.s + b.n), text = strip(raw);
  const indent = raw[0].match(/^\t*/)[0];
  out.push(...L.slice(at, b.s)); at = b.s + b.n;
  const lines = keep.split("\n"); if (!lines.some(l => l.includes("doc/"))) lines[lines.length - 1] += ` (doc/${doc})`;
  out.push(...lines.map(l => indent + l));
  const first = text.find(l => l.trim()) ?? "", title = first.replace(/[═⚠`*]/g, "").trim().slice(0, 70);
  (docs[doc] ??= []).push({ line: b.s + 1, title, text }); moved.push({ doc, text });
}
out.push(...L.slice(at));
let bad = 0;
for (const [doc, items] of Object.entries(docs)) {
  const p = path.join(dir, doc); let md = fs.existsSync(p) ? fs.readFileSync(p, "utf8").replace(/\s*$/, "\n") : null;
  if (md === null) { console.error("missing doc", doc); process.exit(1); }
  md += `\n## Comments moved out of Page.class.js (2026-10-12)\n\nWording kept as it was; the code keeps a one-line pointer here. Plan: [comment-plan.md](./comment-plan.md).\n`;
  for (const it of items) md += `\n### ${it.title}\n\n*was Page.class.js line ${it.line}*\n\n${it.text.join("\n").replace(/\s+$/, "")}\n`;
  if (!dry) fs.writeFileSync(p, md);
  for (const it of items) for (const l of it.text.filter(x => x.trim())) if (!md.includes(l.trimEnd())) { bad++; console.error("NOT FOUND in", doc, ":", l); }
}
if (!dry) fs.writeFileSync(file, out.join("\n"));
const n = moved.reduce((a, m) => a + m.text.length, 0);
console.log(`${blocks.length} blocks, ${n} comment lines moved to ${Object.keys(docs).length} docs; file ${L.length} -> ${out.length} lines; missing in docs: ${bad}`);
process.exit(bad ? 1 : 0);
