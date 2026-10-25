# Voice sessions: filed in the dated session store, indexed, costed; the smart agent upgraded to Opus

Sonnet, high effort. Work in a worktree and land ready to merge. **The owner approved the merge and a Servex restart for this:** merge through `Server/merge.mjs`, then restart Servex (`restart_servex`) once no agent is mid-write. Say when it's live.

## The owner (2026-10-25)

1. **Voice sessions from the dictate widget get filed properly.**
   - Today `Servex/agents/Sessions.js:705` makes a `v-…` id and writes its record at `Sessions.session_path(home, id)`, under the page it was opened on. That's outside the dated session store, so the sessions page never shows it.
   - Fix: a voice session gets its folder in `ai/sessions/YYYY/MM/DD/<folder>/` like every other session, with its `session.jsonl` line 1 (kind `voice`, id, the page it was opened on). It's added to the per-level index files, so it shows on the sessions list with its cost.
   - Its fast and smart agents are its child sessions, entered as tasks in its record (the same rule as session-is-a-task, items 24 and 31). Agree the shape with `task-mastermind-session-entries-2`; don't build a second linking system.
   - **Backfill:** move the existing `v-…` records into the store by a script with a manifest, so nothing is lost.
2. **The voice session's smart agent defaults to Opus 5.5, medium effort, with mastermind permissions,** so the owner can dictate to it directly and it can act: spawn, use the item tool, and so on. That's the `session-smart` row in `Servex/agents/roles.js`, plus its brief (`session-smart.md`). Check what "mastermind permissions" means there (allowed tools and the permission mode), and say it in one line.
3. **Proof:** open the dictate widget, say one sentence, and see the session on `/framework/ai/sessions/` (today's list) with its cost and its child agents. Shot at 1920.

## The owner again (2026-10-25), sharper, so do this FIRST

"The voice agent via the website is still using Sonnet. Upgrade him to Opus. I want him to be my mastermind. He should be the default voice agent, should automatically go to mastermind mode too, so that it can persist."
- The website's default voice agent (the smart half of a voice session) **is the owner's mastermind:** Opus 5.5 at medium effort, with mastermind abilities (spawn agents, the item tool, Servex tools). It **persists** across the session; it doesn't sleep or reset between turns.
- **Today:** the `session-smart` row in `roles.js:102` says Sonnet ("the owner, 2026-10-05, saving credits", now overruled), and `Sessions.claude_model("smart")` picks by usage pace (`Usage.pick`). Make it Opus 5.5 regardless of pace, unless the week goes over pace.
- **Ship this part first, on its own:** a small merge plus a Servex restart, before the folder work.

## The owner (2026-10-25, ~01:30): the voice agent works through its own session

The voice mastermind uses the item tool on its own session's record: it adds tasks, child sessions and notes, and refines them as the owner keeps talking, instead of only replying in chat. Give it the item tool, with its own session path resolved for it, and say so in `session-smart.md`. The chat that shows it is the shared chat component, owned by mastermind-dictation-2.

## The owner (2026-10-25, ~01:55): the voice mastermind talks to mastermind-dictation-2

A dictation ask the owner makes in the browser goes from the voice mastermind straight to `mastermind-dictation-2` (`send_to_agent`), and that agent's "it's live, try it" comes back into the voice session. Write it in `session-smart.md`.
