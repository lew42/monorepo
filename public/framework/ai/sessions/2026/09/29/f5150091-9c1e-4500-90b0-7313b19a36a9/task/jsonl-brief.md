# Minion brief: core/Page/jsonl/ — the page.jsonl SYSTEM, as its own page

Load the `minion` skill first, then `page`, `content`, `documentation`, `code`. Program card dir: `public/framework/ai/2026/09/29/the-page-system-layout-navigation-new-pa/`.

## The owner's words (read "Continued (about 4:30 PM)" in `public/framework/ai/2026-09-29/page-system/owner-words.md`)

> "the core slash page slash, maybe the page should be called JSON L and it's just, it's a system. It's a, it's a page. It has a README and it's more just a code pattern essentially. So it's sort of like a skill, but ... could just document the page JSON, you know, JSON L format, adding logs to it, who adds logs to it, you know, the timing, maybe any kind of like caveats or conflicts to be aware of."

> "providing clarity is often about providing familiar structure ... the icon the name and what it means ... should become familiar ... sticking to the file system pattern ... If it's a class or an instance, you know, like making sure it looks like it ... if we're talking about a page instance, it just should, you know, it's familiar."

## Where you work

Worktree `C:\Code\lew42\worktrees\page-system-929` (server http://localhost:51061/). Edit only there. **Commit ONLY by exact path** — never `git add -A`/`commit -a` (the worktree server appends page.jsonl lines as pages load; those must never be committed — and note that is itself one of the "who writes lines" answers you are documenting).

**Fence:** `public/framework/core/Page/jsonl/**` and `public/framework/core/Page/doc/page-jsonl.md` (written an hour ago by another minion: size, the size report `Server/page-size.mjs`, the purge proposal — fold it into this system page, e.g. as `jsonl/doc/size.md`, and leave `core/Page/doc/page-jsonl.md` as a 2-line pointer so its links still work). Do NOT edit `core/Page/page.js` or `core/Page/readme.md`.

**Keep v1 reachable.** `/framework/core/Page/jsonl/` is today a live page.jsonl page that IS the two-line example (the "Make a page › page.jsonl" tab links it), with children `full/` and `child/`. Don't destroy it: the page can stay a page.jsonl page that demonstrates itself (it's the best proof of the pattern), with the system content placed onto it (`{"place": "system.md"}` or a module), and the old example kept visible or one click down. Any new line you add to its page.jsonl is appended, never rewritten.

## Find first (read, don't guess)

- The format: `core/Page/doc/jsonl.md`, `core/Page/jsonl/full/` (every line the format knows), `Page.class.js` (how lines are applied: `set()` calls a method if the key names one, else stores data; latest line wins).
- **Who writes lines**, with the file for each: Servex's `/card/append` route (grep `Servex/` for `card/append`), the dev server's append/watch that writes `{"file": …}` / `{"gone": true}` lines when files appear under a page (grep `Server/` for `"gone"`), the page tools `create_page`/`place`/`set_layout` (`Servex/pages.js`), agents via `.claude/hooks/append.mjs` or `append_log`, and the owner's clicks in the browser (whatever posts from the page, e.g. AI 2 card replies, CMS visits). Look at `core/Page/jsonl/page.jsonl` itself: it has duplicate `{"file":"child/"}` and `{"file":"readme.md"}` lines — find out why and name it as a caveat.
- Timing: when a line appears (on file create? on page load? on a click?), and when the page re-reads it (live stream vs reload).

## Deliverables

1. **The page, level 1 one screen, familiar structure:** a page instance that looks like a page instance — the concepts as icon tiles with a name and a one-line meaning, in this order: **Format** (one line = one JSON object = one method call; line 1 builds the page) · **Who writes** · **Timing** · **Caveats** · **Size**. Show a real page.jsonl beside its rendered result (this page's own file is the best example). Each tile goes one click down to a `doc/*.md`.
2. **`doc/writers.md`** — a table: writer · what it appends · when · the file/route that does it (linked).
3. **`doc/caveats.md`** — concurrent appends (append is safe, read-modify-write loses lines — measured 2026-09-19: 98% lost), latest-line-wins, duplicate lines (what you found), live servers' lines getting swept into agents' commits, and size (link `doc/size.md`). One line each, with the fix or rule.
4. **`doc/size.md`** — moved from `core/Page/doc/page-jsonl.md` (pointer left behind).
5. **`readme.md`** — the index (what · use · watch out · more), short, reading as the text version the page is designed from.

## Proof

- Load `http://localhost:51061/framework/core/Page/jsonl/`, `/jsonl/full/` and `/jsonl/child/` headless at 1920: zero console errors, zero failed requests. Shot `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\page-system\shots\jsonl-1920.png` — open it and check it answers "what is page.jsonl, who writes it, what to watch out for" at a glance.
- `git diff` of `core/Page/jsonl/page.jsonl` shows appended lines only.
- Every spawn sets `windowsHide: true`. Budget about $3.

Reply with the commit hash, the shot path, and a checklist of deliverables 1–5, proof beside each. Then stop.

## Connect the dots (the owner, via the content skill)

Document where the CODE lives: a method on its class's method page, a Servex mechanism on /framework/servex/. State each fact here in one line and LINK to where it lives; never re-explain. Link a familiar concept wherever it is mentioned, not redundantly. Tip of the iceberg first: the subtopics as linked items. Familiar structure: icon, name, one-line meaning; the file system as reinforcement; an instance looks like an instance.
