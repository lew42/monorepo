/* THE ONE FILE. Every word, every number and every article in the magazine comes
   from `issue.json`, fetched exactly once — here, at module scope.

   ⚠ Top-level `await`, on purpose. `contents/page.js` builds its article pages FROM
     the issue, and a page only exists once its parent's `children:` names it: the
     Router walks DECLARED children and nothing crawls. A child that appears after a
     promise resolves is not declared, so a cold load of an article url would 404.
     The module simply does not finish evaluating until the issue is here, and the
     dynamic `import()` that loads a page.js waits for that on its own.

   ⚠ No DOM anywhere near this await — the captor is a render-time thing and nothing
     here renders. That trap belongs to `content()`, not to module scope. */

export const issue = await fetch(new URL("issue.json", import.meta.url)).then(res => res.json());

export default issue;
