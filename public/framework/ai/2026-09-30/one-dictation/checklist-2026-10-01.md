# Dictation: the owner's fixes from the Dictate-page session (2026-10-01, 14:49–15:18)

The source is the session `public/framework/ux/Dictate/ai/v-6jvcrk2.jsonl` (the owner's lines verbatim). Already in flight from that session: minion-chat-duplicate-messages, minion-chat-autoscroll, minion-chat-menu-merge, minion-context-card-type. Tick each item against what actually landed.

## Plan (task-mastermind-one-dictation)

The voice session's minions edited main directly, and several had no shell, so nothing they did is proven live. The work runs in this order:

0. **Prove and commit what's there:** a headless check of each in-flight fix (1, 4, 5, 7, 8), then each committed by path. This waits for chat-menu-merge and card-threaded-replies to finish, because they are editing the same files.
1. **Merge 11, one widget (2, 3):** the demo mounts exactly what the ✦ sheet mounts; only `keep` differs. Autosend after a pause is the default and the only behaviour. The Dictate | Chat switch goes, because its Chat mode was just autosend turned off.
2. **Merge 12, the dot (7, 8):** the ✦ icon pulses with the voice, bottom right. Tap it to start or stop; it dims when off; tapping the feed starts it. It stays after the sheet closes. The start and stop sounds are proven.
3. **Merge 13, clean transcribe (6):** a "Clean" checkbox in the gear. Speech goes straight into the outgoing bubble, with no text box and no Send. It builds on clean-dictate-mode's start.
4. **Merge 14 (12, 13):** the ✓ and ? on your lines get labels, and `is_filler()` covers smart replies and a reply that starts with filler.

## The items

1. [x] **Duplicates:** on the Dictate page the fast and smart replies appeared TWICE. The ✦ sheet didn't duplicate. (minion-chat-duplicate-messages) **Proven:** one bubble each, demo and sheet, push and poll ([minion-prove](minion-prove/report.md)).
2. [x] **One widget, really:** the Dictate page and the ✦ sheet look alike but behave differently (duplicates, autosend). Same code, same behaviour. **Landed** (a474261a): the demo makes the sheet's exact `chat()` call; only `keep` differs ([shot](minion-onewidget/shots/merge-demo-1920.png)).
3. [x] **Autosend works by default,** after a reasonable pause. The owner thinks splitting "autosend" into a separate mode was a mistake. **Landed** (a474261a): the Dictate | Chat switch and the gear's "manual" are gone, a saved "manual" becomes "pause", and a spoken sentence went out with no Send press, headless.
4. [x] **Full-screen sheet:** the text area doesn't fill the space, and there's an empty gap under the buttons. **Proven:** the empty band is gone ([shot](minion-prove/shots/full-screen-sheet-400.png)).
5. [ ] **Auto-scroll with a scroll state:** stuck to the bottom by default, following new messages. Scrolling up releases it and shows a "jump to bottom" button. (minion-chat-autoscroll) **Proven:** it sticks, releases on scroll-up, and the button shows ([shot](minion-prove/shots/autoscroll-1200.png)).
6. [ ] **"Clean transcribe" mode** (a settings toggle, maybe the default): transcribe straight into the outgoing chat bubble, with no text area and no Send button. Keep today's text-area mode, which works. Possibly its own class or an extension.
7. [x] **Mic sounds:** the start and stop sounds didn't play. They're important, because the owner isn't looking at the mic. **Proven:** one start chime and one stop chime on the demo and the sheet (minion-prove), and on the phone's fallback recognizer too ([fix-android](fix-android/report.md)).
8. [ ] **The mic indicator is a small dot in the primary orange,** bottom right, that pulses with the audio level, replacing the level bars (which need a fixed height). It's unobtrusive; tap it to start or stop. When not listening, a subtle dimmed cue; tapping the feed starts it. (Session follow-ups: the ✦ AI icon shape as the dot; closing the sheet leaves just the pulsing dot.)
9. [ ] **Maximum space for the chat.** The bottom bar stays (responsive height) and can act as its own sheet. Can sheets nest? Show an example.
10. [x] **The X closes the sheet and returns to the last page;** the back button isn't needed. The owner likes this; keep it.
11. [ ] **Full-height sheet on mobile:** can Chrome's address bar hide? Test scrolling the whole page instead of a nested scroll area. Investigate, and report what works.
12. [ ] **The ✓ and ? icons on the owner's cards** (green ✓, yellow ?) are unexplained. Make them self-evident (a tooltip or a label) or remove them. And reply to a specific card, threaded. *(Threaded replies: landed and proven by minion-prove. The marks are merge 14.)*
13. [x] **The smart assistant's "Go on" loop:** fixed in `Servex/agents/session-smart.md` (93cf7400). Also extend `is_filler()` (Sessions.js) to SMART replies, and to a reply that only STARTS with filler ("Go on — …").
14. [ ] **Context cards:** a library of UI cards the assistants use to SHOW things (a page icon and name header, any content inside). (minion-context-card-type, reusing ext/Mention)
15. [x] **The 15:35 phone regression:** an "aborted" error that stopped the mic, a transcript that repeated itself, and beeping after every pause. The phone had fallen back to Chrome's own recognizer. Fixed in `ux/Dictate/Dictate.js` (merge 4ae2ddc3) and proven headless before and after ([fix-android](fix-android/report.md)).
16. [ ] **"No response requested" shown as a bubble, then gone** (15:39–15:45): draw an assistant's text only once its final reply is in, non-empty and not filler. Merge 14.
