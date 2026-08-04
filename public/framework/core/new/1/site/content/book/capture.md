# Chapter one — the boundary

Everything in this book rests on one property of the view layer, so it goes
first. `View.captor` is a single global variable holding the view that is
currently collecting children, and every element factory appends its result to
it. Nesting is a push and a pop:

```js
div.c("card", () => {
    h1("Title");        // appended to the card
    p("Body");          // appended to the card
});                     // captor restored
```

The restore happens when the callback **returns**. For a synchronous function
that is the last line, which is why the shape above is safe and reads exactly
like the DOM it produces. For an `async` function, returning happens at the
first `await`, and everything after it appends to a captor that has already
moved on.

Nothing throws, because nothing is wrong from the DOM's point of view: a factory
appended a valid element to a valid parent. It was just not the parent you meant,
and it is usually the app's page container — so the element renders, on screen,
as a sibling of every page on the site.

## Content lives on this edge

An ordinary page builds its DOM from literals and never touches the boundary. A
content page fetches, always, by definition. That makes this the one rule a
content author cannot learn later.

The discipline is a single sentence: **capture the container synchronously, then
append into it by name.**

```js
content(){
    return div.c("article", $article => {
        $article.append(md.file(import.meta, "chapter.md", { h1: false }));
    });
}
```

`$article` is passed to the callback precisely so the async half never has to
consult the global. When the promise settles a second, third, tenth time later,
it appends to a view that has known its parent since the synchronous turn.

## The promise is the shortcut

`View.append` dispatches on argument type, and a promise routes to
`append_promise`, which awaits and appends the result to `this`. Since `this` was
placed synchronously, returning a promise from `content()` is safe with no
container of your own:

```js
content(){ return md.file(import.meta, "chapter.md", { h1: false }); }
```

That is the whole minimal content page. It is the form to reach for unless you
need something *around* the fetched markdown — a table of contents, a prev/next
bar, a byline — in which case you are back to capturing a container first.

The next chapter is about what happens when the thing you fetched wants to
appear in more than one place.
