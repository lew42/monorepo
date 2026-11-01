# Recite: trace each read-aloud step

The owner hears no read-aloud on the real phone, though a headless phone through the tunnel gets audio from /recite/speak. To see the cause on the real phone, Recite writes one line per step (reply heard, not read because auto is off, speak asked or failed, play refused, unlocked by a tap) to the Whisper log the phone already writes to (`WhisperLog.event("recite", ...)`). One file: `public/framework/audio/Recite/Recite.js` (`trace()`).
