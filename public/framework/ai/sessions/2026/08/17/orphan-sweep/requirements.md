# RULE#13 sweep — every page that nothing links to

**Nothing crawls the filesystem.** A `page.js` that no parent declares in
`children:` does not exist to a reader, however good it is. We know of at least
one: `audit/pages.js` never added `/framework/audit/browsable/`, a page that
shipped yesterday. **Find all of them.** This is a wide mechanical inventory —
exactly your job — and it needs no judgment, only care.

## What to produce

For every `page.js` under `public/framework/`, decide: **is it named in some
parent's `children:`?**

- `children` may be a **space-separated string** (`children: "intro guide"`), an
  **array of names**, an array of `[title, {…}]` **inline-object children**, or a
  mix. Read `public/framework/core/Page/Page.class.js` and its `readme.md` for
  the real shape before you start counting — do not guess it.
- A directory child is declared by its **directory name**, not its file path.
- An inline object child has no `page.js` at all, so it can never be orphaned —
  don't report those.

Report three lists:

1. **Orphans** — a `page.js` exists, no parent declares it. The real finding.
2. **Dangling declarations** — a parent declares a name with **no** `page.js`
   behind it. These 404 when clicked. (The `layout-design` skill records this
   trap, so expect a few.)
3. **Sandbox exempt** — anything under the personal dirs (`alex/`, `arya/`,
   `castin/`, `edric/`, `michael/`) and under `core/new/`, `core/legacy/`. List
   them separately and do not count them as findings; they are transient by
   design.

## Accuracy is the whole deliverable

A previous scout on this codebase reported five line-number citations and **all
five were wrong, every one leaning the same direction.** Consistency across
items is the tell that one mistake was made five times. So:

- **Cite file and line for every claim**, and re-open the file to confirm the
  line before you write it down.
- For each orphan, name **which parent should have declared it** (its directory's
  parent) and quote that parent's current `children:` line verbatim.
- Give a **count** at the end: N page.js total, N declared, N orphaned, N
  dangling, N exempt. The numbers must add up. If they don't, say so rather than
  fudging them.

## Do not fix anything except this one line

`public/framework/audit/pages.js` is missing `/framework/audit/browsable/` —
**add it**, matching the surrounding style exactly, and verify the page loads
after. That single edit is authorised.

**Every other orphan you find: report only, do not fix.** Some are deliberate
(`/framework/start/example/` is an orphan on purpose, explained in a doc
comment) and deciding which is which is not this task.

## Files you own

- `public/framework/audit/pages.js` — the one authorised edit.
- `public/framework/ai/2026-08-17/orphan-sweep/**` — your task dir.
- `public/framework/ai/usage.json` and `public/framework/ai/2026-08-17/day.jsonl`
  — the `new-task` skill's own writes, permitted.

**Read-only everywhere else.** Two other agents are working: one owns
`styles/layouts/space/**`, another session owns `ext/Panel/**`. Do not edit in
either, and do not measure anything under them — a repo being edited gives false
readings.

## Deliverables, in this order

1. **The three lists and the count, as `log` lines in your own `task.jsonl`.**
   Not a `findings.md` — the harness blocks subagents writing report files.
2. The `audit/pages.js` one-line fix, verified loading.

If you run short, cut the dangling-declaration list first; the orphan list and
its count are what matters.

## Working notes

- **Foreground is the default.** Don't background a command and then wait on it;
  if you must, poll: `while (-not (Test-Path out.json)) { Start-Sleep 15 }`
- Import paths here are real URLs — root-absolute or relative with an explicit
  `.js`. No bare specifiers.
- Check usage before wide work.
