# Voice chat on "/": why the text jumps (read-only, 2026-10-19)

All three symptoms come from one thing: **the voice assistant decides where a sentence goes 10 to 17 seconds after the sentence is already on screen**, and every decision restyles or moves text that is already there. Nothing was changed; these are the fixes I would make.

## 1. The font switches from Montserrat to monospace
- **Cause:** by design. "Raw looks raw": a spoken line that is not yet settled gets `ux-dictate-raw` (muted monospace, 0.9em) in [Widget.js:305](/framework/ux/Dictate/Widget.js), styled in [Widget.css:252](/framework/ux/Dictate/Widget.css). When the placement or refinement arrives, the class comes off and the line goes back to Montserrat at full size. The size change and the different glyph widths re-wrap the paragraph, so it jumps.
- **Fix:** keep the raw look but drop the font change: mute it with `opacity` (or italics) only, in the same font and size, so settling never re-wraps a line.

## 2. Paragraphs in a bubble, several bubbles, a headline, a bubble "chopped in half"
- **Cause:** each `place` line moves a sentence that is already drawn. `same` joins it to the paragraph above. `card` pulls it into a new bubble with a `title`, which is the headline. Real example from this session:
```
17:37:34  chat   "Session directory layout"
17:37:3x  chat   next sentence joins the same bubble
17:37:51  place  17:37:34 -> card   (17 s late: bubble cut in two)
```
- **Separately,** a card with 2+ lines that gets a `summary` folds its raw lines under a summary box ([Widget.js fold()](/framework/ux/Dictate/Widget.js)). That is a second kind of headline.
- **Fix:** a `card` placement that arrives after later sentences have joined the same bubble should either move the whole tail with it, or be skipped (the decision came too late). One check in the place handler: if the placed line is no longer the last piece of its bubble, keep it where it is.

## 3. "Our deltas might not be applied properly"
- They are applied in order, but late: 27 `place` lines for 48 `chat` lines, each about 10 to 17 s behind (count from `public/ai/v-timqv56.jsonl` by a node one-liner). The fix is the same as 2: refuse to apply a late placement that would split a bubble, and later make the assistant faster (first-reply latency: [doc/latency.md](/framework/ux/Dictate/doc/latency.md)).

Background: [doc/voice-assistant.md "Why it jumps today"](/framework/ux/Dictate/doc/voice-assistant.md) already names the draft-bubble jump (fixed) and says the second jump goes away once the assistant places "only when sure (`same` by default)". This session shows `card` still fires late.
