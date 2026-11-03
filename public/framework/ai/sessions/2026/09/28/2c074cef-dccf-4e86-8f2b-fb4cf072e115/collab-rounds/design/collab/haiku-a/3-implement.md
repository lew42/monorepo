# haiku-a — phase 3 (implement)

## JavaScript implementation of Source class

```js
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCES_BASE = path.join(__dirname, '../../../../../../sources')

export class Source {
  constructor(o) {
    Object.assign(this, o)
  }

  static KINDS = ['docs', 'source', 'article', 'forum', 'spec']

  static Authority = class {
    static guess(url, kind) {
      let score = 0.5
      const urlLower = url.toLowerCase()

      // Domain heuristics
      if (urlLower.includes('.github.io') || urlLower.includes('/docs/')) {
        score = 0.85
      } else if (urlLower.includes('github.com')) {
        score = 0.75
      } else if (urlLower.includes('medium.com') || urlLower.includes('dev.to')) {
        score = 0.65
      } else if (urlLower.includes('stackoverflow.com')) {
        score = 0.60
      } else if (urlLower.includes('reddit.com') || urlLower.includes('twitter.com')) {
        score = 0.45
      }

      // Adjust by kind
      if (kind === 'docs') score = Math.min(1, score + 0.15)
      if (kind === 'spec') score = Math.min(1, score + 0.20)
      if (kind === 'forum') score = Math.max(0, score - 0.15)

      return Math.max(0, Math.min(1, Math.round(score * 100) / 100))
    }
  }

  static async fetch(url, o) {
    // o = { topic, kind, fetchedBy }
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`fetch ${url}: ${response.status}`)
    }

    const html = await response.text()
    const markdown = convertHtmlToMarkdown(html)
    const title = extractTitle(html)
    const authority = Source.Authority.guess(url, o.kind)

    // Generate mdPath from domain + timestamp
    const domain = new URL(url).hostname.replace(/^www\./, '')
    const mdPath = `${domain}-${Date.now()}.md`

    const source = new Source({
      url,
      topic: o.topic,
      kind: o.kind,
      authority,
      title,
      mdPath,
      fetchedAt: new Date().toISOString(),
      fetchedBy: o.fetchedBy,
      summary: ''
    })
    
    source._markdown = markdown
    return source
  }

  async save() {
    const topicDir = path.join(SOURCES_BASE, this.topic)
    await fs.mkdir(topicDir, { recursive: true })

    const mdFile = path.join(topicDir, this.mdPath)
    await fs.writeFile(mdFile, this._markdown || '', 'utf8')

    const indexFile = path.join(topicDir, 'index.jsonl')
    const indexLine = JSON.stringify({
      url: this.url,
      topic: this.topic,
      kind: this.kind,
      authority: this.authority,
      title: this.title,
      mdPath: this.mdPath,
      fetchedAt: this.fetchedAt,
      fetchedBy: this.fetchedBy,
      summary: this.summary
    })

    await fs.appendFile(indexFile, indexLine + '\n', 'utf8')
    delete this._markdown
    return this
  }

  static async load(topic, url) {
    const topicDir = path.join(SOURCES_BASE, topic)
    const indexFile = path.join(topicDir, 'index.jsonl')

    try {
      const content = await fs.readFile(indexFile, 'utf8')
      const lines = content.trim().split('\n').filter(l => l.length > 0)

      for (const line of lines) {
        const row = JSON.parse(line)
        if (row.url === url) {
          return new Source(row)
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }

    return null
  }

  static async list(topic) {
    const topicDir = path.join(SOURCES_BASE, topic)
    const indexFile = path.join(topicDir, 'index.jsonl')

    try {
      const content = await fs.readFile(indexFile, 'utf8')
      const lines = content.trim().split('\n').filter(l => l.length > 0)
      return lines.map(line => new Source(JSON.parse(line)))
    } catch (err) {
      if (err.code === 'ENOENT') return []
      throw err
    }
  }

  async exists() {
    const topicDir = path.join(SOURCES_BASE, this.topic)
    const mdFile = path.join(topicDir, this.mdPath)

    try {
      await fs.access(mdFile)
      return true
    } catch {
      return false
    }
  }

  async sizeOf() {
    const topicDir = path.join(SOURCES_BASE, this.topic)
    const mdFile = path.join(topicDir, this.mdPath)
    const stats = await fs.stat(mdFile)
    return stats.size
  }

  cite() {
    return `[${this.title}](${this.url}) — ${this.kind}, authority ${this.authority.toFixed(1)}`
  }
}

function convertHtmlToMarkdown(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractTitle(html) {
  let match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (match) return match[1].trim()

  match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (match) return match[1].trim()

  match = html.match(/<meta\s+name=["']og:title["']\s+content=["']([^"']+)["']/i)
  if (match) return match[1].trim()

  return 'Untitled'
}
```

## Judgment calls

**Transient `_markdown` property:** The design specifies properties stored in index.jsonl but doesn't list where `fetch()` stores the markdown content before `save()`. I store it as `_markdown` (underscore prefix signals it's internal/transient), and `save()` deletes it after writing to disk. This lets callers review fetched content before persisting while keeping the public API clean.

**Path calculation:** SOURCES_BASE assumes the module lives under `public/framework/*/` and climbs to reach `public/framework/sources/`. If the module location differs, the path in the code needs adjustment.

**HTML-to-markdown:** Uses simple regex stripping (removes scripts, styles, tags, HTML entities). A real implementation would use a library like `turndown` for better fidelity, but the minimal version keeps dependencies low.
