# Community — verdict

## MVP recommendation

**Levels 1–5, a hand-written rubric per rung** (not academic numbering, not 1–10) — cheap
to relabel later because it is a display band over reputation, never a stored fact.
**Reputation is topic-scoped, derived from an append-only action log** (same pattern as
`notes/auth/readme.md` §5's derived points), gating exactly one privilege at launch:
subtopic suggestion. **Governance is founder-owns-topic, owner-of-platform overrides
anything, every override logged the same as a mod action** — no voting anywhere in the
MVP; quorum needs a crowd the MVP will not have. See `Automatic level tracking must
reward outcome signals` and `Reputation must be topic-scoped` for the mechanics.

## §33 — the reputation formula

| | |
|---|---|
| **Decision** | What actions earn topic reputation, and how much |
| **Problem** | Get it wrong and either the reward selects for the wrong tone (see `Stack Overflow decline reads as a moderation-culture failure`) or changing it later rewrites everyone's history |
| **Options** | (a) single sitewide score (Reddit karma-style) · (b) topic-scoped, stored column, incremented on event · (c) topic-scoped, derived live from an append-only action log |
| **Recommended** | (c) |
| **Why** | Matches the auth readme's already-settled points-are-derived verdict; topic-scoping falls out for free (filter the log by topic id) |
| **Advantages** | Always correct by construction; no compensating-write bugs; a scale change (1–5 → 1–10) is a pure relabel, not a data migration |
| **Disadvantages** | Read cost grows with log size (mitigate: cache once measured, never as source); no built-in decay (see the decay question entry) |
| **Security** | One-vote/action-per-user-per-item enforced by a DB constraint, not app code (`likes` PK pattern); no reputation from actions on your own content — needs the authorship mapping the auth readme flags as unbuilt |
| **Cost** | One query per profile view at MVP scale; negligible until a topic's log is very large |
| **Scalability** | Fine until it isn't; the auth readme's own escape hatch (materialize a rebuildable cache) applies unchanged |
| **Complexity** | Lower than it looks — no reputation table, no invalidation logic, one log and one SUM |
| **Migration/reversibility** | Level scale: reversible, cheap. **Formula itself: not reversible without either two-formula drift or retroactively rewriting history** — this is the actual hard-to-reverse choice, not the scale (see the S33-subject opinion entry) |
| **NOT doing yet** | Decay, sitewide aggregate score beyond profile display, AI-scored reputation weight, elected topic ownership |

## Three numbers that matter

1. **7,800+ subreddits** blacked out in the June 2023 API-pricing revolt — the ceiling on what unpaid, reputation-motivated moderators can do when platform and community incentives diverge. [Reddit API controversy — Wikipedia](https://en.wikipedia.org/wiki/Reddit_API_controversy)
2. **g ≈ 0.78–0.82** (large effect, Hedges' g) for gamification's effect on learning outcomes across two 2023–24 meta-analyses — but effect size drops 5× (1.57 → 0.30) for interventions longer than a few weeks, which is the actual regime this platform lives in. [Gamification of learning — Wikipedia](https://en.wikipedia.org/wiki/Gamification_of_learning)
3. **~37,000** active Wikipedia editors today vs. an estimated 51,000–90,000+ peak around 2007 (range unresolved, see the skeptic entry) — the clearest cautionary number for what a punitive gatekeeping culture does to a volunteer community over a decade. [Wikipedia:Statistics](https://en.wikipedia.org/wiki/Wikipedia:Statistics)

## What to cut first if the MVP must shrink

1. Badges — display sugar over reputation/level, zero new mechanics, cut whole.
2. AI-assisted triage — flag-for-review only was already the ceiling of the MVP ask; cut to fully-manual.
3. Subtopic reputation gate — let anyone suggest, owner approves everything by hand at MVP scale; add the gate once suggestion volume outpaces one owner reading by eye.
4. The intro-experience/Level-1 split — ship one flat "welcome" state and add the real Level-1 rubric once there is a second level to distinguish it from.

Full evidence: [`log.jsonl`](./log.jsonl) — 46 entries, 13 established / 31 contested / 3 speculation.
