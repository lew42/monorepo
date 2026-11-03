# Decisions — ux/Auth, 2026-08-21

The first `ux/` class built against [`doc/system.md`](/framework/ux/doc/system/). What was
chosen, and the evidence for the one question the brief asked outright: does the
named-extension pattern hold up for a *workflow*, not just a component?

## Verdict: yes, and cheaply

`MagicAuth extends Auth` is 14 lines and overrides four seams — `login_title()`,
`login_cta()`, `password_field()`, `Auth.confirmations`. Nothing about `signup()`,
`reset()`, `switch()`, validation or the social row moved. That is the claim
`doc/system.md` §3 makes for a component (`CardHero extends Card`) holding for a
*stateful, multi-screen* class — the harder case, because a workflow has more surface
for an extension to be "half a step off." It wasn't: the password step was already its
own seam (`password_field()`) before MagicAuth existed, because `login()` reads like a
sentence better with one than without — the extension didn't force the refactor, it
just proved the seam was in the right place.

**Where it would have broken:** if `login()` had built the password field inline
instead of calling `this.password_field()`, MagicAuth would have had to override the
whole method — copying the email field, the button, the switcher, the social row —
which is exactly the fork this module exists to avoid. The rule this leaves for the
next `ux/` class: **a method that composes three things is a seam per thing**, not one
big method three call sites happen to share.

## The five layout questions (asked before the first factory call)

1. **Container:** neither of core's tracks — a form is not prose (`main`) and the
   demo isn't a dashboard (`bleed` alone). The card is `.measure` (framework.css),
   which caps and centres; the CALLER supplies the ground it centres against.
2. **Size:** 400 = the wash band's full width, card at its own cap; 1280/1920/3440 =
   card stays the same ~26em, band fills the rest. Never full-width, never a fixed
   px — `.measure`'s `max-width: min(var(--measure), 100%)` is the floor and the
   ceiling in one declaration.
3. **Own layout:** `flex v gap` throughout — one field is a `label` wrapping its
   `input` (`ui/field`, verbatim), tightened with `--gap: 0.4em`; the form's own
   fields sit at the default `1em`, which is right *between* them.
4. **Containers on the page:** two — the exhibit band (render + source, the standard
   shape) and the words-proof band. `magic-auth` is a third only in the sense that
   Doc gives it its own tab, not a region on this page.
5. **Preview:** the login screen at `zoom-50` on a `wash` — a picture, not a live
   card; the same reason `ui/dialog`'s preview is `showModal()`'s output drawn
   inline rather than a closed dialog nobody could see.

## CSS: one call, one class

`ux-auth-card` exists to *scope* one declaration — `:user-invalid` reddening a
border — so it cannot leak into an unrelated form sharing the page (the words-proof
band renders two more Auth cards). Width needed no CSS at all: `.measure` already
does `max-width` + `margin-inline: auto`. Registered `ux-auth-   ux/Auth` in
`styles/css-scopes.txt`, alongside `ux-tree-` and `ux-wizard-` — siblings on the
same day chose a **per-module** prefix over a shared `ux-` tier prefix (unlike `ui-`,
which covers all of `ui/`); followed that precedent rather than the tier-wide read of
the brief, for consistency with what was already on disk.

## The `novalidate` trap

A `<form>` with no `novalidate` never fires its `submit` event when a field is
invalid — the browser intercepts it for its own bubble UI, and a listener that
assumes `submit` means "let me check `:invalid`" silently never runs on the exact
input it exists to handle. `:invalid`/`:user-invalid` still compute with
`novalidate` on; only the auto-block and the native bubble turn off. Every form in
`Auth.js` carries it for this reason — found by reading the spec, not by a failed
screenshot, but the interaction proof (task screenshots) is what confirms the
message actually renders in `ui/alert` instead of the browser's own tooltip.

## Cut

The `layout`/`css` skills' full five-question pass on the *words-proof* band was
skipped — it reuses `ui/words/page.js`'s own `half()` shape verbatim, already argued
there. Real-provider OAuth, a "remember me" checkbox, and password-strength meter
were never in scope: brief explicitly rules out fake OAuth, and a meter is a fourth
field's worth of the same "every real form wants a fourth thing" argument
`ui/field/page.js` already makes for staying a template.
