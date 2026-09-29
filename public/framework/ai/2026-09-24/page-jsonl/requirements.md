# page.jsonl — the default page format (module A)

Task mastermind: `task-mastermind-page-jsonl`. Sibling: `task-mastermind-card-folders` (module B, one folder per card).
Worktree: `C:\Code\lew42\worktrees\page-cards` (branch `worktree/page-cards`), dev server on **port 4817**.
Source of truth: `C:\Code\lew42\monorepo\public\framework\ai\handoff2.md` item 5 (read all of it), and the owner's own words in `handoff2-owner-words.md` beside it (lines 144 and 148).

## The owner's words (verbatim, the acceptance test)

> "just the presence of the file could go right into the log so that we see the file, but it might not need to be automatically loaded and instantiated and rendered, like placing that into a document might be kind of a separate step. Um, think, help me think this through, simply please."

> "set would be something like uh, assign, but also if you are trying to assign any values or an array of values to a, a function or a method, it calls the function or method rather than just simply assigning it … I think the first item should generally be like the constructor … I don't want to have to go back and manage some sort of like complex mapping of like. Uh, JSON properties to their outcomes like place what does place do it should probably call a method"

## The agreed shape (handoff2 item 5)

1. A folder with `page.js` uses it, as today. A folder with only `page.jsonl` gets a default page filled from the log. The router knows which from the parent's listing — never probes, never 404s.
2. Every line is one `set()` call, no mapping table:
   `set(obj){ for (const key in obj) typeof this[key] === "function" ? this[key](obj[key]) : this[key] = obj[key]; }`
3. Line 1 is the constructor (`new Page(line1)`).
4. Rules: a method gets exactly one argument (never spread); data calls methods but never replaces them; if `this[key]` is an object with its own `set`, the value passes down; `constructor`, `__proto__`, and keys starting `_` are skipped. Unknown keys become data — keep a list of them for a debug view.
5. Three separate steps: a file **exists** (node appends `{"file": ...}` automatically when it appears), is **linked** (automatic for child pages), is **placed** (deliberate: a `place` line, or `content.js`). A file present is NOT rendered.
6. `content.js`: `export default function(page, box){…}` replaces `content()`.
7. Listing lines are repeat-safe: the latest line for a name wins; a duplicate changes nothing.
8. Do not migrate existing `page.js` files. Prove it on ONE new page, and show it. Zero console errors.

## Fences

- Module A (this task): `public/framework/core/Page/**`, `public/framework/core/Router/**` if needed, one new Server plugin for the `file` lines (`Server/plugins/PageFiles.js` + its one registration line).
- Module B (sibling) owns the cards under `public/framework/ai/**` in the worktree. Never edit them.
