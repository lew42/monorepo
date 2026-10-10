# Owner-check: ai2-inbox-read, item by item

Checked against the actual files, not the task's own summary. Items 39–59 (framework/design,
framework/code) were built by a *different*, same-day task (`worktree/design-code`,
merge `018b0af0`) — verdicts below reflect what exists in the repo today, with that noted.

| # | item | verdict | evidence |
|---|---|---|---|
| 1 | Zero out the inbox, never delete anything | done | `rules.js` `archive_row()` only sets `status:"archived"`; `inbox.js` comment "Nothing is ever deleted" |
| 2 | Find archived items in a log, or add search | partly | `Rail.js` `search()`/`haystack()` covers plain cards + archived pile; misses groups, real-page rows, the Log tab proper |
| 3 | "Maybe we need a search somewhere" | partly | same as #2 |
| 4 | "We definitely need to work on this AI dashboard" | done | this task shipped real fixes (read/unread, archive, resolution, search, Now-card wording) |
| 5 | Eventually merge AI2 into framework/ai | missing | no merge happened (correctly — owner said not yet); no code references a planned merge |
| 6 | "Don't do that yet, but make a note of it" | missing | no note of the deferred merge found anywhere in `ai2/doc/` or the task's own files |
| 7 | Inbox and Needs-you "sound like the same thing" | done | `page.js`: Needs-you tab replaced by a chip on the Inbox; one view, not two |
| 8 | "They're two different looks" (acknowledged, not a request) | done | same change covers it |
| 9 | Click a row, it opens in a sidebar | done | `rail.js` `card_page()` opens the detail column beside the rail |
| 10 | Owner prefers the inbox | done | `page.js` makes Inbox the default tab/url |
| 11 | "Forget the needs-you page for now" | partly | tab removed from the tab-bar, but `page.js` comment: "`needs/` is still a real, working address" — not forgotten, just hidden |
| 12 | Focus on the inbox | done | same as #10 |
| 13 | "Maybe it's just unread, R-E-A-D" | done | `rules.js` `is_read`/`mark_read`, `Inbox.css` `.inbox-unread` |
| 14 | Red/unread state | done | same |
| 15 | (repeat of 14) | done | same |
| 16 | "Red, red and unread state" | done | same |
| 17 | Unread rows bold, different look | done | `Inbox.css:461-467` `.inbox-row.inbox-unread .inbox-row-title { font-weight: 700 }` |
| 18 | Reading turns it unbold | done | `card.js` `activated()` calls `mark_read(id)`; review finding #1 fixed this exact gap |
| 19 | An archive/clear button per row | done | `Rail.js` `row_head()` renders the `×` "archive — nothing is deleted" button |
| 20 | "Once it's done" (resolved) | done | `rules.js` `is_resolved()`: `status === "done"` |
| 21 | (repeat of 20) | done | same |
| 22 | Resolution happens automatically | done | `rules.js` `is_resolved()` + `page.js` `visible()` drops resolved rows, no button press |
| 23 | Write the resolution rule down, in one place | done | `rules.js`, one function, one long comment explaining it |
| 24 | "The AI system should be designed to resolve tasks automatically" (broader than the inbox UI) | partly | only the Inbox's own visibility resolves itself; no engine that resolves tasks themselves |
| 25 | Dictating in real time = visual feedback / a summary | done | pre-existing "You said…" rows + Live card, untouched by this task on purpose |
| 26 | (repeat of 25) | done | same |
| 27 | "It's almost like a chat" | done | every card is already a chat (`inbox.js`, `card.js`) |
| 28 | Dictating in VS Code sidebar creates a card | partly | the composer/card system creates cards from any dictation source; no VS-Code-specific wiring found |
| 29 | "That was sort of what the live card was supposed to be" | done | Live card (`live.js`) already does this |
| 30 | "Leave the live card as it is" | done | this task did not touch the Live card's structure, only the wording bug (#32) |
| 31 | Doesn't mind seeing the running-things dashboard | done | kept as-is |
| 32 | Now card: doubled "working … — now" wording | done | `live.js` comment: the literal "— now" suffix removed; review finding #4 confirms and the mastermind declined to go further (kept the one per-row state word on purpose) |
| 33 | (repeat of 32) | done | same |
| 34 | "A lot of redundant verbiage" | done | same — reduced, not eliminated; see #32's rationale |
| 35 | "This is something in the design system" (musing) | done | became `framework/design/` (separate task, see header note) |
| 36 | "UI content layout color" naming | done | `framework/design/` index lists exactly layout, color, navigation, content, ui |
| 37 | "Maybe that's the design system" | done | same |
| 38 | Design system "should have…" | done | same |
| 39 | Make a `framework/design` directory | done | `public/framework/design/readme.md` exists |
| 40 | An AI-like system, a tree of readmes/subsystems | done | design readme: "the same way core, ext, ui are: one readme per topic" |
| 41 | It's basically an AI skill | done | design readme "More": ".claude/skills/page/ — the thin skill that points here" |
| 42 | Document all things that contribute to design | done | design readme Index covers layout/color/navigation/content/ui |
| 43 | Have layout and color and navigation | done | `design/layout/`, `design/color/`, `design/navigation/` each exist with readme+doc |
| 44 | Navigation = path, link look, persistent/transition | done | `design/navigation/readme.md`: "the path: how links look, persistent or switching, transitions" |
| 45 | Content = iceberg, complexity/detail/importance | done | `design/content/readme.md`: "the iceberg: level of detail, what is foundational, importance" |
| 46 | "Design is like everything" | done | design readme frames it as the pre-code decision layer for anything new |
| 47 | "Just when you're creating anything new" | done | design readme "Use": the 5-question order before any markup |
| 48 | Separate from the code system | done | `framework/code/readme.md` exists as a sibling, cross-linked, not nested |
| 49 | Create `framework/code` | done | `public/framework/code/readme.md` exists |
| 50 | "This is our coding system" | done | same |
| 51 | Systems as libraries of knowledge to refine and improve over time | partly | the pages exist and are browsable; no refinement/feedback loop mechanism found in `design/doc/` or `code/*/doc/` |
| 52 | "That's gonna be tricky" (acknowledgment) | done | no action required — not a request |
| 53 | A page beats being buried in a Claude skills folder | done | `code/readme.md` "Watch out": skills are now short pointers, knowledge lives on these pages |
| 54 | "It is like an AI system" | done | same framing in both readmes |
| 55 | "It's also like a human system" | done | design readme: "A person and an agent read the same pages" |
| 56 | Same whether AI or a human browses it | done | same line |
| 57 | Code = formatting, opinions, do's/don'ts | done | `code/dos-and-donts/doc/opinions.md`, `traps.md` exist |
| 58 | `framework/code` specifically about the framework's own code | done | code readme: "how it's written, what to never do, where a CSS rule belongs" |
| 59 | Move skill knowledge to browsable pages; skill stays as a thin pointer | done | `code/readme.md` Watch-out: "the `code`, `css` and `new-css-class` skills still exist... now short pointers here" |
