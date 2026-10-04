# AI: a prompt review of 2026-10-02: every owner prompt, refined, on one card

Budget: $10, mostly OpenRouter (Gemini 3.8 Flash; DeepSeek or GPT-6 Luna for comparison; one Sonnet reference).
Owner: @mastermind-ai-2. Uses the landed refine system: `ext/Refine/engine.js` and `structure.js`, the `prompt-refine` skill, Echo.js.

The owner, 2026-10-02 (trimmed): "go over at least today's prompts, from the first through the last… put them on a card on the dashboard, 'yesterday's prompt review'… a list of every prompt with a summary title and maybe some bullet points… for each prompt: the raw prompt from the actual session file, the clean transcript (capitalisation fixed, filler and redundant words removed, the essence kept)… if one or more minions are highly confident something is garbled or mistranscribed, omit it and put a little yellow question mark in the text; hover it to see the omitted raw words… do it with multiple minions and compare how they structure it… the structured output is the most important: start from the summary, click through to the chunks behind each part of the outline… tag prompts with references (the modules they're about), filter by tag, and an Overview view that groups the refined prompts by primary category (a prompt can carry two tags)… don't cram seven tabs onto mobile… cards preview themselves and click through to a full view; the column management can come later."

## Build
1. **The data:** for each owner prompt in session `361c4d18-e878-4c04-9537-444e847e13d5` on 2026-10-02 (read in order from the transcript; the hook log and the session page already hold them), one Prompt item on the session page (`ai/2026/10/02/session-361c4d18/`) with: `raw` (rebuilt from the sentence ids), `clean`, `structure` (headings, each citing its sentence ids), `title` (one line), `bullets` (2–4), `tags` (module references: `#Page`, `/framework/ai/`, `@mastermind-servex`…, primary first), and `flags`. All written through the page/refine tools, never by hand.
2. **Clean, near-verbatim:** capitalisation, punctuation, filler and redundant words only. **A garbled passage** that the refiner is confident is a mistranscription is OMITTED from clean and replaced by a yellow `?` marker whose hover (title) shows the omitted raw words. A self-correction is still applied (struck through). Update `engine.js`'s check and the `prompt-refine` skill to allow these two cases only.
3. **Compare models:** Gemini 3.8 Flash refines all of them. DeepSeek V4 Pro and one Sonnet reference refine a sample of 5. Show the sample side by side, and compute the agreement on titles and tags by code.
4. **The view, "Prompt review: Fri 2 Oct":**
   - One card on the AI Dashboard / Inbox, linking to its page.
   - **List** (the default): one row per prompt, with time, title, 2–4 bullets and tag chips. Filter by tag.
   - **Overview:** prompts grouped by primary tag; a prompt with two tags appears in both groups.
   - **A prompt's detail:** the Structured view first (headings; each section expands to its source chunks). A three-way switch, Structured · Clean · Raw, replaces a row of tabs, and wide screens show Clean beside Raw. Mobile gets one column and the switch, never seven tabs.
   - Preview → full view by a plain link. Multi-column management comes later.
5. Review at 400 and 1920.

Never wait on the owner.
