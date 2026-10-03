# "That heading there": the assistants match what you say to the element on the page

Design first, then a small proof. Start after push-to-talk lands.

## The ask (owner, 2026-10-03, dictated)
> On-screen contextual overlays: tooltips, suggestions, references. The prompt refinement, taken to the level of referencing the specific item on the page. I want to be able to reference any item on any page: I navigate there, the AI can see which page I'm on, I start talking about a certain header or list item, and it matches it with what it knows about the page. If the page is a page.js file, appending to it is much harder (rewrite the JS, risk mistakes); with page.jsonl, items have ids. But the LLM shouldn't read page.jsonl directly: it could be bloated, long, token-inefficient. We once had a server-side page construction: load the Page class and the system that reads page.jsonl, instantiate the page server-side. Matching a spoken description to the right element is tricky and error-prone: several instances of a word, mistranscriptions.
> The fast assistant matches quickly; the smart assistant verifies with its own redundant matching, BLIND: it doesn't see the fast assistant's answer until it has cast its own vote, so its judgment isn't clouded. That's worth considering for the whole system: whenever the smart assistant double-checks the fast one.

## What exists
- `page_read` (Servex) returns a page's computed state: markdown, or html with each item's `data-id`: the compact, server-side view the owner describes, for page.jsonl pages.
- The fast/smart assistant pair (ux/Dictate, Servex/agents), the Refine engine.

## Want
1. **One compact "what's on this page" view** for ANY page, page.js pages included: the visible headings and items, each with a stable address (data-id, or a generated selector path), a few hundred tokens at most. Built in the browser from the live DOM and sent with each utterance, or server-side where page.jsonl allows. Decide which and record the alternative.
2. **Matching:** the fast assistant returns `{address, confidence}` for the thing referred to; the smart assistant answers the same question blind; agree → highlight the element (overlay, no layout shift), disagree → show both candidates, ask in one word.
3. **The blind-vote rule** written into the assistant docs as a general pattern, with its cost per utterance.
4. A proof on the Now card: three spoken references, the matches, and the cost.

Model: Sonnet. Budget $10. Owner: @task-mastermind-one-dictation's area. NEVER the mcp__playwright tools.
