# Recite: read-aloud plays on a phone

The owner (2026-11-01, voice session v-u48msei): on the phone, no read-aloud voice is heard in the chat, though the demo page's "Read it aloud" button played. Cause: a phone browser refuses sound that starts without a tap (NotAllowedError); a reply starts from the network wire. Fix: the first tap anywhere plays a silent tenth of a second on Recite's one `<audio>`, unlocking it; a reply held by that refusal then starts. One change, in `public/framework/audio/Recite/Recite.js` (`unlock_on_tap`, `Recite.SILENCE`).
