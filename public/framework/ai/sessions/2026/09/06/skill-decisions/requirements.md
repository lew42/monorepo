# skill-decisions — the four proposals, decided (Sonnet)

Read first: `../../2026-09-04/mastermind-platform/minion-rules.md`. Skills: `new-task` (this dir, group `ai-ops`), `finish-task`. The mastermind has decided each of the four proposals left in `.claude/skills/*/improvements.md` on 2026-09-05. Apply the decision, keep each skill reading in one voice, then delete the entry.

1. **`new-css-class`** — the view-class census becomes a numbered step. Wording: "List every view class you declare (`grep -n 'class [A-Z]' <your files>`): `classify()` mints a CSS class from each constructor name in the chain, so `Stage` wears `.stage`. Check each minted name against the census like any other class; prefix it with the module when it collides." The trap line that is already in the skill stays as the evidence.
2. **`new-task` §2** — the fence wins. Add one sentence after the usage refresh: "If your brief's write fence excludes `ai/usage.json`, skip this refresh — the mastermind keeps the snapshot current — and log that you skipped it."
3. **`mastermind`** — the mastermind's own private server runs on **port 8123**, outside the minion range (`809x`), and a brief that starts a server names the port it may use. Add that to the private-server recipe in `SKILL.md`. In `minion-rules.md` (this run's copy at `../../2026-09-04/mastermind-platform/minion-rules.md`) confirm the line "kill only the pid you started; never a port you did not open" exists; add it if not.
4. **`ui-test`** — `drive.mjs` stops writing into the repo. Change its default `out` to `path.join(os.tmpdir(), "claude-ui-test")` (read the file; keep its flag name), and say in `SKILL.md` that `--out` should point into the session scratchpad. If an untracked `ui-test-out/` exists at the repo root, delete it (check `git status --porcelain ui-test-out` first; it must be untracked).

## Prove it

`grep -c 2026-09-05 .claude/skills/*/improvements.md` reads 0 for every file. `node .claude/skills/ui-test/drive.mjs` with no `--out` writes under the temp dir, not the repo — run it once against any static file url or its own help and show the path it chose. `git diff --stat .claude/skills` in your log.

## Fences and budget

Write only `.claude/skills/**`, the minion-rules file named above, and this task dir. Never `CLAUDE.md`. No server. Never `find /`; never spawn agents; never `git stash`/commit. Budget ~60k tokens. Report in ≤ 6 plain lines.
