# Plan: V3 shows every reply and the live words, the fast seat paused, read-aloud folded into the chat

The asks: [requirements.md](requirements.md). The facts: [../dictation-map/answers.md](../dictation-map/answers.md), [../dictation-map/plan.md](../dictation-map/plan.md). The V3 trail and the fast-seat check: [findings.md](findings.md).

## Current structure (what the build stands on)

- **The chat versions.** `ext/drawer/ChatView.js` draws two chips, `v2` and `v3`, in the ✦ sheet and the drawer. V1 (`ux/Dictate/chat.js` + `Widget.js`) **stays mounted underneath** when V2 or V3 shows, so the mic keeps recording across a switch, and V1's wire handlers (Recite included) keep running.
- **V3** (`ext/Chat/v3/ChatV3.js`) replays the session's `tasks` lines into a `core/Session`. It never reads `{chat}`, so it misses 94% of replies.
- **Replies are linkable to Prompts by code:** every smart reply `{chat}` carries `re` = the owner line's `at` (314 of 316 in v-9dvbbrn), and every owner `{chat}` line carries `prompt`.
- **The session dropdown** is `session_switcher()` in `ux/Dictate/chat.js:379`: a `drawer-ai-switch-btn` button plus `popover_menu` (`ux/Popover`).
- **Dictation settings** are the gear panel: `SETTINGS` in `ext/Chat/Mic.js`, opened by the gear in `ext/Chat/Composer.js` (and `DictationBar`'s ⚙).
- **Recite** (`audio/Recite`, `audio/Voice`, on `task/voice-recite`, being merged): one `Voice` = a Kokoro voice id + speed; the browser voice is the fallback. Its own voice menu sits in `ReciteBar`.

## Decisions

1. **V3 reads old-style replies, read-only** (map plan step 5), instead of Servex writing replies into the Prompt (step 4). It covers every past and future session with no Servex change and no restart. *Alternative:* step 4, later, once V3 is the default.
2. **Gray means "not yet final from Whisper".** The unsent draft is gray; a sentence written to the file is final, so it is solid at once. V3's 8-second "moving" gray goes. This is the owner's own rule (v-9dvbbrn, 16:26: "light gray to black reserved only for the whisper finalization").
3. **One version dropdown** (`V1 ▾`), built like the session dropdown, replaces both chips. V1 stays the default.
4. **The fast seat pauses by code:** `off` joins `voice`/`fast` and becomes the default. Its one output anyone sees beyond V1's bubble cleanup, the Question task for a "?" sentence, moves into `Sessions.say()` as code (a sentence ending in "?" files a Question). *Alternative:* keep it with only the last 10 sentences (cheaper, still a model call per sentence). Takes effect at the next Servex restart, never during a call.
5. **Voice engines:** `Voice` gets an `engine` (`KokoroEngine`, `BrowserEngine`, one class per file), so a GPU model plugs in as one more engine. Voice, speed, and a Sample button live in the dictation settings; the Recite bar keeps a short voice menu that reads the same setting.
6. **The mic ignores the read-aloud:** while Recite plays (and 1.5 s after), a finished Whisper sentence that matches the words just read (most of its words appear in the recent read text) is dropped and logged, never sent. The owner's own words still go through. Echo cancellation stays on at capture. *Alternative:* mute the transcript entirely while it speaks (simpler, but loses talk-over); one setting switches.
7. **"Switch your voice"** is a client command: an owner sentence like "switch (your|the) voice (to Bella)" changes the voice (named, else the next one), says the new name in that voice, and is still sent as a normal line.
8. **Replies meant to be heard:** `Servex/agents/session-smart.md` gains one short rule: when read-aloud is on, no tables, spell out symbols and paths. Recite also speaks a table as "a table, N rows" and drops markdown marks before rendering.

## Pieces and who builds them (one worktree, `worktree/dictation-v3`, voice-recite merged into it)

| Piece | Files (fence) | Who |
|---|---|---|
| A. V3: replies, live reply stream, markdown, gray-only-for-draft, version dropdown | `ext/Chat/v3/*`, `ext/drawer/ChatView.js`, `ext/drawer/Sheet.js` (the chip call), `ext/drawer/tabs/ai.js` (same), `ext/drawer/*.css` for the dropdown | Sonnet builder `minion-v3-view` |
| B. Recite: engines, speed, settings + Sample, voice command, echo guard, markdown-free speech | `audio/Recite/*`, `audio/Voice/*`, `ext/Chat/Mic.js` (settings rows, echo drop), `ux/Dictate/chat.js` (voice command only) | Sonnet builder `minion-recite-voice` |
| C. Fast seat off + Questions by code + reply rule | `Servex/agents/Sessions.js`, `Servex/agents/session-smart.md`, its tests | the mastermind |
| D. voice-models.md (research, measured Kokoro RAM/CPU) | `dictation-v3/voice-models/` → `audio/Recite/doc/` | `minion-voice-models` (running) |

Each new class gets its readme line and class doc in the same commit (the owner, 2026-11-01).

## Landed on michael/dev (2026-11-01, for the owner's walk)

- ✅ **Tap unlock** (057f98333): the first tap unlocks Recite's audio, so a reply that arrives from the network plays on a phone. Review: [tap-unlock/](tap-unlock/).
- ✅ **V1 reads every reply** (merge of `worktree/qf-9`): `ux/Dictate/chat.js` hands each new assistant line it draws (wire or file poll) to Recite; Recite writes one `recite` line per step to the Whisper log. Review: [recite-trace/](recite-trace/).

## Queued, in the owner's order (after the voice works on the phone)

1. ⬜ **Merge worktree/dictation-v3:** the version dropdown, V3 every reply + live reply + brighter draft + no link icon, the karaoke playhead, fast seat off.
2. ⬜ **V3 paragraphs:** a long dictated Prompt shows as one 50–75 line paragraph; break it at pauses, sentence groups and topic shifts (the gap the mic already measures before each segment, `on_level`).
3. ⬜ **Read-aloud in the dictation settings gear:** on/off, voice, speed, a Sample button (V3's toolbar gear too).
4. ⬜ **Never drop a sentence:** a failed send waits in an outbox (localStorage) and is retried in order when Servex is back; today it goes to a fallback file the phone is refused (`socket: REFUSED append from LAN peer`), so it is lost. Low urgency.
5. ⬜ **Speak from the first words:** phrase-level chunks (a clause or comma, minimum about 4–6 words) from the growing reply, audio streamed; Kokoro's prosody suffers on very short chunks, so the minimum chunk is the trade-off to measure. Goes in voice-models.md too.
6. ⬜ **Chatterbox-Turbo engine** behind `Voice`'s engine adapter; then **Servex: one voice engine loaded, idle shutdown** for it and whisper-server.
7. ⬜ **V2:** lag in live transcription; its cursor icons take too much space.
8. ⬜ **Mic level meter froze once, then recovered:** not reproduced; the Whisper log shows wire drops at the Servex restart (17:37) and dev-server restarts (17:44, 17:45), no mic revival. Watch for it.
9. ⬜ **Text prep** (`audio/Recite/doc/text-prep.md`): one step before the engine; pronunciation library.
