# send_to_agent: take `{to, message}` as well as `{id, text}`

**Why:** agents (assistant-toggle, recite-cue-icon, in-flight-real-data, 2026-11-02) called `send_to_agent` with `to` and `message`. With only `id` and `text` accepted, the call failed, and they reported "vscode-mastermind isn't a live agent". Filed in `public/framework/tasks/readme.md`.

**Change:** `Servex/agents/tools.js` accepts both spellings and names the missing field. Test: `Servex/agents/send-alias.test.mjs`.
