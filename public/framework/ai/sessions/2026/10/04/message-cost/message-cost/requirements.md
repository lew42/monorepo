# Every message, its clean version, and what the clean cost

## The ask (owner, 2026-10-03 ~23:30, dictated, verbatim)
> I have yet to see an accurate like UI that shows exactly how much each like message costs essentially. I know I've asked for that. It's almost like you're resisting actually making it. Where where is this page that I've asked for before? I want to see each message as I transcribe it. This is the dictate part. I want to see the cost of the transcription. Well, I mean, the, the whisper is doing it locally for free. So it's really the clean transcription part. Um, And I don't know if those are being done via deltas, using deltas to update, you know, a raw transcription to make it a clean transcription. It's kind of an interesting idea if it's possible or easy enough to implement.

## Found (vscode-mastermind, checked tonight)
- **Voice:** `Servex/agents/Sessions.js` `refine()` should write `{refined: {re, sentences, sections, flags, cost_usd}}` after each finished spoken line (minion-voice-refine, merged 8ce2c9ef). **No real voice session has ever got one**: 0 `refined` lines in any session file (newest: public/framework/ux/ai/v-kfhnzp5.jsonl). Find out why (worth_refining()? servex.echo missing? never deployed after restart?) and fix it.
- **VS Code tab:** works. Each prompt gets a sentences line with `cost.usd` (~$0.21) on its session page, e.g. /framework/ai/2026/10/03/session-60d9def6/. But no view shows message → clean → $ side by side.

## Want
1. **One view, one row per message, newest at the bottom, live:** raw text (Whisper, free) → clean text → the clean step's cost in real $ / Claude $, and the running total for the session. The same component for a voice session and a VS Code session (law 6): extend the existing session page / Dictate chat rendering, don't build a second.
2. **Voice refinement actually running,** proven on 3 real spoken lines with their costs shown.
3. **Clean as a delta, not a rewrite:** the clean step is stored as a small line keyed to the raw message's id (it already is: `{"<prompt-id>": {sentences…}}` / `{refined: {re…}}`); show that in the view (raw stays, clean appears under it when its line arrives).
4. **Cheaper:** ~$0.21 per clean is too much; measure what model/context the clean uses and get it to cents (e.g. Haiku or an OpenRouter flash model for clean, no big context).

## Done when
A screenshot at 400 and 1920 of the view with three real voice lines and three VS Code prompts, each with clean text and cost, cost per clean under $0.03. Link it from /framework/ux/Dictate/ and the session page.

Budget: $8
Model: Sonnet. Fence: Servex/agents/Sessions.js + Echo.js (refine path only), ux/Dictate rendering, the session page renderer, this task dir. Never the mcp__playwright tools.
