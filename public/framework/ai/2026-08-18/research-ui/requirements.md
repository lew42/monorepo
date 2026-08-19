# research-ui — ext/Research: the live page (conclusions first, drill down forever, minions visible)

**Laws: less is more (ASAP) · clarity is the one exception · prioritize.** Length budget: `Research.js` ≲ 200 lines, `Research.css` ≲ 80, each `page.js` ≲ 40. Load `code`, `css`, `layout`, `new-page`, `new-css-class` before writing (they are short). If a skill misleads you, one line in its `improvements.md` (`skill-improvement`).

## The ask (owner, verbatim, the parts this task serves)

> a decision making system, but one that I can SEE THE MINIONS BUILD IN REALTIME … I want to be able to see exactly how many minions are running, what they're currently working on … These should be Interactive Reports that are extremely simple, visual, helpful. And yet, they could have a wealth/depth of information … Interactive Research Reports should be highly navigatable. Bury the details, start with the conclusions … I keep feeling like getting images into the mix is important, experiment with that … maybe they're just big icons for now … We want the minions to be able to drill down endlessly, but in a structured way … We want sockets.

## What exists (read first, ~10 min)

- `public/framework/ext/JSONL/JSONL.js` + `live.js` + `readme.md` + `doc/live.md` — `new TaskJSONL({url}).live(show)` loads a `.jsonl` and streams appended lines over the dev socket (`Tail`); `changed` fires per batch **outside any captor → redraw through `$view.empty(() => …)`**. A subclass adds verbs via `static verbs` and clears their arrays in `reset()`.
- `public/framework/ext/AITask/` — the precedent: `AITask.js` renders a task log live; `dashboard.js` (`warm`, `rail`) enumerates dirs from `directory.json`; `public/framework/ai/page.js` `route()`s undeclared dirs. Copy the pattern, not the code.
- `public/framework/ext/Doc/readme.md` — the module page shape (`export default new Doc({...})`).
- The data: **`public/framework/research/livereload/research.jsonl`** already exists with a header and seed nodes. The schema (also being built as `ext/Research/verbs.js` by a parallel task — import `VERBS` from it if it has landed when you get there, else hard-code the kinds and note it):

| verb | value |
|---|---|
| `assign` | `{title, question, by, at, config:{minions,minutes}, status, summary:[…]}` — `summary` = the conclusions, ≤ 7 lines, the top of the report |
| `node` | `{id, parent?, kind, text, by, at, why?, refs?, icon?, img?, importance?}` — `kind` ∈ `question claim evidence support dissent alternative note`; `parent` absent = root; `icon` = Material Symbols name; `img` = url |
| `vote` | `{node, by, at, importance:1–5}` — score = mean(author importance, votes) |
| `verdict` | `{node, by, at, state, why, into?}` — `accepted rejected parked merged`; latest wins |
| `agent` | `{name, persona, model, at, doing, done?}` — merged by `name`; the minions strip |
| `log` | `{at, msg}` — process narration |

## Deliverables

1. **`public/framework/ext/Research/Research.js`** — `class ResearchJSONL extends JSONL` (verbs above; `nodes` map, `children(id)`, `score(id)`, `state(id)`, `agents` map) and the view (`Research`, a `Page`/`View` subclass — whichever `code` says; every render step its own method). Layout, top to bottom, nothing else:
   - **Header**: title · question · status · `config` (minions/minutes) · the **minions strip**: one chip per `agent` — name, persona, `doing` (live), dimmed with `done` when landed. Count visible: "3 running".
   - **Conclusions**: `summary` lines, big type, first thing under the header. Empty → one quiet line "digging…".
   - **Ranked claims**: root nodes sorted by score desc; each a card: `icon` **big** (Material Symbols — the site already loads them; check how `Page.icon` renders), `text`, score as 1–5 dots, state badge (accepted ✓ · rejected ✗ · parked ⏸ · merged →), counts `2 support · 1 dissent · 3 evidence`, `img` inline when present. Click → children **nested inline with native `<details>/<summary>`** — endless depth, every child the same shape (smaller); `why` under the text in smaller type; `refs` as links (`file:line` plain, urls clickable). Preserve which ids are open across live re-renders (a `Set` of open ids).
   - **Process** — a closed `<details>` at the bottom: `log` lines, newest last.
   Live: `.live(show)`; a line appended by `node public/framework/ext/Research/research.mjs say livereload --kind note --by ui-test --text "hi"` (or by hand: `printf '%s\n' '{"node": {"id": "nzzzz", "kind": "note", "text": "hi", "by": "ui-test", "at": "2026-08-18T17:30:00-05:00"}}' >> public/framework/research/livereload/research.jsonl`) must appear **without a reload**. Verify that with `mcp__site__eval`/`shot` in a headless or fresh tab — never the owner's live tabs (memory: `browser-testing-headless`).
2. **`public/framework/ext/Research/Research.css`** — inside a layer, tokens over literals (`css` skill; check `framework.css` first). Class names prefixed `research-` (run `new-css-class`).
3. **`public/framework/research/page.js`** — a `Page` at `/framework/research/`: `content()` lists topics (dirs under `/framework/research/` from `/directory.json`, the way `AITask/dashboard.js` does) as a rail/list; `route(slug)` returns the `Research` view for `…/<slug>/research.jsonl`. Add **`research`** to `children:` in `public/framework/page.js` (one word, after `ai`). ⚠ Nothing crawls: a page nobody links to does not exist.
4. **`public/framework/ext/Research/page.js`** — the module's Doc page (`Doc` shape; `files: "Research.js Research.css verbs.js research.mjs"`, `notes: "render verbs writers decisions"`, `content()` = one paragraph + a link to `/framework/research/livereload/`). Add `Research` to `children:` in `public/framework/ext/page.js` and one line to `public/framework/ext/readme.md`'s list. Do **not** write `readme.md`, `doc/verbs.md`, `doc/writers.md`, `doc/decisions.md` (owned elsewhere); write **`doc/render.md`** (≤ 1 screen: the layout, why native details, the open-set, what a big icon does for scanning).
5. **Stretch, only if ≤ 15 lines**: an owner input in the header that appends `{"log": {"at", "msg": "owner: …"}}` to the topic file through whatever write RPC already exists (`ext/Saver`, `dev/Socket` `rpc:write`? — look, do not build a new one). If it is more than that, skip it and log "parked: owner direct box".

## Sizing (the `layout` skill's questions, answered here so you don't re-derive)

The page is a reading page: one column, `--measure`-wide (the site's 40em token) for the text; cards may span the page width; the minions strip is a wrapping row of chips. Mobile first.

## Fences

Yours: `public/framework/ext/Research/{Research.js,Research.css,page.js,doc/render.md}`, `public/framework/research/page.js`, one word in `public/framework/page.js` `children:`, one word in `public/framework/ext/page.js`, one line in `public/framework/ext/readme.md`. **Not yours:** `verbs.js`, `research.mjs`, `Server/`, `readme.md`, `doc/decisions.md`; append to `research/livereload/research.jsonl` only test `note`s by `ui-test`.

## Log as you go

Your task log is `public/framework/ai/2026-08-18/research-ui/task.jsonl` — append `{"log": {"at": "<clock>", "msg": "…"}}` at milestones; `{"shot": {"at", "path", "note"}}` for a screenshot (path outside the repo — the scratchpad); never `assign`. Final message: what landed (paths + the url), the screenshot path, what you left out. ≤ 15 lines.
