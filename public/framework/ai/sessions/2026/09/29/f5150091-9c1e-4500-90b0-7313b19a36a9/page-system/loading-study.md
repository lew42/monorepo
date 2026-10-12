# The page loading algorithm, page.js vs page.jsonl, tabs, settings, colour

Read-only study. Every claim below is checked against the real code, main tree unless
marked **[worktree]** (unmerged branch `worktree/page-system-929` at
`C:\Code\lew42\worktrees\page-system-929`).

## The owner's words, verbatim

From `.claude/prompts/2026-09-29.jsonl` line 531 (the prompt containing "JSON L page mode"):

> "...it might be better to just add tabs to the page.json L... the presence of a new tab
> might be sufficient if we're... properly logging file changes... When a new file or folder
> is added, you just add a new entry... the JSON L should be tailed on any page... and
> everything can update seamlessly... then we don't need the kind of explicit call to the
> tabs. The tabs could basically manage themselves... the tab itself could maybe save its
> state, like whether it's active or disabled or something... maybe there's like an appears
> in navigation flag or something. I think we need a page settings system that we don't have
> yet... maybe it's like in the right sidebar... ask the page mastermind about... this tab
> system... let's kind of compare the two [page.js and page.jsonl]. Anything that could be
> maybe ported over to the JSON L system might be better... we might need the page.js system,
> so we don't want to get rid of it just yet... make sure we... in the documentation for the
> page, are making it clear how that loading algorithm works because that's foundational to
> understanding what goes where."

## 1. The loading algorithm as it is today

A url is resolved one path segment at a time, never all at once:

1. `Router.load_segments()` — `core/Router/Router.js:79-88` — starts at `this.app.root` and
   calls `page = await page.child(name)` for each segment. **The walk IS the loader.**
2. `Page.child(name)` — `core/Page/Page.class.js:200-229` — the real order, for one segment:
   1. `this.children.get(name)` — **memory** first (line 203). If a name is *declared* (even
      resolving to `null`, meaning "not loaded yet"), everything below is skipped — including
      `route()`. This is the new-page skill's documented trap (`.claude/skills/new-page/SKILL.md:9`
      in the worktree's `dynamic/readme.md`, matching the skill's own probe note).
   2. `this.child_kinds.get(name) === "jsonl"` (line 208) — only true if a `"file"` line
      already named `"<name>/page.jsonl"`, or the parent's `children:` string said so. Loads
      via `Page.jsonl()`. **`page.jsonl` is never probed for blind — it is only ever declared.**
   3. `name === "md"` (line 215) and `name === "fs"` (line 220) — two always-on special
      children every page has.
   4. `this.route(name)` (line 222) — the dynamic-page hook, only for undeclared names.
   5. `Page.load(url + name + "/")` (line 225) — **tries `page.js`** (`Page.class.js:398`,
      `import(url + "page.js")`).
   6. `Page.file(md_dir + name + ".md")` (line 228) — **tries a `.md` file** last, wrapping it
      as a page (`Page.class.js:373-388`).
   7. Nothing matched → `null` → the Router's `go()` falls back to `location.assign(url)`,
      which hits the SPA fallback (`index.html` at 200) or a real 404.

**So the real order is: memory → declared jsonl → md/fs → route() → page.js → .md → miss.**
This differs from the assumed "page.js → page.jsonl → route → .md → 404" in two ways: (a)
`page.jsonl` is checked *before* `page.js` in this list, but only when declared, so in
practice an *undeclared* jsonl page is never reached by probing — only a real `page.js` or a
bare `.md` file is found by probing; (b) a declared child short-circuits `route()` entirely,
so `route()` only ever sees names nobody declared.

