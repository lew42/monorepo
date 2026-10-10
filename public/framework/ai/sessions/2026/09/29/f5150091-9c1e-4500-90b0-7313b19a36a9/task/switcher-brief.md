# Minion brief: the Switcher, a named layout pattern

Load the `minion` skill first, then `code`, `page`, `layout`, `css`, `new-css-class`. Task dir (the whole conversation, the owner's raw words): `public/framework/ai/2026-09-29/page-system/`. Read the section "Continued (about 5:25 PM): the switcher" in `owner-words.md` there, every line, before anything else.

What the owner described:
- **The Switcher:** a list on the left switches the content on the right. Vertical tabs, a file tree beside its code, and a left nav are all the same thing. Tabs are one styling of it (the tab flows into its content); a file tree is another. It is really paging: every choice is routed (its own url).
- **Responsive:** on a narrow screen the list collapses into a sticky dropdown header above full-width content; on a wide screen it is two columns.
- **The owner's unease:** paging shows and hides through CSS `active` classes. Adapting it (a left nav turning into a sticky dropdown) must not mean monkey-patching that logic.

## Step 1: answer the unease first (a proof, not an essay)
Find how paging's `active` / `in-path` classes are set today (core/Router, ext/tabs, the paging realm at /imagine/paging/). Then show, in one small demo, that a CSS class plus a container query does the collapse with **no JS change** to the active-class mechanism: on narrow widths the list becomes a one-row sticky header showing only the active item, and a tap opens the list (a `<details>` or a CSS-only toggle is fine; a small script is fine only if it never touches how `active` is set). Write the answer in `core/Page/layout/switcher/doc/decide.md`: "Can it be done without touching the active-class logic? Yes/No, because …", with the files and lines.

## Step 2: the pattern page
`core/Page/layout/switcher/` (a child of core/Page/layout/, listed in its hub beside the other layout kinds; keep every existing hub version reachable). It shows the one pattern in three stylings on one page: vertical tabs, a file tree + code, a left nav. Each choice routed. Show it at wide and narrow side by side (two framed live instances, the narrow one about 400px wide) so the collapse is visible without resizing the window.

task-mastermind-file-system is building the first real instance (/fs on mobile). Find its work (`public/framework/ai/2026-09-29/` task dirs, `git log --all --oneline -- '*fs*'`). If it is on michael/dev, link it as "the first real use" and reuse its class; if not, link its task dir and name the class it will use so they can converge.

## Fence
`public/framework/core/Page/layout/switcher/**` (new), one line in `core/Page/layout/`'s hub and its `children:`, and CSS only in the switcher's own stylesheet, every rule in a layer, class names prefixed per `new-css-class`. Nothing else.

## Proof
Load `/framework/core/Page/layout/switcher/` at 1920 and at 400, reached from the layout hub; zero console errors; shots `shots/switcher-1920.png` and `shots/switcher-400.png` in the task dir. Commit by exact path only. Every process you spawn sets `windowsHide: true`. Budget about $4. Reply with the hash, the Yes/No answer in one sentence, and the two shot paths, then stop.
