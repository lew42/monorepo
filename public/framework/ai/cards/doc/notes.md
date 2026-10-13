# card.js notes

Design reasons and history moved out of `card.js` (comment prune, 2026-10-12). Each heading is a pointer target.

## words
(the owner, 2026-09-25) A CARD is a topic, a REQUEST is one thing asked inside it, a TASK is what an agent does for a request. ACTIVITY is every line in the card, newest first, the unseen ones marked (`activity.js`). Tasks and Activity are child urls (`.../<card>/tasks/`, `.../<card>/activity/`); Overview is the card itself. Tasks routes even while its tab is hidden, because a group card knows it has tasks only once its groups load.

## styles
A card's own look (its grid, the Live card, the outline, folders, the tiny tabs) is all in the ux block now (merge 7, inbox-ext, 2026-10-01): `ai2.css` carries only AI 2's own v1 screens, which `card.js` never draws.

## card-is-a-folder
(the owner, 2026-09-24: "we want the agent to have a card.js or similar, that's basically like a page.js")

```
ai/2026/09/24/fix-the-sidebar/page.jsonl      line 1 names this class
{"class": "/framework/ai/cards/card.js", "title": "Fix the sidebar", "type": "request", ...}
{"message": {"by": "assistant-fast", "text": "On it."}}
{"type": "question"}                           <- the card is a question now
{"file": "wider/page.jsonl"}                   <- a sub-card, one folder deeper
```

`Page.jsonl()` (core/Page/Log.js) builds it from line 1 and calls `set()` with every later line, live on localhost: a key that names a method calls it, anything else (`title`, `text`, `links`) is kept as data. So the methods ARE the card's vocabulary: a new kind of line is a new method. Inside AI 2 it draws into the page's own chrome: the card in the middle column, its sub-cards (its `file` lines) as a table of contents, and its chat. `shell` is AI 2's own page, handed down by whoever built this one; without it the card still draws.

## verbs
`VERBS` are the words line 1 may carry that are METHODS here. Line 1 goes through the constructor's `assign()`, which would REPLACE `type()` and `tags()` with data (Servex writes both on line 1), so `assign()` calls them instead.

## one-ai
(one-ai, 2026-09-29; `doc/one-ai.md` has the full finding.) `Card.V1` is off by default: the card's own composer bar and its half/half chat split are gone, because the global AI now talks into this card instead. The mobile sheet (`ext/drawer/rail.js`) and the desktop drawer's AI tab (`ext/drawer/tabs/ai.js`) both post through the same route this card's old composer used (`send({card, text})`) and can show this card's thread by reading `chat_entries()`, so a second in-card copy had nothing left to add. Set `Card.V1 = true` (or open a card with `?chat=v1`) to bring the old box back for comparison (`chat_v1()`).

## content-redirect
A refined reading is not a retype: Servex (`agents/Layers.js`) appends `{"type": "refined", "text", "by", "at", ...}` to a card; through core's `set()` its `type` would turn the card into a "refined" and its `text` and `by` would overwrite the card's own. It is kept whole instead, the latest wins.

EVERY line with a `content` key must be redirected, not only the first. `page_add()` appends one such line per item, and core's matching guard (`!(this.content instanceof List)`, `Page.class.js`) only protects the FIRST, because every later one is meant to reach the SAME list through `this.content` by ordinary property lookup. This card keeps its list under `this.dashboard` instead (its `content()` is the render method), so that lookup would never find it.

## dashboard
The Now card's dashboard is a plain List of titled notes (`page_add()`'s `content.add`), drawn with core's content-list row look (`render_content_list()`), borrowed rather than redrawn a second time (CLAUDE.md law 6). A card has no `content` List of its own to swap onto, so `this.content` is swapped onto `this.dashboard` only for the one call that reads it.

## chat-and-card
Chat and card are one content model (one-dictation item 9, 2026-09-30): while this card is selected and the owner dictates in the global sidebar, the smart assistant refines what was said and writes it into this card's `page.jsonl`, the same line `Servex/agents/Sessions.js`'s `line()` writes to the session file, shape `{at, session, path, card, from:{kind:"assistant", id:"smart"}, via, text, re, level}`. Only a LEVELED line reaches a card (Sessions.js calls `cards.append` only when both `card` and `level` are set), so a plain chat echo never lands here; that stays the sidebar's job. `refinements()` draws the result.

## sub-cards
Core would read a listed child from `this.url + name`, which is AI 2's address, where no file is. A sub-card is read from the FOLDER instead, listed or not, so any depth works and a link to a sub-card made a second ago too. A sub-card whose line 1 has no id (a topic stub) would talk into NO card: its chat's `re` is its id, so `child()` sets one.

