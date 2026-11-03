# Session freshness — a long session is quietly, mostly repeated context

The owner's ask (2026-10-07): as a session grows, old context stops being relevant,
and it's usually CHEAPER to start fresh (batched readme reads, a short summary) than
to keep paying to re-send a huge window every turn. Full investigation:
[`/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/findings.md`](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/findings.md).

## Measured, not assumed: most of a long session's $ is repeated context

A real 5,142-turn session (`context-measure.mjs`, in the token-accounting task dir,
rerunnable on any session id):

| what | share of $1,709.65 total |
|---|---|
| `cache_read` — re-reading old context | **79.2%** |
| `cache_write` — re-priming it | **13.5%** |
| `output` — the model's own new words | 7.3% |
| fresh `input` — genuinely new tokens | 0.00002% |

**92.7% of this session's cost was context it had already paid for once before.**
$/turn grew **4x** from the first 10 turns to the last 10 — the context kept growing
even through several in-place `/compact` resets.

## A gap past the cache TTL is a 15-50x price spike — measured

Any idle gap over roughly an hour (this repo's own cache TTL) shows the same
signature: `cache_read` collapses to a small floor, `cache_write` jumps to the WHOLE
context, repriced at 2x. Real examples from the session above: a turn that would
normally cost $0.15-0.55 cost **$5.82-$8.08** instead, purely because nobody spoke to
it for 6-16 hours. The cache didn't "slowly get less useful" — it fell off a cliff.

## Servex already has the right pattern — just not everywhere

`Servex/agents/Layers.js` (the card assistant/manager tier) already does exactly
what the owner is describing, built 2026-09-28, in the owner's own words in its code
comment: *"FRESH, NOT COMPACTED."* `stale()` refuses to resume an agent whose
context is over a token ceiling (30k assistant / 150k manager) OR whose last use is
over **60 minutes — already tied to the cache TTL**. When stale, it asks for ONE
checkpoint line (`card_summary`: decisions, open questions, what it was mid-task)
and restarts fresh under the same id, rather than resuming a bloated, cache-cold
session.

**The gap:** masterminds and task-masterminds don't go through `Layers.js` at all —
they use `Agents.js`'s generic `sleep()`/`awaken()`, which has NO age check (a
mastermind dormant for a week still just resumes on next contact) and only
compacts in-place at 200k tokens (an SDK summarization, not a true fresh restart).
A long-lived mastermind that sleeps overnight is guaranteed a cache-miss-priced
first turn the next morning.

## Recommendation: extend the existing pattern, don't invent a second one

Give `Agents.js`'s dormant-agent wake path the same `stale()`-shaped check
`Layers.js` already has (reuse the function/thresholds, CLAUDE.md law 6), and the
same checkpoint-then-restart action. **Alternative considered and rejected as the
first choice:** add an age check to `Agents.js`'s own `compact()`/`oversized()`
instead — simpler, but `/compact` summarizes IN PLACE (same growing session id);
the owner's words describe a genuinely NEW session with a short, deliberately
batched re-read, which is what `Layers.js` already builds, not what `/compact` does.

**For the Sessions grid** (a separate, smaller follow-up): show each row's context
size and cumulative cache-read $, and a "consider a fresh session" badge at the
SAME threshold the mechanism above actually acts on — never a warning the system
itself doesn't also act on. The handoff shape is already built
(`ask_checkpoint()`'s `card_summary` call); this part is display only.

Full build plan, effort estimates, and why this is "careful, not small" (it changes
when a live, possibly mid-task agent gets torn down and respawned):
[`/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/plan.md`](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/plan.md),
items 8-9.
