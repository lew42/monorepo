Build the chrome, and decide where pages mount.

```js
render(){
    this.$body = View.body();

    this.$app = div.c("app", () => {
        this.$pages = div.c("pages");
    });

    View.set_captor(this.$pages);
}
```

## Usage

- `App.js:25` — `instantiate()`, step two.
- `app.js:52` — this site's override: a nav strip above `$pages`, and
  `theme-lew42` on `$app`.

## Necessity

Essential, and it is the **one method a site is expected to override.** Everything
this framework calls chrome is built here, once — navigation never touches it, so
a sidebar can't blink and a scroll position in it can't reset.

Two rules an override owes, both silent when broken:

- **pages mount into `$pages`**, so `Page.container()` has something to find;
- **the captor has to end up there** (`View.set_captor(this.$pages)`), because a
  page's view is built by an element factory and a factory appends to the captor.

Miss the second and every page lands in whatever the captor happened to be.

## Simplicity

Right-sized, and the `set_captor` line is the one piece of it that is not
self-evident — it is the synchronous-capture machinery leaking exactly one line
into userland. Nothing better has been proposed; deriving it (*"the captor is
whatever `$pages` was set to"*) would be behaviour you can't see from the file that
implements it.
