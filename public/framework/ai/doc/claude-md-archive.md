# CLAUDE.md archive — original wording

On 2026-10-12 the root `CLAUDE.md` was consolidated. Where a rule was **reworded or shortened**, the sentences it no longer contains verbatim are kept here, unchanged, so nothing is lost. Sentences that moved to a topic doc are in that doc, not here; the full map is `public/framework/ai/sessions/2026/10/12/session-3b391f22/claude-md-consolidate/manifest.md`. The old file is also in git: `git show 87afbdd55:CLAUDE.md`.

Each entry is the old line (`L<n>`), its title, and the old sentences that were dropped or folded into a shorter rule.

<!-- claude-md:L12 -->
**Keep working; never wait on the owner** — L12.10, L12.11, L12.13 — conflict: contradicts 'Never destructive' (2026-10-08) — kept 'Files are what survive' only

If there is a safe, quick fix, attempt it; if not, **record the essence of the dictation immediately in the proper place.** Write notes, legitimate questions, tradeoffs or implications into a short `doc/*.md` file beside the relevant module, and link it from that directory's `readme.md`. Superceded docs can be deleted cleanly in the future, but until then, files are what survive. (the owner, 2026-10-01, updated 2026-10-05)

<!-- claude-md:L24 -->
**Link every mention** — L24.1, L24.2

**Link every mention** (the owner, 2026-10-08): whenever text names something that exists and has a URL (a page, class, module, session, task, card, model such as `/framework/ai/models`, a file), it is a link, on UI cards and content alike, so it can be clicked through. Use the mention system (`ext/Mention`, `#Page` `@agent` `/path`) instead of plain names.

<!-- claude-md:L28 -->
**Audits go to Haiku** — L28.2

Task audits, readme audits, searches and fan-outs use Haiku in small inlined batches; Sonnet is for UI and object-oriented code.

<!-- claude-md:L30 -->
**Link, don't regenerate** — L30.2

Reference the original prompt, session, task or doc by link (a text link first; embedded previews later, since they load a lot of data).

<!-- claude-md:L32 -->
**Classes are the structure; show them** — L32.1, L32.2

**Classes are the structure; show them** (the owner, 2026-10-08): the framework is object-oriented, so lean on classes and instances in code and in documentation. Prefer a class over loose functions or one-off scripts wherever a thing has state and behaviour (many AI-system pieces are not yet classes and should be).

<!-- claude-md:L34 -->
**A readme is a module's memory** — L34.1, L34.2

**A readme is a module's memory** (the owner, 2026-10-08): each page or module's readme holds its essence and guiding principles, and an `architecture.md`-style doc beside it holds decisions, linking the original refined prompts and summarising the ideas. Keep both fresh, so a new agent that reads them is fully up to date and the owner's suggestions accumulate in the right place instead of dying with a session.

<!-- claude-md:L38 -->
**The iceberg readme** — L38.1

**The iceberg readme** (the owner, 2026-10-08): a parent readme is the tip of the iceberg: a solid index of what is inside (each subsystem, one line on what it is and when you would load it, a link).

<!-- claude-md:L42 -->
**Haiku stays under 100k tokens** — L42.2

A node script chunks big inputs (a raw session file, a log) into pieces sized to fit with room for the reply.

<!-- claude-md:L46 -->
**Stream, don't poll** — L46.3

Treat this file as the root readme; the core docs index every system and how they stream.

<!-- claude-md:L48 -->
**Everything is linked** — L48.1

**Everything is linked** (the owner, 2026-10-08): the owner browses the website, not the file system, so a file that exists but is not linked will never be found.

<!-- claude-md:L50 -->
**Moves and renames are scripted, never retyped** — L50.3

Also run a **visibility check** on anything we work on: if it exists in the repo but is not linked from the site, it will not be found, so link it.

<!-- claude-md:L54 -->
**Write classes, not function bags** — L54.1, L54.2

**Write classes, not function bags** (the owner, 2026-10-08): code is object-oriented. One class per file, the file named for the class (`SessionsPage.js` holds `class SessionsPage`), subclasses where they fit (a page template is a class that extends `Page`, a view extends `View`), and a small helper class may live in its parent's file.

<!-- claude-md:L56 -->
**Show the class** — L56.2

Where a class has a UI, the demo shows two things side by side: the rendered view the user sees, and a debug view of the live instance (a tree/card that renders every property by type, string, boolean, nested array/object, functions optional) so you watch the data structure change as you use the demo.

<!-- claude-md:L70 -->
**Clarity is familiar structure** — L70.2

(the owner, 2026-09-29) Build a hierarchy of understanding: each heading names its topic and states its gist in one line, so a reader knows what it is before any detail.

<!-- claude-md:L77 -->
**Docs point, they don't explain** — L77.1

## Docs point, they don't explain

<!-- claude-md:L91 -->
**Systems that shape every turn (the owner, 2026-09-30)** — L91.1

## Systems that shape every turn (the owner, 2026-09-30)

<!-- claude-md:L97 -->
**References** — L97.1, L97.2

**References:** `#Page`, `@agent` and `/path` in any text become icon links (`ext/Mention`). Use them instead of prose names.

<!-- claude-md:L22 -->
**How to respond** — L22.2

Each `###` heading names the thing (the class, module or page) so the context is always visible; add one short `#` only for a big reply.

<!-- claude-md:L18 -->
**Document the structure as you build** — law 9 (new, 2026-10-19; added verbatim as the owner asked, so no earlier wording exists)

**Document the structure as you build.** Every system's readme states what it is, its exact on-disk structure, which tool writes its data and from where, and which class reads it — verified against the code, no history. If an agent had to investigate to learn how a system works, the readme failed; fix the readme in the same task. (the owner, 2026-10-19)

<!-- claude-md:where-to-look -->
**Where to look: the framework index** — reworded 2026-10-19

Was: `public/framework/readme.md` → `core/` `ext/` `styles/` `ui/` `web/` — each dir's readme is its entry

<!-- claude-md:proposal-branches -->
**PROPOSED, not in CLAUDE.md (needs the owner's yes), 2026-10-19:** beside "Commit after every working step", add: *"Major changes to any system, documentation overhauls included, are committed on a branch `task/<slug>` (the slug of the task dir), not straight onto `michael/dev`, so the history shows what changed and why and a rollback is one merge away."* Already live as one line in `.claude/skills/mastermind/SKILL.md` (Land everything).
