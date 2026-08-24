## `MagicAuth.js`

The named-extension proof: a link instead of a password. Four seams override —
`login_title()`, `login_cta()`, `password_field()` (returns nothing, so nothing
renders), and `Auth.confirmations.login`. Fourteen lines; everything else in
`Auth.js` is unchanged. [`doc/decisions.md`](../decisions/) has the verdict.
