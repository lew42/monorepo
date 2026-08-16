A design spec for code **nobody has written yet** — the textarea-over-`<pre>`
overlay editor this ext exists to eventually power. Kept as a plain `.md`
file rather than a `notes:` entry because it documents something that
doesn't exist in the module, so there is no member or file for a note to sit
beside; the Files tab is the honest place for a design record about
not-yet-built code, same as any other file here.

Read this before building `Editor` — the alignment section (metrics,
trailing newline, Tab, scrolling) is four independent ways the illusion
breaks, each with its fix already worked out, and the "why highlight.js
specifically" section is the argument for keeping this ext's highlighter
choice synchronous even if a future rewrite is tempted to swap it.

## Improvements

1. **Nothing to rank — it's a spec, not code.** The one open item inside it
   worth surfacing here: Tab-trapping has no Esc-then-Tab escape yet, flagged
   in the spec's own "Known limits" as something that "should be, before this
   ships anywhere real." *(medium, important — blocks accessibility sign-off
   whenever `Editor` gets built, not before.)*
