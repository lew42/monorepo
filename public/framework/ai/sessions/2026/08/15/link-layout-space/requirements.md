# link-layout-space

## The ask (verbatim)

> add this link:  http://localhost/framework/ai/2026-08-14/layout-space/
>
> to the frameork/styles/layouts/space/ page... i sort of forgot writing this
> prompt, i think its funny

## Scope

One line on one page: `styles/layouts/space/page.js` gets a link to the task
log that built it. Root-absolute (`/framework/ai/2026-08-14/layout-space/`),
not the localhost url — production is static hosting on another domain, and
every sibling page that links a task log already does it this way
(`ext/editor/page.js`, `ext/Panel/page.js`).

No agents.
