# Part 2: the Dictate playground as a full-bleed, live system diagram

You are a Sonnet minion. Load the `minion` skill, then the `layout` skill (you're building a
whole-page layout) before you touch CSS. Your parent is task-mastermind-inspect; its task dir is
[public/framework/ai/2026-10-01/inspect/](../) — read `owner-words.md` and `requirements.md`
there first. **Do not start until Part 1 has landed** (`minion-part1/`, in the same worktree) —
you need its `inspect()` + `static icon` to do this job; check with your parent if unsure.

**Work in the worktree already up:** `C:\Code\lew42\worktrees\inspect` (proxy
`http://inspect.localhost/`, branch `worktree/inspect`). Part 1 is already committed there when
you start — pull/rebase is not needed, you're in the same checkout.

## Why (the owner's own words, trimmed — full text in `../owner-words.md`)

"For the dictate tab... what I want this minion to do... is, is, uh, well, it can do both of these
things. It can create the [inspect] class... and as a test case, we can use it to build out the
dictate work... playground... All of the things that the dictate is creating, all the data
structures, we want those to be object oriented so that we can give them an icon... we want to see
everything that's going on visually so that like it's a system diagram and it's real time... on
desktop, we have a lot of space... we probably want to use like a full bleed tab for the playground
so that we have as much space... some sort of 2D layout system."

## What exists today — read these two files in full first

- `/framework/ux/Dictate/playground/Playground.js` (634 lines) — the pipeline. Read it end to
  end before changing anything; it's dense but short. Today's state is almost entirely **plain
  objects and arrays**, exactly what the owner wants turned into real classes:
  - `this.chunks` — `[{raw, gap, cut, cleaned, deltas, source_kind, model, ms, level, session}]`,
    one per settled sentence, pushed in `settle()`, filled in by `clean_chunk()`.
  - `this.resends` — `[{t, segment, text, since_prev}]`, one per Whisper resend, pushed in
    `guess()`.
  - `this.partial` (string, the live still-moving guess), `this.cleaned_so_far` (string).
  - Six tabs already exist (`TABS` const): Clean, Raw, Chunks, Corrections (debug), Live (debug),
    Side by side — each just shows/hides a pre-built panel, nothing re-renders per tab.
- `/framework/ux/Dictate/playground/page.js` and `Playground.css` — the one page that mounts this,
  and its current look (`max-width: 60em`, a tab strip, code-font panels).

Also skim `/framework/ux/Dictate/readme.md`'s "Widget" section (just to know the mic/chat widget
this diagram sits NEXT TO — you are not changing it) and
`/framework/ai/2026-09-30/one-dictation/checklist-2026-10-01.md` (the sibling task owning that
widget's own bugs — not your fence, don't touch `Widget.js` or `ext/Chat/`).

## Deliverables

