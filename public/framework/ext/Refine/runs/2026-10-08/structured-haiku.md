# 🗂️ Session class, Sessions page and AI system

## 🧮 Session class
- ⬜ **Build:** a `Session` class that gives the exact cost of each session, cached. Build on the token-accounting findings and plan, and don't redo that investigation [S1, S2, S3, S4, S5]
- ⬜ **Budget:** $6, Sonnet 5.5, medium effort [S6]
- ⬜ **Scope:** account for every message and tool call in every session. Claude and OpenRouter stay apart, shown as "Claude $total" and "$total" [S8, S9]
- ⬜ **SDK check:** first check whether the Claude Agent SDK already accounts in real time (result messages, per-message usage). If it does, lean on it; otherwise use our own script [S10, S11]
- ⬜ **Runs everywhere:** one class, native ESM, usable on the server and the client, no build [S12]
- ⬜ **Input:** given a session id or file, `Session` loads the whole raw file in code, never in an LLM, and computes costs: tools used, time running, cache read and write, per model. Subagents roll up into the parent [S13]
- ⬜ **Display:** two modes of the same class, a preview row for the grid and a click-through detail view [S14]
- ⬜ **Cache:** never reprocess a huge raw file on load. Process it once into a per-session `session.jsonl`, and let the page load only that small cache [S15, S16, S18]
  - ⬜ **Incremental:** after the first pass, read only new lines and skip message ids already counted [S17]
- ⬜ **Speed:** measure the bytes and requests the Sessions page loads, before and after, and report both, because the site is already slow on mobile [S19]
- ⬜ **Streaming:** reuse the stream from `2026-10-08/live-not-polling` (read its `findings.md`); build no second stream [S22, S23]
- ⬜ **No resumes:** never trigger an SDK resume to read cost; read files only [S38]
- ⬜ **Deliverable:** `findings.md` says whether the SDK accounts in real time (with evidence) and which source is the truth per provider [S24, S25]
- ⬜ **Deliverable:** `Session.js` in the right module folder, for server and client, with a node test. It loads a real session file and checks the total against `Server/session-cost.mjs` and the reconcile result; the gap is reported, target 0 [S26]
- ⬜ **Deliverable:** `Server/session-summary.mjs <session-id|file>` prints the same summary, so agents ask a script rather than read a file [S28]
- ⬜ **Deliverable:** a `sessions/doc/` note on the shape of `session.jsonl`, loading, saving and timing, linked from the readme [S29]

---

## 🏷️ Tags and alerts
- ⬜ **Model:** sessions carry **tags** (a reference to a class, page, system or file) and **alerts** (needs attention, with a priority) [S33, S34]
- ⬜ **Writing:** agents never hand-write JSONL. A log tool stamps time and author, and any minion can call it for any session, outside the session's own prompt, to append tags and alerts to `session.jsonl` [S21, S35]
- ⬜ **Table:** the Sessions table filters and sorts by tag, with a prioritized "needs attention" filter [S36]
- ⬜ **First writer:** the task-audit mastermind (`2026-10-08/task-audit`). Agree the line shapes with its `requirements.md` addendum. This work owns the tool and the table [S37]

---

## 🗃️ Storage and names
- ⬜ **Addendum:** one store, real names, a compact grid [S39]
- ⬜ **Links:** answer in `findings.md` first, then fix. Session cards link to two places: the date tree `framework/ai/2026/10/07/session-<short-uuid>/` (opens the Inbox view, little info) and `framework/ai/sessions/mastermind-servex-10` (opens as a right column, which is nice) [S40, S41]
  - ⬜ **Three stores today:** UUID folders (the cache), named folders under `ai/sessions/`, and date-tree `session-<id>` folders where the VS Code tabs live [S42]
- ⬜ **One store:** pick the date tree, the owner's preference, and convert with a non-destructive script: move and rename, no rewrite, old links resolve through a resolver [S43]
  - ⬜ **Alternative:** name the alternative store in `findings.md` [S44]
  - ⬜ **Location:** the later addendum puts raw data under `ai/sessions/YYYY/MM/DD/`. Today many sessions sit directly in `framework/ai/` (46 hyphen-dated dirs plus `ai/2026/MM/DD/`), and children go inside the parent's directory [S70, S71]
