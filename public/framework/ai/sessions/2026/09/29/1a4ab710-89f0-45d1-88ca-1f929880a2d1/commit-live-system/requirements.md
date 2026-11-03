# Commit the live system code, in sensible groups

About 240 files in the main tree are uncommitted, and core system files are not tracked at all: `Servex/Pool.js`, `Server/merge.mjs`, `Server/window-watch.mjs`, and until today `Server/smoke.mjs` and `ux/Content/*`. One bad stash or disk loss would take them with it. Commit them on `michael/dev`, in groups a reader can follow. Do not push.

## How

1. **List first.** Write `groups.md` beside this brief: each group gets a name, its files, and one line on what it is. Suggested groups: Servex core, Server tools (merge, smoke, checks, window-*), hooks and skills, the ai2 page, framework modules (one group each: ux/Content, ext/…), and the task and card logs under `public/framework/ai/`.
2. **Commit each group** with `git add -- <exact paths>` and `git commit -m "<group>: <what>"`, with the attribution line from your system reminder. Never `git add -A`, `git add .`, stash, checkout, reset or rebase: other agents are writing in this tree right now.
3. **Leave out** anything that is generated or machine-local: `layout-check-out/`, `.merge.lock`, `.merge-landed.json`, `.worktree-pool.json`, scratch screenshots, and `Servex/proof` if it is output. Add them to `.gitignore`; that edit is its own commit.
4. **Leave out** a file that another agent is editing now: `git diff` it twice, a minute apart. If it changed, skip it and name it in the report.
5. **Secrets:** grep what you are about to add for keys and tokens (`sk-`, `ANTHROPIC_`, `OPENROUTER`, `Bearer`). Commit none; report any you find.

## Proof

- `git status --short | wc -l` before and after, and `git log --oneline` for the new commits.
- Nothing lost: every file present before is still present, with the same content (compare a hash list taken before you start).
- The list of files deliberately left uncommitted, with the reason for each.

## Named: must be in a commit

- `public/framework/ext/Chat/` (Composer.js, Mic, Chat.css), `ext/Classify/`, and the edits to `ai2/compose.js` and `public/app.js` that use them (the foundation of Dictate, the page drawer and AI 2). Earlier note: `public/framework/ext/Chat/Composer.js`, which is untracked, and /framework/ux/Dictate/demo/ imports it, so that demo cannot load in any worktree. Search for other imports of untracked files the same way (`git ls-files --others --exclude-standard` against the import lines of tracked files), and commit what they need in the same group as the importer.
