// Research browser: home, categories and strategies, tools, docs.
// Data: window.RESEARCH from app/data.js (made by scripts/build.mjs).
// Plain script (not a module) so index.html also works from file:// by double-click.
'use strict';
(() => {
  const R = window.RESEARCH || {};
  const TOOLS = R.tools || [], docs = R.docs || [], MENTIONS = R.mentions || {}, BUILD = R.build || {};
  const MARKED_URLS = ['https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js', 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js'];
  const HLJS_URLS = ['https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js', 'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/highlight.min.js'];
  const REPO_BLOB = 'https://github.com/mikelew42/research/blob/main/';
  const DISPLAY_NAMES = { 'lew42-framework': 'Lew42' }; // owner's preferred display names
  const view = document.getElementById('view');
  for (const t of TOOLS) if (DISPLAY_NAMES[t.id]) t.name = DISPLAY_NAMES[t.id];

  // ---------- helpers ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const arr = (v) => (v == null || v === '' ? [] : Array.isArray(v) ? v : [v]);
  const kebab = (s) => String(s ?? '').toLowerCase().replace(/[`'’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const idOf = (x) => (x && typeof x === 'object' ? x.id ?? x.name ?? x.tag ?? x.option ?? JSON.stringify(x) : x);
  const num = (v) => (v === '' || v == null || Number.isNaN(+v) ? null : +v);
  const fmt = (n) => (n == null ? '–' : n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'k' : String(n));
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const pick = (t, ...keys) => { for (const k of keys) if (t[k] != null && t[k] !== '') return t[k]; };
  const isUrl = (s) => typeof s === 'string' && /^https?:\/\//.test(s);
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
  // Some hosted frames refuse history writes; the app still works, links just stop reflecting filters.
  const setUrl = (url) => { try { history.replaceState(history.state, '', url); } catch {} };
  const qs = (base, params) => { const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString(); return s ? `${base}?${s}` : base; };
  const ago = (iso) => {
    const sec = (Date.now() - Date.parse(iso)) / 1000;
    if (Number.isNaN(sec) || sec < -3600) return String(iso || '').slice(0, 10);
    if (sec < 60) return 'just now'; // includes small clock skew
    if (sec < 3600) return `${Math.max(1, Math.round(sec / 60))} min ago`;
    if (sec < 86400) return `${Math.round(sec / 3600)} h ago`;
    if (sec < 7 * 86400) return `${Math.round(sec / 86400)} d ago`;
    return String(iso).slice(0, 10);
  };
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthYear = (iso) => { const d = new Date(iso); return Number.isNaN(+d) ? String(iso || '') : `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
  const firstSentence = (s) => { s = String(s || ''); const m = s.match(/^([\s\S]{20,200}?[.!?])(\s|$)/); return m ? m[1] : s.slice(0, 160); };
  const toolHref = (id) => `#/tool/${encodeURIComponent(id)}`;
  const docHref = (path, params = {}) => qs(`#/doc/${path.split('/').map(encodeURIComponent).join('/')}`, params);

  // ---------- words for ids ----------
  // Ids never show raw: taxonomy words first, then these, then a humanized id.
  const ACR = { crdt: 'CRDT', crdts: 'CRDTs', json: 'JSON', jsonl: 'JSONL', id: 'ID', ids: 'IDs', sql: 'SQL', ui: 'UI', dom: 'DOM', api: 'API', http: 'HTTP', rpc: 'RPC', orm: 'ORM', baas: 'BaaS', db: 'DB', r2: 'R2', s3: 'S3', d1: 'D1', sse: 'SSE', webrtc: 'WebRTC', websocket: 'WebSocket', lww: 'LWW', ssr: 'SSR', npm: 'npm', tts: 'TTS', p2p: 'P2P', wasm: 'WASM', js: 'JS', esm: 'ESM', sfu: 'SFU', ot: 'OT', indexeddb: 'IndexedDB', sqlite: 'SQLite', postgres: 'Postgres', webtransport: 'WebTransport' };
  const human = (s) => {
    s = String(s ?? '').trim();
    if (!s) return '';
    if (/\s/.test(s)) return s[0].toUpperCase() + s.slice(1);
    return s.split(/[-_]+/).filter(Boolean).map((w, i) => ACR[w.toLowerCase()] || (i ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())).join(' ');
  };
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');
  const CAT_WORDS = {
    ui: 'UI libraries', 'server-driven-ui': 'Server-driven UI', 'dom-diff': 'DOM diffing', signals: 'Signals', 'state-store': 'State stores', 'reactive-model-tree': 'Reactive model trees',
    'client-data-layer': 'Client data layers', editor: 'Editors & canvases', 'agent-ui': 'Agent UI', stack: 'Full-stack frameworks', 'crdt-library': 'CRDT libraries', 'room-server': 'Room servers',
    'sync-engine': 'Sync engines', 'local-first-db': 'Local-first databases', baas: 'Hosted backends', 'self-hosted-backend': 'Self-hosted backends', 'event-store': 'Event stores',
    orm: 'ORMs & query builders', 'storage-abstraction': 'Storage abstractions', 'embedded-db': 'Embedded databases', 'object-db': 'Object databases', 'server-db': 'Database servers',
    'managed-db': 'Managed databases', 'object-storage': 'Object storage', 'data-format': 'Data formats', search: 'Search', 'realtime-transport': 'Realtime transports',
    'sfu-media': 'Media servers', 'speech-ai': 'Speech AI', 'game-netcode': 'Game netcode', 'cloud-platform': 'Cloud platforms', 'js-runtime': 'JS runtimes',
    'reference-design': 'Reference designs', 'proposed-stack': 'Proposed stacks',
  };
  // The metrics CSV's coarse groupings, in words, used until tool records carry taxonomy categories.
  const BUCKETS = {
    'CRDT/sync': ['Sync & CRDTs', 'Libraries and services that keep data in sync across devices and people.'],
    'Framework/BaaS': ['Frameworks & backends', 'UI and full-stack frameworks, plus hosted backends.'],
    'ORM/storage': ['Storage & ORMs', 'Databases, ORMs, key-value stores, patch and serialization helpers.'],
    'Realtime/media': ['Realtime & media', 'WebSocket and WebRTC servers, game netcode, speech and voice.'],
    Reactivity: ['Reactivity & DOM', 'Signals, state stores and DOM-diffing libraries.'],
    Editors: ['Editors & canvases', 'Rich-text editors, whiteboards and visual page builders.'],
    'Event sourcing': ['Event sourcing', 'Stores and libraries that keep every change as an event.'],
    Cloudflare: ['Cloudflare', "Cloudflare's Workers runtime, local tooling and agent SDK."],
  };
  const AXIS_ALIAS = { 'conflict-handling': 'conflict', 'persistence-layout': 'layout', partitioning: 'partition', 'query-search': 'query', 'history-compaction': 'history' };
  const AXIS_WORDS = { authority: 'Who holds the truth?', conflict: 'How do clashing edits resolve?', 'change-format': 'What does one change look like?', 'list-order': 'How is list order kept?', layout: 'How is data laid out on disk?', partition: 'How does it split up as it grows?', transport: 'How do changes travel?', 'client-model': 'What does each client hold?', reactivity: 'How does the UI hear about changes?', query: 'How is data queried?', history: 'What happens to old changes?' };
  const OPT_WORDS = {
    lww: 'Last writer wins', rebase: 'Server rebase', ot: 'Operational transform', crdt: 'CRDT merge', lock: 'Lock or version check', 'local-first': 'Local-first', 'path-patch': 'Path patches', 'id-ops': 'ID-addressed ops',
    'crdt-updates': 'CRDT updates', 'row-changes': 'Row changes', index: 'Array index', fractional: 'Fractional index', 'list-crdt': 'List CRDT', 'insert-after': 'Insert-after',
    'file-rewrite': 'Rewrite whole file', 'log-snapshot': 'Log + snapshots', 'db-rows': 'Database rows', 'object-segments': 'Segments in object storage', 'room-per-doc': 'Room per document',
    'db-per-tenant': 'Database per tenant', 'http-poll': 'HTTP polling', 'query-rows': 'Query results', documents: 'Whole documents', 'object-graph': 'Object graph', 're-render': 'Re-render and diff',
    morph: 'Morph server HTML', none: 'Key lookup only', 'client-index': 'In-memory index', 'full-text': 'Full-text', 'keep-all': 'Keep everything', truncate: 'Snapshot and truncate', archive: 'Archive old segments',
  };
  const METRIC_WORDS = { csv_category: 'Metrics group', repo: 'Repository', stars: 'GitHub stars', forks: 'Forks', open_issues_incl_prs: 'Open issues and pull requests', last_push: 'Last code push', repo_created: 'Repository created', archived: 'Archived', license: 'License', stars_per_year: 'Stars per year', primary_package: 'npm package', latest_version: 'Latest version', latest_release_date: 'Latest release', weekly_downloads: 'Downloads per week', downloads_source: 'Downloads source', npm_dependents: 'npm packages that depend on it', flags: 'Health flags', notes: 'Notes' };

  // Vocabulary parsed from taxonomy.md by the build (categories, axes, options, layers, features, statuses, rules).
  const TX = Object.assign({ ready: false, families: [], categories: [], subcategories: [], layers: [], axes: [], features: [], statuses: [], rules: [] }, R.taxonomy || {});
  const byKey = (list, id) => list.find((x) => x.id === id);
  const layerLabel = (id) => human(id), featLabel = (id) => human(id);
  const statusDef = (id) => byKey(TX.statuses, kebab(id))?.desc || '';

  // ---------- tool fields (tolerant of the names the taxonomy may settle on) ----------
  function splitOpt(v) {
    v = String(v ?? '');
    const m = v.match(/^([^:;]{1,48}):\s*([\s\S]+)$/);
    if (m) return { label: m[1].trim(), note: m[2].trim() };
    const i = v.indexOf(';');
    return i > 0 ? { label: v.slice(0, i).trim(), note: v.slice(i + 1).trim() } : { label: v.trim(), note: '' };
  }
  function parseStrat(x) {
    let axis, option, note = '';
    if (x && typeof x === 'object') { const o = splitOpt(idOf(x.option ?? x.value ?? '')); axis = x.axis ?? x.id ?? 'other'; option = o.label; note = x.why ?? x.note ?? o.note; }
    else { const m = String(x).match(/^\s*([^:=]+?)\s*[:=]\s*(.+)$/); axis = m ? m[1] : 'other'; option = m ? m[2].trim() : String(x); }
    axis = kebab(axis); axis = AXIS_ALIAS[axis] || axis;
    return { axis, option: kebab(option).slice(0, 60) || 'other', optionText: option, note };
  }
  const F = {
    what: (t) => String(pick(t, 'blurb', 'one_liner', 'tagline') || firstSentence(pick(t, 'summary', 'description')) || ''),
    cats: (t) => arr(pick(t, 'category', 'categories')).map((x) => kebab(idOf(x))),
    sub: (t) => kebab(idOf(pick(t, 'subcategory', 'sub_category')) ?? ''),
    bucket: (t) => arr(t.metrics?.csv_category),
    layers: (t) => arr(pick(t, 'layer', 'layers')).map((x) => (x && typeof x === 'object' ? { id: kebab(idOf(x)), note: x.what ?? x.note ?? x.why ?? '' } : { id: kebab(x), note: '' })),
    strats: (t) => {
      const v = pick(t, 'strategies', 'strategy', 'axes', 'decisions');
      if (v && typeof v === 'object' && !Array.isArray(v)) return Object.entries(v).flatMap(([a, o]) => arr(o).map((x) => parseStrat({ axis: a, option: x })));
      return arr(v).map(parseStrat);
    },
    feats: (t) => arr(pick(t, 'features', 'feature_tags', 'tags')).map((x) => (x && typeof x === 'object' ? { id: kebab(idOf(x)), has: x.has ?? true, note: x.note ?? x.why ?? '' } : { id: kebab(x), has: true, note: '' })),
    stars: (t) => num(t.metrics?.stars ?? t.stars),
    dl: (t) => num(t.metrics?.weekly_downloads ?? t.weekly_downloads),
    release: (t) => String(t.metrics?.latest_release_date ?? pick(t, 'last_release', 'latest_release_date') ?? ''),
    // Status in the taxonomy's words: the record's own status, else derived from the metrics flags.
    status: (t) => {
      if (t.status) { const s = String(idOf(t.status)); const k = kebab(s.split(/[:;,(]/)[0]); return byKey(TX.statuses, k) ? k : s.split(/[:;,(]/)[0].trim().slice(0, 30); }
      const m = t.metrics; if (!m) return '';
      const f = m.flags || [];
      if (m.archived || f.includes('ARCHIVED')) return 'archived';
      if (f.includes('NO_RELEASE_12MO') || f.includes('NO_PUSH_12MO')) return 'stale';
      return 'active';
    },
  };
  const quiet = (s) => !s || /^(active|stable)$/i.test(s);
  const statusClass = (s) => (/archiv|shut|dead|deprecat|abandon/i.test(s) ? 'bad' : /stale|maint|moved|preview|beta|alpha|in-house/i.test(s) ? 'warn' : /active|stable/i.test(s) ? 'good' : '');
  const RELS = [['Pairs with', ['pairs_with', 'pairs']], ['Alternatives', ['alternatives', 'alternative_to', 'alternatives_to']], ['Avoid with', ['avoid_with', 'conflicts_with', 'avoid']]];
  const rels = (t, keys) => arr(pick(t, ...keys)).map((x) => (x && typeof x === 'object' ? { id: kebab(x.id ?? x.name), why: x.why ?? x.reason ?? x.note ?? '' } : { id: kebab(x), why: '' }));
  const researched = (t) => Object.keys(t).some((k) => !['id', 'name', 'blurb', 'metrics', '_meta'].includes(k));
  // Downloads first; tools with no npm package fall back to stars, ranked after those with downloads.
  const byDownloads = (a, b) => (F.dl(b) ?? -1) - (F.dl(a) ?? -1) || byStars(a, b);
  const byStars = (a, b) => (F.stars(b) ?? -1) - (F.stars(a) ?? -1) || a.name.localeCompare(b.name);
  const sortedTools = [...TOOLS].sort(byStars);

  // ---------- groupings: categories (> subcategories), axes > options, layers, features ----------
  // Taxonomy categories take over once a third of the tools carry one; until then the metrics groupings stand in.
  const USE_TAX = TOOLS.filter((t) => F.cats(t).length).length >= TOOLS.length / 3;
  const CATS = new Map(); // key -> {key, label, desc, more, family, tools, subs: Map}
  const addCat = (key, label, desc, family = '', more = '') => { if (!CATS.has(key)) CATS.set(key, { key, label, desc, more, family, tools: [], subs: new Map() }); return CATS.get(key); };
  for (const c of TX.categories) addCat(c.id, CAT_WORDS[c.id] || human(c.id), c.desc, c.family, c.more || '');
  const NONE_KEY = 'uncategorized';
  function catKeyOf(t) {
    if (USE_TAX) { const c = F.cats(t)[0]; return c ? (CATS.has(c) ? c : addCat(c, CAT_WORDS[c] || human(c), '').key) : addCat(NONE_KEY, 'Not yet categorized', 'Tools that have no taxonomy category yet.').key; }
    const b = F.bucket(t)[0];
    return b ? addCat('m-' + kebab(b), BUCKETS[b]?.[0] || b, BUCKETS[b]?.[1] || '', 'metrics').key : addCat(NONE_KEY, 'Not yet categorized', '').key;
  }
  const catOf = (t) => CATS.get(catKeyOf(t));
  for (const t of sortedTools) {
    const c = catOf(t); c.tools.push(t);
    const sk = USE_TAX ? F.sub(t) : '';
    if (!c.subs.has(sk)) { const d = byKey(TX.subcategories, sk); c.subs.set(sk, { key: sk, cat: c.key, label: sk ? human(sk) : '', desc: d?.desc || '', tools: [] }); }
    c.subs.get(sk).tools.push(t);
  }
  const catList = [...CATS.values()].filter((c) => c.tools.length).sort((a, b) => (a.key === NONE_KEY) - (b.key === NONE_KEY) || (USE_TAX ? 0 : b.tools.length - a.tools.length));
  const AX = new Map(); // axis -> {key, label, question, applies, options: Map(option -> {key, axis, label, desc, users, src, items})}
  const addAxis = (key, question = '', applies = []) => { if (!AX.has(key)) AX.set(key, { key, label: AXIS_WORDS[key] || question || human(key), question, applies, options: new Map() }); return AX.get(key); };
  const addOpt = (a, key, extra = {}) => { if (!a.options.has(key)) a.options.set(key, { key, axis: a.key, label: OPT_WORDS[key] || human(extra.text || key), desc: cap(extra.desc || ''), users: extra.users || '', src: extra.src || '', known: !!extra.desc, items: [] }); return a.options.get(key); };
  for (const a of TX.axes) { const ax = addAxis(a.id, a.question, a.applies); for (const o of a.options) addOpt(ax, o.id, o); }
  for (const t of sortedTools) for (const s of F.strats(t)) addOpt(addAxis(s.axis), s.option, { text: s.optionText }).items.push({ t, note: s.note });
  const tagIndex = (defs, fn, label) => {
    const m = new Map(defs.map((d) => [d.id, { key: d.id, label: label(d.id), desc: d.desc, items: [] }]));
    for (const t of sortedTools) for (const x of fn(t)) { if (!m.has(x.id)) m.set(x.id, { key: x.id, label: label(x.id), desc: '', items: [] }); m.get(x.id).items.push({ t, note: x.note }); }
    return m;
  };
  const LAYERS = tagIndex(TX.layers, F.layers, layerLabel);
  const FEATS = tagIndex(TX.features, (t) => F.feats(t).filter((f) => f.has !== false), featLabel);
  const shared = (g) => g.items.length >= 2;
  const optHref = (o) => `#/option/${encodeURIComponent(o.axis)}/${encodeURIComponent(o.key)}`;
  // Compatibility rules mention categories and options in backticks; show them as words, categories as links.
  const ruleHtml = (text) => esc(text).replace(/`([^`]+)`/g, (m, x) => {
    const k = kebab(x), c = CATS.get(k);
    if (c) return `<a href="#/category/${encodeURIComponent(k)}">${esc(c.label)}</a>`;
    const p = x.match(/^([\w-]+):\s*([\w-]+)$/), o = p && AX.get(p[1])?.options.get(p[2]);
    return o ? `<a href="${optHref(o)}">${esc(o.label)}</a>` : `<code>${esc(x)}</code>`;
  }).replace(/\s*\((?:notes|lessons)\/[^)]*\)\s*$/, '');

  // ---------- docs ----------
  const docByPath = new Map(docs.map((d) => [d.path, d]));
  // Doc paths are repo-relative; tool records and notes often use persistence-sync-relative ones.
  const getDoc = (p) => (p ? docByPath.get(p) || docByPath.get(`persistence-sync/${p}`) || docByPath.get(String(p).replace(/^\/+/, '')) : undefined);
  // Home sections; a doc belongs to the first section whose test matches its path.
  const SECTIONS = [
    { id: 'framework', title: 'Your framework', desc: 'How Lew42 (Item / List / Page) saves, tracks and streams changes today.', match: (p) => p.startsWith('persistence-sync/lew42/') },
    { id: 'lessons', title: 'Code lessons', desc: 'What to take from libraries that solved the same problems.', match: (p) => p.startsWith('persistence-sync/lessons/') },
    { id: 'notes', title: 'Research notes', desc: 'Raw findings from each research thread, with sources.', match: (p) => p.startsWith('persistence-sync/notes/') },
    { id: 'overview', title: 'Report & taxonomy', desc: 'The synthesis, the shared vocabulary and how this app is built.', match: (p) => p.startsWith('persistence-sync/') },
    { id: 'design', title: 'Design', desc: 'Takeaways, phase 1 and the fixes.', match: (p) => p.startsWith('design/') },
    { id: 'agent-ops', title: 'Agent ops & git', desc: 'How the agents are set up and run, including drafts.', match: (p) => p.startsWith('agent-ops/') },
    { id: 'ideas', title: 'Ideas', desc: 'Write-ups of ideas outside the main research.', match: (p) => p.startsWith('ideas/') },
    { id: 'coordination', title: 'Coordination', desc: 'Repo README, your attention list and the rules agents follow.', match: (p) => !p.includes('/') },
  ];
  const OTHER = { id: 'other', title: 'Other', desc: '', match: () => true };
  const sectionOf = (p) => SECTIONS.find((s) => s.match(p)) || OTHER;
  const FOLDERS = ['', 'persistence-sync', 'design', 'agent-ops', 'ideas'];
  const FOLDER_WORDS = { '': 'Repo root', 'persistence-sync': 'Persistence & sync research', design: 'Design', 'agent-ops': 'Agent ops', ideas: 'Ideas' };
  const folderOf = (p) => (p.includes('/') ? p.split('/')[0] : '');
  const docOrder = (a, b) => {
    const fa = FOLDERS.indexOf(folderOf(a.path)), fb = FOLDERS.indexOf(folderOf(b.path));
    return (fa < 0 ? 99 : fa) - (fb < 0 ? 99 : fb) || folderOf(a.path).localeCompare(folderOf(b.path)) || SECTIONS.indexOf(sectionOf(a.path)) - SECTIONS.indexOf(sectionOf(b.path)) || a.path.localeCompare(b.path);
  };
  const inProgress = (md) => /\((in progress|being written)\)|^status:.*\b(skeleton|in progress|being (written|filled))/im.test(String(md).slice(0, 1500)) || /\n\(in progress\)\s*$/.test(md);
  const docSize = (d) => { const n = d.md.split('\n').length; return d.md.trim() ? `${plural(n, 'line')}${inProgress(d.md) ? ' · in progress' : ''}` : 'empty'; };
  const docSnip = (md) => (String(md).split('\n').find((l) => l.trim() && !/^\s*(#|\||[-*>]|```|<|\d+\.|owner:|status:)/i.test(l)) || '').replace(/[*_`[\]]|\(http[^)]*\)/g, '').slice(0, 170);

  // ---------- building blocks ----------
  // Anything that opens something is a full-width row with a chevron or a pill; plain info has neither.
  const row = ({ href, title, sub = '', meta = '', right = '', ext = false, one = false }) =>
    `<a class="row${one ? ' one' : ''}" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}><span class="row-body"><span class="row-title">${title}</span>${sub ? `<span class="row-sub">${sub}</span>` : ''}${meta ? `<span class="row-meta">${meta}</span>` : ''}</span>${right ? `<span class="row-right">${right}</span>` : ''}<span class="chev" aria-hidden="true">${ext ? '↗' : '›'}</span></a>`;
  const list = (rows) => (rows.length ? `<div class="list">${rows.join('')}</div>` : '');
  const group = (title, rows) => (rows.length ? `<h2 class="label">${esc(title)}</h2>${list(rows)}` : '');
  const info = (title, items, kv = false) => (items.length ? `<h2 class="label">${esc(title)}</h2><dl class="info${kv ? ' kv' : ''}">${items.map(([k, v]) => `<div><dt>${k}</dt>${v ? `<dd>${v}</dd>` : ''}</div>`).join('')}</dl>` : '');
  const badge = (s, cls) => (s ? `<span class="badge ${cls ?? statusClass(s)}">${esc(s)}</span>` : '');
  const head = (title, right = '') => `<div class="head"><h1>${title}</h1>${right ? `<span class="head-right">${right}</span>` : ''}</div>`;
  const pills = (tools) => `<div class="pills">${tools.map((t) => `<a class="pill" href="${toolHref(t.id)}">${esc(t.name)}</a>`).join('')}</div>`;
  let sortRelease = false;
  function toolRow(t, note = '', opts = {}) {
    const st = F.status(t), c = catOf(t), showCat = c.key !== NONE_KEY && !opts.noCat;
    const facts = [F.stars(t) != null && `★ ${fmt(F.stars(t))}`, F.dl(t) != null && `${fmt(F.dl(t))} downloads/week`, F.release(t) && monthYear(F.release(t))].filter(Boolean);
    return row({ href: toolHref(t.id), title: `<b class="name">${esc(t.name)}</b>${showCat ? `<span class="tag">${esc(c.label)}</span>` : ''}`, sub: esc(note || F.what(t)), meta: esc(facts.join(' · ')), right: quiet(st) ? '' : badge(human(st)) });
  }
  const refRow = (id, note) => (byId.has(id) ? toolRow(byId.get(id), note) : `<div class="row static"><span class="row-body"><span class="row-title">${esc(human(id))}</span>${note ? `<span class="row-sub">${esc(note)}</span>` : ''}<span class="row-meta">no record yet</span></span></div>`);
  const docRow = (d, params = {}, extra = '') => row({ href: docHref(d.path, params), title: `<b>${esc(d.title)}</b>`, sub: esc(docSnip(d.md)), meta: esc([d.updated && ago(d.updated), docSize(d), extra].filter(Boolean).join(' · ')) });
  function value(v) {
    if (v == null || v === '') return '–';
    if (Array.isArray(v)) return v.map(value).join('<br>');
    if (typeof v === 'object') return Object.entries(v).map(([k, x]) => `${esc(human(k))}: ${value(x)}`).join('<br>');
    if (isUrl(v)) return `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(v.replace(/^https?:\/\/(www\.)?/, ''))}</a>`;
    if (typeof v === 'number') return v.toLocaleString('en-US');
    return esc(v);
  }
  const byId = new Map(TOOLS.map((t) => [t.id, t]));

  // ---------- Home ----------
  // The body of one markdown section (by heading text), up to the next heading of the same or higher level.
  function mdSection(md, name) {
    const out = []; let level = 0;
    for (const line of String(md || '').split('\n')) {
      const h = line.match(/^(#+)\s+(.*)/);
      if (h && level && h[1].length <= level) break;
      if (h && !level && h[2].trim().toLowerCase() === name) { level = h[1].length; continue; }
      if (level) out.push(line);
    }
    return level ? out.join('\n').trim() : null;
  }
  // Open items in OWNER.md: each top-level numbered or bulleted item, title = its first bold text.
  function openItems(md) {
    const items = [];
    for (const line of String(md || '').split('\n')) {
      const m = line.match(/^(\d+\.|[-*])\s+(.*)/);
      if (!m) continue;
      const b = m[2].match(/\*\*(.+?)\*\*/);
      items.push((b ? b[1] : m[2]).replace(/[`*_]/g, '').replace(/\s*\(asked [^)]*\)/, '').trim());
    }
    return items;
  }
  async function showHome(ticket) {
    const status = docs.find((d) => d.path === 'STATUS.md'), owner = docs.find((d) => d.path === 'OWNER.md');
    const items = owner ? openItems(mdSection(owner.md, 'open')) : [];
    const statusBody = status ? status.md.replace(/^#\s+.*\n/, '').replace(/^Updated by[^\n]*\n/m, '').trim() : '';
    const links = [
      ['persistence-sync/report.md', 'Report'],
      ['persistence-sync/lew42/overview.md', 'Your framework'],
      [null, 'Code lessons', qs('#/docs', { s: 'lessons' })],
      [null, 'Categories', '#/categories'],
    ].map(([p, title, href]) => {
      const d = p && getDoc(p);
      if (p && !d) return row({ href: '#/docs', title: `<b>${esc(title)}</b>`, meta: 'not written yet' }).replace('class="row"', 'class="row muted"');
      return row({ href: href || docHref(d.path), title: `<b>${esc(title)}</b>`, one: true });
    });
    const recent = docs.filter((d) => d.updated && !/^(STATUS|OWNER)\.md$/.test(d.path)).sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 5);
    view.innerHTML = `
      ${items.length ? `<section class="attention">
        <div class="att-head"><span>Needs your attention</span>${badge(`${items.length} open`, 'warn')}</div>
        ${items.map((t) => row({ href: /\bdesign\b/i.test(t) ? '#/design' : docHref('OWNER.md', { h: 'h-open' }), title: esc(t), one: true })).join('')}
      </section>` : ''}
      ${status?.updated ? `<p class="sub small stamp-top" data-ago="${esc(status.updated)}" data-prefix="Updated">Updated ${esc(ago(status.updated))}</p>` : ''}
      <article class="prose status" id="status">${status ? '' : ''}</article>
      ${group('Key links', links)}
      ${recent.length ? `<h2 class="label">Recently updated</h2><div class="list compact">${recent.map((d) => row({ href: docHref(d.path), title: esc(d.title), right: esc(ago(d.updated)), one: true })).join('')}</div>` : ''}`;
    if (status) await renderMd(document.getElementById('status'), statusBody, 'STATUS.md', ticket);
  }

  // ---------- Categories & strategies ----------
  // Every grouping (category, subcategory, axis, option, layer, feature) is a tappable box of tool pills that
  // opens a definition page with the same tools as rows.
  const catHref = (c) => `#/category/${encodeURIComponent(c.key)}`;
  const subHref = (sub) => `#/category/${encodeURIComponent(sub.cat)}/${encodeURIComponent(sub.key)}`;
  const axisHref = (a) => `#/axis/${encodeURIComponent(a.key)}`;
  const layerHref = (g) => `#/layer/${encodeURIComponent(g.key)}`;
  const featHref = (g) => `#/feature/${encodeURIComponent(g.key)}`;
  // A box: tappable header (name, count, chevron) and the group's tools as pills.
  const box = (href, label, tools, desc = '', sub = false) => `<div class="box${sub ? ' sub' : ''}"><a class="box-head" href="${esc(href)}"><span class="box-title">${esc(label)}</span><span class="count">${plural(tools.length, 'tool')}</span><span class="chev" aria-hidden="true">›</span></a>${desc ? `<p class="box-desc">${esc(desc)}</p>` : ''}${pills(tools)}</div>`;
  const wip = TX.ready ? '' : ' <span class="wip" title="Taxonomy still being written" aria-label="Taxonomy still being written">🚧</span>';
  function showCats() {
    const fams = new Map();
    for (const c of catList) { const f = USE_TAX ? c.family || 'Other' : ''; if (!fams.has(f)) fams.set(f, []); fams.get(f).push(c); }
    const catBox = (c) => {
      const subs = [...c.subs.values()].filter((x) => x.key);
      return `<div class="box"><a class="box-head" href="${esc(catHref(c))}"><span class="box-title">${esc(c.label)}</span><span class="count">${plural(c.tools.length, 'tool')}</span><span class="chev" aria-hidden="true">›</span></a>
        ${subs.length ? [...c.subs.values()].map((x) => (x.key ? box(subHref(x), x.label, x.tools, '', true) : pills(x.tools))).join('') : pills(c.tools)}</div>`;
    };
    const axes = [...AX.values()].map((a) => ({ ...a, shown: [...a.options.values()].filter(shared) })).filter((a) => a.shown.length);
    const layers = [...LAYERS.values()].filter(shared), feats = [...FEATS.values()].filter(shared);
    view.innerHTML = `${head(`Categories &amp; Strategies${wip}`)}
      ${[...fams].map(([f, cs]) => `<section class="cat">${f ? `<h2 class="label">${esc(f)}</h2>` : ''}${cs.map(catBox).join('')}</section>`).join('')}
      ${layers.length ? `<section class="cat"><h2 class="label">Stack layers</h2>${layers.map((g) => box(layerHref(g), g.label, g.items.map((i) => i.t))).join('')}</section>` : ''}
      ${axes.length ? `<section class="cat"><h2 class="label">Design choices</h2>${axes.map((a) => `<div class="box"><a class="box-head" href="${esc(axisHref(a))}"><span class="box-title">${esc(a.label)}</span><span class="chev" aria-hidden="true">›</span></a>${a.shown.map((o) => box(optHref(o), o.label, o.items.map((i) => i.t), '', true)).join('')}</div>`).join('')}</section>` : ''}
      ${feats.length ? `<section class="cat"><h2 class="label">Features</h2>${feats.map((g) => box(featHref(g), g.label, g.items.map((i) => i.t))).join('')}</section>` : ''}
      ${!layers.length && !axes.length && !feats.length ? `<section class="cat"><h2 class="label">Design choices</h2>${list([...AX.values()].filter((a) => a.question || a.options.size).slice(0, 12).map((a) => row({ href: axisHref(a), title: `<b>${esc(a.label)}</b>`, sub: esc([...a.options.values()].map((o) => o.label).join(' · ')) })))}</section>` : ''}`;
  }
  // A definition block: what the thing is, plus extra paragraphs (when to pick it, who uses it).
  const defn = (desc, more = []) => `${desc ? `<p class="lead">${esc(desc)}</p>` : ''}${more.filter(([, v]) => v).map(([k, v]) => `<p class="sub"><b>${esc(k)}</b> ${v}</p>`).join('')}`;
  const toolList = (items, opts) => (items.length ? list(items.map((i) => (i.t ? toolRow(i.t, i.note, opts) : toolRow(i, '', opts)))) : '<p class="empty">No tools.</p>');
  const rulesFor = (key) => TX.rules.filter((r) => r.ids.includes(key));
  function showCategory(key, subKey, params) {
    const c = CATS.get(key);
    if (!c) { view.innerHTML = `${head('Not found')}<p class="empty">No category “${esc(key)}”.</p>`; return; }
    if (subKey) {
      const x = c.subs.get(subKey);
      if (!x) { view.innerHTML = `${head('Not found')}<p class="empty">No subcategory “${esc(subKey)}”.</p>`; return; }
      view.innerHTML = `${head(esc(x.label), plural(x.tools.length, 'tool'))}<p class="sub small">Part of <a href="${esc(catHref(c))}">${esc(c.label)}</a></p>${defn(x.desc)}${toolList(x.tools, { noCat: true })}`;
      return;
    }
    // Group by: subcategory (default when present), any decision axis that applies to this category, layer, or none.
    const axes = [...AX.values()].filter((a) => a.applies.includes(c.key) || c.tools.some((t) => F.strats(t).some((s) => s.axis === a.key)));
    const hasSubs = [...c.subs.keys()].some(Boolean);
    const tagged = (fn) => c.tools.some((t) => fn(t).length);
    const modes = [...(hasSubs ? [['sub', 'Subcategory']] : []), ...axes.filter((a) => c.tools.some((t) => F.strats(t).some((x) => x.axis === a.key))).map((a) => [`axis:${a.key}`, a.label]), ...(tagged(F.layers) ? [['layer', 'Stack layer']] : []), ['none', 'No grouping']];
    const by = modes.some(([k]) => k === params.get('by')) ? params.get('by') : modes[0][0];
    let groups;
    if (by === 'sub') groups = [...c.subs.values()].map((x) => ({ label: x.label || 'Other', href: x.key ? subHref(x) : '', items: x.tools.map((t) => ({ t })) }));
    else if (by === 'layer') groups = [...LAYERS.values()].map((g) => ({ label: g.label, href: layerHref(g), items: g.items.filter((i) => catOf(i.t) === c) }));
    else if (by.startsWith('axis:')) {
      const a = AX.get(by.slice(5));
      groups = [...a.options.values()].map((o) => ({ label: o.label, href: optHref(o), items: o.items.filter((i) => catOf(i.t) === c) }));
    }
    let body;
    if (by === 'none') body = toolList(c.tools, { noCat: true });
    else {
      const placed = new Set(groups.flatMap((g) => g.items.map((i) => i.t)));
      const rest = c.tools.filter((t) => !placed.has(t));
      body = groups.filter((g) => g.items.length).map((g) => `<div class="box">${g.href ? `<a class="box-head" href="${esc(g.href)}"><span class="box-title">${esc(g.label)}</span><span class="count">${plural(g.items.length, 'tool')}</span><span class="chev" aria-hidden="true">›</span></a>` : `<div class="box-head static"><span class="box-title">${esc(g.label)}</span><span class="count">${plural(g.items.length, 'tool')}</span></div>`}${pills(g.items.map((i) => i.t))}</div>`).join('')
        + (rest.length ? `<div class="box"><div class="box-head static"><span class="box-title">Not tagged yet</span><span class="count">${plural(rest.length, 'tool')}</span></div>${pills(rest)}</div>` : '');
    }
    const rules = rulesFor(c.key);
    view.innerHTML = `${head(esc(c.label), plural(c.tools.length, 'tool'))}
      ${defn(c.desc, [['How to tell it apart:', ruleHtml(c.more || '')]])}
      <div class="bar groupby"${modes.length > 1 ? '' : ' hidden'}><label for="g-by">Group by</label><select id="g-by">${modes.map(([k, l]) => `<option value="${esc(k)}"${k === by ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
      <div id="groups">${body}</div>
      ${rules.length ? `<h2 class="label">Works with, instead of, or against</h2><dl class="info">${rules.map((r) => `<div><dt>${esc(r.kind)}</dt><dd>${ruleHtml(r.text)}</dd></div>`).join('')}</dl>` : ''}`;
    document.getElementById('g-by').addEventListener('change', (e) => { location.hash = qs(catHref(c), { by: e.target.value === modes[0][0] ? '' : e.target.value }); });
  }
  function showAxis(key) {
    const a = AX.get(key);
    if (!a) { view.innerHTML = `${head('Not found')}<p class="empty">No design choice “${esc(key)}”.</p>`; return; }
    const applies = a.applies.map((k) => CATS.get(k)).filter(Boolean);
    view.innerHTML = `${head(esc(a.label))}${defn(a.question && a.question !== a.label ? a.question : '')}
      ${applies.length ? `<p class="sub"><b>Matters for</b> ${applies.map((c) => `<a href="${esc(catHref(c))}">${esc(c.label)}</a>`).join(', ')}</p>` : ''}
      ${group('Options', [...a.options.values()].map((o) => row({ href: optHref(o), title: `<b>${esc(o.label)}</b>`, sub: esc(o.desc), right: o.items.length ? plural(o.items.length, 'tool') : '' })))}`;
  }
  function showOption(axisKey, key) {
    const a = AX.get(axisKey), o = a?.options.get(key);
    if (!o) { view.innerHTML = `${head('Not found')}<p class="empty">No option “${esc(key)}”.</p>`; return; }
    const rules = TX.rules.filter((r) => r.text.includes(`\`${axisKey}: ${key}\``));
    view.innerHTML = `${head(esc(o.label), o.items.length ? plural(o.items.length, 'tool') : '')}<p class="sub small"><a href="${esc(axisHref(a))}">${esc(a.label)}</a></p>
      ${defn(o.desc, [['Who uses it:', esc(o.users)], ['Source:', esc(o.src)]])}
      ${rules.length ? `<h2 class="label">Watch out</h2><dl class="info">${rules.map((r) => `<div><dd>${ruleHtml(r.text)}</dd></div>`).join('')}</dl>` : ''}
      ${o.items.length ? group('Tools that do this', o.items.map((i) => toolRow(i.t, i.note))) : ''}`;
  }
  function showTag(kind, key) {
    const g = (kind === 'layer' ? LAYERS : FEATS).get(key);
    if (!g) { view.innerHTML = `${head('Not found')}<p class="empty">No ${kind} “${esc(key)}”.</p>`; return; }
    view.innerHTML = `${head(esc(g.label), plural(g.items.length, 'tool'))}<p class="sub small">${kind === 'layer' ? 'Stack layer' : 'Feature'}</p>${defn(g.desc)}${toolList(g.items)}`;
  }

  // ---------- Tools ----------
  function showTools(params) {
    const st = Object.fromEntries(['q', 'cat', 'layer', 'strat', 'feat', 'status', 'sort'].map((k) => [k, params.get(k) || '']));
    const count = (fn) => { const m = new Map(); TOOLS.forEach((t) => new Set(fn(t)).forEach((v) => v && m.set(v, (m.get(v) || 0) + 1))); return [...m]; };
    const dims = [
      ['cat', 'Category', catList.map((c) => [c.key, c.label, c.tools.length])],
      ['layer', 'Layer', [...LAYERS.values()].filter((g) => g.items.length).map((g) => [g.key, g.label, g.items.length])],
      ['strat', 'Design choice', [...AX.values()].flatMap((a) => [...a.options.values()].filter((o) => o.items.length).map((o) => [`${a.key}~${o.key}`, `${a.label} ${o.label}`, o.items.length]))],
      ['feat', 'Feature', [...FEATS.values()].filter((g) => g.items.length).map((g) => [g.key, g.label, g.items.length])],
      ['status', 'Status', count((t) => [F.status(t)]).map(([k, n]) => [k, human(k), n])],
    ].map(([k, l, o]) => [k, l, o.sort((a, b) => String(a[1]).localeCompare(String(b[1])))]).filter(([, , o]) => o.length);
    const SORTS = { dl: 'Most downloads', stars: 'Most stars', release: 'Newest release', name: 'Name' };
    view.innerHTML = `${head('Tools', '<span id="count"></span>')}
      <div class="bar"><input type="search" id="f-q" placeholder="Search tools" aria-label="Search tools" value="${esc(st.q)}" autocomplete="off"><button type="button" class="btn" id="f-toggle" aria-expanded="false" aria-controls="f-panel">Filter<span id="f-n"></span></button></div>
      <div class="panel" id="f-panel" hidden>
        ${dims.map(([k, l, o]) => `<label>${l}<select id="f-${k}"><option value="">Any</option>${o.map(([v, lab, n]) => `<option value="${esc(v)}"${st[k] === v ? ' selected' : ''}>${esc(lab)} (${n})</option>`).join('')}</select></label>`).join('')}
        <label>Sort<select id="f-sort">${Object.entries(SORTS).map(([v, l]) => `<option value="${v}"${(st.sort || 'dl') === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
        <button type="button" class="btn primary" id="f-done">Show results</button>
      </div>
      <div class="fchips" id="f-chips"></div>
      <div id="cards"></div>`;
    const panel = document.getElementById('f-panel'), toggle = document.getElementById('f-toggle');
    const update = () => {
      for (const k of Object.keys(st)) { const el = document.getElementById(`f-${k}`); if (el) st[k] = el.value; }
      if (st.sort === 'dl') st.sort = '';
      setUrl(qs('#/tools', st));
      const terms = st.q.toLowerCase().split(/\s+/).filter(Boolean);
      let res = TOOLS.filter((t) => {
        if (st.cat && catOf(t).key !== st.cat) return false;
        if (st.layer && !F.layers(t).some((l) => l.id === st.layer)) return false;
        if (st.strat && !F.strats(t).some((s) => `${s.axis}~${s.option}` === st.strat)) return false;
        if (st.feat && !F.feats(t).some((f) => f.id === st.feat && f.has !== false)) return false;
        if (st.status && F.status(t) !== st.status) return false;
        if (!terms.length) return true;
        const hay = [t.id, t.name, F.what(t), t.summary, catOf(t).label, ...F.layers(t).map((l) => layerLabel(l.id)), ...F.feats(t).map((f) => featLabel(f.id)), t.metrics?.repo, t.metrics?.primary_package].join(' ').toLowerCase();
        return terms.every((w) => hay.includes(w));
      });
      const s = st.sort || 'dl';
      sortRelease = s === 'release';
      res = res.sort(s === 'name' ? (a, b) => a.name.localeCompare(b.name) : s === 'stars' ? byStars : s === 'release' ? (a, b) => F.release(b).localeCompare(F.release(a)) : byDownloads);
      const active = dims.filter(([k]) => st[k]).map(([k, , o]) => [k, o.find(([v]) => v === st[k])?.[1] ?? st[k]]);
      if (st.sort) active.push(['sort', `Sort: ${SORTS[st.sort]}`]);
      document.getElementById('f-chips').innerHTML = active.map(([k, lab]) => `<button type="button" class="fchip" data-k="${k}" aria-label="Remove filter ${esc(lab)}">${esc(lab)}<span aria-hidden="true">✕</span></button>`).join('');
      document.getElementById('f-n').textContent = active.length ? ` · ${active.length}` : '';
      document.getElementById('count').textContent = res.length === TOOLS.length ? plural(res.length, 'tool') : `${res.length} of ${TOOLS.length}`;
      document.getElementById('cards').innerHTML = list(res.map((t) => toolRow(t))) || `<p class="empty">No matches.</p>`;
    };
    view.querySelectorAll('select').forEach((el) => el.addEventListener('change', update));
    document.getElementById('f-q').addEventListener('input', update);
    const showPanel = (on) => { panel.hidden = !on; toggle.setAttribute('aria-expanded', String(on)); toggle.classList.toggle('on', on); };
    toggle.addEventListener('click', () => showPanel(panel.hidden));
    document.getElementById('f-done').addEventListener('click', () => showPanel(false));
    document.getElementById('f-chips').addEventListener('click', (e) => {
      const b = e.target.closest('.fchip'); if (!b) return;
      const el = document.getElementById(`f-${b.dataset.k}`); if (el) el.value = b.dataset.k === 'sort' ? 'dl' : '';
      update();
    });
    update();
  }

  function showTool(id) {
    const t = byId.get(id);
    if (!t) { view.innerHTML = `${head('Not found')}<p class="empty">No tool with id “${esc(id)}”.</p>`; return; }
    sortRelease = false;
    const m = t.metrics || {}, st = F.status(t), what = F.what(t), summary = t.summary && t.summary !== what ? String(t.summary) : '', c = catOf(t), findTerm = String(t.name).replace(/\(.*?\)/g, '').trim();
    const links = [
      c.key !== NONE_KEY && row({ href: catHref(c), title: esc(c.label), right: plural(c.tools.length, 'tool') }),
      m.repo && row({ href: `https://github.com/${m.repo}`, title: 'GitHub', meta: esc(m.repo), ext: true }),
      m.primary_package && row({ href: `https://www.npmjs.com/package/${m.primary_package}`, title: 'npm', meta: esc(m.primary_package), ext: true }),
    ].filter(Boolean);
    const shownUrls = new Set([m.repo && `https://github.com/${m.repo}`, m.primary_package && `https://www.npmjs.com/package/${m.primary_package}`]);
    const sources = [...arr(t.sources).map((s) => (s && typeof s === 'object' ? { url: s.url ?? s.src, what: s.what ?? s.title ?? '' } : { url: s, what: '' })), ...arr(t._meta?.src).map((u) => ({ url: u, what: '' }))]
      .filter((s, i, a) => s.url && !shownUrls.has(s.url) && a.findIndex((x) => x.url === s.url) === i);
    const sourceRows = sources.map((s) => {
      const d = !isUrl(s.url) && getDoc(String(s.url).split('#')[0]);
      if (d) return row({ href: docHref(d.path), title: esc(s.what || d.title), meta: esc(d.path) });
      if (isUrl(s.url)) return row({ href: s.url, title: esc(s.what || s.url.replace(/^https?:\/\/(www\.)?/, '').split('/').slice(0, 3).join('/')), meta: esc(s.url.replace(/^https?:\/\/(www\.)?/, '')), ext: true });
      return `<div class="row static"><span class="row-body"><span class="row-title">${esc(s.what || s.url)}</span><span class="row-meta">${esc(s.url)}</span></span></div>`;
    });
    const incoming = TOOLS.flatMap((o) => (o.id === t.id ? [] : RELS.flatMap(([label, keys]) => rels(o, keys).filter((r) => r.id === t.id).map((r) => toolRow(o, `${label}${r.why ? `: ${r.why}` : ''}`)))));
    const lessons = arr(t.lessons).map((l) => (l && typeof l === 'object' ? l : { id: l })).map((l) => { const d = getDoc(l.path || `lessons/${l.id}.md`); return d ? row({ href: docHref(d.path, { find: findTerm }), title: `<b>${esc(d.title)}</b>`, sub: esc(l.why || '') }) : ''; }).filter(Boolean);
    const strats = F.strats(t).map((s) => { const a = AX.get(s.axis), o = a?.options.get(s.option); return row({ href: o ? optHref(o) : '#/categories', title: `<span class="kicker">${esc(a?.label || human(s.axis))}</span><b>${esc(o?.label || human(s.option))}</b>`, sub: esc(s.note || o?.desc || '') }); });
    const ment = (MENTIONS[t.id] || []).map(([p, n]) => getDoc(p) && row({ href: docHref(getDoc(p).path, { find: findTerm }), title: esc(getDoc(p).title), meta: esc(sectionOf(getDoc(p).path).title), right: plural(n, 'mention') })).filter(Boolean);
    const known = new Set(['id', 'name', 'blurb', 'summary', 'one_liner', 'tagline', 'description', 'metrics', '_meta', 'category', 'categories', 'subcategory', 'sub_category', 'layer', 'layers', 'strategies', 'strategy', 'axes', 'decisions', 'features', 'feature_tags', 'tags', 'status', 'adopters', 'used_by', 'sources', 'lessons', 'gaps', ...RELS.flatMap((r) => r[1])]);
    const facts = [F.stars(t) != null && `★ ${fmt(F.stars(t))}`, F.dl(t) != null && `${fmt(F.dl(t))} downloads/week`, F.release(t) && monthYear(F.release(t))].filter(Boolean);
    view.innerHTML = `${head(esc(t.name))}
      ${summary && summary.startsWith(what.replace(/[.…]+$/, '')) ? `<p class="lead">${esc(summary)}</p>` : `${what ? `<p class="lead">${esc(what)}</p>` : ''}${summary ? `<p class="sub">${esc(summary)}</p>` : ''}`}
      ${!quiet(st) ? `<p class="sub">${badge(human(st))} ${esc(statusDef(st) || String(idOf(t.status) ?? '').replace(/^[^,;:(]*[,;:]\s*/, '') || '')}</p>` : ''}
      ${facts.length ? `<p class="facts">${facts.map(esc).join(' · ')}</p>` : ''}
      ${list(links)}
      ${RELS.map(([label, keys]) => group(label, rels(t, keys).map((r) => refRow(r.id, r.why)))).join('')}
      ${group('Listed by other tools', incoming)}
      ${group('Code lessons', lessons)}
      ${group('Design choices', strats)}
      ${group('Layers', F.layers(t).map((l) => row({ href: layerHref({ key: l.id }), title: esc(layerLabel(l.id)), sub: esc(l.note || LAYERS.get(l.id)?.desc || '') })))}
      ${group('Features', F.feats(t).map((f) => row({ href: featHref({ key: f.id }), title: `${esc(featLabel(f.id))}${f.has === true ? '' : badge(f.has === false ? 'no' : 'partial', f.has === false ? 'bad' : 'warn')}`, sub: esc(f.note || FEATS.get(f.id)?.desc || '') })))}
      ${info('Known gaps', arr(t.gaps).map((g) => (g && typeof g === 'object' ? [esc(human(g.id ?? '')), esc(g.what ?? g.note ?? '')] : [esc(g), ''])))}
      ${info('Adopters', arr(pick(t, 'adopters', 'used_by')).map((a) => (a && typeof a === 'object' ? [esc(a.name ?? a.id ?? ''), value(Object.fromEntries(Object.entries(a).filter(([k]) => k !== 'name' && k !== 'id')))] : [esc(a), ''])))}
      ${group('Sources', sourceRows)}
      ${group('Mentioned in', ment)}
      ${info('Adoption metrics', Object.entries(m).filter(([k]) => k !== 'csv_category').map(([k, v]) => [esc(METRIC_WORDS[k] || human(k)), value(v)]), true)}
      ${info('More', Object.keys(t).filter((k) => !known.has(k)).map((k) => [esc(human(k)), value(t[k])]), true)}`;
  }

  // ---------- Docs ----------
  function showDocs(params) {
    const sec = SECTIONS.find((x) => x.id === params.get('s'));
    const pool = (sec ? docs.filter((d) => sectionOf(d.path) === sec) : docs).slice().sort(docOrder);
    view.innerHTML = `${head(sec ? esc(sec.title) : 'Docs', plural(pool.length, 'doc'))}
      <div class="bar"><input type="search" id="d-q" placeholder="Search ${sec ? 'these' : 'all'} docs" aria-label="Search docs" value="${esc(params.get('q') || '')}" autocomplete="off"></div>
      <div id="dl"></div>`;
    const render = () => {
      const term = document.getElementById('d-q').value.trim();
      setUrl(qs('#/docs', { s: sec?.id, q: term }));
      const re = term ? new RegExp(reEsc(term), 'gi') : null;
      const groups = new Map();
      for (const d of pool) {
        const n = re ? (d.md.match(re) || []).length : 0;
        if (re && !n) continue;
        const g = folderOf(d.path);
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g).push({ d, n });
      }
      document.getElementById('dl').innerHTML = [...groups].map(([g, items]) => group(FOLDER_WORDS[g] ?? g, (re ? items.sort((a, b) => b.n - a.n) : items).map(({ d, n }) => docRow(d, term ? { find: term } : {}, n ? plural(n, 'match').replace('matchs', 'matches') : '')))).join('')
        || `<p class="empty">${pool.length ? 'No document contains that text.' : 'Nothing here yet.'}</p>`;
    };
    document.getElementById('d-q').addEventListener('input', render);
    render();
  }

  let markedP = null;
  function loadMarked() {
    if (window.marked) return Promise.resolve(window.marked);
    const one = (url) => new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = url; s.onload = () => resolve(window.marked || null); s.onerror = () => resolve(null);
      document.head.append(s);
      setTimeout(() => resolve(window.marked || null), 8000);
    });
    return (markedP ||= MARKED_URLS.reduce((p, url) => p.then((mk) => mk || one(url)), Promise.resolve(null)));
  }
  // Syntax colors for js code blocks. highlight.js loads only when a page has such a block; offline the block stays plain.
  let hljsP = null;
  function loadHljs() {
    if (window.hljs) return Promise.resolve(window.hljs);
    const one = (url) => new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = url; s.onload = () => resolve(window.hljs || null); s.onerror = () => resolve(null);
      document.head.append(s);
      setTimeout(() => resolve(window.hljs || null), 8000);
    });
    return (hljsP ||= HLJS_URLS.reduce((p, url) => p.then((h) => h || one(url)), Promise.resolve(null)));
  }
  async function highlightCode(root) {
    const blocks = [...root.querySelectorAll('pre code')].filter((c) => /\blanguage-(js|javascript|mjs|cjs|jsx|json)\b/.test(c.className));
    if (!blocks.length) return;
    const hl = await loadHljs();
    if (!hl) return;
    for (const c of blocks) {
      const lang = c.className.match(/language-(\w+)/)[1];
      if (!hl.getLanguage(lang) || c.classList.contains('hljs') || !root.contains(c)) continue;
      try { c.innerHTML = hl.highlight(c.textContent, { language: lang, ignoreIllegals: true }).value; c.classList.add('hljs'); } catch {}
    }
  }
  const resolvePath = (base, href) => {
    const out = base.split('/').slice(0, -1);
    for (const p of href.split('/')) { if (p === '..') { if (out.length && out[out.length - 1] !== '..') out.pop(); else out.push('..'); } else if (p && p !== '.') out.push(p); }
    return out.join('/');
  };
  // pre: prefix for heading ids when several docs share one page (the Design tab); links to the design docs stay on that tab.
  const DESIGN_PRE = { 'design/takeaways.md': 'tk-', 'design/phase-1.md': 'p1-', 'design/fixes.md': 'fx-' };
  const designHref = (path, frag) => `#/design?h=${DESIGN_PRE[path] || ''}${frag || 'd-' + path.replace(/^design\/|\.md$/g, '')}`;
  function enhance(root, path, pre = '') {
    root.querySelectorAll('script,iframe,object,embed,style,form').forEach((el) => el.remove());
    root.querySelectorAll('*').forEach((el) => [...el.attributes].forEach((a) => { if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) el.removeAttribute(a.name); }));
    root.querySelectorAll('table').forEach((tb) => { const w = document.createElement('div'); w.className = 'table-wrap'; tb.replaceWith(w); w.append(tb); });
    const seen = new Map();
    root.querySelectorAll('h1,h2,h3,h4').forEach((h) => { let id = pre + 'h-' + kebab(h.textContent); const n = seen.get(id) || 0; seen.set(id, n + 1); if (n) id += `-${n}`; h.id = id; });
    root.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (/^https?:/i.test(href)) { a.target = '_blank'; a.rel = 'noopener'; return; }
      if (href.startsWith('#')) { a.dataset.anchor = pre + 'h-' + kebab(safeDecode(href.slice(1))); a.setAttribute('href', pre ? `#/design?h=${a.dataset.anchor}` : docHref(path, { h: a.dataset.anchor })); return; }
      if (/^[a-z]+:/i.test(href)) return;
      const [file, frag] = href.split('#'), target = resolvePath(path, safeDecode(file));
      if (DESIGN_PRE[target] && docByPath.has(target)) a.setAttribute('href', designHref(target, frag ? `h-${kebab(safeDecode(frag))}` : ''));
      else if (docByPath.has(target)) a.setAttribute('href', docHref(target, frag ? { h: 'h-' + kebab(safeDecode(frag)) } : {}));
      else { a.href = REPO_BLOB + target.replace(/^(\.\.\/)+/, ''); a.target = '_blank'; a.rel = 'noopener'; }
    });
    root.querySelectorAll('code').forEach((c) => {
      if (c.closest('pre,a')) return;
      const p = c.textContent.trim(), d = /\.md$/.test(p) && (getDoc(p) || getDoc(resolvePath(path, p)));
      if (d) { const a = document.createElement('a'); a.href = docHref(d.path); c.replaceWith(a); a.append(c); }
      else if (byId.has(p)) { const a = document.createElement('a'); a.href = toolHref(p); c.replaceWith(a); a.append(c); }
    });
  }
  // Renders markdown into el; returns false when a newer route replaced the view meanwhile.
  async function renderMd(el, md, path, ticket, pre = '') {
    const mk = await loadMarked();
    if (ticket !== current) return false;
    if (mk) { el.innerHTML = mk.parse(md, { gfm: true }); enhance(el, path, pre); highlightCode(el); }
    else el.innerHTML = `<pre style="white-space:pre-wrap">${esc(md)}</pre>`;
    return true;
  }

  // In-page find: highlight every match and step through them with a small floating bar.
  let findBar = null;
  const closeFind = () => { findBar?.remove(); findBar = null; };
  function find(root, term) {
    root.querySelectorAll('mark').forEach((mk) => mk.replaceWith(...mk.childNodes)); root.normalize(); closeFind();
    if (!term) return;
    const re = new RegExp(reEsc(term), 'gi'), marks = [], nodes = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); while (w.nextNode()) nodes.push(w.currentNode);
    for (const n of nodes) {
      const text = n.nodeValue; re.lastIndex = 0; if (!re.test(text)) continue;
      const frag = document.createDocumentFragment(); let last = 0, mt; re.lastIndex = 0;
      while ((mt = re.exec(text))) { frag.append(text.slice(last, mt.index)); const mk = document.createElement('mark'); mk.textContent = mt[0]; frag.append(mk); marks.push(mk); last = mt.index + mt[0].length; }
      frag.append(text.slice(last)); n.replaceWith(frag);
    }
    findBar = document.createElement('div'); findBar.className = 'findbar';
    findBar.innerHTML = `<span></span><button type="button" aria-label="Previous match">↑</button><button type="button" aria-label="Next match">↓</button><button type="button" aria-label="Close find">✕</button>`;
    document.body.append(findBar);
    let i = -1;
    const go = (dir) => {
      if (!marks.length) { findBar.firstChild.textContent = `No matches for “${term}”`; return; }
      marks[i]?.classList.remove('cur'); i = (i + dir + marks.length) % marks.length; marks[i].classList.add('cur');
      marks[i].closest('details')?.setAttribute('open', '');
      marks[i].scrollIntoView({ block: 'center', inline: 'nearest' });
      findBar.firstChild.textContent = `“${term}” ${i + 1} / ${marks.length}`;
    };
    const [prev, next, close] = findBar.querySelectorAll('button');
    prev.onclick = () => go(-1); next.onclick = () => go(1); close.onclick = () => find(root, '');
    go(1);
  }

  async function showDoc(path, params, ticket) {
    const d = getDoc(path);
    if (!d) { view.innerHTML = `${head('Not found')}<p class="empty">Not found: ${esc(path)}</p>`; return; }
    path = d.path;
    const inDoc = Object.entries(MENTIONS).flatMap(([id, hits]) => hits.filter(([p]) => p === path).map(([, n]) => [id, n])).filter(([id]) => byId.has(id)).sort((a, b) => b[1] - a[1]);
    view.innerHTML = `<div class="head"><span class="crumb">${esc(d.title)}${d.updated ? ` · ${esc(ago(d.updated))}` : ''}</span><button type="button" class="btn sm" id="b-toc" hidden aria-expanded="false">Contents</button><button type="button" class="btn sm" id="b-find" aria-expanded="false">Find</button></div>
      <div class="bar" id="findrow" hidden><input type="search" id="find" placeholder="Find in this document" aria-label="Find in this document" value="${esc(params.get('find') || '')}"></div>
      <div id="toc" hidden></div>
      <article class="prose" id="prose"><p class="sub">Loading…</p></article>
      ${inDoc.length ? `<h2 class="label">Tools</h2>${pills(inDoc.map(([id]) => byId.get(id)))}` : ''}
      <p class="sub small">${esc(path)} · ${esc(docSize(d))} · <a href="${esc(REPO_BLOB + path)}" target="_blank" rel="noopener">GitHub ↗</a></p>`;
    const prose = document.getElementById('prose');
    if (!(await renderMd(prose, d.md, path, ticket))) return;
    const h2s = [...prose.querySelectorAll('h2')], toc = document.getElementById('toc'), bToc = document.getElementById('b-toc');
    if (h2s.length > 2) {
      bToc.hidden = false;
      toc.innerHTML = list(h2s.map((h) => `<a class="row one" href="${esc(docHref(path, { h: h.id }))}" data-anchor="${h.id}"><span class="row-body"><span class="row-title">${esc(h.textContent)}</span></span><span class="chev" aria-hidden="true">›</span></a>`));
      bToc.onclick = () => { toc.hidden = !toc.hidden; bToc.setAttribute('aria-expanded', String(!toc.hidden)); bToc.classList.toggle('on', !toc.hidden); };
    }
    const input = document.getElementById('find'), findrow = document.getElementById('findrow'), bFind = document.getElementById('b-find');
    const showFind = (on) => { findrow.hidden = !on; bFind.classList.toggle('on', on); bFind.setAttribute('aria-expanded', String(on)); };
    bFind.onclick = () => { showFind(findrow.hidden); if (!findrow.hidden) input.focus(); };
    input.addEventListener('change', () => { setUrl(docHref(path, { find: input.value.trim() })); find(prose, input.value.trim()); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
    if (params.get('find')) { showFind(true); find(prose, params.get('find')); }
    else if (params.get('h')) document.getElementById(params.get('h'))?.scrollIntoView();
  }

  // ---------- Design ----------
  // design/takeaways.md, then the decisions as tap-to-choose cards, then phase-1.md and fixes.md.
  // A tap saves {choice, note, at} to the artifact database, collection "decisions", doc id = decision id
  // (editors write, everyone who can open reads). Without a database (file://) it saves on this device.
  const DECISIONS = Array.isArray(R.decisions) ? R.decisions : null;
  const DESIGN_DOCS = [['takeaways', 'Takeaways', 'tk-'], ['phase-1', 'Phase 1', 'p1-'], ['fixes', 'Fixes', 'fx-']];
  const saved = new Map(), saveErr = new Map();
  let canWrite = null, decisionsLive = false;
  const LS_KEY = 'research-decisions';
  const lsRead = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; } catch { return {}; } };
  const lsWrite = (o) => { try { localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch {} };
  // Small inline markup for decision text: `code`, **bold**, blank line = new paragraph.
  const inl = (t) => String(t ?? '').split(/\n{2,}/).filter(Boolean).map((p) => `<p>${esc(p).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')}</p>`).join('');
  const decId = (d) => String(d.id);
  const isRec = (d, o) => d.recommended != null && [o.id, o.label].some((x) => String(x).toLowerCase() === String(d.recommended).toLowerCase());
  const refLink = (r) => {
    const x = r && typeof r === 'object' ? r.path || r.url || r.id || '' : String(r ?? ''), label = r && typeof r === 'object' ? r.label || r.title || '' : '';
    const doc = !isUrl(x) && getDoc(String(x).split('#')[0]);
    if (doc) return `<a class="pill sm" href="${esc(docHref(doc.path))}">${esc(label || doc.title)}</a>`;
    if (isUrl(x)) return `<a class="pill sm" href="${esc(x)}" target="_blank" rel="noopener">${esc(label || x.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40))} ↗</a>`;
    if (byId.has(x)) return `<a class="pill sm" href="${toolHref(x)}">${esc(byId.get(x).name)}</a>`;
    return x ? `<span class="pill sm static">${esc(label || x)}</span>` : '';
  };
  const decCard = (d) => `<article class="dcard" id="dec-${esc(decId(d))}" data-dec="${esc(decId(d))}">
      <h3>${esc(d.title || decId(d))}</h3>
      ${d.question ? `<div class="dq">${inl(d.question)}</div>` : ''}
      ${d.context ? `<div class="dctx">${inl(d.context)}</div>` : ''}
      <div class="dopts" role="group" aria-label="${esc(d.title || decId(d))}">${arr(d.options).map((o) => `<button type="button" class="dopt" data-opt="${esc(o.id)}" aria-pressed="false"><span class="dopt-top"><span>${esc(o.label || o.id)}</span>${isRec(d, o) ? '<span class="badge good">recommended</span>' : ''}</span>${o.summary ? `<span class="dopt-sum">${esc(o.summary)}</span>` : ''}</button>`).join('')}</div>
      <textarea class="dnote" rows="2" placeholder="Note (optional)" aria-label="Note for ${esc(d.title || decId(d))}"></textarea>
      <div class="dstat"><span class="dmsg"></span><button type="button" class="linkbtn" data-clear hidden>Clear</button></div>
      ${arr(d.refs).length ? `<div class="drefs">${arr(d.refs).map(refLink).join('')}</div>` : ''}
    </article>`;
  function paintDecision(id) {
    const card = [...document.querySelectorAll('.dcard')].find((c) => c.dataset.dec === id);
    if (!card) return;
    const v = saved.get(id), err = saveErr.get(id), note = card.querySelector('.dnote'), msg = card.querySelector('.dmsg');
    card.classList.toggle('ro', canWrite === false);
    card.querySelectorAll('.dopt').forEach((b) => { b.setAttribute('aria-pressed', String(!!v && v.choice === b.dataset.opt)); b.toggleAttribute('aria-disabled', canWrite === false); });
    if (document.activeElement !== note && note.value !== (v?.note || '')) note.value = v?.note || '';
    note.readOnly = canWrite === false;
    if (!err && v?.choice) { msg.dataset.ago = v.at; msg.dataset.prefix = decisionsLive ? 'Saved' : 'Saved on this device'; msg.textContent = `${msg.dataset.prefix} ${ago(v.at)}`; }
    else { delete msg.dataset.ago; delete msg.dataset.prefix; msg.textContent = err ? `Not saved: ${err}` : canWrite === false ? 'Only editors can choose.' : ''; }
    msg.classList.toggle('bad', !!err);
    card.querySelector('[data-clear]').hidden = !v || canWrite === false;
    const n = DECISIONS ? DECISIONS.filter((x) => saved.get(decId(x))?.choice).length : 0, c = document.getElementById('dec-count');
    if (c) c.textContent = `${n} of ${DECISIONS.length} chosen`;
  }
  const paintDecisions = () => (DECISIONS || []).forEach((d) => paintDecision(decId(d)));
  async function saveDecision(id, patch) {
    const prev = saved.get(id), next = { choice: prev?.choice || '', note: prev?.note || '', ...patch, at: new Date().toISOString() };
    saved.set(id, next); saveErr.delete(id); paintDecision(id);
    try {
      const db = await getDb();
      if (db) await db.doc(`decisions/${id}`).set(next);
      else { const o = lsRead(); o[id] = next; lsWrite(o); }
    } catch (e) {
      if (prev) saved.set(id, prev); else saved.delete(id);
      saveErr.set(id, e?.code === 'not_granted' || /permission|denied|forbidden|not_writer/i.test(e?.message || '') ? 'editors only' : e?.message || 'try again');
      paintDecision(id);
    }
  }
  async function clearDecision(id) {
    const prev = saved.get(id);
    saved.delete(id); saveErr.delete(id); paintDecision(id);
    try {
      const db = await getDb();
      if (db) await db.doc(`decisions/${id}`).delete();
      else { const o = lsRead(); delete o[id]; lsWrite(o); }
    } catch (e) { if (prev) saved.set(id, prev); saveErr.set(id, e?.message || 'try again'); paintDecision(id); }
  }
  function onDesignClick(e) {
    const card = e.target.closest('.dcard');
    if (!card || canWrite === false) return;
    const id = card.dataset.dec, b = e.target.closest('.dopt');
    if (b) saveDecision(id, { choice: b.dataset.opt, note: card.querySelector('.dnote').value.trim() });
    else if (e.target.closest('[data-clear]')) clearDecision(id);
  }
  function onDesignChange(e) {
    const card = e.target.closest('.dcard');
    if (!card || !e.target.matches('.dnote') || canWrite === false) return;
    const id = card.dataset.dec, note = e.target.value.trim();
    if (saved.get(id)?.choice && note !== (saved.get(id).note || '')) saveDecision(id, { note });
  }
  async function showDesign(params, ticket) {
    const decs = DECISIONS || [], clear = decs.filter((d) => d.kind === 'clear-win'), calls = decs.filter((d) => d.kind !== 'clear-win');
    const none = () => '<p class="empty">Not written yet.</p>';
    const sec = ([key, title, pre]) => {
      const d = getDoc(`design/${key}.md`);
      return `<section class="${key === 'takeaways' ? 'dtake' : 'dsec'}" id="d-${key}">${d?.md.trim() ? `<article class="prose" id="dm-${key}"></article>` : `<h2 class="label">${esc(title)}</h2>${none(title)}`}</section>`;
    };
    const decs_html = (list_, title) => (list_.length ? `<h2 class="label"><span>${title}</span>${title === 'Decisions' ? '<span class="count" id="dec-count"></span>' : ''}</h2>${list_.map(decCard).join('')}` : '');
    view.innerHTML = `<nav class="dnav" aria-label="Design sections"><a class="pill" data-anchor="d-takeaways" href="#/design?h=d-takeaways">Takeaways</a><a class="pill" data-anchor="d-decisions" href="#/design?h=d-decisions">Decisions</a><a class="pill" data-anchor="d-phase-1" href="#/design?h=d-phase-1">Phase 1</a><a class="pill" data-anchor="d-fixes" href="#/design?h=d-fixes">Fixes</a></nav>
      ${sec(DESIGN_DOCS[0])}
      <section id="d-decisions" class="dsec dec">${decs.length ? decs_html(calls.length ? calls : clear, calls.length ? 'Decisions' : 'Clear wins') + (calls.length ? decs_html(clear, 'Clear wins') : '') : `<h2 class="label">Decisions</h2>${none('Decisions')}`}</section>
      ${sec(DESIGN_DOCS[1])}${sec(DESIGN_DOCS[2])}`;
    paintDecisions();
    for (const [key, , pre] of DESIGN_DOCS) {
      const el = document.getElementById(`dm-${key}`), d = getDoc(`design/${key}.md`);
      if (el && d && !(await renderMd(el, d.md, d.path, ticket, pre))) return;
    }
    const h = params.get('h');
    if (h) document.getElementById(h)?.scrollIntoView();
  }

  view.addEventListener('click', onDesignClick);
  view.addEventListener('change', onDesignChange);

  // ---------- live data (artifact database) ----------
  // Published with the db capability, the page also reads collection "live": status and owner ({md, updated_at})
  // replace the embedded STATUS.md / OWNER.md when newer, and build ({built_at}) flags a newer published version.
  // The coordinator updates them with ArtifactData, no republish needed. Without db (file://, local) nothing changes.
  const LIVE_DOCS = { status: 'STATUS.md', owner: 'OWNER.md' };
  let newerBuild = null;
  function applyLive(key, v) {
    if (key === 'build') {
      if (v?.built_at && Date.parse(v.built_at) > Date.parse(R.built_at) + 60000) { newerBuild = v.built_at; showNewer(); }
      return;
    }
    const p = LIVE_DOCS[key];
    if (!p || typeof v?.md !== 'string') return;
    let d = docByPath.get(p);
    const at = v.updated_at && !Number.isNaN(Date.parse(v.updated_at)) ? new Date(v.updated_at).toISOString() : new Date().toISOString();
    if (d && (d.md === v.md || Date.parse(d.updated) > Date.parse(at))) return; // embedded copy is the same or newer
    if (!d) { d = { path: p, title: p.replace(/\.md$/, ''), updated: at, md: v.md }; docs.push(d); docByPath.set(p, d); }
    d.md = v.md; d.updated = at; d.title = (v.md.match(/^#\s+(.+)$/m) || [])[1]?.trim() || d.title;
    const here = location.hash.replace(/^#\/?/, '').split('?')[0];
    if (here === '' || here === `doc/${p}`) { scrolls.set(location.hash || '#/', scrollY); route(); }
  }
  function showNewer() {
    let bar = document.getElementById('newer');
    if (!bar) {
      bar = document.createElement('div'); bar.id = 'newer'; bar.className = 'newer';
      bar.innerHTML = '<span></span><button type="button" class="btn sm">Reload</button>';
      bar.querySelector('button').onclick = () => location.reload();
      document.body.append(bar);
    }
    bar.firstChild.textContent = `Newer version published ${ago(newerBuild)}`;
  }
  let dbP = null;
  const getDb = () => (dbP ||= (async () => { try { return window.claude?.use ? await window.claude.use('db') : null; } catch { return null; } })());
  async function startLive() {
    const db = await getDb();
    if (!db) { for (const [id, v] of Object.entries(lsRead())) if (v?.choice) saved.set(id, v); paintDecisions(); return; }
    // Who may choose: editors only. When the viewer cannot be told, leave the buttons on and let a refused write decide.
    try { const u = await window.claude?.use?.('user'); if (u) canWrite = !!(await u.canEdit()); } catch {}
    decisionsLive = true;
    db.collection('decisions').onSnapshot((snap) => { saved.clear(); snap.docs.forEach((d) => { const v = d.data(); if (v?.choice) saved.set(d.id, v); }); paintDecisions(); }, () => {});
    const refs = Object.fromEntries(['status', 'owner', 'build'].map((k) => [k, db.doc(`live/${k}`)]));
    for (const [k, ref] of Object.entries(refs)) ref.onSnapshot((snap) => applyLive(k, snap.exists ? snap.data() : null), () => {});
    // Snapshots arrive live or about every 30 s; also re-read when the page comes back to the foreground.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      for (const [k, ref] of Object.entries(refs)) ref.get().then((snap) => applyLive(k, snap.exists ? snap.data() : null)).catch(() => {});
      db.collection('decisions').get().then((snap) => { saved.clear(); snap.docs.forEach((d) => { const v = d.data(); if (v?.choice) saved.set(d.id, v); }); paintDecisions(); }).catch(() => {});
    });
  }
  // Relative times ("5 min ago") tick once a minute.
  setInterval(() => {
    document.querySelectorAll('[data-ago]').forEach((el) => { el.textContent = el.dataset.prefix ? `${el.dataset.prefix} ${ago(el.dataset.ago)}` : ago(el.dataset.ago); });
    if (newerBuild) showNewer();
  }, 60000);

  // ---------- footer + router ----------
  function footer() {
    const issues = [...arr(BUILD.design_notes), ...arr(BUILD.skipped).map((s) => `skipped op line ${s}`), ...arr(BUILD.near_miss).map((s) => `possible id mismatch: ${s}`), ...arr(BUILD.ops_without_metrics).map((s) => `no metrics row for ${s}`)];
    document.getElementById('foot').innerHTML = `<div>Built ${esc(ago(R.built_at))} · ${plural(TOOLS.length, 'tool')} · ${plural(docs.length, 'doc')}</div>
      ${issues.length ? `<details><summary>${plural(issues.length, 'build note')}</summary><ul>${issues.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></details>` : ''}`;
  }
  // Each history entry remembers its depth (history.state.n) so Back knows whether going back stays in the app;
  // otherwise Back goes to the view's parent (Android's own back button closes the hosted page).
  let current = 0, lastN = 0;
  const scrolls = new Map(), backBtn = document.getElementById('back');
  async function route(e) {
    if (e?.oldURL) scrolls.set(new URL(e.oldURL).hash || '#/', scrollY);
    if (history.state?.n == null) try { history.replaceState({ n: e?.oldURL ? lastN + 1 : 0 }, ''); } catch {}
    lastN = history.state?.n ?? lastN + 1;
    closeFind();
    const raw = location.hash.replace(/^#\/?/, ''), qi = raw.indexOf('?');
    const parts = (qi < 0 ? raw : raw.slice(0, qi)).split('/').filter(Boolean).map(safeDecode);
    const params = new URLSearchParams(qi < 0 ? '' : raw.slice(qi + 1));
    const tab = { design: 'design', tool: 'tools', tools: 'tools', categories: 'categories', category: 'categories', axis: 'categories', option: 'categories', layer: 'categories', feature: 'categories', doc: /^(OWNER|STATUS)\.md$/.test(parts.slice(1).join('/')) ? 'home' : 'docs', docs: 'docs' }[parts[0]] || 'home';
    document.querySelectorAll('.tabs a[data-tab]').forEach((a) => { a.classList.toggle('on', a.dataset.tab === tab); a.toggleAttribute('aria-current', a.dataset.tab === tab); });
    const docSec = parts[0] === 'doc' ? getDoc(parts.slice(1).join('/')) : null;
    const parent = { tool: '#/tools', category: parts[2] ? `#/category/${encodeURIComponent(parts[1])}` : '#/categories', axis: '#/categories', option: `#/axis/${encodeURIComponent(parts[1] || '')}`, layer: '#/categories', feature: '#/categories', doc: docSec && /^(OWNER|STATUS)\.md$/.test(docSec.path) ? '#/' : docSec ? qs('#/docs', { s: sectionOf(docSec.path).id }) : '#/docs', docs: params.get('s') ? '#/' : '' }[parts[0]] || '';
    if (backBtn) { backBtn.hidden = !parent; backBtn.setAttribute('href', parent || '#/'); }
    const ticket = ++current;
    if (parts[0] === 'tool') showTool(parts[1] || '');
    else if (parts[0] === 'tools') showTools(params);
    else if (parts[0] === 'categories') showCats();
    else if (parts[0] === 'category') showCategory(parts[1] || '', parts[2] || '', params);
    else if (parts[0] === 'axis') showAxis(parts[1] || '');
    else if (parts[0] === 'option') showOption(parts[1] || '', parts[2] || '');
    else if (parts[0] === 'layer' || parts[0] === 'feature') showTag(parts[0], parts[1] || '');
    else if (parts[0] === 'docs') showDocs(params);
    else if (parts[0] === 'design') await showDesign(params, ticket);
    else if (parts[0] === 'doc') await showDoc(parts.slice(1).join('/'), params, ticket);
    else await showHome(ticket);
    if (ticket === current && !params.get('h') && !params.get('find')) window.scrollTo(0, scrolls.get(location.hash || '#/') || 0);
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('#back') && history.state?.n > 0) { e.preventDefault(); history.back(); return; }
    // Contents and heading links inside a doc scroll in place instead of re-rendering.
    const a = e.target.closest('a[data-anchor]'), el = a && document.getElementById(a.dataset.anchor);
    if (el) { e.preventDefault(); setUrl(a.getAttribute('href')); el.scrollIntoView(); }
  });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('hashchange', route);
  footer();
  route();
  startLive();
})();
