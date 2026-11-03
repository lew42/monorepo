# How the Servex mastermind is restarted and handed over

**Verdict:** a restart is reliable. A handover works, but only because each instance remembers to write a checkpoint, so it's driven by memory, not by a tool.

| Event | What carries me across | Reliable? | Evidence |
|---|---|---|---|
| Servex restart (5 today) | The registry row plus the session id; the agent is resumed at boot | Yes, **when** the restart really restarts Servex | Survived 18:29 and 20:43. The 18:27 restart left Servex running and every agent dead (fixed by task restart-outside-tree) |
| Context fills and a fresh instance takes over | `checkpoint-N.md`, written by hand at about 200–256k, then a fresh spawn told "read the checkpoint" | Partly | checkpoint-3 got me started in one read. But nothing makes an instance write it, and -3 wrote its checkpoint at 256k, past the 200k limit |
| Which instance is "the" Servex mastermind | `Global.js` `holder()` routes to the newest live `mastermind-servex-N` | Yes | Messages reached -4 all day. mastermind-servex-3 still sits idle (it costs nothing, but it's clutter) |
| What was decided | task.jsonl `log` lines, the cards, dispatch.md | Yes | 36 lines today |

## Make it tool-driven (proposed; a brief once the audit lands)
1. **The heartbeat watches context, not just silence.** At 150k tokens, node sends "write checkpoint-N now: decided, running, ready, pending, lessons".
2. **Node assembles the handover.** The fresh instance's first prompt = `first_prompt(dir, [latest checkpoint, the last 15 task.jsonl lines, list_cards open])` (readme-chain's seam). No "read this first" instructions for the AI to remember.
3. **Retire the old instance** once the new one's first turn ends: stop it (it has no children), and log it.
