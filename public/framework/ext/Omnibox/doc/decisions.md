# Decisions — the interaction model, and why

The brief (`ai/2026-09-04/omnibox-prototype/`) named ideas, not requirements: *"prototype
and evaluate the best interaction model."* These are the verdicts.

## A visible field, not a modal-only box

**Decided: always on screen, closed or open.** A modal-only omnibox (Ctrl+K conjures a
whole overlay from nothing) hides its own existence — a reader who never learns the
shortcut never learns the feature exists at all. A field that is simply *there*, in the
shell, teaches itself: it looks like search because it is search, and the open keys
(`/`, Ctrl/Cmd+K) are an accelerator for a control that already worked by clicking into
it. The cost is real — it spends shell space permanently — and worth it for something
the brief calls "always prominent, available throughout the site."

## Ranking: "strong" means an exact title match

Order: **current topic's subtree, then everywhere else; inside each, prefix > word-start >
substring.** A **strong** global match is an exact, case-insensitive match on the whole
title (`"page" === "Page"`, not `"Page".startsWith("page")`) — and it jumps ahead of
*every* local result, not just other global ones. Reasoning: a local prefix match is a
guess about what you probably want from where you are standing; an exact title match
elsewhere is not a guess, it is very likely the one thing you typed the whole word for.
Two exact matches (one local, one global) simply tie on tier — nothing forces the local
one second.

## The Space-bar mode switch — prototyped, and here is where it breaks

**Decided: the cheapest version, Space on an EMPTY box only** toggles search → command
(and back). Typing continues normally the instant the box is non-empty, so an ordinary
multi-word query (`"design system"`) is completely unaffected — the naive version (any
space anywhere) is not what got built.

**The one way this is still wrong:** a query whose first real character is the word
*"space"* — or anyone who clears the box and means to *start* typing with a leading
space — collides with the trigger. Rare on a ~1000-url site index (few titles begin with
a literal space), but a real false-positive class, not a theoretical one; the verdict is
"cheap and mostly right," not "correct."

**Command mode itself is a stub, on purpose** — three hardcoded links (home, Framework,
Platform), enough to prove the branch is real and nothing more. A command *palette* (site
actions, not just links) is the next question, not this one's.

## The preview is borrowed, never rebuilt

The highlighted row's card is the real `page.preview(page.nav())` — for a `page.js` row,
the same dynamic import `core/Page/doc/previews.md` already blesses for borrowing a
page's card; for an `.md` row, the identical fetch `Page.file()` makes internally,
wrapped in a throwaway `Page` so the SAME renderer draws it. A token guard discards a
stale import if a faster arrow-key press already moved on. Cost accepted: one import (or
fetch) per settled highlight, cached by the browser on every repeat.

## Reused, not reinvented

The results panel is Dropdown's exact top-layer recipe (`popover="auto"`, `place()`
measured off the field, clamped to the viewport) — a column or a panel host is
`overflow: hidden` all the way down, and that is the one thing already proven to escape
it. Unlike Dropdown, `place()` reruns on every keystroke, not once per open: the panel's
own height changes with the match count.

## Cut, in order

Per the brief's own priority: **modes** first if anything had to give (the whole Space
branch is the smallest, most speculative piece), then **previews**. Neither was cut —
budget held. What was never in scope at all: content search inside a page, users, chat,
and any url that only exists through a page's own `route()` (nothing on disk for the
index to read — `doc/declaring.md`'s own limit on the filesystem probe).
