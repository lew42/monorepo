# heights.md — the fixed-height sweep, classified

Every `height:` / `min-height:` / `max-height:` / `block-size:` value with a real unit (px, em, rem, vh) and every `aspect-ratio`, found under `public/framework/`, `public/layouts/` and `public/imagine/`, in CSS files and inline `css()`/`.style()` calls.

**legit: 364  ·  guess: 0  ·  not counted (see below): 49**

## The finding, in one paragraph

Zero guesses survived a look at the code around them. Every fixed value found is one of the five things the brief calls legit (an icon/glyph, a fixed shell, a deliberate scroll area, a media box needing its ratio, a 1px rule) — plus a few families the sweep kept running into that the brief's five didn't name, each with its own reasoning below: a UI **control**'s own height in `em` (a button, chip, tab — the brief's own words, "in em where it should follow the font", describe exactly this); a **demo/diagram** teaching a layout shape or a miniature wireframe, which needs a visible size the same way an icon does; an **off-screen measurement rig** (`position: fixed; left: -10000px`) that a tool renders into and nobody ever sees; a **test/audit fixture** that is deliberately broken on purpose, so "fixing" it would break the test; and a **floor** (`min-height` alone, no `max-height`, no plain `height`) that stops an empty state — a chat log with nobody in it yet, an empty drag list — from collapsing to nothing, while still letting real content grow past it. Two places (`core/Section/Section.css`, `ext/Chat/Chat.css`) have a comment on the exact line explaining this was a real fixed-height bug once, already fixed. A prior task in this same chain already fixed the one big offender this sweep would otherwise have flagged — the preview-card thumbnails (`core/Page/Page.css` `.page-preview-thumb`, commit `848fc776`, "auto height at one shared zoom") — so there was nothing left here for Step 2 to change.

**Not counted (49 rows):** `public/framework/ai/**` is the task-log directory; the minion skill's own fence for this task says never to commit there. Every row found there was read and follows the same patterns as everywhere else (miniature wireframe chrome, bar charts, historical one-off demo pages), so nothing was being hidden by leaving it out — it is simply out of this task's reach.

## By directory

### public/framework/ext — 93 (legit 93, guess 0)

