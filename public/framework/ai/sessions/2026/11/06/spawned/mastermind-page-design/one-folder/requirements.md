# One folder per session, enforced

The owner, relayed by voice-app on 2026-11-06, has asked many times for ONE place per session. A Nov 4 VS Code session looked like it had two places: `framework/ai/sessions/<full uuid>/` and `sessions/2026/11/04/session-<id8>/`.

1. Every writer goes through one path function (the dated folder only).
2. Flat `sessions/<uuid>/` folders get migrated or linked. No data is deleted.
3. A test or startup check fails loudly when a flat `<uuid>/` folder appears.
4. The rule is written prominently in `agents.md` and the sessions readme.
5. Every doc, hook or prompt that tells agents the wrong path is fixed.

Built on branch worktree/qf-3:
- The page tool refuses flat uuid folders.
- `SessionConsolidate --check` and the daily alarm report flat folders and every twin.
- `SessionConsolidate.test.mjs` fails on a flat folder.
- The SessionStart hook and Servex's whoami print the dated folder.
- `239b0bd4/page.jsonl` was moved to `2026/11/03/session-239b0bd4/`.

Next: the fold of 1,410 old twins runs separately, on the main tree.
