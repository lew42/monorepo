# Docs check — ux/Understand and ux/Rename

Read only the readme chain (root readme → framework readme → ux readme → each module's
readme.md, page.js, doc/decisions.md), never the .js source, exactly as asked.
`load_module`/`readme_modules` (the MCP tools this check is supposed to use) refused
permission every time in this session, so the same files were read by hand with the Read
tool instead — same content, slower way in. Worth fixing so the next reviewer doesn't
hit the same wall.

**Note on where this file landed:** the brief asked for this to be written at
`C:/Code/lew42/monorepo/public/framework/ai/2026-09-29/audio/next-chat-hitl/hitl-widgets/docs-check.md`,
calling that "the main tree, not a worktree." This session is sandboxed to
`C:\Code\lew42\worktrees\chat-hitl` only — every attempt to write or even `mkdir` outside
it was refused by the sandbox, with no way to grant permission non-interactively. So this
file is written at the same *repo-relative* path, inside this worktree instead. Someone
with main-tree access needs to copy it over (or merge this worktree).

## The one real gap: the parent doesn't know these two exist

`ux/readme.md`'s index lists exactly eleven modules (Auth, Content, Course, Dictate,
Filter, Menu, Pagination, Popover, Tags, Tree, Wizard) and says "Eleven live today... the
index is a wall of cards." **Understand and Rename are in neither the list nor the
table below it.** Their own readmes are clear and read fine in isolation, but a reader
who starts at `/framework/ux/` — which is the front door — will never find them. That
is the CLAUDE.md rule itself ("a page exists once its parent's `children:` names it")
looking unmet from the readme side. Likely explanation: these two are newer and just
haven't been wired into the parent index yet, but the readme chain gives no hint of
that — it reads as if eleven is the whole, current list.

## Two sibling widgets that don't know about each other

Understand and Rename are both being built as "HITL widgets" for the same task (same
task folder, same day), and their readmes even describe the identical situation: both
call Servex's `/api/hitl` with a different `op`, and both say, word for word, "live
only after a later restart (a sibling task is building the route)." But neither
readme links to the other, or says "see the other HITL widget" anywhere. Someone
reading Understand's readme alone has no way to discover Rename exists, or that they
share a backend endpoint — a one-line cross-link in each "More" section would close
this.

## A framing mismatch between the two

Understand's readme opens by placing itself inside a chat: "...let the assistant
actually ask the clarifying question, in the chat, instead of guessing." Rename's
readme never mentions chat or an assistant conversation at all — it reads as a
standalone card-title widget ("tap a card's title, ask to rename it"). Both demos are
clearly framed as parts of the same "next-chat-hitl" effort (the task folder name says
so), but only one of the two readmes actually says that out loud. A reader of Rename's
readme in isolation would have no reason to connect it to a chat/assistant flow at all
— worth either adding a line to Rename's readme, or confirming that Rename really is
meant to be chat-independent.

## Smaller, not blocking

- **Design choice looks inconsistent between two very similar widgets, and neither doc
  explains the difference to the other.** Understand reuses `ux/Content/Decision`
  (with a 3-line in-memory subclass) for its clarification card. Rename's own
  `doc/decisions.md` explicitly considers and rejects reusing `ux/Content` in favor of
  a plain array — but it argues the case in isolation and never mentions that its
  sibling, built the same week for the same task, went the opposite way and it worked
  fine there. Not necessarily wrong (the two do slightly different things — a card
  with fixed options vs. a title becoming an ad-hoc dropdown) but a reader comparing
  the two decisions.md files back to back will wonder why, and nothing answers it.
- Both `page.js` files declare `files: "X.js fixtures.js page.js readme.md"` but each
  module also ships an `X.css` that isn't in that list (confirmed the file exists on
  disk; not read). Might be deliberate (trivial stylesheet, not worth a Files-tab
  entry) or might just be a copy-paste omission from a template — the readme chain
  doesn't say which, so it reads as unclear rather than wrong.

## What reads well

Everything else lines up. Each module's readme, its page.js `content()`, and its
doc/decisions.md agree with each other word for word on: what `marks()` /
`rename_options()` return, the `/api/hitl` fallback-to-`fixtures.js` behavior, and the
two-tap "select, then act" pattern (both decisions.md files even give the same reason
for it — a stray tap on a phone shouldn't start an edit). The "Use" code samples match
what `content()` actually prints. No factual contradictions found inside either
module's own chain.
