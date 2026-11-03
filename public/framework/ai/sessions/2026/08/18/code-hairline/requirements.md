# The inline-code hairline leaks into every `pre`

## The ask, verbatim

> you probably can't see, but someone put a box-shadow: inset 0 0 0 1px var(--line) on the code element in framework.css:274
>
> jesus that looks bad... why?!  in every dark pre box, there's a code element, with an ugly white border, please undo this.  can we tell who/when/where/why this was done?

## Scope

`public/framework/framework.css` only. Report the provenance.
