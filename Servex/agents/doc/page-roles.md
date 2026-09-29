# Page roles: one pair, one skill, a narrower feed

The recursive-pairs redesign (2026-09-25/28, `/framework/ai/2026/09/25/one-recursive-agent-system-the-same-pair/`
and `/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md`) makes every page
— a card, or any other page — get the same two agents [`layers.md`](layers.md) already describes for a
card. This page covers the four small, code-level pieces of that: the new role words, the narrower
root feed, the messaging fix, and the reaper gap. What actually spawns a pair for a plain page (not
just a card) is Layers.js's own job, not this file's.

## One skill per role, two new words

`roles.js`'s `ROLES` table now has `page-assistant` and `page-mastermind` — the canonical words for
the pair every page gets, root included. `master-assistant`, `manager` and `card-assistant` are the
pre-recursive-pairs names for these exact same two rows, kept as **aliases** (`canonical()` now
accepts an array of aliases per row, not just one string) so nothing that already says the old word
breaks. Write the new words in anything new.

The skill FILES themselves did not move: `page-assistant` still loads the `every-prompt` skill
directory, and `page-mastermind` still loads `sub-mastermind` — same mismatch `doc/names.md`
already tracks for `assistant`/`every-prompt` and `task-mastermind`/`sub-mastermind`, now with two
more rows in the same shape. (`names.md` itself is frozen for this task — three minions share
`doc/`, so this note stands in for the housekeeping edit it should get.)

**The actual text a page assistant reads** is `.claude/skills/every-prompt/page-assistant.md` — the
`every-prompt` front-desk text merged with the old `card-assistant.md`, because the job is the same
at every scope: turn words into UI fast, hand real work to your page's mastermind, and (new) make a
safe one-file quick edit yourself when nothing claims it. `Layers.js` reads that one file
(`ASSISTANT_TEXT`) as a spawned assistant's system prompt; the old copy,
`Servex/agents/card-assistant.md`, is deleted (2026-09-29), so there is one text to keep true.
The root page's assistant is `master-assistant`, with its own text, `master-assistant.md`.

## The every-card feed is gone (Global.js)

Before: `master-assistant` heard every fresh prompt on every card, plus every `landed`/`blocked`/
`error`/`task` message from ANY card, batched every 20 seconds. That was the whole point of
`Global.listen()` subscribing to `cards.on(...)` for everything.

Now: a fresh prompt is forwarded only when it is **page-less** (`Global.page_less()`): spoken on a
card no page pair hears (an id under four segments, such as a day's page or a lobby group card),
or on any card when Layers is off. Every other page already has its OWN assistant hearing its own
prompts (Layers.js), so a second copy reaching the root added nothing but noise. A send to the
page `/` goes straight from Layers to `master-assistant`, which is that page's assistant.
What's left is `landed`/`blocked`/`error` (the `"task"` kind — a queued-state change — is dropped
too: it is not something the owner needs to see at the root) from a **direct child of the root
pair** only: `Global.direct_child(id)` checks the reporting agent's own `.parent` field against
`"dispatcher"` (where a `task-mastermind` gets spawned from today), `mastermind-servex`, or
`master-assistant` itself, and also counts a card's or a top-level page's manager, whose
`layers.json` parent is `manager-root` (its live parent is its own assistant). A grandchild's report — a task-mastermind's own child, or a sub-card two
levels down — is not forwarded; that page's own assistant is who should hear it, and the root can
still `list_cards`/`list_agents` on demand.

**Still separate:** words spoken with no card selected at all go first to `Assistant.js`'s
`assistant-fast` lobby, which files them onto a group card (`file_to_group`). When that group card
has a short id, no pair hears it, so it is page-less and reaches `master-assistant`. Folding the
lobby itself into the root is work for whoever owns `Assistant.js` next.

## `mastermind-servex-N` counts as the mastermind (policy.js, D4)

`task-mastermind-recursive-pairs` was refused messaging `mastermind-servex-3` purely because
`policy.kind()` only matched the bare ids `mastermind-servex` / `servex-mastermind`. `kind()` now
matches `/^(mastermind-servex|servex-mastermind)(-\d+)?$/`, so a numbered instance (another
worktree's own mastermind-servex, or a second one running alongside) is `kind: "servex"` exactly
like the un-numbered one — which already may message anyone and is a legal target for an
assistant, a manager, the master, or a task-mastermind under the existing table. `policy.test.mjs`
proves both directions.

Parent/child messaging between two masterminds (a task-mastermind spawning a CHILD
task-mastermind) needed no new rule — the tree rule (`this.parent(from) === to || this.parent(to)
=== from`) has always applied to any agent, not just minions; only a proof that it holds for two
`task-mastermind-*` ids specifically was missing, and `policy.test.mjs` now has it.

**A page manager's tree parent is its recorded one.** A manager is spawned with its own assistant
as its live `parent` (it must keep waking that assistant), so the tree rule alone never linked
`manager-<card>` to `manager-root`. `Policy.parent()` stays the live parent, and `Policy.tree()`
also accepts the manager's `parent` in `layers.json` (read through `agents.layers`, which
`Layers.install()` sets). So a card's manager and `manager-root` message each other both ways,
and so do `manager-dictate` and `manager-ux`. `policy.test.mjs` proves it on the real Layers ids.

**Siblings still cannot talk directly** (by the card's own table: nothing routes manager-to-manager
or page-mastermind-to-page-mastermind sideways) — two sibling page pairs coordinate through a
shared file (a claim, or a card both can read), or through `mastermind-servex`, same as before.

## The task-mastermind reaper gap (Global.js, D5)

`Global.sweep()` only ever reaped two kinds of idle agent: a worker (`minion`/`helper`/`fork`,
after `reap_ms`, 3 minutes) or the two named global ids (`master_id`/`mastermind_id`, after
`idle_ms`, 15 minutes). A `task-mastermind-*` agent is neither — its role isn't a worker prefix and
its id isn't one of the two named ones — so it was silently skipped forever, exactly the "Seven
idle task masterminds were holding about 2 GB between them" the owner measured 2026-09-28.

`sweep()` now also reaps an idle `task-mastermind-*` after `idle_ms` (the same 15 minutes), and
logs it the way a worker's reap is logged. Waking a stopped one needs no new code: `Agents.send()`
already falls through to `Agents.wake()` → `reopen()` for ANY id with a recorded session, regardless
of role — that generic path (outside this fence) is what `master()`/`mastermind()` already relied
on for the two named ids, and it now covers task masterminds the same way. The live proof
(`proof.md`) shows a stopped one answering a message again, by its session id.
