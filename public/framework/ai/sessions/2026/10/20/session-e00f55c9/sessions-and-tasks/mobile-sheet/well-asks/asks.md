# The owner's mobile sheet / chat well asks, verbatim

Sources (paths under `public/`):
- **V** = `ai/v-timqv56.jsonl`, the cloud-voice session of 2026-10-19 (voice sessions then lived flat in `public/ai/`, not in `ux/Dictate/ai/`). Cited as `V line N`, line numbers 1-indexed.
- **T** = `framework/ai/2026/10/20/session-e00f55c9/page.jsonl`, line 117, the owner's tab prompt of 2026-10-20 ~19:35 (essence: `framework/ux/Dictate/doc/owner-2026-10-20-dictation-first.md`).
- Not found: `framework/ux/Dictate/ai/v-*.jsonl` has nothing on the sheet after 10-17 (its sheet talk is 2026-09-30 and 10-01). `framework/ai/sessions/2026/10/19/` holds only relays and briefs. `v-4lwslx3` (10-20) has no sheet instructions: it ends at "The responsive sheet UI. So the minimized view" (`framework/ai/sessions/2026/10/20/v-4lwslx3/session.jsonl` line 53, 19:24).
- The 10-19 minion `sheet-redesign` built items 4 to 12 below in worktree qf-6 (commits `73f58d561`, `577d3356d`, unmerged). Its brief quoting these words: `framework/ai/sessions/2026/10/19/session-3db83139/task-mastermind-voice-opus/sheet-redesign/requirements.md`.

## Padding and the well

1. "the chat window has padding on its left and right, both outside and inside … the chat area itself has padding on top, which looks funny because the chat bubbles scroll kind of underneath the padding … we need to remove the top padding. We can keep the left and right padding on … the scrollable chat area itself" (V line 291, 18:02; again 292 and 298 "padded once … not padded twice", 18:03).
   - Instruction: pad left and right once, on the scrollable chat area, never on both it and its parent.
2. "also bottom padding. The chat bubbles scroll under this bottom padding … a big white, a row of white … So take off the top and bottom padding of the actual scrollable chat window" (V line 298, 18:03).
   - Instruction: the well has no top or bottom padding, so bubbles scroll under the header and footer.
3. "there's padding on the AI sheet, there's padding on the scrollable chat window, and then there's more padding on each chat bubble … whatever you're putting in those chat bubbles gets scrunched down tremendously" (V line 322, 18:07).
   - Instruction: cut the three padding layers (sheet, well, bubble) down to one, so bubble content gets the width.
4. "we remove padding from the sheet itself and put padding on the title bar, but not on the … rest of the page" (V line 334, 18:10; also 332).
   - Instruction: the sheet has no padding; only the header row is padded.
5. "full width … maybe just taking the left and right padding off of the chat area would work. The problem … there's a border to the left and right … a drop shadow … a border radius to that whole thing" (V lines 314 and 315, 18:05).
   - Instruction: with a full-width sheet, remove the side border, the shadow and the border radius, or the full-width chat will look odd.
6. "full width scrollable chat area that has left and right padding, but no top and bottom padding … like a well … should not have border radius because it's going to go from full left to full right of the device. And so the parent can't have padding" (T, ~19:35).
   - Instruction: the well is full width, padded left and right only, square, and sits in an unpadded parent.

## Header, footer, rows

7. "very top of this kind of sheet … too much top padding above [AI, new session, X] … should be cleaned up" (V line 288, 18:01).
   - Instruction: trim the empty space above the header row.
8. "you have, you know, three rows. The header, the scrollable chat area, and then the footer with the … microphone control and whatnot. And so we need that to be a little bit more compact" (T).
   - Instruction: build one layout of three rows: sticky header, scrollable well, sticky compact mic footer.
9. "a sticky header or footer or something within that sheet area … there's no need for any magical layout switching. It's just a strong layout that just works" (T).
   - Instruction: no layout that switches as you drag; one layout that only grows.
10. "The light gray background UI control panel … should kind of collapse into a very small rail or … bottom sticky footer essentially on this AI sheet … as I resize the sheet, the scrollable chat area stretches" (V line 322, 18:07).
    - Instruction: the mic panel becomes a thin sticky footer, and the well takes the stretch.
11. "the microphone icon … it's really big. It takes up a lot of space, so it needs to be shrunk. Also, there's a type button next to it, which I don't even know if that needs to be there. And … a sending and then a dot and it says one moment … stale … it takes up space and it just doesn't seem all that helpful" (V lines 298 and 303, 18:03).
    - Instruction: shrink the mic, drop or iconify Type, and remove the stale "sending… one moment" line.
12. "we want this chat window to be as small as possible, or as compact as possible" (V line 128, 17:41; mic "could be a lot smaller").
    - Instruction: keep the whole sheet compact and the mic small.
13. "a red dot that's flashing and it says listening. And then there's a progress bar … we can remove that listening bar" (V lines 303 and 309, 18:03 to 18:05).
    - Instruction: remove the listening row.
