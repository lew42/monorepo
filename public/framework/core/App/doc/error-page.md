# The error page renders into `$pages`, never `$app`

```js
error(error){ this.$pages.empty(() => { … }); }
```

Emptying `$app` would delete the chrome, so **the one page that most needs
navigation would be the one page without it.** The try also covers the first
navigation, not just the import: `activate()` renders every page in the chain,
which runs every `content()` there is, and a throw in any of them would otherwise
skip `inject()` and paint nothing at all.
