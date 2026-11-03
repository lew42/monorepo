# Minion: fix2 — the second review's findings

Load the `minion` skill first. Shared rules: `../common.md`. The review: `../review.md` (11 findings, second round). The first fix round: `../fix/proof.md`. Worktree `C:\Code\lew42\worktrees\recursive-pairs` (head d2099694). **Fence:** `Servex/agents/` (Global.js, Layers.js, External.js, roles.js, master-assistant.md, tests, docs), `.claude/skills/every-prompt/SKILL.md` and `page-assistant.md`, `Server/watch` config only for item 5. Private Servex port **8790**; never the live one.

## Do
1. **Finding 1:** add `list_cards` and `list_agents` to the root assistant's tools (`master_tools` in Global.js).
2. **Finding 2:** a fresh page assistant must start **under 10k** tokens (the owner's bar). Move the "If you are a VS Code tab" section out of `page-assistant.md` (into SKILL.md, item 4) and trim anything else a page assistant does not need. Re-run the recycle proof (`../pairs/proof.mjs` or the part that measures a fresh start) and record the number.
3. **Finding 3:** `register_session` accepts only ids matching `/^[a-z0-9][a-z0-9-]*$/`; test a `../../x` id is refused.
4. **Finding 4:** the tab's inbox-watch lines go in `.claude/skills/every-prompt/SKILL.md` itself (a short section, true to what the Monitor tool allows — see `../fix/proof.md` item 7).
5. **Finding 9:** check whether a write to `public/<page>/ai/chat.jsonl` (and `public/ai/chat.jsonl`) triggers a live reload of that page (read `Server/doc/watch.md` and the watcher's ignore rules). If it does, make chat.jsonl files ignored by the reloader the way other streamed .jsonl logs are, or tell me in proof.md exactly why you could not.
6. **Finding 5:** `spawn_agent({role: "master-assistant"})` must keep its old posture (architect tier, `plan`). Give it its own row again, or make the alias not change posture.
7. Findings 6, 7, 8, 10 and 11: one line each under "Known limits" in `Servex/agents/doc/page-pairs.md`. (6-8 were dropped from this brief with no mention; `../fix/requirements.md` item 8 set the pattern for a note finding — a doc line, not silence.)

## Done means
All `Servex/agents/*.test.mjs` green; commit only your files (never `public/**/page.jsonl`); `proof.md` beside this brief with each item and its proof. End with one paragraph: commit hashes, the fresh-start token count, anything unproven.

