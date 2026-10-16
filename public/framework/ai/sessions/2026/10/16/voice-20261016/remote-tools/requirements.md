Budget: $10

# Servex: general file and shell tools in the registry, so the voice app is a full remote control

Helper brief from mastermind-voice-20261016 (voice session 2026-10-16). Card: 2026/10/15/voice-session-2026-10-16-19-06. Sonnet.

## The owner's words (voice, question 93b1c32d)

> add general tools to the servex registry so the voice app is a full remote control: read_file, write_file (or edit), list_dir/glob, and a shell tool (bash/PowerShell, whatever agents use), all rooted at the monorepo with worktree root option. No lockdown; owner accepts the risk; convenience over security. Design for extension: adding a tool must not require app re-approval churn; note any MCP-side way to reduce that.

## What to build

1. Five tools in the one Servex tool registry (the same one `Servex/ext/remote/RemoteMCP.js` serves at POST /mcp/remote, via `servex.mcp.tools`; see how `Servex/pages.js` registers with `tool(...)`): `read_file`, `write_file`, `edit_file` (exact string replace), `list_dir` / `glob`, and `shell` (run a command, Git Bash or PowerShell as the caller picks; return stdout, stderr and the exit code, with a timeout).
2. Paths resolve against the monorepo root by default; an optional `root` argument takes a worktree name or path (`C:/Code/lew42/worktrees/<name>`). No lockdown beyond what exists: the remote endpoint is already behind its bearer token. Never break the existing loopback rule for the local MCP (memory: dev-server RCE note); these are remote-token tools.
3. A `.jsonl` write through `write_file` should go through the append/validate path (`.claude/hooks/append.mjs`) or refuse with a pointer, so the live pages never break.
4. **Extension without re-approval:** find out whether the Claude app re-asks approval when `tools/list` changes, and write down the MCP-side ways to reduce that churn (e.g. a `tools/list_changed` notification, or one generic `call(tool, args)` dispatcher whose list never changes). Build whichever is cheapest that works; record the alternative.
5. A short doc beside the code (`Servex/ext/remote/doc/remote-tools.md`), linked from `Servex/ext/remote/readme.md` (or its parent readme).

## Rules
- Coordinate with helper-tool-collapse (it is reshaping the tool list, plan at `public/framework/ai/doc/tool-collapse.md`) via send_to_agent before editing the registry.
- Work in a worktree, commit, merge to michael/dev. Servex needs a restart to load new tools: do NOT restart during the owner's voice call; say on the card that it takes effect on the next restart.
- Report on the card, one screen of plain sentences.
