# Your prompts, refined live, on a card

## The ask (owner, 2026-10-03, dictated)
> Put as minimal as possible responses in the VS Code sidebar; now that we have the streaming page system, create the responses on the page. If we have the prompt refinement done (I asked several times yesterday), all of these prompts could be turned into little cards in a live-chat-type experience: automatically logged to the file by a hook, and passed to a prompt refinement agent. I see my raw prompt, then I see the refiner work in real time, up-converting my raw prompt to a structured prompt, so each statement is simplified and structured but we don't miss any details: everything accounted for and identified. Then the mastermind responds inline, threaded, to the items the refinement created; a tangential side question deep in a prompt gets its own place. Summarising the prompts and getting them on screen with cards and nested cards is a top priority. These cards are like our chat: streams of messages, nested, properly formatted, the right cards in the right place.

## Where it goes
The card already exists: [/framework/ai/2026/10/03/now/your-prompts-refined-live/](/framework/ai/2026/10/03/now/your-prompts-refined-live/) (a sub-card of the Now card). Its page.jsonl is the target.

## What exists (read first, law 6)
- `.claude/skills/prompt-refine/SKILL.md` (owner prompts only, sentence ids, near-verbatim clean, garbled → yellow ? with hover, structure by ids, raw rebuilt from ids, live writes).
- `public/framework/ext/Refine/engine.js` + `structure.js`, `Servex/agents/Echo.js`, the `refine_step` Servex tool.
- The prompt hook that logs owner prompts (find it in `.claude/hooks/` / `.claude/settings.json` UserPromptSubmit) and yesterday's prompt-review card (ai/2026-10-02/prompt-review/).

## Do
1. **Hook → card:** each owner prompt in the VS Code mastermind session (session `361c4d18-e878-4c04-9537-444e847e13d5`) is appended to the card as a Prompt item the moment it's sent (raw text, sentence ids), through the hook, never retyped by an AI.
2. **Refiner:** a small always-on refiner (Sonnet or a cheap model as a doer, its own session, woken by the hook, not polling) writes the structured version under the raw prompt in steps you can watch: statements grouped by topic, each keeping its sentence ids, nothing dropped; garbled bits flagged.
3. **Threaded replies:** a reply item can target one statement id (`{"<prompt-id>": {"<statement-id>": {"replies": {"add": {...}}}}}` per the no-`at` design), drawn nested under it.
4. Prove it with three real prompts end to end, a screenshot after each step, and the cost per prompt on the card.

## Fence
Write: the hook, the refiner agent file, Refine/engine wiring, the card's page.jsonl through the page tools, this task dir. NEVER the mcp__playwright tools; use check_page / Server/browser.mjs.
Model: Sonnet. Budget $12; cost per prompt must be cents, not dollars.
