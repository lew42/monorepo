# AI 2 Overview: what you asked for, and what came of it

The owner's words: `public/framework/ai/2026/09/28/ai-2-rhythm-tabs-sections-and-sidebar-va/owner-words.md`, especially "Continued (about 11:00 PM)". Read them in full. They sum up the day:

> "What we have failed to do is create very clear, familiar, concrete topics ... Servex ... the view class, the app class, the page class, these things are concrete. We need to reference those as much as possible ... simplify everything tremendously ... big simple interfaces with big simple icons and like the important things are big and then the sub things go inside the big ones."

## Build ONE view: AI 2 → tabs **Inbox · Overview** (routed). Overview is:

1. **Grouped by FAMILIAR concepts, as big icon cards:** Servex, Page, App, View, AI 2 (the dashboard), Dictation, Research/Collab. Use only concepts the owner already knows; nothing invented. The most important concept is the biggest card, and the first.
2. **Inside each concept, its asks:** each is one row. The owner's request (a short quote, linked to the full words), then its state, then a link to the result. **Open** asks are shown. **Done** asks fold into one "Completed (n)" line per concept, not twenty 100% bars.
3. **A timeline strip for each ask** (on hover, or a "timeline" toggle): requested, then delivered, how long it took, what it cost in $, and the outcome, linked.
4. **Data, not writing:** the owner's prompts (`.claude/prompts/*.jsonl`), the task logs (`ai/*/task.jsonl`: request, landed_at, outcome, cost_usd) and the cards. A small index script builds `overview.json`; the page reads it. No hand-written summaries.
5. **Importance first.** The order is by importance (foundational, needed now), then by recency. What can wait sits lower and smaller.

## Rules
- Keep it big and simple, and readable in 10 seconds at 1920 and 3440. Use the site's own components (ux/Content Concepts tiles, ui/section once it lands, the page skill). Minimal new CSS.
- Start only after task-mastermind-ai2-lead-2 has merged the rail-rhythm fix (check git log), and build on its ai2/readme.md checkpoint.
- Use a pool worktree, the smoke test with links followed, merge.mjs, and a fresh-eyes review that asks "can the owner tell in 10 seconds what was done today?".
- At most 3 minions at once. Budget about $10.

