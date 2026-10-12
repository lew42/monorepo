# Owner inbox: agents notify the owner without blocking (task mastermind brief)

**Owner (2026-10-12):** they do not read every chat reply. Agents must never pause a task waiting on a chat answer. Anything important (a decision made on their behalf, a risk, something only they can do) should land as an item in the AI dashboard's inbox, where they will see it; "it's not really working yet."

## Do
1. **Find out what is broken (reproduce first, on current `michael/dev`):** how a note reaches the owner today: `create_card` type `note`/`question`, `card_ask` ("Waiting on you"), `page_note` onto a page's `page.jsonl`, the `Inbox` class (`core/Page/ext/Inbox`, `ai/rail/rail.js` `AIRail extends Inbox.Rail`). Post one test item each way and see which appear in `/framework/ai/` Inbox, how fast, and where they vanish (inbox-zero score floor `Rail.FLOOR = 90`? filters? read state?).
2. **One path, enforced:** make a single node tool (or fix the existing one) that every agent and mastermind uses to tell the owner something: `owner_note({title, text, kind: "decision"|"risk"|"needs-you", links})`. It writes the card through the existing card system and it shows at the top of the Inbox until read. No second inbox.
3. **Wire it in:** mastermind and sub-mastermind skills (one line each, in place of any "tell the owner in chat" wording), and Servex's results-gate / landing path posts a decision note when an agent decides something on the owner's behalf.
4. Verify end to end with a headless check of the Inbox; layout-check at 400/1200/1920/3440; commit each step; merge.

## Fences
Worktree; a `Servex/` change needs one batched restart proven on a private port. Do not change `Servex/Pool.js`. Sonnet 5.5; Haiku under 60k tokens for reading; no OpenRouter. One-sentence chat replies; `STATE.md` here; land with `finish-task`.
