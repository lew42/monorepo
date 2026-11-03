# card.js — notes and design decisions

## Tabs and routing

Tasks routes even while its tab is hidden: a group card knows it has tasks only once its groups load.

In the workspace view the Floating nav IS the tab strip.

A card's own tabs are routed too (Tasks and Activity are child pages), so a url alone lands on a tab.

## Data model

Line 1 of page.jsonl names Card as the class. A card is a folder.

Line 1's assign() would REPLACE type()/tags() with data, so assign() calls these methods instead.

The latest-wins labels kept apart because `type`, `tags` and `status` are methods.

The owner's own words: a later line with the SAME id is the cleaned reading, merged in.

## Content and summary

One card summary (`GET /cards`) as a row: icon, title, and what it is.

Old box or new: a subclass flips `Card.V1`, or the url says `?chat=v1`.

Where the log lives — this page's own url is AI 2's, not the folder's.

Where this card's .md files really are: its folder, not AI 2's address.

A doc opens inside the card with a Back button; it lives in this.view, outside $box.

Cost always shows here: state_span() only speaks while something is running.

## Layout and display

Two fixed regions: the card and a properties sidebar (40em and wider).

Every depth joins the same flat row.

A fresh card starts listening into the global drawer agent.

A sub-card is its own column; its seam holds the chat width while you drag.

Column seams: one ext/grip per token on the AI 2 shell, shared by every card; double-click resets.

## Overview and outline

The outline; everything else is one fold down.

A card nothing was asked in yet (a topic stub, a new sub-card) says so, instead of a blank page.

A `place` line is drawn where it is placed, by the page's own log_draw().

A card with requests is summed up by them (old cards have no item lines).

Topics: listed where nothing else lists them.

The fold names what is in it, so it never promises something absent.

## Navigation

Core's route(): tried only for a name no one declared, so it never shadows a request.

The classes a tab page wears. Padding is never a default: a card asks with `{"tab_classes": "pad"}`.

One tab's content, from the list as it is now (a live line may have renamed it).

The panel the tab pages mount in, and the outline as its default. Called once, from `content()`.

A top-level card, with `?view=workspace` on. A request (a sub-card) keeps its own look.

A live line changed the card: every tab page drawn so far redraws its body.

Where those tab pages mount: a hidden box, so a tab url never moves anything on screen.

## Activity and marks

Marks use the seen time from BEFORE this visit (seen_from), so they stay while you read.

A group's member tasks and cards as events — what its rail row's bar reads from.

A topic unread since it changed gets one word, "new" (Rules.is_read); activated() clears it.

## Cost calculation

What this card cost, one row per member task and the group's sum.

## Table of contents

The table of contents: this card's requests, grouped by their {"group"} lines.

Drawn once every request's group is known, so rows never reshuffle.

Each request's group, delivered state and title are read from its own log, latest wins.

## Folder indexing

A day's cards are keyed rows (only changed ones are replaced); month and year are count rows.

## State management

AI 2 hands every open card its list row on each repaint; only a flag change redraws.

The rail's own time for this card: while you are ON Activity, a newer one is seen too.

An owner note is read for good (a shared `reviewed` line) the moment you open it, so it leaves the top of the Inbox.

top/ws only for a top-level card; a sub-card must not touch the word for the card open beside it.

The sub-cards' titles come off AI 2's card list, which refreshes on its own clock.

Same shared scan as the Needs tab, so the Reviewed button follows it.

A member landing, or a task's `now` moving, reorders a group's sections.
