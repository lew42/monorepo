# Migration guide: `page.children` to `page.pages`

> **Moved (2026-10-28):** the maintained copy of this guide lives beside the module it is about: [core/Page/doc/migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md). This copy is the seat record.


The owner's asks 29 and 30 ([requirements.md](../../requirements.md)): `pages` says what is inside; `children` could be anything. `page.children` is a legacy wrapper, so deprecate it, write this guide, then remove it. The rule is in [doc/rules.md](/framework/doc/rules.md) ("An old way that lingers is marked, or it gets copied").

Every number below comes from a script that walks the repo (census scripts live in the seat's scratchpad; the per-line output is saved beside this file in [census/page-children-calls.tsv](census/page-children-calls.tsv)). The walk skips dated session folders, `legacy/` and `old/`/`archive/` folders, `node_modules`, worktrees and `data-shapes/seats`.

## 1. What it is today

- `page.pages` is the real thing: a `List` owned by the page (`core/Page/Page.class.js:128`, `new List({ owner: this, name: "pages", of: null })`). It is the only storage.
- `page.children` is a getter (`Page.class.js:130`) that returns `PageChildren extends Map` (`core/Page/Children.js`, 59 lines). It stores nothing; each method reads or writes `page.pages`. It is not marked deprecated anywhere (no "deprecated" comment in `core/Page/*.js`).
- A **stub** is a child that is declared but not loaded yet. It lives in `pages` as a plain object `{ id, name, stub: true }`. The wrapper hides it: `children.get(name)` answers `null` for a stub and `undefined` for an absent name; `values()`, `entries()` and `forEach` hand out `null` where the stub is. `page.pages` does NOT hide it: `pages.find(name)` returns the stub object, and iterating `pages` yields stub objects among the real pages. This is the one trap in the migration (section 4).
- `page.children = x` is a setter that only stages the config for `declare()` (`Page.class.js:132-141`); a `new Map()` means "forget every child".
- The config key `children:` (in a `page.js` object) is a **different thing** from the runtime property; see section 6.

## 2. The census of callers

Method: a script lists every line mentioning `children` in `.js`/`.mjs` under `public/`, `Servex/`, `Server/`, `.claude/`, classes each hit by what is called on it (Map method, spread, assignment, config key), then a second pass keeps only hits where the receiver is a Page (the file imports the Page machinery or the receiver is a page). The ambiguous hits were checked by hand (listed in the script as INCLUDE/EXCLUDE patterns).

**Live callers of the Map API: 233 call sites in 105 files.**

| Where | get | set | has | keys | values | forEach | iterate | size | delete | put | clear | assign | read | total | files |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| `core/Page/` | 14 | 5 | 7 | 2 | 6 | 13 | 0 | 11 | 1 | 1 | 0 | 2 | 1 | 63 | 23 |
| the rest of `framework/` (live modules) | 17 | 1 | 5 | 12 | 4 | 5 | 6 | 4 | 1 | 0 | 1 | 0 | 2 | 58 | 30 |
| `framework/` other (not a module folder) | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 3 | 1 |
| sites (`imagine`, `layouts`, `web`, `michael`, `blog`, ...) | 42 | 0 | 0 | 7 | 17 | 22 | 6 | 11 | 1 | 0 | 0 | 2 | 1 | 109 | 51 |
| `Servex/`, `Server/`, `.claude/` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **live total** | **73** | **6** | **12** | **21** | **27** | **42** | **12** | **27** | **3** | **1** | **1** | **4** | **4** | **233** | **105** |

Not counted in the 233, reported separately:
- **`core/new/` (79 sites in 38 files):** a kept sketch with its **own** `Page` class whose `children` is a real `Map`. It is not a caller of `PageChildren`. Leave it alone (it is archived design work); it does mean a search for `.children.get(` finds 79 lines that are not this migration.
- **`old/` and `archive/` folders (10 sites in 7 files):** frozen.
- **Config `children:` keys** in files that declare a page (they contain `import.meta`): about 606 hits in 462 files, an upper bound that includes `core/new` (93), `old/archive` (22), Servex objects and a few data trees. In live `framework/` + sites: 471 (string 147, array 157, object 80, function 41, method 9, other 37).
- **DOM and look-alike `.children`:** about 900 further hits are not Page at all: `el.children` / `parentNode.children` (DOM), `Task.children` and `Session.children` (computed getters over the task list; `ai/AITask/AICost.js` reads one), data trees (`node.children` in `ux/Tree` demos), directory-entry trees, three.js scenes, `List.children` (which is just `items`, `List.js:69`). A text search for `.children` over-counts by four to one; use the caller list in `census/` instead.

Per-file shape of the live callers (top of `census/page-children-calls.tsv`): `web/nav/drill/page.js` 12 sites; `core/Page/Page.class.js` 9; `core/Page/Jsonl.js` 7; `blog/Post.js`, `core/Page/Frame.js`, `core/Page/generator/page.js`, `core/Page/generator/tree.js`, `core/Page/page.js`, `ext/Doc/Doc.js` 6 each.

**Adoption of the replacement so far:** `page.pages` is called directly at 37 sites in 15 files (for example `imagine/paging/stage.js` 6, `ext/Figma/FigmaFile.js` 4, `Page.class.js` 4). Some of those are other objects that happen to have a `pages` property (a listing, a Figma file), so treat 37 as an upper bound. The wrapper's own file accounts for 12.

**Still being copied:** `git log --since=2026-10-14 -p` filtered to added lines in live code finds **10 new `.children.<method>` lines in 8 commits in 9 files** in two weeks (for example `Sidebar.js`, `ux/Tree/Tree.js`, `AISessionDetail.js`, `StoreFolder.js`, `ext/drawer/Sheet.js`; one of the ten, `AICost.js`, is a Task and not a Page). Agents are still learning the old way from what they read.

## 3. The replacement, per kind of use

Mechanical rows can be rewritten by a script with a dry run. Manual rows need a person (or a worker) who reads the line.

| Old | New | Notes | Sites | Tier |
|---|---|---|--:|---|
| `page.children.get(name)` | `page.pages.find(name)` | Differs for a stub: old answered `null`, new answers the stub object. Safe where the result is tested with `instanceof Page` or `?.` on a Page method. Add `&& !x.stub` where the old code used plain truthiness or `=== null` / `=== undefined` (see section 4) | 73 | mechanical, with stub rule |
| `page.children.has(name)` | `page.pages.find(name) !== undefined` | Same meaning: stubs count as present in both | 12 | mechanical |
| `page.children.size` | `page.pages.length` | | 27 | mechanical |
| `[...page.children.keys()]` | `page.pages.map(p => p.id)` | `id` equals the name the Map used | 21 | mechanical |
| `[...page.children.values()]`, `for (const p of page.children.values())` | `[...page.pages]`, `for (const p of page.pages)` | Stubs arrive as objects; add `.filter(p => !p.stub)` where the old code guarded `p?.` against `null` | 27 + 12 | mechanical, with stub rule |
| `page.children.forEach((child, name) => …)` | `page.pages.forEach(child => …)`, with `const name = child.id` | The argument order changes (the Map put the page first and the name second). `child` was `null` for a stub; now it is the stub object | 42 | mechanical, with stub rule |
| `[...page.children]` / `for (const [name, p] of page.children)` | `page.pages.map(p => [p.id, p])` | Rare; entries are pairs | (in iterate) | manual |
| `page.children.set(name, null)` (declare a stub) | one Page method, e.g. `page.pages` insert of `{ id: name, name, stub: true }` | The wrapper adds it **quietly** (no change event). All six live `set` sites are inside `core/Page` (`Jsonl.js` x2, `Page.class.js`, generator). Give the page one small named method for it and call that | 6 | manual, `core/Page` only |
| `page.children.set(name, page)` | `pages.replace(stub, page)` or insert | Same, the quiet path `Page.add()` already uses (`Page.class.js:320-321`) | (in set) | manual |
| `page.children.delete(name)` | `page.pages.release(page.pages.find(name))` | `release` is List's quiet remove. Not `remove()`, which announces | 3 | manual |
| `page.children.put(page)` | the body of `Page.add()` | Only `Page.class.js:321` calls it; `put` exists to skip List.insert's owner-property guard | 1 | manual |
| `page.children.clear()` | `[...page.pages].forEach(p => page.pages.release(p))` | `ext/catalog/catalog.js:31` | 1 | manual |
| `this.children = new Map()` / `this.children = this.part_pages()` | forget-everything, or stage new config for `declare()` | Needs a decision on the config key (section 6) | 4 | manual (`blog/Post.js:47`, `generator/page.js:56`, 2 in `core/Page`) |
| a function that **takes** `page.children` as its argument: `Previews.list(pages = this.page.children)`, `pick(this.children, "a b c d")` | take the `pages` List or an array of pages | The callee reads it as a Map (`.get`, `.keys`), so rewrite caller and callee together | 4 | manual |

Counts by tier (live): mechanical rows 73 + 12 + 27 + 21 + 27 + 12 + 42 = **214**; manual rows 6 + 3 + 1 + 1 + 4 + 4 = **19**; total 233.

## 4. The stub rule (the one thing that can break a page)

`children.get(name)` collapsed three states into two answers: a loaded page, `null` (declared, not loaded), `undefined` (absent). `pages.find(name)` gives the page, the stub object, or `undefined`. Code written against `null` breaks quietly:

- `if (page.children.get(name))` is false for a stub; `if (page.pages.find(name))` is true for it. Rewrite as `const kid = page.pages.find(name); if (kid && !kid.stub)`.
- `known === undefined` (as in `Page.child()`, `Page.class.js:343-362`, where it means "nobody declared this name") stays `=== undefined`; `known === null` becomes `known?.stub`.
- Anything that then calls a Page method on the result (`.assign`, `.load_all_children`) must not be handed a stub object.
- Iteration: `p?.classes` on a stub object is `undefined` (fine), but `p.url`, `p.title` read the stub's missing fields; filter stubs out where the old code skipped `null`.

The cleanest end state is to keep stubs out of `pages` altogether (a separate "declared" list on the page), after which the rule disappears and `pages.find` is the only call. That is a design choice for whoever decides how declared-but-unloaded children are stored (the pages seat's question, not this seat's). If it lands first, drop this section; if not, the codemod below applies the guard.

## 5. Dry-run script plan

One new node script, `Server/ChildrenMigrate.mjs` (named and homed here first; scratch census scripts stay out of the repo). It never writes without `--apply`, and it prints the manifest first.

1. **Mark first.** Add the deprecation comment to `Children.js` (class line) and the getter (`Page.class.js:130`): one line, "Deprecated: use `page.pages` (a List); migration guide: `core/Session/tasks/data-shapes/seats/legacy/migration-children-to-pages.md`". Same step: change the docs (section 7). This stops new copies while the rewrite runs. Cost: three lines.
2. **Inventory (read-only).** Walk `public/` (js/mjs, skipping dated session dirs, `legacy/`, `old/`, `archive/`, `core/new/`). For each `.children` hit: decide "is this a Page?" by the same rule as the census (file imports Page machinery or is in `core/Page`) plus the hand-curated EXCLUDE list. Output the manifest TSV: `file, line, kind, old text, proposed text, tier, stub-rule?`. The saved census is the starting INCLUDE/EXCLUDE input.
3. **Dry run.** Print a unified diff per file for the mechanical tier only, never writing. Show the count per file and flag every row where the stub rule applies. Review the diff for the three biggest callers (`web/nav/drill/page.js`, `core/Page/Page.class.js`, `core/Page/Jsonl.js`).
4. **Apply the mechanical tier in worktree** `task/children-to-pages`, one commit per folder (`core/Page`, then the rest of `framework`, then sites), each followed by: `node --test` for Page/List/Item/Task, `node Server/smoke.mjs` (no FAIL), and `check_page` on a sample page per folder.
5. **Manual tier (19 sites)** by one worker with the table in section 3. Do `core/Page` (set/delete/put/clear/assign) last of the manual work, since it touches the wrapper's own users.
6. **Remove.** Delete `Children.js`, the getter and the setter staging (keep a thin setter if the config-key decision in section 6 says so). Re-run the census: the number must be 0 live callers. Remove the deprecation comment with the code.

Risk: the ambiguous receivers (`this.children` inside a class that is not a Page). The script must read the enclosing `class X extends Y` and refuse anything that is not under `Page`. Ask for a second number that must equal the first: sites rewritten plus sites skipped equals the census total (233).

## 6. The config key `children:` is a separate decision

606 config hits in 462 files, 471 in live code, in five shapes (a space-separated string, an array of names, an array of option objects, an object keyed by title, a function). `declare()` (`Page.class.js:271-308`) reads it; `core/Page/readme.md:17` and `doc/property/children.md` teach it. Two options:

- **Keep `children:` as the declaration word for now** and migrate only the runtime property. Recommended: the owner named the property, not the config key; renaming 471 declarations touches nearly every page file for no new capability; `declare` can accept both words later.
- Rename the key to `pages:` in the same pass. Wins only if the data-shapes work makes `pages` the declared word everywhere (seat (d)).

Either way the setter (`set children(list)`) stays as the staging door until the config key is renamed; it is not a caller of the Map API.

## 7. Docs that still teach the old way (change in the same task)

Markdown lines that use `children.get/set/has/keys/values/entries/forEach/delete/size/put/clear` in non-archived docs: **38 lines in 28 files** (`core/new/1/agents/*` accounts for 12 of them, a separate Page). The live ones:
- `core/Page/readme.md:33` ("memory (`this.children`)"); `core/Page/doc/property/children.md` (calls the Map "from then on every reader uses the Map"); `core/Page/doc/method/declare.md:21` ("`[...this.children.keys()]` is the idiom everywhere"); `doc/data-children.md`, `data.md`, `jsonl-pages.md`, `labels.md`, `panels.md`, `method/nav_for.md`, `method/source_children.md`.
- `core/Sidebar/doc/{decisions,entries,sidebar-notes}.md`, `property/pages.md`; `core/App/doc/adoption.md:39`; `ux/Tree/doc/decisions.md:333`; `ext/catalog/doc/file/catalog.js.md`; `ext/demo/doc/file/exhibit.js.md`; `public/web/nav/readme.md:38`.

Rewrite each to the new call and add one line in `core/Page/readme.md` ("`page.children` is the old Map-shaped view of `page.pages`; use `page.pages`"). `ai/system-map.md` and `core/Page/doc/old/children` (the long-form guide named in `property/children.md`) should be checked for the same.

## 8. Done when

- The census script reports 0 live callers and the file `Children.js` is gone.
- `git log --since=<removal date> -p` finds no added `.children.get(` etc. in live code.
- The 28 doc files teach `page.pages`.
- A page that loads a stubbed child (a `page.jsonl` folder listed but not yet opened, the jsonl demo) still opens and its sidebar entry still appears.
