Budget: $10

# /live/design/, round 2: show, don't tell

You built `/live/design/` (round 1: [requirements.md](requirements.md)). The owner looked at it and said: **"show me, don't tell me."** No paragraphs. Titles and subtitles are fine; every explanation becomes a visual. Same fence as round 1, plus the commit rule below.

## 1. A widget can sit in a card

In `DesignPage.draw_card`: when a card has a `ui` field (`{"type":"part-card","tab":"Today","title":"…","ui":"methods"}`), draw `this.ui.get(card.ui)`'s view in the card body instead of its text. A card can still have a title and a one-line `text` subtitle above the widget. This shows idea 2 working: a widget is reached through `page.ui`, by name.

## 2. `ui/MethodMap.js`: "150 methods in one bag", shown

`export default class MethodMap extends Item`, registered with `PageUI.add("methods", MethodMap)` and imported by `DesignPage.js`. Its data is `view`, either `"today"` or `"grouped"`, and it is set from voice like the tabs: `{"ui":{"methods":{"view":"grouped"}}}`. Two small buttons in the widget switch the view.

- **Compute, don't type the lists** (CLAUDE.md law 7). In the browser, read the own method names of `Item.prototype`, `Page.prototype` and `LivePage.prototype` (`Object.getOwnPropertyNames`, functions only, minus `constructor`; getters count as properties, so leave them out).
- **Forwarder:** a method whose body only hands the call on: `fn.toString()` matches one `return this.<x>…(…)` or `this.<x>…(…)` statement. It is drawn greyed. Check the rule on 5 methods by eye and say which 5 in your log line.
- **"today" view:** three blocks, Item · Page · LivePage. Each block's header shows its count and how many are forwarders (e.g. "Page 97 · 50 forward"). The block is a wrapping grid of small chips, one per method name.
- **"grouped" view:** the same chips, regrouped into `page.columns`, `page.tabs`, `page.previews`, `page.log`, `page.links` and what stays on `page`. Write the grouping rule as ONE static map of name patterns at the top of the file, matching the table in [namespaces.md](/framework/core/Page/doc/namespaces.md) ("The shape"). Chips that no rule matches stay in `page`. Show each group's count.
- Chips wrap at 400 px with no sideways scroll. A chip shows a name; a hover/title may show `Page.prototype.<name>`.

## 3. Rewrite the cards: titles, subtitles, visuals

Replace the paragraph cards on `/live/design/` through the item tool. Use `{"content":{"remove":"<id>"}}` (removed cards are kept in `page.removed`), then add the new cards. Every card has a title and at most a one-line subtitle (under ~12 words). The visual carries the rest.

- **Today:** heading "Page has 150 methods in one bag"; one card with `ui: "methods"` (view today).
- **Idea 1:** title "UI lives in modules", subtitle "a page imports only what it uses". Visual: a small file tree as a code block, `core/Page/ui/` with `Tabs.js Columns.js Previews.js Nav.js`, and one import line. If a fenced code block doesn't render in a card, say so and use the closest thing that does.
- **Idea 2:** title "One door: page.ui", subtitle "made when first touched, state saved in the log". Visual: the voice line `{"ui":{"tabs":{"selected":"Idea 2"}}}` as code, plus the methods widget in grouped view. That needs a second card with `ui: "methods"`; one shared widget is fine, so whichever view is set shows in both.
- **Both:** title "Recommended: both", subtitle "modules hold the code, page.ui reaches it"; a "Try it" card whose subtitle is "tap a tab, or say 'switch to Idea 1'"; and "If yes, next: about $15–25", linking [namespaces.md](/framework/core/Page/doc/namespaces.md).
- **New tab "Pages"** (add it to the tab names): the recursive-pages answer, [recursive-pages.md](/framework/core/Page/doc/recursive-pages.md). Make three cards, one per storage shape, each a file-tree code block with a status chip in its subtitle:
  - embedded, `/live/page.jsonl` holding foo: "built";
  - own folder, `/live/foo/page.jsonl`: "move exists, button next";
  - own file, `/live/foo.jsonl`: "not routed".
  
  Above them, a heading: "Card foo is always at /live/foo/". Below them, one card titled "Ref stitches it back", subtitle "a pointer, loaded when drawn"; link recursive-pages.md as "the long form".

Order: the cards follow the tab order. End with tabs `["Today","Idea 1","Idea 2","Both","Pages"]` and `selected: "Today"`.

## 4. Prove it

- `node --check` every .js file.
- Extend `PageUI.test.mjs`: apply `{"ui":{"methods":{"view":"grouped"}}}` and replay; the view survives. In node, the method census runs on the classes too, so assert that the Page count is over 50 and the group counts add up to the Page total (two numbers that must agree).
- Shots at 400 and 1200 of: Today (today view), Today after `view: grouped` sent through the item tool, and Pages. Read the 400 ones yourself and fix any overflow.

## 5. Commit (round 1 left the code untracked)

`public/live/` is in `.gitignore`, but its code is force-added (`git ls-files public/live` lists `LivePage.js` and others). The mastermind committed round 1's files with `git add -f` in 088f7e539. Commit yours the same way: `git add -f <exact paths>`. Shots stay ignored. Do not edit `LivePage.js` or `core/`: mastermind-live-page is adding a breadcrumb to LivePage's header right now.

## Done

One `log` line in `page-ui/session.jsonl`. It lists:

- the forwarder rule and the 5 methods you checked;
- the today counts (Item, Page, LivePage, forwarders);
- the test output;
- the shot paths.

Then stop.
