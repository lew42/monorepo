`div.pages` — the region pages mount into, and the captor everything renders
against.

## Usage

Built at `App.js:44` (or by a site's own `render()`, `app.js:68`), then:

- `App.js:49` — `View.set_captor(this.$pages)`, the line that makes page code work.
- `App.js:84` — `error()` empties it, deliberately *not* `$app`.
- `Page.class.js:134, 137, 139` — `container()`, the last claim in the chain: a
  region, then an ancestor's `$pages`, then this.

## Necessity

Essential — it is the whole of what "App owns one container" means, and it is the
contract `Page.container()` searches for. **Any page can declare its own
`this.$pages`** and its descendants mount there instead (`framework/page.js:30`
does exactly this), which is how a topic keeps its sidebar still while its children
change. That works because the search is *"the nearest ancestor with `$pages`"*, not
*"the app"*.

The error page renders here rather than into `$app` because emptying `$app` would
delete the chrome — the one page that most needs navigation would be the one page
without it. [error-page](/framework/core/App/docs/error-page/).

## Simplicity

Right-sized, with one genuinely subtle line beside it: `View.set_captor($pages)` in
`render()`. A page's view is built by an element factory, and a factory appends to
the captor — so the captor has to be where pages live. Assigning `$pages` without
setting the captor leaves every page landing in `body > div.app`, silently.

Two responsibilities in one property (the mount point, and the capture target) is
the honest description. They have never needed to differ.
