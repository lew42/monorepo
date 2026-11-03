verdict: fix
1. [fix, fixed] [Models](/framework/ai/models/) drew its tables outside its own page: at every width the AI header was squeezed into a 338 px column (tabs on 4 rows at 1200, text over the header at 400). Cause: `content()` drew after an `await`. Now the box is captured first.
2. [fix, fixed] [Inbox](/framework/ai/): a 153 px band under the rail at 1920 held two small chips ("6 open tasks…", "Inbox · 1"), the same footer the owner called "useless" on Sessions. Hidden on the AI page; the rail now runs to the bottom (shell 784 → 937 px).
3. [fix, fixed] [Sessions](/framework/ai/sessions/): first grid row 33% down at 1920 and 42% at 3440. The panel's own "Sessions" header (it repeats the tab) is gone, its "updated" time moved to the status line, rows are tighter: now 26% and 29%.
4. [fix, fixed] Sessions on a phone: the status footer was 140 px (three meters stacked); now 63 px, and each chip row is one swipeable line.
5. [fix, fixed] A session's page was titled by its id (`730e8a7b-4cbf-…`) in the crumb and the column head; it now shows the grid's name ("Ultracode", read from the session index), checked live.
6. [note] The Inbox's pinned **Now** card is from Oct 6 (a stopped agent) and sits above Today: not "ranked by recency". Owned by the running inbox-ranking task; written in [core/Page/ext/Inbox/doc/next.md](/framework/core/Page/ext/Inbox/doc/next.md).
7. [note] Coverage tab: each prompt is a card inside a card, ~70 px apart; the INBOX tab stays lit on Models. [ai/sessions/doc/next.md](/framework/ai/sessions/doc/next.md).

Widths: 400, 1200, 1920, 3440 for all four pages. Live after the merge: zero failed requests and zero page errors on all four. Fresh reviewer (Sonnet, $0.40): pass, 5 notes, 1 real (docs links), fixed. Shots: `shots/before/<page>/` and `shots/after/<page>/` (`sheet.png` = the four widths, `1920.png`, `layout.json`).

## The owner's sentences

| Ask | Before | Now |
|---|---|---|
| Sessions: no "major fail on layout" (header 50% down, giant footer, zero left padding) | first row 33% (1920) / 42% (3440); footer 140 px at 400; left 33 px | ✅ 26% / 29%; footer 32 px (1920), 63 px (400); left 33 px |
| Inbox: "a prioritized view of only the important things, ranked by recency… inbox zero" | archive + seen exist; pinned Now card is 7 days old | ⚠️ still pinned first (note 6) |
| The rail stays when a card opens | yes: Live opens on the right, rail on the left; AI title links back | ✅ unchanged |
| Names the owner knows | session page titled by uuid; Models printed raw JSON | ✅ name; "anthropic 11, unknown 2" |
| Level 1 above the fold at 400 / 1200 / 1920 / 3440 | Models broken at all four | ✅ Models, Inbox, Sessions; detail fine |

## Per page, per system

- **Inbox** — layout: shell 784 → 937 px of 1000 at 1920 · navigation: rail + routed card pages, back/reload land on the card · wrapping: tabs 2 rows at 400 (fits), 1 row above · colour: NEW/DECISION chips readable · words: ⚠️ "Now" card text is a stale task id.
- **Sessions** — layout: grid head y 326 → 220 (1920), 418 → 248 (3440) · footer one line · left rail stays · wrapping: chip rows one line at 400 · words: names from tab titles.
- **Session detail (Coverage)** — layout: grid stays beside the detail at 1200+ · Coverage score card first · ⚠️ nested cards waste ~70 px each (note 7).
- **Models** — layout: now a normal page; tables leave the 640 px prose column (one line per row at 1200+, wraps at 400) · words: snapshot percentages are as of `now.json`'s time, said on the page.