- ⬜ **Per-session folder:** `ai/sessions/<slug>/` holds `session.jsonl` (usage, costs) beside `page.jsonl` (page data) [S20]
- ⬜ **Inventory first:** find and document every pattern where sessions live, as a table in `sessions/doc/` (pattern, example path, count, how it is read) [S72]
- ⬜ **Merge by script:** dry-run, `git mv`, a manifest of old to new paths, old paths still resolve. No AI rewriting. Every one renders the same detail view [S73]
- ⬜ **Names:** many cards are named "monorepo", the repo name. Derive a useful name instead: the task or card title, the first real prompt, or the agent id [S49, S50]
  - ⬜ **Going forward:** every session and task gets a proper name [S51]
- ⬜ **Nesting:** child sessions nest by path (`parent/child`, `parent/child/grandchild`) as real subdirectories, not a `--` suffix [S52]

---

## 🔢 Session index and state
- ⬜ **Counts:** work out how "4,000 sessions" is computed. Counts and filters come from the session index, never from a client that loads every session [S45, S46]
- ⬜ **Running flash:** find why cards flash "running" when they are not, and make state true, derived from the registry and ledger by code [S47, S48]

---

## 📋 Sessions grid
- ⬜ **Status bars:** replace the big 5-hour and weekly tiles with the progress bars and pace marker the Dashboard already has. Reuse that component, one of everything [S54, S55]
- ⬜ **Compact:** cut the wasted space above the grid, and make the list as compact as possible [S56, S57]
- ⬜ **Filter:** add a quick "in flight / now / active" filter beside the existing checkboxes [S58]
- ⬜ **Sort:** add sort toggles (recency, cost, model) to flip between chronological and cost views [S59]
- ⬜ **State column:** move the state icon to the first column, as important as the name [S60]
- ⬜ **Nesting:** child rows show under their parent, collapsed by default, with the rolled-up cost [S53]
- ⬜ **Check:** the preview row and detail view, both backed by `Session`, pass at four widths, then merge [S27]
- ⬜ **Sub-pages:** host sub-pages inside the Sessions tab, since the grid fills it [S63]
  - ⬜ **Readme and decisions:** a readme and a decisions doc for the Sessions system, the owner's asks and decisions priority-ordered with the top first, linked from the tab [S64]
- ⬜ **Scope:** don't over-build yet [S61]

---

## ↔️ Master-detail
- ⬜ **One mode:** one open mode and one location, a master-detail layout. The IN FLIGHT strip stays top priority [S66, S67]
- ⬜ **Right column:** every card opens in the right-hand column, as `mastermind-servex-10` does. Stop the `ai/2026/10/07/session-<id>` links that jump to the Inbox view [S68]
- ⬜ **One route:** one route per session whatever its storage, and the same detail view however you arrive [S62, S69]
- ⬜ **Wide screens:** a default 50/50 split, resizable. The detail fills its side with no fixed width (it stops short after resizing today) [S75]
- ⬜ **Narrow screens:** the 7-column table becomes compact inbox-style cards with wrapped fields, not tall. Clicking another session swaps the detail [S76]
- ⬜ **Reuse:** the grid is the responsive navigator for the detail pane, like the Inbox list. Reuse the existing master-detail/columns mechanism [S74, S77]

---

## 🏛️ AI system docs
- ⬜ **Brief:** show the structure of the AI system as classes [S81, S82]
- ⬜ **Role:** a system mastermind, a fresh Sonnet 5.5 pointed at a directory, not a resumed session. Read `CLAUDE.md`, then the readme chain down to `ai/` and `Servex/` [S84, S85]
- ⬜ **Budget:** $5 total. Run `node Server/usage-now.mjs` before each spawn. Minions are Haiku 5.5, Sonnet only for UI and OO code [S86]
- ⬜ **Docs first:** additive edits and proposals only. No API changes, no moves, nothing destructive [S87]
- ⬜ **Class cards:** where a thing is a class, show a card (icon, name, core API, the most important properties and methods picked by judgement, no weighting) and live instances where they exist, such as Servex's `Pool`, `Usage`, `Agents`, `Dispatcher` and `Heartbeat` [S93, S94]
- ⬜ **Reuse:** find the existing class-doc mechanism (`ext/Doc`, the class-rendering template). Extend it; don't build a second [S95]
- ⬜ **At a glance:** make these clear: Servex, the Agent SDK, OpenRouter and local models, sessions, models (`/framework/ai/models`), the dashboard, the inbox and tasks [S96]
- ⬜ **SDK section:** how Servex spawns agents through `query()`, how tools reach it via in-process MCP, how session files are written, and `sdk-ts` vs `claude-vscode` entrypoints [S97]
- ⬜ **Servex card:** a class card focused on the AI system (tools/MCP, agents, sessions, spawning, pool, usage, dispatcher), not its self-monitoring, restart or server-list side [S128]
- ⬜ **Stale pages:** some linked pages look stale (e.g. `AI/minions`). The mastermind-vs-minion line is not a hard boundary [S91, S92]
- ⬜ **Findings:** `findings.md` lists what changed, what is stale or missing, which AI pieces are not yet classes and should be (a short list, no refactor now), and any Note for the owner [S103]
- ⬜ **Readmes:** `readme.md` and `architecture.md` for `ai/` and `Servex/`, each linking the others. Reuse the agents' reports (`docs-vs-code-audit`, `task-audit`, `token-accounting`) rather than redoing them [S102, S104]
- ⬜ **History:** `ai/doc/meta/history.md`, main events only, one line each: problem, solution, deep link to the session or task. Copy no content [S130]

