# The Now card's topics become nested cards, built from the refined prompts

Start AFTER @task-mastermind-prompts-live (the refiner runs per prompt again) and @task-mastermind-subcard-columns-2 (sub-cards open in columns) land. Both are prerequisites.

## The ask (owner, 2026-10-03, dictated)
> The "what you're talking about" card on the Now page: I like it, it's very visual. It's not clear how, when and where it reloads: you could sneak in an update and it updates without me seeing it. I don't want it flashing all over, but something new should be noticeable. This live view is very important to me. These bulleted list items need to be more structured, in their own cards that we can click through and dig into. We want to be able to dig into any threaded thing, and the AIs to understand this nested structure and respond or add things in the right place. Prompt refinement is a big part of it: it's what you're doing by hand, but our refinement system was set up to do it in a structured way. I want to see the flow per prompt: the raw transcription; the cleaned transcription (still near-verbatim, better punctuation and capitals); then structured, summarised and turned into UI, the nested cards. Instead of a bulleted wall of text (half my screen height now that it's narrower), which I don't want to read.

## Want
1. **One sub-card per topic** under the Now card (create_card with `parent: "2026/10/03/now"`), its title a plain-word headline, its body: the owner's statements on it (from the refined prompt, with sentence ids and a link to the raw prompt), then the mastermind's answer and the agents working on it (linked). The Now card's top section becomes a short list of those topic cards, newest first: titles only, each a click into its card.
2. **Per prompt, the three stages visible:** raw → clean → structured, on the session page, each prompt linking to the topic cards it fed.
3. **AIs write in the right place:** a reply targets a topic card (or a statement id inside it), never the top of the Now card. Document the one call an agent uses in the card's "How this card was made" section.
4. **Updates are noticeable, not flashy:** an item that changed since you last looked gets a small "new"/"updated" mark (cleared on view); no animation.
5. Also: the Now card doesn't appear in the inbox list (ai2/rail.js filters out id "now" ~line 192/250, a leftover from an old built-in "now" pin); make it show.

## Fence
ai2/card.js / ux/Card (coordinate with subcard-columns), the Now card through the page tools, this task dir. NEVER the mcp__playwright tools.
Model: Sonnet. Budget $12.
