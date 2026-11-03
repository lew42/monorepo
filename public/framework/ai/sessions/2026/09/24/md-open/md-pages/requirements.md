# md-pages — markdown files render as pages

## The owner's words (verbatim, handoff2-owner-words.md, 2026-09-24)

> I was trying to figure out a way how to load README files, uh, like to render, basically render README files without having to do a uh, complicated routing. And I think an easy way to do it is to just have a, a um, hook for that route function that looks at some pattern. And if it has an MD in it, then it could just be a normal path part, like forward slash MD forward slash, and then the name of the file could be converted then to just the file name dot MD. Um, because we have a lot of linked MD files that are not rendering properly. And so that's, you know, I would say that's a top priority to try and get uh, markdown files rendering properly in a nice browser session so I can kind of click around

> Okay, for the for the uh, route uh, snippet you just did ends with .md. That's not going to work because the the static server is just going to respond with the actual raw markdown file instead of. We need a, a, pa a path system or pattern that's different from um, different from. Uh, the standard like file request

> I'm thinking that a lot of these uh, routes could be baked into like the underlying class so that they, you know, any path automatically or any page really automatically gets certain kind of routing modules built in. So for example, the MD path ... ext slash panel slash MD slash decisions and probably without a final slash would ... render the slash ext slash panel slash decisions dot MD. ... it does preclude you from using the slash md uh, directory. However ... you could do like ext slash panel slash md dash decisions without an ending slash

## Deliverables

1. Check first: a URL that is not a real file reaches the app (dev proven, production reasoned).
2. Built into base Page: `/<module>/md/<name>` renders `<module>/<name>.md`; `/<module>/md/` lists the module's markdown files. Decision line with the alternative.
3. Existing .md links across the site lead to the rendered page — change the link-maker once.
4. Headless proof: one rendered doc, one md index, zero failed requests.
5. Merge into michael/dev under hold; documentation; finish-task; card_reply.

Fence: the Page/Router core + the link-maker(s) + md-rendering module; worktree branch.
