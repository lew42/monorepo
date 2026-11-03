// Can the real Page class replay page.jsonl lines in node? Run: node --import ./reg.mjs probe.mjs (from this folder).
// hooks.mjs maps site-absolute imports ("/framework/...") to public/; the stubs below are a do-nothing DOM.
// A do-nothing DOM: every property is a callable proxy, so module-level side effects pass.
const fake = () => new Proxy(function(){}, { get:(t,k)=> k===Symbol.toPrimitive ? ()=>"" : k==="then" ? undefined : fake(), apply:()=>fake(), construct:()=>fake(), set:()=>true });
for (const k of ["Element","HTMLElement","Node","Text","DocumentFragment","Event","CustomEvent"]) globalThis[k] = class {};
for (const k of ["document","location","localStorage","sessionStorage","customElements","MutationObserver","ResizeObserver","IntersectionObserver","requestAnimationFrame","getComputedStyle","history","navigator","matchMedia","CSS","DOMParser"]) if (!(k in globalThis)) try { globalThis[k] = fake(); } catch {}
globalThis.window = globalThis;
globalThis.location = { href:"http://x/", origin:"http://x", pathname:"/", search:"", hash:"", host:"x", hostname:"x", protocol:"http:" };
try {
  const m = await import("../../../Page.class.js");
  await import("../../../parts/PageHeading.js"); await import("../../../parts/PageText.js");
  const Page = m.Page || m.default; console.log("Page imports:", Page?.name);
  const pg = new Page({ name:"t" });
  pg.set({ content:{ add:{ type:"part-heading", text:"Findings" } } });
  pg.set({ content:{ add:{ type:"part-text", text:"hello **md**" } } });
  pg.set({ content:{ add:{ type:"no-such-type", text:"?" } } });
  const L = pg.content; console.log("content class:", L?.constructor?.name, "keys:", Object.keys(L||{}).slice(0,12).join(","));
  const arr = L?.items ?? L?.all?.() ?? L?.list ?? [];
  console.log("n:", arr.length ?? arr.size, [...arr].map(c => c.constructor.name + ":" + (c.type ?? c.data?.type) + ":" + (c.text ?? c.data?.text)).join(" , "));
} catch(e){ console.log("FAIL:", e.message.split("\n")[0]); console.log(e.stack.split("\n").slice(1,4).join("\n")); }
