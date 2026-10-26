# Chat V3 rough draft

The owner's ask (voice, 2026-10-25/26): "Do a rough draft of the V3 and plan it and build it and manage it and have it ready for me when I come back." Corrected at 17:07: keep it MVP, no per-sentence Prompts, no new data shapes, no mixing V1/V2/V3 lines; V3 is only a view over the existing `tasks` list.

1. V3 renders the session's `tasks` list (Session replay + TaskView); Prompts stay at the root in time order, raw never changed.
2. Raw Whisper words show live: light gray while moving, solid once finished; a short title and cleaned text per Prompt; replies and questions inside the Prompt.
3. Behind its own toggle beside the v2 chip, never the default. Scroll-to-bottom lock kept.
4. V1 (`ux/Dictate/chat.js`) and V2 unchanged, proved with `ux/Dictate/test/in-place.mjs`.
5. Report: what works, what is rough, open decisions (per-sentence vs append, id scheme, completion rule, groups/overlay, per-task route).

Built: [ext/Chat/v3](/framework/ext/Chat/v3/readme.md).
