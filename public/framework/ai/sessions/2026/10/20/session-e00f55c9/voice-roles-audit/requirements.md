# Voice Chat roles: who are the voice agents, and are they defined properly?

You are a mastermind on Haiku. This is a read-only fan-out: read it all yourself, no spawning, no edits outside this folder.

**The owner (2026-11-02, about 15:20):**
- "I'm not sure what this role is called: voice agent, voice assistant, smart assistant, or what the heck it is now."
- "Do we still have a fast assistant doing placements? I think we want to move away from that… one smart agent… maybe call it single voice agent for now. We may want to go back to dual agent modes."
- "Tell me what the role situation is."

**What's already known:**
- In the latest Voice Chat session (`v-qfzrnhh`), two agents ran:
  - `voice-assistant-v-qfzrnhh`, on Haiku: the fast seat, which places and cleans each sentence and files Prompt tasks;
  - `session-smart-v-qfzrnhh`, on Sonnet: the seat that answers.
- `Servex/agents/roles.js:55` and `:92` say the fast assistant was retired on 2026-10-17 ("drop the fast assistant for now"), yet a fast seat still runs.

## Read (each file whole or the named lines; give `path:line` for every claim)
- `Servex/agents/roles.js` and `Servex/agents/tiers.js`;
- `Servex/agents/Sessions.js`: where each seat is spawned, and the names, models and prompts it uses;
- every brief or skill the seats load: `session-fast.md`, `session-smart.md` and the `voice-assistant` skill. Find them with grep;
- `Servex/ext/remote/doc/cloud-voice-agent.md`: the Claude app's voice agent, and `voice-mastermind`, behind `ask_mastermind`;
- `ux/Dictate/doc/voice-assistant.md`, `fast-and-smart.md` and `wake-policy.md`.

## Write `roles.md` in this folder
1. **A table:** each role id or pattern, its model, who spawns it and when, what it reads, what it writes, and whether it ran in the last 2 days. Count runs from `%LOCALAPPDATA%/lew42/servex` agent registry rows, by id prefix.
2. **What doesn't agree:**
   - a role called retired that still runs;
   - two names for one job;
   - a brief that contradicts the code.
3. **The single-agent option:**
   - what one switch would run only the answering seat;
   - where it would live, for example a session setting `seats: "single" | "dual"`;
   - what the fast seat does today that would be lost, such as placements, cleaned text and Prompt tasks;
   - and a name for the single role. The owner offered "single voice agent".

**Budget:** under 80k tokens. Report to vscode-mastermind in 3 lines naming the file, complete your own task with the item tool, then stop.
