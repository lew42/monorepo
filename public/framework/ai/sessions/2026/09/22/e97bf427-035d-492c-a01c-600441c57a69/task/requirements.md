# naming-checks — the naming rules live in the appender, so no agent can bypass them

Minion: Sonnet, effort high. Session id `e97bf427-035d-492c-a01c-600441c57a69`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then section **D**'s
naming paragraph in [`../mastermind-servex/requirements.md`](../mastermind-servex/requirements.md)
("Naming rules are hard requirements…"), then [`../log-model/events.md`](../log-model/events.md)
— especially "The naming rules, as checks the appender runs" and the `name / rename / approve /
dispute` types — and [`../log-model/fold/`](../log-model/fold/) (the fold that runs in the
browser). Load the `code` skill.

## What exists

Servex is RUNNING (`node Servex/sustain.mjs --status`). `Servex/Log.js` is the single writer:
`append(name, entry)` stamps `at`, one open stream per file, a queue; `POST /log/<name>` is the
door (CORS on). Every agent event, every dictated `prompt`, and Servex's own events go through
it. Today it checks nothing about content.

## Deliverables

1. **The checks, in `Log.append`.** For entries whose `type` is `name`, `rename`, `approve` or
   `dispute` (the shapes in `events.md`): a `rename` of a name that has been `seen` (an entry
   with `seen: true`, or any `card` that carried it — read the schema's definition and use it)
   from anyone but `by: "owner"` is **not written as a rename** — it is rewritten as a
   `dispute` referencing the visible name, and the caller gets `{ok: true, became: "dispute"}`;
   an `approve` from anyone but the owner is refused (`{ok: false, why}`); a `rename` of an
   approved (locked) name from anyone including the owner is refused with the lock named; a
   first `name` for a thing is always accepted. The appender needs to know the current fold of
   names per log to decide — keep a small in-memory index per log file (`names: Map<id, {name,
   seen, locked}>`), built from the file on first open and updated on every append; ~60 lines.
   `POST /log/<name>` returns the appender's answer as JSON with the right status (200 for
   written-or-became, 409 for refused).
2. **The proof — `Servex/proof-naming.mjs`** (runnable by anyone, against a throwaway log
   name): the fast assistant names a thing → written; a mastermind renames it before it is
   seen → written as a rename; the card shows it (`seen`) → a mastermind renames again →
   becomes a dispute, the visible name unchanged; the owner renames → written; the owner
   approves → locked; the owner renames the locked one → refused with the lock named. Six
   lines of output, each `PASS`, and the tail of the log after. Log the six results.
3. **The fold agrees.** Run log-model's `fold.js` (copy it into the proof or import it from
   its page dir) over the proof log and show the folded name at each step equals what the
   appender said was visible. Two numbers that must agree: the appender's `names` index and the
   fold's result, for every step.
4. **`Servex/readme.md`** — the "single writer" section gets four lines: the appender checks
   names; what becomes a dispute; what is refused; who may approve.

## Fence

`Servex/Log.js`, `Servex/Servex.js` (Edit only, the `/log` route's response), `Servex/readme.md`,
`Servex/proof-naming.mjs`, your task dir. Append-only to `.jsonl`. Restart Servex after the
edit: `node Servex/sustain.mjs --stop`, then the hidden launch (`powershell -NoProfile -Command
"Start-Process -FilePath node -ArgumentList 'Servex/sustain.mjs' -WorkingDirectory
'C:\Code\lew42\monorepo' -WindowStyle Hidden"`), confirm 8090, log the PIDs. Never `cmd /c
start`. Not `Servex/agents/`, not `public/`.

## Length

Checks under 80 lines. Landing report: six sentences with the six PASS lines summarised.
