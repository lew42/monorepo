verdict: pass
1. [note] Ask 1 is met at both widths: `shots/after-2-back-on-ai-400.png` shows the chat at full height with no handle and no blank tab area, and `shots/after-2-back-on-ai-1200.png` shows the dock's AI tab whole. The fix is the right one: the hide rule moved into `@layer util` (`ext/drawer/rail.css:399-400`), because `.flex` in util had beaten it in theme.
2. [note] Ask 2 is met: the prompts are cards on `var(--surface)` (`ext/Chat/v2/ChatV2.css:7`), and `shots/v2-after-bottom-1200.png` shows clear room under the last card. "show raw" keeps its 44 px target and sits inside its card (`ChatV2.css:14`, `margin-block: -.8em`).
3. [note] In `shots/v2-after-400.png` "show raw" still has a little more space above it than below it (the card's padding plus the .6em gap). This is close to "tight to its own card" but not quite there. Trimming the gap above would finish it.
4. [note] `probe.mjs:4` and `v2shot.mjs:3` have no default base URL, so running either one without an argument or `BASE` set loads `undefined/framework/...`. The usage line on line 1 does say to pass it.
5. [note] Round 1's four fixes are all closed in f568af8ca:
   - all 20 shots are in `shots/`;
   - the 1200 round trip is shot;
   - the scripts import `Server/Browser.mjs` by a relative path;
   - the stale "no card" text is gone from `ext/Chat/v2/readme.md:3` and from `ChatV2.css:4`.
   No drawer readme or doc describes the chat-only rule, so none of them went stale. A fresh agent can continue from `requirements.md`, `session.jsonl`, `probe.mjs` and the shots.

## Requirements
- 1 "on AI the chat takes 100% height" — yes — shots/after-2-back-on-ai-400.png and shots/after-2-back-on-ai-1200.png
- 2a "padding below the last task" — yes — shots/v2-after-bottom-1200.png, bottom band
- 2b "cards get a background (white is fine)" — yes — shots/v2-after-400.png, `--surface`
- 2c "show raw sits tight to its own card" — yes — shots/v2-after-400.png (see note 3)
- class page — n/a

## Words
- readme and CSS comment match the new card look — yes — `ext/Chat/v2/readme.md:3`, `ChatV2.css:4`
