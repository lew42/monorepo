# Pace, not percentage

`usage.js`'s `usage_rail(u)` renders `usage.json`'s `utilization.limits[]` as
meters. Each usage window is a **fixed length** (`LENGTH.session` = 5h,
`LENGTH.weekly` = 7d), so `resets_at` alone tells you how far into the window
you are — that's the ▼ marker (`.ai-mark`), placed at `elapsed * 100%` along
the track. The fill (`.ai-fill`) is spend, `limit.percent`. **Bar behind
marker = under pace** — the entire reading, in one glance, with no mental math.

## The color is a projection, not the raw percent

`pace(limit, now)` computes `projected = percent / elapsed` — the
end-of-window total *at the current rate*. That number picks the tone:
`--ok` ≤100, `--warn` ≤125, `--hot` ≤175, `--error` beyond. A bar at 40% with
80% of the window gone is calm (on pace to land under 100%); the same 40% at
10% elapsed would project to 400% and burn hot — which is why the color reads
the trend, not the snapshot.

⚠ **The first tenth of a window is noise.** `elapsed > 0.1` gates the
projection — before that, 1% spent three minutes into a session projects to
100% and means nothing. `pace()` returns `tone: "calm"` unconditionally until
there's enough signal to say otherwise.

## The tick, and where the data comes from

`meter()` returns its own `paint` closure; `usage_rail()` collects one per
limit and re-runs all of them every 60s via `setInterval`, so the ▼ walks
forward in place between real refreshes without re-fetching anything. The
interval clears itself the moment its element leaves the DOM
(`$u.el.isConnected`).

`usage.json` itself is written by the `check-claude-usage` skill and
gitignored — this module only ever reads it. No `usage.json` yet renders a
one-line prompt to run the skill, not a blank region.
