A face (`{ name, url, options }` and one `load()`) and a static registry keyed by
name. Thin on purpose — `Font.fonts` is the part meant to be read as data.

## Both halves of `load()` are required

`FontFace.load()` fetches the file; `document.fonts.add()` is what makes the
family usable in CSS. Skipping either fails in a different, silent way. Full
detail: `../fonts.md`.

## The registry is memoized, not registered

`Font.load(name)` is `Font.loading[name] ??= …` — two callers asking for the same
face share one fetch, with no `register()` step. A typo'd name throws at boot,
which is the right loudness for a design bug.

## Improvements

1. **Both shipped faces are unvendored `fonts.gstatic.com` urls** — the one place
   in the framework that breaks `ext/`'s "vendor the dependency" rule. Offline,
   these fall back silently with no warning. Stated in `../fonts.md` and the
   readme, not settled: vendoring costs ~166KB for a look most sites won't load.
   *(medium, useful — a decision for the owner, not a bug.)*
2. **The instance could collapse into a single function.** Three properties, one
   method; it stays a class because `Font.fonts` reads as data about *fonts* and a
   face has an identity that outlives its load. Recorded, not a real cost.
   *(simple, speculative.)*
