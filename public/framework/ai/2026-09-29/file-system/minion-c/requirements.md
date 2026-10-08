# Minion C — every system page links its files

Load the `minion` skill first, then `code` and `content`.

Read: [../owner-words.md](../owner-words.md), [../requirements.md](../requirements.md), and the
`ext/fs/readme.md` in the worktree (how `file_link(path, line?)` works and what url it makes).
The card: `public/framework/ai/2026/09/29/file-system-file-and-directory-objects-f/`.

**Work in the worktree `C:\Code\lew42\worktrees\file-system`** (its server: http://localhost:55895/).
Commit by exact path. Every Node spawn sets `windowsHide: true`.

## The owner's words

> "for all these system pages, make sure to reference any files … in any of these readmes, on any
> of these pages, we could reference just a file path with a specific helper function to make a link."
> "when we're referencing a specific method … it might often be better to just reference … the class
> doc page for class dot method."

## Deliverables

1. **Servex and Server source is readable in /fs, on the dev server only.** Today
   `/Servex/readme.md` and `/Server/doc/collab.md` answer 404: only `public/` is served. Add a dev
   server plugin in `Server/plugins/` that serves `Servex/**` and `Server/**` as read-only text
   (never `node_modules`, dotfiles, `.env`, keys; a path that escapes those two dirs is refused), and
   lists them the way `/directory.json` lists `public/`, so `/fs/` can show their tree. Make
   `file_link("/Servex/Servex.js", 40)` open them. Server changes go live only on a restart: test on
   the worktree's own server (you may restart the WORKTREE's server; never the main one, port 80 or
   Servex). Production has no such route; the link then says "dev server only", no broken fetch.
2. **The system pages link their files** through `file_link`, as a short "Files" line or list near
   the top of each (show the files, not a paragraph about them): `/framework/servex/` (its parts →
   `Servex/*.js`, `Servex/readme.md`, `Servex/agents/`), `/framework/core/Page/` (Page.class.js,
   Log.js, Markdown.js, words.js), `/framework/ai2/`, `/framework/dev/`. A method named in prose links
   its class-doc member page where one exists (`/framework/core/Page/api/…`; check the real url), a
   line number only where no member page exists.
3. **The `content` or `documentation` skill** gets one line: name a file with `file_link`, a method
   with its class-doc page. Append it to that skill's `improvements.md` instead if editing the skill
   itself would clash; say which.

## Fence
Yours: `Server/plugins/<one new file>.js` and its registration line, the four pages' `page.js`
files named above, one line in a skill. Not yours: `ext/fs`, `ext/files`, `ext/highlight`
(minion B's), `core/Page/*.js` code (page-system's; its page.js content only).

## Done means
Every link you add, clicked on the worktree server, opens the file in /fs (a headless probe
that follows them all). Zero console errors on the four pages. One screenshot of
`/framework/servex/` at 1920. Commit, log in `task.jsonl` beside this brief, five-line report.
Budget: about $3.


## Notes (the mastermind, 16:55)
- Minion B works in the same worktree at the same time (ext/files, ext/filesystem, ext/highlight,
  ext/Doc). Commit only your own paths; if git says `index.lock`, wait a few seconds and retry.
- A `/Servex/...` file has no Page above it, so `<dir>/fs/` may not route there. Find the smallest
  way (e.g. `file_link` sends Servex/Server paths to a `/fs/` page under `/framework/servex/`
  that reads your listing). If it needs a change inside `ext/files` or `ext/filesystem`, make the
  smallest one, and name the file and lines in your report so I can tell minion B.
