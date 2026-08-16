# devbar-fouc

## The ask (verbatim)

> the devbar renders and then animates away on reload, can you fix that?

## Diagnosis

`App.instantiate()` holds `$app` back until every stylesheet has loaded
(`inject()` runs after `await this.load()`), but `devbar()` — called from
`render()` — appends its bar straight to `<body>` immediately. On reload the
bar sits in the DOM unstyled while `devbar.css` is still downloading; when the
sheet lands, `.dev-bar` receives `transform: translateX(100%)` **and**
`transition: transform 0.18s` in the same style update, so the closed bar
visibly slides off instead of simply being off-screen.

## Proposal

1. Diagnose the reload flash (boot order vs stylesheet arrival)
2. Fix: DevBar defers its `append_to(View.body())` onto `app.styles_loaded()`
3. Syntax-check the edit; verify the reload in the browser
4. Touch up any doc line the mount-timing change makes stale
5. Land

Scope: `public/framework/dev/DevBar/DevBar.js` (+ its doc files if stale).
No agents.
