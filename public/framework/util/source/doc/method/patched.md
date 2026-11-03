Has an ext replaced this member? `fn.name !== name`.

## The one line of trivia this rests on

JS infers a function's name from assignment to an **identifier**, never to a
member expression. `append(...args){}` (a shorthand method) carries
`fn.name === "append"`; `View.prototype.append = function(…){}` (a runtime
patch) carries `fn.name === ""`. That gap is the entire check.

## Why surface it instead of hiding it

`ext/highlight` really does replace `View.prototype.append` at import time,
so on this site the running `View.append` **is** the patch. A doc page that
quietly showed the original source would be documenting code that no longer
runs. [`Doc`](/framework/ext/Doc/) prints a banner instead of staying silent.

## The sharp edge

It cannot tell *"an ext replaced a core method"* from *"an ext added a method
core never had"* — both produce an anonymously-assigned function. Nothing
calls it against that second case today; if one does, name the function
(`= function tabs(names){`) rather than teach this a second concept.

## Used by

`Doc.api()` in [`Doc.js`](/framework/ext/Doc/files/) — the banner on a
documented method's page.
