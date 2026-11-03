# Point at it: match speech to the element

Design first, then a small proof. Start after push-to-talk lands. Example from the owner's own words: *"that heading there"* should highlight the heading, not a guess.

## The ask (owner, 2026-10-03, dictated)
> On-screen contextual overlays: tooltips, suggestions, references. The prompt refinement, taken to the level of referencing the specific item on the page. I want to be able to reference any item on any page: I navigate there, the AI can see which page I'm on, I start talking about a certain header or list item, and it matches it with what it knows about the page. If the page is a page.js file, appending to it is much harder (rewrite the JS, risk mistakes); with page.jsonl, items have ids. But the LLM shouldn't read page.jsonl directly: it could be bloated, long, token-inefficient. We once had a server-side page construction: load the Page class and the system that reads page.jsonl, instantiate the page server-side. Matching a spoken description to the right element is tricky and error-prone: several instances of a word, mistranscriptions.
> The fast assistant matches quickly; the smart assistant verifies with its own redundant matching, BLIND: it doesn't see the fast assistant's answer until it has cast its own vote, so its judgment isn't clouded. That's worth considering for the whole system: whenever the smart assistant double-checks the fast one.

## What exists
- `page_read` (Servex) returns a page's computed state: markdown, or html with each item's `data-id`: the compact, server-side view the owner describes, for page.jsonl pages.
- The fast/smart assistant pair lives in `/framework/ux/Dictate/` (the Refine engine) and `/framework/servex/`.

## Want
1. **One compact "what's on this page" view** for ANY page, page.js pages included: the visible headings and items, each with a stable address (data-id, or a generated selector path), a few hundred tokens at most. Built in the browser from the live DOM and sent with each utterance, or server-side where page.jsonl allows. Decide which and record the alternative.
2. **Matching:** the fast assistant returns `{address, confidence}` for the thing referred to; the smart assistant answers the same question blind; agree → highlight the element (overlay, no layout shift), disagree → show both candidates, ask in one word.
3. **The blind-vote rule** written into the assistant docs as a general pattern, with its cost per utterance.
4. A proof on the Now card: three spoken references, the matches, and the cost.

Model: Sonnet. Budget $10. Owner: @task-mastermind-one-dictation's area. NEVER the mcp__playwright tools.

## Part 2 (owner, same day): Ctrl+Shift+click selects it, and the selection IS the reference
> Maybe I can just select it. Our own selection system: hold Ctrl+Shift and click something, boom, it's globally selected, part of "the AI selection". One global document listener checks the modifiers. Don't hijack browser defaults. When it's selected, show the icon item that describes it (a plain div can just say "div"), and its tree, like Figma's layers panel but only for the selection. Select the PARENT first (clicking an icon inside an icon item selects the icon item), then a sub-selection mode drills into children. The key is referencing elements reliably by id or index; an index needs a timestamp: "at this index in the state as of T", so anyone reading it knows which state.

**What exists, extend it (law 6):** `ext/drawer/select.js` (inspect mode: hover brightens, click selects, opens the drawer's Element tab; today behind a Settings toggle), `ext/Ask/pick.js` (crosshair picker + `context()`: page, element, nearby readme), `ext/drawer/tabs/element.js`.
5. **Ctrl+Shift+click** anywhere selects through `select.js` with no toggle needed (plain clicks stay untouched); Escape clears. Parent-first: the nearest meaningful element (an item with `data-id`, an icon item, a card, a heading), not the innermost node.
6. **A small popover** at the selection: its icon + name, and its tree (parent chain above, children below, each clickable to move the selection). 
7. **The address:** `data-id` path when there is one; otherwise a structural path plus the page's state timestamp (`{path, as_of}`). The selection travels with the next utterance or chat message as context, so "fix this" needs no matching at all.