## regions
Two fixed regions: the card, scrolling in its own box, and its properties, a quiet sidebar on a screen 40em and wider (`properties_sidebar()`), nowhere on a phone. A top-level card's sub-cards open in AI 2's third column beside it, and the deepest open card's sidebar is the one on screen (`ux/Card/Card.css`, last block).

## flat-row
Every depth joins the same flat row (subcard-columns, 2026-10-03). It was `if (shell && !sub)`, so only a top-level card redirected its child into the shell's shared column; a sub-card's child fell through `container()`'s walk up the parent chain to the same place anyway (the nearest ancestor with `$pages`). Setting it for every card makes that explicit instead of relying on an implicit walk two files away.

## fresh-card
A fresh card still starts listening (item 10's rule), but into the ONE global drawer agent now, never a card of its own (one-card-props, 2026-10-03 follow-up: "a brand new context isn't necessarily better, it might be worse"). On the phone that is the sheet; on the desktop there is no mic in this sidebar any more, so the owner opens the drawer when they want to talk. A later task can wire the desktop drawer open the same way.

## breadcrumb
(subcard-columns, 2026-10-03 -- "the DETAIL side splits into two equal columns... as deep as it goes".) Only the last two open levels are ever on screen (`Card.css`'s `:nth-last-child(... of ...)` rule). Everything opened before those two is named in the breadcrumb, oldest first, so three levels deep never loses the way back. It is built for every sub-card (cheap, a few parent pointers) but CSS decides whether it shows: on a wide screen only the card that is the EARLIER of the two visible columns draws it; on a narrow screen the one visible card draws it (`.ai2-crumbs`). Oldest first is a familiar folder path (CLAUDE.md: "clarity is familiar structure"), reading toward you the way drilling down was described.

## properties
(one-card-props, 2026-10-03 follow-up.) Replaces the per-card chat column: nothing here is talked into, it is read. Type, status, tags, who worked on it, its files, then Actions: the same `type_picker()`, `Agents.panel()`, `draw_folder()` and `actions()` the card already had, moved out of the header and the "More..." fold into their own column. What it cost lives here always (the owner, 2026-09-25: "nowhere in here does it say what it cost"): `state_span()` in the header only speaks up while something is running, so an idle, taskless card needs this line.

## seams
`Card.seam()` is the site's own `ext/grip` (the rail's handle) writing one token on the AI 2 shell so every card shares the width: `--ai2-chat` (card | chat) and `--ai2-subw` (card | sub-card column). Double-click puts the default back. It is made where it is called, so it lands in whatever box is being built; `before()` runs on every drag move, before the width is written. The chat column is one token for every card: the chat keeps its width as you move between a card and its sub-cards (layout-unify, 2026-09-24).

## global-ai
The global AI's own copy of this thread (one-ai, 2026-09-29): the mobile sheet draws this card's `chat_entries()` too, through its own `chat()` instance, so a reply streaming in must reach THAT instance's `sync()` as well. Cheap and safe every redraw: `rail.js` is already loaded on every page (`menu.js` imports it eagerly), and it is a no-op unless the sheet exists, is open, and shows THIS card. The drawer's AI tab does the same through `sync_card_thread()`.

## tabs
(the owner, 2026-09-25) A top-level card has Overview (what the card is, its state, its summary) and Tasks (its requests, grouped, and the task pages of the agents on them), plus Activity. A request (a sub-card) is one page, no tabs. The strip wears `ext/tabs`' classes but is not `Page.tabs()`: that one routes each tab to a child url, and a card's children are its requests. The tab bar shows Tasks only when it has something in it (ai2-lead audit, 2026-09-25: "two tabs, and I don't even know if I want to click either"); a card with no requests and no group is one page. Activity is always there (2026-09-25).

## tiny-tabs
(the owner, 2026-09-25: "put everything on this page into a tab system... without padding, make it full bleed and use like, kind of tiny top tabs".) Opt-in per card: one `{"layout": "tabs"}` line in its page.jsonl (plain data, kept by core's `set()`). Every section is a tab (the outline, each placed thing, the tasks) and one shows at a time. The chat is NOT a tab: it stays the right sidebar ("Make chat a persistent right sidebar"). Each tab is a real page ("Why not just make those actual pages?... use the page route mechanism"): `route()` builds it on demand, so `.../now/usage/` is a child page like any other and the tabs are plain links. It mounts in the card's `regions` panel (core's own claim for a named child, the one `ext/tabs` uses), and the outline sits there as its `.default`. No folder per tab: a tab lives only in the card's page.jsonl as its `place` line.

## tab-routes
(2026-09-25, ai2-resurface-bar.) Overview is the card's own url; Tasks and Activity are child pages (`.../<card>/activity/`), so a reload, Back and the rail's "what happened" bar all land on the tab by url alone, the same shape as the tiny tabs. The page draws nothing: the card draws the tab in its own panel and the page is only how the url names it. It mounts in `$tab_slot`, a hidden box `content()` makes. A request with the same name keeps the name.

## header
(the owner, 2026-10-03 follow-up.) The header read "nothing running · cost not tracked" and an Actions dropdown nobody pressed, on every card whether or not either was true. `state_span()` now draws nothing idle; Actions lives in the properties sidebar.

## reviewed
Brief E's "Reviewed ✓" (contract-v2 section 5) shows only while THIS card carries one of the two HEURISTIC needs (a card typed "question", or one whose own last message ends in "?"). A placed Decision or Question never gets this button: contract-v2 says those clear only by being answered, and `needs-rule.js` (minion F) enforces that. This is just the one control that writes the line: one `{"reviewed": ...}` line through the same `/card/append` path every other write on this page uses. `Needs.soon()` wakes the shared scan so the row leaves the rail's "Needs review" filter and the Needs you tab at once, instead of waiting for the next poll.

## actions
One menu for what you can do to a card (ai2-lead audit, 2026-09-25). The owner, on the header it replaced: "a dropdown that says 'group': what is a group? If I switch it to question, what does that do? I don't want to try." The kind picker, the lone flag and "clear" were three unlabelled controls; here each is a plain sentence. A card that IS flagged still shows it in the head, since that is state, not an action.

## refinements
The page-mode reading of the dictation (item 9): `summary`/`edit` lines are the card's own points, newest first, reusing `.ai2-refined`, the class the board's rows already use for a refined reading (`faces.js`). `clean` lines are the tidied transcript they came from, folded underneath in the same closed-details shape `more()` uses, so a reader sees the point first and opens the words only if they want them. A card with no refinement yet draws nothing here.

## by-request
A card with requests is summed up by its requests (the owner, 2026-09-25: a day of landed work read "0 Delivered"). Old cards have no `item` lines, so the checklist is the requests themselves, each ticked by `load_groups()`'s delivered rule, under its group.

## topics
A sub-card is not always a request. System design's are topic stubs, `{"title", "icon"}` and nothing else: no id, no class, nothing asked. So a row's title is read from the sub-card's OWN file (`load_groups()`), and a sub-card nothing was asked in is a TOPIC: listed, never counted as "to do". The card's own task pages (a group's members) are counted beside its requests, as `outline.js` always did. A topic row unread since it changed gets one small word, no animation (topic-cards, deliverable 4), from the same per-browser flag every row's bold title uses (`mark_read`/`is_read`, `rules.js`), not a second tracker; `activated()` clears it.

## more-label
(the owner, 2026-09-25, on "More: this card's files, its full words, what it cost": "what does that mean... when I click this what am I supposed to expect".) The label is built from what is actually inside.

## cost
(the owner, 2026-09-24: "What took so many tokens?") A group shows one row per member task (its mastermind, its minions, its total) and the group's sum, each dollar once. A task card shows its one line. Who spent it, agent by agent with each model, is the task page's own Report tab just below (`ai/AITask/cost.js` `breakdown()`), so it is drawn once. A card with no task shows nothing: nothing measured it.

`cost_model()` is the cost block as data, and `draw_sig()` reads it too. The signature skips a redraw that would paint the same pixels, and it did not list cost: the card drew once before the group's task logs had loaded (no rows, so no table), and when the cost lines arrived the signature said "unchanged" and the table never appeared (live, 2026-09-24). Rows sort by cost, largest first: that answers the question, and a task's `now` moving (which reorders `members()`) is no reason to redraw.

## load-groups
A request's group is a line in its OWN log, so each is read from its file, latest wins. Only the unknown are fetched; `activated()` re-reads them all, so a group line written while you were away shows when you come back. Only a line that is `{"group": "..."}` alone counts, the same test `groups.js` uses. The same read says whether the request was DELIVERED (the owner, 2026-09-25): its latest status is done, or a manager's message begins "Landed" (or "Done"), or an item line is done.

## mark-read
(2026-09-30, ASK 2, "opening a row marks it read".) Not a reopening of the 2026-09-22 decision in `page.js`: that one was a SHARED `read` line (`verdicts.jsonl`) that made a row vanish for everyone the moment anyone opened it ("No no no. I need them all unread again."). This is a per-browser `localStorage` flag (`rules.js`) that only un-bolds a title; the row never leaves the Inbox and nobody else's copy changes. The Live card has no `id` worth marking and is always drawn fresh, so this is harmless for it. `top`/`ws` (page.js's rail header, the `workspace` word) are both `tabbed()`: a top-level card fills `$detail` and is exactly what `in_workspace()` would change; a sub-card is neither, so it must not touch the word for the top-level card still open beside it. The "Reviewed ✓" button's visibility reads the same shared scan the Needs you tab and the rail's filter do, so redraw when it refreshes.
