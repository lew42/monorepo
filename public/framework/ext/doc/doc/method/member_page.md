The one page shape shared by all three member kinds: an optional banner, an optional
source pane, then the prose. A method, a property and a note differ only in **where
the source comes from** and **which file the prose is in** — so they are three calls
to this, not three page builders.

```js
this.member_page(section, "append", {
	source: dedent(String(fn)),
	call: "append(){ … }",
	file: "doc/method/append.md",
});
```

**⚠ The `md.file()` promise is returned, not called.** `content()` runs under a
synchronous captor; a promise handed back is placed by `append_promise` into the
view that captor already made. Awaiting it here instead would build DOM after an
`await`, and every factory call after that point appends to whatever the captor has
since become.

`doc` is captured as a local because `content()` runs with `this` bound to the
**member page**, three levels below the `Doc` that knows the meta and the subject.
One local beats `this.parent.parent`.
