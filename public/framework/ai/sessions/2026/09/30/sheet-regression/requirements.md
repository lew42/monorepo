# Sheet regression — the ✦ voice sheet, the Dictate Overview, the phone's mic

The owner: "the dictation system is just completely broken. What we had before was better… there's no way for me to dictate to any page", and the ✕ on the sheet seemed not to work on their phone. Later, from the Servex mastermind: web dictation hijacks the phone's microphone after an app switch.

1. Tapping ✦ shows the conversation, the mic and the live transcript first, at a usable height (up to half the screen, growing with content). The links are a small footer or behind a "More" button.
2. The ✕ closes the sheet on touch.
3. The Dictate page's Overview opens with the working mic (press 🎤, see raw, corrections and live); the four-part diagram sits below it.
4. When the page is hidden (`visibilitychange` hidden, `pagehide`), dictation pauses and fully releases the mic (every track stopped, the AudioContext closed). If it was live, it restarts when the page is visible again and says "resumed". No path (✕, navigation, error) leaves a track running.
5. Proof at 400 px in Chromium with `--unsafely-treat-insecure-origin-as-secure`: tap ✦, speak (fake stream), see text; tap ✕ and it closes. Screenshots before and after.

Files: `ext/drawer/rail.js`, `rail.css`, `readme.md`; `ux/Dictate/Dictate.js`, `capture.js`, `page.js`, `readme.md`.