1. **Real classes instead of plain objects.** In a new file,
   `/framework/ux/Dictate/playground/objects.js`:
   - `Chunk` — one settled sentence: `raw`, `cleaned`, `deltas`, `source_kind`, `model`, `ms`,
     `level`, `gap`, `cut`, `session`. `static icon = "..."` (pick one that reads as "a settled
     line of text" — check `/framework/ui/icon/` or Google's Material Symbols names).
   - `Resend` — one Whisper resend: `t`, `segment`, `text`, `since_prev`. `static icon`.
   - `Analysis` — the "coming phase" the owner named (prompt analysis / investigation /
     planning) — **a stub class only**: a few placeholder fields (`status: "not built yet"`) and
     its own icon, so it exists as a real, inspectable thing in the diagram even though nothing
     fills it in yet. Say this plainly in its own doc comment — don't pretend it does more than
     it does.
   - `Source` — the audio/mic state panel already drawn by `audio_panel()`/`meter()`: which
     device, the live level number. `static icon`.
   - `Session` — one dictation session: owns `chunks: [Chunk]`, `resends: [Resend]`, `source:
     Source`, `analysis: Analysis`, `partial` (string). This is `Playground`'s own per-session
     state (`reset()`'s block), pulled out into its own class so the WHOLE session is one
     inspectable object, not scattered fields on `Playground` itself.
   Change `Playground.js` to build and hold a `Session` instance (`this.current =
   new Session()`), push real `Chunk`/`Resend` instances instead of plain object literals, and
   read/write through it. **Every existing behavior must keep working exactly as before** — this
   is a representation change, not a feature change: the six tabs, the diff, the Side view, the
   Sample button, all of it. Prove this with the existing walkthrough
   (`/framework/ux/Dictate/playground/walkthrough/`) if it has a scripted check, or manually run
   ▶ Sample and confirm all six tabs still show the same content as before your change.

2. **`static icon` + `inspect()` on all five**, from Part 1
   (`/framework/ux/Content/Object/Inspect.js` — `import { inspect } from
   "/framework/ux/Content/Object/Inspect.js"`). Don't reinvent any card look; use what Part 1
   built.

3. **A live structure panel**: one place on the page showing `inspect(session)` — the WHOLE
   session as one nested card/tree (Session → its Chunks, Resends, Source, Analysis), updating
   as new chunks/resends arrive. This is the "visual rendering of the hierarchy" the owner asked
   for, and it's what makes Part 1 worth having built: if this panel doesn't visibly change while
   you talk (or press ▶ Sample), the deliverable isn't done. You will likely need the simplest
   working re-render (re-call `inspect(session)` into the same box after each `settle()`/`guess()`)
   — don't over-engineer a diffing update for a first version; note the cost as a caveat if it's
   worth a fancier approach later.

4. **Full-bleed, 2D desktop layout.** Run the `layout` skill's three sizing questions before
   picking anything. The page (`playground/page.js`) becomes a full page: `classes: "full"` (see
   `/framework/core/Page/doc/property/classes.md` — the default `"standard"` page is a measured
   column; `"full"` takes the whole screen). Check `/framework/core/Layout/` (30 named
   arrangements, proven at seven widths) for one that already fits "several columns side by side,
   one wider structure panel" before hand-rolling CSS grid — reuse one if it fits (law 6), note in
   your log if none does and why.
   - **Columns, left to right, roughly:** Source (mic/level) → Raw → Clean → Analysis (stub) →
     the live Structure panel (deliverable 3). This can be the six EXISTING panels re-arranged as
     always-visible columns instead of tab-switched, at ≥1200 or so — your call, from the `layout`
     skill's own sizing question about breakpoints — PLUS the new Structure column.
   - **On mobile, keep today's tab strip** — the owner said so explicitly ("a stack with tabs is
     fine"). Don't delete `TABS`/`select_tab()`; gate the two layouts with a media query or a
     container query, whichever `layout`/`css` skills say this codebase prefers for a page-level
     switch.
   - **Chat column — do NOT build one.** The owner listed "chat messages, replies and reactions"
     as part of the system, but that widget is `@task-mastermind-one-dictation`'s (fixing its
     bugs right now) and the brief says explicitly: "Part 2 builds the diagram around their
     widget, not a second widget." Leave a clearly-labelled placeholder column ("chat — see the
     widget above/beside this page") rather than mounting a second `chat()` call. Log this as a
     `decision` in your task.jsonl: scope cut, alternative named (a future pass reads
     `ext/Chat`'s thread file read-only and shows it as `inspect()` cards here), why (avoid a
     second live chat composer on one page).

5. **Immutable, never-reorders.** Verify (don't just assume) that converting to classes didn't
   change today's actual behavior: the Raw column's lines are never removed or edited once
   drawn; the Clean column updates a chunk's own line in place (raw → cleaned) without touching
   the Raw column at all; nothing ever reorders. If you find a spot where today's code already
   violates this (the brief's Rules section flags "jumpy" as an existing owner complaint), you may
   fix it, but say so as a named `decision`, don't rewrite the pipeline wholesale.

## Fence (yours only — nothing outside this list)

- `public/framework/ux/Dictate/playground/objects.js` (new)
- `public/framework/ux/Dictate/playground/Playground.js`
- `public/framework/ux/Dictate/playground/Playground.css`
- `public/framework/ux/Dictate/playground/page.js`
- `public/framework/ux/Dictate/playground/readme.md`

Do not touch `ux/Dictate/Widget.js`, `ux/Dictate/Dictate.js`, `ux/Dictate/chat.js`, or anything
under `ext/Chat/` — all owned by @task-mastermind-one-dictation, live right now. If you think you
need one of them, stop and message your parent (task-mastermind-inspect) first.

## Prove it, don't just build it

- Screenshots at **1920** and **3440** of `http://inspect.localhost/framework/ux/Dictate/playground/`
  — the full-bleed desktop layout, mid-session (press ▶ Sample first, screenshot after it
  finishes so the columns have real content, not empty-state text).
- A screenshot at **400** showing the mobile tab fallback still works.
- One screenshot of the Structure panel BEFORE and AFTER pressing ▶ Sample, proving it actually
  updates live, not just once at page load.
- `node Server/merge.mjs <worktree> /framework/ux/Dictate/playground/` — zero console errors,
  zero failed requests, before you tell your parent you're done.

## Land

Own task dir: `public/framework/ai/2026-10-01/inspect/minion-part2/` — open with `new-task`
before your first edit (parent_task: `public/framework/ai/2026-10-01/inspect`). When done, message
task-mastermind-inspect directly with your task dir path.
