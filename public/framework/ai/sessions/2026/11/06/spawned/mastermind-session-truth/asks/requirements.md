# Auto-file asks: one ask shape, every channel, by code

Budget: $20

Read `../brief-common.md` first.

## The ask (deliverable 1 of the parent task)

Every owner prompt on any channel (the VS Code hook, the voice app, an SDK / Servex chat, the phone sheet) writes ONE line on that session's record, an ask with its words and `via` (`"vscode"`, `"voice"`, `"sdk"`, …), and that line IS a task on the session's `tasks` list: it counts in `completion_score()` and `tally()` until an agent closes it with an outcome, or marks it no-action with a why. One "ask" shape replaces today's three: the `Prompt` item in `content` (`.claude/hooks/prompt-relay.mjs:245`, `public/framework/core/Task/Prompt.js`), the voice chat line, and the essence prompt. Find all three writers and every reader first (chat v2/v3, the session page, Refine, Echo `Servex/agents/Echo.js`, PromptAudit) and log the map.

Decisions (mine; change one only with a logged reason):
- The line is a method call on the session: `{"ask": {"text": "<words>", "via": "vscode"}}` calls `Session.ask()`, which adds a `Prompt` (or a Task subclass if Prompt does not fit) to `tasks`, with the words, `via` and a short title. Words are stored once. The owner wrote `{"ask":"<words>","via":"…"}`; in the item grammar a sibling `via` key would be assigned to the session itself, which is why it nests. If the flat shape can work cleanly, prefer it.
- ONE node writer (a class such as `Server/Ask.mjs`, or a method reached through the item tool) that every channel calls; no channel hand-writes the line.
- Old lines (Prompt in content) still replay and render; history is not migrated.
- Skip harness turns, slash commands and agent-to-agent messages (they are not the owner's words); keep the secret redaction.
- A separate agent is changing `Task.completion_score()` at the same time (a session with nothing to score returns `null`; a `null` part is left out of a mean). Do not edit `completion_score()` / `score_parts()` / `tally()` yourself; if you need a change there, log it and tell the mastermind.
- Test: per channel writer, a prompt leaves exactly one ask line and one open task on the right session record, and the readers still draw it.
