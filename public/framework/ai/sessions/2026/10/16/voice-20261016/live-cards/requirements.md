# /live: card subpaths, full-width card, side-scrolling code blocks

Voice ask 25f15826 (the owner, 2026-10-16 ~02:42Z). Parent: mastermind-voice-20261016. Do the three in order and commit each one when it works. Report the first landing at once with `send_to_agent` to mastermind-voice-20261016, then keep going.

## The owner's words
> 1) A card opens at a subpath /live/<id>/ not /live/?card=<id>; a card gets a path so it can later own its own dir and page.jsonl, even while it lives in the parent's jsonl. Keep ?card= working as a redirect. 2) The opened single card goes full width: no outer gray frame or double padding; maximise horizontal space, especially mobile. 3) Code blocks: side-scroll by default (no wrap); a per-block opt-in to wrap (e.g. fence info "js wrap" sets a class).

## Deliverables
1. **Card subpaths.** `/live/<id>/` opens that card. `/live/?card=<id>` redirects there with `history.replaceState`, so back still works. The feed links to the subpath. Reload and back must land in the same place. Use the framework's Router or children mechanism if it can serve a child that exists only as a line in the parent's page.jsonl (read `public/framework/core/Page/readme.md` and the subpages work in `voice-20261016/subpages/` first; commit e6d98e579 is the subpages fix that awaits a Servex restart, so check whether the dev server already serves an unknown `/live/<id>/` path). If the static site can't serve the subpath without a page.js, say so and pick the simplest option that works today, with the alternative written down. Give each card a `path` so it can later get its own dir and page.jsonl.
2. **Full-width opened card.** No outer gray frame and no double padding in the single-card view. Maximise horizontal space, mobile first (400 wide). The feed view is unchanged.
3. **Code blocks** scroll sideways by default (`white-space: pre; overflow-x: auto`), and a fence info word `wrap` (for example "```js wrap") adds a class that wraps. The `wrap` word is read in the markdown module `public/framework/ext/markdown/`, so it works site-wide; the default no-wrap CSS goes beside that module's styles, not in Live.css. Check one other page with a code block still renders.

## Rules
- Never restart Servex. Never drive the owner's tabs (use headless shots). Never write the owner's name.
- Hold live reload around each batch: `node Server/hold.mjs on "<you> — <what>" --paths public/live/**,public/framework/ext/markdown/**`, then off.
- Load the `code` and `css` skills first. Shoot 400 and 1200 headless for each step and look at the 400 shot.
- Report in one screen: what landed, commits, anything left.
