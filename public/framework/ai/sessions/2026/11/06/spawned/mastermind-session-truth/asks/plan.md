# Asks: one shape, every channel (plan as built)

The owner's direction (relayed 21:50) replaced the `{ask}` line: every turn is `{"refined":{at,re,sentences,sections,via,by:"code"}}`, the shape the browser voice model already writes.

| Piece | Where | Change |
|---|---|---|
| Writer | `Server/Ask.mjs` | `Ask.refined/write/split/redact/skip/turn_id`; one splitter (ext/Refine `quick_clean`), secrets withheld |
| VS Code | `.claude/hooks/prompt-relay.mjs` | `Ask.write(..., {turn:true})`: the counted Prompt item plus the refined line |
| SDK, V1, phone sheet | `Servex/agents/Sessions.js` `say()` | writes `Ask.refined` right after the chat line |
| Claude-app voice | `Servex/ext/remote/RemoteMCP.js` `record()` | refined line beside each `owner_words` line |
| VS Code sections | `Servex/agents/Echo.js` | second refined line with the same `re` (sections); only when `SERVEX_ECHO=on` |
| Reader | `core/Session/Session.js` `refine_turn` | turn = one open Prompt task; each section item = a child task with cites; no sections = one open item |
| Item tool | `Servex/agents/page_tools.js` SESSION_KEYS | `refined` accepted as a session line key |
| Tests | `Server/Ask.test.mjs`, `Session.test.mjs`, `RemoteMCP.test.mjs` | one per channel, scratch folder, nothing posted to a real log |

Not touched: `Task.completion_score/score_parts/tally`. Known gaps: the `Servex/agents/Sessions*.test.mjs` family cannot load the SDK in a worktree (no node_modules; run from the main tree after merge); VS Code sections need `SERVEX_ECHO=on`. A Servex restart is needed.
