import { div, code, style } from '/app.js';

style(`
  .snippet .line {
    white-space: pre-wrap;
    tab-size: 1;
  }
`);

export default function (snippet) {
  if (typeof snippet != 'string') return "";
  const lines = snippet.split("\n").filter(l => l.length);
  div.c("snippet", () => lines.forEach(l => code.c("line block", l)));
}
