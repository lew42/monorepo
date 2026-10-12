# Checker checker-4 — feedback council (run 2026-10-07/feedback-council)

You are checker **checker-4**, one of 5 checkers verifying open owner asks against the live site.

## Read first
- Card dir (raw words): `public/framework/ai/council/`
- Full ask history: `public/framework/ai/council/asks.jsonl` (latest line per id wins)
- This run: `public/framework/ai/2026-10-07/feedback-council/`
- No new words landed today (`words.jsonl` is empty) — check only the asks below, nothing to extract.

## Your asks (verify each; prior verdict/evidence shown is NOT truth, just a pointer)
- **E16**: Chat should auto-scroll to the newest message by default, stop doing so once the owner scrolls up, and show a "jump to bottom" button to return. (last verdict: not checked; last evidence: (none))
- **E17**: Add a "clean transcribe" mode toggle that sends dictation straight into the chat as it's spoken, with no separate editable text area, and consider making it the default. (last verdict: not checked; last evidence: (none))
- **E18**: Fix duplicate messages: assistant replies (and sometimes the owner's own transcriptions) are appearing twice in the same chat or card. (last verdict: not checked; last evidence: (none))
- **E19**: Restore the microphone start/stop sound cue; it stopped playing, so there's no audio signal that listening started or ended when not looking at the screen. (last verdict: not checked; last evidence: (none))
- **E2**: On the Now card, chat stays a persistent right sidebar; the tiny top tabs should not include chat. (last verdict: not checked; last evidence: (none))
- **E20**: Replace the fixed-height audio level bar with a small pulsing dot that grows with volume, floats anywhere (e.g. bottom-right corner), and can be tapped to reopen the dictation sheet. (last verdict: not checked; last evidence: (none))
- **E21**: Build a text-to-speech "Voice" class/system, pairing with the existing Whisper dictation, with streaming output, switchable voices, and conversational timing rules (don't interrupt too soon) for a full voice-chat mode. (last verdict: not checked; last evidence: (none))
- **E22**: When a reply mentions a card or task, it must be a real clickable hyperlink, not plain text the owner has to copy and paste to navigate to. (last verdict: not checked; last evidence: (none))
- **E23**: Closing the dictation sheet should not stop the microphone from listening, and opening it can auto-start the mic — the two states (listening vs. sheet visible) should be independent. (last verdict: not checked; last evidence: (none))
- **E24**: Set up remote/mobile access to the site through a Cloudflare Tunnel (preferred over Tailscale or a new paid service, since Cloudflare is already in use) instead of relying on the local Wi-Fi IP. (last verdict: not checked; last evidence: (none))

## Job
For EVERY ask above, LOOK at the real result and give one verdict:
`done` / `partly` / `not done` / `done-but-wrong`, one line of evidence (URL, screenshot path, file:line),
and for anything not `done` the smallest fix.
**Prove before you call something missing.** Search the repo (`git log`, grep, `.claude/skills/`, CLAUDE.md) before writing "not done".
The live site: http://monorepo.localhost (never http://localhost/). Visual asks: headless Playwright at 1920 and 3440
(Playwright, never the owner's tabs — no `mcp__site__eval` on tabs the owner has open). Time the Live card load.
Check scroll on named URLs with real overflow measures. No window may pop up: `windowsHide: true`, `-WindowStyle Hidden`.
Do NOT edit any repo file. Scratch goes in your scratchpad; screenshots to
`public/framework/ai/2026-10-07/feedback-council/shots/checker-4-<ask>.png` only for evidence shots (keep <=12 total).

## Return
Write ONE json file `public/framework/ai/2026-10-07/feedback-council/votes/checker-4.json`:
`{"name":"checker-4","votes":{"<id>":{"v":"done|partly|not done|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...}}`
Cover every id listed above. Then reply "done" in one line. Budget about $2: be quick, do not over-explore.
Never write the owner's name anywhere.
