# New-file sentences that are not verbatim from the old file (24)

This is the reviewer's worklist: each is new wording; check that it keeps the meaning and strength of the old rule it came from.

- L6.1 ((CLAUDE.md)): Consolidated 2026-10-12: text moved out of this file lives in a linked doc, and `public/framework/ai/doc/claude-md-archive.md` keeps the original wording of every rule that was reworded.
- L6.2 ((CLAUDE.md)): The sentence-by-sentence map is in `public/framework/ai/2026-10-12/claude-md-consolidate/`.
- L14.10 (Keep working; never wait on the owner): If there is a safe, quick fix, attempt it; if not, **record the essence of the dictation immediately in the proper place:** a short `doc/*.md` file beside the relevant module, linked from that directory's `readme.md`.
- L14.11 (Keep working; never wait on the owner): Files are what survive. (the owner, 2026-10-01, updated 2026-10-05)
- L28.2 (Clarity is familiar structure): (the owner, 2026-09-29) Each heading names its topic and states its gist in one line, so a reader knows what it is before any detail.
- L28.3 (Clarity is familiar structure): Items are as few as it takes, most important first; a familiar concept needs no explanation, only its name and a link to its own page.
- L34.1 (Link every mention, and every page): **Link every mention, and every page** (the owner, 2026-10-08): the owner browses the website, not the file system, so a file that is not linked will never be found.
- L34.3 (Link every mention, and every page): Whenever text names something that exists and has a URL (a page, class, module, session, task, card, model such as `/framework/ai/models`, a file), it is a link, on UI cards and content alike: use the mention system (`ext/Mention`, `#Page` `@agent` `/path`) instead of plain names.
- L36.1 (Readmes and docs): ## Readmes and docs
- L38.1 (Docs point, they don't explain): **Docs point, they don't explain.**
- L42.1 (The iceberg readme, and a readme as memory): **The iceberg readme, and a readme as memory** (the owner, 2026-10-08): a parent readme is the tip of the iceberg: a solid index of what is inside (each subsystem, one line on what it is and when you would load it, a link).
- L42.4 (The iceberg readme, and a readme as memory): Each module's readme holds its essence and guiding principles, and an `architecture.md`-style doc beside it holds decisions, linking the original refined prompts; keep both fresh, so the owner's suggestions accumulate in the right place instead of dying with a session.
- L49.1 (Memory, history, safety): ## Memory, history, safety
- L53.2 (Link, don't regenerate): Reference the original prompt, session, task or doc by link.
- L57.3 (Moves and renames are scripted, never retyped): Also run a **visibility check** on anything we work on: link whatever exists in the repo but not on the site.
- L63.1 (Classes (detail: `public/framework/ai/doc/classes.md`)): ## Classes (detail: `public/framework/ai/doc/classes.md`)
- L65.1 (Classes are the structure): **Classes are the structure** (the owner, 2026-10-08): the framework is object-oriented, so lean on classes and instances in code and in documentation.
- L65.2 (Classes are the structure): Prefer a class over loose functions or one-off scripts wherever a thing has state and behaviour.
- L67.1 (Write classes, not function bags): **Write classes, not function bags** (the owner, 2026-10-08): one class per file, the file named for the class (`SessionsPage.js` holds `class SessionsPage`), subclasses where they fit (a page template is a class that extends `Page`, a view extends `View`).
- L69.2 (Show the class): Where a class has a UI, the demo shows two things side by side: the rendered view the user sees, and a debug view of the live instance.
- L73.1 (Cost and roles): ## Cost and roles
- L76.1 (Audits go to Haiku, under 100k tokens): **Audits go to Haiku, under 100k tokens** (the owner, 2026-10-08): task audits, readme audits, searches and fan-outs use Haiku in small inlined batches; Sonnet is for UI and object-oriented code.
- L76.2 (Audits go to Haiku, under 100k tokens): A request over 100,000 tokens costs about 5x per token, so every Haiku job stays well under it (aim for 30–60k; never drift over by accident); a node script chunks big inputs.
- L95.1 (Pages, cards, review): ## Pages, cards, review
