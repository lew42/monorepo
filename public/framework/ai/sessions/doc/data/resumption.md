# Tiered resumption (2026-10-12)

**Ask:** resuming an old session should be cheap, and a recent one should just resume (owner, 2026-09-29: "if it was started within the last hour, I don't see a problem with resuming").

`node Server/SessionResume.mjs <id>` (class `SessionResume`) picks a tier from `sessions/session-flags.json` (last activity and last-turn context). Nothing is guessed by an AI.

| Tier | Rule | What to do |
|---|---|---|
| warm | idle under 1 hour | resume as is; the prompt cache is still warm |
| cold | idle 1 hour to 7 days, context 300k or less | resume; the first turn re-reads the whole context uncached |
| fresh | idle over 7 days, or context over 300k | start a new session that links the old one; do not resume |

`--census` counts every session by tier (2026-10-12: 144 warm, 2088 cold, 5908 fresh).

**Shown:** every Sessions row carries a warm / cold / fresh tag next to its role (`AISessionView.js`, rule in `AISession/AISessionResume.js`, which `Server/SessionResume.mjs` extends). Hover for the reason. Still not built: a button that applies the tier, and the new session seeded with a summary for `fresh` (`Server/session-summary.mjs` is the start).
