# paging-scout — scout brief

Less is more · clarity is the exception · prioritize. Read [`../paging/requirements.md`](../paging/requirements.md) (the program: plan, vocabulary, the owner's ask) and [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; both are mandatory. Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `new-page` before the page, `finish-task`.

**The owner's question:** "It's basically like icon, page, children (with navigation). similar to the page generator, what other things have we made that match this pattern?" And: "for the imagine/screens/divide/, clicking Two keeps Three active, i feel like it should just link to itself /two/, and then three disappears?" — diagnose that (another minion fixes it).

## Deliverable

`public/imagine/paging/inventory/page.js` — ONE screen: a table, one row per thing that already matches icon · page · children · navigation, with columns: thing (linked) · what a click on a child does, in the program's four words (`launch` `expand` `swap` `takeover`, or "none") · content size it holds (`xs`–`xl`) · layout size (`center` `column` `wide` `full`) · surface (`plain` `card` `tint` `prim` `dark`) · toolbar placement · nesting depth it supports · verdict for the paging program (reuse / extend / missing). Then eight lines: the divide diagnosis (which line keeps Three active and what "link to itself" would change), and the two counts below. `.ac("wide")` on the table's `md()`.

## Read — a closed list

`public/framework/core/Page/generator/` (readme, `gen.js`, `controls.js`, `specs.js`), `core/Page/doc/columns.md`, `core/Page/readme.md`; `public/framework/ext/catalog/`, `ext/tabs/`, `ext/layout/`, `ext/drawer/`, `ext/Panel/readme.md`, `ext/depth/`; every realm's `page.js` + `readme.md` under `public/imagine/`: `shells/`, `screens/` (+ `screen.js`, `divide/`), `decks/`, `scenes/`, `mag/`, `blogx/`, `gallery/`, `feeds/`, `stream/deck/`, `vary/`, `game/`, `team/`, `generated/`; `public/framework/styles/doc/layout-system.md`; `/imagine/design/layout/approved/page.js` (the closed set of five).

## Two counts that must agree with a grep

- Realms under `public/imagine/*/page.js` that call `this.columns()` vs those with a shell of their own: `rg -l "columns\(\)" public/imagine/*/page.js | wc -l`, listed.
- Pages anywhere under `public/` saying `width: "full"`: `rg -n 'width: "full"' public --glob '*.js' | wc -l`, listed by realm.

## Fences

Read everything; write only `public/imagine/paging/inventory/` and this task dir. No CSS, no class names, no fixes. Verify the page renders on a private server at 1280 and 3440. Budget ~150k tokens.
