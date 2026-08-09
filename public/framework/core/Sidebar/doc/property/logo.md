The image url beside the wordmark. Defaults to the document's own favicon.

```js
const logo = this.logo ?? Sidebar.favicon();   // Sidebar.js:47
```

## Usage

`Sidebar.js:47`, `50` — `header()`. Nothing in the repo sets it; every sidebar here
takes the favicon default or replaces `header`.

## Necessity

Keep. It is the override for a default that is deliberately magic — a core
component reading the document's `<link rel="icon">` — and without it there is no
way to say *"not that one"* short of replacing the header.

`??`, so `logo: false` and `logo: null` both mean **no image**, and the wordmark
renders alone. That is the only way to turn the favicon off.

## Simplicity

Right-sized: a url in, an `<img>` out, `alt=""` because the wordmark beside it
already says the name.

The default is the interesting part, not this property.
`Sidebar.favicon()` reads DOM this class does not own, which is neat and slightly
magic — [favicon](/framework/core/Sidebar/api/favicon/) weighs it. The alternative was
hardcoding an asset path into a core component, which is worse.
