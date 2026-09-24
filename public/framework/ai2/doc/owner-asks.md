# What you asked of the AI dashboards, 17–24 September

This page gathers every sentence you said about the AI dashboards' layout and interface in the last
week, word for word, grouped by topic, each checked against what [`/framework/ai2/`](/framework/ai2/)
actually does today (24 Sep, headless, at 1920 and 1280). The key: ✅ done · ◐ partly (a smaller
version, or it works but something named is missing) · ✗ not done · — superseded (an ask for the old
boards that a later ask, or the AI 2 rebuild, replaced).

## Not done yet, clearly wanted

1. ~~[The overview's four columns don't fit the screen](#overview-fit)~~ — fixed 24 Sep.
2. ~~[The rail's top row overflows](#rail-head)~~ — fixed 24 Sep.
3. [Cards in sizes: big for the topics you keep coming back to](#sizes) — every row is the same size today.
4. [Cards named well, with big familiar icons](#names-icons) — many rows are titled "New card" with a 20px icon.
5. [A read/unread you control, not a 354-card wall](#unread-wall) — every card is unread, so the orange dot is on every row and means nothing.
6. [A dark card for a mastermind or minion session](#dark-card) — no such card exists.
7. [Add sub-cards anywhere, and turn a card into another type](#sub-cards-anywhere) — sub-cards only come from a card's own log.
8. [Flagging a second time takes two clicks](#flag-twice) — the ⚑ still toggles off first.
9. [Opening an agent must not push the page down](#agent-expand) — the Live card opens an agent's chat under its row, pushing everything below it.
10. [A mic source menu, and a meter that shows a dead mic](#mic-source) — the level bar exists; there is no source picker on AI 2.
11. [An end-of-day report, and where the tokens went](#day-report) — AI 2 lists today's landings but has no daily summary or token breakdown.

---

## Layout & columns

<a id="two-columns"></a>
#### A rail on the left, the selected card on the right
> we still don't have the grid turned into two equal columns. I definitely want two equal columns. We're going to use the left side as a rail, a navigation. When you click on one it becomes selected, it's routed to see the content instead of switching. […] those should be resizable columns, I know we have those all over the place, we need a resize handle on there. And then the right side should start off with the first item in the rail selected.

> Now what I'm thinking is we probably want a two column paging system for the AI dashboard. So on AI v3, we want to have two columns, two equal columns.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — a rail beside a routed card page, with a drag grip (`page.js:160`). "Equal" and "first item selected" were replaced by later asks (a narrow preview column; nothing selected by default — see [live is deselection](#live-deselect)).

#### "Why don't we have the rail yet?"
> why don't we have the rail yet? Two columns, flex auto, I don't care how — get this grid off my screen: a rail with preview cards on the left, click one and the detail page shows on the right. This should not take so long.

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — the inbox view is exactly this, and it is the default (`page.js:45`).

#### Preview column, detail page, sub-items to the right
> We need to practice the sub-card routine. Remember /imagine/paging — how columns fill the space, split evenly or resizable, how many columns versus how much space; it gets tricky. Generally split the remaining area in two: the preview column resizable, the detail page taking the rest, with a measure; the sub-items within that card open to the right of it. Two columns for now, potentially three if there's space. Digging down and moving back up is important. The preview is just the title and a small status line; the detail is more of a full page with a table of contents or sub-cards, each a task or whatever. As I transcribe in real time those transcriptions turn into little UI widgets that can be clicked on and opened in a new column.

2026-09-22 · [task](/framework/ai/2026-09-22/ai2-nested/) · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — a card lists its sub-cards; one opens in a third column at its own url, with a back link (`page.js:569`).

<a id="left-sidebar"></a>
#### A left sidebar that stays put and resizes
> I want to focus on building a left sidebar that stays relatively fixed. And that can be any size. […] then we can use that left sidebar as a persistent navigation, it doesn't jump around, it's actually the simplest and easiest way to do it, and then you get a responsive resizable viewport that you can then render anything you want […]

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — the rail keeps its width (drag it, double-click resets, `page.js:196`); switching between layouts was not built.

#### Full bleed, padding inside each column
> So we need this AI V3 page to be full bleed, and then each column will have padding. That should probably be like section padding. […] Go with default padding, see what it looks like.

> The whole page needs to be full bleed, zero padding, so that each column can share the space evenly.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — AI 2 is edge to edge (`classes: "full fill"`, `bleed`); the card page pads itself (16px at 1920).

<a id="overview-fit"></a>
#### The overview: four full-height columns sharing the width
> These four columns should be full height and share the full width... no padding on this page, no borders, radiuses or gap... substantial padding on them... the default padding should scale with size.

2026-09-23 · [task](/framework/ai/2026-09-23/ai2-routes/) · ✅ (24 Sep) — the four columns sit beside the site sidebar, share the width, run full height and pad by the scaling `--ai2-ov-pad`; the giant title is gone. The cause was `bleed` on a page with no gutter to pay back ([task](/framework/ai/2026-09-24/ai2-dashboard/)).

#### Timeline grid lines with the hours marked (old v3 board)
> I want to see two equal columns. The left side will have the grid lines with timestamps, the every hour, for example, should be marked on the timeline so that we can roughly have spatial reasoning about it.

> what I think would be cool is a graphical timeline that attempts to put all of these timestamped things like an event log that uses spatial adjustments to represent how far away things are. […] you'd mark like four o'clock, five o'clock, whatever. […] you don't necessarily have to show huge gaps as huge gaps. You would just have a four o'clock dot dot dot six o'clock […]

> Okay, so we still don't have grid lines on the timeline. / Also we want a timeline grid. I've asked for this before. There should be a timeline grid.

2026-09-17 (four times) · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · — superseded — on 21 Sep you asked for "everything in one chronological list" instead ([hour box](#hour-box)); AI 2 has no time axis. The background layer the grid needed was built: [`ui/background`](/framework/ui/background/) (see below).

#### A background layer
> Launch a minion to design a background layer system. So we have a div, probably with a class of background, inset zero.

2026-09-19 · [task](/framework/ai/2026-09-19/background-layer/) · ✅ — shipped as `ui/background` with ten kinds; AI 2 does not use it.

#### A joint timeline
> if you need a yes from me, that should be in the log card that uh, All right, so so imagine we have all these cards on the left, and I have this log in the sidebar on the right. And I'm not sure where to look. […] we might actually want a timeline, a joint timeline. […] the timestamps just broke. The timestamps are on the wrong side of the log items.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — AI 2 merges what you said and what agents did into one newest-first list; the time sits at the right end of each row.

#### A toolbar per column (old v3 board)
> I think we'll want a title bar, a toolbar for maybe both columns, maybe independently for each column, to configure the view.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · — superseded — on 22 Sep you called the toolbars "a lot of UI for something that I'm not actually looking to do"; AI 2 has no chrome on purpose ([decisions](./decisions.md)).

## No jumping, scroll & selection

#### "We do not want jumping"
> On the AI2 page things are jumping around because of live reload. I'm thinking we just disable live reload and go fully into the streaming mode. But as things are streaming, I have three cards up in this grid, and as a new card is added, the whole thing gets pushed down. It's jumpy. We do not want jumping things. We need a left sidebar that previews the things, and then when we click on one it stays selected and then I have a persistent page, so that you can update whatever page I'm talking about. […] Also there's a bunch of links on this page that are blue or purple, the default styling — we have a theme, I don't know why it doesn't work.

2026-09-22 · [task](/framework/ai/2026-09-22/ai2-master-detail/) · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — three mechanisms keep things still (readme "Nothing jumps"); links are theme grey now, not blue (measured `rgb(63,63,63)`).

#### Never jump; new cards must not move what I'm reading
> The cards on AI2 now expand when I click them […] once I click a card, expanding in place is still jumpy — I want to click a card and dig into it: preview rail plus detail page. […] the detail page opens in its own column, navigation persists. The layout should never jump — write that into your layout laws. New cards at the top of the list must not move what I'm reading.

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — cards no longer expand in place; a new card waits behind a "N new cards ↑" pill while you are scrolled or pointing (`page.js:206`).

#### Columns that jump lose your place
> If there's going to be two or more columns in these large layouts, how do they work? […] with our column based pages, they jump around. The widths of them jump around. […] If the navigation reflows and jumps a hundred or 300 pixels down the page, you don't even know that's the same thing.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — the rail's width only changes when you drag it; opening a card never resizes it.

#### Don't rescroll; a "new item" button; space bar
> We don't want to rescroll. If the user has scrolled down in the list and has one currently selected, we don't want to jank their UI around. However, when a new item comes in, we want a little button that pops up that notifies them and says new item, or something. And maybe spacebar. […] when you hit spacebar, boom, it scrolls you to the top of the list, selects the new item […]

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ◐ — the pill is there and never moves your rows; there is no space-bar shortcut.

<a id="live-deselect"></a>
#### Live is deselection, not a mode
> I think the idea with this live button is that it's more like, it's almost like selection and deselection. So in the timeline panel, like the left rail of the timeline view, we can get new updates kind of in real time. And that's what I want.

> […] we definitely don't want our dashboard switching automatically. it's almost like the live mode is deselecting … it's almost like going back to the AI V3 dashboard or just framework slash AI if we make it the default — it's just the default view without anything selected […]

2026-09-21 · [task](/framework/ai/2026-09-21/live-select/) · ✅ — `/framework/ai2/` with nothing selected is exactly that view; the list fills in real time and nothing switches on its own.

#### Stay selected; the url changes
> Now, if we have a specific page selected … that item should stay selected. We don't want our view to be jumping around as new things come in … if I've selected one of the items and I'm viewing the details for it, the URL should change and I should be kind of locked into that one at least temporarily.

2026-09-21 · [task](/framework/ai/2026-09-21/live-select/) · ✅ — the selection is the url (`/framework/ai2/<id>/`); Back, reload and a pasted link all work.

#### Back to top; new things selected when at the top
> […] what goes in there is a sticky button that says like back to top or something […] And then when we're at the top, then new things that appear just should automatically get selected.

2026-09-21 · [task](/framework/ai/2026-09-21/live-select/) · ◐ — the pill takes you back to the top; nothing is ever auto-selected (your later "don't switch automatically" won that).

#### A live toggle that selects new items (old v3 board)
> it didn't select itself when it came in. I'm not sure how hard it would be to do that, but I think that's what we want. Or at least maybe I think we want a live toggle button towards the top.

> I did want some way to have a live view - there's a live toggle button, it should have a primary background when on and a disabled look when off. […] it should disable itself when you scroll down and click on something, because live mode might hijack your scroll.

2026-09-17 · 2026-09-19 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · [task](/framework/ai/2026-09-19/mastermind-sonnet-run/) · — superseded — by "live is deselection" (21 Sep); AI 2 has no live button.

#### The sticky hour box (old v3 board)
<a id="hour-box"></a>
> I just saw in this 11 a.m. card, this is a little confusing … it's a white card that says 11 a.m. […] that box is sticky. I don't like it. It looks kind of broken.

> the problem here with the V3 dashboard is that there's this it says two PM and it says now two twenty-two PM. it's a white box that says V3 axis sticky, floating on top of the whole column […]

2026-09-21 · 2026-09-19 · [task](/framework/ai/2026-09-21/live-select/) · [task](/framework/ai/2026-09-19/mastermind-sonnet-run/) · ✅ — removed from v3 on 21 Sep; AI 2 never had one.

#### Important things get pushed down
> On this timeline view, what is likely to happen with any of these streams is that potentially important things get pushed down.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ◐ — the [overview](/framework/ai2/overview/)'s "Needs you" column holds flagged items apart; the rail itself is still pure newest-first.

#### Old cards resurface when referenced
> we definitely want these AI dashboard cards to be able to resurface as they're being referenced. So as the time scrolls by, old cards, if I'm referencing them, can be raised up. They could also be nested so that you could reference a preview of it in the card itself, in the card's content.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ◐ — talking INTO a card raises it (`inbox.js:351`); mentioning it elsewhere does not, and no card embeds another's preview.

## Padding & spacing

#### Cards need real padding, from the system, not custom
> By the way, the cards don't have the proper padding, this is crazy, there's no top padding on these cards. […] The padding system should be ultra simple, one class. Frankly we could have a class called card and we just add default padding to cards […]

> why do the ai cards use custom padding? i thought we're trying to build a minimal design system. if we need a new tool in the toolbox, we can potentially create one.

> By the way, these cards need more padding. / The AI dashboard now, I don't know if we're using the right padding. If that's our padding, it needs to be bigger because these things are big. […]

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ◐ — every AI 2 row and page is padded, but by hand in `ai2.css` (`.ai2-row` 0.55em 0.7em, `ai2.css:300`), not by one shared card word.

#### "This v3-tile should just be a card"
> So this v3-tile should just be a card. […] The card class now exists in framework.css. The card should have that radius token built into it. We shouldn't need a new v3-tile.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ◐ — AI 2 rows are `.ai2-row`, not the framework's `.card`; the same pattern as v3-tile, just renamed.

#### Write CSS only when needed
> We shouldn't be writing CSS unless we really need to.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ◐ — `ai2.css` is 1,155 lines; much of it is comments on traps, but the rows, spacing and colours are all its own.

#### Dev bar cards: too little padding, text pushed right
> However, the padding in these cards, these time cards in the dev bar, they don't have enough padding. […] That's like three pixels of padding.

> So the time in the dev bar layout, the cards, the time is pushing all the text over to the right. […] They should be more left aligned.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — carried in AI 2's rows: padded, text flush left, the time at the right end.

#### The AI page lost its padding
> So we seem to have broken all the layouts on the framework AI page. There's no padding on the page and most of the cards have no padding either. They should just have a class of pad and or be a card class that has padding built into it.

2026-09-19 · 2026-09-20 · [task](/framework/ai/2026-09-19/mastermind-sonnet-run/) · [task](/framework/ai/2026-09-20/ai-padding/) · ✅ — on AI 2 the rail, rows and card page all have padding (measured 16px on the card page).

#### The detail page: spacing, sub-card padding, blue titles
> the layout is broken, I don't know why it's so hard to get proper layouts - just add the default padding and default gap and everything should work. Zero padding on some of these cards. On the detail page the layouts are broken, not enough vertical spacing, no padding on the sub cards, and the titles are blue like they're links, they should be black or the primary color.

2026-09-19 · [task](/framework/ai/2026-09-19/mastermind-sonnet-run/) · ✅ — the card page and its sub-card rows are padded; titles and links are ink, not blue.

<a id="padding-law"></a>
#### Text never touches an edge — a law
> the UX thing needs sub pages, not one page with tabs; […] framework/styles: the text butts against the sidebar with zero padding — make it a law of the whole system, never zero padding with text.

> Text never touches an edge, anywhere, at any width: find the rule that breaks it, fix it once, and make it a check. The owner: 'I just clicked on framework/styles and the text is butting up against the sidebar with zero pixels of padding. This is like make this a fucking law of the whole system. You never have zero padding with text.'

2026-09-22 · [task](/framework/ai/2026-09-22/padding-law/) · [task](/framework/ai/2026-09-22/mastermind-servex/) · ◐ — the law and its check landed sitewide, but on AI 2 today the rail's `notes` word runs into the card pane and the overview's first column sits under the sidebar.

#### Why is layout so hard? (padding, then double padding)
> we need to do a strong analysis of our page layouts and why it's so hard to get the right look on each page. Like, getting things butting up against the sidebar with no padding, or we add padding and then double padding […]

> […] The top bar on this page needs to move up a bit. I clicked grid and the page went blank; the word sorted is still against the left sidebar. Seems I have to say things twice.

2026-09-22 · [task](/framework/ai/2026-09-22/layout-analysis/) · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — the analysis landed: a page's inset is padding now, not empty grid columns. The v3 grid and top bar it named are gone in AI 2.

#### v3 tabs without padding; "sorted" against the rail (old v3 board)
> the AI framework slash AI page should default to V3. […] The now tab doesn't have any padding. The grid tab doesn't have any padding. The cards are butting up against the sidebar with zero spacing on two of those.

> I don't like the grid, it's just this huge thing, maybe hide it for now. Also on the grid, 'sorted by importance' is nudged against the left side with zero padding — the law of padding. Move the text off the rail. […]

2026-09-21 · 2026-09-22 · [task](/framework/ai/2026-09-21/ai-front/) · [task](/framework/ai/2026-09-22/mastermind-servex/) · — superseded — AI 2 has no now/grid tabs.

## The rail & its rows

<a id="rail-head"></a>
#### A rail like the main one; minimal, no dead space
> AI2 cards become read when I click them — no, I need them all unread again. […] AI2 needs a left sidebar rail like the main one. The compose area is massive (277px+), way too much padding; one compact line with the mic at the end of the text area; the dashboard must be minimal, no dead space.

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ (24 Sep) — the rail exists, the typed box is one line, and the words under it wrap as whole words onto a tidy second line inside the rail at any width ([task](/framework/ai/2026-09-24/ai2-dashboard/)).

#### Declutter: dead space, clutter, a hovering scrollbar, card grounds
> this ai dashboard has way too much bullshit. 1) there's like... 200px of dead space at the top. 2) Todays' board? Everything? Process? Start here? V3? 103 left? days, now, grid, timeline, prompts, gallery, dashboard, LIVE, everyone, card width — then under that, minion-alpha-writer - minion - idle […] then the rail has a bunch of padding on the top, and the rail's scrollbar is literally hovering. scrollbars should be at the edge of a clear border. […] the ui cards don't have bgs. they should have lightened (but not white) bg, and the selected card should turn white.

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — AI 2 dropped all of that chrome; the rows scroll with the scrollbar on the rail's own edge; rows sit on a light grey ground and the selected one turns white (`ai2.css:313`). (The head overflow above is the one leftover.)

#### Newest on top, like an inbox; big previews
> We want a list of the cards in time order on the left. Most recent on top, I think. […] As sort of like an inbox, the newest things are on top. And then the first one, the most recent, should be selected by default. […] So the preview cards can actually be large, and let's go equal size, two equal columns […]

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — newest first, and nothing reorders under you. "First one selected by default" and "large, equal previews" were replaced later (nothing selected; compact one-line rows).

#### The icon on the heading's line
> one thing that we can fix is we can put the icon on the same line as the heading for each card. In fact, in the details page, that's how it lines up, but in the rail the icon is on its own line and wastes a bunch of space.

2026-09-21 · [task](/framework/ai/2026-09-21/live-select/) · ✅ — dot, icon, title and time share one line (`card.js:29`).

#### One-liners, not truncated detail
> it seems like we're truncating some of the text from the detail page on the rail. And I'm thinking maybe we just want like one-liners. […] I want the timeline to be something that looks familiar and I can look over all the items and kind of understand what they're doing. And so we need to group them properly.

2026-09-21 · [task](/framework/ai/2026-09-21/live-select/) · ◐ — each row is a title plus one line of the card's current state; there is no grouping.

#### Compact the list; two card sizes
> I do kind of want to compact this list view so that we need two different sized cards. Like we need big items with icons, and then like maybe smaller items. The cards are really big, so I have to scroll a lot to kind of read them […]

> the hour box goes and everything sits in one chronological list; two card sizes with the icon beside the heading and one-liners instead of truncated detail text; Live becomes selection and deselection rather than a mode.

2026-09-21 · [task](/framework/ai/2026-09-21/live-select/) · ◐ — rows are compact (76px) and one chronological list, but there is one size only — see [sizes](#sizes).

#### Keep the zero-gap sidebar and its scrollbar
> I've been transcribing to the AI2 page and it's making cards — way closer to what I've been looking for. […] I like the zero-gap sidebar and the scrollbar. I need a way to approve certain things.

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — kept. (The approve part is under [Inbox](#approve).)

#### Cards of random widths
> We have cards of random widths.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — every row is the rail's width.

## Cards: look, size, icons, names

<a id="sizes"></a>
#### Big cards for the big ideas; sizes by importance
> I want to see big cards that represent the big ideas that I've been talking about, kind of organized. And so if I've been talking about a specific thing a bunch, it should be bigger at the top, those are primary things. And so, I mean, the site crashed. So I want a card with a crash icon that says site crash. Timestamped, and then I click on it, and then I can look at more detail about it.

> […] Prioritize: small, medium, large cards; topics I keep referring to become a big thing that stays on screen.

2026-09-17 · 2026-09-22 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✗ — every row is the same height by design ("the rows must not change height", readme). The crash card part is ✅: health-watch posts cards with a bug icon and a time.

<a id="names-icons"></a>
#### Big, familiar icons; every card named well
> […] they need big icons. Well, an info icon doesn't need to be big. But if there's an icon that actually makes sense, like the padding audit has a ruler icon. Good. It should be way bigger. The card should bring a familiarity about it.

> […] I need it digestible: each card named really well with an icon, a small preview of the current state; the orange dot seems redundant unless it's a status indicator […]

2026-09-17 · 2026-09-22 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✗ — icons are 20px, and five of the first twelve rows today are titled "New card" or "You said…". The one-line current state is ✅.

<a id="dark-card"></a>
#### A dark card for a mastermind or minion session
> Let's try a dark themed card for a minion or a mastermind session — big tasks, a worktree spawned — help me see what's going on.

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✗ — no dark card; `ai2.css` has no dark style.

#### Colour-code the cards
> Let's try and color code our dashboard cards.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ◐ — only four states are tinted: flagged, archived, note and the Live card.

#### Selected card: no black border; lighter when selected
> Okay, so the selected cards get an orange border, and also I think the background is doing funky stuff. […] for some reason when I was just selecting a card it wasn't really clear.

> The black border that we have now, no bueno, do not like that at all. What I'm thinking is the cards should be less white and then they lighten when you select it.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — no borders between states; the selected row turns white with an orange left edge on the grey rail.

#### A transcription card that becomes a summary
> it should start as a transcription card, and then it morphs into a summary card.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — a spoken card opens showing "just now, in your words", then the assistant's reading replaces it on top (`card.js:81`).

#### Answers on screen, big, instantly
> I want to be able to see quickly, when I ask a question for something, I should see the answer on my screen in one of these visual cards instantly. And it should probably be big because that's what I'm currently asking about.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ◐ — a question becomes a card in about two seconds and the assistant's reply lands in it, but the card is ordinary size.

#### Cards that can become anything; a card explaining storage; iceberg answers
> This system will need to evolve; maybe different types of cards with controls in different places; each card could become a complete workspace, its own application. Make a card for me that explains how cards are stored […] Allude to the limitations. Another goal: I ask questions and see the answers on screen in the iceberg way.

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ◐ — the storage note card exists ("Note: how a card is stored, and what it cannot do"); card types and iceberg-style answers do not.

## A card's page, sub-cards & storage

<a id="sub-cards-anywhere"></a>
#### Add sub-cards anywhere; convert a card's type
> what we absolutely need: the ability to add sub cards, anywhere on the card.  to convert any card into any other content type (Question, Request, ask a sub question, etc)

2026-09-24 · [handoff](/framework/ai/handoff2-owner-words.md) · ✗ — sub-cards only appear from lines in the card's own log (`inbox.js` `sub_rows`); there is no way to add one or change a card's type.

#### Items groupable and nestable; talk into the one you selected
> the items in the inbox need an author so I know who it's coming from, whether it's something I said. I don't see your note in that list. They need to be groupable or nestable so any card can receive — I click into one and the dictation goes to that card rather than creating new inbox items. Different sections within a card, like an outline of tasks, and I click through a specific one.

> […] The mic should mostly be open and contextual — whatever I have selected gets the words — but through a router like the fast assistant with judgment, since I might forget what I selected. Mentions of pages, tasks, extensions should become links.

2026-09-22 · [task](/framework/ai/2026-09-22/ai2-master-detail/) · [task](/framework/ai/2026-09-22/mastermind-servex/) · ◐ — every row names its author and your words go into the open card, sent as the default the assistant may re-route (`compose.js:58`); a card lists its sections as sub-cards. Grouping cards together is not built, and only some page mentions become links.

#### Each card a real directory / not one JSON line
> Be careful how we store this: each card as a line in board.jsonl is tricky to archive. Each item should have a slug that could become a directory if you want an arbitrary page for it — not a million directories — lean into the page system […]

> Data structures should be simple and clear and adapt to our paging and data-loading system […] UI cards should have persistence — a button or a field saves to that page's page.json or similar. […]

> Our cards still just single line entries in the board.jsonl / if we want any ai dashboard card to be able to have any number of child cards, with their own child cards, we probably want to use directories over files, for each card.  however, for simple cards, that might not be necessary.

2026-09-22 · 2026-09-24 · [task](/framework/ai/2026-09-22/mastermind-servex/) · [handoff](/framework/ai/handoff2-owner-words.md) · ◐ — each card has its own log (`cards/<slug>`), but a card is still one line on the board; card folders are being built now by the card-folders task.

#### Click through to what was decided (iceberg)
> I want to be able to see an item for AI log revamp, for example, and then I can click through that and kind of see what was discussed, what decisions were weighed and made. And so a lot of that decision-making process, I don't want to see it right away. […] Iceberg UX (simple -> complex).

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ◐ — a row opens a page, and its sub-cards open a level deeper; decisions are not drawn out as their own layer.

#### The "talk to this card" footer; two scrollbars
> The card detail page has a footer "talk to this card" — way taller than it needs to be, grey background that abruptly stops with a border on top; it should be flush or bordered properly. We have two scrollbars (the framework page forces overflow-y scroll) — not urgent.

2026-09-22 · [task](/framework/ai/2026-09-22/ai2-nested/) · ◐ — the footer is 78px now and there is one scrollbar; but at 1920 the card page is 640px wide, so the grey footer still stops short, with ~670px of empty white to its right.

## Compose, mic & dictation

#### Top priority: I talk, I see it, it becomes a card and a task
> Top priority for this whole system: the transcription UI / dashboard working with a fast assistant — as I transcribe I see it on my screen AND it gets turned into a card, a task, and maybe a mastermind takes it and runs with it and lets me know visually that you're working on it. We don't have that yet.

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ◐ — words appear live and become cards; a task line can start a mastermind and the card shows it running, but only while dispatch is not paused.

#### A card I talk to, updating live, nothing jumping
> please get me a transcription flow working. […] I push the microphone button and I talk and I see my words on the screen. Right now. A new card on my AI dashboard where I can talk to it and see that card updating in real time, without shit jumping around.

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — `+ New card` opens a card that starts listening; the words stream into its fixed footer.

#### A new card is a blank workspace; my words never disappear
> The live transcription UI has a text area, buttons, checkboxes, a send button — clean that up. A new card should be a blank workspace that by default starts recording my voice; the words go on screen and get refined into concrete ideas. My words must not disappear. Each card could have the transcription in a footer — the last paragraph always on screen […]

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — one-line box, a mic inside it, Send; the rest folded behind `⋯`; the transcript footer keeps the newest words in view.

#### Control over cards; don't chunk every sentence
> […] But it chunks every sentence into its own card and summarizes them, not quite right. I want control over the cards: create a new card and talk to that card, the transcription baked into it, everything created goes into that card unless promoted to the main list. […]

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ◐ — inside a card everything stays in that card; from the rail's box each sentence still starts a card, and there is no "promote to the main list".

#### Remove the rail mic; auto-transcribe option; mic colour
> The rail mic on AI 2 made a new card per sentence and then seemed to stop recording; the UI flickers as it hears something — the microphone icon should turn the primary colour when on, for every mic. Don't split a paragraph or a sentence. Lean into per-card transcribe: remove the rail's transcribe-everything mic, keep New card with an auto-transcribe checkbox […]

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — the rail box is typed-only (`page.js:121`); the checkbox is there (`page.js:138`); a live mic wears a solid orange ring.

<a id="mic-source"></a>
#### A meter that shows a dead mic, and a source menu
> On AI2, when I click the mic there should be a little meter that looks empty if the microphone isn't working, and a menu to switch the source. […]

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ◐ — a level bar moves with your voice (from `ux/Dictate`); AI 2 has no menu to switch the microphone.

#### Open mic, continuously, with a fast and a master assistant
> What needs to happen: I turn on the mic and leave it on indefinitely — live open mic, continuously transcribed — and a fast assistant listens and decides how to route those messages; a slower master assistant also gets the full transcription for a second opinion; the fast assistant renders summaries on the page. […] Each card should have a microphone button.

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ◐ — each card has its own mic, in open mode (`compose.js:244`), and the fast assistant routes; the master assistant's second pass does not show on the page.

#### Double recordings on a nested card
> figure out why the framework/ai2/ new card -> dictation, which works, but the fast assistant isn't able to respond?  my statements properly appear […] however switching to the sub-item's card caused double recordings that both went to the parent card.

> this was because clicking the mic on the nested card didn't stop the mic on the first card.  and, the destination for the dictation failed for the nested card, because they both appeared on the first card.

2026-09-23 · [task](/framework/ai/2026-09-23/ai2-live-card/) · ✅ — only one mic can be on (`compose.js:213`); a sub-card's words carry its own address; the assistant's replies now reach the card.

#### The "New card" button doesn't work
> the new card button doesn't work.

2026-09-23 · [task](/framework/ai/2026-09-23/ai2-routes/) · ✅ — fixed that day (`page.js:129`). Not pressed in this check, because pressing it writes a real card.

#### Where to talk: not at the bottom of a long scroll
> Improve on "Where to talk to the assistant" (prompts): the mic input ui is at the bottom of a 12 page scroll area?  no bueno

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — the box is pinned to the bottom of the card's column, always on screen.

#### Dictate as an extension; an assistant tab with a mic
> Dictate should probably be an extension […] better documented, actually working, with levels; the destination should be programmatic and contextual — no destination button by the mic; on the AI page an assistant tab where I click the mic, talk, and see the feedback I need. […]

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — levels show, the destination is the open card (no button), and the [Live card](/framework/ai2/live/)'s box talks to the assistant.

#### Dictation doesn't work
> Also the dictation doesn't seem to work. I'm not sure what's going on there.

2026-09-19 · [task](/framework/ai/2026-09-19/mastermind-sonnet-run/) · ✅ — works on AI 2 (you confirmed it on 23 Sep).

#### See what I say on screen, batched
> I think I want to approve, have an approval process for this AI dashboard. Whenever I say something, I want to see it on screen […] Once the transcription happens in real time as I see it, I think we will have batching. We'll probably want configuration for how long to wait before we submit it. […]

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ◐ — your words show as you speak; the only wait setting is Dictate's "stop after a pause", behind `⋯`.

## The Live card, usage & talking to agents

#### The Live card
> here's what i want on the framework/ai2/ page.  i want to be able to create cards, that don't originate from the ai/board.jsonl.  so, we want framework/ai2/live/ […] that card should, in the preview, show the usage progress bars […] and any currently running agents and major tasks.  this preview card should get bumped to the top of the list, whenever there's an update to any of it's children.  ai or me should be able to clear items from the "live" card. […] at the bottom, see a log of recent updates.  that log is where dictations should go.  it's like, each page is a chat room, with a log, by default.

2026-09-23 · [task](/framework/ai/2026-09-23/ai2-live-card/) · ✅ — [`/framework/ai2/live/`](/framework/ai2/live/): bars in its preview, running agents and tasks, ✕ to clear, rises to the top on change, a chat log at the bottom; every card is a chat.

#### One column, no little scroll boxes
> […] I don't like these independently scrollable areas. Maybe if this area was bigger, but it's a pretty narrow column. The running-now list and the tasks list fit well in one column. The usage above also fits well in one column.

2026-09-24 · [task](/framework/ai/2026-09-24/live-card/) · ✅ — measured: no inner scroll box on the Live card; the page scrolls as one.

#### Three usage bars with on-pace markers
> But the usage should show all three, labeled 5-hour, weekly Fable and weekly all. And, as we had before, we need those on-pace indicators that sit above each bar and show where we are. […]

> Also we need to get the usage progress bars from the old default timeline. We need to get those on this page too. […]

2026-09-24 · 2026-09-17 · [task](/framework/ai/2026-09-24/live-card/) · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — all three, labelled, each with its ▼ (`live.js:202`).

#### A card that persists: "current"
> I want to see in the AI dashboard a card that persists. It's like the current thing. So create maybe a tab at the top that says current.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — the Live card is that card, with its own address.

#### Talk to an agent from the browser
> It would be cool if I could click into [an agent] and then send it messages just from my browser, on the live tab or the live sub page.

2026-09-24 · [task](/framework/ai/2026-09-24/agent-chat/) · ◐ — built and merged today; its landing says the message route waits on a Servex restart.

<a id="agent-expand"></a>
#### Clicking a minion expands in the middle and pushes everything down
> what is this crap when you click on minion alpha writer I get a hardly visible area of text that's just like not clear at all what it's doing. Also, when you click on those, it expands this area right in the middle of the page and pushes everything else down. This is not the proper user experience. Maybe use the main area or switch to a different tab entirely. […]

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✗ — the Live card repeats it: clicking a running agent opens its chat right under the row and pushes the rest down (readme, "Click a running agent"). The Live card belongs to the live-card task.

#### Put a card on screen that answers me
> I need you to put a UI card on the screen that responds directly to what I'm about to tell you.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — what you say becomes a card, and replies land in its chat.

#### Dev bar chat: full messages, same gap
> I don't want the chat messages truncated. I want full messages. Also, the messages from me, the one that says you, for whatever reason it has a different layout. […]

> the chat log has like a max height or somehow truncating the amount of text.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — carried in AI 2's card chat: full messages, one layout for everyone (`chat.js`).

#### Dev bar: the route section, two chat tabs (dev bar)
> didn't I ask for something about redoing the route section of the dev bar?

> why do we have this chat tab and which one is default? […] Why do we have two of these? And the drop down, I'm not sure what the drop down is for. […]

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · — superseded — dev bar questions; AI 2 is where the dashboard went, and it has one chat per card.

## Inbox: read, flags, notes, archive

<a id="unread-wall"></a>
#### A read/unread inbox, not a wall
> I think the workflow I'm feeling is that we kind of want like a read or unread inbox type thing. And then putting in an approve button on everything seems just a little bit — I'm not going to actually click through approve on everything. I kind of want a way to red flag certain parts […] Can you make me little notes in this log here where you just explain things? […]

> […] Right now I see 331 unread, a wall; I need it digestible […]

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ◐ — no approve, one flag, and Note cards (with a `notes` filter) are ✅; read/unread is ✗: nothing marks a card read, so all 354 are unread and every row wears the dot.

#### Don't mark read on click; buttons on cards must work
> AI2 cards become read when I click them — no, I need them all unread again. […]

> Literally all the buttons on the AI2 cards don't work: I can't click links or expandables, the second I click a card it is removed from the screen because it's marked read. Very bad UX.

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — opening marks nothing; a card stays put and its links work.

<a id="flag-twice"></a>
#### The red flag needs two clicks for a second message
> improve — Note: how a card is stored, and what it cannot do — i have to click the red flag 2x (after the first message), to send another one. first click turns red flag off, second allows a second message

> improve — Note: how a card is stored, and what it cannot do — does unchecking the redflag remove previous messages?  sending multiple messages is really hard, layout is extremely broken

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✗ — the ⚑ still toggles: on a flagged card the first press withdraws the flag (`card.js:59`).

#### Clear or archive, not delete
> At 7:31, 7:32, 7:35, 7:35 there are four new cards labelled from me that I didn't make. We probably want a clear or delete or archive feature — we don't necessarily want to delete things, but a clear button to just clear it out.

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — a `clear` on every card archives it; "archived (15)" at the foot of the rail shows them again.

<a id="approve"></a>
#### A way to approve things; a clear feedback loop
> What I need is to get back to a stable feedback loop where you show me something and I either click yes or no, or approve, or give feedback. I saw one approve button but it wasn't clear what would happen if I clicked it. […]

> I need a way to approve certain things.

2026-09-19 · 2026-09-22 · [task](/framework/ai/2026-09-19/mastermind-sonnet-run/) · [task](/framework/ai/2026-09-22/mastermind-servex/) · ◐ — only "not this" (the flag) exists; no approve, on purpose after your "I'm not going to click approve on everything".

#### A yes from me belongs in a card
> if you need a yes from me, that should be in the log card […]

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ◐ — the overview's "Needs you" column holds what is flagged or blocked; there is no yes button.

#### Everything in the dashboard, not the chat
> I want to see everything in the dashboard. I'm looking at the dashboard, waiting for updates. I'm not really reading this chat here, and that's what I want to get away from, the walls of text

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — agents post cards and Note cards to the board; their replies land in the card's chat.

## Routing & reload

#### Every view is a route; I prefer the inbox
> I prefer the inbox view... we can't just have these buttons that when clicked switch the view manually and don't do the routing.

2026-09-23 · [task](/framework/ai/2026-09-23/ai2-routes/) · ✅ — the inbox is the default (`page.js:45`); the overview is `overview/` and the Live card `live/`, both real urls (`page.js:62`).

#### Tabs should be routes, not localStorage
> the "days", "now", "timeline" tabs seem to use some sort of localstorage or something to persist the current tab... but that's literally what routes are for...

> the timeline, prompts, grid, now, and days, don't even have a route... a live reload would navigate me away from this page...

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ◐ — every view is a url, but the `notes` filter is not (`page.js:212`), so a reload drops it.

#### Live reload clobbers my scroll; go streaming
> btw, I don't really like live reload, as it is... it's always reloading the page (while minions are off working), which clobbers my scroll position, for example. what's the state of the streaming log system? shouldn't most page updates be able to happen in more of a HMR way? do we even need live reload? […] with the worktree system, most work should be done on alternate branches/worktrees/servers, which shouldn't trigger live reload...

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ◐ — all content streams with no reload; an edit to AI 2's own `.js` files still reloads it, which is why AI 2 work goes in a worktree.

#### Reload held for minutes; AI ↔ AI 2 won't re-render
> the block reload thing, I don't know why all these minions are blocking reload so much. They should number one be working on a worktree. […] Also, my navigation sometimes breaks when I'm clicking between AI and AI2 and back to AI. It just doesn't re-render the page.

> […] I just clicked on the AI link in the framework sidebar and I get a blank page. framework/ai says AI, the title seemed to have changed, but there's nothing there. It's a blank page.

2026-09-22 · [task](/framework/ai/2026-09-22/reload-rethink/) · [task](/framework/ai/2026-09-22/nav-rerender/) · ✅ — a hold is fenced to its own files now; the blank-page race is fixed.

#### The column grip drags backwards and sits off the line
> the resize handle between the columns on the AI dashboard page is broken. It works inversely to what it should. You drag right and it resizes to the left. Also, the hover grip thingy follows the mouse, but it's not on top - about 200 pixels below the mouse. Also, it's offset to the right about 4-5 pixels instead of on the line. […] What we need is the dev bar to have the resize handle actually follow the mouse, right on the border where we're dragging, and then just move the dev bar off screen by more than like 10 pixels.

2026-09-22 · [task](/framework/ai/2026-09-22/grip-fix/) · [task](/framework/ai/2026-09-22/mastermind-servex/) · ✅ — fixed in `ext/grip`, which AI 2's rail uses.

#### A blank AI 2 page, in the nav under AI
> make me a framework/ai2 page, blank page, full screen, in the framework nav under AI — Start here, then AI, then AI 2. We're going to rebuild this thing; the one we have is way too cluttered and not doing what we need. […]

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · [task](/framework/ai/2026-09-22/inbox-model/) · ✅ — AI 2 sits in the nav right under AI.

#### One data store, not v3's own
> look at the ai/v/3/ system. make sure ai/v/3/ is reading from the same data structures as the other. the data should not be saved in the ai/v/3/ dir […] however, the actual ai tasks and whatnot, is template (v3) agnostic, and should be stored like the rest.

2026-09-19 · [task](/framework/ai/2026-09-19/mastermind-sonnet-run/) · ✅ — AI 2 keeps no data of its own; it reads the shared board, verdicts, day log and Servex logs ([logs](./logs.md)).

#### A pure streaming log that can change existing UI
> So that system should just be a pure streaming log. Nothing breaks. It's append only. […] And the log data can transform existing UI as well as create new UI. So it's not just append only.

2026-09-17 · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) · ✅ — every log streams in; a later line with the same card id updates that card in place.

#### New versions, and deleting v4 (old boards)
> When I just clicked on the AI page to create a new version, uh, it seems to have just duplicated V3?

> I'll delete v4 there's no reason to have this confusion of multiple things […]

2026-09-19 · [task](/framework/ai/2026-09-19/mastermind-sonnet-run/) · — superseded — AI 2 is the one new version.

## Reports, overview & priority

#### An overview by importance
> […] Dashboards: it must be real time, but with scales of importance so important things stand out. Where would you put a report? Everything gets buried as new items push old ones down. Default view = an overview: column 1 extremely important / outstanding (clear, the column disappears when empty); column 2 mildly important, e.g. last night's report; column 3 a more verbose log of important things done recently; then a real-time streaming log: what's running, in limbo, the usage windows. […]

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · ◐ — [`overview/`](/framework/ai2/overview/) has these four columns (Needs you, Reports, Landed, Live). It is no longer the default (you preferred the inbox on 23 Sep), and since 24 Sep it fits the screen — see [above](#overview-fit).

<a id="day-report"></a>
#### An end-of-day summary, and where the tokens went
> […] Document the things I said multiple times: layout never jumps, stay focused once I click, live reload state. Reporting: an end-of-day overview, summarized. Token usage: the main spenders, the timeline, what took longest. […]

> our new ai dashboard system still sucks... i never have a nice clean report of what happened. Build a fourth 'days' view on /framework/ai/v/3/ that reads only each task's landing line, newest day first […]

2026-09-22 · [task](/framework/ai/2026-09-22/mastermind-servex/) · [task](/framework/ai/2026-09-22/days-view/) · ◐ — the "never jumps" rules are written down ([decisions](./decisions.md)), and the days view landed on the old board; AI 2 has only today's landings, with no daily summary and no token breakdown (✗ for that part).

#### A prioritised list: do this first
> There's been a lot of stuff done in the past day, I'm not sure where everything is, not clear what I should look at or where to start. So prioritize the list - number one, do this first.

2026-09-19 · [task](/framework/ai/2026-09-19/mastermind-sonnet-run/) · ◐ — "Needs you" on the overview is the closest thing; nothing is numbered or ranked.

---

Left out on purpose: two questions that asked nothing of the page ("can you see this 1:15pm card…", "what do you mean by task sessions?", both in [handoff](/framework/ai/handoff2-owner-words.md)), and one sentence about a slow link request that was about the minions, not the dashboard. Screenshots from this check are in the task's scratchpad, not the repo.
