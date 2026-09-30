# Checkpoint for page-system-2 (from task-mastermind-page-system, session f47c07fe-21a3-46c1-b219-082e5cd86661, 17:00 09-29)

Read this, then `task.jsonl` (the full log), `review-fresh.md` (the latest review) and `fix-brief.md` (the round in flight). The owner's words are `owner-words.md` here, plus the files named below.

## Where the work is

- Worktree `C:\Code\lew42\worktrees\page-system-929`, branch `worktree/page-system-929`, server http://localhost:51061/. michael/dev is merged in up to eff18e61 (module-experts 801114d4, item-ui eff18e61).
- **Nothing is merged into michael/dev yet.** The branch is 63 files, all inside the fence. Out-of-fence page.jsonl lines were removed through the index (`git restore --source=michael/dev --staged <f>`, then commit), because the worktree's own server re-appends to them instantly.
- Commit by exact path only. Never commit `public/framework/ai/**`, `board.jsonl` or `.claude/skills/clarity/flags.jsonl` from the worktree.

## Built and committed (all on the branch)

| Page / piece | What it is | Commits |
|---|---|---|
| core/Page/layout/ | THE layout system: three columns (around the page · the page's own room · inside the page), every kind of layout, decide/research/names docs, `doc/prior-work.md` (the 92-row judged inventory); v1 and v2 hubs kept | 0cc78daa, 16b722cb |
| core/Page/navigation/ | persistent vs switching first, four levels at most, ext/Doc top tabs as the go-to, six alternatives with demos | 2f2cf44f, 6f300379, 2b5b853e |
| core/Page/ai/ | the bridge Servex ↔ pages: dictation, fast assistant, manager, sessions and the SDK (copied vs fresh session marked OPEN), the "chat room" (Servex/cards/Cards.js forward()), live agents widget on ux/Content/Object DefaultView `view()` | fa59ca42, e2f651ec, 200177ab |
| core/Page/dynamic/ | a url with no page file that still opens; data-only example folder + one template | ad53150e, ce50b7d7, 02ab8aa3, 86f46bce |
| core/Page/jsonl/ | the page.jsonl SYSTEM: format, who writes (7 writers), timing, caveats (duplicate-line race, commit sweep), size (`Server/page-size.mjs`, purge = proposal only) | 1fda1d0e, a37fc475 |
| core/Page/weight/ | weight = 1 + distinct referenced_by + manual (additive); `weight.js`, `Server/page-refs.mjs` (dedupes); main nav ≥1, quick links, >10 upgraded, A/B demo for showing weight | 51a8ea8f |
| create_page (Servex/pages.js) | requires a description, writes a readme stub, returns the parent's context; skills page/new-page/documentation updated (README = text version, page designed from it) | 8f173f37, e5d6a761 |
| core/Page overview + readme | live `page_object(page)` block; readme "The sub-systems" list; Navigation/AI/Dynamic/Weight top tabs | 9becbeda |

Shots of each page: `shots/`. Every agent's full session id is on card `2026/09/29/the-page-system-layout-navigation-new-pa`.

## Running now

- **minion-page-fixes** (session 39971fde-d7bd-4e5c-944a-17e060e93e61, Sonnet, brief `fix-brief.md`): review findings 1, 2, 3 and 5, notes 6–10, plus the vertical-split variant as a docs-only line. Its parent is task-mastermind-page-system, so its done message comes here. **Judge its shots, then run `list_agents` / `git log` in the worktree to see what it committed.**

## To land this task (page-system-2 does this first)

1. Judge minion-page-fixes' result against `review-fresh.md` (open ai/jsonl/weight/page shots at 1920). The decisions are in `fix-brief.md`: jsonl becomes a top tab "Storage (page.jsonl)", and page.js folders keep weight lines in `weight.jsonl`, never a new page.jsonl.
2. Check that `git diff michael/dev HEAD --name-only` lists only files in the fence.
3. `node Server/merge.mjs C:\Code\lew42\worktrees\page-system-929`. It runs the smoke test (it follows links) and the serialized merge.
4. Message mastermind-servex-5 (or -4) "ready for restart": Servex/pages.js changed. **NEVER run `sustain.mjs` from inside Servex.**
5. Land with `documentation`, then `finish-task`. The outcome is the checklist in `review-fresh.md` section 1, updated, with proof beside each item. Log `{"review":{"found":10,"real":10,"fixed":N}}`.

## Open asks, not yet built (page-system-2's own work after landing)

From the owner's later messages (verbatim in `.claude/prompts`, in the prompt containing "JSON L page mode"):
1. **Tabs from page.jsonl:** a `{"tab": …}` line, or a child's presence, so tabs manage themselves without `this.tabs()`. Each tab keeps its own state (active, disabled, in nav or not).
2. **File-system changes as log lines:** the watcher (PageFiles) ALREADY appends `{"file": name}` / `{"file": name, "gone": true}` to page.jsonl pages (see `core/Page/jsonl/doc/writers.md` and `caveats.md`). Check whether directory.json is still rewritten, add a `{"dir": …}` kind if folders aren't covered, and have pages tail page.jsonl live.
3. **A page SETTINGS system** (none exists): per-page settings in the right drawer's Settings tab, e.g. "appears in navigation" (ties to weight: below 1 is out of nav).
4. **page.js vs page.jsonl:** what can move to page.jsonl so a page doesn't load both? Keep page.js.
5. **The LOADING ALGORITHM, documented first on core/Page:** page.js → page.jsonl → a parent's route()/child() → .md → 404. Start from `core/Page/dynamic/doc/idea.md` and `new-page`'s probe-order trap. Put it at the top of the core/Page readme.
6. **Weight, next steps:** the owner picks A (a scale, with the number on hover) or B (the number) on `/framework/core/Page/weight/`. Wiring weight into the real core/Page navigation, instead of only the demo, is not done.
7. **Vertical split (mobile):** named and unbuilt in the layout hub (if minion-page-fixes added it; check). Content above, chat below, each scrolls on its own, a drag grip, and a tap to collapse. Don't build it until asked.
8. **Colour:** "we're exploring … colors" is not covered anywhere yet.
9. **file_link(path, line?)** from /app.js (task-mastermind-file-system): once it's on michael/dev, switch the new pages' raw file links to it.

## Reference

- Inventory: `inventory/A-imagine-layouts.md`, `B-framework.md`, `C-task-logs.md`, merged into core/Page/layout/doc/prior-work.md.
- Briefs: `navigation-brief.md`, `newpage-brief.md`, `ai-brief.md`, `dynamic-brief.md`, `jsonl-brief.md`, `layout-brief.md`, `weight-brief.md`, `review-brief.md`, `fix-brief.md`.
- Lessons: a minion commit swept in the worktree server's page.jsonl lines (8f173f37, reverted). The minion skill forbids committing in a shared worktree, so a builder may leave work uncommitted (weight did). Servex queues spawns when RAM is under 3 GB. review.mjs's reviewer can fail to spawn and still write a "fix" verdict, so spawn the reviewer directly.

## Update 17:05

- **minion-page-fixes is DONE:** `baa25118` in the worktree (21 files, committed by exact path). It reports all nine findings fixed and verified headless. page-system-2: judge its shots (`shots/ai-1920.png`, `jsonl-1920.png`, `weight-1920.png`, `page-1920.png`), check the vertical-split line in layout/, then go straight to landing step 2 (the diff check) and 3 (`merge.mjs`).
