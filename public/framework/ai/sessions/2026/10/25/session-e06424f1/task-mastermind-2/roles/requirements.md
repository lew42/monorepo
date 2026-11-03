# Roles: what the fast seat and the smart seat do, and the "working" sign

Budget $4, Sonnet. Load the `minion` skill first. Parent: task-mastermind-2 (plan: [../plan.md](../plan.md)). Worktree: `node Server/worktree-up.mjs chat-roles`; commit by exact path; never edit the main tree; never restart Servex or the dev server (a Servex restart is the owner's call; report that it is needed).

Read: [dictation-debug/handoff.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/handoff.md) (the owner's new asks 1-7), `ux/Dictate/doc/wake-policy.md`, `ux/Dictate/doc/pipeline.md`, `core/Task/doc/prompt-record.md`, `Servex/agents/roles.js` (`voice-assistant`), `Servex/agents/session-smart.md`, `.claude/skills/voice-assistant/SKILL.md`, `core/Task/Prompt.js`, `core/Task/Question.js`.

Your fence: role texts (`Servex/agents/*.md`, `roles.js`, the voice-assistant skill) and the `working` field in `core/Task/Prompt.js` and `Question.js` plus their tests. NOT `ext/Chat/**` (another minion owns it) and NOT the wake policy (a sibling task owns it).

## Do

1. **Fast seat:** it places each sentence (a new Prompt, or adds to the last one) and makes a `Question` item (with `from`) when a sentence is a question, nothing else. Check the item tool accepts a Question line in a session file. If the Servex writer must change to map `{place}` onto Prompt lines (prompt-record.md defects 1 and 2), WRITE THE EXACT CHANGE as a proposal in `proposal.md` here; do not edit `Sessions.js` or `PromptLines.js` (Servex-side; the owner restarts).
2. **Smart seat:** it writes titles, restructures, and states outcomes. Cards converge: every prompt is one title plus one cleaned paragraph; a topic shows RANKED conclusive outcomes first, then open decisions; merge or shrink rather than keep adding; raw sentences tuck inside. Text uses real markdown lists (`- ` / `1. `).
3. **Working sign:** define once in `Prompt` and `Question` a line field `working:{by,at}` (cleared by `working:null`), exposed like the other line fields, with tests. Add one line to the smart seat's role text: set it with the item tool when it has seen a question or card and starts writing the answer; clear it when the answer is written (or on giving up).
4. Update the readmes these touch.

## Land

Run the touched `*.test.mjs`. Log findings in your own task log; report one screen: what changed, what needs a Servex restart, the proposal if any. Do not merge.
