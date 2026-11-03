# core/Page: how a page.jsonl is found and built

## Q1, the handoff

1. **How the walk reaches a child folder that holds only `page.jsonl`.** The parent asks `child(name)`. If the name is already in `children`, that wins (`Page.class.js:363-365`). If `child_kinds` says it is a jsonl child, the jsonl loader runs (`Page.class.js:367-369`). That mark is set when a `file` line names `kid/page.jsonl` (`Jsonl.js:80-86`). Otherwise the parent's listing decides: if `listing.pages` says `kind === "jsonl"`, the loader runs (`Page.class.js:381-387`). The listing is found only if already loaded; the code does not probe the folder blind. A plain `page.js` is a separate step 5 (`Page.class.js:393-394`).
2. **Where the Page instance is built, and what replays the lines.** `Page.jsonl(url)` (`Page.class.js:198`) calls `Jsonl.load(host, url)` (`Jsonl.js:26-49`). That reads `page.jsonl`, takes line 1 as the page's properties, and builds the instance at `Jsonl.js:42`: `new Class(line, { url, jsonl_url })`. `Class` is `host` (`Page`) unless line 1 has `class` (`Jsonl.js:40`). Then `reader.attach(page)` (`Jsonl.js:45`) replays the remaining lines onto it (`Store.js:101-112`).
3. **Recursion: yes.** A jsonl page is a `Page`, so it runs the same `child()` (`Page.class.js:360`). Its own `file` lines fill its `child_kinds` and listing (`Jsonl.js:60-64`, `Jsonl.js:80-86`). A child that has `page.js` is loaded through `Page.load` (`Page.class.js:393`, `Page.class.js:453-456`). A `page.jsonl` line 1 that is a `file` line makes the folder a listing, not a page (`Jsonl.js:36-38`).
4. **Who calls `child()`.** The Router's walk, `Router.load_segments()` (`Router.js:100-108`, the call at `Router.js:104`). Other callers: `Library.js:38`, `Library.js:50`, `Library.js:63`, `library/Item.js:28`, and `ext/tabs/tabs.js:91`.

Doc note: `doc/loading.md` and the Page child doc cite `load_all_children()` at `Page.class.js:180`. That line is now blank (between `tab_state` and `place`), so that citation is stale.

## The call chain

```
Router.load_segments(url)                       Router.js:100-108
  → page.child(name)                            Page.class.js:360
      → Page.jsonl(url + name + "/")            Page.class.js:198 (or the listing branch, :385-387)
          → Jsonl.load(host, url)               Jsonl.js:26
              → reader.open(), line 1           Jsonl.js:34-38
              → new Class(line, {url, …})       Jsonl.js:42   (Class = Page unless line 1 has "class")
              → reader.attach(page)             Jsonl.js:45   → Store.js:101 replays the rest
```

## Q2, an example

Spliced from two real files. Lines 1, 2, 4, 5, 6 come from `core/Page/parts/page.jsonl`. The tab line and the navigation line come from `core/Page/tool/page.jsonl`. I removed the `by`/`ts` fields and the description. This is an excerpt for explanation, not a runnable folder.

```jsonl
{"title":"Parts","icon":"view_agenda","class":"./Parts.js"}
{"tab":{"name":"notes","title":"Notes","content":"A tab an agent added."}}
{"navigation":"tabs"}
{"content":{"add":{"id":"h1","type":"part-heading","text":"A page made of parts"}}}
{"content":{"add":{"id":"c2","type":"part-card","title":"Added later","text":"One appended line."}}}
{"content":{"move":{"id":"c2","after":"h1"}}}
```

| Line | What it changes | Does order matter on replay? |
|---|---|---|
| 1 | Builds the page: title, icon, and the `class` that makes the instance (`Jsonl.js:40-42`). | Yes. It must come first, or the folder is read as a listing (`Jsonl.js:36-38`). |
| 2 | `tab`: adds a tab named `notes`, or merges into it (`Jsonl.js:100-125`). | Only for repeats: a later line for the same name merges, it does not replace (`Jsonl.js:99`). |
| 3 | `navigation` is a page word: sets the page's navigation to tabs (`Jsonl.js:136`). | Yes, for a word set twice: the last one wins. |
| 4 | `content.add`: appends the heading `h1` to the page's content list. | Yes, before any line that refers to `h1`. |
| 5 | `content.add`: appends the card `c2`. | Yes, before the move that refers to `c2`. |
| 6 | `content.move`: moves `c2` to sit after `h1`. | Yes. It refers to `c2`, so it must come after line 5. (What a move of a missing id does is not traced.) |

Order is replay order. The loader reads the file top to bottom and applies each line to the instance it built (`Jsonl.js:45`, `Store.js:110-111`).
