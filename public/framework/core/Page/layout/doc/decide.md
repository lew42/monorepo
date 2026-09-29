# Deciding a layout — the five questions, then the five sizes

There are two short lists, asked in this order. The first picks the SHAPE of a page. The
second sizes it once the shape is picked. Both live somewhere else; this page only says how
they fit together.

## First: which shape (C1–C5)

Drawn live, with demos: [/layouts/decide/](/layouts/decide/). One at a time, in order —
a list read all at once gets answered all at once, and thinly.

1. **How much room is there?** Worked out top down: the site nav and any rail come first.
2. **How much content is there?** A little wants a small tight box; a lot wants tabs or a left nav.
3. **Is it outlined yet?** If not, write the outline first; the layout often picks itself.
4. **How will the content fill the width?** Equal columns, a centred title column, a wall, a nav beside a main.
5. **Which approved layout fits?** [The approved five](/layouts/doc/studies/approved/); if none, it is a proposal.

Each is a judgement with its usual answers, never a rule (the owner, 2026-09-28). To ask them
of a real page, one at a time: `node Server/ask-each.mjs` on `public/layouts/decide/questions.md`
([a worked run](/layouts/decide/servex/)).

## Then: how big (the `layout` skill's five)

Container · size at 400 / 1280 / 1920 / 3440 · its own layout · how many regions · its preview
on the parent. These live in the `layout` skill (`.claude/skills/layout/SKILL.md`), with the
traps that bit beside each one.

## Before any of it: the parent

Navigation and the parent page come before either list. A child page's room is whatever its
parent's layout leaves it, so read [Navigation](/framework/core/Page/navigation/) and look at
the parent first.
