# Pages are live by default: folding LivePage into Page

The owner's direction, 2026-11-07. When the owner asks about LivePage, merging it into Page, page extensions or plugins, answer from this page: **what's built, what's planned, and what's next.** This is a core change, so it runs as a **plan that waits for approval** before any merge.

## Built: what LivePage is today (`public/live/`)

About 1,220 lines in all:
- `LivePage.js` (951 lines) extends `Page`. Most of it is **about 20 small View classes**: Head, Crumbs, Tabs, Main, Items, Card, Preview, Children, Settings, Files, Status, Tasks, Pages, Foot, Errors and more.
- **Card types:** `LiveChecklist`, `LiveLight`, `LiveButton`, `LiveCode`, `LiveContent`.

**The real-time part is not in LivePage.** Streaming comes from the core Item store: the `page.jsonl` tail and the reconnect fix in `core/Page/Reader.js` and `ext/JSONL/live.js`. LivePage's code is the UI the default Page lacked. That's why it is big, and why most of it belongs in reusable views or plugins rather than in one class.

What the owner liked:
- **Header:** the breadcrumb, the gear, and `/x/settings/` with its file browser.
- **Storage icons:** dot = embedded, file = own `.jsonl`, folder = own folder.
- **Cards that are sub-pages,** with previews.
- **Opt-in tabs,** a short list of permanent sections.
- **Voice edits that appear instantly** through the item tool.

## The direction

- **No LivePage class in the end.** Every page is live; that comes from the store.
- **Optional features are plugins or extensions,** not more methods on Page.
  - `core/Plugin` exists: `Host.use(A)` attaches A to every new instance, `Host.unuse(A)` detaches it, and `Host.plugins` lists rows with `enabled` and `config`.
  - The owner also wants **per-instance** control: an instance can add a plugin, configure it, or turn off one its class added. Check whether that exists.
  - Each plugin's config is editable by the UI and by the item tool.
  - Page extensions should be built on Plugin. Should Page extend Pluggable/Plugin? Decide it in the plan.
- **Keep Page small and predictable.**
  - Rank Page's and Item's methods: core, secondary, or candidate for moving out. Have three agents rank them independently (Haiku, Sonnet, Opus) and compare.
  - Encapsulate groups (columns, tabs, previews, logs) as on-demand parts or plugins. See [namespaces.md](namespaces.md).
- **Store-agnostic.** Today's store is JSONL; it may become a Durable Object. No JSONL-specific code goes into Page itself.
- **One of everything.** The plan lists duplicates and settles each one:
  - `ux/tabs` vs Page's tabs
  - the two `Question` classes and the two `Prompt` classes
  - `ext/Doc`'s top tabs vs LivePage's tabs
- **The session page and the web voice chat converge on this.** Both are live pages: a log or chat tab where sentences become prompt cards and tasks, sub-pages for tasks, and the same header. See [prompt-refinement-and-tasks.md](../../../ai/doc/prompt-refinement-and-tasks.md).
- **Templates stay flexible.** This is about the API and navigation, not about forcing one look.
- **Iceberg content:** tip first (the title and the one thing to know), with links to the depths. Plans, cards and pages all follow it.

## Next

1. **The plan is up: [/live/plan/fold/](/live/plan/fold/)** (2026-11-07). In short: `class Page extends Pluggable(Item)`, so Page's three extension hooks become core/Plugin rows (per-instance on/off is already built there); LivePage splits into Page (~200 lines), reusable views (~330) and plugins (~390); one tabs plugin replaces three. The first adopter is the session page, and the first decision is whether Item's `file_url`/`load` move to the store. The method ranking (Haiku, Sonnet, mastermind; 119 of 196 agreed) is in [the task folder](/framework/ai/sessions/2026/11/06/spawned/mastermind-live-page/live-plan/compare.json). It **waits for the owner's yes.**
2. **The session page study is done:** [/live/session-page/](/live/session-page/) (the live tail is built, 9782b2db5).
3. **After approval:** small, additive steps in worktrees, each one smoke-tested. Nothing breaks the existing pages.
