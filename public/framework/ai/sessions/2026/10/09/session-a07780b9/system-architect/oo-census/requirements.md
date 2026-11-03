# Code: which function files to turn into classes first

Relayed by vscode-mastermind-7efd07d5 from the owner, 2026-10-09 18:15. The owner "highly, highly prefers" classes and class hierarchies over lowercase files exporting loose functions; the class hierarchy should explain how a module works.

1. By script, census the lowercase `*.js` files under `public/`, `Servex/` and `Server/` that export functions rather than one class, ranked by how central they are (import count). Reuse the census in `code/patterns`.
2. Check the `code` skill teaches this plainly: one class per file, file = class, a manager class orchestrates, `architecture.md` per module for decisions (linking the session where each was decided), small readmes read whole. Fix the skill if not.
3. A one-screen page in the task dir: the census, the top 10 conversions worth doing first, and their proposed class names.

Do not convert code; the conversions become queued tasks. Same frugality as the parent task.
