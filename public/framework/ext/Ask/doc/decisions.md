# Ask — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

`chat({ task, from, resume, history })` is the same thing as a panel, and
`AITask.chat()` mounts it on every task detail page — so
[`/framework/ai/<date>/<slug>/`](/framework/ai/) is a chat window onto that
task's session, and the exchange lands back in its own `task.jsonl`. The dev rail
mounts the same panel on **every** page, over threads stored beside that page
(`dev/DevBar/ask.js`).

| piece | where |
|---|---|
| `ask()` / `available()` | `Ask.js` — one RPC over `dev/Socket` |
| `thread()` | `Ask.js` — open a thread dir; no process. See [task](/framework/ext/Ask/doc/task/) |
| `start()` | `Ask.js` — a NEW task, not a turn; see [task](/framework/ext/Ask/doc/task/) |
| `chat()` | `chat.js` — the panel: history, input, streaming bubbles |
| the turn | `Server/plugins/Ask.js` — `rpc:ask` / `rpc:thread` → `claude -p` |
| the new-task spawn | `Server/plugins/Start.js` — `rpc:start`; scaffolds `ai/<date>/<slug>/` and spawns a whole session, not a turn |
| the picture | `Server/plugins/Shot.js` — one element, as a png the turn reads |
| the record | a `chat` verb on `TaskJSONL` (`ext/JSONL`) |

## Who uses it

Four real callers, one per shape of "browser talks to Claude":

| caller | uses it for | page |
|---|---|---|
| [`dev/DevBar/ask.js`](/framework/dev/DevBar/) | `thread()` + `chat()` — the dev rail's per-page thread panel, mounted on every page | every page |
| [`ext/AITask/AITask.js`](/framework/ext/AITask/) | `chat()` — "Chat with this session" on a task's own detail page | every task under [`/framework/ai/`](/framework/ai/) |
| [`ext/AITask/compose.js`](/framework/ext/AITask/) | `start()` — the board's "what should Claude work on" box | [`/framework/ai/`](/framework/ai/) |
| [`ext/DesignTool/vision.js`](/framework/ext/DesignTool/) | `ask()` with `shot`, locked to `Read,Glob,Grep` — a second opinion on a numeric layout report | [`/framework/ext/DesignTool/`](/framework/ext/DesignTool/), its [`audit`](/framework/ext/DesignTool/audit/) |

No dead exports: `ask`, `available`, `thread`, `start` and `chat` are each in
real use, none of them from more than one caller shape.

## `task` is a path under `public/`

Every RPC here takes the same one — `framework/styles/layouts/ai/rhythm` beside a
page, or the legacy `framework/ai/2026-08-14/browser-cli-bridge` — and it is also
the **fence**: browser input reaches a file write, so the path must resolve under
`public/`, name no `..`, and carry an `ai` segment. `thread()` is the only thing
that creates a thread dir; `start()` is the other door, for a task that wants a
whole session working it rather than a chat. Full shape, the fence's exact rules,
and why `thread()` no-ops on an existing dir: [task](/framework/ext/Ask/doc/task/).

## Decisions

**A turn is a process, not a pipe.** The obvious reading of "inject into a live
session" is a wrapped terminal — a pty onto an interactive `claude`'s stdin. We
don't do that: `claude -p --resume <id>` starts a fresh process, replays the
transcript from disk, takes one turn, and exits (measured ~2.5s for a trivial
haiku turn). Continuity is the *file*, so there's no child to supervise or
reconnect to — at the cost of no permission prompts and no mid-turn steering.
Long version, including what "Phase 2" would cost: [process](/framework/ext/Ask/doc/process/).

**The first message on a task forks, every later one resumes.** A headless turn
must never share a transcript a human still has open in a terminal, so the first
browser message sends `from: <the task's session_id>` — `--resume …
--fork-session`, a **new** session id that lands in `task.jsonl` as
`chat_session_id`. Every later message resumes that id instead. One fork per
task, forever: [fork](/framework/ext/Ask/doc/fork/).

## A turn is bound to the tab that asked

A `-p` turn reaches the browser only through the `site` MCP, whose tools used to
pick a tab by **`path`** — so two windows on one page were indistinguishable and
the turn was guessing which one it was driving. Three moves, none of them new
machinery:

