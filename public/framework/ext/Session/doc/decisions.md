# Decisions

## Open

- **CSS prefix `session-` is not yet in `public/framework/styles/css-scopes.txt`** (outside
  this task's fence). `page.js` and `Session.css` already use it (`session-demo-*`), and the
  census turned up no collision. The next agent who can write `css-scopes.txt` should add
  the line `session-   ext/Session`.
