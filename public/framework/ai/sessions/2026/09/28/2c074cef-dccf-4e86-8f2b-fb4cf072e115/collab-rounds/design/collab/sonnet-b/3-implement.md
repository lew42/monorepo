# `Source` — implementation

```js
import fs from "node:fs/promises"
import path from "node:path"

const ROOT = new URL("../../sources/", import.meta.url) // public/framework/sources/

class Source {
  constructor(o){ Object.assign(this, o) }

  static KINDS = ["docs", "source", "article", "forum", "spec"]

  static async fetch(url, o){
    const res = await fetch(url)
    const html = await res.text()
    const md = Source.Markdown.from(html)
    const title = Source.Markdown.titleOf(html) || url
    return new Source({
      url,
      topic: o.topic,
      kind: o.kind,
      fetchedBy: o.fetchedBy,
      title,
      summary: "",
      mdPath: Source.slugFor(url) + ".md",
      authority: Source.Authority.guess(url, o.kind),
      fetchedAt: new Date().toISOString(),
      body: md, // held only until save() writes it; not a listed property, not indexed
    })
  }

  async save(){
    const dir = new URL(this.topic + "/", ROOT)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(new URL(this.mdPath, dir), this.body ?? "", "utf8")
    const row = { ...this }
    delete row.body
    await fs.appendFile(new URL("index.jsonl", dir), JSON.stringify(row) + "\n", "utf8")
    return this
  }

  static async load(topic, url){
    const rows = await Source.list(topic)
    return rows.find(s => s.url === url) ?? null
  }

  static async list(topic){
    const file = new URL("index.jsonl", new URL(topic + "/", ROOT))
    let text
    try { text = await fs.readFile(file, "utf8") }
    catch { return [] } // no index yet for this topic
    return text.split("\n").filter(Boolean).map(line => new Source(JSON.parse(line)))
  }

  async exists(){
    try { await fs.access(this.fileUrl()); return true }
    catch { return false }
  }

  async sizeOf(){
    try { return (await fs.stat(this.fileUrl())).size }
    catch { return 0 }
  }

  cite(){
    return `[${this.title}](${this.url}) — ${this.kind}, authority ${this.authority}`
  }

  fileUrl(){
    return new URL(this.mdPath, new URL(this.topic + "/", ROOT))
  }

  static slugFor(url){
    return url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 80)
  }
}

Source.Authority = class Authority {
  static guess(url, kind){
    if (kind === "docs") return 0.9
    if (kind === "spec") return 0.9
    if (/github\.com/.test(url)) return 0.8
    if (kind === "source") return 0.75
    if (kind === "article") return 0.5
    if (kind === "forum") return 0.3
    return 0.4
  }
}

Source.Markdown = class Markdown {
  static from(html){
    // placeholder: real conversion belongs to a shared html-to-markdown util, not Source
    return html
  }
  static titleOf(html){
    return html.match(/<title>(.*?)<\/title>/i)?.[1] ?? ""
  }
}

export { Source }
```

One judgment call: the design named `fetch`, `save`, `mdPath` and an in-memory hand-off between
them but never said how the fetched markdown *text* travels from `fetch()` to `save()` — I added
a `body` field that `fetch()` fills and `save()` writes then strips out of the `index.jsonl` row,
so the five listed properties stay exactly as specified on disk and the extra field never leaks
into a loaded/listed `Source`. `Source.Markdown` (html→markdown, title-sniffing) is a second static
part the names file didn't call out but implied by "already converted to markdown" — I split it
out rather than inlining a regex-and-a-prayer into `fetch()` itself, since real HTML-to-markdown
conversion is its own concern and this is clearly a stand-in for it.
