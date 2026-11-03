The alert exhibit plus two variants: `tones` (the neutral/error pair) and
`action` (an alert with a button in it).

## Why there was no `ui.alert()`

Two real bugs, not just thinness: a bare `alert` shadows `window.alert`, and
`alert("msg")` — one string, the icon-name argument — failed **silently** by
rendering the message text as a material-icon ligature. Both are the kind of
trap this framework's docs exist to record even after the code that caused
them is gone.

## Improvements

Nothing ranked: the two real bugs are already the headline of the exhibit
note, which is exactly where a reader tempted to rebuild the function would
see them first.