14. "the background of the microphone could be the level … raises up from the bottom as the primary color, which is now orange … some sort of transparent black … map the level … to the height from 0 to 100% of the background overlay … make that all one small row and fix the scroll bars" (V lines 309 and 327, 18:05 to 18:08).
    - Instruction: the mic button's background is the live level meter (primary fill rising from the bottom, dark translucent backdrop), in one small row.
15. "use top tabs … AI, dictation and settings could be right in the top row … the new session button would fit right after that … Maybe the AI title is a drop down. And when you click it, then you see dictation and settings" (V lines 309 and 332, 18:05 to 18:09).
    - Instruction: move the bottom tabs into an "AI ▾" menu in the header, with New session after it and ✕ at the far right.
16. "the tabs kind of disappear there … the tabs just came back … that's being triggered based on whether the sheet expands fully. Which isn't necessarily bad" (V line 327, 18:08).
    - Instruction: the tabs/menu must look the same at every sheet height (no appearing and disappearing).
17. "we want the chat area to take up more space" (V line 309, 18:05).
    - Instruction: every change above serves giving the well more room.

## Scrolling and bubbles

18. "I think we need a scroll lock, like an auto scroll to view" (V line 226, 17:54).
    - Instruction: the well auto-scrolls to the newest line, and stops if you scroll up (a scroll lock). Not built yet as far as I found.
19. "paragraphs within each chat bubble, and then … multiple chat bubbles … your message now seemed to chop the last paragraph bubble in half … our deltas might not be being applied proper" (V lines 84 and 87, 17:36).
    - Instruction: check that streamed deltas land in one bubble without splitting paragraphs.
20. "the typewriter font … goes from Montserrat … converted into typewriter font. Then … turned back into regular … the fonts are jumping all over the place" (V lines 216, 346, 360, 17:53 to 18:11).
    - Instruction: stop the font flicker (monospace, then Montserrat) while a sentence is placed; it is likely the placement system.
21. "respond in line … you can't edit the current chat bubble so that you can respond to a specific span or sentence" (V lines 269 and 273, 17:59 to 18:00).
    - Instruction: replies should quote the sentence they answer, not repeat it. This is not a sheet-layout ask.

## Down arrow, compact mode, snapping, page behind

22. "a down arrow inside of a little button … The down arrow looks like shit. The whole gray button that I don't even know what happens when you click it. It looks terrible" (T). First click also "puts the microphone on the left side, and it has like a brief description and one line in between".
    - Instruction: the down-arrow button either gets a clear job and looks like it, or goes.
23. "the page behind it kind of disappears when you open this thing. It's really strange" (T).
    - Instruction: the page behind the sheet stays visible while the sheet is open.
24. "if you resize the sheet to like 90% plus or whatever, it snaps open and kind of becomes like a full page. That actually works quite well, and I like it" (T).
    - Instruction: keep the snap-open at about 90%.
25. "I don't mind necessarily having a one line kind of minimal UI, a compact version, so that we can still browse the site … the primary mode once everything works … for now, we're debugging it … we need to open up the whole thing and see the whole wall of text" (T).
    - Instruction: the full wall of text is the default mode now; keep a one-line compact mode possible for later.
26. "Dragging up the top edge … first it kind of gets a little buggy, and then it turns into a responsive … scrollable area … It kind of glitches out" (T).
    - Instruction: the drag must not glitch at any height.

## Reconnect and diagnostics

27. "Priority would be like figure out why the thing won't reconnect" and "We should be able to attempt a reconnect via the button … whenever something fails, we might want some sort of system log … to figure out what actually is going on" (T).
    - Instruction: the button retries the connection, and every failure writes a line to a log the owner can open.
28. "Can you hear me now?" and the earlier "We seem to have lost any kind of response from anyone" (V lines 363 to 380, 18:11 to 18:12).
    - Instruction: this is the same reconnect failure seen in the 10-19 session, so use it as a repro.

## How to test

29. "when we're building a responsive UI, we need to screenshot it at different sizes … on first click … then resize it … 20 or 40 pixels at a time … and then screenshot it at every segment" (T).
    - Instruction: prove the sheet with a headless screenshot series at 400 px, one shot every 20 to 40 px of drag.

## Related, not layout

30. "Type button" and "New session": "I do have a new session button" (V line 120, 17:41); "look into … what the default setting is for whether we create a new session" (V line 280, 18:01).
    - Instruction: keep New session in the header, and check whether the default is a new session or the last one.
31. "The flashing microphone icon actually looks like an image of an icon. That's new" (V line 123, 17:41).
    - Instruction: no action; the owner is noting a change.

## Duplicates grouped

- Items 1, 2 and 3 are one rule: pad once, on the well's sides only.
- Items 8, 9 and 10 are one layout: three rows with a sticky header and footer.
- Items 13 and 14 are one change: the level meter moves into the mic and the listening row goes.
- Items 22 to 26 come from the single 19:35 prompt T.
