# Cards and logs: requirements

The owner's words are in `owner-words.md`; read them in full. Two phases, in order, because logs render as nested cards.

## Phase 1: the card system, at core/Page/card/
1. **Inventory, cheaply** (Haiku or Sonnet minions, one area each): find everything on the site that is effectively a CARD (roughly, anything with its own background): page previews, Decision cards, Concepts tiles, the object card, ux/Content modules, AI 2 rail rows, the sheet cards, ui/ components, /imagine/ and /layouts/ cards. Output: one table of what it is, where it lives, its background, padding, radius and nesting, and whether it's clickable, expandable or has a menu, with screenshots.
2. **The system:** a card is a MINI PAGE, responsive, working on mobile; a list of clickable cards means ROUTED pages. Define:
   - card grounds: default (its own background on white), light gray, dark, and a strong hue (the primary); how they STACK and NEST;
   - nesting depth: at most about 3 levels, since padding eats space. Past that, use hierarchy WITHOUT boxes (a big heading with its content at the same indentation, no extra box);
   - the title, header and menu patterns; scale; what content fits.
   Live at core/Page/card/ (a page plus a readme), with demos, referenced from core/Page's readme. Reuse the existing tokens (--pad, --pad-card, --radius, grounds); keep new CSS minimal. Coordinate with task-mastermind-page-system-3 (it owns core/Page) and task-mastermind-item-ui (icon items).
3. Write a short "cards" section into the `page` skill: which card, when.

## Phase 2: an object log UI
4. **An object-oriented logger:** `this.log(…)` on any object; LOG GROUPS, where each method call can open a group containing the logs inside it (nested); rendered as nested cards and items, collapsible, with the depth limit above. Output to the console AND to a renderable log (JSONL where it should persist, like page.jsonl and ai/log.jsonl; in memory for ephemeral things).
5. **First real use: the Whisper transcription debug view.** The raw chunks, each resend, the local-agreement resolution (what was committed and when), and the seams, readable as a log (coordinate with task-mastermind-audio).
6. Look at the owner's past logger ideas if any are in the repo (grep for a Logger or log-group pattern) and reuse them.

## Rules
Keep v1 of anything you restyle reachable. Use a pool worktree, the smoke test with links followed, merge.mjs, ONE fresh reviewer, and screenshots at 1920 and 400. At most 2 minions at once, since memory is tight. Budget about $12. Post progress on card 2026/09/29/cards-and-logs-a-core-page-card-system-t.

**Decision from the owner (audio/owner-words.md, "Continued (about 8:40 PM)", the end; relayed 20:30 by mastermind-servex-7):** a card is a tiny page WITHOUT a folder by default. Its data is a line in the parent's page.jsonl, with a virtual, routed URL through the parent's route(). A folder is made ON DEMAND, only when the card grows. The rule: a card's data lives in the nearest page.jsonl that exists.

## Added 2026-09-30 12:25 (mastermind-servex-8)
The owner spoke again about the AI 2 dashboard on 09-30 at about 12:20 PM; the verbatim words are at the end of `ai/2026-09-30/page-audit/owner-words.md`. They belong to Phase 2 (logs): the default tab (perhaps named Inbox) shows only the important, high-level things; a Log view shows everything in flight, one card per thing being worked on, but no heartbeats and no minions of a bigger task as their own rows; each log card carries a status light, and the owner reads flashing yellow as in progress and green as done; every view shares the same layout and CSS. Read those words in full and trace each ask to a deliverable. task-mastermind-page-system-3-3 is stopped; coordinate through mastermind-servex-8 instead.
