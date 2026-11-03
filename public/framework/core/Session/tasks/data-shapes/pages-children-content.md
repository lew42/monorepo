# Pages: children, content, items, and what happens when you add or drop something

The owner thought this through on 2026-10-28, after [ids-and-paths.md](ids-and-paths.md). The questions:

- the difference between child pages and content;
- whether a page needs its own `items`;
- when adding or dropping something makes a reference, and when it moves the thing.

"This gets confusing." Here is a proposal to react to. Nothing is built.

## 1. What exists today (paths from `public/framework/`)

| Name on a page | What it is | File |
|---|---|---|
| `page.pages` | **a List** (`core/List/List.js`), made on first use, holding the child pages. The real store | `core/Page/Page.class.js:128` |
| `page.children` | **not a List:** `PageChildren extends Map`, a Map-shaped wrapper over `page.pages`, kept for old code (105 call sites still use it, per the pages seat) | `core/Page/Children.js` |
| `page.content` | **a List:** `PageContent extends List`, the parts the page draws in order (headings, text, cards) | `core/Page/PageContent.js` |
| `page.items` | **does not exist.** No Item has `items` on demand today; only Task's `tasks` is made on first use (seat a) | — |

## 2. Two questions every list answers: who owns it, and where it shows

Keeping these two apart removes most of the confusion:

- **Owning** is where a thing *lives*: one place only, its home. For a page, its home also gives it its url (`/parent/child/`).
- **Showing** is where a thing *appears*: as many places as you like, each one a reference.

| List | Answers | Holds |
|---|---|---|
| `page.pages` | **owning**: which pages live inside this one (the url tree) | child Pages, owned |
| `page.content` | **showing**: what this page draws, in order | owned parts (text, cards, images) **and references** (to a child page, any other page, or any item) |

**A child page is owned by `pages`, and shown wherever `content` places a reference to it.** That's the owner's "both mechanisms", and they don't compete:

- **A page with no content** draws previews of its children, in `pages` order. That's the index page: no work needed.
- **A page with content** draws its content. A reference to a child page sits where the writer put it, inside the text around it.
- **Children that no reference places** are listed after the content, under a small "More pages" heading, so nothing owned is ever invisible. (Today a created child doesn't show in its parent's nav at all: the pages seat's finding.)

## 3. Does a page need `items` too? One list, not two

If the base Item gets `items` on demand (seat a's recommendation), a Page would have `items`, `content` and `pages`. Two lists of "stuff on the page" is the confusion the owner felt.

**Proposal: on a Page, `items` and `content` are the same List.** `items` is the name the base Item knows, so generic code (the debug view, a drop handler, the item tool) works on any Item. `content` is the name page code reads. It isn't a second list: it's one list with two names.

- **Nothing is saved until something is added:** the list is made on first use, and an empty one writes nothing.
- `page.set({title: …})` goes to `data`, as now.
- **The alternative:** rename `content` to `items` everywhere, so there's one name. Cleaner, but it's a rename with many callers, which is the "ask first" kind of change.

## 4. Adding or dropping something: the rule

The rule from the 10-27 decisions, made concrete. **It decides from a fact, not a guess:**

1. **A thing with no home yet is adopted**, and owned by where it was added. Example: a new card, or a new page created here.
2. **A thing that already has a home becomes a reference.** Its home doesn't change. Example: an existing page dragged onto another page.
3. **Moving is its own command, never a side effect:** "Move here". The thing leaves its old home, and the old spot keeps a forward (`moved_to`), so links to the old url still work.
4. **Copying is a third command:** "Duplicate here". It makes a new, owned thing with new ids.

**Why a reference is the default for something that already lives somewhere:**

| A mistaken… | Breaks | Undo |
|---|---|---|
| reference | nothing; the original is untouched | delete the reference |
| move | the old url, the old parent's list, and every relative assumption | move it back, and hope nothing cached the new url |

So the cheap, harmless outcome is the default, and the costly one is asked for by name.

## 5. The cases, one by one

| You do | It lands in | One line on disk (dotted paths, [ids-and-paths.md](ids-and-paths.md)) |
|---|---|---|
| Create a new page inside this one | `pages` (owned); it shows by the default rule, or where you made it, as a reference in `content` | `{"pages":{"add":{"type":"Page","id":"guide","title":"Guide"}}}` |
| Drop an existing page onto this one | `content`: a reference | `{"content":{"add":{"type":"Ref","url":"/framework/ext/Chat/"}}}` |
| Choose "Move here" on a page | `pages` of the new parent; a forward at the old spot | a `move` line here, `{"moved_to":…}` at the old parent |
| Drop new text, a card or an image | `content` (owned) | `{"content":{"add":{"type":"Card",…}}}` |
| Drop a card that lives on another page | `content`: a reference (or "Move here", "Duplicate here") | `{"content":{"add":{"type":"Ref","url":"/…/other/","path":"content.k2p9x4mq"}}}` |
| Drop a task into a page | `content`: a reference (a task's home is its session) | `{"content":{"add":{"type":"Ref","url":"/…/session/","path":"tasks.ui"}}}` |

**A reference to a page needs only its url.** A page *is* its address. A reference to anything smaller adds the dotted path inside that page's file.

## 6. What could make this rule wrong (check before building)

- **Dragging inside one page** (reordering content): a thing that already lives here gets an `order` or `move` within its own list, not a reference to itself.
- **A page made by code** (declared `children:` in a `page.js`): it already has a home in code, so dropping it elsewhere makes a reference. Moving it would mean editing code, so "Move here" is refused for it, with a reason.
- **A page that exists only on the file system** (a folder nobody declared): it has a home, its folder, so the same rule applies.
- **Trash:** removing a reference deletes only the reference. Removing an owned thing moves it to `_removed/`, as page CRUD already does (`Servex/agents/Subpages.js`).

## 7. Open questions for the owner

1. One list with two names (`items` = `content` on a Page), or rename `content` to `items`?
2. Is "reference by default, Move here and Duplicate here by name" right for drag and drop?
3. Should unplaced child pages show after the content, or only in the nav?
4. `page.children` (the Map wrapper over `pages`): retire it, by a script that rewrites its callers to `pages`?
