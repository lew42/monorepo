# Minion 1 — readme_chain(dir) + wiring + docs + proof

Load the `minion` skill first. Your brief's folder (raw owner words, task log):
`public/framework/ai/2026-09-29/readme-chain/` (also see `requirements.md` there).

You are working in worktree `C:\Code\lew42\worktrees\readme-chain` (branch `worktree/readme-chain`,
already checked out, dev server already running — don't start or restart anything).
Its own task log for YOUR steps: append to `public/framework/ai/2026-09-29/readme-chain/task.jsonl`
with `node .claude/hooks/append.mjs` (write the JSON array with the Write tool first, per the
new-task skill), same session id conventions as any minion.

## The owner's ask (verbatim, from the task's requirements.md — read that file, it has the full
quote). Short version: every agent Servex spawns FOR a directory or a page should open already
having read the readme.md chain from the repo root down to that directory, in order, so it knows
"where it is" before it does anything.

## Architect's constraints (mastermind-servex-4, binding — read these before you build)

- **Skip the root `CLAUDE.md`** — it's already injected into every agent's context separately;
  don't duplicate it.
- **Trim each readme to its first screen**: up to the first `## More` heading, or its first
  **40 lines**, whichever comes first. Below that, just give the file's path so the agent can
  read the rest itself on demand.
- **Cap the whole chain at about 3,000 tokens** (rough: chars/4). If it's over, cut from the
  **top** first — the most general readme (root, then `public/`, then …) gets dropped before
  anything closer to `dir`. Always keep at least the readme for `dir` itself, if one exists.
- **Export a `first_prompt(dir, extras = [])` seam**, not just `readme_chain(dir)`. Another
  program (`task-placement`, building a "Recent sessions" block) will call
  `first_prompt(dir, [{label: "Recent sessions", text: "..."}])` and get the readme-chain block
  plus each extra's `label`/`text` appended, so it never has to touch your formatting code.
  `readme_chain(dir)` alone should return the raw list `[{path, text, truncated}]` (so callers
  who just want the data, not the formatted prompt, can use it too).

## 1. Build `Servex/agents/readme-chain.js` (next to `brief.js`)

- `readme_chain(dir)` — `dir` is a repo-relative or absolute path. Walk from the repo root down
  to `dir`, segment by segment (root, then each path segment: e.g. for
  `public/framework/ux/Dictate` → root, `public/`, `public/framework/`, `public/framework/ux/`,
  `public/framework/ux/Dictate/`). At each level, look for `readme.md` or `README.md`
  (case-insensitive — check both spellings) and include it if it exists. Skip levels with no
  readme. Return `[{path, text, truncated}]` in root-to-leaf order, each `text` trimmed per the
  constraints above, `truncated: true` if you cut it short.
- `first_prompt(dir, extras = [])` — formats the chain as one labelled block: start with
  `Where you are: readmes from the root down to <dir>`, then each readme as its path + trimmed
  text (mark truncated ones so the agent knows to read more), then apply the ~3k token cap
  (cut from the top), then append each of `extras` (`## <label>\n<text>`) after the chain.
  Return the whole string.
