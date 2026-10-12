# web-resume-fixes

Four S-sized fixes from the web/resume critique (`ai/2026-08-30/critique-web-resume/task.jsonl`).

1. **/resume/ og card** — give the résumé its own meta (its index.html or shell — investigate
   how /resume/ is served first; the blog's meta.mjs pattern is the model). Title/description
   drawn ONLY from text already public on the page ("Design engineer, 12+ years" per the
   homepage section desc). og:image: an existing committed image or none — do not screenshot
   the résumé into a card without the owner.
2. **Résumé <-> blog cross-links** — on /resume/, a small unobtrusive link to /blog/ (and
   home); in the blog's sidebar sections or footer, a Résumé link. Match each page's existing
   chrome idiom — the résumé has none, so the smallest honest affordance (a corner link), not
   a nav bar.
3. **Sticky Depth/Motion bar overlap** — it overlaps the "Selected Work" heading on scroll
   (shot in the critique dir). Fix the stacking/offset at the cause.
4. **/web/ layout.bar invisible at rest** — `opacity: 0` until hover with zero hint. Give it a
   visible rest state (dimmed but present, or a one-time affordance) — the critique's point is
   discoverability; keep it quiet, not loud.

## Fence

`/resume/**` (except the CONTACT data), the blog's sidebar/footer file, `ext/layout`'s bar CSS
(rest-state only), `/web/`'s page CSS if the fix lives there. Nothing else.

## Traps

Every CSS rule in a layer; one backtick inside `css(\`…\`)` kills every page; the résumé has a
3D parallax — don't disturb its scroll machinery (test after).

## Verify

curl the résumé url for the new tags; cross-links click both ways; the sticky bar clears the
heading (before/after shots); the layout bar visible at rest on /web/layout pages; parallax
still scrolls (visual check at 3 scroll positions); zero console errors.
