# day-overview: build the per-day spend + module breakdown

Load the `minion` skill first. Your parent task is `public/framework/ai/sessions/2026/10/04/day-overview/day-overview/`
(read `../requirements.md` for the owner's full ask). You build the whole thing in one pass.

## The ask, in short
Owner wants, on the day page (`/framework/ai/<date>/`):
1. Two dollar totals — **Claude $** (subscription usage, priced at API rates) and **real $**
   (money actually charged — OpenRouter etc.) — split by task and by model.
2. A list of **modules touched that day**, each with that day's tasks and their one-line outcomes.
3. Click a module → a page at its own URL showing that day's work on it, each task wrapped in
   the same icon-item `ext/Mention` already draws for a page link.
4. Works for any day already on disk (today AND yesterday), not just today.

Numbers are computed by a node script — never typed by you.

## What already exists (read before writing anything)
- `Server/task-cost.mjs` + `Server/doc/task-cost.md` — computes each task's `cost_usd` and
  `cost.agents` (`[{id, model, role, usd}]`, root first) and APPENDS it to the task's own
  `task.jsonl` as an `assign` line. This already runs automatically after every agent result
  (Servex calls `--agent`), so by the time you read a task's `task.jsonl` its cost is already
  current — you do not need to re-run it yourself, just read the figure it already wrote.
- `Servex/ext/openrouter/provider.js` line ~65: `provider_for = model => model.includes("/")
  ? "openrouter" : "anthropic"`. This is THE rule for Claude $ vs real $: an agent's `model`
  string with a `/` in it (`"openai/gpt-6-luna"`) was billed in real dollars (the `usd` on that
  agent IS the real dollar figure already — `Agents.js`'s `refresh_or_cost()` overwrites the
  SDK's Anthropic-priced guess with OpenRouter's own billed total for exactly this reason). No
  `/` → Claude $ (subscription usage, priced at Anthropic's table). So: split `cost.agents` by
  `model.includes("/")`, sum `usd` into `real_usd` or `claude_usd`. (Today, 2026-10-03, every
  agent is a plain Claude model, so `real_usd` will show `$0.00` everywhere — that's correct,
  not a bug; OpenRouter/local models prove the split on a day that used one.)
- `public/framework/ext/AITask/cost.js` — `money()`, `model_name()`, `total()` (note: `total()`
  skips a row whose `cost.parent_task` is ALSO in the same row set, so its cost isn't counted
  twice — mirror that same skip in your script, in plain JS, not by importing this file: it
  imports `core/View/View.js` and touches the DOM, so it cannot run under plain Node).
  `day_costs()` is what the day page already draws (today's total + by-effort breakdown) —
  you are ADDING beside it, not replacing it.
- Every task's `task.jsonl` has `action` lines: `{"action":{"at","did","files":[...]}}` — this is
  how you learn which files, and therefore which module, a task touched. A task's OWN
  `task.jsonl` plus every minion sub-task's `task.jsonl` (recurse into every subdirectory of the
  task dir that itself holds a `task.jsonl`) together cover every file it touched — a parent
  often doesn't log a minion's own edits.
- `public/framework/ext/Mention/Mention.js` exports `build_row(name, entry, extra)` (the icon-item
  wrapper the owner means) and `ref_entry(url)` (looks a url up in the site's own page map,
  returns `{icon, name, url, class_card}` or `null` if that page isn't catalogued yet). Use
  `build_row` to draw every module row and every task-link row below — don't build a second
  version of that look.
- `public/framework/ai/page.js` — the day route lives around line 145-167 (search
  `/^\d{4}-\d{2}-\d{2}$/.test(name)`): it returns a `Page` whose `content(){ dashboard(this); }`
  and whose `route(task)` hands any task-shaped segment to `AITask`. You add one more branch to
  that `route(task)`, checked BEFORE the generic one, for `task === "module"`.
- `public/framework/ext/AITask/dashboard.js` — `dashboard(page)` is the function that draws a
  day's whole page; it already calls `day_costs(rows_of)` (today's total) inside `groups()`.
  You add your new section as its own small call near the top of `dashboard()`, same pattern as
  the existing `p.c("muted", ...)` tree-view link right above `$board`.

## Build this

### 1. `Server/day-spend.mjs` — the node script (law 7: compute, don't recall)
```
node Server/day-spend.mjs <YYYY-MM-DD>   writes public/framework/ai/<date>/spend.json
node Server/day-spend.mjs <YYYY-MM-DD> --dry   prints the same numbers, writes nothing
```
Model it on `Server/task-cost.mjs`'s own shape (arg parsing, `lines()` helper, `AI` root) rather
than reinventing those. For the given date's folder (`public/framework/ai/<date>/`):

- Find every task dir directly under it (same rule `task-cost.mjs`'s `allTasks()` uses: a dir
  holding `task.jsonl`).
- For each task dir:
  - `current(dir)` = the merged `assign` from ONLY that top task.jsonl (last value per key wins,
    same as `task-cost.mjs`'s own `current()`) — this already carries `cost_usd` and `cost`
    (with `cost.agents`, `cost.parent_task`) once `task-cost.mjs` has run on it. No `cost_usd`
    (not a number) → `tracked: false`, skip the dollar split for this task but still include it
    in the module breakdown if it has action lines.
  - Split `cost.agents` into `claude_usd` / `real_usd` by the `model.includes("/")` rule above.
  - Collect every `action.files` array from THIS task's task.jsonl AND every `task.jsonl` nested
    under its directory (minions). Union the file paths (no duplicates).
  - Map each file path to a module name, with this rule (simplest first, law 1):
    - starts with `public/framework/<tier>/<Name>/...` where `tier` is one of `core ext ux ui` →
      module = `<tier>/<Name>` (e.g. `core/Page`, `ext/Mention`, `ux/Dictate`).
    - starts with `public/framework/<X>/...` otherwise → module = `framework/<X>` (e.g.
      `framework/ai`, `framework/design`, `framework/styles`).
    - starts with `Servex/...` → module = `Servex`.
    - starts with `Server/...` → module = `Server`.
    - starts with `.claude/...` → module = `.claude`.
    - anything else → its first path segment, or `root` if there isn't one (a loose file like
      `readme.md`).
  - One line of outcome text: `(m.outcome ?? m.request ?? "").split("\n")[0].replaceAll("**", "")`
    (the same first-line rule `ext/AITask/card.js`'s own `first()` uses — read it, don't guess).
- Write (or print, under `--dry`) ONE JSON object:
  ```json
  {
    "date": "2026-10-03",
    "claude_usd": 0, "real_usd": 0,
    "by_model": [{ "model": "claude-sonnet-5", "claude_usd": 0, "real_usd": 0 }],
    "tasks": [{ "key": "2026-10-03/data-grid", "outcome": "…", "claude_usd": 0, "real_usd": 0,
                "tracked": true, "modules": ["core/Page", "ext/Mention"] }],
    "modules": [{ "module": "core/Page", "tasks": [{ "key": "...", "outcome": "..." }] }]
  }
  ```
  `claude_usd`/`real_usd` at the top are the DAY's totals: sum every tracked task's split costs,
  EXCEPT skip a task whose `cost.parent_task` names another task ALSO in this same date's set
  (mirrors `cost.js`'s `total()` — read its comment, it explains why: the parent's figure already
  includes it). `by_model` sums every tracked task's `cost.agents` by `model_name()`-style id
  (just group on the raw `model` string, no need to import `model_name()` — your JSON can carry
  the raw id and let the browser side prettify it). `modules[].tasks` holds every task that
  touched that module (a task spanning 3 modules appears under all 3 — on purpose, this is "what
  touched what", not an accounting split; a module's OWN dollar total is deliberately not shown,
  to avoid implying a sum of touched-modules equals the day total when a task spans several —
  say this as a one-line code comment, don't just leave it silent).
  No tasks at all for that date → still write `{date, claude_usd: 0, real_usd: 0, by_model: [],
  tasks: [], modules: []}`, not an error.

Run it yourself once you've written it: `node Server/day-spend.mjs 2026-10-03 --dry` and
`node Server/day-spend.mjs 2026-10-02 --dry` (yesterday — deliverable 4) — read the output,
sanity-check a couple of numbers against `node Server/task-cost.mjs --date 2026-10-03 --dry`
by hand before moving on.

Then run it for real (writes the files the page below reads):
`node Server/day-spend.mjs 2026-10-03` and `node Server/day-spend.mjs 2026-10-02`.

### 2. `public/framework/ext/AITask/module-spend.js` — the rendering
New small file (don't grow `dashboard.js` or `cost.js` into a second concern). Exports:

```js
export function spend_summary(date)   // the two totals + by-model, fetched from spend.json
export function module_list(date)     // the list of modules touched, each a clickable icon-item
export function module_detail(date, mod_slug)  // one module's tasks for that day
```

- Fetch `/framework/ai/${date}/spend.json` the same defensive way `dashboard.js`'s own `json()`
  helper does (SPA-fallback guard: a 404 answers with `index.html`, check the content-type) —
  either import that helper if it's exported, or copy its three lines; don't invent a fourth
  fetch-json helper for this codebase.
- `spend_summary`: draws `money(claude_usd)` and `money(real_usd)` (import `money` from
  `./cost.js`) side by side, then the `by_model` rows underneath, small and muted. Silent (draws
  nothing) when the file is missing or both totals are 0 AND there are no tasks — a day with
  real work but $0 tracked should still say so plainly ("not tracked yet"), not vanish.
- `module_list`: for each `modules[]` entry, one row: `build_row(mod.module, entry, "inline
  mention")` where `entry = ref_entry("/framework/" + mod.module + "/") ?? { icon: "folder",
  name: mod.module }` — wrap it in an `a` with `href` to `/framework/ai/${date}/module/${slug(mod.module)}/`
  (write a tiny `slug()` here: lowercase, `[^a-z0-9]+` → `-`). Each row also shows the count of
  that day's tasks on it, e.g. "3 tasks" muted beside the icon-item.
- `module_detail`: given the date and a slug, re-fetch spend.json, find the module whose `slug()`
  matches, and list its `tasks` — each one `build_row(t.key.split("/").pop(), { icon:
  "receipt_long", url: "/framework/ai/" + date + "/" + t.key.split("/").pop() + "/" }, "inline
  mention")` followed by its outcome text in a muted span. No match → "Nothing recorded for this
  module on `${date}`."

### 3. Wire it into the day page
- `dashboard.js`: inside `dashboard(page)`, right after the existing
  `p.c("muted", () => a("See this day as a tree...")...)` line and before `$board`, add one call:
  `spend_summary(date)` then `module_list(date)` (import both from `./module-spend.js`).
- `page.js`: inside the day `Page`'s `route(task)` (the one around line 159, currently
  `if (task.includes(".") || has_page_js(name, task)) return; return new AITask({...})`), add
  ONE branch ABOVE that, matching `task === "module"`:
  ```js
  if (task === "module") return new Page({
      title: "By module", icon: "folder", url: this.url + "module/",
      content(){ module_list(name); },   // same list again, so the url works standalone too
      route(mod){ return new Page({
          title: mod, icon: "folder", url: this.url + "module/" + mod + "/",
          content(){ module_detail(name, mod); },
      }); },
  });
  ```
  Import `module_list, module_detail` from `/framework/ext/AITask/module-spend.js` at the top
  of `page.js` beside its other `AITask` imports.

## Prove it before you say done
- `node Server/day-spend.mjs 2026-10-03` then `node Server/day-spend.mjs 2026-10-02` both run
  clean and their `spend.json` files look right (open them).
- Load `/framework/ai/2026-10-03/` in a headless check (`node Server/layout-check.mjs
  http://monorepo.localhost/framework/ai/sessions/2026/10/03/ --widths 400,1920`) — zero console errors,
  the two totals visible, the module list visible.
- Click (or navigate straight to) one module's url, e.g.
  `http://monorepo.localhost/framework/ai/2026-10-03/module/core-page/` (whatever module
  actually appears in your spend.json) and shoot it at 400 and 1920 too — same tool, same flags.
- Do the same one more time for `2026-10-02` (deliverable 4: yesterday must work).
- Put every screenshot's path in your task log (`.claude/hooks/append.mjs` into YOUR OWN
  `task.jsonl`, not the parent's — you are `build-spend`, a subtask of `day-overview`).

## Fence
Only: `Server/day-spend.mjs` (new), `public/framework/ext/AITask/module-spend.js` (new),
`public/framework/ext/AITask/dashboard.js` (one import + two calls), `public/framework/ai/page.js`
(one import + one route branch), `public/framework/ai/<date>/spend.json` for both dates you test,
and your own task dir
(`public/framework/ai/sessions/2026/10/04/day-overview/day-overview/build-spend/`). Nothing else. Never
`public/framework/ext/AITask/cost.js` — read it, don't edit it.

The quick-fix worktree pool is drained right now (`take_worktree` just failed for your parent;
`card-measure-colors` hit the same thing tonight and worked in the main tree instead). Do the
same: edit directly in `C:\Code\lew42\monorepo` (no worktree), **commit each file to
`michael/dev` as soon as it works** (small commits, exact paths — never `git add -A`), so nothing
of yours sits uncommitted and blocks someone else's merge. When everything's proven, there is no
separate `merge.mjs` step since you never branched — just make sure `git status` is clean for
your files at the end. Report back to `task-mastermind-day-overview` when landed or blocked.
