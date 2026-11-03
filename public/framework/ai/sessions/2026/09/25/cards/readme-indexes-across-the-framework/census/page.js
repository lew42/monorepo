import { Page, p, div } from "/app.js";
const url = new URL("../census.json", import.meta.url);
const node = (n, depth) => {
    const kids = n.children.map(c => node(c, depth + 1)).join("");
    const label = `<span class="cen-m cen-${n.mark === "✓" ? "ok" : n.mark === "~" ? "mid" : "no"}">${n.mark}</span> ${n.name}${n.missing.length && n.index ? ` <small>missing: ${n.missing.join(", ")}</small>` : ""}`;
    return kids ? `<details ${depth < 2 ? "open" : ""}><summary>${label}</summary>${kids}</details>` : `<div class="cen-leaf">${label}</div>`;
};
export default new Page({
    meta: import.meta,
    title: "Readme index census",
    description: "Every framework module marked ✓ readme with index, ~ readme without, ✗ no readme.",
    content(){
        const el = document.createElement("div");
        el.className = "cen";
        fetch(url).then(r => r.json()).then(d => {
            const c = d.counts;
            el.innerHTML = `<style>@layer site{.cen{font:15px/1.6 system-ui;columns:3 22em;column-gap:2em;padding:1em}.cen details{margin-left:1em;break-inside:avoid-column}.cen-leaf{margin-left:2.2em}.cen-ok{color:#2a9d4a}.cen-mid{color:#d99a00}.cen-no{color:#d33}.cen small{opacity:.6}.cen h3{column-span:all;margin:0 0 .5em}}</style>
<h3><span class="cen-ok">✓ ${c.ok}</span> · <span class="cen-mid">~ ${c.noindex}</span> · <span class="cen-no">✗ ${c.none}</span></h3>${node(d.tree, 0)}`;
        });
        return el;
    },
});
