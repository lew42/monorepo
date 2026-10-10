# AI 2: the card as a workspace (an experiment behind a toggle)

Load the `minion` skill first, then `code`, `layout` and `css`.

## The owner's words, verbatim (2026-09-28, about 2:10 PM)

Full text: `public/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/owner-words-3.md`, second half.

"…from the AI inbox to the first detail page, I do think having a split, well, so may, maybe after
the inbox uh, card, we can have a Uh, split screen view where essentially instead of just a one
column detail card, you know, I click on the inbox preview, which is like the second column. First
column is the framework column. The second column is the, in, the inbox rail. The third column is
the detail page. But even with the right sidebar open, that detail area can be like easily 1200
pixels on my big screen. And so that could be one of these inner uh left nav like it could be a, a
whole page and instead of being like a flush column um well sort of would be i guess it would, it
would fill the space and it could be then like horizontally centered with a left sidebar of its
own and so it's sort of just like this workspace area where it's like a page system of its own with
navigation and and whatnot um I don't know. I, I'm, I'm thinking that the, the inbox looks a little
cramped and that, you know, letting it breathe like that might work, but maybe we can test that
with, I, I, I want to be able to test different types of content and layout and whatnot on these
uh, inbox cards. And so I'm still not sure exactly how the content is created. If we can have
arbitrary modules like JS files that, you know, are Like each card could have a content.js where it
imports modules and renders different things. Um, definitely worth making a note in any of these
reports or outcomes so I can see that later."

## Deliverables

1. **`public/framework/ai2/floating.js` — the "Floating page" layout**, one self-contained module:
   `floating(box, { nav: [{ label, href, active }], content: fn })` draws an inner left nav beside
   a page that is horizontally centred in the leftover space, with room to breathe. **No AI 2
   imports** (core/View only) and its CSS in a layer (`site`), classes prefixed `floating-`
   (run the `new-css-class` skill). task-mastermind-organization will lift it into core/Page's
   Layout tab as its "Floating page" word, so write its header comment for that reader.
2. **The workspace view, behind a toggle.** When on, an opened card's detail area uses
   `floating()`: the inner left nav lists the card's tabs (Overview · Tasks · Activity, and a tiny
   card's tabs, all already routed child pages `…/<card>/activity/`) plus its sub-cards; the page is
   centred. The card's chat column stays where it is. The toggle is visible (a word in the rail
   header, e.g. `workspace`), routed (`?view=workspace` in the url, kept when you click rows), and
   off by default. **With the toggle off, nothing changes** — prove it with a before/after shot.
3. **A card's own `content.js`, documented.** A card can already place any `.js` module with a
   `{"place": {"module": "x.js", …}}` line in its page.jsonl (drawn by `core/Page/Log.js`
   `draw_module()`: a default export with `render` is constructed, otherwise called as
   `fn(page, box, data)`). Make it obvious: document "a card's `content.js`" in
   `public/framework/ai2/doc/cards.md` + one readme line — the file imports any modules and
   renders them — and build ONE example card in the worktree whose `content.js` imports two real
   site modules (e.g. a `ext/files` tree and a live object / a small layout) and renders them.
   Put the example card at `public/framework/ai/2026/09/28/content-js-example/` in the worktree
   (page.jsonl line 1 like other cards: `{"class":"/framework/ai2/card.js","title":"Example: a card's content.js",…}`
   then the place line). This hand-written page.jsonl is worktree test data only; the lead creates
   the real card through Servex at landing, so also leave `content.js` ready to copy.
4. **Proof:** headless shots at **1920 and 3440** (height 1440 for 3440), toggle off and on, of
   System design and the example card, reached from the rail by clicking. Zero console errors and
   zero failed requests on /framework/ai2/, a card, a group, the Now card, with the toggle on and off.
   Look at each shot and say in one line whether the 3440 page now breathes (no ~1200px cramp, no
   huge dead gutters).

## Fence and where

Worktree only: `C:\Code\lew42\worktrees\ai2-workspace` (branch `worktree/ai2-workspace`), server
http://localhost:57176/ . Write only: `public/framework/ai2/**` and
`public/framework/ai/2026/09/28/content-js-example/**` and this task's dir, in the worktree. Never
edit core/ or C:\Code\lew42\monorepo. Keep the diff small; don't reformat. Traps: no DOM after an
await (capture the box first); every CSS rule in a layer; resolve URLs against import.meta.
Probe scripts in the scratchpad
`C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-monorepo\546c308f-a944-4905-95a1-68d84991524f\scratchpad`,
named `ai2w-*.mjs`. Any process: `windowsHide: true`. Commit in the worktree
(`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`); do not write a landing line.

Report: commit hash, the shot paths (8), the toggle url, and anything you could not do.
