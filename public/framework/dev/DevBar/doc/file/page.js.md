The module's `Doc` — migrated from a plain `Page` on 2026-08-15, the same day
`ext/Doc` replaced `ext/classdoc`. `subject: devbar` documents the two names
`DevBar.js` exports as properties of the default function (`refresh`,
`toggle`) the same way `md.file` gets documented elsewhere — `devbar` is a
function with properties, not a class, so it gets no *Overrides* line and no
constructor story.

## The Overview is a live demo, not a screenshot

The button and the `Ctrl`+`\` hint (`ui.keys`) actually toggle the real rail
mounted on this page — there's no separate sandboxed copy. Same instance a
reader would get on any other page, which is the honest version of "try it."

## Why `methods:` is only two names

`devbar` itself (the default export, called once from `app.js`) isn't listed
— it has no interesting *source* beyond what the Overview's first code block
already shows verbatim, and `Doc.declaration`/`member()` would print the
whole 30-line mount function with no more clarity than the code sample gives.
`refresh` and `toggle` are the two names other files actually call by name
after that first mount, which is the bar this page's `methods:` list uses
everywhere else in the framework.

## Improvements

1. **The Overview never shows what the `ai` section looks like** — the live
   button opens the rail, but a reader on a page with no threads sees an
   empty state, not the pill row + chat the design record spends a whole
   section on. A screenshot or a second live demo pointed at a page with a
   thread would close that gap. *(medium, useful.)*
2. **`code.js` labels `public/app.js` on the mount snippet but not
   `framework.css` on the docking snippet** until this pass — worth checking
   the rest of the framework's `Doc` pages for the same gap once more of them
   migrate. *(simple, useful — now fixed here.)*
