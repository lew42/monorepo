# Proof — roles minion (recursive-pairs)

Code lives in the worktree (`C:\Code\lew42\worktrees\recursive-pairs`), never committed to this
monorepo checkout. This file is the log. Unit tests: `node Servex/agents/policy.test.mjs` and
`node Servex/agents/global.test.mjs`, from the worktree root. Live proof: `node
public/framework/ai/2026-09-25/recursive-pairs/roles/proof.mjs`, output at `proof.txt` beside it
— **17.5 seconds, about $0.29** (three tiny Sonnet-low agents), on a private Servex, port 8390,
`SERVEX_LAYERS_FILE` pointed at a scratch file (never the live `layers.json`).

## 1. "One skill per role, scoped by directory" (D2)

`roles.js` gains `page-assistant` and `page-mastermind` as the canonical role words; `master-assistant`,
`manager` and `card-assistant` keep working as **aliases** of them (`canonical()` now takes an
array of aliases, not just one string — checked with a small script, all nine old and new words
resolve to the right row and the right defaults). The merged text — `every-prompt` plus the old
`card-assistant.md` — is `.claude/skills/every-prompt/page-assistant.md` (new file). **The one
line `SKILL.md` should gain** (not applied — the main tree has uncommitted edits to that file, per
the brief): under "Load this if…",
`- **you are a page's own assistant** (spawned for a card or any page, not the front-desk tab): [\`page-assistant.md\`](page-assistant.md)`.
`Servex/agents/card-assistant.md` — the exact path `Layers.js` still reads with `fs.readFileSync`
— carries the same merged content directly (a system-prompt `.md` has no `import`, and a card
assistant has no file-read tool to follow a pointer, so "keep the path working" means keeping the
text there). Doc: `Servex/agents/doc/page-roles.md`.

## 2. "Each agent hears only its role" (D3)

