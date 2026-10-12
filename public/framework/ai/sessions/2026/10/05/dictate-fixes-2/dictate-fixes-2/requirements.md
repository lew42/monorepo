# Dictate fixes, round 2 (freeze: these only)

Round 1 landed (/framework/ai/2026-10-04/dictate-fixes/: one bubble per line, no Chrome recognizer fallback, instant send, no stale pins). Its review left the mic-abort race untraced.

## The owner, 2026-10-04, on the phone (http://10.0.0.135:3104, mobile AI rail button)
> There's these little beeps when the microphone's supposed to go on and off. It's bleeping twice ... it seems like it's maybe turning off and then turning back on after every pause

> I just click send and then keep transcribing and it cleared out the text area and I kept going ... [that] wasn't terrible

> As I hit transcribe, the text area grows. So it goes from two or three lines to five to six to seven lines and gets so big I can't read anything else

> an error happens and that error doesn't get cleared out. And so now we're wasting three more lines of screen space for some old artifact error

> when I reload that page ... it says connecting... for about four to five seconds ... and then says microphone abort error

## Do, each proven headless with a load → reload → load cycle and a "[dictate]" console trail
1. **Trace and fix the mic-abort race on reload** (round 1 retried, didn't find the cause).
2. **No mid-sentence beeps:** the mic stays on until the owner stops it; nothing stops/restarts it on a pause.
3. **Manual send stays** (box clears, keep talking).
4. **Text box capped at 2–3 lines**, scrolling inside.
5. **One status line** (mic · connection · Whisper) replaces error rows; an error clears itself when the stage recovers.
Nothing else in Dictate. Worktree → check_page → merge.mjs.

Budget: $5 (a guide)
Model: Sonnet, ONE agent. Never the mcp__playwright tools.
