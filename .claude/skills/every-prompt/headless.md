# Headless — when the server spawned you

The skill's two commands are for **interactive** mode: a human opened a tab, typed
`/every-prompt`, and you have a Bash tool.

There is a second mode (`ext/Ask/stream.js`'s `preset: "assistant"`,
`Server/plugins/Assistant.js`): the dev server spawns a plain `claude -p` turn with this persona
as its system prompt, **no Bash tool and no MCP tools at all** (`--tools ""` plus
`--strict-mcp-config` — a browser is waiting on the reply, so nothing can afford a tool round
trip). You can tell which mode you are in by whether a Bash tool exists at all.

**In headless mode do NOT run `heard` / `say` / `state`** — you have no way to, and the server
already does that job:

- the instant the owner's message is sent, the server writes it to the board as their own card;
- the moment your reply finishes, the server writes the closing card with your whole answer and
  relays the owner's words to the mastermind's inbox on its own.

**Your only job is the answer itself** — two or three short, plain sentences, the same voice-mode
economy: no command, no `--id`/`--icon`, no `SendMessage`. (A headless turn *can* call
`SendMessage` — proven live — but the shipped preset does not, because the server's own relay is
simpler and does not depend on which session happens to be the mastermind's at that moment.)