`Global.js`'s `heard()` no longer forwards a fresh card prompt at all (every page now has its own
assistant hearing its own — Layers.js). It forwards a `landed`/`blocked`/`error` message only when
`direct_child(m.by)` is true — the reporting agent's own `.parent` is `dispatcher`,
`mastermind-servex`, or `master-assistant`. `global.test.mjs`: 48 checks, including "fresh card
prompts are no longer forwarded", "a non-child's landing is not forwarded", "kinds outside
landed/blocked/error are never forwarded", and "a direct child's landing reaches the root, from
servex". Left open, and why: "the owner's page-less prompts" is a different, already-existing
channel (`Assistant.js`'s `assistant-fast` lobby), outside this fence — `doc/page-roles.md` says so.

## 3. "Parent and child talk both ways" (D4)

`policy.test.mjs`: a `task-mastermind-child` messaging its `task-mastermind` parent, and back,
both read `rule: "tree"` (the existing rule already covered it; only the proof was missing).
`mastermind-servex-N` now counts as the mastermind: `policy.kind()` matches
`/^(mastermind-servex|servex-mastermind)(-\d+)?$/`. **Live, both directions, proof.txt:**

```
[   4.8s] PASS child -> parent delivered (task-mastermind-* to its own parent, the TREE rule)
[   6.3s] PASS parent -> child delivered (the reverse direction)
[   7.8s] PASS spawned with the exact id the bug report named: mastermind-servex-3
[  11.9s] PASS task-mastermind-proof-parent -> mastermind-servex-3 delivered (was refused before this fix)
[  11.9s] PASS nothing new landed in the policy refusal log for that message
```

Siblings still cannot talk directly (the table has no manager-to-manager or
page-mastermind-to-page-mastermind rule) — a shared file (a claim, or a card both can read) is
their channel, same as before; noted in `doc/page-roles.md`.

**Addition mid-task**, relayed from task-mastermind-recursive-pairs (the inbox minion's D8
landing): a registered external id (a VS Code tab) was bucketed as an ordinary "worker", so a
card's assistant, its manager, the master assistant or a task-mastermind could not message it
first. `policy.kind()` now reads the registry (`agents.reg().read()[id].kind === "external"`) for
any id none of the fixed prefixes already claimed; `message()` lets ANY agent message an external
id unconditionally, and an external id messaging OUT is treated exactly like the owner;
`spawn()` the same. `policy.test.mjs`: 6 new checks, including that an *unregistered* id is still
an ordinary stranger — external is a registry lookup, never a shape guess.

## 4. "Assistants make safe quick edits" (D5, the rules)

Written into `page-assistant.md` (and the card-scoped version in `card-assistant.md`): five steps,
in order — `list_claims()` (stop if a live claim names the file or anything close), `take_worktree()`,
smoke-test with `node Server/smoke.mjs <path>`, merge with `node Server/merge.mjs <path>`,
`return_worktree({id})`. Never `michael/dev` directly, never `git add`/`commit`/`push`/`stash`/`reset`
outside that worktree.

## 5. "The same reaper for idle task masterminds, after 15 minutes" (Global.js's reaper)

Before: `sweep()` only reaped a worker (minion/helper/fork) or the two named ids
(`master_id`/`mastermind_id`) — a `task-mastermind-*` was neither, so it was **never** reaped (the
owner's own measurement, 2026-09-28: "Seven idle task masterminds were holding about 2 GB between
them"). Now it also reaps an idle `task-mastermind-*` after `idle_ms` (15 minutes; the private
Servex ran with `SERVEX_GLOBAL_IDLE_MS=8000` — **8 seconds, said here and in the proof's own
output** — so the run takes seconds, not a quarter hour) and logs it like a worker's reap.
Unit test: `global.test.mjs`, "an idle task-mastermind is stopped after idle_ms" + "its stop is
logged like a worker's". **Live proof, both the stop and the wake, proof.txt:**

```
[  11.9s] waiting past the shortened idle window (8000 ms) for the reaper to stop task-mastermind-proof-parent...
[  17.5s] PASS task-mastermind-proof-parent was stopped while idle — the reaper now reaps a task-mastermind, not just the two named global agents
[  17.5s] PASS a message to the stopped task-mastermind-proof-parent was not refused
[  17.5s] PASS resumed under the SAME session id (4c98a2ee-d822-48af-ae64-4c9572f10df1), not a fresh one
```

Waking needed no new code: `Agents.send()` already falls through to `Agents.wake()` → `reopen()`
for any id with a recorded session, the same generic path `master()`/`mastermind()` already relied
on — it now covers a task-mastermind for free.

## 6. "Inbox watch lines" in `page-assistant.md`

Written: a VS Code tab watches `logs/inbox/<id>.jsonl` with one `Monitor`, no expiry, re-armed at
the start of every turn (page-assistant.md, "If you are a VS Code tab").

## Everything green

- `node Servex/agents/policy.test.mjs` → **48 checks passed**
- `node Servex/agents/global.test.mjs` → **48 checks passed**
- `node Servex/agents/layers.test.mjs` → **38 checks passed** (sibling's file, sanity-checked after
  a mistake below — unaffected)
- `node Servex/agents/groups.test.mjs` → **20 checks passed**
- `node Servex/agents/External.test.mjs` → **9 checks passed** (sibling's file, sanity-checked)
- `node --check` on every `.js` file this task touched

## A mistake, caught and fully recovered

Mid-task, diagnosing an unrelated pre-existing test failure, this session ran `git stash push -u`
— explicitly forbidden for a minion in a shared worktree. It swept up the inbox minion's
concurrent uncommitted work too (`Agents.js`, `Servex.js`, `.claude/skills/servex-mastermind/SKILL.md`),
not just this task's own files. Recovered in full: every file restored individually from the
stash entry with `git show stash@{sha}:<path> > <path>` (never `apply`/`pop`), the two runtime
watcher-log files' two lost lines appended back by hand, `git diff --stat` against the stash
entry verified empty for every real file, then the now-fully-reconciled stash entry dropped.
Nothing was lost; logged in `task.jsonl` for the record, with a note for skill-improvement (even a
diagnostic stash is off-limits here — compare against `git show HEAD:<path>` instead).