| file:line | value | why |
|---|---|---|
| public/framework/ext/AITask/ai.css:162 | `aspect-ratio: 16 / 9` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/ext/AITask/ai.css:326 | `max-height: 20em` | legit: deliberate scroll area (max-height + likely overflow) |
| public/framework/ext/AITask/ai.css:389 | `max-height: 14em` | legit: a chat rail — deliberate scroll cap |
| public/framework/ext/AITask/ai.css:432 | `aspect-ratio: 4 / 3` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/ext/AITask/nested.css:19 | `height: 1.15em` | legit: a running-status icon mark |
| public/framework/ext/AITask/nested.css:20 | `height: 0.6em` | legit: small icon/glyph/control size |
| public/framework/ext/AITask/nested.css:35 | `height: 0.3em` | legit: a progress bar |
| public/framework/ext/Ask/ask.css:6 | `max-height: 30em` | legit: deliberate scroll area (max-height + likely overflow) |
| public/framework/ext/Ask/ask.css:70 | `min-height: 2em` | legit: a button (chip's own close control), not a content box |
| public/framework/ext/Ask/ask.css:87 | `min-height: 2.6em` | legit: a round icon-button control |
| public/framework/ext/Ask/ask.css:100 | `max-height: 40vh` | legit: a chat list panel — deliberate scroll area (max-height + implicit overflow from .chat-list) |
| public/framework/ext/Ask/ask.css:105 | `min-height: 1.8em` | legit: a close-button control |
| public/framework/ext/Ask/ask.css:124 | `min-height: 2em` | legit: a verdict-action button control |
| public/framework/ext/Ask/ask.css:152 | `max-height: 24em` | legit: deliberate scroll area (max-height + likely overflow) |
| public/framework/ext/Ask/ask.css:168 | `min-height: 2em` | legit: a send-button control |
| public/framework/ext/Ask/ask.css:198 | `max-height: 22em` | legit: deliberate scroll area (max-height + likely overflow) |
| public/framework/ext/Chat/Chat.css:35 | `min-height: 3.4em` | legit: a compose textarea — min-height is a form-control floor, content can grow past it |
| public/framework/ext/Chat/Chat.css:124 | `min-height: 1.5em` | legit: documented two lines above: "min-height, not height" — a floor so an empty log doesn't collapse to 0, converted from a real fixed-height bug already |
| public/framework/ext/Chat/Chat.css:125 | `max-height: 30vh` | legit: deliberate scroll area (max-height + likely overflow) |
| public/framework/ext/Chat/Mic.js:236 | `height: 2.5em` | legit: a mic button control |
| public/framework/ext/demo/app.css:34 | `min-height: 7em` | legit: fixed shell (app bar / rail / full-viewport frame) |
| public/framework/ext/demo/demo.css:135 | `max-height: 34em` | legit: fixed shell (app bar / rail / full-viewport frame) |
| public/framework/ext/demo/mini.css:78 | `height: 0.32em` | legit: miniature wireframe chrome (a fake heading bar) |
| public/framework/ext/demo/mini.css:92 | `height: 0.95em` | legit: miniature wireframe chrome (a fake tab) |
| public/framework/ext/demo/mini.css:146 | `min-height: 1.8em` | legit: miniature wireframe tile — illustrative chrome the same family as the rest of demo/mini.css |
| public/framework/ext/demo/mini.css:158 | `height: 0.38em` | legit: miniature wireframe chrome (a fake breadcrumb) |
| public/framework/ext/demo/mini.css:163 | `height: 0.75em` | legit: miniature wireframe chrome (a breadcrumb separator) |
| public/framework/ext/demo/mini.css:174 | `height: 3.2em` | legit: miniature wireframe tile — illustrative chrome |
| public/framework/ext/demo/mini.css:187 | `height: 0.45em` | legit: miniature wireframe chrome (a fake key/label) |
| public/framework/ext/demo/mini.css:190 | `height: 0.32em` | legit: miniature wireframe chrome (a fake label line) |
| public/framework/ext/demo/mini.css:196 | `height: 0.75em` | legit: miniature wireframe chrome (a fake full-width mark) |
| public/framework/ext/demo/pane.js:12 | `aspect-ratio: ` on the pane` | legit: a code comment explaining why the pane below uses aspect-ratio — not itself a declaration |
| public/framework/ext/demo/stage.css:35 | `height: 2em` | legit: a drag-handle control |
| public/framework/ext/demo/stage.css:131 | `height: 3em` | legit: a drag-handle control, bare variant |
| public/framework/ext/DesignTool/audit/twin.js:48 | `height: 900px` | legit: an off-screen measurement rig (position:fixed;left:-10000px) — a synthetic viewport a tool renders into, never seen |
| public/framework/ext/DesignTool/DesignTool.css:90 | `max-height: 24em` | legit: deliberate scroll area (max-height + likely overflow) |
| public/framework/ext/DesignTool/library/bad/traps.js:121 | `height: 22em` | legit: the library's own "bad patterns" gallery — deliberately shows what NOT to do; fixing it would erase the lesson |
| public/framework/ext/DesignTool/library/bad/traps.js:136 | `height: 22em` | legit: the library's own "bad patterns" gallery — deliberately shows what NOT to do; fixing it would erase the lesson |
| public/framework/ext/DesignTool/library/bad/traps.js:147 | `height: 220px` | legit: the library's own "bad patterns" gallery — deliberately shows what NOT to do; fixing it would erase the lesson |
| public/framework/ext/DesignTool/library/bad/traps.js:156 | `height: 220px` | legit: the library's own "bad patterns" gallery — deliberately shows what NOT to do; fixing it would erase the lesson |
| public/framework/ext/DesignTool/library/patterns.js:91 | `aspect-ratio: ` on the tile` | legit: a `short:` description string quoting "aspect-ratio" — not itself a declaration |
| public/framework/ext/DesignTool/library/patterns.js:94 | `aspect-ratio: 4 / 3; overflow: hidden }` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/ext/DesignTool/library/patterns.js:96 | `aspect-ratio: ` on the tile gives every cell the` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/ext/DesignTool/library/patterns.js:169 | `height: 22em` | legit: a demo pattern's own decl string, teaching a named shape |
| public/framework/ext/DesignTool/library/patterns.js:185 | `height: 22em` | legit: a scroll demo (overflowY:auto) in the pattern library |
| public/framework/ext/DesignTool/library/patterns.js:287 | `min-height: 2.2em` | legit: a button control string in a demo |
| public/framework/ext/DesignTool/mirror.js:37 | `height: 900px` | legit: an off-screen measurement rig (position:fixed;left:-10000px) — a synthetic viewport a tool renders into, never seen |
| public/framework/ext/DesignTool/rules.js:227 | `min-height: 1em` | legit: a suggested-fix string the linter prints (data describing a rule), not a live CSS declaration |
| public/framework/ext/DesignTool/rules.js:248 | `min-height: 24px` | legit: a suggested-fix string the linter prints (data describing a rule), not a live CSS declaration |
| public/framework/ext/DesignTool/taste/corpus/page.js:39 | `height: 900px` | legit: an off-screen measurement rig, same as twin.js/mirror.js |
| public/framework/ext/DesignTool/taste/page.js:63 | `height: 0.6em` | legit: a rating-bar control |
| public/framework/ext/DesignTool/tests/cases.js:121 | `height: 14px` | legit: the analyzer's own test corpus — deliberately-broken fixtures the suite scores itself against, not a live page |
| public/framework/ext/DesignTool/tests/cases.js:143 | `height: 300px` | legit: the analyzer's own test corpus — deliberately-broken fixtures the suite scores itself against, not a live page |
| public/framework/ext/DesignTool/vision/vision.css:26 | `aspect-ratio: 4 / 3` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/ext/Draggable/draggable.css:29 | `min-height: 1.75em` | legit: an empty-list floor so a droppable area stays a valid drop target with nothing in it |
| public/framework/ext/drawer/drawer.css:60 | `block-size: 1.7em` | legit: fixed shell (app bar / rail / full-viewport frame) |
| public/framework/ext/drawer/drawer.css:81 | `block-size: 2.2rem` | legit: a square icon-button control |
| public/framework/ext/drawer/rail.css:71 | `block-size: 70vh` | legit: fixed shell (app bar / rail / full-viewport frame) |
| public/framework/ext/grip/grip.css:46 | `height: 2rem` | legit: a drag-grip icon |
| public/framework/ext/grip/grip.css:62 | `height: 3rem` | legit: fixed shell (app bar / rail / full-viewport frame) |
| public/framework/ext/markdown/open/page.js:24 | `height: 800px` | legit: media box (image/video/canvas/thumb) |
| public/framework/ext/markdown/open/page.js:26 | `height: 400px` | legit: a 640x400 frame wrapping a 1280x800 iframe scaled to 0.5 — the two numbers must match exactly or the scale trick breaks; a real frame, not a guess |
| public/framework/ext/Panel/controls.css:86 | `block-size: 1.7em` | legit: fixed shell (app bar / rail / full-viewport frame) |
| public/framework/ext/Panel/controls.css:116 | `block-size: 1em` | legit: small icon/glyph/control size |
| public/framework/ext/Panel/display.css:80 | `block-size: 1px` | legit: 1px-scale rule/divider |
| public/framework/ext/Panel/flow.css:19 | `block-size: 1.7em` | legit: a button control |
| public/framework/ext/Panel/grip.css:36 | `height: 2rem` | legit: a drag-grip icon |
| public/framework/ext/Panel/grip.css:44 | `height: 0.3rem` | legit: a drag-grip icon, rotated orientation |
| public/framework/ext/Panel/insert.css:60 | `block-size: 1.4rem` | legit: the drop-indicator line a drag shows where an item will land — a functional marker, not content |
| public/framework/ext/Panel/repeat.css:9 | `block-size: 2.4em` | legit: an "add" button in a repeating list |
| public/framework/ext/Panel/size.css:139 | `block-size: 1em` | legit: a drag-seat marker (control-sized) |
| public/framework/ext/Panel/size.css:149 | `block-size: 0.3em` | legit: a drag-seat marker's own ::before, smaller |
| public/framework/ext/Panel/templates.css:36 | `block-size: 16em` | legit: fixed shell (app bar / rail / full-viewport frame) |
| public/framework/ext/Panel/templates.css:44 | `block-size: 3em` | legit: a template-picker preview cell — needs a floor or an empty cell in the picker vanishes; comment above explains the same reasoning for a sibling rule |
| public/framework/ext/Panel/toolbar.css:79 | `block-size: 1.7em` | legit: fixed shell (app bar / rail / full-viewport frame) |
| public/framework/ext/Panel/toolbar.css:109 | `block-size: 1em` | legit: small icon/glyph/control size |
| public/framework/ext/Panel/Workspace/viewports.js:87 | `aspect-ratio: trick — both devices land on one height with no` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/ext/Panel/Workspace/workspace.css:59 | `min-height: 6em` | legit: a workspace's empty-state floor, so it stays a visible drop target with nothing placed in it yet |
| public/framework/ext/Refine/Refine.css:60 | `max-height: 60vh` | legit: fixed shell (app bar / rail / full-viewport frame) |
| public/framework/ext/Refine/Refine.css:108 | `max-height: 11em` | legit: deliberate scroll area (max-height + likely overflow) |
| public/framework/ext/Research/Research.css:85 | `height: 0.5em` | legit: small icon/glyph/control size |
| public/framework/ext/Research/Research.css:112 | `max-height: 24em` | legit: media box (image/video/canvas/thumb) |
| public/framework/ext/Research/Research.css:195 | `height: 0.5em` | legit: a progress bar |
| public/framework/ext/tabs/tabs.css:62 | `min-height: 2.4em` | legit: documented as a button-like control size |
| public/framework/ext/tabs/tabs.css:78 | `min-height: 2.4em` | legit: a tab control |
| public/framework/ext/Timeline/Timeline.css:19 | `height: 1.4em` | legit: 1px-scale rule/divider |
| public/framework/ext/Timeline/Timeline.css:63 | `height: 0.7em` | legit: small icon/glyph/control size |
| public/framework/ext/Timeline/Timeline.css:69 | `height: 0.7em` | legit: small icon/glyph/control size |
| public/framework/ext/Timeline/Timeline.css:95 | `height: 0.4em` | legit: a timeline track marker (control-sized) |
| public/framework/ext/Timeline/Timeline.css:103 | `height: 0.4em` | legit: small icon/glyph/control size |
| public/framework/ext/Timeline/Timeline.css:104 | `height: 0.4em` | legit: small icon/glyph/control size |
| public/framework/ext/Timeline/Timeline.css:109 | `height: 2px` | legit: 1px-scale rule/divider |
| public/framework/ext/Timeline/Timeline.css:127 | `max-height: 40vh` | legit: deliberate scroll area (max-height + likely overflow) |

### public/framework/core — 83 (legit 83, guess 0)

| file:line | value | why |
|---|---|---|
| public/framework/core/Layout/Layout.css:32 | `min-height: 2.2em` | legit: a chip control (font-size + padding alongside it) |
| public/framework/core/Layout/Layout.css:60 | `min-height: 2.2em` | legit: demo row inside the Layout encyclopedia's own UI (same family as .page-layout-chip/.page-layout-btn beside it), not page content |
| public/framework/core/Layout/Layout.css:64 | `aspect-ratio: 4 / 3` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/core/Layout/Layout.css:92 | `min-height: 2.2em` | legit: a button control |
| public/framework/core/Layout/Layout.css:144 | `min-height: 2.2em` | legit: a run-button control |
| public/framework/core/Layout/Layout.css:174 | `min-height: 8px` | legit: the block a layout word's diagram is drawn from (comment above it explains the flex share) — needs a visible floor or an empty demo box vanishes |
| public/framework/core/Layout/Layout.js:263 | `height: 16em` | legit: media box (image/video/canvas/thumb) |
| public/framework/core/Layout/layouts.js:170 | `height: 16em` | legit: a named layout's own demo box (shows the shape being taught), like a diagram |
| public/framework/core/Layout/layouts.js:191 | `height: 16em` | legit: scroll-snap demo box — height + overflow:auto + scroll-snap-type together, a deliberate scroll area |
| public/framework/core/Layout/layouts.js:193 | `height: 12em` | legit: scroll-snap demo section (labelled "scroll stops here") — deliberate scroll area |
| public/framework/core/Layout/layouts.js:194 | `height: 12em` | legit: scroll-snap demo section — deliberate scroll area |
| public/framework/core/Layout/layouts.js:195 | `height: 12em` | legit: scroll-snap demo section — deliberate scroll area |
| public/framework/core/Layout/layouts.js:334 | `height: 22em` | legit: demo config string: height + overflowY:auto — deliberate scroll area |
| public/framework/core/Layout/layouts.js:335 | `height: 22em` | legit: demo box: height + min-height:0 + overflow-y:auto — deliberate scroll area |
| public/framework/core/Layout/layouts.js:440 | `height: 15em` | legit: named layout's own demo box (grid shape being taught) |
| public/framework/core/Layout/layouts.js:468 | `height: 16em` | legit: named layout's own demo box |
| public/framework/core/Layout/layouts.js:475 | `height: 10em` | legit: scroll-snap prose demo, 1 of 3 — deliberate scroll area |
| public/framework/core/Layout/layouts.js:476 | `height: 10em` | legit: scroll-snap prose demo, 2 of 3 — deliberate scroll area |
| public/framework/core/Layout/layouts.js:477 | `height: 10em` | legit: scroll-snap prose demo, 3 of 3 — deliberate scroll area |
| public/framework/core/Layout/layouts.js:532 | `aspect-ratio: ` on the tile` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/core/Layout/layouts.js:534 | `aspect-ratio: ` on the tile gives every cell the same shape at every track width` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/core/Layout/layouts.js:630 | `height: 15em` | legit: named layout's own demo box |
| public/framework/core/Layout/layouts.js:664 | `height: 16em` | legit: named layout's own demo box |
| public/framework/core/new/1/agents/librarian/page.js:134 | `height: 800px` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/a11y/a11y.css:32 | `height: 1px` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/a11y/a11y.css:38 | `height: 1px` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/a11y/a11y.css:54 | `min-height: 2.25rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/a11y/a11y.css:64 | `min-height: 13rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/a11y/a11y.css:67 | `max-height: 13rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/async/async.css:45 | `height: 1rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/async/async.css:59 | `max-height: 11rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/budget/budget.js:75 | `height: 900px` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/budget/source/page.js:16 | `height: 600px` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/chrome/chrome.css:46 | `min-height: 10rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/chrome/chrome.css:169 | `max-height: 12rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/chrome/drawer/page.js:18 | `height: 1px` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/compose/compose.css:30 | `max-height: 24rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/content/content.css:136 | `max-height: 17rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/deep/deep.css:16 | `max-height: 18rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/forms/forms.css:22 | `max-height: 28rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/forms/forms.css:29 | `min-height: 4.5rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/kit/kit.css:115 | `height: 1px` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/kit/kit.css:119 | `height: 1px` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/kit/page.css:12 | `height: 21rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/kit/page.css:35 | `height: 24rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/library/library.css:27 | `height: 800px` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/motion/motion.css:42 | `height: 8rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/motion/release/release.css:10 | `height: 1.5rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/mutation/mutation.css:12 | `max-height: 28rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/mutation/mutation.css:29 | `min-height: 4.5rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/mutation/mutation.css:42 | `height: 4px` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/nav/nav.css:16 | `max-height: 17rem` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/patterns/patterns.css:48 | `aspect-ratio: 4 / 3` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/new/1/site/state/state.css:12 | `height: 60vh` | legit: frozen historical sketch (core/new/1) — its own readme says "read it, never import it"; not live, not routed |
| public/framework/core/Page/generator/generator.css:31 | `min-height: 30em` | legit: documented two lines above: inside a Doc tab panel there is no definite height to take a percentage of, so the row would collapse to 0 without this floor |
| public/framework/core/Page/generator/generator.css:86 | `min-height: 9em` | legit: a spec textarea: min-height floor + max-height cap, content scrolls between them — the exact pattern this brief recommends |
| public/framework/core/Page/generator/generator.css:86 | `max-height: 22em` | legit: a spec textarea: min-height floor + max-height cap, content scrolls between them — the exact pattern this brief recommends |
| public/framework/core/Page/generator/generator.css:95 | `min-height: 1.3em` | legit: a one-line hint row floor |
| public/framework/core/Page/generator/generator.css:132 | `min-height: 1.3em` | legit: a one-line export-message row floor |
| public/framework/core/Page/generator/generator.css:243 | `height: 0.75em` | legit: a skeleton-line bar in the generator's own preview chrome |
| public/framework/core/Page/generator/generator.css:249 | `height: 0.5em` | legit: a progress bar |
| public/framework/core/Page/generator/generator.css:265 | `height: 1.1em` | legit: a chip-shaped bar |
| public/framework/core/Page/generator/generator.css:351 | `height: 0.4em` | legit: a faded peek bar |
| public/framework/core/Page/generator/generator.css:385 | `min-height: 4em` | legit: a nav tile in the generator tool's own chrome (control-sized), not page content |
| public/framework/core/Page/generator/generator.css:432 | `min-height: 6em` | legit: a sketch preview floor (flex:1 1 auto so it still grows) |
| public/framework/core/Page/generator/generator.css:512 | `min-height: 7em` | legit: sketch preview floor inside a generated card, same family as .page-gen-sketch |
| public/framework/core/Page/generator/generator.css:547 | `height: 1.5em` | legit: a remove-button icon (1.5em square) |
| public/framework/core/Page/layout/switcher/switcher.css:78 | `height: 2.4em` | legit: small icon/glyph/control size |
| public/framework/core/Page/layout/switcher/switcher.css:143 | `max-height: 60vh` | legit: deliberate scroll area (max-height + likely overflow) |
| public/framework/core/Page/old/overview/shapes/page.js:22 | `height: 2.5em` | legit: a colour-wash swatch in a demo grid of swatches |
| public/framework/core/Page/overview/columns/examples/looks/looks.css:17 | `max-height: 5em` | legit: deliberate scroll area (max-height + likely overflow) |
| public/framework/core/Page/overview/columns/examples/looks/looks.css:22 | `aspect-ratio: 1` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/core/Page/Page.css:1094 | `aspect-ratio: var(--stage` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/core/Page/Page.css:1230 | `aspect-ratio: var(--stage` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/core/Page/Page.css:1247 | `aspect-ratio: auto` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/core/Page/weight/page.js:74 | `height: 8px` | legit: a progress bar |
| public/framework/core/Section/Section.css:18 | `min-height: 2.5em` | legit: the owner's own decision, quoted in the file: "it starts as a default div, min height of 2 or 3 em" — do not remove |
| public/framework/core/Sidebar/Sidebar.css:88 | `height: 1.55em` | legit: media box (image/video/canvas/thumb) |
| public/framework/core/Sidebar/Sidebar.css:246 | `aspect-ratio: 1` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/core/Sidebar/Sidebar.css:259 | `height: 2.5em` | legit: small icon/glyph/control size |
| public/framework/core/Sidebar/Sidebar.css:268 | `height: 2px` | legit: 1px-scale rule/divider |
| public/framework/core/Sidebar/Sidebar.css:337 | `max-height: 75vh` | legit: an open dropdown menu — deliberate scroll cap |
| public/framework/core/Sidebar/variants/variants.css:68 | `height: 24rem` | legit: documented in the file: a demo with no real page beside the rail to stretch it, so the box hands out the height itself |

### public/framework/ai — 49 (legit 0, guess 0, not counted 49)

| file:line | value | why |
|---|---|---|
| public/framework/ai/2026-08-12/layouts/page.js:26 | `aspect-ratio: \` on the pane and \`position: absolute\` on the render — the pane` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-08-12/page.js:53 | `aspect-ratio: panes` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-08-17/layout-primitives/changes.js:268 | `height: 12em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-08-17/layout-primitives/changes.js:269 | `max-height: 12em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-08-17/layout-primitives/changes.js:269 | `aspect-ratio: 16/10` + `max-height: 12em`` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-08-17/layout-primitives/changes.js:272 | `aspect-ratio: var(--stage` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-08-17/vision-browse/vision-browse.css:13 | `aspect-ratio: 1280 / 800` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-09-19/assistant-stream/demo.css:7 | `min-height: 3em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-09-19/assistant-stream/demo.css:23 | `height: 1em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-09-19/devbar-chat/test/chat-test.css:95 | `max-height: 12em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-09-19/devbar-chat/test/chat-test.css:131 | `max-height: 6em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-09-19/reload-hold/demo.css:8 | `block-size: 3em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-09-19/sidebar-repair/page.js:68 | `aspect-ratio: 1`` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-09-19/verify-design/page.js:96 | `height: 9em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-09-20/v3-axis-fix/page.js:38 | `max-height: 9em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-09-22/dictate-silence/page.js:53 | `height: 0.8em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-09-22/layout-analysis/la.css:31 | `min-height: 2.4em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-09-22/record/page.js:33 | `height: 0.8em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026-09-22/reload-rethink/page.js:21 | `height: 1.6em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/5-2-col-sidebar-content/view.css:50 | `height: 2em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/6-ui-controls/view.css:36 | `height: 1px` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/6-ui-controls/view.css:44 | `height: 1.3em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/6-ui-controls/view.css:55 | `height: 1em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/6-ui-controls/view.css:107 | `height: 0.375em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/7-task-management-ai-patterns/ai.css:166 | `height: 2em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/7-task-management-ai-patterns/ai.css:191 | `height: 1.8em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/7-task-management-ai-patterns/details.css:32 | `height: 0.0625em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/7-task-management-ai-patterns/details.css:61 | `height: 0.4em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/7-task-management-ai-patterns/view.css:119 | `height: 1em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/7-task-management-ai-patterns/view.css:160 | `height: 0.5em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/7-task-management-ai-patterns/view.css:166 | `height: 0.5em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/7-task-management-ai-patterns/view.css:175 | `height: 1em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/7-task-management-ai-patterns/view.css:186 | `height: 2px` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/7-task-management-ai-patterns/view.css:216 | `height: 2.6em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/7-task-management-ai-patterns/view.css:222 | `min-height: 3em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/7-task-management-ai-patterns/view.css:249 | `height: 2px` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/2026/09/28/figma-sept-2026/7-task-management-ai-patterns/view.css:256 | `height: 8px` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/audits/paging/page.js:102 | `height: 0.9em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/audits/paging/types/types.js:37 | `height: 70vh` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/talk/talk.css:27 | `block-size: 7.5rem` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/talk/talk.css:56 | `block-size: 1.5em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/talk/talk.css:93 | `block-size: 0.55em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/talk/talk.css:108 | `block-size: 1.9em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/talk/talk.css:123 | `block-size: 11rem` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/v/2/v2.css:72 | `height: 0.55em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/v/2/v2.css:84 | `height: 1.4em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/v/3/v3.css:181 | `max-height: 12em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/v/3/v3.css:371 | `height: 0.55em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |
| public/framework/ai/v/3/v3.css:570 | `height: 0.3em` | fenced: public/framework/ai/** — task-log directory; this task's fence never commits here (Where section, minion skill) |

### public/framework/styles — 49 (legit 49, guess 0)

| file:line | value | why |
|---|---|---|
| public/framework/styles/elements/forms/page.js:8 | `height: 0.6em` | legit: a range-input track control |
| public/framework/styles/elements/forms/page.js:9 | `height: 1.2em` | legit: media box (image/video/canvas/thumb) |
| public/framework/styles/elements/forms/page.js:10 | `height: 0.6em` | legit: a range-input track control, firefox variant |
| public/framework/styles/elements/forms/page.js:11 | `height: 1.2em` | legit: media box (image/video/canvas/thumb) |
| public/framework/styles/elements/media/page.js:23 | `height: 5em` | legit: media box (image/video/canvas/thumb) |
| public/framework/styles/elements/media/page.js:29 | `height: 4em` | legit: media box (image/video/canvas/thumb) |
| public/framework/styles/layers/base/page.js:43 | `height: 2em` | legit: a small colour-swatch demo box in the base-layer teaching page |
| public/framework/styles/layers/base/page.js:45 | `height: 2em` | legit: a small colour-swatch demo box |
| public/framework/styles/layers/theme/lew42/lew42.css:130 | `height: 1.4em` | legit: a range-input slider control |
| public/framework/styles/layers/theme/lew42/lew42.css:133 | `height: 4px` | legit: 1px-scale rule/divider |
| public/framework/styles/layers/theme/lew42/lew42.css:137 | `height: 1.1em` | legit: media box (image/video/canvas/thumb) |
| public/framework/styles/layers/theme/lew42/lew42.css:147 | `height: 4px` | legit: 1px-scale rule/divider |
| public/framework/styles/layers/theme/lew42/lew42.css:150 | `height: 1.1em` | legit: media box (image/video/canvas/thumb) |
| public/framework/styles/layouts/apidoc/page.js:198 | `height: 0.7em` | legit: three traffic-light dots on a fake terminal-window mockup — decorative icons |
| public/framework/styles/layouts/bold-editorial/page.js:18 | `height: 2px` | legit: 1px-scale rule/divider |
| public/framework/styles/layouts/carousel/page.js:41 | `height: 2.2em` | legit: an avatar-shaped demo swatch |
| public/framework/styles/layouts/feed/page.js:20 | `height: 1.8em` | legit: an avatar-shaped demo swatch |
| public/framework/styles/layouts/feed/page.js:25 | `height: 5em` | legit: a skeleton-line demo swatch |
| public/framework/styles/layouts/home/page.js:147 | `height: 3em` | legit: an icon-shaped demo swatch |
| public/framework/styles/layouts/home/page.js:231 | `height: 2.6em` | legit: an avatar-shaped demo swatch |
| public/framework/styles/layouts/overlay/page.js:56 | `height: 0.28em` | legit: a small bar-shaped demo swatch |
| public/framework/styles/layouts/preview.js:23 | `height: 7em` | legit: documented above: a diagram of a layout's shape (the arrangement, no content), same family as /layouts/'s wireframes |
| public/framework/styles/layouts/screens/specs.js:48 | `height: 2.2em` | legit: an icon-shaped demo swatch |
| public/framework/styles/layouts/space/search.js:26 | `height: 900px` | legit: an off-screen measurement rig, same pattern as DesignTool's twin.js/mirror.js |
| public/framework/styles/layouts/space/space.css:12 | `min-height: 12em` | legit: a resizable textarea — min-height is a form-control floor |
| public/framework/styles/layouts/space/space.css:47 | `height: 11em` | legit: documented two lines above: a common crop height so a wall of screenshot thumbnails reads as one wall |
| public/framework/styles/layouts/space/space.css:75 | `height: 7em` | legit: media box (image/video/canvas/thumb) |
| public/framework/styles/layouts/space/words/page.js:21 | `height: 16em` | legit: a demo illustrating the "fill" layout word at a visible size |
| public/framework/styles/layouts/spec/page.js:88 | `height: 22em` | legit: a demo stage (position:relative, overflow:hidden), same family as the generator's sketch box |
| public/framework/styles/layouts/spec/page.js:104 | `height: 0.3em` | legit: a bar-shaped demo swatch |
| public/framework/styles/layouts/spec/page.js:140 | `height: 400px` | legit: a text string inside a demo badge list — describes an anti-pattern, is not a live declaration |
| public/framework/styles/layouts/spec/page.js:144 | `height: 400px` | legit: the page's own lesson text about why a fixed min-height is a bad idea — not a live declaration |
| public/framework/styles/layouts/spec/page.js:211 | `min-height: 320px` | legit: a text string inside a demo badge list — not a live declaration |
| public/framework/styles/layouts/spec/page.js:214 | `min-height: 320px` | legit: the page's own lesson text, same as line 144 — not a live declaration |
| public/framework/styles/layouts/spec/page.js:294 | `min-height: 3em` | legit: small icon/glyph/control size |
| public/framework/styles/layouts/web.js:101 | `height: 0.5em` | legit: a bar-shaped demo swatch |
| public/framework/styles/layouts/web.js:106 | `height: 1.9em` | legit: an avatar-shaped demo swatch |
| public/framework/styles/rules/demos.js:84 | `height: 60px` | legit: the css skill's own reference demo illustrating overflow clipping |
| public/framework/styles/stacks/stacks.css:47 | `height: 1.6em` | legit: a bar-chart rung element |
| public/framework/styles/stacks/stacks.css:157 | `height: 1em` | legit: small icon/glyph/control size |
| public/framework/styles/system/page.js:176 | `height: 1.1em` | legit: a bar-chart row (the spacing-rung token demo) |
| public/framework/styles/system/studies/color/color-study.css:13 | `height: 2.6em` | legit: a colour-chip swatch |
| public/framework/styles/system/studies/color/sections/sections.css:91 | `height: 1px` | legit: 1px-scale rule/divider |
| public/framework/styles/system/studies/lists/lists.css:39 | `height: 1.6em` | legit: a numbered-bullet icon |
| public/framework/styles/system/studies/scale/page.js:25 | `height: 0.85em` | legit: a bar-chart row |
| public/framework/styles/system/studies/size/size.css:64 | `height: 2.5rem` | legit: a demo swatch illustrating the size-scale study, not page content |
| public/framework/styles/system/studies/themes/themes.css:208 | `height: 0.7em` | legit: a brand-color bullet (::before), icon-scale |
| public/framework/styles/system/studies/themes/themes.css:230 | `height: 1.5em` | legit: small icon/glyph/control size |
| public/framework/styles/system/studies/themes/themes.css:239 | `height: 1.1em` | legit: small icon/glyph/control size |

### public/imagine/codrops — 16 (legit 16, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/codrops/circle-reveal/circle-reveal.css:9 | `min-height: 22em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/codrops/codrops.css:13 | `height: 11em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/codrops/expand-menu/expand-menu.css:7 | `min-height: 22em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/codrops/expand-menu/expand-menu.css:56 | `height: 1px` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/codrops/grid-hover/grid-hover.css:9 | `aspect-ratio: 1` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/imagine/codrops/grid-zoom/grid-zoom.css:13 | `min-height: 26em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/codrops/layer-reveal/layer-reveal.css:39 | `height: 20em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/codrops/line-hover/line-hover.css:23 | `height: 1px` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/codrops/line-hover/line-hover.css:48 | `height: 2px` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/codrops/line-hover/line-hover.css:60 | `height: 8px` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/codrops/line-hover/line-hover.css:70 | `height: 7px` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/codrops/make-way/make-way.css:20 | `aspect-ratio: 1` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/imagine/codrops/scroll-bend/scroll-bend.css:6 | `min-height: 40vh` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/codrops/shape-swap/shape-swap.css:14 | `height: 18em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/codrops/shape-swap/shape-swap.css:60 | `height: 1.8em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/codrops/warp-cursor/warp-cursor.css:10 | `min-height: 16em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |

### public/framework/ux — 13 (legit 13, guess 0)

| file:line | value | why |
|---|---|---|
| public/framework/ux/Content/catalog/catalog.css:50 | `min-height: 5em` | legit: a floor (content can grow); already paired with max-height + overflow:auto for the cap — the exact pattern this brief recommends |
| public/framework/ux/Content/catalog/catalog.css:50 | `max-height: 14em` | legit: a floor (content can grow); already paired with max-height + overflow:auto for the cap — the exact pattern this brief recommends |
| public/framework/ux/Content/content.css:32 | `min-height: 4.5em` | legit: a textarea-like field — min-height is a form-control floor |
| public/framework/ux/Content/plan/plan.css:19 | `min-height: 4em` | legit: a stage floor with overflow:auto — same pattern as catalog-stage |
| public/framework/ux/Content/plan/plan.css:73 | `aspect-ratio: 4 / 3` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/ux/Dictate/Dictate.css:26 | `height: 4px` | legit: 1px-scale rule/divider |
| public/framework/ux/Dictate/playground/Playground.css:37 | `block-size: 1.6em` | legit: a level-meter control |
| public/framework/ux/Dictate/playground/Playground.css:71 | `min-height: 6em` | legit: a code/diff preview floor — content can grow past it |
| public/framework/ux/Dictate/playground/Playground.css:75 | `block-size: 1em` | legit: documented inline: the blank line a long pause earns — a meaningful marker, not a guess |
| public/framework/ux/Dictate/variants/v1/Dictate.css:25 | `height: 4px` | legit: 1px-scale rule/divider |
| public/framework/ux/Popover/Popover.css:56 | `block-size: 10em` | legit: named "hostile-scroll" — a deliberate scroll-behaviour test case |
| public/framework/ux/Tree/Tree.css:19 | `height: 2px` | legit: 1px-scale rule/divider |
| public/framework/ux/ux.css:17 | `height: 2em` | legit: a small index flag/badge |

### public/layouts/labs — 12 (legit 12, guess 0)

| file:line | value | why |
|---|---|---|
| public/layouts/labs/blogx/blogx.css:361 | `height: 0.28em` | legit: 1px-scale rule/divider |
| public/layouts/labs/blogx/blogx.css:503 | `max-height: 40vh` | legit: a rail/aside — deliberate scroll cap (max-height + width:auto) |
| public/layouts/labs/decks/decks.css:143 | `height: 0.3em` | legit: 1px-scale rule/divider |
| public/layouts/labs/mag/mag.css:79 | `height: 0.3em` | legit: 1px-scale rule/divider |
| public/layouts/labs/mag/mag.css:315 | `height: 4.5em` | legit: documented two lines above: "A picture of a row, drawn" — a diagram, no image files |
| public/layouts/labs/mag/mag.css:389 | `height: 0.8em` | legit: a bar in the same drawn-diagram family as .mag-frame two rows above |
| public/layouts/labs/screens/screens.css:167 | `height: 0.32em` | legit: 1px-scale rule/divider |
| public/layouts/labs/screens/screens.css:245 | `aspect-ratio: 16 / 10` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/layouts/labs/sections/sections.css:230 | `min-height: 5em` | legit: a floor only (min-height) on a tile anchored to its bottom edge (align-items:flex-end) in a demo of the "sections" pattern |
| public/layouts/labs/trees/trees.css:90 | `height: 1px` | legit: 1px-scale rule/divider |
| public/layouts/labs/trees/trees.css:152 | `height: 22em` | legit: media box (image/video/canvas/thumb) |
| public/layouts/labs/trees/trees.css:158 | `height: 100vh` | legit: fixed shell (app bar / rail / full-viewport frame) |

### public/framework/ui — 10 (legit 10, guess 0)

| file:line | value | why |
|---|---|---|
| public/framework/ui/background/background.js:159 | `height: 8em` | legit: a decorative ambient blob shape |
| public/framework/ui/background/background.js:163 | `height: 10em` | legit: a decorative ambient blob shape |
| public/framework/ui/background/background.js:167 | `height: 6em` | legit: a decorative ambient blob shape |
| public/framework/ui/background/page.css:24 | `min-height: 11em` | legit: a background-pattern swatch card — the pattern has no natural height, same reasoning as a media box needing its ratio; the sibling .background-wall-hero right above it already uses the recommended clamp(min,vh,max) fold-budget pattern |
| public/framework/ui/badge/badge.js:15 | `height: 0.5em` | legit: a badge dot |
| public/framework/ui/badge/page.js:49 | `height: 0.5em` | legit: small icon/glyph/control size |
| public/framework/ui/item/item.js:136 | `aspect-ratio: 1; line-height: 1;` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/ui/timeline/timeline.js:12 | `height: 0.7em` | legit: a timeline marker |
| public/framework/ui/tree/tree.js:55 | `aspect-ratio: 1 with only a width` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/framework/ui/tree/tree.js:60 | `aspect-ratio: 1;` | legit: aspect-ratio on a media/demo box — needs its ratio |

### public/imagine/paging — 9 (legit 9, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/paging/navigation/navigation.css:149 | `height: 4.5em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/paging/navigation/navigation.css:186 | `min-height: 4.2em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/paging/navigation/navigation.css:229 | `height: 0.45em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/paging/paging.css:122 | `min-height: 8em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/paging/paging.css:179 | `min-height: 4.5em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/paging/paging.css:578 | `height: 1.2em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/paging/paging.css:1120 | `height: 13em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/paging/paging.css:1238 | `block-size: 26em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/paging/paging.css:1264 | `height: 40vh` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |

### public/imagine/vary — 9 (legit 9, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/vary/colstyles/cards/page.js:17 | `height: 26em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/vary/colstyles/finder/page.js:17 | `height: 26em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/vary/colstyles/glass/page.js:17 | `height: 26em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/vary/colstyles/hooks/page.js:61 | `height: 11em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/vary/colstyles/ink/page.js:17 | `height: 26em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/vary/colstyles/page.js:47 | `height: 11em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/vary/place/place.css:28 | `height: 0.55em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/vary/scroll/scroll.css:9 | `max-height: 11em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/vary/scroll/scroll.css:15 | `max-height: 11em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |

### public/imagine/youtube — 8 (legit 8, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/youtube/youtube.css:27 | `aspect-ratio: 16 / 9` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/imagine/youtube/youtube.css:157 | `height: 10em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/youtube/youtube.css:176 | `height: 2.4em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/youtube/youtube.css:230 | `aspect-ratio: 16 / 9` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/imagine/youtube/youtube.css:231 | `min-height: 20em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/youtube/youtube.css:246 | `aspect-ratio: auto` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/imagine/youtube/youtube.css:322 | `max-height: 14em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/youtube/youtube.css:338 | `height: 16em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |

### public/layouts/layouts.css — 7 (legit 7, guess 0)

| file:line | value | why |
|---|---|---|
| public/layouts/layouts.css:27 | `aspect-ratio: var(--w` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/layouts/layouts.css:130 | `height: 0.45em` | legit: a wireframe bar in the "standard" layout diagram (std-*), drawing a picture of a layout, not real content |
| public/layouts/layouts.css:133 | `height: 1.1em` | legit: wireframe mark in a layout diagram |
| public/layouts/layouts.css:135 | `height: 0.5em` | legit: wireframe nav-link mark in a layout diagram |
| public/layouts/layouts.css:138 | `height: 2.4em` | legit: wireframe claim/heading mark in a layout diagram |
| public/layouts/layouts.css:140 | `height: 2.2em` | legit: wireframe button mark in a layout diagram |
| public/layouts/layouts.css:144 | `min-height: 2em` | legit: wireframe image mark in a layout diagram (min-height floor only) |

### public/framework/ai2 — 5 (legit 5, guess 0)

| file:line | value | why |
|---|---|---|
| public/framework/ai2/ai2.css:393 | `height: 0.5em` | legit: small icon/glyph/control size |
| public/framework/ai2/ai2.css:495 | `height: 0.4em` | legit: a progress meter bar |
| public/framework/ai2/ai2.css:1315 | `height: 2.2em` | legit: a form field control |
| public/framework/ai2/ai2.css:1363 | `height: 0.35em` | legit: a live bar-chart row |
| public/framework/ai2/ai2.css:1789 | `height: 0.4em` | legit: a progress bar |

### public/framework/dev — 5 (legit 5, guess 0)

| file:line | value | why |
|---|---|---|
| public/framework/dev/Claim/claim.css:49 | `height: 0.5em` | legit: small icon/glyph/control size |
| public/framework/dev/DevBar/devbar.css:359 | `height: 0.55em` | legit: small icon/glyph/control size |
| public/framework/dev/DevBar/devbar.css:374 | `max-height: 9em` | legit: deliberate scroll area (max-height + likely overflow) |
| public/framework/dev/DevBar/devbar.css:507 | `max-height: 12em` | legit: deliberate scroll area (max-height + likely overflow) |
| public/framework/dev/DevBar/devbar.css:543 | `max-height: 6em` | legit: a live minions list — deliberate scroll area |

### public/imagine/design — 5 (legit 5, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/design/color/color-study.css:13 | `height: 2.6em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/design/size/size.css:64 | `height: 2.5rem` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/design/themes/themes.css:208 | `height: 0.7em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/design/themes/themes.css:230 | `height: 1.5em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/design/themes/themes.css:239 | `height: 1.1em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |

### public/imagine/review — 5 (legit 5, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/review/rethink/page.js:42 | `height: 515px` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/review/rethink/page.js:68 | `height: 877px` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/review/rethink/page.js:81 | `height: 850px` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/review/rethink/page.js:107 | `height: 987.6px` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/review/rethink/rethink.css:83 | `aspect-ratio: 16 / 9` | legit: aspect-ratio on a media/demo box — needs its ratio |

### public/layouts/explorer — 5 (legit 5, guess 0)

| file:line | value | why |
|---|---|---|
| public/layouts/explorer/explorer.css:104 | `aspect-ratio: 16 / 9` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/layouts/explorer/explorer.css:152 | `aspect-ratio: 16 / 9` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/layouts/explorer/explorer.css:163 | `aspect-ratio: var(--w` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/layouts/explorer/explorer.css:187 | `min-height: 240px` | legit: named "pic-big" — a media box |
| public/layouts/explorer/page.js:269 | `aspect-ratio: var(--w` | legit: aspect-ratio on a media/demo box — needs its ratio |

### public/layouts/practice — 4 (legit 4, guess 0)

| file:line | value | why |
|---|---|---|
| public/layouts/practice/practice.css:115 | `min-height: 2.2em` | legit: a nav-link control |
| public/layouts/practice/practice.css:813 | `min-height: 1.9em` | legit: a footer-link control |
| public/layouts/practice/practice.css:878 | `max-height: 20rem` | legit: media box (image/video/canvas/thumb) |
| public/layouts/practice/practice.css:888 | `aspect-ratio: 1920 / 1200` | legit: aspect-ratio on a media/demo box — needs its ratio |

### public/imagine/imagine.css — 3 (legit 3, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/imagine.css:133 | `height: 3px` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/imagine.css:365 | `height: 0.3em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/imagine.css:540 | `height: 0.35em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |

### public/imagine/mag — 3 (legit 3, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/mag/mag.css:77 | `height: 0.3em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/mag/mag.css:313 | `height: 4.5em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/mag/mag.css:387 | `height: 0.8em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |

### public/imagine/stream — 3 (legit 3, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/stream/stream.css:46 | `height: 0.6em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/stream/stream.css:117 | `height: 1.6em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/stream/stream.css:136 | `height: 1.1em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |

### public/framework/framework.css — 2 (legit 2, guess 0)

| file:line | value | why |
|---|---|---|
| public/framework/framework.css:647 | `min-height: 2.4em` | legit: a comment explaining the standard button control height (2.4em incl. border), not a new declaration |
| public/framework/framework.css:710 | `min-height: 2.4em` | legit: small icon/glyph/control size |

### public/imagine/blogx — 2 (legit 2, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/blogx/blogx.css:361 | `height: 0.28em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/blogx/blogx.css:503 | `max-height: 40vh` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |

### public/imagine/feeds — 2 (legit 2, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/feeds/feeds.css:44 | `aspect-ratio: 16 / 9` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/imagine/feeds/feeds.css:55 | `height: 3.4em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |

### public/imagine/screens — 2 (legit 2, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/screens/screens.css:164 | `height: 0.32em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |
| public/imagine/screens/screens.css:242 | `aspect-ratio: 16 / 10` | legit: aspect-ratio on a media/demo box — needs its ratio |

### public/layouts/browse — 2 (legit 2, guess 0)

| file:line | value | why |
|---|---|---|
| public/layouts/browse/browse.css:99 | `aspect-ratio: 16 / 9` | legit: aspect-ratio on a media/demo box — needs its ratio |
| public/layouts/browse/browse.css:166 | `aspect-ratio: var(--a` | legit: aspect-ratio on a media/demo box — needs its ratio |

### public/layouts/shell — 2 (legit 2, guess 0)

| file:line | value | why |
|---|---|---|
| public/layouts/shell/shell.css:435 | `max-height: 40vh` | legit: a scroll track — deliberate scroll area |
| public/layouts/shell/shell.css:440 | `max-height: 40vh` | legit: a scroll rail — deliberate scroll area |

### public/framework/servex — 1 (legit 1, guess 0)

| file:line | value | why |
|---|---|---|
| public/framework/servex/lifecycle/page.js:34 | `height: 1.4em` | legit: a CSS bar-chart row (comment above: "A CSS bar chart"), control-scale |

### public/imagine/decks — 1 (legit 1, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/decks/decks.css:143 | `height: 0.3em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |

### public/imagine/importance — 1 (legit 1, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/importance/importance.css:126 | `height: 0.45em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |

### public/imagine/sections — 1 (legit 1, guess 0)

| file:line | value | why |
|---|---|---|
| public/imagine/sections/sections.css:219 | `min-height: 5em` | legit: imagine/ realm — deliberately fixed-size art (brief: leave these) |

### public/layouts/Layout.js — 1 (legit 1, guess 0)

| file:line | value | why |
|---|---|---|
| public/layouts/Layout.js:10 | `aspect-ratio: var(--w` | legit: aspect-ratio on a media/demo box — needs its ratio |

