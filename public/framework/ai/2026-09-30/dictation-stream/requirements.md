# Dictation streams into the chat

The brief given to `minion-dictation-stream`: items 1 to 6 of [the owner's words](../voice-session-v-2joydc7/owner-words.md), said by voice in session v-2joydc7. The owner calls this "fundamental to the whole experience."

1. Dictation flows freely into the chat.
2. Live Whisper transcription creates the owner's message right in the chat window, as a bubble that grows while they speak, instead of going into the text box first. Keep the text box as an option.
3. Assistant replies stream in token by token.
4. Find out why the voice-session chat bubbles still look like raw Whisper when `SETTINGS.clean` is on, and fix it.
5. The fast assistant stops sending filler ("keep going", "I'm listening", "noted"); it stays silent while the owner is still talking.
6. A real silence event, "the owner went quiet for N s", reaches the assistants, so they know when to answer. It builds on `ux/Dictate/floor.js`.

Fence: `ext/Chat/` (Mic.js, Composer.js, Chat.js, ChatPanel.js), `ext/drawer/rail.js` (session wiring only; `minion-sheet-as-page` owns its resizing and routing), `ext/Session/`, `ux/Dictate/floor.js`, and the voice-session writer `Servex/agents/Sessions.js` with its two briefs. `minion-chat-reactions` owns bubble rendering in Chat.js and Composer.js: changes there stay small and seam-shaped.

Prove it headless at phone width: a bubble growing mid-dictation, a reply streaming in.

