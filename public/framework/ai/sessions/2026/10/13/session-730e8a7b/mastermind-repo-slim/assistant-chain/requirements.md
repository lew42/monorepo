# Assistant chain: one global assistant; fast per sentence, smart watches, mastermind gets the refined prompt

Budget: $15. Load the `sub-mastermind` skill first, then `.claude/skills/every-prompt/SKILL.md` and `tiers.md`. The owner's raw words: `../requirements-3.md`, ask 4 ("one global assistant should be the way to go… a fast assistant that does the transcribing… a smart assistant, a variant of the fast one, keeping an eye on how everything is working, giving feedback, hands-off on decisions… the refined prompt gets sent to a mastermind as quickly as it's available, not per sentence… every time Whisper transcribes a sentence it gets processed immediately for a response on screen… I wish that were working"). Your log is this dir's `task.jsonl`. CLAUDE.md: one of everything; the owner's words; never destructive; keep working.

## What exists

- Roles, in `Servex/agents/roles.js`: `assistant` (fast), `page-assistant`, `master-assistant` (Sonnet today, `Global.js master()`), `page-mastermind`.
- Classes, in `Servex/agents/`: `Assistant.js`; `Echo.js` (mirrors the voice echo); `Layers.js` (spawns a pair per page: the design the owner now rejects); `Dispatcher.js`.
- Refine: `ext/Refine` (`RefineSystem`, stages, `voice-to-page.md`: voice shows up on the session page stage by stage).
- Dictate: `ux/Dictate/doc/handover.md`, `chat.md`. The dictate-check sibling task owns it today; stay out and read its card.

## Deliverable

1. **Map the chain as it is** (`Servex/agents/doc/assistant-chain.md`, one screen, computed where possible): what happens to one transcribed sentence today, hop by hop (Whisper → ? → ? → a mastermind), with the file and function at each hop, the model, and the measured latency of each hop on one real sentence (headless; the voice walk in `ux/Dictate/doc/try-it.md`). Where a hop is per-page (Layers.js pairs), say so.
2. **The decision** (a `decision` line + the doc): one global assistant session per owner, not per page: the fast assistant (Haiku or Sonnet low) answers each sentence on screen within ~2 s and appends it to the current refinement; the smart assistant is the same session at a higher tier woken on a batch boundary (a pause, a "send it off", or N sentences), watching and suggesting, launching nothing; the refined prompt (`ext/Refine`'s JSON, deltas) goes to the standing mastermind once per batch. Say which existing class becomes which (rename nothing today; aliases if a name must change), what Layers.js's per-page pair becomes (a page CONTEXT the global assistant carries, not a separate agent), and the one rule that keeps context across navigation.
3. **Build the smallest working slice**: the global assistant receives per-sentence lines from the Dictate stream and answers on the page the owner is on (through `Echo`/the existing card reply route), and a batch boundary posts the refined prompt to the mastermind inbox (`say.mjs`/the run task's `chat` lines). Prove it headless with one three-sentence dictation: three fast replies, one mastermind hand-off, timings in the log. Behind a flag so the current path keeps working until the owner flips it; say the flag on the card.
4. Report on your card: the hop map in five lines, the decision, the proof timings, the flag.

Fence: `Servex/agents/Assistant.js`, `Echo.js`, `Global.js`, `Layers.js` (flagged changes only), `Servex/agents/doc/assistant-chain.md`, `.claude/skills/every-prompt/tiers.md` (one line), this task dir. Servex code is tested from a worktree on a private Servex port (never the live one); the live Servex is restarted by the mastermind, not you. `ux/Dictate` and `ext/Refine` are read-only for you today.
