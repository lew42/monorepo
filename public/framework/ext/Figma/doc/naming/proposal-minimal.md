# Naming proposal: minimal (2026-11-17)

Answers [naming-brief-2026-11-17.md](../naming-brief-2026-11-17.md), built from [your words](../owner-words-2026-11-17-naming.md). Proposal only: nothing in Lew42 v2 was touched. The mechanics were tested on page **Lab · Naming** in Claude November 2026 ([open](https://www.figma.com/design/woCZQDoXKJW3GcJPZukW7f?node-id=53-49)).

**The whole idea:** every size has one `X · default`. You drag it in, swap it to a layout, and each column of that layout is a smaller default that you swap again. Padding comes with a background, never with a layout.

## Glossary (10 words)

| Word | What it is | Padding / fill / radius |
|---|---|---|
| **tier** | A width with its own page: 360, 400, 600, 1000, 1600, 1920, 2600, 3440. Only 400 Mobile, 1000 Default, 1920 Desktop and 3440 Mega keep a label. | – |
| **default** | `X · default`: one per tier. A white background, `pad`, and an h1 whose text is its own name. Nothing else. | pad yes, fill White, radius 0 |
| **layout** | `X · N · shape`: N side-by-side instances, defaults to start with. | none, none, 0, gap 0 |
| **equal** | The shape name for N equal columns. Uneven ones are named by shape: `sidebar + main`, `main + aside`, `1/3 + 2/3`, `rails both sides`. | as layout |
| **padded** | `X · 1 · padded`: the one layout with padding. It holds one default from the tier below, e.g. 1920 holds 1600. | section-pad, Light gray, 0 |
| **gap** | The one setting for joined vs separate. Joined is 0 (prebuilt). Separate is an override on the instance, the same way padding goes to 0. | – |
| **column** | One child of a layout. It's a word, not a master, and its layer name is whatever it holds. | its content's |
| **section** | Also a word, not a master: anything placed full width with gap 0. | its content's |
| **Card** | The existing Card. It has no size prefix. Swap a column to Card when you want rounded, raised and padded. | its own pad, radius, shadow |
| **Content** | `content · text`, `· stat`, `· list`… No padding and no width. It goes in a Card, a `padded`, or straight into a column. | none |

"Block" is dropped. "Section" is no longer a master: a section is just a default or layout placed full width.

## Formula

```
<X> · default          in Root Column - Masters, no folder
<X> · <N> · <shape>    in folder <N> (1–4); shape = equal | padded | sidebar + main | …
Card, content · <kind> no size; Elements page
```

**A column starts as the default of the tier nearest its width (ties go up):**

| | ·2 | ·3 | ·4 | padded holds |
|---|---|---|---|---|
| 3440 | 1600 | 1000 | 1000 | 2600 |
| 2600 | 1600 | 1000 | 600 | 1920 |
| 1920 | 1000 | 600 | 400 | 1600 |
| 1600 | 1000 | 600 | 400 | 1000 |
| 1000 | 600 | 360 | – | 600 |

## Trees

```
1920 Desktop / Root
  Root Column - 1920 Desktop     .1920 Desktop Preview
  Root Column - Masters
    1920 · default                    replaces Res.1920 Desktop Set
    1   1920 · 1 · padded             1600 · default inside
        1920 · 1 · page               was 1920 Page 43:8103
    2   1920 · 2 · equal              1000 · default ×2
        1920 · 2 · sidebar + main     400 · default + 1600 · default (was Layout.Sidebar Set)
    3   1920 · 3 · equal              600 · default ×3
    4   1920 · 4 · equal              400 · default ×4
  Root Column - Specimens
  Archive

1000 Default / Root
  Root Column - 1000 Default     .1000 Default Preview, Swap demo
  Root Column - Masters
    1000 · default                    replaces Res.1000 Default Set + Section 180:617
    1   1000 · 1 · padded             600 · default inside
        1000 · 1 · text column        was Text column 242:3970
    2   1000 · 2 · equal              600 · default ×2 (was Containers/2 columns 180:560)
        1000 · 2 · sidebar + main     360 · default + 600 · default (was Nav + main 100:2164)
    3   1000 · 3 · equal              360 · default ×3 (was 3 columns 180:583)
  Root Column - Demos
  Archive
```

## Use it in 4 steps (built in the lab, [demo](https://www.figma.com/design/woCZQDoXKJW3GcJPZukW7f?node-id=53-183))

1. Drag `1920 · default` in. It reads "1920 · default".
2. Swap it to `1920 · 2 · equal`. You get two `1000 · default` columns, 960 each.
3. Swap column 2 to `1000 · 2 · equal`. You get two `600 · default` inside it.
4. Swap one 600 to `400 · default`, or column 1 to `1920 · default`. Any size goes, and Fill is kept.

**Your open questions, one rule each:**
- **Padded section with content columns:** `X · 1 · padded`, with its inner default swapped to `X′ · N · equal`, whose columns are swapped to Content.
- **Full-height padded columns:** `X · N · equal` as shipped. Each default brings its own padding.
- **Joined vs separate:** gap 0 vs a gap override.
- **Card vs section:** swap the column to Card for the card look. Leave it a default for the flat look.
- **Sections at 1920 vs cards smaller:** nothing to decide. A 1920 default spans the page, so it reads as a section. Cards come in only when a column is swapped to Card.

**Adding a section.** An instance takes no new children (tested). So the page you design in is your own plain frame: you drop defaults into it and press Ctrl+D. Inside a layout, you get a third column by swapping to `X · 3 · equal`. Only `X · 1 · page` gets a slot (`Sections`), because a page is the one thing that grows. In the test, a slot on an instance accepted three new children.

**Reworking one layout into another.** Swap the layout instance to another layout. Changes inside it survive only where the column layer names match:
- `equal → wide + narrow`: the column padding set to 0 and the text you typed were kept.
- `equal → sidebar + main`: the columns hold different defaults, so both were lost.

You already accepted that names go stale on a rework. If it matters later, the alternative is naming the columns `col 1`, `col 2`. Overrides then survive every rework, but the layer no longer says what it holds.

**When to detach.** You need a structure that no layout has (more children, a different direction):
- If you'll reuse it, detach, rename it `X · N · shape`, make it a component, and put it in folder N.
- For a one-off, detach and leave it a frame.

## What the lab showed

| Question | Result |
|---|---|
| Swap a nested instance to any component, any size? | **Yes.** 1000 → `1000 · 2 · equal`, 600 → 400, 1000 → 1920 all worked, and Fill was kept. Only a cycle is refused ("would create a cycle"). |
| Add a child to an instance? | **No**, at any depth: "New parent is an instance or is inside of an instance". |
| Does a slot fix that? | **Yes.** `appendChild` into an instance's slot worked (3 children). |
| Does the layer name follow a swap? | **Yes**, while the layer isn't renamed. |
| Does a swap keep top-level overrides? | **Yes.** Padding 0 and the h1 text "Hero" survived `1920 · default → 1600 · default`. So never type over a default's h1: it would keep the old text. |
| Does "equal" stay equal? | **Only while both columns have the same padding.** Fill shares out the space left after padding: 1008/912 after swapping a column to a layout, and 1057/863 with a 1920 default beside a layout. |
| Does the swap menu group by frame? | **Can't verify.** The API only gives `parent` (here `2`, then `Root`). [kit-structure.md](../kit-structure.md) says the menu uses only the top-level frame, which would make folders 1–4 invisible there. **The name already carries N,** so nothing breaks either way. Searching Assets for `· 2 ·` is the second way to browse, with no duplicates. |

## Migration (from the [layer audit](../layer-audit-2026-11-17.md))

- 8 `Res.<size> Set` → 8 `<size> · default`. Archive the sets.
- About 25 renames from the audit table, with `columns` becoming `equal`.
- Remove 27 `Region ·` wrappers: put the instance in directly and set it to Fill.
- About 14 new `padded` / `N · equal` masters, from one script.
- Archive `Two cards`, `Three cards`, `Text column · old` and the 2 parked sets.

That is about 16 `use_figma` calls (one write and one check per page), roughly an hour of Sonnet work, one pilot page first (rule 14).

Two existing rules change:
- Rule 24 (swap within a kind) loosens: a column may swap to anything, and the name keeps the kinds apart.
- Decided 4's "a 1920 default holds a 1600" moves into `1920 · 1 · padded`, because Decided 8 keeps the default bare.

## Why this is the simplest

There are two masters you think with: `default` and `layout`. One placement rule follows from them: padding comes only with a background, so defaults and Cards have it and layouts never do (the single exception is `padded`). Every open question becomes a swap or one override. There are no variants, no properties, no slots except on the page, and no wrapper between a layout and its columns. The names carry size and column count, so the layer panel tells you what a thing is wherever it lands. The folders only help browsing, so if Figma ignores them, nothing is lost.
