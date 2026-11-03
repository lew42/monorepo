# content — every shape a page's `content` can take, one child page each

Live: [/framework/core/Page/content-shapes/](/framework/core/Page/content-shapes/). The design: [doc/content.md](../doc/content.md), "Design: `content` is always a List".

## Use
`page.content` is one List for the life of the page. A function (`content(){…}`), a string, an address or a list of parts all end up as items in it; `{"content": …}` lines in `page.jsonl` add parts beside them.

## Index
- Children `Code`, `String 1-5`, `Address 1-5`: the old shapes, each drawn as before.
- [both/](/framework/core/Page/content-shapes/both/): a class with `content(){…}` and a `page.jsonl` line; both show.
- [class-body/](/framework/core/Page/content-shapes/class-body/): a class that defines `content(){…}` in its body.
