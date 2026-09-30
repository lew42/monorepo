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
