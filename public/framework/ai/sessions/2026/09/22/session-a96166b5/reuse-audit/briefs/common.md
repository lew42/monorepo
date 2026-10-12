# Common to every reuse-audit cluster brief

You are reading one cluster of modules and reporting what is in them, so a parent task can find
the features this site has written twice. Read your own numbered brief beside this file for your
module list.

## What you are looking for

The owner's question is **"have we rewritten things instead of reusing them?"** They named the
kinds of thing they suspect: drag and drop, resize handles, UI cards, CSS that restates what
`framework/styles/framework.css` already gives you. So for each module you are given, you answer
two things: what is this, and which of these features does it implement *itself* rather than
importing from somewhere else.

**The feature list** — use these exact words so the parent task can group your answers:

`drag` · `resize-handle` · `card` · `panel` · `tabs` · `popover` · `dropdown` · `editor` ·
`persistence` · `jsonl` · `tree` · `filter` · `toolbar` · `rail` · `stage` · `grid` ·
`css-utility` · `markdown` · `search` · `timeline` · `wizard`

A module **implements** a feature when its own code does the work — a `pointerdown` handler that
moves something is `drag`, a `pointermove` that changes a width is `resize-handle`, a `.card`
class with its own padding and border is `card`. A module **imports** a feature when it gets it
from `ext/`, `ux/`, `core/` or `ui/`. Only implementations matter. Say the `file:line` of each.

## What you write back

**Nothing to a file of your own. No `findings.md`.** You append your paragraphs as `log` lines to
the parent's log:

`public/framework/ai/2026-09-22/reuse-audit/task.jsonl`

Append with the helper, never by hand:

```
node .claude/hooks/append.mjs public/framework/ai/2026-09-22/reuse-audit/task.jsonl <your-lines.json>
```

Write `<your-lines.json>` into your **session scratchpad** with the Write tool (never a heredoc —
a heredoc eats a backslash layer and silently corrupts the line). It is a JSON array; every
`"NOW"` string becomes the real clock. One object per module:

```json
{"log": {"at": "NOW", "msg": "[C3] framework/ext/Draggable - WHAT IT IS: one plain sentence a new coder understands. WHAT IT DOES: two or three sentences. IMPLEMENTS: drag (Draggable.js:34 pointer capture, ghost, placeholder) - resize-handle (none) - card (none). IMPORTS: nothing. README: fresh | stale, rewritten | missing, written. NOTE: anything that looked like a copy of code you saw somewhere else."}}
```

`[C<n>]` is your cluster number, first thing in every `msg`. The parent groups on it.

⚠ **The parent's log is append-only and several minions write to it at once.** Only ever append,
one batch, at the end of your run. Never open it for writing, never rewrite it, never use the
Write tool on it.

## The readme job

For each module you are given, check its `readme.md`:

- **Missing** → write one, if the module is real code someone would need to find their way into.
  A directory of demo pages with no shared code does not need one; say "not needed" instead.
- **Stale** → it names files that no longer exist, or describes a shape the code no longer has.
  Rewrite it.
- **Fresh** → leave it completely alone.

**The readme shape** — four parts, as short as they can be. A readme *points*; it does not
explain. The detail lives in `doc/*.md` beside the module and gets a link.

```markdown
# <module name>

<One or two plain sentences: what this is, for a reader who has never seen it.>

## Use

<The one call or import that gets you started, in a fenced block. Nothing more.>

## Watch out

<Only real traps that have actually bitten. One line each, with the file. Omit if none.>

## More

- [<doc page>](doc/<name>.md) — <what is in it>
- [<sub-dir page>](<dir>/) — <one line: what that page shows>
```

**The sub-dir line is the part people forget.** If your module has sub-directories that are pages
(a `page.js` inside), the parent readme gets one line per sub-dir under `## More`, saying what
that page shows. That is the owner's own ask.

## Rules you must not break

- **You may write `readme.md` files, and nothing else.** No `.js`, no `.css`, no `page.js`, no
  new files, no deletions. If a readme is wrong because the code is wrong, say so in your log line.
- **Readmes are live files.** Take the reload hold before your batch of readme writes and release
  it after: `node Server/hold.mjs on "reuse-<n> — readmes"` … `node Server/hold.mjs off "reuse-<n>"`.
- **Never touch the dev server**, never `git stash` / `checkout --` / `reset` / commit / push,
  never run `find /`.
- Markdown only — you write no JS, so there is no `node --check` to run.
- Read files; do not guess from names. A module named `stage` can be a content renderer.

## How long

You have about 15 minutes. Read every module in your list — skim the big ones (read the class
declarations, the constructor, and grep for `pointerdown` / `.card` / `localStorage` / `@layer`
rather than reading 5,000 lines end to end). Append your batch. Land. No page, no screenshot,
no `finish-task` — the parent lands this task.
