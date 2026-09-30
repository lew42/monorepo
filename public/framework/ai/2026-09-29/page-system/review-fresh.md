# Fresh review: the Page system branch, checked against the owner's words

I loaded the branch `worktree/page-system-929` at http://localhost:51061/ in a headless browser at 1920 wide. I reached each page by clicking its tab on `/framework/core/Page/`. Screenshots are in this session's scratchpad. **Result: six of the eight numbered asks are met, and five findings must be fixed before merge.**

## 1. Checklist, one line per owner ask

- [x] "first find all the locations of layout work": three raw surveys (`inventory/A`, `B`, `C`), merged into one table at [layout/doc/prior-work.md](/framework/core/Page/layout/md/doc/prior-work/) (92 rows).
- [x] "core slash page slash layout … a system of layouts … start with the navigation, the parent structures, and then the internal structures": [/framework/core/Page/layout/](/framework/core/Page/layout/). It has three columns in that order, then "Every kind of layout", then decide, research and names. The v1 and v2 hubs are still one click away.
- [x] "framework slash styles slash sections … maybe that shouldn't be in layout": it is linked as the "Sections" tile under "Inside the page", and not moved.
- [x] "persistent navigation … it should stay in place and not move": [navigation/](/framework/core/Page/navigation/), section 1, with four mechanisms measured at 0px drift.
- [x] "a header, a left sidebar, top tabs, and then an inner left sidebar … pretty ridiculous": navigation section 2 sets four levels as the ceiling and shows them live on `/core/Page/api/`.
- [x] "the class doc system with the top tabs … documented as the go-to": navigation section 3 (ext/Doc).
- [x] "creating alternatives … Miller column … workspace … left and right sidebar … swap out": navigation section 4, a table of six alternatives, each with a demo link.
- [x] "creating a new page is definitely a process … thinking through the parent page's layout": `create_page` in `Servex/pages.js` now needs a description, writes a readme stub and returns the parent's title, layout words, siblings and readme link. The `new-page` and `page` skills now say "a child starts from its parent".
- [ ] "I don't know if that should be a skill or a MCP tool … Make sure we write down … how to structure our system": the split is built, but the reasoning is written only inside the `new-page` skill. The [Make a page](/framework/core/Page/make/) tab never mentions `create_page` or the parent-first step.
- [x] "the README is the text-based version. The main page should … read the README": the documentation skill says this in one line and links `make/readme-page/`.
- [x] "page.json L is sort of the source of truth … monitoring the size … purging": [jsonl/](/framework/core/Page/jsonl/) has tiles for who writes, timing, caveats and size. `node Server/page-size.mjs` runs (473 files, one over 100 KB). The purge is a proposal only, which the ask allowed.
- [x] "core slash page slash AI … dictation per page, the fast assistant per page … session IDs … SDK": [ai/](/framework/core/Page/ai/) has five tiles and links to Servex rather than repeating it. The "chat room" echo is documented.
- [ ] "if there's an array of agents … see what that JavaScript structure looks like in rendered form. little debug widgets": [ai/agents/](/framework/core/Page/ai/agents/) draws the array, but every row reads only `.0 {…}`, `.1 {…}`. You cannot see an agent's name without expanding its row.
- [x] "core slash page slash dynamic … mention … the page.route method … data that gets fetched … templating": [dynamic/](/framework/core/Page/dynamic/) plus a live `dynamic/example/` (index.json, one template, three urls).
- [x] "core slash page slash JSON L … the format, adding logs to it, who adds logs, the timing … caveats or conflicts": jsonl/ plus `doc/writers|timing|caveats|size.md`.
- [ ] "on the core page page, we could see a little page object": the object is on the Overview, but it is not little. Its 25 property rows fill the whole first screen and push the palette wall below the fold.
- [x] "a weight system for pages … one is the default … referenced by … add 10 … flex wrap … pills … above 10 it becomes bigger … see the weights": [weight/](/framework/core/Page/weight/), `Server/page-refs.mjs` (runs) and `weight.js`. Nav wiring is correctly left for the owner to decide.
- [x] "The page README should identify the layout system and pretty much anything else": `core/Page/readme.md` → "The sub-systems" (seven one-liners).
- [ ] "re-access those masterminds … talk to them": the card names every agent, but only the task mastermind's session id is complete. The minions' ids are cut short (`f5150091…`), and `claude --resume` cannot open a shortened id.
- [ ] "we're exploring … colors": colour is not covered anywhere in the branch.
- [ ] Not in this branch, and meant for other tasks: the Servex system audit, Servex docs moving into the framework, and a minion to "create pages to document these systems".

## 2. Findings, most severe first

1. **fix**: `/framework/core/Page/jsonl/` is not a top tab. You can reach it only from the sidebar, and opening it removes the Page tab bar entirely. That is the "things disappearing" the navigation page itself calls a bug. The comment in `core/Page/page.js` claims "every sub-system the readme lists is a tab", which is false for storage. Fix: declare `jsonl` so it renders as a tab under the Doc bar, and title it "Storage (page.jsonl)" to match the readme.
2. **fix**: `core/Page/overview/page.jsonl` is new and marked "weight data only", yet 31 of its 33 lines are `{"file": …}` lines written by the dev server's file watcher (`PageFiles`), and they were committed. Each of the eight new data-only `page.jsonl` files now subscribes its folder to the watcher, which is the same churn commit `3141f38e` had to fight. Fix: delete the watcher lines. Then say in `weight/doc/design.md` that the watcher writes to these files, or keep weights in one `weight.jsonl` instead.
3. **fix**: `ai/agents/` rows show only array indices. Fix: label each row with the agent's name, kind and status, the way the "Live right now" widget on `ai/` already does.
4. **fix**: the session ids on card `2026/09/29/the-page-system-layout-navigation-new-pa` are cut short. Fix: post one card line listing who, what and the full session id for every agent, or link each minion's `task.jsonl`.
5. **fix**: `ai/` squeezes five tiles into a column about 640px wide. The text is centred and wraps every two words, and the right half of a 1920 screen is empty. Fix: put the tiles in the wide track as one even row, as `navigation/` does, with left-aligned text.
6. **note**: the Overview's page object crowds out the palette. Fix: show a short form (title, url, children, parent, files) with "all 25" one click down, or place it beside the intro.
7. **note**: `weight/` puts its section titles inside cards at h1 size ("1. Main navigation — weight ≥ 1 is listed…" wraps to three huge lines). The body text of navigation, dynamic, weight and jsonl sits in one column about 640px wide, leaving about 900px empty at 1920. Fix: use h3 inside the cards, and give the long text a second column or the wide track.
8. **note**: `make/` never names `create_page` or "read the parent first". Fix: add one tile, "Agents: create_page", linking the `new-page` skill.
9. **note**: the Overview intro says "the four ways to build one", but Make shows five. Fix: change it to five.
10. **note**: `core/Page/readme.md` lists make, layout and jsonl twice ("The sub-systems" and "Index"), while generator, overview and old appear only in Index. Fix: merge the two into one list.

## 3. Page errors

None. Across Overview, the six tabs, `make/`, `dynamic/example/`, `ai/agents/`, `layout/v2/`, `jsonl/child/`, `api/`, `overview/` and `overview/columns/`, I saw 0 console errors, 0 page errors, 0 failed requests and no 4xx responses. No page scrolled sideways at 1920. `node --check Servex/pages.js` passes, and both `Server/page-size.mjs` and `Server/page-refs.mjs` run.