- **A tab has an id.** `dev/Socket` mints one per tab in `sessionStorage` and every
  `hello` carries it; `Tab` keeps it, and an id already known is never dropped by a
  later `hello` (the SPA's `navigated()` sends a url alone).
- **The tools take `tab: <id>`, and refuse an ambiguous `path`** rather than
  silently picking the first match — the error names every candidate, so the retry
  is the recovery. Protocol and the full listing:
  [wire](/framework/dev/Socket/doc/wire/).
- **The turn is told which tab it is.** `Server/plugins/Ask.js` `system()` puts the
  asking tab's id and page into `--append-system-prompt`, along with whatever the
  page passed as `context` — the dev rail passes the current selection. The server
  also **claims** that tab for the length of the turn (`Tab.claim`, which `pages`
  then reports), so the ring is up whether or not the turn ever touches the browser.

The model is never asked to work out where it is, and never asked to claim anything.
Proof, both halves and how to run them: `proof.mjs` in
[ask-tab-binding](/framework/ai/2026-08-18/ask-tab-binding/).

⚠ **The turn's claim overwrites one made by hand** on that tab, and releases at the
end — a turn is short, and a ring that lies about who is driving is worse.

## Pick an element, and the answer knows its readme (2026-09-17)

The ask was: *select any element on the page and ask something about it, and have
the session read the readme for that path — what this thing is, and the design
decisions behind it*. `pick.js` is that, and the whole mechanism is one topic:
[picking](/framework/ext/Ask/doc/picking/).

**The element context rides in the PROMPT, not in the system line — so the server
did not change.** `Server/plugins/Ask.js` `system()` slices `context` to 800
characters before it goes into `--append-system-prompt`, and a readme is 2,400
characters on its own. So `ask()` builds the sentences (`describe()`), prepends
them to the prompt, and passes a one-line summary as `context` — the tab binding
still says what is selected, and the readme rides in on stdin where there is no
length problem. Nothing in `Server/` was touched, which also means this needs no
dev-server restart to work.

**A turn is handed the files, not the ability to find them.** Three fetches from
the browser — the nearest `readme.md`, the `doc/decisions.md` beside it, and the
readme of the module that owns the element's class prefix — are quoted into the
prompt. That is why `mount()` defaults to `tools: ""`: the answer is grounded
without the turn reading anything, and it stays ~$0.02 on haiku. A caller who
wants the turn to go looking passes `tools: "Read,Grep"`.

**The class-prefix lookup earns its twelve lines.** Measured on seven elements of
one page: `.tab-bar` → `ext/tabs`, `.dev-bar` → `dev/DevBar`, `.page-previews` →
`core/Page`. Three of seven got a component readme the page's own readme could
never have given, for one cached fetch of a 4k text file.

**`mount()` is opt-in, one page at a time.** A floating **?** on every page of the
site would be chrome nobody asked for; a page that wants one writes
`mount({ app: this.app })` in its `content()`. It renders nothing off localhost.

**`mount()` ships from `chat.js`, not from `Ask.js`.** `Ask.js` re-exports `pick`,
`context`, `describe`, `where` and `label` from `pick.js`, but `mount()` needs
`chat()`, and `Ask.js` importing `chat.js` would be a parent↔child import cycle —
the kind that breaks only on a deep reload.

⚠ **The `.page` ancestor is not where the readme is.** Core renders a `Doc`'s
content inside a synthetic child page, so the first version of this reported
`/framework/ext/Ask/overview/intro/` and found no readme at all. `context()` now
climbs up to three rungs of the path and stops at the first `readme.md`; the
readout and the chip both name the url it settled on.

⚠ **The floating `?` is `position: fixed` inside the page that called it.** That
gives it the page's lifetime for free, at the cost of one quirk: on a page with a
rail, or under a columns host, `Page.css` has made that box a containing block, so
the `?` pins to the region's bottom-right instead of the window's. It is the same
corner to look at.

## Reply in place — one item, one thread (2026-09-18)

The ask was: *"a microphone button or maybe just a reply button, either one … on a
per item basis, on a nested hierarchy of content from the mastermind session down
to the tasks, down to the decisions … if I can click on a specific item and start
recording or typing and you have contextual awareness to that specific item, then
I don't need to reference it."* `reply.js` and `mic.js` are that, and the whole
mechanism is one topic: [reply](/framework/ext/Ask/doc/reply/).

**The BROWSER writes the `chat` lines, not the server.** A reply has to land as a
`chat` line carrying `about: {kind, id}` — and the browser is the only side that
knows which item a reply belongs to. Two routes existed: add `about` to
`Server/plugins/Ask.js`'s `record()` (three lines), or call `ask()` **without**
`task` so the server records nothing and append both lines from the browser
through `rpc:append`. The browser won, because a `Server/` change is dead until
the owner restarts their dev server and this had to work on the one that was
already running. `rpc:append` was already the browser's writer, already fenced to
a `.jsonl` under `public/`, and already what `ext/AITask`'s Approve and Improve
use. **Nothing in `Server/` was touched**, so no restart is needed — the same
property the element picker has.

⚠ The consequence to remember: `ask({ task })` and `reply()` must never both fire
for one exchange. `record()` on the server only writes when a `task` is passed, so
`reply.js` omitting it is load-bearing, not an oversight.

**A reply turn gets NO tools, and that is the scoping.** `tools: ""`. The turn
answers in prose and ends with a fenced `jsonl` block; the browser parses it,
keeps only `ask` / `decision` / `log`, stamps every line from its own clock, and
appends them. The alternative reading of "tools scoped to that task's dir" is
`--tools Bash` or `Read,Edit` so the turn writes its own line — but neither flag
scopes to a directory, so that is a shell on a browser-typed prompt with the run
of the whole repo, to do a job that needs no tool at all. This closes, for this
one path, the "tool scoping is opt-in, not enforced" item still open below.

**A reply thread is its own session, and does NOT fork the task's — measured.**
The obvious design, and the one this was built to, is `from: m.session_id`
(`--resume … --fork-session`), so the reply starts out knowing everything the
task's session knows. Against a mastermind session that had been running all day
that fork **cost $0.18 and answered "Prompt is too long"** (2026-09-18). The
prompt already carries the whole item, so the fork was buying context it did not
need at a price that rose all day until it stopped working. So: the first reply
on a task starts a **fresh** session, its id is recorded as `chat_session_id` as
before, and every later reply resumes that — the thread under an item remembers
its own conversation and nothing else. `fork: true` opts back in.

⚠ And it is safe to opt in, because the failure recovers itself: `turn_it()`
matches that complaint by name, says so where the answer goes, and asks again
with no session at all; `record()` then writes the id of the session that
actually **answered**, so a thread whose session has outgrown the model repairs
itself on the next reply instead of failing forever. The dev server hands the
browser the turn's text and not its error flag, which is why the match is by
name (`CLI_FAILED`) — a miss costs nothing worse than the answer it already was.

**The cost of a reply.** Measured end to end on the live wire, haiku, `tools: ""`:
a reply on an ask card was **$0.137 in 28s**, and a dictation that split two
sentences into two `ask` cards was **$0.037 in 7s**. The failed fork above was
**$0.18** on its own. Sonnet — the default, because a reply is usually a request
to act on rather than a question — runs several times the haiku figure. A
dictation is pinned to haiku deliberately: splitting a paragraph into asks is
mechanical work and every `quote` is copied verbatim, so there is nothing to
judge.

### The microphone is the browser's, not a service

`SpeechRecognition` is built into Chrome (desktop and Android, still behind the
`webkit` prefix). Nothing is installed, no key is held, no audio is uploaded by
us, and a word appears while it is still being said. `can_hear()` is false on
**Firefox and iOS Safari** — there is no polyfill — so the button is not drawn
there at all and one line says to type instead; a control that is present and dead
is worse than none.

⚠ **When server-side transcription wins instead**, and it is a real "when", not a
"never": on Firefox and iOS Safari, where there is no other option at all; in a
noisy room, where a server model with a real acoustic model beats the browser's by
a wide margin; and for any language the browser does not list. The price is a
dependency and a key, an upload per sentence, no interim words, and audio leaving
the machine — so it is worth building the day the owner is dictating from a phone
or a café, and not before.

## Approve / Improve on any page (2026-09-18)

The owner's words: *"being able to click and give you feedback on a specific
item — for layouts and pages … approve it, and it goes into an approved
layout library. Then we refine that library and get nice, clean, robust
layouts that the AI knows to lean on."* `/layouts/browse/` already does this
for its 102 catalogued items, through `browse/verdicts.js` appending one line
per press to `/layouts/verdicts.jsonl`. `verdict.js` (`verdict_mark`,
`verdict_acts`) puts the same two buttons on the floating **?**, so a page
never needs to be catalogued first — `mount({ app, url })` is the whole
opt-in.

**The SAME file, not a second one — this module IMPORTS `browse/verdicts.js`
rather than writing its own.** The alternative, a verdicts file per realm
(`/framework/ext/Ask/verdicts.jsonl` of its own), was considered and
rejected: it would mean two readers, two writers, and two places a page's
history could be — and the owner's own sentence asks for ONE library, not one
per realm. A second file wins only if a realm's verdicts must never appear
next to another's (a private draft area, say); nothing on this site needs
that yet. Importing `layouts/browse/verdicts.js` from `framework/ext/Ask` runs
against the usual "imports flow down" shape (`code` skill §5) — a framework
extension depending on a specific site realm — and that inversion is the
price of the one-file answer; it is accepted here because `verdicts.js` is
already the site's one seam onto that file, and duplicating its wire-protocol
and `expect()` retry logic to stay "purer" would be the second store this
decision just rejected.

**A page's own url and a browse catalogue id never collide.** Every id in
`browse/items.json` is a short slug with no `/` in it — `shell-left`,
`practice-workbench` — checked mechanically: `data.items.filter(i =>
i.id.includes("/")).length === 0` across all 102, 2026-09-18. Every page url
this module writes starts and ends with `/` — `/layouts/practice/workbench/`
— so the two keyspaces are disjoint by construction, not by convention: an id
can never *become* a url-shaped string without someone hand-editing
`items.json` to break its own rule. Two consequences follow: (1) the same
page can carry TWO independent verdict trails — one under its browse id (cast
from the wall) and one under its own url (cast from its own `?`) — which is
correct, not a bug, because they are answering two different questions ("is
this catalogue entry good" vs "is this page good"); (2) the approved library
(`/layouts/doc/studies/approved/`) reads only the url-keyed rows
(`item.startsWith("/")`), so it shows pages judged directly and leaves
browse's own front page to show its own catalogue.

**The mark is built immediately; the buttons wait for the panel to open.**
`verdict_mark(url)` runs at `mount()` time, before anyone has clicked
anything, because a check or a pen the owner can see WITHOUT opening the
panel is the point of "shown live on the control" — scanning ten pages for
their verdict should not cost ten clicks. `verdict_acts()` stays inside the
lazily-built panel, next to `chat()`, which already pays nothing until first
open; the buttons are the heavier half (a note field, a save round trip) and
nobody asks about most pages.

⚠ **`url` must be `this.url`, never `location.pathname` or
`app.router.active.url`.** Both still name the page you were just ON while a
new page's own `content()` / `render()` / `column()` is running:
`Router.go()` **loads first, pushes second** (`Router.js:40`), and
`Router.activate()` runs every `page.activate()` — which is what calls
`content()`/`render()` — **before** it sets `this.active = page`
(`Router.js:81-90`). A control that read either one at build time would
silently file the owner's verdict on the page they had just left. `Page.url`
(`Page.class.js:156`) is set once, when the page is declared, so it has no
such window. This one nearly went into `verdict.js` unnoticed — caught by
reading `Router.js` itself rather than assuming, and it is now the loudest
warning on both `verdict_mark()`'s and `mount()`'s own doc comments.

**Improve's note "may open the reply box" — only when the caller has one to
open.** The obvious full version of "the note reaches Claude the same way a
reply does" is to run it through `reply.js`'s `Reply` class, which turns a
note into a real Claude turn and a two-way thread. But `reply()` files its
`chat` lines into `m.url` — a task's own `task.jsonl` — and most pages this
control is built for (a layout demo, a shell, a magazine cover) are not
tasks and have no such log to write into. So `verdict_acts({ url, m, about
})` takes `m` as an OPTIONAL task manifest: without it, an Improve note is
simply the verdict's own `note` field — exactly what `/layouts/browse/`
already writes and every reader of `verdicts.jsonl` already knows how to
show. With it, `Verdict.thread()` mounts `reply()` right under the saved
note, scoped to `about: { kind: "page", id: url }`, and the note becomes a
real conversation the same way a reply to an ask card does. No mounted page
in this pass has a task manifest to pass, so today every one of them takes
the plain-note path; a task detail page that wants the fuller version calls
`verdict_acts({ url: this.url, m: this })` directly, bypassing `mount()`.

**`ask-` still needs its `css-scopes.txt` line** (see "Open", below) — the
classes this decision added (`ask-verdict-*`) are unregistered for the exact
reason the rest of the module's classes are: that file is outside this
module's own write fence. No new open item; the existing one now also
covers `verdict.js`.

## `shot` — let it look at the element

```js
await ask("What is wrong with this card's layout?", { shot: ".preview-card" });
```

A turn already has the full tool set; the missing half was the browser *making*
a picture. `Shot.js` drives globally-installed playwright — never a repo
dependency — and refuses loudly (`npm i -g playwright`) rather than going quietly
blind. Full mechanism and a measured cost: [shot](/framework/ext/Ask/doc/shot/).

## The exchange is a verb, not a second store

A chat message is `{"chat": {"at", "role", "text", "cost_usd"}}`, appended to the
task's own `task.jsonl` and replayed by `TaskJSONL` into `chats[]` — no parallel
file, no database. Detail: [record](/framework/ext/Ask/doc/record/).

## Traps

- **⚠ Appending to `task.jsonl` live-reloads every open tab**, including the one
  that is chatting. `LiveReload.mute(file, socket)` skips the socket that caused
  a write for 5s; without it, every reply reloaded the page that asked for it.
  Other tabs still reload, which is the behaviour you want.
- **⚠ `Socket.prototype.ask_event` is called BY the server** through
  `Socket.message()`'s method lookup — a grep for callers in `public/` finds
  none (`Ask.js:7`). Same live path as `Socket.reload()`.
- **⚠ Off localhost `ask()` rejects.** `Socket.singleton().disabled` is the
  gate, and it is a hard constraint. `available()` is the guard; `chat()` renders
  the recorded history read-only. Nothing on the site may *depend* on a reply.
- **⚠ The prompt is browser input reaching a process spawn.** `spawn` runs with
  no shell and the prompt goes in on **stdin**, never argv — keep it that way.
  The `task` path is fenced by `thread_dir()`; see [task](/framework/ext/Ask/doc/task/).
- **⚠ The tab binding is the one thing that rides argv** —
  `--append-system-prompt`. Safe because `spawn` runs with no shell, and the
  page-supplied `context` is capped at 800 characters so a selection can never
  approach the command-line limit. The prompt itself still goes in on stdin.
- **⚠ One turn at a time per session.** A second `ask()` against a session
  mid-turn is refused with "That session is mid-turn" rather than queued —
  two processes resuming one transcript is the corruption case above
  (`Server/plugins/Ask.js`'s `turns` map, keyed by `resume || task || id`).
- **A turn costs money.** ~$0.02 on haiku, ~$0.09 on sonnet for a trivial
  exchange, because every turn re-reads the session. `model` and `tools` are
  per-call; `tools: ""` is a pure-text turn.

## Open

- **`ask-` needs a line in `css-scopes.txt`.** This module opened a CSS namespace
  (`.ask-pick-*`, `.ask-float-*`, `.ask-chip-*`, `.ask-demo-*`) and the reservation
  file was outside the task's write fence. The literal line to add, in the `# ext`
  block, is:

  ```
  ask-         ext/Ask
  ```

  Until it is there, the picker's own class-prefix lookup finds no module for an
  `.ask-*` element — which is exactly what the demo on the module page shows.
  The older `chat-*` names in `ask.css` are unregistered for the same reason and
  would go on the same line.
- **A picked element is re-sent on every turn of a chat.** A follow-up question in
  the same panel resends the whole ~7,000-character preamble rather than relying on
  the resumed transcript. It keeps the answer grounded and costs pennies; if a long
  conversation about one element ever becomes normal, send it once and let `resume`
  carry it.
- **Tool scoping is opt-in, not enforced.** `tools` is per-call — `vision.js`
  locks itself to `Read,Glob,Grep`, and both demo askers on this module's own
  page pass `tools: ""`. Neither production consumer does: `dev/DevBar/ask.js`'s
  thread panel and `AITask.chat()`'s task chat both call `chat()`/`ask()` with no
  `tools` at all, so a prompt typed into either gets `claude -p`'s own default
  permission mode — nothing here narrows it. `Start.js`'s spawn is the one place
  that opts into a floor (`--permission-mode acceptEdits`, deliberately not
  `bypassPermissions`). Whether the chat path needs the same floor is open —
  The owner's call.
- **Streaming input mode** (`--input-format stream-json`, one long-lived child)
  — faster and cheaper per turn, at the price of process supervision. Worth it
  only once turn latency is the complaint.
- **No way to interrupt a turn once spawned** — the child isn't kept.
- **Shots are temp files and never cleaned up**; a launch is ~1.5s of the ~7s
  `shot` costs end to end.
- **`shot` can't capture live client state** — it reloads the url in a fresh
  browser, so a panel you dragged open is not what it photographs.
- **A task's live interactive session still can't be steered from the browser**;
  the fork is a sibling, not a remote control.

## The polish pass — 2026-09-17

### A pick asks about the page's DIRECTORY, not about its url

They are not the same address. Core renders a `Doc`'s content into synthetic child pages, so
picking anything on `/framework/ext/Ask/` lands on `/framework/ext/Ask/overview/intro/` — a
page that owns no files and never was a folder. Hunting a `readme.md` up from there asked the
server about two directories that have never existed: **two red 404s in the console on every
single pick**, measured at all five widths.

A `Page` knows its own module (`meta.url`). `page_at()` returns both answers — the `url` the
reader is standing on and the `dir` its files live in, taking the nearest ancestor that has a
`meta` — and the readme climb starts at the directory. A pick on this page is now **zero**
network errors.

The readout prints both, labelled, for the same reason: `on page` and `explained in`, because
saying only the first was its most confusing line.

### The chip borrows the element's own words when it has no name

`label()` fell back to the bare tag, so picking a heading put **`h4`** in the chip — a word
that tells the reader nothing about which `h4`. With no id and no class it now quotes the
first 28 characters of the element's own text: `h4 “A card, so there is somethin…”`.

### Two small ones

- The `asker()` placeholder said `—`. It now says *"Press it and the answer lands here."* —
  a bare em dash under a button is not a placeholder anyone can read.
- The readme fold had no measure (15 paragraphs and list items 29px past their own 40em from
  1000 up). `md.details` nests its markdown two levels down inside `.md-details-body`, and
  every measure cap on this site is written as a direct-child selector, so none of them
  reached it. `.ask-fold` caps it where it lands.

## Edit mode — the one dev/production switch (2026-09-18)

The owner's words: *"the whole page editing experience … would need the user authenticated
or a development mode toggle — some simple way to switch the UI from edit mode … to
production mode that hides all those buttons so they don't break or become confusing UI."*
`edit.js` is that: one function, `edit()`, that every editor control on the site now reads
instead of checking the dev socket itself.

**What it replaces.** Before this, six places each ran their own copy of `!Socket.singleton()
.disabled`: `Ask.js`'s `available()` (plus three inline throws in `ask()`/`thread()`/
`start()`), `layouts/browse/verdicts.js`'s `writable()`, `imagine/paging/make/real.js`'s drag
refusal, `imagine/paging/make/made.js`'s write guard and its `store_for()` FileStore/
LocalStore choice, `ext/Saver/FileSaver.js`'s `write()`/`delete()`, `ext/AITask/decisions.js`'s
`writable`, and `ext/AITask/rank.js`'s `writable`. All seven files now call `edit()`; the
`Socket.singleton().disabled` check itself lives in exactly one place, inside `edit()`.

**`edit()` is true only when both halves hold: the dev socket is live, AND the dev rail's
Edit checkbox is on.** The checkbox defaults to true and is remembered
(`localStorage["lew42-edit"]`), so the site keeps behaving exactly as it always has until the
owner flips it off — at which point every one of those seven files reports "not writable" the
same way they already do off localhost, with nothing else to change. Off localhost `edit()` is
always false regardless of the checkbox, because there is genuinely no server for a write to
reach.

**Decision — where the switch lives.**

| option | why not chosen / chosen |
|---|---|
| `app.edit` on `core/App` | Rejected. `framework/readme.md` and `dev/doc/decisions.md` both say core never imports `ext`, and dev/doc/decisions.md is explicit that dev is the side allowed to depend on ext, never the reverse for core. Giving `App` an `edit` property would mean `core/App` importing `dev/Socket` to compute it — a new dependency direction nothing in core has today — to serve six controls that are every one of them in `ext/` or a page, never in `core/`. |
| `ext/Ask/edit.js` exporting `edit()` / `set_edit(on)` / `on_edit(fn)` | **Chosen.** `ext/Ask/Ask.js` and `ext/Saver/FileSaver.js` already import `dev/Socket` directly — ext depending on dev/Socket is the established direction, not a new one — and `dev/DevBar` already imports `ext/Ask` (`ask.js`), so the toggle's UI (in `dev/DevBar`) can reach the switch (in `ext/Ask`) the same way it already reaches `ext/Ask`'s chat panel. Zero new import-direction violations either way. |

The formal `decision` line, with the full reasoning, is in this task's own log:
[`/framework/ai/2026-09-18/edit-mode/`](/framework/ai/2026-09-18/edit-mode/) (Decisions tab).

**The toggle.** A second checkbox in the dev rail's head line, next to "block" — labelled
"edit" — calls `set_edit(on)` then `location.reload()`. It reloads because every one of the
seven converted files decides whether to render its control (or which store to write to) at
construction time, the moment the page builds, not reactively — the same reason the rail's
other settings (width, tab) already apply through a reload of whatever navigates next, not a
live re-render. `on_edit(fn)` exists for a future caller that wants to react without a reload
(a subscriber Set, called before the reload happens); nothing in this pass needed it, so
nothing subscribes yet.

**Proof.** Headless Playwright, port 8136, 1280 wide, four pages (the day dashboard,
`/layouts/browse/`, `/imagine/paging/make/`, this task's own Decisions tab): edit off draws
zero of the six controls and logs zero console/network errors on all four; edit on brings
every count back (27–28 reply/mic button pairs, one rank grip, two Approve/Improve buttons
once a row is opened, a browse item's two buttons once opened) with zero errors either way.
`imagine/paging/make`'s status pill visibly reads "Read from the files" (LocalStore, edit
off) vs "On disk … under made/" (FileStore, edit on) with everything else on the page
unchanged — the clearest single before/after, because Make already had this exact
this-browser-vs-the-files distinction built in for reading off the dev socket; `edit()` just
gives the owner a lever to preview the off-socket half without leaving localhost.

**The roles line — how far the platform got, and what closes the gap.** A separate program,
`/imagine/platform/`, spent real research deciding a full sign-in system for a *different*,
future site (Cloudflare Workers, D1, a `users` table) — not this static `public/` site's local
dev socket. It settled on six roles (`owner`, `admin`, **topic founder**, `moderator`,
`member`, `anonymous`) and two sign-in providers (GitHub and Google), each checked through one
function, `can(user, action, url)`, called by the router before every write
(`/imagine/platform/decisions/identity.md`, §33). None of it is wired into anything: it is a
decision record, not code, and it assumes a server (Workers) this repo's production build does
not have — `public/` still ships as static files with no server at all. For `edit()` to read a
signed-in role instead of the dev socket, three things have to exist first, in order: (1) the
owner registers an OAuth app with GitHub and with Google — **the owner's own item, ~15
minutes**, named as the first blocker in `ai/2026-09-18/memery-scout/report.md`; (2) the
Workers-side identity stack from `identity.md` gets built (the `users` table, the HMAC cookie,
`can()`) — "a few hours of code" per that same report, and it targets a Workers deployment
this static site does not currently have; (3) `edit()` changes from `!Socket.singleton()
.disabled && toggle` to something like `!Socket.singleton().disabled || can(user, "edit",
location.pathname)` — an OR, not a replacement, so a logged-out visitor on localhost still
gets today's dev behaviour and a signed-in moderator gets it on the deployed site too. Until
step (1) happens, the switch this task built (dev socket + a remembered local toggle) is the
whole answer, and it is a complete one for "hide the buttons in production" — the role system
only adds "and let a trusted signed-in person turn them back on off localhost."

### Checked and found sound — the floating ? covers nothing

A fixed control owes the shell the strip it stands on, so the question was whether the **?**
sits on content. It does not: scrolled to five positions through the whole page at 400, 1280
and 3440, its 40–51px box overlapped **no glyph and no control** at any of them. It stands in
the page's right-hand gutter, outside the content column, at every width. No change made.

(⚠ The first run of that check reported the same clean result without ever having scrolled —
`.pages` is not the scroller on a `Doc` page, so `scrollTop` was a no-op. The instrument had
to find its own defect before the subject's.)

## The reply types itself out — streaming, and the `assistant` preset (2026-09-19)

The owner's words: *"if you want to see the beginning of the response immediately as it's
being created, we need the socket to beam each new word … the socket sends one word at a time,
the UI appends it one word at a time."* A `claude -p` turn was already `--output-format
stream-json`, but that format hands back one COMPLETE content block per event — the whole
reply, all at once, the moment generation finishes — not the tokens as they are written.
`--include-partial-messages` is the flag that changes that: the same stream now also carries
the Anthropic API's own raw streaming events, one level down inside `{type: "stream_event",
event}`, and a `text_delta` inside one of those is a word or two as it is generated. Confirmed
against the installed CLI with a scratch run before writing any code, not from the docs.

**Two new things on the wire, both fire-and-forget `rpc()` calls exactly like the existing
`ask_event`:** `ask_chunk {turn, seq, text, board_id}` for every delta, then one `ask_done
{turn, text, session_id, ms_to_first_chunk, ms_total, board_id, error}` when the turn ends —
`board_id` only set for the `assistant` preset (below), letting a caller correlate "the same
reply, arriving two ways." `Server/plugins/Ask.js`'s `event()`/`delta()` do this alongside the
existing `ask_event` emission, unconditionally — a plain `ask()` call (`chat.js`, the dev
rail's thread panel) never sets `stream: true` and never sees either new event, so nothing
about the existing chat path changed. A `tool_use` content block starting becomes one short
status chunk (`"reading the state… "`), never the raw tool JSON.

**`ext/Ask/stream.js`** is the client half: `stream({ preset, prompt, on_chunk, on_done,
on_error })`, over the same dev socket `ask()` uses, plus `typewriter(el)` — a tiny view
helper that only ever APPENDS text nodes (never re-renders the element) behind a blinking
caret, so a stream can never lose or reorder a word. The blink lives in CSS behind
`prefers-reduced-motion`; the append itself is unconditional either way.

### The `assistant` preset — a fast, tool-free, persona'd turn

`preset: "assistant"` (`Server/plugins/Assistant.js`) resolves to Sonnet, `--effort low` (the
CLI's lowest — confirmed against `claude -p --help`, nothing sits below it), a persona system
prompt in place of the interactive `/assistant` skill's own text (that text tells the model to
run `say.mjs` over Bash — wrong for a headless, tool-free turn; see below), and one **session
resumed per browser tab**, remembered server-side (`Assistant.sessions`, keyed by
`socket.tab.id`) so the caller never has to pass `resume` itself.

**`tools: ""` alone does not make a turn tool-free.** `--tools` only ever governed the
BUILT-IN tool set; `.mcp.json`'s `site` MCP server (`pages`/`eval`/`shot`/`claim`/`release`)
still reaches every headless turn regardless, and the first real proof run against this preset
caught it live: the reply started with a stray "reading the state… " even though `tools: ""`
was set, because the model had opened a `tool_use` block against a `site` tool. The fix —
`--strict-mcp-config` with no `--mcp-config` of its own, which the CLI documents as "only use
MCP servers from `--mcp-config`" and so loads none — confirmed with a scratch run showing
`mcp_servers: []` and `tools: []` in the turn's own `system/init` event. A caller wanting a
genuinely tool-free turn passes both `tools: ""` and `strict_mcp: true`; `Ask.js`'s `args()`
takes the second as its own flag rather than folding it into `tools`, because they answer two
different questions (which built-ins vs. which MCP servers).

**Why a plain module, not a second `Socket` plugin.** `Assistant.js` exports static methods
that `Ask.js` calls directly at the points in `ask()` where a preset applies — nothing in it
listens on the wire itself, so there is no `DevSocket.Socket.use(...)` line to add in
`run.js`, and `Ask.js` stays "one browser message, one turn" with the assistant-specific bits
(the persona, the board writes, the relay) named but not inlined.

**The server does the record-keeping the interactive skill's `say.mjs heard`/`say` would
otherwise do — because this preset has no Bash tool to run them with, and no VS Code tab
watching for them either.** At send time, before the turn even starts, `Assistant.start()`
writes the owner's words and an empty "working" reply card to the shared board
(`public/framework/ai/v/3/board.jsonl`, or `ASSISTANT_BOARD` when a test overrides it) — the
owner's own words land on screen "the instant it is submitted, before any answer," which was
the owner's explicit ask. Chunks are BATCHED into the board (`Assistant.chunk()`/`flush()` —
every ~150ms or 40 characters, whichever comes first) because the board is a file every open
tab tails, and one append per token would be hundreds of writes for one short reply; the
direct `ask_chunk` rpc to the asking tab stays un-batched, so that tab's own box is still as
fast as the model allows. `Assistant.finish()` writes the closing "done" card with the whole
text. `Assistant.relay()` puts the owner's words in the mastermind's inbox by SPAWNING
`say.mjs relay` (reusing its own `run()` — "find the newest unlanded mastermind run" — rather
than reimplementing that search here) unless `ASSISTANT_LEDGER` is set, in which case it
appends the same shape straight to a scratch file instead — the seam a private test server
uses to never touch the owner's real board or the real mastermind's real inbox.

**A closed tab now kills its own streaming turn — scoped to `stream: true` only.** Nothing in
`Ask.js` tied a turn's child process to its socket before this: a browser tab closing mid-turn
left the `claude` process running to a reply nobody would ever see, real tokens spent for
nothing. Killing EVERY turn on tab-close would have changed `chat.js`'s and the dev rail's
existing behaviour too — a tab closed mid-reply there still finishes and files the exchange
into that task's `task.jsonl` today, which is reasonable (the owner may reopen the tab and
expect the answer waiting). Streaming exists only to paint a live tab, so scoping the kill to
`stream: true` turns gets the new behaviour with zero change to the working path. Proven
headless: a turn's `claude.exe` pid was confirmed present during the turn and gone within 1.5s
of `page.close()`.

**The doorbell — can a headless turn ring the mastermind directly?** Tested once, live: a
tiny `-p` turn given only `--tools SendMessage` called it successfully against the real
running mastermind session, and the tool answered `{success:true}`. So the capability is
real — but the shipped preset does not use it, because the server already writes the relay
line at `ask_done` regardless, which is simpler, costs no extra tool call, and does not depend
on the mastermind's session still being the one named at build time.

**The numbers, and the default they picked.** Twelve tiny headless turns (`--effort low`,
n=3 per row; full figures in this task's own log), time from send to the first `text_delta`:
Sonnet/system-prompt/fresh ≈3.3s avg, Haiku/system-prompt/fresh ≈7.1s avg,
Sonnet/persona-as-first-message/fresh ≈3.1s avg, Sonnet/system-prompt/**resumed** ≈3.1s avg.
First-chunk speed does not separate system-prompt injection from first-message injection —
but a FRESH session paid the CLI's own startup cost every time (two of three fresh runs took
17–22s total; every resumed run finished in 4–8.5s), so **one resumed session per tab** is
the real win, not the injection method. Shipped default: Sonnet, the persona as a system
prompt (simpler — the same `--append-system-prompt` call works unchanged whether this is a
tab's first message or its fiftieth), one session resumed per tab.

**Left open, and why.** `readme.md` does not yet mention `stream.js` or the `assistant`
preset — it is outside this task's write fence (only `doc/**` was open), so its "More" list
still reads as it did before this landed; whoever next has `readme.md` open should add one
line pointing here. The dev bar's own composer — the real place an owner would use this — is
a sibling's build (`dev/DevBar/**`, `public/framework/ai/v/**`); this task shipped a demo page
instead: [`/framework/ai/2026-09-19/assistant-stream/`](/framework/ai/2026-09-19/assistant-stream/).