---

## 🖥️ AI system page
- ⬜ **Rebuild:** `/framework/ai/system/` becomes mostly cards of classes and live instances, with minimal words. Check four widths, then go through the merge gate [S100, S101]
- ⬜ **Problem:** the page explains what the reader already knows, and lists assistants, masterminds, minions, agents and roles without showing anything tangible [S83, S89, S90]
- ⬜ **Top:** the most important information sits above the fold, with no wasted space [S149]
- ⬜ **Width:** grids fill the width [S150]
- ⬜ **Headings:** no paragraph between a section heading and its cards [S151]
- ⬜ **Sections:** group each section with a visible border or panel, so its heading wraps the whole section [S152]
- ⬜ **Servex title:** if the Servex cards are classes within Servex, say so in one line. Otherwise regroup [S153]
- ⬜ **Links:** link the `ai/` subdirectory system, and link the readmes system (`/framework/ai/readmes/`), which the owner could not find. Weight the readmes system high on the page [S154, S155, S156, S157]
- ⬜ **Concept cards:** show the important data openly, with nothing hidden in an expandable area [S158]
- ⬜ **Architecture view:** the `framework/ai` System tab becomes a class architecture view: which classes exist and how they fit [S127]

---

## 📥 Inbox
- ⬜ **Document:** where cards are saved, how they are created (MCP tool or manual), and how the dashboard, Sessions tab and log read them [S131]
- ⬜ **Session context:** wrap inbox cards in a session context card (session icon and name), so the owner sees which top-level sessions run, can drill in, and sees cost [S132]

---

## 📚 Readmes and docs
- ⬜ **Index:** root `readme.md` and `ai/readme.md` become a solid index of every system, accounting first. One line each plus a link, no explanations [S120, S121, S122]
  - ⬜ **Iceberg:** each system's detail lives in its own readme, which indexes its children the same way, recursively [S123]
  - ⬜ **Size:** keep each readme under about 100 lines, and verify its claims against code with a cheap check [S124]
