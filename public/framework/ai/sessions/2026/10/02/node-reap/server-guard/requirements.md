Budget: $2. Sonnet, medium effort. Main tree (this is a hook + a settings.json edit + a skill-change
*recommendation*, not a page — no worktree needed).

# server-guard: refuse `node server.js` / `run.js` in an agent's own shell

The owner's words (via the node-reap task, 2026-10-02): a PreToolUse guard that refuses agents
running `node server.js`/`run.js` and points them to the worktree URL. This is prevention piece 3
of 3 for the RAM leak node-reap.mjs just cleaned up (26 `node server.js` processes started from
agents' shells, never stopped — about 1.2 GB). Read that task's log first for the full picture:
`public/framework/ai/2026-10-02/node-reap/task.jsonl` and `requirements.md` (one directory up).

**Why this is safe to block outright, not just discourage:** Servex's reverse proxy already
auto-starts any registered project (main or a worktree) on its first HTTP request — "waking needs
nothing special." So an agent never needs to run a dev server by hand to see a page: hitting the
worktree's URL (or `start_server`) is enough. The only reason agents have been hand-starting
`node server.js` is old habit / old skill text (see step 2 below).

## 1. The hook — `.claude/hooks/server-guard.mjs`

Model it exactly on `.claude/hooks/git-guard.mjs` (read it first: same shape — PreToolUse on Bash
and PowerShell, JSON on stdin, `{tool_name, cwd, tool_input:{command}}`, blocks with exit 2 and the
reason on stderr, ALLOWS on any internal error ("fails open"), never touches anything outside the
command string itself).

**Refuse** (exit 2), regardless of cwd, a command that:
- runs `node server.js` or `node Server/run.js` (any path form — relative, absolute, forward or
  back slashes; case-insensitive on Windows paths) — including via `&`, `Start-Process`, or
  backgrounded with `PORT=... node server.js &`;
- runs `npm start` or `npm run dev` inside a repo checkout (main or a worktree) — these wrap the
  same server;
- the PowerShell form `Start-Process node ... server.js` (or `-ArgumentList` containing it).

**Allow everything else**, in particular:
- `node Server/worktree-up.mjs ...`, `node Server/worktree-down.mjs ...`, `node Server/merge.mjs ...`,
  `node Server/smoke.mjs ...`, `node --test ...`, `node --check ...`, and any other `node <script>.js`
  that is not `server.js` or `Server/run.js` itself;
- the string `server.js` appearing only as an argument/flag value to something else (be as literal
  as git-guard is — match the actual invocation, not every mention of the word).

**Message on refusal** (stderr, like git-guard's reasons): something close to "Servex starts dev
servers — agents don't. Hit the worktree's URL (the proxy auto-starts it on first request), or call
the `start_server` MCP tool. Never `node server.js` / `node Server/run.js` / `npm start` / `npm run dev`
by hand." Keep it one or two sentences.

Write `.claude/hooks/server-guard.test.mjs` in the same style as `git-guard.test.mjs` (read it for
the exact harness: `spawnSync` feeding JSON stdin, a BLOCK list and an ALLOW list, pass/fail
counters, exit 1 on any failure). Cover: both server.js forms, both npm forms, the Start-Process
form, backgrounded with `&` and with `PORT=` prefix, from both a main-tree cwd and a worktree cwd —
and on the ALLOW side, worktree-up/down/merge/smoke, `node --test`, and a command that merely
mentions "server.js" as a log filename or similar (should NOT be blocked — don't overmatch).

Run your own test file when done: `node .claude/hooks/server-guard.test.mjs` must exit 0.

## 2. Wire it into `.claude/settings.json`

Add a third hook entry to the existing `PreToolUse` → `matcher: "Bash|PowerShell"` block (the same
block that already runs `junction-guard.mjs`, `git-guard.mjs`, `jsonl-guard.mjs` — open the file,
it's right there, `~line 12`), same shape as the other three entries (`type: "command"`,
`command: "node"`, `args: ["${CLAUDE_PROJECT_DIR}/.claude/hooks/server-guard.mjs"]`, `timeout: 10`).

## 3. The skill-text conflict — flag it, don't edit the skill yourself

`.claude/skills/minion/SKILL.md` (~line 115, "node --check proves...") and its sibling
`sub-mastermind/SKILL.md` currently tell agents to run `PORT=<port> node server.js` by hand to
verify a `Server/`-tree change actually boots. That instruction will now be refused by this guard.
**Skills are the Servex mastermind's to change, not yours** (sub-mastermind skill, "Skills are the
Servex mastermind's to change"). So: do not edit those skill files. Instead write one paragraph into
this task's own `task.jsonl` (append it with `node .claude/hooks/append.mjs`, a `note` line) naming
exactly this conflict and the fix those two SKILL.md files need (replace "boot it yourself" with
"call `start_server`/hit the worktree URL, which auto-starts it, to confirm your `Server/`-tree
change actually boots — never `node server.js` by hand, a PreToolUse guard refuses it now"), and the
line numbers you found. The task mastermind will relay it to mastermind-servex.

## Tests
- `node .claude/hooks/server-guard.test.mjs` exits 0 (every BLOCK case refused, every ALLOW case let through).
- `node --check .claude/hooks/server-guard.mjs` passes.
- A manual check: pipe a blocking command's JSON into the hook by hand once and confirm exit code 2
  with a one-line reason on stderr; pipe an allowed one and confirm exit 0 with no output.

## Land
Commit directly in the main tree (this is a hooks + settings change, not a page — no review widths
apply). Tell the task mastermind when done with: what you blocked/allowed exactly, the test result,
and the note you appended to task.jsonl for point 3. Don't run `merge.mjs` yourself — the task
mastermind will fold this into the overall landing.
