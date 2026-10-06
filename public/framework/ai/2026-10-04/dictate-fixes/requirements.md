# Dictate: four owner-visible fixes, nothing else (freeze)

## The owner, 2026-10-04, on the phone (http://10.0.0.135:3104, the mobile AI rail button) and on /framework/ux/Dictate/
> I said something and see it appear in the same chat bubble four times in a row

> it had some sort of microphone abort error, and then it went into the browser's default transcribe mode, made a ton of beeping noises ... it said connecting ...

> once it sends it off ... it'll send off the text area and clear it out. But instead of putting it quickly into the UI, it takes a minute ... We always want that instant feedback

> a weird task mastermind, something about the data grid, pinned to the UI taking up a huge amount of space

## Facts
- Whisper is up (127.0.0.1:8178) and starts with Servex. The Chrome insecure-origin flag for :3104 is set and the mic worked before: the "abort" has another cause (two mic grabs at once? auto-start firing twice? floating mic and rail both? a stale stream?).
- The cheap-model switch already landed: /framework/ai/2026-10-04/dictate-without-claude (bd521d1a).

## Do, in order; prove each headless (Server/browser.mjs / check_page, text fed through the same path)
1. **One bubble per line:** find why one line draws 4×; prove 1×.
2. **Mic refused → one clear line** saying why and how to fix it; never fall back to the browser's speech recognition (no beeping). Find and fix the real abort cause.
3. **Instant send:** the sent line shows at once as raw text with a "cleaning…" mark; the clean version replaces it; after ~2 s with nothing back, keep the raw and show "sent, waiting". Measure send→visible ms before and after.
4. **A finished task never stays pinned** in the rail.
No other changes. Worktree → check_page → merge.mjs.

Budget: $5 (a guide)
Model: Sonnet, ONE agent. Never the mcp__playwright tools.
