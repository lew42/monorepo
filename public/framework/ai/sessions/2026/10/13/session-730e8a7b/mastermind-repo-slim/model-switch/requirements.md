# Models: which agent runs on what, visibly; Claude while tokens last, OpenRouter at the wall

Budget: $10. Load the `sub-mastermind` skill first. The owner's raw words: `../requirements-5.md`, ask 1 ("the smart assistant told me that we're configured to use open router tokens. I thought I reversed that yesterday… when we have Claude tokens we can just use Haiku and Sonnet for the fast and smart assistant… if we're still using open router and paying money when we don't need to be, that's bad… when we hit our token wall we need to switch to open router… I need to be able to see which agents are running what"). Your log is this dir's `task.jsonl`. CLAUDE.md: compute don't recall; show don't tell; a question is answered in the inbox.

## What the mastermind found (17:10)

- `Servex/agents/tiers.js`: every tier is `provider: "anthropic"` (fast/manager/architect Sonnet 5.5, scan Haiku 5.5). The owner's switch is `%LOCALAPPDATA%\lew42\servex\session-backend.txt` containing `openrouter` (read once at Servex load; delete it to go back); that file does NOT exist right now, so tiers resolve to Anthropic. The OpenRouter key exists at `%LOCALAPPDATA%\lew42\servex\openrouter.key`.
- `Servex/agents/Echo.js` (the voice echo mirror that cleans and structures a dictation) has a `model_for()` with an "OpenRouter trial" and a local-model-first path (`SERVEX_ECHO_LOCAL`); every `echo-*` agent in the registry ran on `google/gemini-3.8-flash` (OpenRouter) through 10-08. The `master-assistant` is Sonnet 5.5 (Anthropic). So what the smart assistant told the owner is either the Echo's OpenRouter trial, or stale knowledge: find which, with the line.

## Deliverable

1. **The truth, computed** (`Server/models-now.mjs`, read-only). One row per role in `roles.js` and per live/dormant agent in the registry (`GET :8090/agents`):
   - role, model, provider
   - where it came from (tier, role override, Echo `model_for`, the switch file)
   - last 24 h cost per provider, from the registry/spend files

   Print it, and render it as a live table on the existing models page (`/framework/ai/models`; find it): the owner's "which agents are running what". Two numbers must agree: agents counted vs registry rows.
2. **Put the assistants on Claude now:** the Echo's default `model_for()` resolves to the `scan` tier (Haiku) unless the switch file says openrouter; the fast assistant tier `fast` to Haiku 5.5 (the owner: fast = Haiku), `master-assistant`/smart stays Sonnet 5.5. One commit, a `decision` line, and a note that the change takes effect at the next Servex restart (the mastermind restarts; do not).
3. **The wall switch:** make the switch two-way and visible: `node Server/models-now.mjs --backend openrouter|anthropic` writes/deletes the switch file and prints what will change at restart; the models page shows the current backend and the Claude week/5 h usage beside it (from `usage.json`); document in `Servex/ext/openrouter/readme.md` in five lines: when to flip, how, what it costs. Do not flip it yourself.
4. **Answer the owner** with one `owner_note` (kind `decision`): what the assistants are on right now, what the Echo was on, what changes at the restart, and where to see it live.
5. Report on your card: the table's top rows, the note, the link.

Fence: `Servex/agents/tiers.js`, `Servex/agents/Echo.js` (`model_for` only), `Server/models-now.mjs`, the models page module, `Servex/ext/openrouter/readme.md`, this task dir. Servex code is tested from a worktree on a private port; no live restart by you. Sonnet.
