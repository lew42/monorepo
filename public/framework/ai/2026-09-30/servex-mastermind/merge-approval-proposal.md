# Four decisions for the owner: budgets, merge approval, template weights, one log or two

The owner's words: [merge-approval/owner-words.md](../merge-approval/owner-words.md). Proposal only; nothing built. Each section: the recommendation in one line, then the alternative, then what it touches.

## 1. Budgets: a pace signal, never a stop, on foundational work

**Recommend:** keep `Budget: $N` on every brief (it is how the heartbeat sees spend), but add one word on the assign line, `foundational: true`. For a foundational task Budget.js still says "you are at 100%" to the owner and its parent, and never refuses spawns or stops minions. A brief is foundational when the owner's words say so, or when it touches `core/`, `styles/framework.css`, `Servex/` or `Server/`. Waiting for a reset is the normal answer to "over pace", not a cap.

**Reuse before spawn:** a rule for the mastermind skills: before spawning, look at the live masterminds; if one has the context (same module, same day, cached), `send_to_agent` it the addition and let it say how much it costs. A fresh spawn is for a new topic. Today's example: the dictation unification went to audio-consolidate, not a new agent.

**Alternative:** no budgets at all on foundational tasks. Loses the 100% line, which is the only thing that made today's $31 visible.

Touches: `Servex/Budget.js` (one flag), `servex-mastermind` and `sub-mastermind` skills (two lines).

## 2. Merge approval and reversible merges, on the card

**Recommend:** every worktree merge becomes a row on its task's card before it lands: the diff stat, the review report, and before/after screenshots at 400 and 1920 (`Server/review.mjs` already makes them). Two classes, decided by `review.mjs`'s `sizeOf` plus the paths:

| Class | When | What happens |
|---|---|---|
| **needs approval** | full-size, or touches `core/`, `styles/framework.css`, `Servex/`, `Server/`, `framework/ai/` code, or any page the owner named this week | the row is an ask (asks ledger, Inbox); the owner presses Approve; merge.mjs lands it |
| **auto-merge** | light-size, no path above | lands as today (review + smoke), the row is FYI |

**Reversible:** merge.mjs already lands a merge commit per worktree; `git revert -m 1 <merge>` undoes one cleanly, even an old one, as a new commit (nothing is rewritten, so the site keeps its history). The card row gets **Reverse**, a Servex tool `revert_merge` that runs it, smoke-tests, and logs the reversal on the same card. A revert of a revert brings it back.

**Alternative:** approve every merge. Costs the owner a click per task (27 on a swarm day) and stalls the small fixes the pool exists for.

Touches: `Server/merge.mjs` (`--propose` writes the row and waits for an approve line), one Servex tool, the card (a Merge row with Approve / Reverse), the asks ledger (an approval is an ask).

## 3. Template weights: a tool backed by a node function, plus a static count

**Recommend:** the library lives at `/framework/ui/` (the owner's word), one page per template, component and layout, each page showing its **weight** and **where it is used**. Two sources, added:
- **Static:** who imports it — a generator like `files.jsonl` walks `public/` for imports and `children:`; free, always right for modules.
- **Declared:** `use_template(name, where)` — a Servex tool backed by `Templates.use()` in node, which appends `{use:{template, where, by}}` to the template's own `page.jsonl` (Law 4: a page's facts live in its own log). For layouts and patterns that are not imports (a card grid, a holy-grail layout) this is the only way to count.

**Which mechanism, and why not the others:** a skill can't record anything (it is instruction); a hook can't tell that a template was used; an MCP tool is right for agents but a `page.js` can't call it, so the node function is the core and the tool is its agent face. The thin `page`/`design` skill says one line: "placing a template? call `use_template`".

**Coordinate:** mastermind-page's use-count audit is the static source (its counts seed the weights); design-code's `/framework/design/` pages link to the library rather than listing templates; the library is a design-code follow-up, not a new fan-out.

**Alternative:** weights by hand in a `templates.json`. Wrong the day after it is written.

## 4. One log per page, not two

**Recommend: one file, `page.jsonl`, and the line's key says what it is.** The Inbox already reads only `inbox` lines; the board reads `assign`/`landed`; `log` lines are the everything. Compaction is an interval job on that one file: keep every non-`log` line and the last N `log` lines, move the older `log` lines to `page.log.jsonl` beside it (append-only archive, nothing deleted, searchable). No writer decides "which file"; a writer decides the key, which it already does.

