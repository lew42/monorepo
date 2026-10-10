# card_reply length, second task masterminds, and the merge gate (revised)

## (a) card_reply's sentence count — a strong convention, and a looser one than I first said

The "two or three sentences" line does exist, baked right into the `card_reply` MCP tool's own
description in `Servex/agents/Assistant.js`. But peers found a wider, and slightly different,
pattern: `every-prompt/cards.md` and the `assistant-layers` requirements consistently say **"one
or two sentences"** for the card-assistant and master-assistant roles, while `mastermind-servex.md`
also says "one or two." So "two or three" is the tool's own stated ceiling, but most of the actual
role prompts that call it ask for something shorter. Read together: this is a strongly and
repeatedly stated house style (short, plain, glance-readable), not one fixed number, and not
mechanically enforced anywhere — `card_reply`'s handler only checks that `card` and `text` are
present, nothing counts sentences.

**The real edge case** (found by a peer, not by me originally): when there's something
substantive to say — a decision, real context — the convention is to put that on a separate board
"Note:" card and keep the `card_reply` itself to one line that just points at it, rather than
stretching the reply past two or three sentences. That's the actual bend: length is protected by
routing extra content elsewhere, not by allowing a longer reply.

## (b) never a second task mastermind — a hard rule, explicitly conditional, unchanged by peer review

`.claude/skills/sub-mastermind/SKILL.md`'s Never list states it outright: "spawn another task
mastermind (depth stops at two until one measured run proves a three-deep tree can report failure
upward)." All three of us read this the same way: a hard rule today, with its own named exit
condition, not a permanent architectural wall. The stated mechanical reason is that a nested
background agent's completion notifies the *main* session, not its parent, so nothing has proven a
three-deep tree can get a failure report to the top yet. One peer usefully clarified the actual
boundary: this blocks a task mastermind from spawning another *task mastermind* — a mastermind
spawning ordinary minions (even minions that spawn their own sub-work) is normal and unaffected.
No real bend has happened yet; it's a known limit waiting on a specific proof, not a rule with a
worked-around case.

## (c) every merge through Server/merge.mjs — hard-gated, but with an explicit, loud override

I originally said `review.md` describes no escape hatch at all — that was wrong, or at least
incomplete: a peer read `Server/merge.mjs`'s own source (not just `review.md`) and found it takes
a `--no-review "why"` flag (and a separate `--main` flag) that explicitly skips the review gate,
printing a loud warning ("merging WITHOUT a fresh-eyes review") rather than silently succeeding.
I confirmed this directly in `Server/merge.mjs` lines 8-13 and 49-92. So the gate is enforced by
default for `light`/`full` branches, but it is a **deliberate, visible override**, not an absolute
wall — the person invoking merge.mjs can choose to skip review and the tool makes sure that choice
is loud and logged, not hidden.

The other confirmed bend, size `none` (CSS/docs only, ≤20 lines, no new file), is exempt from
review entirely since nobody reviews it in the first place — `reviewGate()` in `merge.mjs` itself
returns "ok" immediately when `sizeOf(...) === "none"`.

A peer also sharpened the framing usefully: `merge.mjs` itself calls plain `git merge --no-ff`
internally once its checks pass — so the real rule isn't "git merge is forbidden," it's "agents
never run git commands themselves on the main branch; `merge.mjs` is the one sanctioned mechanism
that's allowed to invoke git for them," consistent with the `minion` skill's Never list ("never
`git add`... never `git stash`, `checkout --`, `reset`, commit or push").

## Bottom line (revised)

- **(a)** strongest as a *style*, weakest as a *number* — "short and plain" is settled, but the
  exact count varies by role (1-2 vs 2-3) and length is unenforced; the real discipline is routing
  substance to a Note: card instead of a long reply.
- **(b)** the clearest hard rule of the three: explicit, with its own named condition for being
  lifted, no bend observed yet.
- **(c)** hard-gated by default, but with a real, intentional, loudly-logged override
  (`--no-review`) plus a scope exemption (size `none`) — and the underlying principle is really
  "no agent runs git directly on main," which `merge.mjs` satisfies by being the sole script
  trusted to do so.

## Sources

Repo files (mine, confirmed directly):
- `Servex/agents/Assistant.js` (card_reply tool definition and handler)
- `.claude/skills/sub-mastermind/SKILL.md` (the depth-two rule)
- `Server/merge.mjs` (confirmed `--no-review`, `--main`, and the `none`-size exemption directly, lines 8-13, 49-52, 85-94)
- `Server/doc/review.md` (the size table and merge gate description)
- `.claude/skills/minion/SKILL.md` (the never-touch-git-on-main framing)

From peers (not independently re-verified beyond the merge.mjs flag above):
- `.claude/skills/every-prompt/cards.md`, `public/framework/ai/2026-09-24/assistant-layers/card-requirements.md` (the "one or two sentences" pattern across roles)
- the "Note: card for substance" convention
