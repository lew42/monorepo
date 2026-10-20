# new/1 — new/0 plus a Router, lazy children, and regions

> **This is the design that shipped.** `Router.js` here is line-for-line the one
> in `core/Router/`, and `children`-as-a-Map, `container()` and `Router.mark()`
> all went to `core/` unchanged. Read this as the **long form** of
> `core/App/readme.md`, `core/Page/readme.md` and `core/Router/readme.md` — it has
> the measurements and the council round those summarise.
>
> The *code* in this directory is the prototype it was proved on. Don't import it:
> `public/` is the deploy artifact, so a stray `../new/1/Page.class.js` resolves to
> a real file and yields a second, different `Page` class, silently.

- Moved verbatim to [doc/readme-full-2026-10-12.md](./doc/readme-full-2026-10-12.md): the full design record.

## Also here (readme audit, 2026-10-13)
- [site](./site/)
  - its parts: [chrome](./site/chrome/) · [kit](./site/kit/) · [library](./site/library/)
