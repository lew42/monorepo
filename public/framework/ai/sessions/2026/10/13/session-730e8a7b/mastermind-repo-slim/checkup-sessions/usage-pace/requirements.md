# Usage pace meters (built by the sessions checkup)

Don't build this. You are reviewing the finished result against it.

The owner's words (2026-10-15, relayed): he likes the existing usage meters and their accuracy; do NOT clobber them. He wants a NEW variant alongside them that reflects the pace-relative view added to the text line. Early in the week with narrow bars, the pacing arrow sits near the start and the used fraction is only a few pixels, so relative usage isn't visualizable. Variants of the progress bar that show relative-to-pace usage while still conveying pace; possibly several.

Full brief: public/framework/ai/sessions/2026/10/15/voice-opus/usage-pace-meter/requirements.md

Delivered: `public/framework/ai/usage/` (page, `UsagePace.js`, css, readme), linked from `ai/page.js` children; `ai/AITask/usage.js` untouched. Check: existing meter untouched, variants A/B/C correct (ratio = percent / elapsed percent), page loads, the readme is true.
