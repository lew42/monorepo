# verify-dashboard - verify, for real, whether these requests were met

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.
You are read-only over the repo except for your own task dir - see the fence near the bottom.

## The three laws, short

1. **Less is more.** Fastest useful version first. A demo beats a description.
2. **Clear beats brief - by far.** Plain full sentences, basics first, written for a newcomer who
   is overwhelmed. Clipped fragments and jargon are a failure, not economy.
3. **Prioritize.** Most important first. Everything reads as a quick scan.

## Why you exist

Earlier today another agent audited 53 things the owner asked for and graded each one. The owner
has now said, in so many words: **find that report, work from it, but do not treat it as
thorough.** Your job is to be the second, harder look at ONE topic, so that you are not distracted
by the other 52 items.

Your topic is: **The AI dashboard itself - V1, V2, V3, the cards and the timeline**

## What "verify" means here, exactly

For each request below you decide one verdict, and you must be able to point at the evidence:

- `done` - the thing the owner asked for exists and works. You loaded the page, or ran the code,
  or read the file and can quote the lines that do it.
- `partly` - some of it exists. Say precisely which part is missing.
- `differs` - something was built, but not the thing that was asked for. Say what the difference is.
- `not` - nothing was built.
- `cannot-tell` - you could not establish it. Say what you would need. This is an honest answer and
  is much better than a guess.

**You may not take the earlier audit's word for anything.** Its verdict is a hypothesis. Where you
agree, say that you checked and how. Where you disagree, say so plainly and show the evidence - a
disagreement you can prove is the single most valuable thing you can produce today.

**The owner's own words are the standard, not a task's summary of them.** Each row below carries a
`quote`. Read it. A task that shipped something adjacent, or shipped the easy half, is not `done`
just because its own log says it landed.

## Where to look

