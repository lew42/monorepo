# servex-mastermind: improvements

- **jsonl-guard false positive (2026-10-01, vscode-mastermind).** `.claude/hooks/jsonl-guard.mjs` blocked two harmless commands:
  1. a heredoc appending to a `.md` file, whose BODY contained a placeholder `‹slug›/page.jsonl`. The placeholder's closing angle bracket, followed by a path ending in .jsonl, reads as a redirection;
  2. a `node -e` call whose quoted JS STRING contained that same text.

  Match only a real redirection target: an unquoted `>`/`>>` in the shell command itself, not inside quotes or heredoc bodies. Add both cases to its tests.

- **Every class module readme OPENS with its class block** (the owner, 2026-10-01): the pseudo-JS shape (properties first, then the main methods, `[X]` for arrays), most useful first, the same block as in `public/framework/doc/architecture.md`. Whoever changes a class updates both. Add this to the documentation skill and the review questions.
