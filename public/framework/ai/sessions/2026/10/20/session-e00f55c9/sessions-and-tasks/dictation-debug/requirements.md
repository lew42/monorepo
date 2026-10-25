# Dictation: a Debug tab that shows each layer, and the stall fixed

Opus, high effort. Work in a worktree and land ready to merge; the merge is the owner's. The owner's words are in the prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl` (2026-10-24, the prompt after "Session extends Task").

## The owner's ask

- **Voice dictation keeps breaking.**
  - It transcribes for a bit, then stops.
  - Sometimes the AI never answers ("hello, can you hear me?", and nothing).
  - After a reload it almost always breaks again. Maybe the microphone isn't released, or a process died and never came back.
  - "I can't see a damn thing about why. No error."
- **Make the drawer's Dictation tab a Debug tab.** It's in the mobile sheet's tab list, and today it seems to do nothing.
  - It shows each layer, live:
    - Is the mic connected?
    - Is Whisper connected?
    - Are raw Whisper transcripts coming back?
    - Is the text being sent to the LLM?
    - Is the LLM connected, and is it responding?
  - Each layer shows a real error message when it fails.
- **The tab is routed.** The sheet and the tab it's on survive a reload, as a subpath or a peer path. Pick one and say why.
- **Find the stall and fix it,** including whether the mic is released on reload. Reproduce it first.
- **A UI rule, written into `public/framework/doc/rules.md`** (or the doc it belongs in): anything that can fail tells the user what went wrong, so they can diagnose it.
- **Errors are logged per page and per module,** so we know the moment one happens, and the goal is pages with zero errors.
  - `public/framework/ai/errors/` already has dated jsonl files. Find what writes them and extend that rather than building a second system.
  - Propose (don't build yet) a watcher that re-runs a page when its files change and logs any new errors.

## Start here

`public/framework/ext/Chat/Mic.js`, `ext/Chat/Composer.js`, `ext/drawer/AIPage.js` (the drawer and its tabs), `ext/Ask/reply.js`, and the readmes beside them. Run the `past-work` skill on "dictation", "Whisper" and "mic" first: there has been a lot of voice work.

## Done when

- [ ] The Debug tab shows every layer live, with real errors, and a reload keeps you on it. Shot on a phone and at 1920.
- [ ] The stall is reproduced and fixed, or exactly located with the next step written down.
- [ ] The UI rule is written, the error log is extended, and the watcher is proposed. Log a `show:` line with links.


## One subscription system (the owner, 2026-10-24, the next prompt)

"We want to basically use the same system everywhere... the same way an agent subscribes to a sub-agent session log, an agent can subscribe to a certain module, and just by subscribing it automatically gets test errors or browser errors... lean into our one solid system rather than redesigning a subscription system for every new use case."

- **The one system is Servex `follow`.** It watches a file or a folder (module level), and a `.jsonl` file's new lines arrive verbatim, batched every 2 seconds.
- **So a test failure or a page error is just a line appended to a log in the module's own folder** (data lives with its module). Whoever follows that module gets it. No direct `send` from the watcher, and no second subscription mechanism.
- **The builder follows the modules it is changing,** the mastermind follows its children's session logs, and both use the same tool.
- **The noise rule still applies:** report a failure only if it still fails after a quiet spell. Passes are logged as one "clear" line.
- **`ai/errors/` (one global folder) moves toward per-module logs.** Say how in your outcome.

## Also (the owner, 2026-10-24)

The web live-transcribe is "wonky and broken". The chat bubbles aren't made robustly, and the deltas that build them are applied glitchily. The owner wants web transcription working again, so they can use it instead of the app. Include the bubble and delta path in your investigation.

## Also (the owner, 2026-10-24): dictate on the website into the VS Code tab's session

The owner wants to dictate on the website and have it reach this VS Code sidebar session (e00f55c9), with the same prompt refinement, instead of switching to the app.
- Find whether a message can be pushed into a running VS Code tab. Claude Code has local cross-session messaging (other sessions can message a tab, and it arrives as a notification it reads). Test whether a Servex-side Claude session, or a hook, can deliver web dictations that way.
- Fallback: a `UserPromptSubmit` hook that injects pending web dictations on the tab's next prompt (the tab's check-ins every 30 minutes count as prompts).
- Never resume the tab's session id from a second process: two writers on one transcript.

Report what works, test it once end to end, and write the result in the dictation doc.

**Stopped (the owner, 2026-10-24, later the same night):** website dictation goes straight to an SDK agent; the VS Code tab and the Claude app are no longer dictation targets. What was learned is in [core/Page/ai/doc/dictation.md](/framework/core/Page/ai/doc/dictation.md), "Why not dictate into a VS Code tab". The focus is the Debug tab, both stalls and the bubbles, made reliable.

## The owner, on the whole chain from Whisper to the bubble (2026-10-24)

- **The flicker is the bug to kill.** Press dictate and start talking: raw text flashes in, vanishes, and comes back a while later (perhaps while the LLM cleans it). "A very jarring experience."
- **The driving principle:** while dictation is on, the words appear **in place in the chat bubble, as if already sent.** No text area that the words then move out of, and no UI jumping. Put each word in the best place as soon as possible.
- **The flow:**
  1. Whisper's raw text is chunked by sentence.
  2. Each sentence goes to ONE cleaning-and-refinement step (whichever agent runs it).
  3. That produces structured content (tasks, questions, notes) through the item tool.
  4. As the prompt grows, the cards are **updated a little, never rewritten wholesale.** Nothing the owner is reading should vanish or change unasked, unless it's a real mistake or the owner asked for it.
- **Roles:** the refiner makes the data structures. Upgrading a task into a session (launching an agent) is the mastermind's call, not the refiner's.
- **Investigate the whole chain end to end** (mic → Whisper → sentences → refine → item tool → bubble). Show each stage on the Debug tab, and prove there's no flicker with a short screen recording or a burst of shots.

## Part 3: the dictation reliability and performance review (the owner, 2026-10-25, ~01:15)

**For a FRESH Opus mastermind, `mastermind-dictation-2`, which now owns ALL dictation work.** Read `plan.md`, `build/` and the merged work first. `minion-dictation-flicker` (the flicker fix) is already running: take it over as your child; don't start a second one. The voice agent's own attempt (`task-mastermind-dictate-improve`, spawned on DeepSeek Flash with no brief) has been stopped. From now on, any dictation ask from the voice agent comes here (this brief, or `module_inbox ux/Dictate`), never as a new agent.

What the owner hit tonight, all of it to fix:
1. **Slow load.** The sheet loads fast (it looks like a timestamped log), then the chat arrives many seconds later. Profile the page and the session load: count files and requests (a waterfall?), and measure time to first bubble. Make it fast, and record the numbers before and after.
2. **"This page is out of date" after a refresh,** and then nothing works. Find what shows it (ours or Chrome's), and why a refresh leaves dictation dead (the mic not released, a stale service worker or session, a socket that never reconnects).
3. **The mic sometimes won't start.**
4. **Misordered bubble:** "can you hear me now" showed as "now" first, then "can you hear me". The agent saw it fine in the log, so it's a UI ordering bug.
5. **The voice agent replies too often** to read and answer. Tune it: reply when a thought ends or when asked, not on every sentence.
6. **The Debug tab doesn't help enough:**
   - it shares space with the chat;
   - it needs a resize handle;
   - it should read like a live log (the Whisper raw text, each stage with timestamps, errors);
   - make it obvious which part is what.
7. **Then the end-to-end chain,** written as one diagram in the Dictate readme (mic → Whisper → sentence → clean/refine → item tool → bubble → agent reply), each stage with its owner file and its failure mode.

Prove each fix with shots or a short burst, including a refresh-then-dictate test, which is the owner's typical failure.

## Part 4: one chat everywhere, and the voice agent builds its session (the owner, 2026-10-25, ~01:30)

- **One chat component.** The chat in the mobile sheet (the AI button that opens dictation) and the chat tab of the session detail page are the SAME component. Dictation is wired into it, so every place a chat appears gets dictation with no extra setup. You (dictation-2) own the component; the sessions-page mastermind uses it for its chat tab, so agree the interface with it.
- **The chat shows the session, not just replies.** The voice agent's turn is more than markdown in a bubble: it uses the item tool to add tasks, child sessions and notes to its own session and refine them as the prompt continues, and the chat renders those items (cards with state), not just text. The dictate widget is effectively a global session view.
- **Messages as session items** (like tasks and sessions) may come later. Note it; don't build it now.

## Part 5 (the owner, 2026-10-25): per-sentence waking is too costly

The voice mastermind is woken on every sentence, which floods it and multiplies the tokens. Keep fast per-sentence work cheap: placing words in bubbles, and a Haiku-level refine into cards. Wake the Opus mastermind only when a thought ends (a pause), when it's asked something, or every N sentences. Measure the tokens per minute of dictation before and after.

## Part 6 (2026-10-25, ~01:55)

- **A live fix-and-test loop with the owner, through the voice mastermind.** The owner dictates in the browser; the voice mastermind passes each dictation ask straight to you (`send_to_agent mastermind-dictation-2`); you make a small fix, merge it fast, and tell the voice agent it's live; the owner tests and replies. Keep each fix small enough to merge in minutes. Reply to the voice agent's session, not only to your log.
- **Whisper process leak, found by the tab.** There were 8 `whisper-server.exe` processes, each loading the large model (up to 1.9 GB each); RAM fell to 0.4 GB free and every agent queued. Only the one on port 8178 belongs to Servex. The others were on random ports from test runs (stall and smoke harnesses?), started from `cmd.exe` and never stopped. The tab stopped the four oldest (10-23 to 10-25 00:54); 3 recent ones (01:13–01:18) were left in case a test uses them. Fix the harnesses so they reuse the 8178 server, or stop what they start, with a test that proves no whisper process outlives its test.

## Part 7: the owner's deep-investigation list (2026-10-25, ~02:05)

"Every piece of the dictation system bolted down, with clear insight into it… I need to be able to see the problem to understand the solution." The goal is dictation in the browser that never fails, so the owner can build everything live from the page.

1. **The Reconnect button** appears seemingly at random, and the last press seemed to crash the page.
   - What does it reconnect: Whisper, the socket to Servex, the agent?
   - Make it work. Make it say what it's reconnecting and why. Show it only when that link is really down.
2. **Error handling and freezes.**
   - Catch errors at every stage, and show or ignore each one deliberately.
   - The page sometimes freezes: profile it (a performance trace), don't guess.
3. **A compact Debug tab.** The status sits as a row of green or red lights at the top, so "all green = should work". Under it, a compact log, not paragraphs, with a resize handle between it and the chat (the "sheet within a sheet").
4. **The log shows each sentence's life:** Whisper's raw text, its amendments, finalized, then placed in a bubble. A summary line per record, with the raw data one click down.
5. **The misordered bubbles are a data-structure bug.** If the data is sound, rendering is right. Find whether order comes from Whisper's amend-and-finalize flow, the placement step (the AI deciding new paragraph vs same paragraph: does that still exist, and is it the right shape?) or the render. Fix it at the data.
6. **Settings, back again.** The dictation widget gets a small settings panel: the delay before sending (say 2 s; if the owner keeps talking, the words join the same prompt instead of a new one), and the other knobs. That also answers the per-sentence flood (Part 5).
7. **A Docs tab in the sheet** (AI · Debug · Docs). It shows the Dictate module's own readme and docs (`ux/Dictate`), ideally with small live demos of each stage (Whisper, placement). Answers to the owner's questions get written there, not in chat.
8. **Order of work:** get it working and solid first (items 1–5), then 6 and 7. Then the owner tries new ideas live in the browser through the voice mastermind loop (Part 6).

## Part 8: the fast + smart assistant shape, scaffold it NOW so the owner can test (the owner, 2026-10-25, ~02:10)

Run past-work on "fast assistant" and "smart assistant" first (Sessions.js fast/smart seats, the retired session-fast, voice-assistant). Much of this exists.

- **The fast assistant (Haiku) gets the per-sentence flood.**
  - It's ONE persistent session that keeps context across the whole prompt; not a fresh call per sentence.
  - Its only job is the raw Whisper text: clean each sentence (capitals, upgraded references), place it (same paragraph, a new paragraph, or a new bubble), give each prompt or topic a title, and make context cards when the owner talks about a specific thing.
  - It never answers, spawns or decides. The owner wants to watch it do this live.
- **The smart assistant (Opus, the voice mastermind) gets batches,** not sentences. The fast assistant forwards at the end of an idea, or at least every ~10–15 s (configurable in the settings panel), so the smart one stays close to the live stream without being flooded. The smart one does the real refinement: tasks, child sessions, launching agents.
- **The fast assistant is a child of the smart one,** so its cost is counted there. It lives inside the parent's session as a session instance: no folder of its own, writing into the parent's session data. Say whether that works with today's session entries (the deputy's Session entries), and do the smallest version that does.
- **Errors log themselves to the voice session.** Any disconnect, mic failure or Whisper error is written by the UI into the voice session automatically, so the owner never has to report it and the smart assistant sees it.
- **First, answer the owner in one plain paragraph in the Docs tab (or the Dictate readme):** how messages travel today (browser → Servex, by socket or HTTP?), who creates the voice session, and how fast and smart are fed.
- **The VS Code tab's Haiku refinement hook is switched OFF tonight** (pace). This browser path is the one that matters now.

## Part 9: agree the chat shape before building storage (2026-10-25)

The owner asked for the options first. Read [chat-shape.md](chat-shape.md): three shapes, Option C recommended (one `tasks` list, `Prompt` and `Question` extend Task, a reply lives on what it answers, the raw Whisper text is kept on the Prompt). Keep fixing transport bugs, but hold the fast/smart storage layer until the owner picks. If you see a better shape or a flaw, add it to chat-shape.md as Option D.
