# Item tool: parse `call` args sent as JSON text

Found 2026-11-09 by the mastermind: `item({call: "tasks.add", args: {...}})` from a client whose tool schema showed `args` as a string made a task titled with the whole JSON (session.jsonl, task `id-plugins-mvp-title-plugins-mvp-a-demo`, fixed by hand).

Fix (`Servex/agents/page_tools.js`): `parse_args` turns JSON text that parses to an object or array into that value, and leaves any other string alone (`remove: "c1"` takes an id). The schema now types `args` explicitly. Test: `node Servex/agents/item-verbs.test.mjs` (13 checks). Doc: `Servex/doc/item-tool.md`. Live after the next Servex restart.