- **The earlier audit, your starting point:** `public/framework/ai/2026-09-19/day-audit/audit.jsonl`
  - one JSON object per line, with `id`, `title`, `quote` (the owner's words), `verdict`, `why`,
  `done`, `tasks`, `links`. Read only the rows whose `id` is in your list below.
- **The owner's verbatim words from 15:36 onward:** the `chat` lines in
  `public/framework/ai/2026-09-17/mastermind-layout-browser/task.jsonl` - 53 of them, all today.
  **Before 15:36 there is no verbatim record** except the `quote` fields in the audit. That gap is
  itself worth reporting if it stops you deciding a row.
- **What each task claims it did:** `public/framework/ai/2026-09-19/<task-slug>/task.jsonl`. The
  slugs are in each audit row's `tasks` field, and the `landed_at` line's `outcome` is the claim.
- **The live site:** dev servers are already up on **port 80** (the owner's) and **8123**. Use them
  READ-ONLY - load a page and look. Do not start your own server; you do not need one.
- **Screenshots:** the `ui-test` skill drives a headless browser. Use it whenever a claim is visual
  ("the cards have no black border", "the columns are equal"). A visual claim you did not look at
  is `cannot-tell`, not `done`.

## What you must not do

- **Never kill or restart the dev server.** The owner is on the live site right now.
- **Never drive the owner's open browser tabs.** Headless only.
- **Never `git stash`, never commit, never push.** The tree is shared with other agents in flight.
- **Do not edit any file outside your own task dir.** You are a verifier, not a fixer. If you find
  a one-line fix, write it down as a finding with the exact file and line - do not apply it.
- **Do not search from the filesystem root.** Scope every search to the repo.

## Your deliverables - there are exactly three

**1. `verify.jsonl` in your task dir** - one line per request, using the same `id` as the audit row:

    {"verify": {"id": "<id>", "verdict": "done|partly|differs|not|cannot-tell", "agrees": true,
      "why": "<two or three plain sentences: what you checked and what you found>",
      "evidence": ["<file:line, a URL you loaded, a shot you took>"],
      "missing": "<what is still not there, in plain sentences - omit when nothing is>"}}

**2. `page.js` in your task dir** - ONE SCREEN, mostly above the fold. This is what the owner
reads, so it is held to the presentation rule hardest:

- The takeaway is a sentence at the top, in plain words - for example, "Nine of these twelve are
  genuinely done; two were graded done and are not."
- Then the disagreements with the earlier audit, first and biggest, because they are the news.
- Then the rest as a compact list, one line each, each linking to the task it came from.
- Detail goes one click down or into your `task.jsonl`, never onto this page.
- Do not tell the reader what you are about to show them. Show it.
- Run the `new-page` skill for the shape, and add your page to the day page's `children:` so it is
  reachable - nothing crawls, and a page nobody links to does not exist.

**3. Your `task.jsonl`** - open it with the `new-task` skill BEFORE your first write, with
`"group": "ai-ops"` and `"session_id": "a1c1d1e1-0001-4a19-9b01-000000000001"` exactly. Findings go in it as `log` lines as you
go, never into a separate findings.md. Land with the `finish-task` skill.

## Length budget

The page is one screen. Your landing `outcome` is a headline plus at most five sentences with
links. Everything longer lives in `verify.jsonl` and your log lines.

## Fences - the files you own, which nobody else touches

You own, exclusively: `public/framework/ai/2026-09-19/verify-dashboard/**`

You may also add exactly one line to `public/framework/ai/2026-09-19/page.js` `children:` (your own
page), and append to `public/framework/ai/2026-09-19/day.jsonl`. Nothing else, anywhere.

Four sibling minions are verifying four other topics at the same time, each owning its own dir. If
you believe a finding belongs to another topic, write it in your log and leave it alone.

If a skill misleads you, or is silent about a trap that then bites you, append ONE evidence line to
`.claude/skills/<skill>/improvements.md`; the `skill-improvement` skill is the thirty-second
version.

## Your rows - 12 of the 53

### `ai-v2` - earlier verdict: **done**

**Asked for:** A second version of the AI dashboard at ai/v/2: full screen beside the sidebar, where the mastermind can put content on the screen in real time.

**The owner's words:** Do we have a way to override this page so that you can just make shit in real time? [...] Make a sub page that takes over the full screen space, not including the sidebar. [...] let's create a second version of the AI dashboard at AI slash V slash two.

**The earlier audit's reasoning:** V2 exists, is live, and takes a line without a reload. You moved on to V3 the same hour, which is why it still reads as in flight.

**Tasks that claim to cover it:** ai-v2

### `version-picker` - earlier verdict: **done**

**Asked for:** The version picker: name the versions V1 and V2; the AI title and the picker share one flex row; a button makes the next version (V3) automatically.

**The owner's words:** I'd probably name those a little bit cleaner [...] maybe just V1 and then version two can just be V2. And it could make those automatically when you click a button. So we can go for V3. And also it should be flex - the title [...] the container that has the AI and the drop down in it.

**The earlier audit's reasoning:** V1, V2, V3 beside the title in one flex row, and New version makes the next one.

**Tasks that claim to cover it:** popover-system

### `ai-v3` - earlier verdict: **done**

**Asked for:** A V3 of the dashboard: the same layout, blank, one card that says ready; spacing from tokens that grow with the page in container units; the mastermind answers on this page instead of in the chat.

**The owner's words:** make a V3 and leave it blank [...] put a title on it, and make one empty card that just says ready. [...] the default padding should be basically a clamp that goes from like maybe 0.5 em up to like 2 em across our mobile to mega resolution set [...] use container query units [...] as I send these messages to you, I want you to update the UI with your responses. You don't have to respond here, just update the AI v3 page.

**The earlier audit's reasoning:** V3 went up blank with a Ready card, the spacing came from container-unit tokens, and the mastermind started answering there instead of in chat.

**Tasks that claim to cover it:** none named

### `spatial-timeline` - earlier verdict: **not**

**Asked for:** V3 timeline view: full bleed, hour and minute lines, times outside the cards, adaptive gaps; important items must not sink under streams - a pinned strip, a Live toggle, the head row as the toolbar, auto-select a newly arriving card unless the owner has selected something.

**The owner's words:** New idea for the log: a graphical timeline. Events are placed spatially so distance shows time apart, on an adaptive scale: an hour mark always (4:00, 5:00), minute marks only above and below where events land, seconds placing an event within its minute. It auto-scrolls as time passes. Long empty gaps collapse to a '4:00 ... 6:00' break and the timeline restarts.

**The earlier audit's reasoning:** You asked for the graphical timeline at 15:56, and again at 16:39, 16:49 and 17:08 ('we still don't have grid lines on the timeline'). It is specified in full, down to the hour lines and the collapsing gaps, in ai/2026-09-19/v3-timeline/requirements.md - and that brief was never dispatched.

**Tasks that claim to cover it:** spatial-timeline

### `current-view` - earlier verdict: **differs**

**Asked for:** A persistent 'current' view on the AI dashboard: the thing happening now in full detail, usable with the dev bar closed; the owner's exact words appear the second they send as a transcription card, then refine into the summary; the main wall stays refined; measure and cut the real prompt-to-card delay.

**The owner's words:** A persistent 'current' view on the AI dashboard (maybe a tab at the top): the thing happening now, in full detail, usable when the dev bar is closed. The owner's exact words appear the second they send, as a transcription-style card, then get refined into a summary/workflow as it is processed. The main left view stays refined, not a full persisting log. [...] please measure the real delay from prompt to card and cut it.

**The earlier audit's reasoning:** The Now view landed and is the default: your newest words verbatim with the answer growing underneath. The other half of your sentence - 'measure the real delay from prompt to card and cut it' - became a queued task; two of the six hops are measured, the end-to-end number is not.

**Tasks that claim to cover it:** dashboard-next

### `v3-layout` - earlier verdict: **partly**

**Asked for:** AI v3's layout: two equal resizable columns - a left rail of small preview cards in timeline order, newest on top; the selected item in full on the right, first one selected at load; clicking routes (the URL changes) without switching pages; cards are dynamic, from the log.

**The owner's words:** AI v3 layout, build this: two equal columns with a resize handle between them. LEFT = navigation rail of small preview cards with icons, in timeline order, newest at the top. RIGHT = the selected item shown in full; the first rail item is selected at load. Clicking a rail card selects it and routes (URL changes) instead of switching pages. The cards need not be real pages or real files: they can be dynamic, loaded from the log.

**The earlier audit's reasoning:** Recorded as landed at 16:25. You said at 16:27, 16:39, 16:49, 17:08 and again at 17:17 that it was still not right - your last words on it were 'We still do not have the proper layout that I asked for.' What exists is a two-column inbox with a drag handle and a url per card. What you asked for and do not have: full bleed with zero page padding, two EQUAL columns, and the left column as a timeline with hour lines.

**Tasks that claim to cover it:** devbar-chat

### `realtime-v3` - earlier verdict: **partly**

**Asked for:** V3 must be real time; a pure append-only streaming log whose entries can also transform or append to existing cards; build the timeline grid; nothing should wait on the owner unless dangerous - audit what is on hold; monitor V3's console errors and relay them to its minion at once; never two minions on one page; cards of random widths.

**The owner's words:** AI v3 must be real-time: everything appears instantly [...] a pure streaming log, append-only, nothing can break [...] log entries can also transform or append to existing cards [...] Nothing should wait on the owner: pick a sensible default and go, unless the action is dangerous or destructive; audit anything currently on hold. [...] run a monitor on the v3 page and relay every error at once to the minion working on it. [...] never two minions on the same page at once.

**The earlier audit's reasoning:** Two of your rules went into the mastermind skill (never wait on you unless it is dangerous; never two minions on one page) and the error monitor is relaying. The timeline grid you named in the same breath was not built.

**Tasks that claim to cover it:** devbar-chat, card-word

### `v3-prompts` - earlier verdict: **not**

**Asked for:** Dashboard: a new item lands on top without moving scroll or selection, a New item button, Spacebar jumps to it and selects it; cards can carry yes/no controls so the dashboard can prompt the owner; a toolbar per column; cards referenced again rise and can embed a preview of another card; write no CSS unless needed.

**The owner's words:** a new dashboard item lands at the top without moving the user's scroll or selection; a 'New item' button appears; Spacebar jumps to it and selects it (StarCraft-style); items can carry yes/no controls so the dashboard can prompt the owner; a toolbar per column [...] cards referenced again should rise up and can embed a preview of another card; remove the useless V3 CSS [...] write no CSS unless needed.

**The earlier audit's reasoning:** Only the one CSS deletion was done. A new item landing without moving your scroll, the New item button, Spacebar to jump, a toolbar per column, cards that rise when referenced - none of it. The yes/no buttons on a card you asked for in the same breath were built at 17:34, but as a demo page, not on the dashboard.

**Tasks that claim to cover it:** v3-timeline

### `v3-cards-css` - earlier verdict: **differs**

**Asked for:** V3 card CSS: selection is unclear (orange border, odd ground); a radius token belongs in the framework card class; V3's tile should simply BE the card class; no flex column on cards unless needed; audit V3's CSS and delete what the framework already does - too much CSS is breaking the system.

**The owner's words:** Selected cards get an orange border and the background looks odd; selection is not clear [...] Is there a border-radius token? [...] put it INTO the framework card class. The V3 tile class should just BE the card class from framework.css; no separate v3-tile CSS. The CSS system is being broken by creating far too much CSS. No display:flex / flex-direction:column on cards unless truly needed [...] audit V3's CSS for anything the framework already does and delete it.

**The earlier audit's reasoning:** The good part is real: every V3 card now wears the framework .card class, with the radius token and the padding built in, and a pile of hand-written CSS was deleted. But you said 'this v3-tile should just be a card, we shouldn't need a new v3-tile' - and .v3-tile is still there, 19 rules of it, as a second layer on top of .card.

**Tasks that claim to cover it:** card-word, dashboard-next

### `v3-card-look` - earlier verdict: **partly**

**Asked for:** V3 cards: no black border; a less white fill that lightens on select; the requested layout (full bleed, two equal resizable columns, a left timeline with hour lines) is still not right.

**The owner's words:** V3 cards: no black border; less white fill that lightens on select; the requested layout (full bleed, two equal resizable columns, left timeline with hour lines) is still not right.

**The earlier audit's reasoning:** The look is fixed: no dark border, unselected cards a step off white, the selected one fully white. The layout named in the same sentence - full bleed, two equal resizable columns, a left timeline with hour lines - is not.

**Tasks that claim to cover it:** dashboard-next, v3-timeline

### `idea-cards` - earlier verdict: **done**

**Asked for:** Dev bar = the detailed real-time log; the AI dashboard = big idea cards by importance. White cards with a colored left edge only; every card a real route; nested cards with a top-three preview of what is inside; say how the wall is sorted; two equal columns; the standard pad.

**The owner's words:** the dev bar holds the detailed log (exact transcriptions, real time). The AI dashboard on the left becomes big idea cards: organized by importance, so a topic the owner keeps talking about is bigger and higher. Each card has an icon, a short title and a timestamp, e.g. a crash icon, 'Site crash', and clicking opens the detail. [...] far too wordy: they want cards, not paragraphs.

**The earlier audit's reasoning:** The dashboard is a wall of idea cards: an icon, a short title, a time, a coloured status edge, its own url, a top-three preview of its children, ranked by importance.

**Tasks that claim to cover it:** devbar-chat

### `joint-timeline` - earlier verdict: **not**

**Asked for:** A request for the owner's yes appears as a card in the log; cards on the left plus a log on the right is two places to look - one joint timeline instead; timestamps are on the wrong side of the log items.

**The owner's words:** if you need a yes from me, that should be in the log card [...] we have all these cards on the left, and I have this log in the sidebar on the right. And I'm not sure where to look. It's kind of distracting [...] we might actually want a timeline, a joint timeline. [...] the timestamps just broke. The timestamps are on the wrong side of the log items.

**The earlier audit's reasoning:** This is recorded as landed, and it is not built. Its own conclusion says 'one joint timeline is being built' - a promise, written down as an outcome. The task that would build it, ai/2026-09-19/v3-timeline/, has a finished brief and no task log at all, which means no agent was ever sent to do it.

**Tasks that claim to cover it:** devbar-chat