- Plain functions, no class needed (match `brief.js`'s style: small, pure, never throws — wrap
  file reads in try/catch and just skip a readme it can't read).
- A short unit-style check is enough (a `.mjs` you run by hand and delete, or add a
  `readme-chain.test.mjs` beside `brief.js`'s siblings if you see a test pattern to match —
  check `layers.test.mjs`/`groups.test.mjs` for the house pattern first).

## 2. Wire it into the spawn paths that are FOR a directory or page

Read `Servex/agents/Agents.js` around `spawn(spec)` (~line 81-102) — this is the one true spawn
path everything else calls. The prompt is built at line 88: `this.whoami(id) + opening(spec.role,
spec.prompt)` (fresh) or `spec.prompt` (resume/system). Add the readme chain there for a FRESH
spawn (never a `resume` — a resumed session already has it) whose directory we can name:
  - `spec.task?.dir` (a task mastermind, or any agent opened with `task: {dir, card, brief}` —
    this is how `spawn_agent`'s `task` option and Dispatcher.js's dispatched tasks both work).
  - `spec.page` if present (a page-bound agent — check `Dispatcher.js` and `Layers.js` for where
    `page` or a page path is passed; wire it wherever a page path reaches `spawn()`).
- Also check `Servex/agents/Layers.js` — `spec(card, role)` and `open(card, role, prompt)`
  (~line 172-215): the card assistant/manager `prompt()` closures build the first message for a
  FRESH card agent (`!how.resume` — check `agent.layers_fresh` at line 211). Their directory is
  the card's own task dir, `public/framework/ai/<card>` (repo-relative) — per the sub-mastermind
  skill's convention that a card's directory IS its task dir. Prepend the readme chain (via
  `first_prompt`) to the `assistant(card)` and manager prompts, ONLY on a fresh spawn.
- The ☰ **drawer's page AI**: confirm whether it's this same Layers.js assistant/manager
  mechanism bound to a non-`ai/` page path, or something separate — grep `ext/drawer` and
  `ext/Chat` for where it calls `spawn_agent` or talks to Layers. If it's the same mechanism,
  no extra work; document which it is. If it's separate, wire it the same way (fresh spawn only,
  directory = the page it's open on).
- **Keep it OUT of plain minions** (`role: "minion"` with no `task.dir`/`page`) — a minion whose
  brief already names a directory gets that directory named IN the brief text, not this chain;
  don't touch the plain-minion path.
- Read `Global.js` too (master/sub-mastermind revival spawns, ~line 115, 150) — these resume an
  existing session or say "You are on duty. Answer nothing now." with no directory; leave them
  alone unless you find a directory-bound fresh spawn there.

## 3. Document it

- `Servex/doc/readme-chain.md` (or add a section to an existing doc file if one already covers
  Agents.js/spawn — check `Servex/doc/` first): one screen — what it does, the seam
  (`first_prompt`), the token cap, where it's wired in, where it's deliberately left out.
- One line each, appended (don't rewrite the file) to:
  - `.claude/skills/sub-mastermind/SKILL.md`
  - `.claude/skills/minion/SKILL.md`
  Something like: "You start with the readme chain for your directory (root down to it, first
  screen of each); read deeper docs on demand." — adjust to fit each skill's own voice and place
  it near where the agent's opening context is already described. Ask first if a skill file says
  not to edit it without asking (SKILL.md files don't — only the root CLAUDE.md does).

## 4. Prove it

Spawn a **private Servex** (don't touch the live one) and, on it, spawn a test agent bound to
`/framework/ux/Dictate/`'s directory (`public/framework/ux/Dictate`) the same way a task
mastermind would (`task: {dir: "public/framework/ux/Dictate", ...}` or however your wiring keys
off a directory). Capture its actual first prompt (from the agent's own session transcript, or
by having it echo back what it received) and confirm it contains, IN ORDER: the root readme,
`public/`, `framework/`, `ux/`, `Dictate/` readmes (whichever of those exist — check with `ls`
first, some levels may have none). Save the transcript/proof under
`public/framework/ai/2026-09-29/readme-chain/proof/` (a short .md or .txt is fine) and note the
private Servex's port so it can be checked. Stop the private Servex when done (don't leave it
running as a hidden process — no popup windows, `windowsHide: true` on anything you spawn).

## Land

- Commit inside this worktree branch (`worktree/readme-chain`).
- Log each step in the task's `task.jsonl` as you go (`decision`, `log`, not just at the end).
- Do NOT run `Server/merge.mjs` or touch the live Servex — the mastermind (me) does the merge and
  the one restart at the end.
- When done, `card_reply` isn't yours to send — tell me (send_to_agent to
  `task-mastermind-readme-chain`) that it's ready, with the commit and the proof file path.

## Never

No pop-up windows from any spawned process. Don't edit files outside
`Servex/agents/`, `Servex/doc/`, `.claude/skills/sub-mastermind/`, `.claude/skills/minion/`, and
your own task dir under `public/framework/ai/2026-09-29/readme-chain/`.
