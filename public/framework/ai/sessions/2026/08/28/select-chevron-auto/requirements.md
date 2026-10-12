# select-chevron-auto

## The ask (verbatim)

> i put a select { width: 100%; } in the framework.css. what do you think of that
> rule? generally, i prefer all the form elements to align (full width), however,
> it seems this rule is being "unset" frequently (width: auto).
>
> also, the little chevron thing we have on select elements is broken in several
> places (typically when we use width: auto).
>
> maybe select.auto could be used as a utility to switch back to width: auto;
>
> the chevron we have as a background svg is set to background-origin:
> content-box; and background: field no-repeat 100%; i believe is what pushes it
> all the way to the right. with the origin content-box, the right padding pushes
> the chevron, which isn't really what we want. instead of
> background-position-x: 100%;, is there a way to offset a certain px from the
> right edge? like right: 0.5em?

Then, on the assessment (keep width:100%; fix the arrow with edge-offset
position; add select.auto): **"do it"**.

## Scope

- `public/framework/framework.css` — the select chevron rule: edge-offset
  position (`right 0.5em center`), drop `background-origin: content-box`,
  reserve `padding-inline-end` clearance; add `select.auto { width: auto }` to
  the util layer. `width: 100%` stays.
- Sweep the five chrome selects to the utility and drop now-dead local patches:
  ext/AITask compose (effort/model), ext/demo stage (demo-zoom), ext/layout
  (layout-pick), ext/DesignTool vision (dt-vb-select), core/Page/generator
  (page-gen-menu).
- Verify headless: element shots + computed style at each call site, plus the
  form-context select (ui/field) still full width with a correct arrow.
- Owner approved the name `select.auto` knowing `.grid.auto`/`.flex.auto`
  carry a different meaning; still runs the new-css-class check.
