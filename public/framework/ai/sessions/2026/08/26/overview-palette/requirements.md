# S2 — core/Page Overview becomes the visual palette

## The ask (verbatim, owner — last four paragraphs of column-pages/requirements.md)

> what i'm realizing, is that all the page previews in the grid on the core/Page/ page, none of the visual previews are particularly revealing. they don't communicate what it is. generally, a grid should be extremely visual - self evident previews.
>
> for example, the top tabs that we have, i should see a little preview of page with only top tabs, no distracting content.
>
> i should see a preview of the left sidebar tabs, both the core/Sidebar style, and the "inner" (Docs api/method tabs) version. we should see the preview of that, and only that... and when clicking on it, see how to use it.
>
> so, this core/Page overview, should be all the building blocks that can be utilized by the page generator. create the page generator at core/Page/generator/, make it one of the top tabs.

## Scope

1. A miniature-picture widget: chrome-free static CSS wireframes, no live app, no text content.
2. Every card in the core/Page Overview `browse()` wall gets one; bands reorganized so the wall
   reads as "the building blocks the generator can use".
3. `columns` + `crumbs` into `methods:`; `doc/method/columns.md` + `crumbs.md`; `files:` accurate.

## Fence (owned)

`core/Page/page.js`, `core/Page/overview/**` EXCEPT `overview/columns/**`,
`core/Page/doc/method/columns.md` + `crumbs.md`, one new widget file + its css.

Do not touch: `core/Page/Page.css`, `Page.class.js`, `core/Page/generator/**`,
`overview/columns/**`, `ext/Doc`, `ext/tabs`.