- ⬜ **Named things:** each thing that deserves a name gets a page saying what it is and means. Its readme links to the page, and the page loads the readme by default [S125, S126]
- ⬜ **Coverage:** `ai/readme.md` references everything that influences the AI systems [S129]
- ⬜ **Memory:** every module readme is its memory: a short index, its essence and principles, links to `doc/`, and an `architecture.md` of decisions that links the original prompts [S98]
- ⬜ **Refresh:** create or refresh readmes for `ai/`, `ai/sessions/` (coordinate with `minion-session-class`, don't fight) and the Servex docs [S99]
- ⬜ **Status check:** check the whole documentation system: the `documentation` skill, `ai/readmes/`, Servex's `readme_chain` code (how it works and what it injects into an agent), and `CLAUDE.md`'s readme rules. Report what is true versus what pages claim, and make the skill reference the readmes system [S159, S160]

---

## 🗂️ Module ai/ folders
- ⬜ **What they hold:** each `<module>/ai/` folder (e.g. `ext/Session/ai`, `ux/Dictate/ai`, `ui/avatar/ai`) holds a log of events about that module, per-page voice-session transcripts (`v-<id>` plus `.summary.json`), and dated sub-folders [S144, S145]
- ⬜ **Document:** nobody remembers what these automate or where they are documented. Document them in `framework/ai`: what writes them, when, why, how to read them, and whether to commit them. Link the doc from the AI System page [S146, S147]
- ⬜ **Check:** report whether anything documents them. A quick grep found none in `Servex/doc`, the AI docs, or the Dictate or Session readmes [S148]

---

## 🤖 System architecture mastermind
- ⬜ **Mandate:** the system architecture mastermind watches every system and keeps them tuned, not only the AI system page [S106, S107, S108]
- ⬜ **Cost:** fan out Sonnet 5.5 and Haiku 5.5 minions in small inlined batches, so token cost stays low [S109]
- ⬜ **Map:** `systems-map.md`, one short table linked from `ai/readme.md`, of where each system lives, who owns its docs and how fresh they are. Systems: AI system (Servex, SDK, sessions, models, dashboard, inbox, log, now card), page system (`core/Page`, JSONL streaming and tail, routing), transcription (Whisper, Dictate, Chat, Refine), skill system, `CLAUDE.md` and system prompts, Servex agent system [S110]
- ⬜ **Skills and prompts:** study their size in tokens per agent preamble, duplicates, contradictions, stale rules, and skills that cost context for little value [S111]
- ⬜ **Changes:** report findings and propose changes. Make only obviously correct, additive fixes [S112]
- ⬜ **Big changes:** a major architecture change, or anything that could break things, needs a clear reason and the architect's approval after reading the diff. Fix what is clearly broken [S113]
- ⬜ **Coordination:** message the running masterminds and tasks (`mastermind-task-audit`, `minion-session-class`, `minion-live-not-polling`, `minion-cache-ttl-and-plan`) to share findings, avoid overlap and unblock. If one is blocked, find a way around [S114, S115]
- ⬜ **Order:** readmes first (short and current across these systems), then the pages that show structure, then accounting pages as pace allows [S116, S117]
- ⬜ **Queued, not started:** an overview of the AI dashboard pages: the Now card (stale? messages have no timestamps), the Log page (a real-time stream of every event), and the Inbox and Dashboard pages [S118]
- ⬜ **Start rule:** write what is known and the proposed order into `findings.md`. Start only when `node Server/usage-now.mjs` shows comfortably under pace and in-flight tasks have landed [S119]
- ⬜ **Plan:** `plan.md` in the task dir, one screen, linked from its card. Audits are not the end [S133, S134]
- ⬜ **Loose ends:** group them by core system (streaming/JSONL, core page system, sessions, transcription/refinement, AI system/Servex). Where one system has many, say how to tune that whole system [S135]
- ⬜ **Priority:** order by value over cost, quick and easy first [S136]
- ⬜ **Haiku limit:** Haiku minions never do major coding, and the architect is never tied up by code [S137]
- ⬜ **Code coder:** for bite-sized, clearly scoped code tasks that touch no running agent's files, spawn a Sonnet 5.5 coder (`spawn_agent`, role minion, parent = the architect) in a worktree. Merge only after reading the diff [S138]
  - ⬜ **Searches:** that coder may spawn Haiku minions for cheap, simple, verifiable searches [S139]
  - ⬜ **Ownership:** before spawning code work, check who owns those files now, and message the owner agent instead of overlapping [S140, S141]
- ⬜ **Pace gate:** run `node Server/usage-now.mjs` first. Over pace means queue, not spawn [S142]
- ⬜ **Ledger:** keep `spawns.jsonl`: each spawn's model, scope, expected cost and outcome [S143]

---

## 📏 Working rules
- Batch reads, let scripts read raw data, and keep chat to one sentence [S7, S88]
- ⬜ **Merge gate:** site files go through a worktree and the merge gate, and land with `finish-task` [S30, S31]
- ⬜ **Commits:** commit after every working step, with attribution, and leave no loose files [S79, S105]
  - ⬜ **Full cycle:** run worktree, diff review and merge often [S80]
- ⬜ **Owner items:** anything that needs the owner goes on a `Note:` card on the AI board, plus one line in `findings.md` [S32]
- ⬜ **Template label:** every page shows a small label of the template or layout it uses and where it lives. Keep a short list of templates in the docs [S78]
- ⬜ **Links:** everything created is linked from the site, per CLAUDE.md "Everything is linked" [S65]
