# page.jsonl's size — what watches it, and what doesn't yet

`page.jsonl` is a page's source of truth. Line 1 builds the page (title, icon, description,
layout); every line after that calls one method on it — a file appearing under the page, a
child page getting linked, a piece of content getting placed. The format itself, line by
line, is [`doc/jsonl.md`](/framework/core/Page/doc/jsonl/) — this page is only about how big
these files get, and what to do about it.

## What exists today: a report, not a gate

`node Server/page-size.mjs` lists every `page.jsonl` under `public/` bigger than 100 KB,
largest first, with its line count. Nothing is purged automatically — it only prints a
table, so you can see the problem before deciding what to do about it.

```
node Server/page-size.mjs                  # default: 100 KB, this repo
node Server/page-size.mjs --kb 50          # a different threshold
node Server/page-size.mjs --root <repo>    # a worktree, or the main tree
node Server/page-size.mjs --json           # machine-readable
```

It always exits 0, even when nothing is over the threshold — it is a thing to read, never a
check that can fail a build.

## The numbers (main tree, 2026-09-29)

484 `page.jsonl` files exist under `public/`. Only one is over 100 KB:

| file | size | lines |
|---|---|---|
| `ai/2026/09/24/prompt-mechanics-2/chat-as-right-hand-column/page.jsonl` | 252 KB | 21 |

21 lines holding 252 KB means the lines themselves are huge (a chat log, not a page's
structure) — the file that needs a purge plan is the exception here, not the rule. Most of
the other 483 files are a handful of small lines each.

## The friction this size problem is already causing

The live dev server appends a `file` line to a folder's `page.jsonl` the moment a file
appears or disappears in that folder (`Server/plugins/PageFiles.js`, documented in
[`doc/jsonl.md`](/framework/core/Page/doc/jsonl/)). On a shared worktree, that write can land
between an agent's own edits and its commit — so `git add` sweeps in a `page.jsonl` line
nobody meant to commit, written by the live server for someone else's file. Four tasks hit
this on 2026-09-29 alone (`decide-tool`, `task-loop`, `chip-context-fix`,
`layout-explorer`), and the current workaround — "commit only by exact path" — is a rule
agents have to remember every time, not a fix.

## A purge proposal (not built yet)

When a `page.jsonl` passes some size N (the same threshold `page-size.mjs` reports on, say
100 KB), fold its old lines into one snapshot line — `{"snapshot": …}`, the page's state as
of that fold, the same shape `set()` would reach by replaying every line before it — and
move the raw lines it replaced into `page.<date>.jsonl` beside it. The live file goes back
to small and fast to read; the full history still sits on disk, one file away, for whoever
needs to see how a page actually got there.

**The trade-off:** reading the live page gets fast again (one snapshot line instead of
hundreds), but reading the *history* now means opening a second file instead of scrolling
one. That is the right trade for a page that is read constantly and rewritten rarely, which
is every page except one used as a running log (a chat, a visit log) — those may want a
different rule, or no purge at all, since their whole point is the log.

This is a proposal, not a decision: nobody has picked the threshold, chosen who runs the
fold (a script, a landing hook, the dev server itself), or decided whether a log-shaped page
(the CMS visit-log kind noted above) should be exempt.
