# prompt-relay — a hook that relays every prompt the owner gives the assistant, verbatim, without the assistant having to remember

Load the `minion` skill first. Then this brief. Model: Sonnet. Small: one hook script, its tests, a settings snippet for the owner. **You do not edit `.claude/settings.json`.**

**Three laws.** Less is more. Clear beats brief by far. Prioritize (the relay first; the identity refresh second; the prompt log third).

## The owner's words (2026-09-19, through the assistant)

> the assistant should automatically relay everything I say to the mastermind. In fact, the assistant skill should be used for every prompt, so it refreshes its understanding of who it is and what it should be doing. Also, when a skill is used, aren't there skill hooks where every time a skill is used we can fire something programmatically on the server? […] my words should probably be transcribed in real time into the log, time stamped, author me, verbatim.

## What exists

- `.claude/skills/assistant/` — `SKILL.md` and `say.mjs` (`state`, `say`, `relay`, `both`; `relay` appends `{"chat": {at, from: "owner", via: "assistant", msg}}` to the newest unlanded `ai/<date>/mastermind-*/task.jsonl` — reuse its `run()` and `now()` by importing or copying the ten lines; say which and why). Today the assistant (a Sonnet at low effort) must REMEMBER to relay; its first run forgot entirely. A check beats a sentence.
- `.claude/hooks/ledger.mjs` is wired in `.claude/settings.json` for `SessionStart`, `PostToolUse` (`Edit|Write|NotebookEdit` and `Skill`), `Stop`, `SessionEnd`. It already sees every Skill load with its `session_id` (the `Skill` branch logs `skill: <name>`). `UserPromptSubmit` is NOT wired. `syntax-guard.mjs` beside it shows the house pattern: a separate file, imported inside a try, never throws.
- Claude Code's `UserPromptSubmit` hook receives JSON on stdin (`session_id`, `prompt`, `cwd`, `hook_event_name`) and whatever it prints to stdout is added to the model's context for that turn. Confirm the exact field names against the docs the `claude-code-guide` facts you can find locally (`claude --help`, the installed package's docs) — do not browse the web.

## Build

1. **`.claude/hooks/prompt-relay.mjs`** — run as `node prompt-relay.mjs` on `UserPromptSubmit`:
   - **Is this session the assistant?** A session becomes "the assistant" when it loads the `assistant` skill: add to `ledger.mjs`'s existing `Skill` branch ONE try-wrapped call that, when `tool_input.skill === "assistant"`, writes a marker `claude-assistant-<session_id>` in the OS temp dir (and removes nothing else). Also treat a prompt that IS the slash command (`/assistant`) as the marker moment. The mastermind's own session must never be marked: a session that has loaded `mastermind` is never an assistant.
   - **For an assistant session, on every prompt:** append the prompt verbatim to the mastermind's inbox (the same `chat` line shape, `via: "assistant-hook"`), skipping empty prompts and slash commands; and print to stdout a three-line identity refresh the model will see: who it is, the one command it must run first (`say.mjs both …`), and "your words were relayed by the hook already — do not relay again, use `say`" — then update the assistant `SKILL.md` so its `both` guidance matches (relay is now the hook's job; the doorbell `SendMessage` stays the assistant's).
   - **For EVERY session, assistant or not:** append `{"prompt": {at, session_id, author: "owner", text}}` to a daily log OUTSIDE the repo's served tree — the OS temp dir is wrong (lost on reboot), `public/` is wrong (served to the LAN, and transcripts carry personal details): use `<repo>/.claude/prompts/<YYYY-MM-DD>.jsonl`, add `.claude/prompts/` to `.gitignore`. This is the owner's "my prompts are only in the VS Code tabs": one greppable file per day. Never log a prompt that contains what looks like a secret (a line matching common key/token patterns) — write `[withheld: looked like a secret]` instead.
   - Never throws, never blocks the prompt, exits 0, under ~50 ms.
2. **The settings snippet** — the exact JSON block for `.claude/settings.json` that wires `UserPromptSubmit` to it, in your landing and in `.claude/hooks/readme.md`. **Do not apply it**: the owner approves config changes themselves.
3. **Tests, by piping JSON into the scripts** (the mastermind's pattern: `spawnSync(node, [script], { input })`): an unmarked session relays nothing but logs the prompt; after a simulated `Skill: assistant` PostToolUse for session X, X's next prompt lands in a SCRATCH run ledger (point the script at a test root with an env var, e.g. `LEDGER_ROOT`, which `ledger.mjs` already honours — never write test lines into the real run's task.jsonl); a `mastermind` session is never marked; a secret-looking prompt is withheld; a slash command is not relayed; timing.

## Rules

- `new-task` before the first edit (your dir: `ai/2026-09-19/prompt-relay/`); `code`, `documentation`; `finish-task`.
- **Fence:** `.claude/hooks/prompt-relay.mjs` (new), ONE try-wrapped line in `.claude/hooks/ledger.mjs`'s Skill branch (a sibling, `page-health`, is adding one line beside the syntax guard in the SAME file today — re-read it immediately before your edit and keep both), `.claude/hooks/readme.md`, `.claude/skills/assistant/SKILL.md` (the relay paragraph only), `.gitignore` (one line), your task dir. **Never `.claude/settings.json`, never `CLAUDE.md`.**
- `ledger.mjs` runs on every tool call of every agent: `node --check` it after your one-line edit and run the pipe test before anything else. A broken hook stops every agent in the repo.
- Never kill or restart the dev servers (ports 80 and 8123), never `git stash`, never `find /`, never commit. Write files with the Write or Edit tool, never a bash heredoc. Do not write the owner's name anywhere.
- Landing `outcome`: one screen — what the hook does per session kind, the tests as pass/fail, the settings snippet, what was left and why.

## Addition from the owner (2026-09-19, mid-task, relayed by the mastermind)

> every owner prompt shows word for word in the dev bar log the instant it is submitted, before any answer. Very fast response time.

So for an ASSISTANT session the hook, besides the inbox line, also appends the prompt to the V3 board as the owner's own card: `{"card": {"at": …, "id": "o-<HHMMSS>", "author": "owner", "session": "<session_id>", "title": "<first 90 chars>", "text": "<the whole prompt, verbatim>"}}` in `public/framework/ai/v/3/board.jsonl` — that file streams to the dev bar, so the words are on screen with no model in the loop. The assistant skill does this by hand today with `say.mjs heard "<words>"`; once the hook is wired the skill's `heard` step must go, or the owner sees every prompt twice: the relay paragraph is written for the hooked world, with the un-hooked fallback in one sentence. Stamp `session_id` on the inbox line too — the owner asked how a tab's session id can be found, and the hook is the clean answer. Tests: the card line lands in a SCRATCH board file, using the same `LEDGER_ROOT` override the inbox lookup already needs (see the decision log for why one env var covers both).
