---
name: check-claude-usage
description: Check how much of the Claude subscription's usage limits are consumed — the 5-hour session window and the weekly windows, as 0-100% with reset times. Use when the user asks "how much usage do I have left", "am I near my limit", "what's my usage", before or after an expensive operation (a wide subagent fan-out, a long autonomous run, a big refactor), or when deciding whether a costly approach is affordable.
---

# Checking usage limits

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

Fetches live by default and is read-only. Script: `~/.claude/bin/claude-usage.py`.

## Feed the AI dashboard (lew42 monorepo)

When working in `c:\Code\lew42\monorepo` (or any repo with a
`public/framework/ai/` dir), run the check THROUGH the snapshot instead of the
plain form, and quote the percentages from the file — one API call, and the day
dashboard (`ext/ai/dashboard.js`) renders it as the usage strip via live-reload:

```powershell
python $env:USERPROFILE\.claude\bin\claude-usage.py --json | Out-File -Encoding utf8 public\framework\ai\usage.json
Get-Content public\framework\ai\usage.json | ConvertFrom-Json | % { $_.utilization.limits } | Format-Table kind, percent, severity, resets_at
```

The file is gitignored. The "never in a loop" rule below still governs how
often you check at all.

## When to run it

- **The user asks.**
- **Before a wide fan-out or a long autonomous run** — anything that multiplies
  token spend. See `fork-claude-session`; a fan-out at 95% is what tips someone
  into overage.
- **When proposing an expensive approach**, so the cost is the user's informed call.
- **After a heavy operation**, when the user is likely to care what it cost.

## How often

**On demand, plus a ~15-minute cadence during active orchestration** (the owner,
2026-08-13): while agents are running or a dashboard is watching `usage.json`,
refresh at natural checkpoints roughly every 15 minutes — never tighter. No
tight loops, no per-turn checks: the endpoint throttles aggressively and starts
returning 429s exactly when the number would have been useful.

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

CLAUDE.md RULE#16 (the owner, 2026-08-15): autonomous runs while they're away
front-load heavy waves right after a window reset and taper toward morning —
the window they wake into stays nowhere near 90%. Exhausting an allowance
does no good. Escape hatch: an explicit "ignore usage recommendations" from
The owner suspends the guardrails for that run.

## If it breaks

Endpoint details and the required headers are documented in the script itself.

**Credential access may be blocked.** The permission classifier denies reads of
`.credentials.json` by default. That guard is correct — do not route around it.
Explain what the command does (the token goes to `api.anthropic.com` as a Bearer
header, and is never printed) and let the user decide.
