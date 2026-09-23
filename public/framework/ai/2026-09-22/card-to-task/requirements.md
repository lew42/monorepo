# card-to-task — a card you spoke becomes a task, a mastermind takes it, and the card shows it happening

Minion: Sonnet, effort high (budget mode — no Opus anywhere in this task; the task-mastermind
it spawns is Sonnet too). Session id `df2f3e2e-a6e1-4d51-9318-a4b15d376e31`. You are IN A
WORKTREE (the launcher says where; your server's port). Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then
`Servex/agents/readme.md`, `roles.js`, `Agents.js` (`wake_parent`, the registry),
`Assistant.js` + `assistant.md` (the fast assistant), `ai/2026-09-22/sub-mastermind-live/`
(a task mastermind spawning minions, proven), `ai/2026-09-22/log-model/events.md` (`task`,
`proposal`, `decision` types). Load `code`, `ui-test`. `Servex/node_modules` is not carried
into a worktree: run `npm install` in your worktree's `Servex/` first, and test against YOUR
Servex on private ports (`SERVEX_HOME` + `PORT`/proxy env — read `Servex/readme.md`; never the
live 8090/8080).

## The owner's words (2026-09-22 18:57, verbatim)

> top priority for this whole system is to get the transcription user interface — the dashboard
> — working with a fast assistant, where as I transcribe I can not only see it on my screen but
> it also gets turned into a card, a task, and maybe a mastermind takes it and runs with it and
> lets me know in a visual way that you're working on it. We don't have that yet.

## What exists — the loop is three-quarters built

Speak → `prompt` line (Dictate, `talk`) → the fast assistant appends `name` + `card` +
`refined` within ~2 s → the card is on AI 2 / the Prompts view, evolving in place. What is
missing: **nothing takes the card and runs with it**, and nothing on the card says so.

## Deliverables

1. **The assistant marks work.** In `assistant.md`: when a sentence asks for something to be
   built, fixed, changed or looked into (not a question, not a remark), the card it appends
   carries `route: "task"` and a `task` line follows (`{type: "task", id: "t-<card id>",
   re: <card id>, title, brief: <two sentences in the owner's own words>, state: "queued"}`).
   A remark or question gets `route: "note"` / `"question"` and no task line.
2. **Servex dispatches.** A new `Servex/agents/Dispatcher.js` watches the `prompts` log for
   `task` lines with `state: "queued"` (the same emit seam `Stream.js` uses) and, for each,
   spawns a `task-mastermind` agent (**Sonnet, effort medium** — override the role default,
   `decision` line) whose prompt is the task's `brief` plus the standard opening ("you own
   this task; open `ai/<date>/<slug>/` with `new-task`; a worktree if you edit site files;
   land with `finish-task`; post your progress as a `task` line with the same id and `state:
   working | blocked | landed` plus a one-line `now`"), with `parent: "dispatcher"`, `topics`
   from the names on the card, `page` = the card's link. At most **two** task masterminds at
   once; the rest wait `queued`. `wake_parent` messages (done/blocked) become `task` lines with
   the matching state. `Dispatcher` is registered in `Servex.js` like `Assistant` (Edit).
3. **The card shows it.** On AI 2 (its `inbox.js` fold — Edit only, `ai2-master-detail` is
   mid-reshape: re-read before each edit, and keep to the fold function) and on `talk`: a card
   with a `task` line shows a status strip: `queued` (grey) → `working` (pulsing dot + the
   mastermind's `now` line, live) → `landed` (green, with the task page link) / `blocked`
   (amber, the reason). The dark session card, if `ai2-master-detail` has landed it, is the
   detail for the mastermind; otherwise the strip links to the task page.
4. **Proof, end to end, headless on your ports:** POST one owner sentence that asks for a
   tiny build ("make a page at /framework/ai/2026-09-22/card-to-task/proof/ that says hello
   and the time") to your Servex's `/log/prompts`; within ~3 s the card and a `task` line
   exist; the Dispatcher spawns a Sonnet task mastermind (registry shows it with parent
   `dispatcher`); the card's strip turns `working` with a `now` line; the mastermind lands the
   page (it exists on your server) and the strip turns `landed` with the link — log the wall
   time from sentence to `landed` and the cost from the `result` events. Then a second
   sentence that is a remark ("that looks fine") gets a card and NO task. Screenshots of the
   card in each state. Zero console errors.

## Fence

`Servex/agents/Dispatcher.js` (new), `Servex/agents/assistant.md`, `Servex/agents/readme.md`,
`Servex/Servex.js` (one registration, Edit), `public/framework/ai2/inbox.js` and
`public/framework/ai/talk/**` (the status strip only, Edit), your task dir. Land by the
launcher's patch (`--3way`), hold `--paths` on the exact files, seconds; then restart the LIVE
Servex hidden (`node Servex/sustain.mjs --stop`, PowerShell `Start-Process -FilePath node
-ArgumentList 'Servex/sustain.mjs' -WorkingDirectory 'C:\Code\lew42\monorepo' -WindowStyle
Hidden`) and confirm `assistant-fast` and the dispatcher are in `GET /agents`.

## Length

Dispatcher under 120 lines. Landing report: five sentences with the sentence-to-landed time
and cost.