**The owner's alternative, two files** (`page.jsonl` curated, `log.jsonl` everything): every writer chooses twice, every reader opens two, AI 2's `groups.js` and the asks ledger key on one file today, and the curated file drifts from the truth. The owner's own worry ("once you separate into two variants…") is the reason.

Touches: one compaction job (Servex, interval), `ext/JSONL` readers unchanged.

## What happens next
Nothing until the owner marks the card. Then: 1 and 4 are an afternoon; 2 is a task mastermind ($ open, foundational); 3 waits for the design/code pages to land, then one task.

## 5. The build loop, with the owner in it (folds into §2)

The owner's loop, as the merge row's life: **MVP → smoke test + screenshots → a quick layout check → an Inbox row, mid-flight → the owner's word → merge.** The row is the same Merge row from §2, posted earlier: it appears when the MVP passes smoke, not when the agent is done. It carries something visible (the shots at 400 and 1920, the layout check's one line) and one question: **approve**, **recommend**, or **improve**. When the owner is around, the answer arrives before the agent goes further; when not, the row waits and the agent works on the next step or parks (no cap, no rush). Done is a second line on the same row, not a new one.

Rules written into it:
- **Nothing broken reaches the site:** the row exists only after smoke passes; a red smoke test is a log line, never an Inbox row.
- **Review on the main domain:** the owner does not visit a worktree server. So the dev server serves each pool worktree read-only under a prefix, `monorepo.localhost/preview/qf-3/framework/...`, straight from its directory — the Inbox row links there. Nothing is merged to be looked at. (Alternative: merge behind approval and revert if refused; costs a merge plus a revert per "improve".)
- **The Inbox is the tool:** ask when something important needs the owner, tell when it is done, ask for approval — three row kinds, one module, its own readmes (§6).

Touches: `Server/` (a preview route per worktree), `merge.mjs --propose` (post the row after smoke, wait for the approve line), the review skill (the layout check is its short form), the sub-mastermind skill (the loop in five lines).

## 6. Path-level experts: what is missing for "start a mastermind in any directory" to just work

What exists: `readme-chain.js` gives any spawn its chain root-first; `ask_directory` spawns a fresh agent in a directory with that chain and answers one question; `experts.js` keeps one read checkpoint per module and forks it per question; the page inbox lets anyone leave a note on a directory's page. Four gaps:

