// THE ONE FILE. Every shot, every realm and both totals come from `shots.json`,
// fetched exactly once — here, at module scope. `page.js` builds the DOM
// entirely synchronously from `journey`; no await anywhere near a factory call.
export const journey = await fetch(new URL("shots.json", import.meta.url)).then(res => res.json());
