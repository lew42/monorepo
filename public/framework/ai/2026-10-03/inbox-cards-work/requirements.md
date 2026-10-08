# AI inbox: cards you can read, and clicks that never 404

## The ask (owner, 2026-10-03, dictated)
> This AI dashboard is garbage right now. "Worktree pool stuck, two minions queued 40 minutes": what does this mean? Which worktree, which pool? I don't know what a worktree pool is. These inbox cards are for ME to understand what's going on, and it's every mastermind's job to make sure the cards make sense. There's a sub-notification on the preview, "the mastermind: Made this card…". I clicked the Activity tab and something broke; I'm looking at a 2026 link; I click the card in the navigation again and it doesn't reload. This is so broken. Let's not start over; let's fix it. We need better information in the dashboard.
> I clicked the Your prompts card (/framework/ai/your-prompts/) and got a page load error, 404, "nothing matches", can't find your-prompts/page.js. We don't need to smoke-test every card: adding an item should just work, a battle-tested system. The only way it knows whether to use page.js or page.jsonl is the directory and the parent, so a link knows which to load. I thought we had that set up.

## Bugs found by vscode-mastermind (verified)
1. **Card content items show only their `title`.** The "Now" card (`/framework/ai/2026/10/03/now/`) has three items with `title` + markdown `text`; the detail shows three bare titles. `page_read` html confirms `<li><p>title</p></li>`, with no text. A content item must draw its text (markdown) under its title.
2. **`page_set` with an `id` ignored the id** and set the PAGE's title to null (its line had no path to the item). Data-corrupting. Check `Servex/agents/page_tools.js` ~line 262: the tool's live schema (`id`) and the code (a path array) disagree; maybe Servex wasn't restarted after the `at` key was dropped. Make the id path work (`{"<id>": {...}}` nesting per the no-`at` design) and add a test.
3. **Every page_add/page_set line is stamped `by: "agent"`**, not the caller's id.
4. **`/framework/ai/your-prompts/` 404s.** `ai2/page.js:104` routes `your-prompts`, but the new `ai/page.js` (~line 136) only hands `live|view|framework|year` to AIRail. Every id the rail links to must route. Fix it at the root: the rail and the router read the same list, so a rail link can't point at a route that doesn't exist. Add a check that clicks every rail item.
5. **The Activity tab breaks navigation:** after it, clicking a card in the rail doesn't load it until a reload.
6. **Card previews are noise:** "the mastermind: Made this card: Now", "recently active", unexplained "94"/"99" badges. The preview line shows the card's latest meaningful sentence (its summary or newest status), never a creation echo. A badge either explains itself on hover or goes.
7. **Card titles must be plain words for the owner.** Rename the open jargon cards (e.g. "Worktree pool stuck…" → "Two finished agents never returned their workspaces; new agents got none"). Add one rule line to the mastermind skill and to `create_card`'s description: a title says what happened and why it matters, in words a non-programmer reads.

Note: the new `/framework/ai/` still imports `ai2/` code (card.js, activity.js, rail.js, page.js). @mastermind-ai-3 is retiring AI 2 today; coordinate on your card (page inbox note) so it migrates those files rather than deleting them.

## Prove it
Screenshot the Now card detail and the inbox list before and after. Click every rail card and every tab, then a card again: no 404s, no stuck view.

## Fence
Write: ai/, ai2/ (coordinate), Servex/agents/page_tools.js (+ its test), the mastermind skill line, this task dir. Hold reloads. Restart Servex only if no merge is running.
Model: Sonnet. Budget $12. Over pace: no reviewer spawn.
