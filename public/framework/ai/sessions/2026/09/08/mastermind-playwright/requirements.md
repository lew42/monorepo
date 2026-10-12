# mastermind-playwright — the overnight run (group `ai-ops`)

## The ask, verbatim (the owner, 2026-09-07 23:5x → 00:05)

> playwright mastermind: research what playwright is commonly used for, and how it might be useful. create demos of how it works, documenting with screenshots. what kinds of things can claude code + playwright do? how do people utilize this for automation? research, write a blog post.
>
> figure out how to browse external websites. i think it should just work... find websites that have examples of web design (all things, navigation, sidebars, headers, menus, links, cards, ui, ux, everything)... have minions look at the screenshots at various resolutions, and make note of responsive strategy, technique, etc. focus on layout. scan the website's dom, and css, and figure out exactly what kind of CSS layout(s) they're using. create a system of words to describe each unique layout type. be specific, and if you can generalize (where a flex and grid algorithm might produce identical or nearly identical results), clarify any nuance, and offer a simplified layout. ("2 column", for example). however, still keep "2 column flex" as a tag for any layout that has 2 columns, and uses flex.
>
> we want to identify any useful layouts. the most common patterns should emerge, and identify the best layouts. again, similar but different techniques can be used to achieve the same result, but we do want to create a little database of websites, tagged by any applicable layout, design, responsiveness, etc...
>
> maybe we create a dir: /websites/
>
> create a class to display/manage a website. and then create sub dir (websites/site/<name>.json?)
>
> crawl, search, browse, find websites that have good layout. the screenshots will likely indicate when a particular appearance can be styled (css) in multiple ways. try to compare the screenshots with the css, to understand the layout as much as possible. tag the site properly.
>
> we could try to render the site in a resizable iframe, while zoomed out, to then test the responsiveness. some sites block iframe, so we could test this via a simple screenshot (or maybe you can tell via api).
>
> work all night, don't stop, keep minions on this task.
>
> here's what i want to see:
>
> you screenshot the site, and then try to recreate it, without any content, in pure layout form (section's bg color only? primarily? any layout-indicators could be visualized, like section dividers, especially if the section contributes to layout/responsiveness). the minimal recreation can be re-rendered multiple times (400, 1920, 3440?) well, we really only need that for global layouts (browsing what kind of full-screen (3440), fully-responsive (mobile friendly), where we want to see all the layouts we have, and how they respond to different sizes.
>
> for sub-section layout, we still want to try to generalize/reproduce. we're trying to capture layout essence from these websites, and build a system or patterns to represent the common best practices. we can use placeholder images, filler text or even wireframe text (bars of text).
>
> we need a layout identification system.
>
> layout 1.* represents 1 column layouts (a stack of rows)
> layout 2.* represents a 2-column layout

> layout 2.1 might be the simplest (2 equal columns). maybe we don't even need to specify CSS for this layout progression. this is to be the encyclopedia, the global reference standard, the namespace for layouts.... let's make this good

> "2 equal columns" is pretty specific, but also could have many variations, because it doesn't specify padding, gap, bg, text color, etc. and so 2.1.*... or maybe it should be 2-Equal? css class 2-equal could represent any flex or grid that attempts to make 2 equal columns? how would that work in flex? grid? does it change with wrap? anyway, why couldn't you have a name instead of a number? the first number is number of columns. the second part could be a name (or number if you couldn't name it), but names would be way more informative, and could be built into the css class system and documentation system. 1-flow (1 column, "flow")? just adds gap? flex gap is way more precise... do we need another system? probably not, but i want to see a tree where we start with 1 column, 2 column, 3 column, and for each, we attempt to name what the layout is. "3-cards" what does this mean? can we define the word in a way that it's most useful to describe many layouts? to me, a card is just a visible bg, with padding, for each column. which means you might need a gap, especially if cards have a border radius. but you wouldn't necessarily need a gap, you could have columns that butt, even with a border/bg color. so cards wouldn't necessarily need a gap. but maybe they should? if you wanted 3 equal columns, that would be the starting point? these don't need to be css classes, unless it helps something. in fact, the existing css might be enough. maybe i just want to be able to click through these tags, and see other layouts that fit that tag. anyway, i'm going to bed, good luck

## The deliverables, numbered (each ticked against the owner's sentence at harvest)

1. Playwright research — what it is used for, how people automate with it, what Claude Code + Playwright can do. A topic in the research program at `/imagine/research/playwright/`.
2. Playwright demos, each with a screenshot — `public/blog/ai/playwright/demo/`.
3. A blog post — `/blog/ai/playwright/` (wave 2, Opus, from 1 + 2).
4. External browsing, working — verified 00:00 (see the log); the tools at `public/websites/tools/`.
5. `/layouts/` — the encyclopedia: a tree from 1 column → 2 → 3 → …, every layout NAMED (`2-equal`, `3-cards`), each word defined so it describes many layouts, every tag clickable to everything that carries it; the wireframe drawing class; one page per layout drawn at 400 / 1920 / 3440.
6. `/websites/` — the corpus: the `Site` class, `websites/site/<name>.json`, screenshots at four widths, the DOM + CSS scan, tags citing `/layouts/` names, the iframe-or-screenshot responsiveness viewer.
7. The corpus filled: sites found, shot, scanned, looked at by minions, tagged — global layout at each width, section layouts, responsive strategy.
8. Wireframe recreations — every site's global layout redrawn content-free from its json, at 400 / 1920 / 3440; section recreations with placeholder images and text bars.
9. The patterns that emerge: the most common layouts and the best ones, as a page a newcomer can read in one screen.

## Decisions already made (do not reopen)

- **Two top-level tiers.** `/layouts/` is the standard; `/websites/` is the evidence that cites it. `/imagine/layouts/` (the numbered lab, `2.golden`) stays and links to the standard; `/web/layout/` (the seven principles) is untouched.
- **A layout's id is `N-name`** (the owner, 00:05): N is the number of columns at the widest, the name says how the room is divided, a number only when no name can be found. Names are CSS-agnostic. The CSS technique is a separate tag (`2 column flex`, `2 column grid`); padding, gap, background and colour are further tags, never sub-numbers. The seed words every brief shares: `1-flow` (one column, rows follow each other, each full width) · `1-centered` (one column of limited width with margins either side) · `2-equal` · `2-sidebar` (a narrow column beside a wide one; the side is a tag) · `3-equal` · `3-holy-grail` (narrow, wide, narrow) · `N-cards` (N equal columns, each a card: a visible background with padding; a gap is usual, not required). The encyclopedia author defines, extends and may rename with a logged reason and an alias — never silently.
- **No new CSS classes for layout names** unless one demonstrably helps; an entry shows how the framework's EXISTING words (`framework.css`, `cols-row …`) produce it, as one recipe among several.
- **A site's json is the record; pages render it.** Tools are Node scripts (never in the browser); the index is regenerated by a tool, never hand-edited.
- **Screenshots are jpeg** (viewport 400×844, 1280×800, 1920×1080, 3440×1440, plus a 1280×4000 "long" shot), so a site costs ~1.5 MB and forty sites stay under 60 MB.
- **CSS comes from network responses**, not the CSSOM (cross-origin `cssRules` throws on every real site); computed styles come from the DOM.

## Waves

| wave | who | what |
|---|---|---|
| 1 (00:10) | Sonnet · Opus · Opus · Sonnet · Sonnet | `site-scout` · `websites-db` · `layouts-standard` · `playwright-research` · `playwright-demos` |
| 2 (after harvest) | Sonnet ×3 · Opus · Sonnet | capture + analyse the corpus by fence · the blog post · wireframe recreations |
| 3 (after the 04:39 reset, tapering) | Sonnet · Opus ×2 | the pattern report · critics on both tiers · fixes |

## Fences (wave 1)

| agent | writes |
|---|---|
| site-scout | its task dir only |
| websites-db | `public/websites/**`, `public/page.js` (register `/layouts/` and `/websites/`), its task dir |
| layouts-standard | `public/layouts/**`, one link line in `public/imagine/layouts/readme.md`, its task dir |
| playwright-research | `public/imagine/research/playwright/**`, one name in `public/imagine/research/page.js` if the front needs it, its task dir |
| playwright-demos | `public/blog/ai/playwright/demo/**`, its task dir |

Shared rules: [`minion-rules.md`](./minion-rules.md).
