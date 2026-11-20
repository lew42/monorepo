# Tool diet: list ~9 Servex tools, reach the rest through `call`

**The ask** (the owner, 2026-11-19, [cloud-voice-mcp-tool-diet](../../cloud-voice-mcp-tool-diet/session.jsonl)): "one item tool that can do anything ... I don't know why there's 107 tools ... get it done."

## Before / after (listed tools per door)

```
Local door   105 → 9    item call send_to_agent spawn_agent list_agents stop_agent close_task wake_me log
  + voice seat          say nothing retract_say | session_line session_summary
  + allowed_tools agents keep their own names (Echo, Assistant, Global, Layers)
Remote door  109 → 10   item call updates send_to_agent spawn_agent list_agents shell read_file figma cloud_voice_log
SDK agents              mcp__local__item only (was item + 5 page tools)
Hidden, still callable  every other handler, via call({tool, args}); call({tool: "list"}) lists them
Rollback                SERVEX_LIST_ALL=1
```

Code: [Servex/Listed.js](/Servex/Listed.js), `dispatch` in [Servex/MCP.js](/Servex/MCP.js). Numbers: [tool-collapse.md](/framework/ai/doc/tool-collapse.md).

## Why it never landed (asked at least 8 times)

- [x] 09-25 "the whole context bloat" ([owner-prompts.jsonl:393](/framework/ai/sessions/2026/10/12/session-d4cd44ab/asks-by-module/owner-prompts.jsonl)): folded into a design job
- [x] 10-12 "We don't want too many tools ... a fewer number of universal tools" ([owner-prompts.jsonl:4491](/framework/ai/sessions/2026/10/12/session-d4cd44ab/asks-by-module/owner-prompts.jsonl); found by the helper, [ask-history.md](ask-history.md)): fed the item tool design
- [x] 10-15 `dfa4d219`: plan only, it needed a restart nobody scheduled
- [x] 10-16 `call` first, Item.set last ([owner-words.md](/framework/ai/sessions/2026/10/16/voice-20261016/owner-words.md)): recorded, not built
- [x] 10-20 three dictations (`0ef1a0e6`, `6dbbb5ef`, `0e6cdf76`, [prompts.jsonl](/framework/ai/sessions/2026/10/20/session-e00f55c9/prompts.jsonl)): filed as notes
- [x] 11-06 `item` get/set/call landed, no tool removed
- [x] 11-08 the item-tool card (/live/plan/item-tool/) waited on a yes; none of its eight merges landed
- [x] 11-19 this round: built, merged, restarted

**Cause:** each round designed the end state (fold handlers into Item), and listing fewer tools waited behind it.

## Not done here

- Folding handlers into `item` (the 11-08 plan): a code cleanup, not a context saving; queued in [ai/todo.md](/framework/ai/todo.md).
- Trimming the remaining listed descriptions (`item` 2.9k chars, `send_to_agent` 1.9k).