**core/Page/dynamic/doc/idea.md [worktree]** already documents this same order in one line
("memory, then `route()`, then the filesystem") and points at `doc/method/child.md` — it does
not yet sit on the core/Page readme itself, which is ask 5 (checkpoint.md "Open asks" #5).

## 2. page.js vs page.jsonl

**What page.jsonl already supports** (`core/Page/Log.js:34-93`, plus the seven writers at
`core/Page/jsonl/doc/writers.md` **[worktree]**): a constructor line (`title`, `icon`, any
property), `file`/`gone` (file exists / vanished), `place` (put content on the page, in
order), `referenced_by` and `weight` (accumulating), and any custom key a `Page` subclass adds
a method for (`set()` calls a same-named method if one exists, `Page.class.js:34-46`).

**What only page.js can do today:** a real `content()` function with custom layout (columns,
grids, widgets, live data) — `Log.js:41-46` says "a page.jsonl page is always reading-width;
a page that genuinely needs more room needs a real page.js." Also anything imperative:
`route()` for dynamic children, custom `child()`/`open_link()` overrides, `bar()`/`tabs()`
overrides (`core/Page/page.js:98-101`), and any method beyond what `set()`'s "a key that names
a method calls it" pattern covers.

**Does a page ever load both today?** No — by design. `Server/plugins/PageFiles.js:95`:
`if (fs.existsSync(path.join(dir, "page.js"))) return;` — the file-watcher explicitly skips
any folder that has a `page.js`; its `page.jsonl` (if one exists there anyway) gets no
watcher-written `file` lines. A `page.js`-backed page that wants log-style state uses its
*own* file instead — e.g. `weight.jsonl` in `core/Page/weight/` **[worktree]**, never
`page.jsonl` itself — exactly what checkpoint.md's landing step 1 already decided ("page.js
folders keep weight lines in weight.jsonl, never a new page.jsonl"). So: no page pays the cost
of loading both formats right now; the cost the owner's words point at is different-shaped
duplication — `directory.json` (`Server/plugins/Directory.js`, still generated, 3.3 MB
uncompressed, `ai/2026-09-29/slow-card-fix/`) does file-listing work a side-by-side
`page.jsonl` already does per-folder, unified.

**Proposal (≤8 lines):** Keep `page.js` for anything with real layout or logic; page.jsonl
already covers config + file + content-placement + accumulating data. For a `page.js` page
that wants jsonl-style log data (settings, tabs, weight), give it its OWN named file next to
`page.jsonl` (as weight.jsonl already does) rather than sharing the one PageFiles/tools write
to — one writer's assumptions per file. Don't move `content()` logic into jsonl lines; instead
grow the vocabulary of `set()`-recognised keys (a `tab` key, a `settings` key) so more of what
page.js currently hard-codes can be *either* a method call *or* a jsonl line, page's choice.

## 3. Tabs from page.jsonl

**Today:** two unrelated mechanisms. (a) `Page.prototype.tabs(names)` —
`ext/tabs/tabs.js:17-70` — draws a bar + panel from an explicit space-separated string, or
`[...this.children.keys()]` if none given; no persisted "active/disabled/in-nav" state, only
CSS classes (`.active`, `.in-path`) the router marks live. (b) `Doc.bar()` —
`ext/Doc/Doc.js:350-353` — computes the *tab strip* automatically from
`[...this.children.keys()].filter(name => !Doc.SECTIONS.includes(name))` plus
`overview`/`api`/`doc`/`files` — so **for a `Doc` page, a tab already appears automatically
the moment a name is a declared child** (no explicit list needed); `core/Page/page.js:98-101`
shows a page *overriding* that default order by hand.

**Smallest design:** since `Doc.bar()` already turns "is a declared child" into "is a tab",
the missing piece is only turning a jsonl `{"file": "kid/page.jsonl"}` or `{"tab": …}` line
into that same declared-child state, which `PageLog.link_child()` (`Log.js:74-77`) already
does for `file` lines matching `CHILD` — **file lines that are children already produce a tab
on any `Doc`.** What's missing is (a) *state per tab* — add `disabled`/`nav` to the
constructor-line or a `{"tab": {"name": …, "active": …, "disabled": …, "nav": …}}` line,
read into a small `Map` on `set()` (a new method, `tab(obj)`); (b) `bar()`/`Doc.bar()` filter
out a `disabled` or `nav: false` tab. Files that change: `core/Page/Log.js` (new `tab()`
setter), `ext/Doc/Doc.js:350-353` (`bar()` reads the map), `ext/tabs/tabs.js:17-19` (respect
`nav: false`).

## 4. Page settings

**Nothing exists.** The right drawer's "Settings tab" (`ext/drawer/tabs/settings.js`) is a
**global, dev-bar-wide** panel — edit mode, live-reload block, width, x-ray outline — reused
wholesale (its own comment: "nothing new"), not per-page at all. No per-page settings storage
of any kind was found under `core/Page/`.

**Proposal:** a `{"settings": {...}}` jsonl line, read by a new `PageLog.settings(obj)`
setter into `this.settings` (a plain object, `set()`'s existing machinery already handles a
plain-object key that's not a method). Start with exactly one field, the owner's own example:
`{"settings": {"nav": false}}` = "below weight 1, out of nav" — reusing `core/Page/weight/`'s
existing scale rather than inventing a second one. The drawer's Settings tab
(`ext/drawer/tabs/settings.js`) gets one more `section("this page", …)` that only renders when
`Page.of(document.activeElement ?? …)` finds a page with a `url` (i.e., never on the drawer's
own chrome) — writes back through `.claude/hooks/append.mjs`-equivalent server route, not a
direct file write from the browser.

## 5. Colour

No page-level colour or theme property exists anywhere under `core/Page/`. Colour lives
site-wide, in `public/framework/styles/system/studies/themes/themes.css` and the `color`
study pages (`styles/system/studies/color/`) — CSS custom properties on `:root`/`[data-theme]`,
the same for every page. The owner's "we're exploring colors" (checkpoint.md open ask #8) has
no code to point to yet; it is unbuilt, matching checkpoint.md's own note.
