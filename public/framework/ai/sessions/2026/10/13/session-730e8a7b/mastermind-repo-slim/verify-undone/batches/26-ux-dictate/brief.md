# Check 16 asks against the repo: ux/Dictate

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/26-ux-dictate/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `ux/Dictate`, folder `public/framework/ux/Dictate` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/ux/readme.md`, `public/framework/ux/Dictate/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/ux/Dictate/readme.md`)

# Dictate — a mic button that always shows what is happening

**Every voice and chat surface, one page** (screenshots, who answers, the flow, the 30-second first reply): [`surfaces/`](./surfaces/) · [long form](doc/surfaces.md).

**How Dictate, Refine and tasks connect** (one spoken sentence, from the mic to a task line in the page's feed): [`doc/refine-dictate-tasks.md`](doc/refine-dictate-tasks.md). **The dictation redesign, mocks first** (five ways to lay out the controls, and the pick): [the variants page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sheet/sheet-dictation-mocks/variants/index.html).

**The voice assistant** (one assistant places each sentence as you talk: same paragraph, own paragraph, own card; the plan and why the chat jumps): [`doc/voice-assistant.md`](doc/voice-assistant.md).

**`DictationBar`** (the phone sheet's one big mic that says its state, a Type button, no Send; switch back in one line): [`doc/refine-dictate-tasks.md#the-bar`](doc/refine-dictate-tasks.md).

**Talking to the mastermind from the Claude app's voice mode** (why not a browser bridge; a connector instead): [`doc/voice-bridge.md`](doc/voice-bridge.md).

State = which engine is listening and what it has heard so far, remembered between
renders — the graduation rule `Filter` and `Tags` already followed, applied to a
microphone. Built 2026-09-19 to replace `ext/Ask/mic.js`'s button, whose failures were
silent: the owner pressed 🎤, the browser's own recording light came on, and nothing
ever appeared — no error, no clue why.

**What the owner asked, merged and checked** (open first): [`doc/asks.md`](doc/asks.md); **next brief**: [`doc/next.md`](doc/next.md). **Try it on your phone** (talk, watch the five stages land on the session page): [`doc/try-it.md`](doc/try-it.md).

**Is the raw Whisper reply saved?** Yes, every reply, to the Servex `whisper-raw` log: [`audio/Whisper/doc/raw-log.md`](/framework/audio/Whisper/doc/raw-log.md).

**How fast is the first reply?** Measured hop by hop, before and after: [`doc/latency.md`](doc/latency.md).

**Class architecture of the voice UI** (which class owns what, what is a copy of what): [`doc/voice-architecture.md`](doc/voice-architecture.md). **`VoiceStrip`** is the compact panel Refine and the demo below use; **mobile**: [`doc/mobile-socket-2026-10-09.md`](doc/mobile-socket-2026-10-09.md).

**Streaming UI and context cards** (live 3-line text area, sentences moving up, reference pills, context cards; being designed in Figma): [`doc/streaming-ui.md`](doc/streaming-ui.md).

- Moved verbatim to [doc/readme-full-2026-10-12.md](./doc/readme-full-2026-10-12.md): usage, design and mechanics in full.

## Also here (readme audit, 2026-10-13)
- [playground](./playground/) — The dictation playground — a full-bleed, live diagram of a dictation session
- [surfaces](./surfaces/) — every voice and chat surface on one page
- [v1](./v1/)
- [variants](./variants/) — Dictate variants — the same mic, a different look (or, once, a different mic)
- [workspace](./workspace/)
- [MicIndicator](MicIndicator.js) — the one mic-state badge every voice surface shows

## More

- **Sentence-per-send on the shared composer** (2026-10-16): `composer({ per_sentence: true })` makes each finished sentence leave the box while the next is still heard; the Refine page uses it, this page's `chat()` keeps the default (pause mode already sends each sentence as a bubble). Proof: `ext/Refine/test/composer-flow.mjs` and a fake-mic run of this page.

- [`doc/sessions.md`](./doc/sessions.md) — one rolling voice session or many: the New session button tested, the decision (one rolling session is the direction, the button stays), and the dry-run chunker `chunk-session.mjs`
- [`doc/architecture.md`](./doc/architecture.md) — the decisions that hold today, and why


## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/26-ux-dictate/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 16 asks

1. `dd46eb9b60` (3 days old): Build permutations of dictation/transcription that simulate real-time streaming, at multiple levels.
2. `b375a44af1` (3 days old): Build a live transcribed text area of about three lines, where raw transcription streams in, chunked on sentence periods.
3. `bee388f3fb` (3 days old): Remove each finished sentence from the text area and send it off, while the next sentence is still transcribing.
4. `4b7392aa73` (3 days old): Show before/after states of the streaming UI, including half-finished vs finished sentences and each sentence's transition into the refined prompt.
5. `b5251c1c06` (3 days old): Find why dictation is routed to OpenRouter tokens, restore Claude as intended, and report the current model per dictation path.
6. `e867b6d403` (3 days old): Build one shared microphone button with a level meter, placed in the mobile rail and the refine and dictate tabs.
7. `aafb59d9fd` (3 days old): Make the sidebar and mobile sheet run the same dictation code, so desktop and mobile give the same cards, processing, refinement and actions.
8. `ef3b21a46b` (3 days old): Fix chat bubble ordering so statements appear in the order spoken.
9. `ca49025079` (3 days old): Have agents add chat cards and other contextual cards through the built-in page tools, not ad hoc.
10. `fdd8c32019` (3 days old): Keep the raw Whisper transcript as-is, then run a minimal, robust cleaning pass.
11. `1a01fda3ae` (3 days old): Test chunk boundaries: sentence as baseline, plus commas or pauses and more than four words, avoiding incomplete phrases and using a quicker trigger for long run-ons.
12. `8651dfbdb2` (3 days old): Look into the refinement system and dictate widget, and decide what lives where and how dictate and chat nest together.
13. `f2fde67139` (3 days old): Show a prioritized list of past Cloudflare work while transcribing
14. `e291bb2cf1` (3 days old): Make transcription stream in real time instead of batch, and check that it works
15. `842eb574a6` (3 days old): Stream transcription in the mobile rail sheet using Whisper
16. `6ef1b9b48e` (3 days old): Investigate how the Dictate app manages sessions and why new sessions may not appear
