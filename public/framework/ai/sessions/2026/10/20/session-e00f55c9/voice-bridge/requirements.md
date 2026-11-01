# Voice bridge: talk to a mastermind from the Claude app, fast

Goal: you speak to the Claude app voice agent; it hears a mastermind's answer back within seconds, with an ack in under 1 s. (You are a mastermind.)

**Who's who: never confuse these two.**
- **The Claude cloud voice agent:** the Claude Android app, in live voice mode, with the Servex MCP connector.
  - It has no local Claude Code session, no bash, no files. It has only Servex MCP tools, through the tunnel.
  - **What it does well:** a natural voice; it listens and can be interrupted.
  - **What it does badly:** working asynchronously. It either fires a request and never hears back, or calls a "wait" tool that sits for up to a minute with no sign anything is happening, and a loud sound cancels the wait.
  - Live mode also limits what it can do; artifacts, for example.
  - Read `Servex/ext/remote/doc/cloud-voice-agent.md` and `voice-logging.md`.
- **The web dictation system:**
  - Whisper in the browser (`ux/Dictate`), the chat views (`ext/Chat` V1/V2/V3), the fast and smart assistants Servex spawns, and the new `audio/Recite` read-aloud.
  - It's mapped in [../dictation-map/map.md](../dictation-map/map.md). It's separate from the cloud voice agent.

**The owner (2026-11-01):** "I want to be able to put in a Bluetooth headset and have a voice call with the phone in my pocket… and simply just talk to Claude via the cloud voice agent… a voice remote."
- The voice agent passes questions to a mastermind (the VS Code tab, session `e00f55c9-…`, or a Servex agent) and hears the answers fast.
- "The faster that you guys can talk back and forth… latency is important to carry on a conversation."
- Ideas the owner raised:
  - a file it tails, with a byte offset carried on every update;
  - a task;
  - a Servex MCP message buffer;
  - the voice agent spawning a Servex assistant that keeps its hands free and relays;
  - an immediate "received" acknowledgement, so it can say "looking into it" and keep talking;
  - injecting into the VS Code tab's session (the CLI's `--resume` without forking?).
- The VS Code tab can't be pushed to except by a new prompt; check what hooks or `CLAUDE_CODE_MESSAGING_SOCKET` allow.

## Do

1. **`voice-agents.md`** in `public/framework/ai/doc/`, linked from `public/framework/ai/readme.md` and from `cloud-voice-agent.md`. It's read by every voice agent and every agent working with one. It covers:
   - the two systems above, side by side, as a system map;
   - the ways the owner talks: live voice mode vs the app's tap-to-send mic mode vs web dictation, and what each can and can't do;
   - which agent is which (cloud voice agent, voice-mastermind, the web fast and smart assistants, VS Code tabs, SDK agents), and how each spawns and messages others.

   Find the earlier system-map fan-out first (`node Server/PastWork.mjs voice`) and extend it; don't write a second one.
2. **Measure today's path:** the real latency of `ask_mastermind` / `updates` / `send_to_agent` / `wait_for_agent`, and where the time goes.
3. **Design and build the bridge in a worktree.** Target: an ack in under 1 s, and the first words of an answer arriving by themselves, without a minute-long blind wait. Measure it. Use `node Server/review.mjs`, and leave the merge to the owner. Ask-first items go in a list.
4. **The voice:** the agent can be asked to "switch your voice". That applies to the web read-aloud (Kokoro voices); the Claude app's own voice can't be changed by us. Say so in the doc.

## Fences

- Never call `restart_servex` during a voice call. No `python`. Commit by path.
- **You may spawn** helpers with `spawn_agent`.
- **Budget:** about $35.
