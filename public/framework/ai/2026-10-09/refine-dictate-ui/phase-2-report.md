# Phase 2: one compact dictation panel, the voice class map, the phone answer

Brief: [`phase-2.md`](phase-2.md). The one-screen version of what landed.

- [x] **Class architecture first**: [`ux/Dictate/doc/voice-architecture.md`](/framework/ux/Dictate/doc/voice-architecture/) names every class, its job, who composes whom, which one orchestrates (the page), and which "widgets" are copies. Linked from the [Dictate readme](/framework/ux/Dictate/) and a tile on the Dictate page.
- [x] **Smallest slice, one panel**: new [`VoiceStrip`](/framework/ux/Dictate/VoiceStrip.js) (Dictate + the Connection row + the live guess, fixed size, templates `full` and `compact`). Refine and the Dictate page's demo both use it. Proof: the Refine end-to-end run passes at 1400 and 400 (buttons do not move, 0 errors); shots below.
- [x] **Compact, plain status**: the `compact` template is one sentence ("Ready. Press the mic." / "Listening." / "The microphone could not start: ...").
- [x] **Mobile socket**: answered and measured in [`mobile-socket-2026-10-09.md`](/framework/ux/Dictate/doc/mobile-socket-2026-10-09/). Whisper works from a phone address (0.1 s). The "socket" was the dev reload socket, refused off the PC on purpose. The real block is that plain `http://` on the LAN hides the mic, so it needs https (the method is the owner's choice, see `https-lan.md`).
- [x] **Errors reach the log**: a mic error is now appended to the day's error log through [`ext/ErrorLog`](/framework/ext/ErrorLog/) (deduped per page load). Installing it on every page, and phones (no dev socket), are listed as "not built" in the architecture doc.
- [ ] **The drawer uses the same panel**: not done. It touches a dozen callers in `rail.js` and `tabs/`; it is step 1 of "Not built" in the architecture doc.

Shots: [Refine, talking, 1400](voicestrip-refine-1400.png) · [Dictate demo 1400](voicestrip-dictate-1400.png) · [Dictate demo 400](voicestrip-dictate-400.png).
