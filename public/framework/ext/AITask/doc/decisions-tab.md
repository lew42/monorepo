# Decisions — every choice, with the alternatives it was chosen over

A worker makes dozens of choices an hour and the owner sees none of them. They
see the result, they say "that's not what I wanted", and nobody can find where
the work turned the wrong way — least of all the *rule* that turned it.

A **decision** is that turn, written down: the question, the options that were
really considered, the one that won, one sentence of reason, and the skill rule
that produced it. The owner presses **Approve** or **Improve** on each. An
Improve is then a defect in that rule, and a CLI carries it back there.

```json ai/2026-09-17/decisions-system/task.jsonl
{"decision": {"id": "option-cards", "at": "2026-09-17T23:25:55-05:00",
  "about": "How does a set of options read as a choice rather than as a paragraph?",
  "options": [
    {"id": "boxes",   "say": "A card per option, each with its own ground",
                      "why": "The set is visibly a choice before a word is read."},
    {"id": "bullets", "say": "A bulleted list, the winner in bold",
                      "why": "Cheaper, and indistinguishable from any other list."}],
  "chose": "boxes",
  "because": "The owner's own rule: options get a box each, so the set reads as a choice.",
  "rule": "layout#boxes-padding-and-contrast",
  "status": "open"}}
```

The verb, field by field: [`ext/JSONL`](/framework/ext/JSONL/doc/task-jsonl/).

## The tab

A task page grows a **Decisions** tab whenever its log carries any — after
Requirements, before Report, so the page reads in the order the work happened:
what was wanted, the brief, what was chosen, the answer. It never opens by
default; the answer and the asks still outrank it.

**Level 1 is a list, not a wall.** One row per decision — the question, the
option that won, and a status mark. A question is a sentence, and a 17em card
would wrap it four times; a dozen rows fit one screen, which is the point.

**Level 2 opens in place**, under that row: every option as a card with its own
ground (the [`ui/decision`](/framework/ui/decision/) template), the chosen one
marked, the reason under them, the rule, and the two buttons.

## Approve and Improve write to the task's own log

A press appends a `verdict` line to **that task's `task.jsonl`**, through the
dev socket's `rpc:append` — the seam `/layouts/browse/` set, and for the same
reasons:

- **The writer does not apply its own line.** It comes back off the wire like
  everybody else's, so there is one code path and the server is the only
  orderer. `expect()` is the safety net: if no frame carrying the line has
  arrived in two seconds it applies locally and says so in the console, because
  a press that visibly did nothing is the worst failure a page like this has.
- **Append-only, so a verdict is never an edit.** A decision you want to answer
  differently is answered by a *later* verdict; the newest wins and the whole
  history stays in the file.
- **No second file.** The task log already is the record for that task.
- **Off the dev server the buttons are not drawn at all** — the static site
  still shows every decision and every verdict, read-only.

Measured on this module's own task page at 1280: Approve moved the row from
`open` to `APPROVED` and the head from *7 waiting on you* to *1 approved · 0 to
improve · 6 waiting*, with no reload; Improve took a one-line note the same way.

⚠ **A tab's panel is not built until it is first selected**, so the live-update
callback has to be guarded per panel. Before this tab existed, that callback
read `this.$live && this.refresh(t)` — on a task that opens on **Asks**, the
Report panel does not exist yet, so *nothing streamed at all*. `streamed(m)` is
the seam now, and every panel checks itself.

## Why the filing is a CLI

The browser cannot write to `.claude/`. `rpc:append` resolves every path under
`public/` and refuses everything else, deliberately — widening a dev-server
writer is how this server's one RCE happened. So the press writes where the
browser is allowed to write, and

```bash
node public/framework/ext/AITask/decisions.mjs list
node public/framework/ext/AITask/decisions.mjs file
```

runs at harvest, where the writer already has the filesystem. `file` walks every
task log, takes each unfiled improve whose decision names a rule, and writes one
dated line into that skill's own `improvements.md`:

```
- 2026-09-17 · layout#spacing · the owner said: two rungs, not five · decision 2026-09-17/spacing-census/spacing-ladder
```

then appends `{"verdict": {"id": …, "filed": "<date>"}}` back to the log, which
merges by id — so the same note can never be filed twice. `--dry` says what it
would write and writes nothing; `--root` and `--skills` point it at other trees,
which is how its write path is tested without touching a real skill.

**The mastermind runs it at harvest.** That is the whole loop: a rule produces a
decision, the decision produces an outcome, the owner judges the outcome, and the
judgement lands back on the rule.

⚠ Two things `file` deliberately leaves alone. **A decision with no `rule`** —
not every choice comes from a skill, and a note with nowhere to go is not a
defect in anything. And **an Improve a later verdict replaced**: only the newest
verdict on a decision counts, or a complaint the owner withdrew would still end
up in a skill.

## What is deliberately small

- **The rule is a chip, not a link.** Skills live in `.claude/skills/`, outside
  `public/`, and nothing serves them — a link would 404, and the Asks tab
  already found that a pill going nowhere is worse than no pill. The chip
  carries the real path in its `title`, ready to paste into an editor. A
  dev-only route that served skill files would make it a real link and is the
  owner's call, not a minion's; it is written down as an open decision on this
  module's own task page.
- **`say` and `why` are plain text.** No markdown pass, the same rule
  `ui.table()` follows — a backtick in an option prints as itself.
- **Redrawing closes nothing.** The open row and the half-typed note live on the
  page (`AITask.decision_state`), not in the module, so a verdict arriving over
  the socket redraws the whole tab without shutting what the reader had open.
- **Nothing derives a decision.** The Asks tab guesses at decisions with a
  keyword filter over log prose, and that guess is exactly what this replaces —
  a decision exists because a worker wrote one.
