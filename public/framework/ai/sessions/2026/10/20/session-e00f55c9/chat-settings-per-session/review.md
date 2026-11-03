verdict: pass
1. [note] This diff is the Servex half of steps 4 and 5 only (per-session `plugins`, shared defaults). None of the five owner asks can be ticked yet, and `plan.md` Status says so honestly. The folder stays open, so this is correct as a partial merge, not a miss.
2. [note] `plan.md` Status, the "Make default also saves the defaults on Servex" line, still says "the page side reads it at load with localStorage as the fallback" in the present tense. The next line lists that as open, and `ux/Dictate/doc/settings.md` now says "not built yet". Word it as "will read" so a fresh agent isn't misled.
3. [note] `Servex/agents/Sessions.js` `settings()`: `plugins` is now checked first and written after the wake knobs are checked, so a refused `plugins` leaves nothing behind (proven by the test). An `assistant` change is still written before the wake knobs are checked, but that order was there before this diff.
4. [note] Simpler way: none better. Reusing `POST /api/session/settings`, adding one `session-defaults.json`, and registering `GET /api/session/defaults` before `/:id` (`Sessions.js:1757`) is the smallest form that works. `node Servex/agents/Sessions.plugins.test.mjs` passes 4 of 4 in worktree `chat-settings-servex` (7d32afd51).

## Requirements
- 1 "the dictation and recite rules and thresholds as plugins you can switch on and off": no, not in this merge (planned as step 2)
- 2 "registered at the class level, toggled and configured per instance": no, not in this merge (step 1 remainder, after qf-1)
- 3 "one Chat settings panel (the gear), with Recite's settings in it": no, not in this merge (step 3)
- 4 "settings persist with the session; a new session starts from the defaults": partly. The Servex store is done and tested (`Sessions.plugins.test.mjs`, check 1: a new session has no `plugins`, the value survives a reload, `null` clears it). The page side is not built.
- 5 "a 'Make default' button": partly. The Servex store `/api/session/defaults` is tested (check 4), but there is no button yet.
- class live-instances page: n/a, because the diff adds no class (it adds a method and a function on `Sessions`)
- index: the new test and route are listed in `Servex/agents/readme.md`, and the store is documented in `ux/Dictate/doc/settings.md`. A fresh agent can continue from `plan.md` Status, which names the worktree, the commits and the open steps.

## Words
- plain sentences, the reader's terms: yes. The new doc section and the readme line say what is stored, where, and how to reach it.
- nothing stale: yes, except the present-tense clause in `plan.md` Status (note 2)
