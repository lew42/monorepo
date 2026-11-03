# A map of dictation's background work, and an index of what's been built (you are a mastermind, on Sonnet; audits go to Haiku)

**The owner (2026-11-01, about 21:45, [../night-2026-11-01/requirements.md](../night-2026-11-01/requirements.md), point 7):** "We need better system maps because frankly we're doing so many of these fix-this, do-this things… I can't even find all the things that we've done." Study the prompt refinement system with a Haiku fan-out. Find out what the fast assistant actually does: refinement, placement, one fresh agent per prompt? "I really don't know. There's all kinds of different things happening."

## Do
1. **Inventory every background job that touches a spoken sentence,** verified in code with file:line:
   - `Servex/agents/Sessions.js` (`say`, `refine()`, `voice_say`, `wake`, `mark_sent`, `line`, `{place}`);
   - `ext/Refine`, `Server/refine.mjs`, `WakePolicy.js`, the voice-assistant role prompt and the session-smart prompt;
   - any per-prompt spawns.
   - For each, record: what triggers it, which model and effort, what it writes (which line kind, into which file), which view reads it, and what it costs per call (from the logs).
   - Run the reading as a Haiku fan-out (30–60k tokens each; a node script chunks the inputs). Sonnet verifies every claim it keeps.
2. **Write the map** at `public/framework/ux/Dictate/doc/background-work.md`: one table plus a small flow picture (mermaid is fine). Link it from `ux/Dictate/readme.md` and `ux/Dictate/doc/map.md`. Point out duplicates and anything that runs but nothing reads.
3. **An index of what's been built:** for the dictation, voice, chat and session systems, list every landed task since 2026-10-20, with its title, module, merge commit and doc link. **Compute it with a node script** over the task folders and the git log, never from memory (Law 7). Write it at `public/framework/ai/doc/built-index.md`, linked from `public/framework/ai/handover.md`. Extend `Server/PastWork.mjs` or `ai/past-work-index.md` if one of them already does this (Law 6: one of everything).
4. **Report** to vscode-mastermind in 5 lines: the top 3 surprises (duplicates, dead jobs, costs).

**Fences:** docs and scripts only, committed by path straight to `michael/dev` and pushed (no site code). No `python -`. **Budget:** about $12.
