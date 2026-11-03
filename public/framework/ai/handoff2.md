# Handoff 2 — 2026-09-24

Written for the next mastermind. It comes from one long conversation with the owner on
2026-09-24: about half of it was fixing Servex after a reboot, and the other half was the
owner thinking out loud about pages, cards and agents. This file lists what is still to do,
in the order the owner wants it: **small, visible, useful things first.** The owner's
intentions are written out in full sentences below each item, because the reasons matter
more than the steps.

The older [`handover.md`](handover.md) is still here. Keep it for now; once this file
settles, merge the two or retire the old one.

## Ask the session that wrote this

Many details did not make it into this file. The conversation is Claude Code session
**`731a9d1f-1491-4aa6-a966-79c22cdc5fdc`**, which ran in this repo (`C:\Code\lew42\monorepo`).
To ask it something, run this from the repo root:

```
claude -p --resume 731a9d1f-1491-4aa6-a966-79c22cdc5fdc --fork-session "The owner asked for X. What did they mean by Y?"
```

- `--fork-session` answers from a **copy** of the conversation. That leaves the original
  untouched, which matters because the owner may still have that tab open.
- It has to run from the repo root, because Claude Code stores sessions by project folder.
- Ask about intent ("what did the owner want", "which option did they lean toward"), not about
  the code; the code is here to read.

**The owner's exact words** are also in [`handoff2-owner-words.md`](handoff2-owner-words.md):
all 26 messages, verbatim and in order, pulled from the transcript by a script. The owner
worried that a handoff loses what they actually said. This file is the summary, that file is
the record, and the command above is for anything neither one answers.

## First job: make the agent system clear, then test it

The owner is **not yet sure how the agents talk to each other**, or whether the setup is
right. Before building anything big, the new mastermind should confirm how things work
today, run the tab-to-Servex test (item 4 below), and then propose the workflow. Here is
what is true today, checked against the code on 2026-09-24:

**The three kinds of session**

| kind | where it runs | who it talks to |
|---|---|---|
| **A VS Code tab** (like the one that wrote this) | Claude Code in the sidebar; the owner types or pastes into it | the owner. With the `servex` tools (new tabs only), it can also start and message Servex agents |
| **A Servex agent** | inside the Servex process, started with the Agent SDK; listed in `registry.json`, `list_agents`, and `GET /agents` | whoever sends it a message; its parent hears automatically when it finishes |
| **A CLI session** (`claude -p --session-id …`) | a separate process; the older way to start minions | nobody while it runs; you read its result afterwards |

**The Servex agents that exist today** ([`Servex/agents/`](/Servex/agents/)):

- `assistant-fast`: Sonnet. It answers the owner's dictation on `/framework/ai2/` in about
  two seconds. It has one tool, which writes to the card, and it can't read files.
- `master-assistant-master`: Sonnet, medium effort. A silent second opinion, which speaks only
  when it disagrees with the fast assistant. It is **not** the systems architect the owner has
  in mind (see below).
- `dispatcher`: plain code, not a model. It starts a task mastermind when a card asks for work.
  At most two run at once.
- Helpers: a read-only Sonnet session for one question, which answers on the card and stops.
- Task masterminds: Sonnet at medium effort, loading the `sub-mastermind` skill. It owns one
  task, a worktree and its minions.
- Minions: Sonnet, loading the `minion` skill.

**Who can talk to whom, today:**

- A tab can start, message, list and stop any Servex agent, through the `servex` tools
  (`spawn_agent`, `send_to_agent`, `list_agents`, `interrupt_agent`, `stop_agent`, `card_reply`).
- A Servex agent **cannot** message a tab. A tab is not in Servex's list.
- A parent agent automatically gets its child's "done", "blocked" or "error" message.
- **Any** Servex agent can message **any** other with `send_to_agent`. Nothing restricts it.
- Servex **does** track its own agents (`registry.json`), but the list outlives the sessions:
  after a reboot, dead agents still show as idle.

**Is it set up?** Only partly. `servex` is in `.mcp.json`, but no tab has used it yet. The
`mastermind` skill already says "spawn with `spawn_agent` on Servex, CLI as the fallback."
Nothing tells an ordinary tab when or how to hand off, and nothing tells the fast assistant
about any of this.

**What the owner wants settled.** Write this up as a proposal the owner can look at before
changing anything:

1. **Who asks whom to do what.** Map the chain from the owner's voice to a finished commit:
   the fast assistant, then a deeper assistant, then a mastermind, then minions. For each
   link, say which kind of session it is and what context it starts with.
2. **No context loss.** Every handoff between sessions loses something (this file is one).
   The owner wants the new mastermind to watch for that, and to ask **when one agent is better
   than two**. Hand off only when the gain (a clean narrow brief, parallel work, a cheaper
   model) is worth what gets lost.
3. **Use files, not chatter.** The more that is written to the file system (card logs, task
   logs, the owner's words), the less agents need to talk to each other. The owner prefers
   this.
4. **Limit who can talk.** The owner does not want every agent able to talk to every other.
   They would get distracted and start conversations nobody needs. A mastermind must reach
   its own children, and the assistants must reach the mastermind. Beyond that, restrict it.
5. **Forward the owner's words.** The owner will mostly dictate through the `/ai2/` board. Each
   level of assistant, and any mastermind working on that card, should see those words (item 7).
6. **Layers of assistants.** The owner likes the idea of a fast assistant, a deeper assistant
   with more file access, and at the top a mastermind that acts as a **systems architect**,
   watching the design of the whole system rather than doing tasks. The current
   `master-assistant` is not that yet.
7. **Fresh context.** No long-running, multi-day assistants. Plan how an assistant's context
   is refreshed (restarted with a summary and the card logs) instead of growing forever.
8. **Show it in the page system.** The owner wants the results of all this (decisions,
   questions, content of different types) built in the new page and card system (items 5–6),
   so they can drill down and come back up. They aren't sure how that will look yet.

## What is already done (2026-09-24)

- **Servex was restarted after a reboot.** It had never been set to start by itself: the readme
  had the command, but nobody had run it. The owner has now registered a Scheduled Task named
  `Servex` (at logon, hidden), and the readme gives the PowerShell version that works
  ([`Servex/readme.md`](/Servex/readme.md), "Surviving a reboot").
- **`dispatch.off` is deleted.** The fast assistant can start helpers again, and the Dispatcher
  can start task masterminds again.
- **The two dead worktree folders are deleted** (`../worktrees/wt-grip-fix`, `wt-inbox-model`;
  they held only a boot-failure file).
- **`servex` was added to [`.mcp.json`](/.mcp.json)** at `http://servex.localhost/mcp`. A new
  tab gets `spawn_agent`, `list_agents`, `send_to_agent` and the rest, after the owner approves
  the server once. Sessions that were already open do not have it.
- **The owner committed** the main tree's uncommitted work.

## Start here — the MVP list

### 1. Markdown renders in the browser

**What the owner wants.** Many `.md` files are linked from pages, and those links don't
render properly. The owner wants to click around the docs in a browser like a normal site.
They called this **a top priority**.

**The design they settled on.** A URL that ends in `.md` returns the raw file, because the
static server answers it as a file. So the route has to use a path that is **not a real
file**. The owner wants it **built into the base `Page` class**, so every page gets it
without writing anything. They also don't want routes defined inline four indentations deep.
Two shapes were discussed:

- `/ext/Panel/md/decisions` renders `ext/Panel/decisions.md` (recommended);
  `/ext/Panel/md/doc/decisions` renders `doc/decisions.md`; `/ext/Panel/md/` lists every
  markdown file in the module, which gives every module a free docs index. The cost is that
  no module can have a real folder named `md`.
- `/ext/Panel/md-decisions`: one segment, no reserved folder, but no index and no subfolders.
  The owner raised this as a workable alternative.

**Check first.** The static production server has to hand `/ext/Panel/md/decisions` to the
app instead of returning a 404. Pages made by `route()` (the AI task pages) already depend
on that, so it may already work. Verify before building.

### 2. The fast assistant stops contradicting itself

On the owner's 13:13 card (`topic-mufuomsy`), the assistant said "a helper is looking," then
one second later said "helpers are paused." It promises a helper before the code checks
`dispatch.off`. Make it check first
([`Servex/agents/Assistant.js`](/Servex/agents/Assistant.js) `help()`, around line 186).

### 3. Helpers report back to the assistant

**What the owner noticed.** When the assistant asks a helper to look something up, the
assistant has no idea what the helper did, because they are separate sessions with separate
memory. The owner called this **the context problem**, and it is the core of the whole agent
design.

**Smallest fix.** Start each helper with `parent: assistant-fast`. Servex then sends the
helper's answer back to the assistant (the "wake" message) as well as to the card. Today
helpers are started with no parent, so the answer goes only to the card.

### 4. Try handing work from a tab to Servex

**What the owner wants.** Most work happens in VS Code Claude tabs, and those never use
worktrees or commit, so the main tree fills up with uncommitted files. The owner asked
whether tabs could start minions through Servex instead. They can.

**The test.** In a new tab that has the `servex` tools, start one small task mastermind with
`spawn_agent({role: "task-mastermind", ...})`. Check that it:
- makes a worktree,
- does the work and commits on its own branch,
- shows up on the board,
- and survives the tab being closed.

**The one gap.** Servex's "done" message only reaches a parent that is itself a Servex agent,
and a tab is not one. For now, the tab should create a card for the task and the mastermind
should report there. That way the owner sees everything on one board.

## Next — the page and card model, proved on one small tree

This is the owner's biggest idea from the day. Prove it on **the AI cards only** before
touching core.

### 5. `page.jsonl` as the default page format

**The owner's reasoning.** A `page.js` can import modules and build any interface, but
changing it means a full reload. A `.jsonl` can be tailed live, one line at a time, but can't
import anything. The owner does not want two systems where nobody knows which thing goes
where. **Everything should be a page**, because a page brings a title, an icon, storage,
comments, ranking and tags with it: "a consistent interface for all the things."

**The shape agreed on:**

- **A folder with `page.js` uses it**, the same as today; that is the escape hatch for
  custom code. **A folder with only `page.jsonl`** gets a default page, filled from the log.
  The router knows which one a folder has from the parent's listing, so it never probes and
  never 404s.
- **Every line is one `set()` call.** The owner wants it "very straightforward" with **no
  mapping table** of JSON keys to outcomes to maintain:
  ```js
  set(obj){ for (const key in obj)
      typeof this[key] === "function" ? this[key](obj[key]) : this[key] = obj[key]; }
  ```
  A method gets called with the value; anything else is assigned. The class *is* the
  vocabulary: `place` does what `Page.prototype.place()` does. Every class here already has
  `assign(...args){ return Object.assign(this, ...args); }`, and `set` is `assign` that calls
  methods instead of overwriting them.
- **Line 1 is the constructor** (`new Page(line1)`). The file name implies the class.
- **The rules:** a method always gets exactly one argument (the value, never spread); data can
  call methods but never replace them; if `this[key]` is an object with its own `set`, the
  value is passed down to it (the recursive case); `constructor`, `__proto__` and anything
  starting with `_` are skipped. A typo becomes new data rather than an error, so plan a debug
  view that lists unknown keys.
- **Three steps, separate on purpose:** a file **exists** (node appends a `{"file": ...}` line
  automatically when it appears, so no agent has to remember), it is **linked** in the
  navigation (automatic for child pages), and it is **placed** in the content (deliberate: a
  `place` line, or `content.js`). The owner said explicitly that a file being present should not
  mean it gets rendered.
- **`content.js`** replaces the `content()` method: `export default function(page, box){…}`.
  Wrapping it in a function lets a dozen lazy imports arrive in any order, each filling the box
  it was given. That answers the owner's worry about capturing parallel imports.
- **Listing lines must be safe to repeat.** On Windows the watcher fires extra events (even a
  file read fires one), so the latest line for a name wins and a duplicate changes nothing.

**On format:** the owner worries that JSON costs an AI more effort than markdown (quotes,
escapes). The options they raised were markdown with JSON front matter, markdown with a log at
the end, or `.jsonl` with a markdown field written by a node tool that does the quoting. Nothing
is decided; `.md` files placed by a line are the simplest middle ground.

**Do not migrate** the hundreds of existing `page.js` files. New things use `page.jsonl`;
old pages move over only when someone is working on them anyway.

### 6. One folder per card

- A card is a folder, even a simple one. That way there is one shape everywhere, and nothing
  has to be "upgraded" when a card gets children.
- A card lives in the folder of the day it was created (the owner suggested
  `ai/2026/MM/DD/`), and stays there. A task that runs for three days still lives in one place.
- Sub-cards are subfolders, to any depth. The owner's requirement, in their words: "the ability
  to add sub cards, anywhere on the card."
- A card's type (question, request, sub-question, ...) is a line in its log, and the latest line
  wins, so converting a card to another type is one append. The owner's requirement: "convert any
  card into any other content type."
- "Today," "a project," and "open work" are **views**, not folders. Projects are tags, so nothing
  ever moves and nothing needs archiving.
- **One Servex tool creates cards:** `create_card({parent, title, type})`. The owner does not
  trust an AI to build folders and indexes by hand ("I'd rather have a create page skill that
  does it programmatically without error"). A tool is stronger than a skill, because it can't
  forget.
- The owner worried that a separate index needs updating on every rename. With the folder
  itself as the index, a rename is the only step.

### 7. Cards are the shared memory between agents

The owner wants every agent on a card to see all of their messages. The design:

- An agent attached to a card reads the card's whole log when it starts.
- Servex forwards each new message the owner adds to the card to every agent attached to it
  (`send_to_agent`, which already exists).
- Keep the agents that talk to the owner (the assistant, the task mastermind) on shared memory.
  Keep builders (minions) isolated, with a narrow brief and none of the chatter; the mastermind
  translates between the two.

### 8. The assistant may look things up, with a limit

The owner started with a rule that the assistant must be fast and never get bogged down in tool
calls. Now they think a rule that it can't read anything "might be a mistake," because it can't
answer intelligently. The middle ground: give it Read, Grep and Glob, with at most two quick
lookups before it hands the question to a helper. It can also answer in two steps: "on it"
immediately, then the real answer a few seconds later.

### 9. The rule for tabs

Multi-file work goes to a task mastermind through Servex; small edits stay in the tab. This
changes `CLAUDE.md` or a skill, so **ask the owner first**.

## Back burner — touched on, not first

- **Compaction.** Commit first, so git keeps the history, then fold each `.jsonl` into one line,
  which becomes the snapshot. The first line of any log is the current state. The owner
  suggested running it before every commit, across the whole site. It does the job of a
  separate JSON snapshot without keeping two copies of the data.
- **Serialization.** Objects save as JSON and come back as the right class, recursively (a thing
  holding lists of things, each of the right type). [`core/Item`](/framework/core/Item/) and
  [`core/List`](/framework/core/List/) already save as `{type, id, data, items: [...]}` through
  [`ext/Saver`](/framework/ext/Saver/). Check whether they rebuild the right class from `type`.
  Item 5 needs this to grow past cards; `toJSON()` is what writes the compacted line 1.
- **Page-scoped socket messages.** The owner wants one socket, with messages addressed by the
  page's URL. In their words, "the URL looks like a path and is a path": the URL is the ID of the
  context. The dev socket already does this for one case: tailing a `.jsonl` subscribes by path,
  by byte position ([`Server/plugins/SocketServer/Tail.js`](/Server/plugins/SocketServer/Tail.js)).
  Card conversations use Servex's separate one-way push (`/api/stream`); nobody has checked
  whether it replays what a reconnecting page missed.
- **Multi-column layouts.** The owner has explored this before without reaching a conclusion.
  There are three sizing modes: fill the screen (width and height), fill the width with auto
  height, and a fixed height. Each looks different, and **full-bleed means square corners**. That
  rule is not written down anywhere yet; [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns/)
  only says `bleed` is for paint. The owner also noted that a narrow (~400px) section rarely wants
  two columns, and that a small tab section does not need to be broken into fifty files.
- **Card logs live outside git**, in `%LOCALAPPDATA%\lew42\servex\logs\cards\`. Only 23 cards
  (those made since 2026-09-23) have one; `board.jsonl` holds one header line per card (675).
  Item 6 replaces this; until then, consider moving the logs into the repo.
- **Task masterminds run Sonnet at medium effort.** The Dispatcher overrides the role's Opus
  default to save budget ([`Servex/agents/Dispatcher.js`](/Servex/agents/Dispatcher.js) ~line
  120). Change it if the owner wants Opus.
- **Stale agents in Servex's list.** `minion-alpha-writer`, `minion-beta-writer`,
  `task-mastermind-wake-proof-on` and `minion-editor-deps` show as idle, but they died with the
  reboot. The list is saved to disk, so it outlives the sessions.
- **Merging worktree branches.** The `sub-mastermind` skill says to hand the owner a branch
  name, not to merge, so worktree work waits until someone merges it.

## How the owner wants to be talked to

- Short, plain sentences. No jargon, no clipped fragments. Explain it like to a newcomer.
- Show something that works rather than describe it.
- The owner often dictates by voice (Whisper), so expect transcription typos ("cervix" means
  Servex) and read for the meaning.
- When asked for an overview, give the overview only, and don't start building until they say go.
