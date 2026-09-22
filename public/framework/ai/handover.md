# Handover — read this first

The file a fresh assistant, mastermind or minion reads before anything else. Written
2026-09-20 15:45, refreshed 2026-09-21 14:05. Replace the dated sections as they go stale;
keep it one screen.

## The state, in one paragraph

Everything works. The site serves, the page-health watcher is alive, and the whole pre-incident
tree is restored. **`/framework/ai/` now draws V3** (V1 lives at `?v1`); that is the front door
and the owner's real screen. Two days of work were reverted twice by an accidental `git stash`
and recovered in full; two days of building landed on top. Their own page is
[`ai/2026-09-20/start-here/`](2026-09-20/start-here/) — four things in order. Keep that current;
it is what they actually read.

## The three things a new session should not relearn the hard way

1. **A reverted working tree is a stash until `git stash list` says otherwise.** `git stash` runs a
   `reset --hard` internally, so it is indistinguishable from destructive loss in the reflog.
   Skipping that one check on 2026-09-19 cost four tasks and ~1.2M tokens rebuilding 1,389 files
   that were never gone. Read a stash with `git show 'stash@{0}:<path>'` — never `pop`, `apply`,
   `drop` or `clear`. ⚠ **`stash@{0}` is still the cleanest copy of that work; do not drop it.**
2. **A rebuild can be incomplete, and "newer" is not the same as "better".** `framework.css` was
   reconstructed from transcripts, came out missing four spacing tokens, their utility classes and
   the whole `.card` class — and the stash-restore then *kept* the broken file because it looked
   like newer work. Every rule referencing a missing token computes to zero, which is why padding
   vanished across eleven files at once. Anything reconstructed needs a completeness check before
   it is trusted over a known-good copy. Two more files in that shape are named in
   [`ai/2026-09-20/ai-padding/`](2026-09-20/ai-padding/).
3. **Work gets built, honestly demonstrated, and never plugged in.** That accounted for seven of
   the eleven wrong grades in the 2026-09-19 audit: the compact switch landed on v/2 and v/3 never
   took it; streaming replies have never run on the real board; the `.card` standard was worn by
   nothing. The code was real and every demo was honest — the last step was missing. When a
   request is phrased as a goal, **the goal is the acceptance test**.

## What landed, with the pages

- **2026-09-19, a Sonnet-only run, fifteen things** — all in [`ai/2026-09-19/`](2026-09-19/). The
  three numbers still worth carrying: **27 of 53** of that day's requests were done as asked (not
  the 30 first reported); the skill evaluation covered 45 skills and ranked seven changes, **none
  applied** ([`system-eval`](2026-09-19/system-eval/)); and the path from the owner speaking to a
  finished result measured a **29-minute median**.
- **2026-09-20.** The stash recovery (`reset-recovery`, `reset-scope`, `reset-restore`,
  `reset-deep`, `stash-restore`), then the owner's four afternoon breakages — all in
  [`ai/2026-09-20/`](2026-09-20/): `ai-padding`, `v3-axis-fix`, `approve-loop`, `dictate-fix`,
  `studies-honest`, `start-here`.
- **2026-09-21.** V3 became the front door with four links out of it; the timeline rail became a
  two-size scannable list (ordinary rows 86px → **16px**) and the sticky hour box went; Approve /
  Improve now appear on cards that are still *working*, which is why the owner could never find
  the feedback mechanism; card bodies render markdown; Now and Grid got their padding; worktree
  scripts exist (`Server/worktree-up.mjs`); and the `code` skill's 21-trap backlog was applied for
  the first time since it was created. All in [`ai/2026-09-21/`](2026-09-21/).
- ⚠ **The mastermind broke `/framework/ai/` for three minutes on 2026-09-21** hand-editing it, and
  the page-health watcher logged nothing at all while it was down — its `is_held()` deferred every
  check with no ceiling, so a break that happened inside a reload hold was invisible. Both fixed;
  the watcher fix needs the restart in item 2.
- Two details worth carrying: the V3 sticky strip covered **79.7%** of the left column at 1920 and
  **254%** at 400 because it pinned all 23 `needs-you` cards — now capped. And the approve loop's
  real bug was navigation: clicking a card in grid or now view silently redrew the same wall, so
  most clicks never reached the controls.

## What the owner is waiting on - in order

1. **Decide how this repo gets committed.** Twice now one keystroke has erased everything
   uncommitted, and the mastermind may not commit. Either commit `michael/dev` regularly, or grant
   a branch the mastermind may commit to. ⚠ **This is now also blocking the worktree workflow they
   asked for**: a worktree contains only COMMITTED files, and with 359 modified and 115 untracked
   paths (the whole of `ai/v/` among them) a fresh worktree has no V3 in it at all. Proven
   2026-09-21 by running it.
2. **One restart switches on three finished fixes**: stop the supervisor named in
   `ai/health/heartbeat.json` (`supervisor_pid`, 34636 as of 14:00) and start
   `node Server/health-supervisor.mjs` again. The watcher still runs old rules — and the reason it
   never picked up new ones is itself one of the fixes waiting (`ai/2026-09-21/safe-rollout/`).
3. **A Bash permission rule for CLI minions.** Corrected 2026-09-21: `--permission-mode
   bypassPermissions` is refused by the auto-mode classifier, but `acceptEdits` launches fine and
   **can write**. What it cannot do is RUN anything — no `node`, no `git`, not even `node --check`,
   and no `.claude/` writes. So a minion can build and can never prove, and the mastermind runs
   every proof at harvest. Four minions hit this on 2026-09-21; each logged its refusals honestly.
4. **Two settings.json lines** — the hold-guard's recording half, and the prompt-relay hook that
   fixes the one measurably fixable stage of the 29-minute delay. Exact lines in
   `ai/2026-09-19/hold-guard/`.
5. **Seven skill changes written, none applied** — `ai/2026-09-19/system-eval/`.
6. **Three Server-side items need one restart window**: two plugins and a hook name the old board
   path, `Append.js` fails on a resolved url, `Directory.js` mangles nested listings.
7. Five orphaned `node server.js` processes, an idle pm2 daemon, and the V3 head row measuring
   **255px at 400px wide** against 76px at 1920 — a quarter of a phone screen before any content.

## Where to look

- The owner's words, verbatim, newest last: `ai/board.jsonl` (moved out of `v/3/` 2026-09-19). Their live board is
  [`/framework/ai/v/3/`](v/3/). `node .claude/skills/every-prompt/say.mjs state` prints the
  state, the inbox and the cards in one go, and posts cards.
- Recent work: `ai/2026-09-21/*/` then `ai/2026-09-20/*/` — each has a brief, a log, and usually
  a one-screen page. The newest run ledger is `ai/2026-09-19/mastermind-sonnet-run/task.jsonl`.
- The previous handover, longer and still mostly true:
  `ai/2026-09-17/mastermind-layout-browser/handover.md`, with `asks.md` beside it.
- The roles: `.claude/skills/every-prompt/tiers.md`. How the process is going:
  [`/framework/ai/process/`](process/).
