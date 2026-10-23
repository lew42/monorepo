---
name: check-claude-usage
description: Check how much of the Claude subscription's usage limits are consumed — the 5-hour session window and the weekly windows, as 0-100% with reset times. Use when the user asks "how much usage do I have left", "am I near my limit", "what's my usage", before or after an expensive operation (a wide subagent fan-out, a long autonomous run, a big refactor), or when deciding whether a costly approach is affordable.
---

# Checking usage limits

**In the lew42 monorepo, one command:** `node Server/usage-now.mjs` prints the report line `Week: 10% used · 27% gone · 37% of pace (room to spend, 5 days 3 hours left)`, then a detail line (exit code 2 = over pace). It reads `public/framework/ai/usage.json`, which Servex refreshes every 15 minutes, and re-runs the live script itself only when that file is stale, one caller at a time. So never run `claude-usage.py` or write `usage.json` yourself in this repo: many agents doing it at once is what draws the endpoint's 429s.

**Report usage with all three numbers** (the owner, 2026-10-23): the share of the week used, the share of the week gone, and used ÷ gone as "% of pace" (100% is exactly on pace). Paste the script's first line as it is.

**Anywhere else** (or when the owner asks for the raw windows):

```powershell
python $env:USERPROFILE\.claude\bin\claude-usage.py          # live
python $env:USERPROFILE\.claude\bin\claude-usage.py --json   # machine-readable
```

```
LIVE usage:
  session           2%                       resets Sat 19:20 (in 4:34:13)
  weekly_all        0%                       resets Wed 22:00 (in 4 days, 7:14:13)
  weekly_scoped     0%
```

Read-only. Script: `~/.claude/bin/claude-usage.py`.

## When to run it

- **The user asks.**
- **Before a wide fan-out or a long autonomous run** — anything that multiplies
  token spend. See `fork-claude-session`; a fan-out at 95% is what tips someone
  into overage.
- **When proposing an expensive approach**, so the cost is the user's informed call.
- **After a heavy operation**, when the user is likely to care what it cost.

## How often

On demand, and at natural checkpoints during active orchestration — never in a tight loop or every turn (the endpoint throttles and returns 429s exactly when the number would have been useful). In this repo `usage-now.mjs` already caches, so asking it often is fine.

## Reading the output

| Window | Meaning |
|---|---|
| `session` | The rolling 5-hour window. The one that bites mid-session. |
| `weekly_all` | Weekly cap across all models. |
| `weekly_scoped` | Weekly cap for a model subset (e.g. the top model). |

Crossing 100% does not necessarily hard-stop: with overage credits enabled, spend
rolls over and starts costing separately, and the session's prompt-cache TTL drops
from 1 hour to 5 minutes — making every later turn pricier too. Say that out loud
when someone is near the line.  However, not all accounts use overage credits.

If the header reads `CACHED` instead of `LIVE`, the live call failed and the
numbers may be hours old — retry, or quote the printed age alongside them.

## Pacing — one rule: used% ≤ elapsed%

Per window, **percent used must not exceed percent of the window elapsed.**
Elapsed = `1 − time_remaining / window_length` (the reset countdown is printed
beside each window). A week is 7 days, so on day 4 the line is 4/7 ≈ 57%; two
hours into a 5-hour window it is 40%. **There is no fixed cap** — not 50%, not
75% — the line moves with the clock, and it applies to `session` (5 h),
`weekly_all` and `weekly_scoped` (7 d) alike.

- **Under the line:** room to spend, up to the line — leave a few points for
  The owner's own sessions.
- **On or over the line, or the next heavy step would cross it:** finish what
  is in flight, start nothing new. Wait for the clock.

The `/framework/ai/` board draws exactly this: fill = spend, ▼ = the clock.

## Overnight — never let the owner wake to a spent window

The owner's rule (2026-08-15): autonomous runs while they're away
front-load heavy waves right after a window reset and taper toward morning —
the window they wake into stays nowhere near 90%. Exhausting an allowance
does no good. Escape hatch: an explicit "ignore usage recommendations" from
the owner suspends the guardrails for that run.

## If it breaks

Endpoint details and the required headers are documented in the script itself.

**Credential access may be blocked.** The permission classifier denies reads of
`.credentials.json` by default. That guard is correct — do not route around it.
Explain what the command does (the token goes to `api.anthropic.com` as a Bearer
header, and is never printed) and let the user decide.
