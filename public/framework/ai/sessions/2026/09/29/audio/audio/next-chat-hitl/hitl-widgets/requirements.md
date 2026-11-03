# Minion: ✓/? sentence marks with a clarification card, and rename-by-dropdown, as two ux modules with demos

Load the `minion` skill first, then `code`, `page`, `css`, `new-css-class`, `new-page`. Your parent is task-mastermind-chat-hitl.

## The owner's words (full text: ../owner-words.md and ../../owner-words.md, "Continued (about 8:40 PM)")

> "trying to figure out the objective of each statement ... put like a green check mark after it just so that we see that visual feedback ... if there's a statement ... that ... might have some ambiguity ... maybe it's like a yellow question mark that goes after it ... the smart assistant could add clarification UI into the chat where it's like, needs clarity. Do you mean this or that? ... So let's see if we can get a demo of that working."
>
> "I could click on a title and say, hey, can we rename this? And then it suggests like, you know, maybe it turns that title into a drop down and then it has a whole bunch of alternatives that I can choose from ... I guess I just need like the basic function working for now."
>
> "first it kind of selects that card"

The owner tests this ON THE PHONE. Both demos must work at 400px wide and at 1920.

## The API you call

A sibling minion is building it now; it goes live only after a later Servex restart. `POST /api/hitl`, reached the same way `ux/Dictate/playground/Playground.js` reaches `/api/tidy` (read how it builds that url and copy it):

- `{op:"marks", sentences:[string], context?}` → `{ok, marks:[{i, mark:"ok"|"unclear", purpose, question?:{ask, options:[a,b]}}]}`
- `{op:"rename", title, context?}` → `{ok, names:[5 strings]}`

When the call fails or answers `ok:false`, fall back to FIXTURES (canned answers in a `fixtures.js`) and say so in one small line ("fixtures: Servex /api/hitl not reachable"), the way Playground falls back to its rules pass. The production site is static, so the fixtures path is what it will show.

## Deliverables

1. **`ux/Understand/`** (the ✓/? marks). An exported view class that takes sentences plus marks and draws each sentence with a small, unobtrusive mark after it: a green ✓ for `ok`, a yellow ? for `unclear` (the `purpose` as its tooltip; tapping the ? highlights its card). After an unclear sentence, a clarification card is placed in the flow, built from the existing `ux/Content/Decision` (or `Question`, if Decision can't show two options with nothing pre-chosen; read both readmes): "Did you mean A or B?". Choosing an option records a line in an in-memory log (a demo never writes a real log), and the ? turns into a ✓. Also export a small `marks(sentences, context)` client function, so ChatPanel can use it later.
   Demo page: a canned paragraph (4 or 5 real sentences from the owner's words, one of them genuinely ambiguous), marked on load; below it, a textarea "Try your own" and a button that runs marks live.
2. **`ux/Rename/`** (rename by dropdown). An exported class: a title that a tap SELECTS (a visible selected state). When it is selected, a "Rename" action (a button, and also typing "rename this" into a small input) asks `op:"rename"` and turns the title into a dropdown of the 5 names, plus "keep current". Choosing one appends a line `{rename:{id, name, at}}` to an in-memory log; the latest line wins and the title shows it. The demo shows the log beneath, so the append is visible. Keep it basic.
   Demo page: three card titles (taken from the owner's own topics), each selectable and renamable.
3. Each module gets a `readme.md` (index shape: what · Use · Watch out · More), a `page.js` (show, don't tell: the demo IS the page) and a `doc/` with one short md. Declare both in `public/framework/ux/page.js` `children:`, one line each (read its shape first). You should only be adding files, never rewriting working ones.
4. Proof: headless screenshots (the `ui-test` skill; Playwright, never the owner's tabs) of both pages at 400 and 1920 on YOUR worktree server, `http://127.0.0.1:51851/framework/ux/Understand/` and `/framework/ux/Rename/`, including the dropdown open and a clarification choice made. Save them in your task dir and look at them. Zero console errors.

## Fence

Work ONLY in the worktree `C:/Code/lew42/worktrees/chat-hitl` (branch `worktree/chat-hitl`). Your files: `public/framework/ux/Understand/**`, `public/framework/ux/Rename/**`, and one children line each in `public/framework/ux/page.js`. Do NOT touch `ext/Chat/`, `ux/Dictate/`, `ux/Content/` (import from it only), `Servex/` or `Server/`. Commit by exact path only: the worktree has unrelated dirty files.jsonl files from its server boot, so never `git add .`. Never restart any server; stop any server or browser you start. Every spawn sets `windowsHide: true`.

Length budget: each module's class about 150 lines. Land by committing, then appending a landing line with the screenshot paths to your task.jsonl; your parent is woken automatically.
