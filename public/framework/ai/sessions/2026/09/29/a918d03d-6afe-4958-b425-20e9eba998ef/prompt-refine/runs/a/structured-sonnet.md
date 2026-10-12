# Outline of the owner's ideas

## Background: why this task exists
- There have been several audits lately, including one that reviewed everything asked over the last few days and summarized what was done and whether it's complete or incomplete; all those tasks could eat a lot of tokens, and that audit burned through a lot of tokens, so it had to be put on hold. [S1, S2, S3, S4, S5]
- Now the plan is to approach those things slowly and carefully, making a strong effort to summarize and organize it onto the dashboard in a digestible way. [S6]

## A new "organization mastermind" (maybe "page mastermind") card
- Create a new task, maybe called "organization mastermind" (or maybe "page mastermind" instead), as a card on the dashboard. [S7, S65]
- Put most of the important things on this card in a prioritized way: biggest/most important at top, secondary things underneath, and one-off tasks that don't organize well elsewhere toward the bottom — a structured content view with navigation. [S8, S9]
- Things on that card/page might navigate away from the inbox page for more space on sub pages, and should link to pages, referencing this organization mastermind and all the related tasks. [S10, S11]
- Make sure this new mastermind task references the older tasks/audits — any audit found should get a link on this new organization mastermind page. [S47]

## Process: prioritize token spend
- Need to prioritize token spend, starting with the most important things, generally looking for low hanging fruit — quick, easy fixes or simple things that carry a lot of weight. [S12, S13, S14, S15]
- Getting the organization, priorities, weights, sizing, scale, and grouping right gives a quick tangible reference point for where this is going. [S16]
- Overall: organize, prioritize, go one step at a time, and don't burn too many tokens. [S41, S42]
- Definitely start with paging — probably organize most of this through the paging system, so just focus on the paging system for now; other topics that don't fit within paging can be set aside for later. [S43, S44, S45, S46]

## Documentation approach: structure over words
- Want to be updating the actual documentation pages (framework page, framework core page, framework core/page page, etc. — the owner hasn't seen the framework page in a while). [S17, S18, S19]
- Instead of creating new content in this reorganization, audit the existing documentation with an extreme focus on not being verbose or wordy, creating highly structured, visual content — real hierarchy (H1/H2/H3) — wording things so it almost becomes navigation. [S20]
- Use small H3s as section headers with navigation icon items; the main page for any module with frequently-referenced topics should have its own navigation and jump points to get to everything, and these should be familiar. [S21, S22, S23]
- Creating little icon items and sorting/reorganizing them is an ongoing process of finding the right names for each section and page and how they navigate. [S24]
- Some kind of switch/navigation is sometimes useful, but until it's clear exactly which items belong, just linking to a new page might be the way to go; if a navigation is already set up, it's fine to leave it in place rather than clobber it. [S25, S26, S27]

## Full site audit, prioritized, starting with paging
- Do a full site audit in turn, prioritized — the paging system and the page skill need to be thoroughly documented on the core page system, including top tabs, inner tabs, and left navigation tabs for structured content. [S28, S29, S30]
- Each content area should have headings with structure, use lists when it makes sense, and cross-reference other things as much as possible to make ideas clearer and more tangible, reinforcing core concepts. [S31, S33]

## Content cards to visualize structure
- Use content cards to show the structure of things like the object-oriented system — instance name, properties, methods — as a little card. [S34]
- Once that's ironed out and looks good, use it wherever there's an instance (a class definition or instance of a class), building different templates per class to visualize things clearly — e.g. showing a page's property/argument flag visually instead of explaining with words. [S35, S36, S37, S38]
- Use these structured UI cards, whether inline or full width; data grids are another thing to work on. [S39, S40]

## Paging system: documenting how pages are made
- The organization mastermind is really a task audit approached in a prioritized way, starting with the paging system — the page class — and documenting all the different ways to create pages in code. [S50, S51, S52, S53]
- There's already some of this in overview areas with nice preview grids of different page types — a lot of it isn't bad, so it shouldn't necessarily be nuked, but should be built on: first audit the documentation and see what state it's in, and whether anything isn't documented properly. [S54, S55, S56, S57, S58]
- Think about a new user trying to use the page system, and about all the different kinds of pages created so far (e.g. columns) — when visiting those pages, is the simplest example shown first, and is it clear how to use it and what it produces? [S59, S60, S61, S62]
- There was an idea about columns and dictating what size column — add that to this. [S63, S64]
- Still haven't followed up on where the page skill system stands. [S66]

## Layout types for pages
- Standard layout: roughly 300–1000px width range, content stretches, generally one column (though it could have a toolbar or multi-column content) — the standard column is just paragraph reading width, responsive down to mobile. [S67]
- Also want a double-width layout, centered alongside single width — this is the "wide" class on the paging system; how a page looks overall (top-down structure, background, padding) matters just as much as column count. [S67]
- Internal structure matters too — full bleed columns; some column paging systems work well without padding on the main page; documenting all these variations is important. [S68, S69]
- The double wide layout could split in any proportion, essentially a two-column layout that by default would stack on mobile — standard layout is layout number one, two-column is layout number two. [S70, S71]
- There's also a "fill" type layout with potentially three or more standard columns — figuring out how multiple columns respond is a trick. [S72]
- Working through the process from one column: if columns are left-aligned, one column alone looks funny on a big wide monitor with nothing next to it; but a single column centered on a big page is also awkward — creating responsive content for these pages is still an open problem. [S73, S74, S75, S76, S77, S78]
- A lot of work has already been done in the public/imagine folder, with many examples of different layouts — in the paging audit, go through what's been created there and figure out how it fits into the paging system. [S79, S80]

## Pages, paths, and dynamic content
- Everything is centered on the idea that the page is the path — the page is the actual directory on the file system — though not every page needs to automatically have a directory. [S81, S82]
- There could be a dynamic content system with pseudo directories that don't exist yet but could, using an index with preliminary data for each path — this connects to board.jsonl / the cards being created for the AI dashboard (not sure if it's still using this index system), with the idea of dynamic pages that don't require creating a new directory and page.json/JS. [S83, S84, S85, S86]
- The loading system was changed so it looks at the directory and loads either the JS or the JSONL file — this needs to be documented thoroughly. [S87, S88]

## Navigation for the core page page
- Rethink the navigation on the core page page — what are the top tabs, and what should they be? [S89, S90, S91]
- Maybe ask a few minions, as part of studying these things, to suggest a new structure for the top tabs, with each top tab having its own inner navigation (left sidebar). [S92]
- Organizing by methods and properties seems reasonable — clicking the methods tab gives a list of methods, each its own page. [S93]
- For overview/concepts, the big concepts of each class should be well-named so that anywhere they're referenced in documentation, clicking gets you familiar with what it means; simple, self-evident concepts don't necessarily need their own page, but class-specific important concepts should get structured, familiar content — organize by priority/how fundamental things are and by the value/impact provided, since documenting something fundamental but confusing wastes space without helping; want to spend space for the most impact and benefit. [S94]
