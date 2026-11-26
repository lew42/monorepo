Budget: $15

# Build the form kit: ux/Form (20 answer blocks, Question, Form, one demo page)

Load the `minion` skill first, then `code`, `page` and `css`. The owner's words and every input: `.scratch/forms/brief-2026-11-25.md` (read it whole; part 2 and 3 are yours) and `.scratch/forms/spec.md` (the 20 types table, sizes). More inputs land in `.scratch/forms/` (`forms.md`, `research.md`, `formlab-src/`; `READY.md` appears when the copy is done): read `formlab-src/js/` as a prototype to learn from (which control per type, the answer JSON), never paste it. The plan, names and homes are decided in `../plan.md`; follow them. The card folder with the owner's raw words: `public/framework/ai/sessions/2026/11/25/cards/forms-kit-sign-in-video-button/`.

## Work in a worktree

Yours is made: `C:\Code\lew42\worktrees\forms-kit` (branch `worktree/forms-kit`, served at `http://forms-kit.localhost/`). Commit by exact path after each working step.

## The scale is in flux: build it swappable (the owner, 2026-11-25, via the cloud chat)

The owner is reworking the −3…+3 look today. Build `Scale7` so the look is an option, not hard-coded:
- `markers: "numbers" | "faces" | "icons" | "bars"` (faces −3 🤮 … 0 😐 … +3 🤩; icons growing with magnitude, mirrored for bad; diverging red/green bars whose height grows roughly exponentially with |value|). Numbers first; the other three can be simple.
- `input: "buttons" | "slider"` (slider = native `<input type=range>` underneath, a big bold readout of the value, one end-label line, optional `step: 0.5`).
- Three distinct states in the value: `null` (not answered), `0` (neutral), and skipped (a "skip" control; store it as the string `"skip"` unless formlab or Figma section 11 says otherwise).
His pick arrives later; keep each option a small seam (a method per marker set) so it is a one-line swap. Do not merge; the mastermind reviews and merges.

## Build, in this order (land stage 1 before starting stage 2)

**Stage 1, the first working page.**
- `ux/Form/Answer.js`: `class Answer extends View` (the framework's View: read `public/framework/core/View/readme.md` first). `value` getter and setter, a `change` event, `static type` ("T09"), `static shape` (a plain description of the stored value, e.g. `"int -3..3"`), `empty()`.
- The 20 blocks in `ux/Form/answers/`, one class per file, names as in `../plan.md`. Each is a native control (radios, checkboxes, `<select>`, `<input type=range|date|time|number|text>`, `<textarea>`), styled lightly, producing exactly the "Answer stored" value of spec.md. The signature is `Scale7` (T09): seven equal buttons −3 … +3 as a radio group, a word in brackets under −3, 0 and +3 (defaults "(awful)", "(average)", "(amazing)", overridable).
- `ux/Form/Question.js`: label, hint, required, holds one Answer.
- `ux/Form/Form.js`: a list of Questions; `layout: "list"` first; `values()` returns `{id: value}`, `load(values)` sets them, and `Form.from(json)` builds a form from a question JSON (shape: `{id, type, label, hint?, required?, options?}`; match Figma section 11 / formlab where they say more).
- `ux/Form/Form.css`, every rule inside `@layer site`. Use the framework's own tokens and the control grammar (`ui/controls/readme.md`: a bare `button`, `select`, `input` already wears it; `.prim` is the accent). No new colour values, no schemes, no `--fig-*`. Selected state = `--prime`. Inputs at least 16 px text (iOS zoom). Tap targets at least 44 px.
- `ux/Form/page.js`: the page at `/framework/ux/Form/`: level 1 is the −3…+3 scale and a short form you can fill; below, all 20 types as cards (type id, question, the live control, the live stored value as JSON, the native element). Phone first; at desktop the cards wrap in a grid.
- `ux/Form/readme.md` (what, Use, Watch out, More; the on-disk structure) and one line in `ux/readme.md`'s index.
- One lean core test per class you add that has logic (`Answer.test.mjs`, `Form.test.mjs`, a couple of answers): read `public/framework/core/Test/readme.md` for how a View class is tested in node.
- Check it: screenshots at 400, 1200, 1920 and 3440 with `mcp__site__shot` or `Server/Shots`, read them yourself; `node Server/smoke.mjs` shows no FAIL. Then log `{"log":{"msg":"stage 1 landed", ...}}` with the worktree url and screenshot paths, and end your turn with that line. The mastermind reports it and replies.

**Stage 2** (after the mastermind's reply): `layout: "stepper"` (one question per screen, sticky Back · Next, a progress line; reuse `ux/Wizard/` if it fits, else log why) and `layout: "quiz"` (big answer buttons, a tap advances); a JSON panel on the page that shows `values()` live and loads a pasted JSON.

## Rules

Never kill or restart the dev server, never drive the owner's tabs, never `git stash`. Vanilla JS, no new npm dependency. `node --check` every file you write. Log findings as `log` lines in this folder's task log, not a findings file. Update the readme your change makes stale in the same commit. If a skill misled you, one line in its `improvements.md`.
