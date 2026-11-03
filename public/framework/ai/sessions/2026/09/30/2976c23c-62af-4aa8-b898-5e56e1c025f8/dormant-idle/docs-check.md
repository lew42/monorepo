# Docs check — dormant agents, the working cap, compaction

Read: `Servex/readme.md`, `Servex/agents/readme.md`, `Servex/doc/dormant.md`.

**Overall: it makes sense.** The three target questions all have a clear answer somewhere in
the chain — idle → dormant (process exits, id/session/row kept, next message resumes it);
dormant vs stopped (the states table in `doc/dormant.md` is the single clearest thing in all
three files — keep pointing people at it); compaction (200k tokens or 500MB, checked at the
end of a turn). A few gaps would save a reader from guessing:

1. **`starting` is never defined.** `doc/dormant.md` says the working cap counts agents in
   `working` or `starting`, but the states table two sections above only lists
   `working / idle / dormant / stopped` — a reader can't find what `starting` means or when an
   agent is in it. *Add:* "`starting`: between `spawn_agent` and the first token back — no
   claude process failure yet, but it already holds one of the 5 slots."

2. **Whether idle/dormant agents count toward the cap is implied, not stated.** The "Not
   counted" bullet lists roles and `wait_for_agent`, but never says outright that a merely
   `idle` or `dormant` agent (holding no turn) is *already* excluded by the `working`/`starting`
   definition. *Add:* "An `idle` or `dormant` agent holds no slot — only when a message turns
   it `working` does it count."

3. **"Kept awake" doesn't say what state that agent is left in.** `doc/dormant.md` says an
   agent with a live background task is kept awake through a sweep, but doesn't say whether it
   stays `idle` (process up, not dormant, not counted against the cap) or something else.
   *Add:* "It stays `idle` — process up, not dormant, not counted toward the cap."

4. **Nothing says whether a dormant agent can be oversized and stay that way.** Compaction only
   runs "at the end of a turn," and a dormant agent isn't running a turn — so a session that
   crossed 200k tokens right before going dormant stays oversized until its next wake-and-turn.
   Worth one line so nobody reads dormancy as also capping memory. *Add:* "A dormant agent is
   not compacted while dormant — the check runs on its next turn, after it wakes."

No sentence above contradicts what's there now; each just closes a question the current wording
leaves the reader to infer.
