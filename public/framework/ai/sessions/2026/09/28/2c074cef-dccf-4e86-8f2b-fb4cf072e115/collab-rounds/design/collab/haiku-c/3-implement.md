# Source — Implementation

## Code

```js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCES_ROOT = path.resolve(__dirname, "../../../sources");

export class Source {
  constructor(o) { Object.assign(this, o); }

  static KINDS = ["docs", "source", "article", "forum", "spec"];

  static Authority = class Authority {
    static guess(url, kind) {
      const urlLower = url.toLowerCase();
      
      // Official documentation domains
      if (/^https?:\/\/(docs\.|developer\.|api\.|www\.)?
          (nodejs\.org|mdn\.org|python\.org|rust-lang\.org|
           docs\.microsoft\.com|developer\.mozilla\.org|
           golang\.org|kubernetes\.io)/.test(urlLower)) {
        return 0.85;
      }
      
      // GitHub repositories
      if (urlLower.includes("github.com")) {
        return 0.75;
      }
      
      // Known reputable blog/article sites
      if (/^https?:\/\/(www\.)?(medium\.com|dev\.to|
          css-tricks\.com|smashingmagazine\.com|a11y-101\.com)/.test(urlLower)) {
        return 0.65;
      }
      
      // Forums and community sites
      if (/^https?:\/\/(www\.)?(stackoverflow\.com|
          reddit\.com|discourse\.org|forum)/.test(urlLower)) {
        return 0.50;
      }
      
      // Kind-based adjustments
      if (kind === "docs") return Math.min(0.80, 0.5);
      if (kind === "source") return Math.min(0.75, 0.5);
      if (kind === "forum") return Math.min(0.45, 0.5);
      
      // Default neutral score
      return 0.50;
    }
  };

  static async fetch(url, { topic, kind, fetchedBy }) {
    // Fetch page and convert to markdown (stub: assumes markdown library available)
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
    
    const html = await response.text();
    // In real use: convert html to markdown via turndown or similar
    const markdown = this._htmlToMarkdown(html);
    
    // Extract title from HTML or markdown
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || url;
    
    // Build source instance without saving
    return new Source({
      url,
      topic,
      kind,
      authority: this.Authority.guess(url, kind),
      title,
      mdPath: `${path.basename(url).replace(/[^\w.-]/g, "_").slice(0, 50)}.md`,
      fetchedAt: new Date().toISOString(),
      fetchedBy,
      summary: "", // Agent fills this in after review
      markdown, // Temporary: not stored, used for save()
    });
  }

  async save() {
    const topicDir = path.join(SOURCES_ROOT, this.topic);
    const mdFile = path.join(topicDir, this.mdPath);
    
    // Create topic directory if needed
    await fs.mkdir(topicDir, { recursive: true });
    
    // Write markdown file
    await fs.writeFile(mdFile, this.markdown, "utf8");
    
    // Append to index.jsonl
    const indexFile = path.join(topicDir, "index.jsonl");
    const indexLine = JSON.stringify({
      url: this.url,
      topic: this.topic,
      kind: this.kind,
      authority: this.authority,
      title: this.title,
      mdPath: this.mdPath,
      fetchedAt: this.fetchedAt,
      fetchedBy: this.fetchedBy,
      summary: this.summary,
    });
    await fs.appendFile(indexFile, indexLine + "\n", "utf8");
    
    delete this.markdown; // Remove temporary property
    return this;
  }

  static async load(topic, url) {
    const indexFile = path.join(SOURCES_ROOT, topic, "index.jsonl");
    try {
      const data = await fs.readFile(indexFile, "utf8");
      const lines = data.trim().split("\n");
      for (const line of lines) {
        if (!line) continue;
        const entry = JSON.parse(line);
        if (entry.url === url) return new Source(entry);
      }
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
    return null;
  }

  static async list(topic) {
    const indexFile = path.join(SOURCES_ROOT, topic, "index.jsonl");
    try {
      const data = await fs.readFile(indexFile, "utf8");
      const lines = data.trim().split("\n");
      return lines
        .filter(line => line.trim())
        .map(line => new Source(JSON.parse(line)));
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }

  async exists() {
    const mdFile = path.join(SOURCES_ROOT, this.topic, this.mdPath);
    try {
      await fs.access(mdFile);
      return true;
    } catch {
      return false;
    }
  }

  async sizeOf() {
    const mdFile = path.join(SOURCES_ROOT, this.topic, this.mdPath);
    try {
      const stat = await fs.stat(mdFile);
      return stat.size;
    } catch {
      return 0; // File doesn't exist or can't be read
    }
  }

  cite() {
    return `[${this.title}](${this.url}) — ${this.kind}, authority ${this.authority.toFixed(1)}`;
  }

  // Private helper: basic HTML to markdown conversion
  // In production, use a real library like turndown
  static _htmlToMarkdown(html) {
    let md = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi, (_, level, content) => 
        `${"#".repeat(level)} ${this._stripTags(content)}\n`)
      .replace(/<p[^>]*>(.*?)<\/p>/gi, (_, content) => 
        `${this._stripTags(content)}\n\n`)
      .replace(/<a[^>]*href=["']?([^"'>]+)["']?[^>]*>(.*?)<\/a>/gi, (_, href, text) => 
        `[${this._stripTags(text)}](${href})`)
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, (_, content) => 
        `**${this._stripTags(content)}**`)
      .replace(/<em[^>]*>(.*?)<\/em>/gi, (_, content) => 
        `*${this._stripTags(content)}*`)
      .replace(/<li[^>]*>(.*?)<\/li>/gi, (_, content) => 
        `- ${this._stripTags(content)}\n`)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return md;
  }

  static _stripTags(html) {
    return html.replace(/<[^>]+>/g, "").trim();
  }
}

export default Source;
```

## Implementation Notes

**Authority.guess() judgment call:** The method returns a fixed starting score based on URL domain patterns and kind, then agents can override by hand. The regex patterns prioritize well-known official docs (0.85), GitHub (0.75), reputable tech blogs (0.65), and forums (0.50), with 0.50 as neutral default. This avoids centralized scoring rules while giving agents a consistent baseline.

**_htmlToMarkdown() stub:** HTML-to-markdown conversion is complex and should use a real library (turndown, rehype, etc.) in production. This basic stub handles the most common elements (headings, paragraphs, links, emphasis, lists) so the class is testable. The markdown is stored temporarily in the instance during `fetch()`, then deleted after `save()` to keep the instance lightweight.

**Path resolution:** Uses `import.meta.url` to resolve `SOURCES_ROOT` relative to this file's location, so sources are always under `public/framework/sources/` regardless of where the code is called from.

**Error handling:** `load()` and `list()` silently return empty/null on missing files (expected for new topics); `exists()` and `sizeOf()` return safe defaults (false, 0) rather than throwing, so calling code doesn't need try/catch for normal "file might not exist" cases.