1. **The chain reaches only tasked spawns.** `directory_of()` in Agents.js returns null for a plain minion or a CLI session, so they get no readmes. Fix: fall back to the spawn's `cwd`/`dir`. One line; the deferred fix from this morning.
2. **No directory has a standing mastermind.** `ask_directory` is one question, one fresh agent. Add `mastermind-<dir slug>` as a minted id (`Agents.name()`), one per directory, dormant between prompts, resumed by session id: the "expert" and the "mastermind" are the same session — its first turn is the read (`experts.build`), questions fork it (`experts.ask`, cached), plans and spawns resume it. `experts.json` becomes the registry of directory masterminds.
3. **Nothing routes a prompt by path.** The Dispatcher reads the path from the tab (the page the owner is on), a `/path` mention, or the card's directory, and sends the prompt to that directory's mastermind, spawning it if absent — the holder for a path, like `holder()` is for a retired id. The answer or the plan lands on the directory's page inbox and, when it needs the owner, an Inbox row.
4. **Readmes are the expertise, and some directories have none.** The rule only works where the chain exists: `ext/Inbox` (the owner's example) needs `readme.md`, `page.js`, `doc/`, in the shape the documentation skill already prescribes; `/framework/ai/readmes/` can list the directories with a missing readme so it is visible.

Not missing: a new agent kind. A path mastermind is the existing task mastermind with a directory instead of a brief.

Touches: `Agents.js` (1, 2), `Dispatcher.js` (3), `experts.js` (checkpoint = the mastermind's base session), `ext/Inbox` readmes (4).

## 7. Messages, cards and threads: one rule for "everything is a page" (adds to §4)

**The rule, in one line:** *Everything is a page. A page has a directory when it has grown; until then it is a line in its parent's `page.jsonl`; and a name that groups pages without content of its own (a tag, a kind, a day) is only a namespace.*

The three states, and how you tell them apart:

| State | What exists on disk | How it is reached | Example |
|---|---|---|---|
| **real page** (a path) | a directory with `page.jsonl` (line 1 says what it is), and when it needs them `readme.md`, `page.js`, `doc/` | its URL, routed by the parent's `children:` or by `page.jsonl` line 1 | `/framework/ai/2026/09/30/drill-in-…/`, `/framework/ext/Chat/` |
| **virtual page** | one line in the parent's `page.jsonl` with an `id` (a message, a note, a reply, a sub-card) | `parent/<id>/`, routed dynamically by the parent's `route()` reading its own log; also `parent/#<id>` in the parent's view | a chat message, an inbox row, a thread reply |
| **namespace** | nothing of its own: a key that other lines carry (`tags`, `kind`, a date folder that only holds pages) | a filtered view of pages: `/framework/ai/?tag=servex` | a project tag, "question" cards, a day |

A virtual page has a preview and a detail view like any page: the preview is its line drawn as a chip or row, the detail is its `panel()` at `parent/<id>/`; a thread is the lines whose `parent` field names that id, nested as deep as they go. Nothing needs a name or a directory to exist: the id is minted (`m-3f9k`), the title is optional until promotion.

**Where per-path AI data lives today** (so nobody has to remember):
- **A module's own facts:** `<module>/page.jsonl` beside its `page.js` — its inbox (`inbox` lines), notes, later its uses (§3). A card *is* such a directory under `ai/2026/09/30/<slug>/`, so a card's messages already live in the card's own `page.jsonl` (`message` lines).
- **A task's record:** `ai/<date>/<slug>/task.jsonl` (assign, log, landed) beside its brief and its files.
- **Site-wide streams, one per kind, in `ai/`:** `log.jsonl` (everything, the firehose), `day.jsonl`, `board.jsonl`, `cards.jsonl`, `chat.jsonl`, `asks.jsonl`, `prompts.jsonl`, `usage.jsonl`, `verdicts.jsonl`, `files.jsonl`, the voice sessions `v-*.jsonl`. These are indexes and feeds; the page's own file is the truth for that page.
- Not used: an `ai/` subdirectory per module. A module's AI data goes in the module's `page.jsonl`; only tasks get a dated directory.

**Promotion, virtual → real:** `promote(parent, id)` — one function on the page log, one Servex tool, one "Promote" item on the line's ··· menu:
1. make `<parent>/<id>/` (or `<parent>/<slug>/` when the line has a title), whose `page.jsonl` line 1 is the original line (its class, title, `created`, `by`);
2. move the thread — every line whose `parent` chain reaches `id` — into that file, in order;
3. leave one line in the parent: `{moved:{id, to:"<slug>/"}}`, so `parent/<id>/` still routes (route() follows `moved` before it looks for a line) and nothing the owner clicked ever 404s;
4. now it can grow: `readme.md`, `page.js`, `doc/`, its own children — the same three files every module has.

**Splitting off as a task** is promotion with a different parent: the directory is made under `ai/<date>/<slug>/` with `task.jsonl` line 1 an assign line that names the origin (`from:"<parent>/<id>"`), and the `moved` line points there. The Dispatcher's `new-task` already makes that directory; it gains the `from` field.

When to promote: the thread is deeper than the parent's view shows well (three levels), the message became a task or research, or the owner names it. Never automatically on length alone.

**Why this and not one directory per message:** a directory per message is the bloat the owner named — and every one needs a name. Lines are free, ids are free, and the promotion path means nothing is decided early. The alternative — every message a real page from the start — is what `ai/2026/09/30/` would look like with ten thousand folders.

## 8. Embedded or promoted: the same widget, two ways to save (adds to §7; core/Page, foundational, no rush)

What `core/Page/Log.js` has today: every line after the first is one `set()` call; a key that names a method calls it (`file`, `tab`, `place`…); a value with its own `set()` merges (`settings`); a child page is linked by `{"file":"kid/page.jsonl"}`. Three additions make the owner's shape work, all in that file's own idiom:

**1. An embedded item is one line, and replies nest by `parent`, without limit.**
`{"item":{"id":"m-3f9k","parent":"m-1","by":"…","at":"…","text":"…"}}` — `set()` routes the `item` key to `item(obj)`, which keeps `this.items` (a Map by id) and `this.replies` (a Map parent → ids, in file order). The file stays flat; the tree is built on read, so a whole conversation lives in one `page.jsonl`. Ids are minted (`m-` + 4 chars), never named. A child page's id is its directory name, so the two kinds share one id space.

**2. A delta targets a deep item by path.**
`{"at":"m-1/m-3f9k","set":{"text":"…"}}` — the owner's shape. `set()` sees `at`, resolves the path segment by segment (an item id → the item; a child dir → that child's log, and the rest of the path continues inside it), then applies the line's other keys to the target: `Object.assign` for an item, the child log's own `set()` for a page. Same append-only file, no rewrite: the latest line wins, as everywhere else.

**3. Promotion moves the lines and leaves a `file` line behind.**
`promote(id)` (a Server RPC and a Servex tool — the browser can't move files): make `<id>/page.jsonl` with line 1 `{"class":…, "id", "title", "created", "by", "from":"<parent>/<id>"}`; copy the item and every descendant as `item` lines, in order; append to the parent `{"file":"<id>/page.jsonl","moved":"<id>"}` — `file()` links the child as today, `moved` tells `route()` that the old id now lives there. The old lines stay in the parent's file (append-only) and are ignored once `moved` names their id; compaction (§4) drops them later.

**One widget, two homes.** The content widget (a message, a card, a note) draws a *record*: `{id, title, text, by, at, replies}`. An embedded item and a promoted page both answer that interface — `Item` from the map, `PageLog` from its file — so `chip()`, `row()`, `panel()` and the **Reply** button are written once. Reply appends `{"item":{"parent":<id>,…}}` to the record's home file, whichever it is. Routing: `parent/<id>/` opens the child page if the dir exists, else the item's `panel()` in the parent; `moved` is followed first, so no URL the owner ever clicked breaks.

**The promotion rule (my pick):** promote when an item gets its **first reply**, or its text passes ~1,500 characters, or someone gives it a title. First reply is the trigger because a thread is what outgrows a line; length alone only promotes a long note. Never by age. **The hint** (optional, cheap): the record's chip carries a tiny mark — `▫` in the parent's file, `▪` its own page — shown on hover.

**Order of work, when the owner marks it:** (a) `item` lines + tree on read + the record interface in Log.js and the widget; (b) `at` targeting; (c) `promote()` + `moved` routing; (d) the trigger and the hint. Each is one small merge with the §5 loop; (a) alone gives nested replies on every card.

## 9. Chat and card are one content model; where a voice session attaches (adds to §7–8)

The model, in the owner's words (inbox-ext requirements, item 9): a card is a page with its own `page.jsonl`; chat mode (the sidebar, the mobile rail) and page mode (the card) are two renderings of the same lines with the same widgets; dictation on the right is refined into the selected card on the left. §8 is what makes that literal: a bubble and a card row are `row()` of the same record; the refinement is `item` lines appended to the selected card's file.

**The open question: should a session attach to the selected card, so the card's `page.jsonl` is the session log?**

**Recommend: the session stays global; its *focus* is the selected card.** One session follows the owner across pages (as today — `v-*.jsonl` with `home`, and every `chat` line already carries `path`). Two small additions: every chat line also carries `card` (the id selected when it was said), and the refinement writes into that card's `page.jsonl` as `item` lines. So:
- the card's file holds the **refined** conversation — what the owner meant, in order, and it renders in both modes;
- the session's file holds the **raw** ramble — every word, with `path` and `card` on each line, so any bubble can be traced to the card it fed, and any stretch of it can be promoted (§8) into a card when it turns out to matter.
Two files, split by kind (raw vs refined), not by place; that is the one split that does not make every writer choose twice (§4), because the sidebar always writes raw and the refiner always writes refined.

**The alternative: a session per card — the card's `page.jsonl` is the whole session log, raw lines included.** Simpler on paper: one file, no `card` field. Costs: selecting a card starts or resumes a different agent pair (context re-read each time — the reuse the owner asked for is lost); the card fills with ramble that the page view then has to hide; a thought that spans two cards lands in one; and "one session follows me" — the thing the owner has today — is gone. Where it fits: a long, deliberate work session on one big card, which is exactly what promoting a card to a task gives (the task's own `task.jsonl` and its own mastermind).

**What the sidebar shows:** the selected card's name on the mic row (it is where the words are going); switching cards switches the target, not the session. No card selected → the page (`path`) is the target, as today, and the refiner writes into that page's `page.jsonl`.

Touches: the chat line shape (one field), the refiner (writes `item` lines into the target), the mic row (the target's chip). The session code is unchanged.
