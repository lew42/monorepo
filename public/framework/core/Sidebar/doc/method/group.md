A titled block of links.

## Usage

`Sidebar.js:86` — `nav()`, for any entry that has `pages` of its own. Nothing else.

## Necessity

Keep. It is six lines and it is the reason there is no `groups` property: a group
**is** an entry, so a site that starts flat and grows sections changes its data, not
its call.

**A group heading can never also be a link.** That is a real cost and it is the
correct one — a heading that navigates is a link pretending to be a heading. The
convention that pays for it is a first entry called "Overview" pointing at the
section's own url (`framework/page.js:100`); without one, a grouped sidebar has no
way to reach `/framework/core/` at all.

## Simplicity

Right-sized, and it carries the trap this component paid for twice:

```js
div.c("sidebar-group-title", () => span.c("h4", group.title));
```

**`.h4` on an inner span, never on the padded box.** `em` resolves against the
element that *uses* it, so sizing and padding the same element misaligns the
column — `--gutter: 2.6em` measured 36.5px on the `.h4` title and 41.8px on every
link beneath it. A custom property carries a **token**, not a resolved length.
**Size the text, pad the box.** [comp](/framework/core/Sidebar/docs/comp/).

The extra `<span>` is one element to buy an invariant that nothing else can check.
