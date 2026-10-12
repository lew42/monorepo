# AI 2: Needs-you flood, default tab, rail jump, Log tab, tab alignment

Dispatched to `minion-ai2-calm` as a quick fix via the worktree pool. Three messages, verbatim.

## 1. The original brief

> A quick fix via the pool (take_worktree, then node Server/merge.mjs, then return_worktree).
> Budget about $4. The owner finds the AI 2 root confusing and jumpy. Fix three things:
> 1. **"Needs you" is flooded by the task loop's heartbeat escalations** ("<task> has been quiet
>    since … close it / keep chasing"). Those are the SYSTEM's to triage (the heartbeat revives
>    or stops, and the Servex mastermind decides), not the owner's. Filter them OUT of Needs you
>    (keep them on their own task card). Needs you shows only what's truly the owner's: an
>    unanswered Question or Decision addressed to the owner, and real blockers (a key, money,
>    something destructive). Find where the rule lives (ai2/needs-rule.js, Servex /waiting).
> 2. **Make INBOX the default tab again** at /framework/ai2/. Needs you stays a tab, and gets a
>    small count badge on the tab when something's truly waiting.
> 3. **The rail REORDERS live and jumps** as cards get new lines. Keep the order STABLE while the
>    owner is looking: new activity shows as a small "N updated ↑" pill at the top of the rail,
>    and a tap on it re-sorts. Also re-sort on reload.
> Prove it headless at 1920 and 400: count the Needs you rows before and after, and show the rail
> order unchanged while a line is appended to a card. Post one line on card
> 2026/09/29/inbox-rows-are-the-real-pages-page-class via POST http://127.0.0.1:8090/card/append?id=…,
> using node fetch.

## 2. First mid-turn addition

> One more for your fix, from the owner: on the AI 2 root, the top tabs (Needs you · Inbox ·
> Overview) are aligned to the RIGHT edge, far from the title, and the owner didn't even see
> them. Put them where the class-doc pages have theirs: left-aligned, right next to (or directly
> under) the "AI 2" title. Reuse the Doc page's tab placement; don't invent a new style.
> Screenshot at 1920 and 400.

## 3. Second mid-turn addition (scope + budget raised to ~$8)

> The owner clarified what AI 2 should be (verbatim: `ai/2026-09-30/page-audit/owner-words.md`,
> the first third). This changes your fix:
> 1. INBOX is the default tab and shows only HIGH-LEVEL important items: one row per task or
>    topic, never heartbeats, never individual minions (a minion belongs inside its task). "Needs
>    you" can fold into the Inbox as a pinned section at the top, or stay a tab with a badge; pick
>    the simpler.
> 2. A new "LOG" tab: EVERYTHING in flight. Every task being worked on, each row with a STATUS
>    DOT: flashing YELLOW = in progress; GREEN = done; RED = failed or stalled. Minions are
>    grouped under their task (collapsed), not separate rows. Heartbeat pings don't appear.
> 3. The SAME layout and CSS in every view (Inbox, Log, Overview): one row style, one structure.
>    And the tabs are left-aligned next to the title (as I sent before).
> 4. The live-reordering fix (the "N updated ↑" pill) applies to both.
> Budget up to about $8 now for this scope.

## What this task actually built — see `task.jsonl` for the log, and the landing report for
the one-screen summary. `ai/2026-09-30/page-audit/` is a SEPARATE task (a page-priority mastermind)
and is not this one's to do.

