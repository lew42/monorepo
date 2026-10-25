verdict: pass
1. [note] At 1920 the "Say something" box and the open AI drawer on the right show the same global chat at once: two composers, two "Pick up where you left off?" prompts (shots/1920.png, top-left card and right drawer). It is one component, reused as the brief asked (AIDashboard.js:188, `keep: true`), but when the drawer is open the card repeats it. Consider hiding the card while the drawer is open.
2. [note] "Ready to merge" still reads 0 (shots/1920.png, Needs you card and the orange pill). The minion traced this to Server/ReadyToMerge.mjs not reading module `tasks/` folders, and says worktree/merge-list-module-tasks (ac6d8605c) fixes it (session.jsonl, decision log). Merge that branch with this one, or the owner's one decision still shows a wrong 0.
3. [note] The "Usage pace" card (item 6) is missing from both shots because the worktree has no gitignored usage.json, and UsageLine.js:15 then removes the card. The code path is correct; it just hasn't been seen on screen. Check it on the main site after the merge.
4. [note] DashQueue.js:369-373 saves and restores `QueryClient.current` from outside the class to get a one-shot query. It works: replies come back on `socket.request`, and only pushes route through `current` (QueryClient.js:37-38). A `live: false` option in the QueryClient constructor would be simpler and safer, and it would also close the one-live-client limit filed in ext/Query/improvements.jsonl.
5. [note] Nothing imports SessionStore.js, SessionTree.js, SessionRow.js, DayStrip.js or OriginChips.js in ai/AIDashboard/ any more (grep: their only callers are each other). The readme says so (readme.md:458), but under the never-destructive rule they belong in ai/archive/retired/ rather than sitting live beside the dashboard. The day strip and origin grouping the old page had are now on no page; /framework/ai/sessions/ is a different list.
6. [note] The Needs-you rows show the same item twice: "Checkup on everything the voice sessions started" (shots/1920.png and shots/390.png, Needs you card, rows 1-2). That is probably duplicate data in Servex `/waiting`, not this code, but it is the first thing the owner reads. DashNeeds.js:338 could drop duplicates by title or card.
7. [note] On a 1920 screen the pill row (the links one click down) sits under the content at about y=945, and the grid ends with about 330 px of empty page below it (shots/1920.png). That is fine, but the Sessions link the brief names is easy to miss at the bottom.

## Requirements
Shots given: 1920 and 390 for the new page, plus before-shots of /framework/ai/ and /framework/ai/inbox/ at both widths.
- 1 "What the owner sees today, and what is broken": yes. The before-*.png shots are there. session.jsonl logs the ready-to-merge 0 (the cause and the branch that fixes it), the missing index.json in the worktree, and the chips wrapping to 3 rows at 400. Console errors were not logged as a separate check.
- 2.1 "A place to say something… reused": yes. `chat()` from ux/Dictate (AIDashboard.js:188); shots/1920.png top-left. See note 1.
- 2.2 "What needs the owner… each with its real count": yes. 42 waiting with a breakdown by kind, and 0 ready to merge (note 2) (DashNeeds.js).
- 2.3 "The big things now… the Now line": yes. shots/1920.png middle column: three priority.md rows, each with its Now line and a link to the full file.
- 2.4 "What is running… state and cost": yes. AINow is reused; it shows "0 sessions working now", so state and cost could not be seen in the shot.
- 2.5 "The task queue: count and top 3, linking to /queue/": yes. 142 queued, #1-#3 with costs (shots/1920.png right column).
- 2.6 "Usage pace: one line": partly. The code is there but the card does not show in the worktree shots (note 3).
- "Sessions list moves one click down": yes. The Sessions pill is second in the row (AIDashboard.js:129).
- "Only one live QueryClient… say which you chose": yes. AINow is the live one; the others are read once (readme table, session.jsonl). See note 4.
- "Bring the readme current + one line in dashboard-layout-asks.md": yes. Both are in the diff.
- "Log ready: <branch> at <sha>…": yes. session.jsonl last line: worktree/ai-dashboard-2 at 29898e5ba.
- Live instances of a new class: n/a. DashNeeds, DashBig and DashQueue are views that read once and hold no state worth watching.
## Page structure
- page 1: yes. shots/1920.png: the title "AI", then cards in the order the brief set.
- Most important first: yes. Say something and Needs you are top-left at 1920 and first on a phone (shots/390.png).
## Navigation
- Techniques: a pill row (PageNav), the left sidebar, the right AI drawer.
- Pill row wraps: no. One line at 1920, and it scrolls sideways at 390 (shots/390.png, bottom band; PageNav.css:411). The 3-row chip wrap from the top-tabs review is fixed.
- Stable navigation: yes. Same links as before, with Sessions moved forward and Old Inbox added.
## Layout
- One page scroll, no inner scroll boxes: yes. shots/390.png is one column with one scroll, which meets dashboard-layout-asks.md.
- Columns used at wide widths: yes. Three columns at 1920 (AIDashboard.css:84), two at 60em, one on a phone.
## Sizing
- Cards sized to their content, none stretched: yes. shots/1920.png: the columns are equal thirds and the cards hug their content.
- Wasted space: some. About 330 px is empty below the grid at 1920 (note 7), and there is a gap under "Nothing is running right now" (shots/390.png, What is running card).
## Wrapping
- Unwanted wraps: no. The priority titles and queue titles wrap onto 2 lines at 390, which is fine. The pill row does not wrap.
## Spacing and padding
- Even gaps: yes. 1em between cards and padding of 0.8em 1em inside each (AIDashboard.css:48-51); this matches the shots.
## Colour and contrast
- Contrast: yes. Section headings are at 0.65 opacity, uppercase and small (AIDashboard.css:52), and still readable in shots/1920.png. The prime-colour number badges and pills are legible.
## Flow
- The order reads top-down: yes. Say, needs you, big things, running, queue, then links (shots/390.png).
## Words
- Plain and short: yes. The headings are the owner's words ("Say something", "Needs you", "The big things now"). Failed reads say what happened ("Servex did not answer, so the waiting count is not shown").
- The placeholder "Say something: it goes to the assistant and is kept." is a little long; fine as is.
