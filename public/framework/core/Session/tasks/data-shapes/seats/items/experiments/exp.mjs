const R = "file:///C:/Code/lew42/monorepo/public/framework/core/";
const { default: Item } = await import(R + "Item/Item.js");
const { default: List } = await import(R + "List/List.js");
const Store = Item.Store;
const log = (k, v) => console.log(k.padEnd(4), JSON.stringify(v));
const rec = host => { const lines = []; const s = new Store({ url: "/x.jsonl" }); s.append = l => lines.push(JSON.parse(JSON.stringify(l))); s.attach(host); return lines; };
const fresh = () => { const p = new Item({ id: "p" }); p.a = new List({ owner: p, name: "a" }); p.b = new List({ owner: p, name: "b" }); return p; };

// E1 bare Item: constructor field goes where?
{ const i = new Item({ title: "x" }); log("E1", { own: Object.hasOwn(i, "title"), data: i.data.title, json: i.toJSON() }); }

// E2 sibling-unique ids: same id in two lists of one owner
{ const p = fresh(); const lines = rec(p);
  p.a.add({ id: "s1", title: "sentence" }); p.b.add({ id: "s1", title: "card" });
  p.b.find("s1").set({ title: "card edited" });
  log("E2w", lines.at(-1));
  const q = fresh(); for (const l of lines) q.replay_line(l);
  log("E2r", { a: q.a.find("s1")?.get("title"), b: q.b.find("s1")?.get("title") });
  // and an id equal to an id deeper down: get() only scans direct lists
}

// E3 snapshot by whole-object assign
{ const p = fresh(); p.a.add({ id: "k", title: "K" }); p.set({ title: "T", gone: 1 });
  const snap = JSON.parse(JSON.stringify(p));
  log("E3s", snap);
  const q = fresh(); q.set(snap);
  log("E3a", { title: q.get("title"), data: q.data, a: [...q.a].map(x => x.id), type: q.get("type") });
  // the set-delta form: {set:{...data}} can not delete a key
  const r = fresh(); r.set({ gone: 1 }); r.set({ set: { title: "T" } }); log("E3b", r.data);
  // hydrate is the snapshot reader that exists
  const h = Item.hydrate(snap); log("E3h", { title: h.get("title"), a: [...(h.a ?? [])].map(x => x.id) });
}

// E4 code-made items rerun on every load
{ // load 1: code runs AFTER replay (attach), no id
  const file = [];
  for (let load = 1; load <= 3; load++){
    const p = fresh(); const s = new Store({ url: "/x.jsonl" }); s.append = l => file.push(JSON.parse(JSON.stringify(l)));
    s.read(file.slice()); s.attach(p);
    p.a.add({ title: "built by code" });               // no id
    p.b.add({ id: "fixed", title: "built by code" });  // fixed id
    log("E4." + load, { a: p.a.length, b: p.b.length, lines: file.length });
  }
}
// E5 code-made fixed id, UI removed it, code runs after replay -> resurrects
{ const file = [];
  const load = () => { const p = fresh(); const s = new Store({ url: "/x.jsonl" }); s.append = l => file.push(JSON.parse(JSON.stringify(l))); s.read(file.slice()); s.attach(p); p.b.add({ id: "fixed", title: "code" }); return p; };
  const p1 = load(); p1.b.remove("fixed"); const p2 = load();
  log("E5after", { present: !!p2.b.find("fixed"), lines: file });
  // code BEFORE replay: build first, then attach
  const file2 = [{ b: { remove: "fixed" } }];
  const p = fresh(); p.b.insert({ id: "fixed", title: "code" }); const s = new Store({ url: "/y.jsonl" }); s.append = l => file2.push(l); s.read(file2.slice()); s.attach(p);
  log("E5before", { present: !!p.b.find("fixed"), lines: file2.length });
  // code edits title, log has older title -> log wins
  const p3 = fresh(); p3.b.insert({ id: "fixed", title: "code v2" }); p3.replay_line({ fixed: { set: { title: "ui title" } } }); log("E5win", p3.b.find("fixed").get("title"));
}
// E6 does a list add carry a timestamp?
{ const p = fresh(); const lines = rec(p); p.a.add({ title: "x" }); log("E6", lines[0]); }
// E7 set(prop, item): replay gives a plain object
{ const p = fresh(); const lines = rec(p); const c = new Item({ id: "c" }); p.set("child", c);
  const q = fresh(); for (const l of JSON.parse(JSON.stringify(lines))) q.replay_line(l); const got = q.get("child");
  log("E7", { line: JSON.parse(JSON.stringify(lines[0])), replayed_is_item: got instanceof Item, got }); }
// E8 hydrate enforces document-unique ids, live insert does not
{ const h = Item.hydrate({ id: "p", a: [{ id: "s1" }], b: [{ id: "s1" }] }); log("E8", { a: h.a.at(0).id, b: h.b.at(0).id }); }
// E9 a child parented outside any list: its delta lands flat on the host
{ const p = fresh(); const lines = rec(p); const c = new Item({ id: "c" }); c.parent = p; p.child = c; c.set({ title: "child title" }); log("E9", { line: lines[0], parent_title_after_replay: (() => { const q = fresh(); lines.forEach(l => q.replay_line(l)); return q.get("title"); })() }); }
// E10 duplicate add of the same id on replay
{ const p = fresh(); p.replay_line({ a: { add: { id: "z", title: "1" } } }); p.replay_line({ a: { add: { id: "z", title: "2" } } }); log("E10", { n: p.a.length, title: p.a.find("z").get("title") }); }
