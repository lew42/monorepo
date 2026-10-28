# The plan: from shapes to a built, unmerged try

Written 2026-10-28, ~16:30, after the owner's third add-on (asks 32–45 in the [brief](requirements.md)). It replaces the strategy in [synthesis.md](synthesis.md) §8. Paths are from `public/framework/`.

## What's settled, and what's still a fork

**Settled by the owner** (each links to where it's written):

- Dotted paths; each level's `get` decides how to look up the rest ([ids-and-paths.md](ids-and-paths.md)).
- Ids: short, either readable or random, with the merge risk noted. Any Item or List may override `get`.
- References are absolute (`{path}`, or `{url, path}` across files), with dependents tracked when things move ([ids-and-paths.md](ids-and-paths.md) §6).
- `pages` over `children`. `page.children` is deprecated, with a migration guide. Lingering legacy is marked ([doc/rules.md](/framework/doc/rules.md)).
- `items` and `content` stay separate. `content` is a slot of renderable things.
- Sessions are their own tree (`session.sessions`). There's no special `SessionRef`; use the generic `Ref`.
- Use class names for instances (a Question is a `question`), and `item.move_to(destination)`.
- One data path for every change: a live instance on the server.
- Build in a worktree, with a fresh builder and a fresh reviewer, and don't merge until it's proven.

**Forks still open:** decide each before the step that needs it, not now.

| # | Fork | Options | Lean |
|---|---|---|---|
| F1 | Where the server-side live instance runs (**build A's study and the plan review both lean: each project's dev server**, one per tree, worktrees included; Servex keeps the agents and forwards writes; the study: [f1-live-instance.md](build/backbone/f1-live-instance.md)) | **Servex** (today it's the item tool's live root, `Servex/agents/page_tools.js`), or **each project's dev server** (it already watches and tails the files: `Server/plugins/SocketServer/Tail.js`) | the dev server, per project: the owner doubts one Servex for many projects. Studied (step 1c): each project's dev server, five steps to move it |
| F2 | A task handed to a child session: its subtasks move into the child, or stay in the parent | move (the owner's new lean, ask 35), with contextual refs in the parent (ask 36) / stay, with a link | move; the parent keeps a contextual ref |
| F3 | Prompts and Questions: still Tasks, or messages | synthesis decision 2 | messages |
| F4 | Sentences in their own list, or inside the chat | synthesis [A] | their own list |
| F5 | One default view: `object()`, `view()` and `inspect()` all exist in `ux/Content/Object/` | merge into one, or keep three | one (law 6: one of everything) |

## The steps, in order

### Step 1: the data backbone (build now, worktree A)

Its goal: a change made anywhere, at any depth, reaches the file and every open tab exactly once, and a fresh replay rebuilds the same object.

- **1a. Fix the path without changing the shape:**
  - every hop names its list (`core/Item/Store.js`, `hops`);
  - dotted path keys are read, and each level's `get` takes the rest of the path;
  - `List` keeps an id-to-member `Map` (`core/List/List.js`);
  - `Item.get` stops searching every list (old lines still replay, with a warning);
  - `by`/`ts` are stripped into a clock for every Item;
  - `set(prop, item)` adopts the item, so its changes are saved;
  - one offset per socket in `Server/plugins/SocketServer/Tail.js` (the lost update);
  - replay becomes linear (`lists()` cached; `core/Session/SessionTasks.js` applies new lines instead of replaying everything).
- **1b. Tests, through a real Store and a real file:** the persistence matrix ([streaming seat](seats/streaming/notes.md) §10). Every persisting class, standalone and nested, for add, set, move, remove and replay. Plus seat (g)'s `demo-delta-flow.mjs`, turned into a test.
- **1c. A study, not a build:** F1. What would it take for every change, UI or AI, to go through one live instance per root? What does each server own?
- **Done means:**
  - every test passes;
  - the site's own pages still load clean (smoke test);
  - the voice session replays in under 200 ms;
  - a fresh reviewer signs off.

  Then it waits for the owner's merge.

- **1d. One writer** (from the plan review, finding 5): the hooks and the browser's direct `page.jsonl` append go through the live instance too. Until then, "exactly once" holds per writer, not across all writers.
- **1e. The item tool, generic over every class** (review finding 4): one live root per file of any class, not only Task, Session and Process. The ~10 special cases in `Servex/agents/page_tools.js` (slugged ids, folder moves, `pages` on disk, verdict strings) move into class verbs ([placement.md](placement.md) §1).

### Step 2: see it (build now, in parallel, worktree B)

Its goal: the owner can watch objects being made and changed, without reading a wall of text.

- **One default view for every Item (F5), built from what exists:**
  - `ux/Content/Object/DefaultView.js`, `Inspect.js` and `InstanceTree.js`;
  - the object log, `core/Page/card/log/Logger.js` and `LogView.js`.

  Collapsed, it's a row: icon, id, class name as a small label, and counts. Open, it shows its data by type: a string or number is written out; an object or list is iterated.
- **Objects keep `views`,** an array, so one object can show in two places (ask 33). `List.render()` draws each member's own view.
- **A live demo page under `core/Item/`:** a small tree is built, changed, saved and replayed, and every object shows in the default view, updating as each change lands. Step 1's tests can then draw the same way.
- **Done means:** one view in place of three overlapping ones (or a stated reason to keep two), the demo page at 1920 and at phone width, and a fresh reviewer's sign-off.

### Step 3: the owner decides F2–F4 and the synthesis's decisions

Done interactively, with step 2's views as the picture. Nothing in steps 1–2 depends on these.

### Before step 4 (plan review, findings 8 and 6)

- **References across files must resolve in the browser.** Today only node does it (`core/Task/Task.js:454-461`), and the browser shows a "loading" stub. F2 (moving subtasks into the child session) needs this, plus an id fallback, because the child renames and moves its tasks inside its own file.
- **A View is never stored:** its constructor makes a DOM element, and it isn't an Item. `content` holds **data parts**, each drawn by its class's static `View` (`core/Page/PageContent.js`), and the page tool's part types (`core/Page/parts/kinds.js`) are already the AI's generic add. The owner's `{type, tag, content}` becomes one more generic part, but not one named `View` (that would collide with the View class in `Item.types`).
- **With step 4:** ids made from titles stop (the item tool slugs titles today), and agent-made ids become 8 random characters.

### Step 4: the new session shape, beside the old one

New classes, a one-time migration of old sessions into a snapshot, and prompts no longer counted as tasks. It builds on the step 1 backbone and the step 3 answers.

### Step 5: one chat view, and dictation on the website

The chat is drawn over the stored list. The fast seat folds into the smart agent, placing in batches. The other chat views are marked legacy.

### Step 6: class docs that show

- Each class page has the live default view (step 2), its one core test (ask 44) drawn on screen, and method sub-pages from a dynamic route with notes in `methods/<name>.md`.
- Start with `Item`, `List`, `Page`, `Task`, `Session`.

### Later, scripted, ask first

- **Move `core/Session` and `core/Task` into `ai/`** (ask 40). It's a big move with many callers.
- The `page.children` migration ([seat h](seats/legacy/)).
- Moving sessions' records out of task folders ([placement.md](placement.md) §6).
- The worktree dev server reachable from the phone.

## Running now (spawned 2026-10-28 16:42)

| Work | Agent | Brief | Branch |
|---|---|---|---|
| Build A: the backbone (step 1) | mastermind-build-backbone (Opus, high) | [build/backbone/](build/backbone/requirements.md) | `worktree/backbone`: 9 commits by 17:15, working; the plan review's findings 1, 2, 3, 9 sent to it |
| Build B: the default view (step 2) | mastermind-build-default-view (Opus, high) | [build/default-view/](build/default-view/requirements.md) | `worktree/default-view`: **landed, not merged**, reviewed (7 fixed, 3 noted). Its worktree folder was later closed by Servex, which saved ~159 regenerated `files.jsonl` into the branch as its last commit (`f6d535acc`): leave that commit out when merging. It adds 5 lines to `core/Item/Item.js`, so expect a small conflict with A |
| Plan review | mastermind-plan-review (Opus, high) | [build/plan-review/](build/plan-review/requirements.md) | **landed**: [review.md](build/plan-review/review.md), 10 findings, folded in above |
| Seat (g): delta flow | mastermind-shapes-delta-flow (Opus) | [seats/analysis-brief.md](seats/analysis-brief.md) (g) | **landed**: [delta-flow.md](seats/delta-flow/delta-flow.md), demo PASS; build A turned it into a test |
| Seat (h): legacy census | mastermind-shapes-legacy (Sonnet) | [seats/analysis-brief.md](seats/analysis-brief.md) (h) | **landed**: [shape.md](seats/legacy/shape.md), [the page.children guide](seats/legacy/migration-children-to-pages.md) (233 live callers) |
| Build C: class docs that show, Item and List (step 6, first slice; spawned 17:22) | mastermind-build-class-docs (Opus, high) | [build/class-docs/](build/class-docs/requirements.md) | `worktree/class-docs`, branched from build B |

## How the work runs

- **Builders:** a fresh Opus mastermind at high effort per worktree, spawned now. Each writes its plan and decisions into its worktree's task folder as it goes, and is reset when its context grows large.
- **Reviewers:** fresh agents run through `node Server/review.mjs`, never the builder itself.
- **Plan review:** one fresh Opus reads this plan and the shape docs, and names what's wrong or missing before the builders get far.
- **Nothing merges** until the owner says so.
- **Usage:** the tab checks pace every half hour and pushes toward ~95% by the reset (about 21:40). It stops launching around 20:45, so little is in flight across the reset.
