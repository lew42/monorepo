# Convert loose-function files to classes (public/framework/ai/)

Rule (CLAUDE.md "Write classes, not function bags"; `code` skill): a lowercase `.js` file that exports loose functions becomes ONE class, file renamed for the class (git mv, capitalised, e.g. `needs.js` -> `Needs.js` holding `export class Needs`, also `export default Needs`), helpers as static members, every importer updated to `import { Needs } from ...` and `Needs.fn(...)`. Reference done example: commit 211a55e0c (cards/faces.js -> class Faces; callers use `Faces.when(...)`; the file kept its name there, you may rename to match the class, then fix importers, and leave NO shim except where an importer outside ai/ exists (then update that importer too).

How:
- Find importers with Grep across public/, Servex/, Server/ (static, dynamic `import()`, relative and /-rooted paths, `export * from` shims like `ai2/*.js`).
- Non-function top-level constants may stay module-level above the class. Functions move into the class as `static name(...)` (arrow consts -> static methods or static fields). Inside, call siblings as `ClassName.name(...)`. Watch `this` use, module-level calls to functions (class bodies are not hoisted: a call at module level before the class is defined breaks), and name clashes with `Function` statics (`name`, `length`).
- Keep comments as they are, except prefix updates. Do not redesign behaviour.
- Per file: `node --check` the file and every importer, then ONE commit (`git add` exact paths). Never skip hooks.
- Work in your own worktree/branch (take_worktree or `git worktree add ../wt-<slug> -b michael/<slug>`); never touch the main tree. Do not merge; report branch + commits.
- If a file cannot be safely converted (dynamic names, generated imports), skip it and say why in one line.
- Final report: <120 words: per file, converted/skipped, commit sha.
