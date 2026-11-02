# Framework tasks: what is asked for and not done yet

One list of framework-wide work, so an ask isn't lost in a chat. Newest date first; each line says what, and links where the detail lives. When a task is picked up, open it the normal way (`node Server/TaskDirs.mjs --new <slug>`, the `new-task` skill) and link it here; when it lands, strike it through with the date. Work that belongs to one module goes in that module's readme instead.

**This is a plain list, not yet a task system** (the owner, 2026-11-01). What exists today: `class Task extends Item` in [core/Task](../core/Task/) (one task's state machine), the task viewers in [ai/AITask](../ai/AITask/), and AI tasks filed inside session records (`ai/sessions/YYYY/MM/DD/session-*/<task>/`), made almost only by agents. Where it stands (measured 2026-11-02, [findings](/framework/ai/sessions/2026/10/20/session-e00f55c9/task-system-audit/findings.md)): the task is still the core `Task`, not tied to AI; `AITask` is only a page that draws it. Of 1,293 tasks filed by tabs, 923 sit in module `tasks/` folders and 683 never started. What he wants:
- **A task system that isn't tied to AI** (a core Task again, not an AI task), but that AI can still drive fully.
- **Any module can have its own `tasks/` folder** (`framework/tasks/` is the first). Asks from a dictation become tasks there, get worked on, and get checked off.
- **One object-oriented Task class and its UX:** how a task is created, updated, where it lives, how it renders, what it looks like. Poked at many times, never finished.

Until then: one line per task below, and when one gets a real task folder, link it.

## 2026-11-02 (the owner's dictation in the VS Code tab, session `e00f55c9`; parked to save tokens)

- **Class views: see any class's structure, live.**
  - **The pattern today:** `Thing.View` is a static class property holding the instance's template (usually `ThingView.js`, imported and attached as `Thing.View`). So `thing.render()` makes `new this.constructor.View`, and a subclass can extend the thing or its View or both.
  - **The idea.** The class gets a view of its own: a static `Thing.render()` makes a `Thing.ClassView`. There's nothing new on the instance.
  - **One shared template.** It prints the class name, its chain (`extends`), its properties and its methods, and each method links to its doc.
  - **Method docs already exist** in `doc/method/` folders: `core/App`, `Item`, `List`, `Page`, `Router`, `Session`, `Shell`, `Sidebar`, `View` and `ui`. A per-method page could pull from them.
  - **A rougher first version:** a debug view that loops over any object's properties.
  - **What it's for:** the dictation flow's state (dictating, the floor, Recite playing, a reply queued) shown as live objects you can click through to their classes. The owner: "seeing as much of that structure is important."
- **Task cost when a task moves between sessions.**
  - **The problem:** when a task is moved to a module, or picked up by a second session, its cost must not all roll up to the session that first filed it.
  - **Idea:** each task log line carries the session id and its cost, so a task's cost is split by session. A session's total is the sum of its own lines.
  - **Today:** node stamps `by` and `ts` on every item-tool line, and Servex writes the cost.
  - **Another idea:** a server-side instance adds each new line's cost in memory instead of recomputing.
- **Fewer Servex tools: mostly the item tool.** The owner has asked several times for the tool list to shrink. The item tool already reaches any property, list or method of a task or session, so most single-purpose tools could become item deltas. Audit which tools still need to exist.
- **Leaked headless browsers.**
  - **What happened (2026-11-02, 22:41Z):** free RAM was down to 1.1 GB, and a spawn was held. Two Playwright Chrome trees started on 2026-11-01 at 12:10 and 12:12 were still running, holding gigabytes. They were stopped by hand, and free RAM rose to 5.4 GB.
  - **The fix to build:** every headless browser is closed by whoever opened it, in a `finally`. Plus a sweep that stops a Playwright Chrome whose parent is gone, or that's older than a few hours. `Servex/Lifecycle.js` already knows them by their path (`ms-playwright`, `chrome-for-testing`).
- **Chat V1 and V1.2: one template** (the owner, via voice, 16:41; thoughts, not decisions).
  - The two use different data sources and templates. V1's message order looks broken, and V1.2's looks better.
  - Maybe share the same template functions, or let V1.2 replace V1 once its layout bug is fixed.
- **The quick fixer has no worktree.**
  - **What happens (2026-11-02, three times this afternoon):** `quick_fix` and the voice seat both get "no quick-fix worktree is ready", while `Server/worktree-servers.mjs --list` shows pool slots qf-6, qf-7 and qf-8 "kept", and qf-1 and qf-2 taken by masterminds.
  - **To find:** why a kept slot isn't "ready" (stale branch? not current?), and whether masterminds should take pool slots at all.
  - **The fix to build:** one slot always reserved for the fixer. See `Servex/Pool.js`, the `hold()` notes at line 172.
- ~~**Agents still say the tab "isn't a live agent".**~~ Fixed 2026-11-02: all four agents checked (v1-2-scroll-fix, process-runner-stall, recite-cue-icon, in-flight-real-data) called `send_to_agent` with `to` (one also `agent`), the name Claude Code's own SendMessage uses, so the call failed. It now takes `to`, `agent` and `message` too (`Servex/agents/tools.js`, test `send-alias.test.mjs`).
- **A session page takes about 15 s to read its tasks** (2026-11-02, found by in-flight-real-data). Until then the In-flight block now says "Reading N tasks…". Each referenced task file loads on its own, so a session with hundreds of tasks is slow. To find: one index read instead of N file reads (see `core/Page/doc/index-jsonl.md`).
- **A revived agent can end its turn empty.**
  - **What happened (2026-11-02, 23:22Z):** `sustain.mjs --restart` revived mastermind-core-plugin-build, which was mid-merge. Its revive turn ended in 114 ms with 0 API turns and no cost ("its prompt was probably blocked (a hook timeout)"). It sat idle until vscode-mastermind resent the message by hand.
  - **To find:** why a revive right after boot gets an empty turn (a hook that times out while Servex starts? a race in `Agents.revive`?). Then retry an empty revive once by itself.
- **`worktree-up.mjs` doesn't install `Servex/node_modules`,** so a Servex test in a fresh worktree fails with "Cannot find package '@anthropic-ai/claude-agent-sdk'"; run `npm ci` in `Servex/` by hand until it does.
- **A worktree's dev server sometimes never boots** (in-flight-real-data, 17:10). The agent routed its changed files into the live site to take its shot instead. `Server/worktree-restart.mjs` exists; find why the first boot fails.
- **A live test runner for each worktree, feeding the builder.**
  - **What it does.** When a mastermind makes a worktree, a runner watches it. It reruns a module's tests when a file in that module changes.
  - **How it picks tests:** the module folder, or a hand-written watch list per test file. Static dependency analysis can come later.
  - **When it runs:** a few seconds after the last write, never in the middle of one. It ignores `.jsonl` data writes, so a log written 100 times a second doesn't rerun the suite.
  - **Where results go:** test results and console errors stream straight into the building agent's session (an SDK feature), so it sees an error the moment it writes it.
  - **Today:** tests run by hand, plus the merge gate (`core/Test/run-all.mjs [--browser]`). Test-first is now in the build process (`core/Task/processes/BuildProcess.js`).
- **ProcessRunner: a finished step set back to waiting.**
  - **What happened (2026-11-02):** on the `core/Plugin` build process, the improve-plan step completed. Then ProcessRunner counted the reviewer's turn-ends without checking the step's state: it pulsed it and set it `waiting`. vscode-mastermind completed it again by hand.
  - **The fix:** a step that is already complete is never pulsed or set waiting. Log: `ai/sessions/2026/10/20/session-e00f55c9/core-plugin-one-plugin-system-for-every/task.jsonl`.

## 2026-11-01 (the owner's dictation, cloud session `e3fd9043`, branch `claude/oop-streaming-research`)

- ~~**Merge `claude/oop-streaming-research` into `michael/dev`**~~ done 2026-11-01 (with `integration/data-shapes-2`); the PC still pulls and restarts. Steps and the one conflict: [build.md](../research/2026/10/29/persistence-sync/build.md#how-to-merge-owner-into-michaeldev-not-main-yet).
- **`index.jsonl` per folder**, so pages can be listed, linked, searched and mentioned without loading them: the plan and its open questions, [core/Page/doc/index-jsonl.md](../core/Page/doc/index-jsonl.md).
- **The Research page lists its projects by itself**, newest first, like a log. Today it is a list kept by hand in [research/page.js](../research/page.js). A `Dated` collection (`core/Item/Dated.js`) would do it, but its index lives in `ai/sessions/`, which isn't deployed; it needs an index the static site gets. Could become the default page for any dated folder.
- **Pages of files are cramped on mobile.** `page.jsonl` pages that show a file explorer are too wide on a phone. Rethink the explorer; meanwhile a project page shows links (the research project page does).
- **Review pages that were broken before this branch** (listed in [build.md](../research/2026/10/29/persistence-sync/build.md), "Broken before this branch"): `core/new/1/` imports four files that exist nowhere (maybe retire it); `ux/Content` catalog entry 65 imports `compose.js`, now `Compose.js`; the `audio/` mic pages need https.
- **One page checker, not five.** These all load pages headless and read the console: `Server/smoke.mjs` (the merge gate in `merge.mjs`; fails a page with more than 5 console warnings, `CONSOLE_BUDGET`, unless `Server/console-allow.jsonl` excuses them, which blocked a quick-fix merge on 2026-11-01), `NavCheck.mjs` (merge gate: a new page must be linked), `BrowserCheck.mjs` (the `check_page` tool), `PreviewCheck.mjs` (a deployed preview; added 2026-10-31, overlaps smoke.mjs), `layout-check.mjs`. Two tools that do the same job at different times means fixing one and not knowing why the other still fails. Fold them into one: `smoke.mjs` already takes `--base <url>`, so `PreviewCheck.mjs` may just be smoke.mjs pointed at a preview, and find the past work on a monitor that keeps checking the live site, before building anything new.
- **A minion audit that every folder's readme indexes its contents** (the rule: [core/Page/doc/navigation.md](../core/Page/doc/navigation.md)), run by Haiku with a script doing the listing.
- **Where each agent finds its docs:** a whole-system review of discoverability versus context bloat.
- **The git and deploy plan, decided in principle 2026-11-01:** `compliance` (the PC) → `main` (staging, pushed to directly) → `production` (`lew42.com`, on the owner's word). Six steps in order, none done yet: [doc/git.md](../doc/git.md#steps-in-order-none-done-yet). Best done from a VS Code tab on the PC, not a cloud session.
- ~~**`TaskDirs` labels a cloud session as `vscode-tab`**~~ fixed 2026-11-01: `SessionRecord.link_parent` writes `cloud` when `CLAUDE_CODE_REMOTE=true` (test `Server/SessionRecord.kind.test.mjs`), and session `e3fd9043`'s line 1 was corrected. Not yet checked: how the sessions page shows the `cloud` kind.
- **`merge.mjs` names the task in the merge commit** (`Merge qf-5: bold the session title`, not `Merge branch 'worktree/qf-5'`), so history says what each slot branch did: [doc/git.md](../doc/git.md#names).
- **Writing files on the hosted site** (append JSONL, upload images without git): not now; the questions are in [hosting-tunnels-and-cloud-files.md](../research/2026/10/29/persistence-sync/ideas/hosting-tunnels-and-cloud-files.md#writing-files-on-the-hosted-site-the-owner-2026-11-01).
- **Item system next steps** (check on the PC, Phase 0 fixes, marked lines on, the rest of Phase 1): [core/doc/status.md](../core/doc/status.md#next-steps-in-order).
- **Where Session and Task live:** they're still `core/Session` and `core/Task`, with AI parts in `ai/AISession` and `ai/AITask`. Move them under `ai/`, or keep a core Task that isn't tied to AI with an AI layer on top (see the task-system wish above)? Open.
- **The Item MVP's open items** (the owner's 10 small calls, what wasn't built, untested corners): [build.md](../research/2026/10/29/persistence-sync/build.md#asked-for-or-planned-not-done-nothing-here-was-started).
