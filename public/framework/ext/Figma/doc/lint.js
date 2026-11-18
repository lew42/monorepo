// Figma lint: a read-only check of the build rules (doc/build-checklist.md), for Lew42 v2.
//
// Run it through the Figma MCP's use_figma: paste this whole file as `code` and add
// one last line with the node ids you changed (frames, components or a page id):
//     return await lint(['109:14']);
// use_figma needs that top-level return; it stays out of the file so the file is
// valid JS. Ids may be on different pages (each page switch is slower). It changes
// nothing in the file.
//
// It returns { scanned, errors, warnings, counts: {rule: [errors, warnings]}, findings }:
// the first 20 findings, errors first, each [severity, node id, name, rule, detail].
// Zero errors before you report (owner, 2026-11-16). Warnings: fix when obvious.
//
// Rules (see doc/lint.md for why each one exists):
//   same-on-same     a padded frame whose fill looks the same as the ground under it
//   pad-token        padding bound to a token other than the padding tokens
//   text-gap         gap bound to text-gap on a frame whose children aren't all text
//   raw-value        padding or gap above 0 that isn't bound to a token
//   raw-fill         a visible solid fill that isn't bound to a colour variable
//   unstyled-text    a text layer with no text style (icon glyphs excepted)
//   line-length      body or small text wider than the measure (720)
//   child-drives     a Hug parent whose width comes from a Fixed child (not named "fixed …")
//   mode-mismatch    (warn) a fixed width far from its Scale mode's width
//   hidden-in-master (warn) a hidden layer or slot left inside a component master
//   padded-no-fill   (warn) a padded frame with no fill of its own, on a page or doc frame
//   stale-paint      a variable-bound paint whose cached colour differs from the live value
//   page-root        a page holds one frame named "Root" (plus prototype starting
//                    frames), no Archive frame on a live page (archives live on the
//                    pages after `Archive ↓`, rule 29), and no connector outside an archive
//
// An instance and the layers inside it get only same-on-same (and mode-mismatch on the
// instance itself), since every other finding there belongs to its master: lint the master.

const PAD_TOKENS = ['pad-x', 'pad-y', 'card-pad-x', 'card-pad-y', 'section-pad-x', 'section-pad-y', 'layout-padding', 'button-pad-x', 'button-pad-y'];
const MEASURE = 720;
const SCALE_COLLECTION = 'Lew42 v2 · Scale';
const MAX = 20;
const INLINE = 48; // an icon, tag or button this tall or less may sit beside text on text-gap
const SHADE = 0.1; // the wrapper shade, black at 10% or less, is the one raw fill allowed (owner: "wrappers are 5% black")

// Frames whose subtree skips same-on-same, with the reason (every other rule still runs).
// Keep it short; every entry is a promise that the thing is on purpose.
const ALLOW = {
  '108:3988': 'Example · Button by scheme: every Button mode on every ground, the bad ones included, for the owner to pick from',
};

const vars = new Map();
async function variable(id) {
  if (!vars.has(id)) vars.set(id, await figma.variables.getVariableByIdAsync(id));
  return vars.get(id);
}

const findings = [];
const counts = {};
let scanned = 0;
function report(severity, node, rule, detail) {
  counts[rule] = counts[rule] || [0, 0];
  counts[rule][severity === 'error' ? 0 : 1]++;
  findings.push([severity, node.id, node.name.slice(0, 40), rule, detail]);
}

// --- colour: composite a node's fills over the ground under it -------------------
const hex = c => c ? '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('') : 'none';
const same = (a, b) => a && b && Math.abs(a.r - b.r) < 0.012 && Math.abs(a.g - b.g) < 0.012 && Math.abs(a.b - b.b) < 0.012;

// Returns { ground, painted, image }: the colour after this node's fills, whether it
// paints anything visible, and whether an image or gradient makes it unknowable.
async function paint(node, under) {
  const fills = 'fills' in node && Array.isArray(node.fills) ? node.fills : [];
  let ground = under, painted = false, image = false;
  for (const f of fills) {
    if (f.visible === false || f.opacity === 0) continue;
    if (f.type !== 'SOLID') { image = true; painted = true; continue; }
    let color = f.color, a = 1;
    const bound = f.boundVariables && f.boundVariables.color;
    if (bound) {
      const v = await variable(bound.id);
      if (v) { const r = v.resolveForConsumer(node).value; if (r && 'r' in r) { color = r; a = r.a ?? 1; } }
    }
    // A paint bound to a colour with alpha already carries that alpha as paint.opacity
    // (Figma syncs them), so count it once: tint (black 5%) read as 0.25% before (2026-11-17).
    const alpha = (bound ? a : (f.opacity ?? 1)) * (node.opacity ?? 1);
    if (alpha <= 0) continue;
    painted = true;
    ground = ground
      ? { r: color.r * alpha + ground.r * (1 - alpha), g: color.g * alpha + ground.g * (1 - alpha), b: color.b * alpha + ground.b * (1 - alpha) }
      : (alpha >= 0.99 ? { r: color.r, g: color.g, b: color.b } : null);
  }
  return { ground: image ? null : ground, painted, image };
}

async function ground_above(node) {
  const chain = [];
  for (let p = node.parent; p && p.type !== 'DOCUMENT'; p = p.parent) chain.unshift(p);
  let g = null;
  for (const p of chain) {
    if (p.type === 'PAGE') { const b = p.backgrounds && p.backgrounds[0]; g = b ? { ...b.color } : { r: 0.96, g: 0.96, b: 0.96 }; continue; }
    g = (await paint(p, g)).ground;
  }
  return g;
}

// --- the checks -------------------------------------------------------------------
const padded = n => 'paddingLeft' in n && n.layoutMode && n.layoutMode !== 'NONE' &&
  (n.paddingLeft > 0 || n.paddingRight > 0 || n.paddingTop > 0 || n.paddingBottom > 0);
const shown = n => n.visible !== false && !(n.layoutPositioning === 'ABSOLUTE');
const in_instance = n => n.id.includes(';');
// Text, an inline piece (icon, tag), or a frame holding only those: part of a text stack.
const textual = n => n.type === 'TEXT' || n.height <= INLINE ||
  ('children' in n && n.children.filter(shown).length > 0 && n.children.filter(shown).every(textual));
let styles = null, scale = null;

async function bindings(node) {
  if (!('layoutMode' in node) || node.layoutMode === 'NONE') return;
  const bv = node.boundVariables || {};
  // A tag, pill or icon button (INLINE tall or less) sizes itself: Scale has no small padding token.
  if (node.height > INLINE) for (const side of ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']) {
    if (bv[side]) {
      const v = await variable(bv[side].id);
      if (v && !PAD_TOKENS.includes(v.name)) report('error', node, 'pad-token', `${side} = ${v.name}`);
    } else if (node[side] > 0) report('error', node, 'raw-value', `${side} ${node[side]}`);
  }
  const kids = node.children.filter(shown);
  const gaps = node.layoutMode === 'GRID' ? ['gridRowGap', 'gridColumnGap']
    : ['itemSpacing', ...(node.layoutWrap === 'WRAP' ? ['counterAxisSpacing'] : [])];
  if (kids.length < 2 || node.primaryAxisAlignItems === 'SPACE_BETWEEN' && node.layoutMode !== 'GRID') return;
  for (const g of gaps) {
    if (bv[g]) {
      const v = await variable(bv[g].id);
      // text-gap is right inside a text stack (rows of text and inline pieces, nested or not)
      // and between a label or heading and the one thing it names (the last child). Not between blocks.
      const labelled = kids.slice(0, -1).every(textual);
      if (v && v.name === 'text-gap' && !labelled)
        report('error', node, 'text-gap', `${g} = text-gap, children: ${[...new Set(kids.map(k => k.type))].join(' ')}`);
    } else if (node[g] > 0) report('error', node, 'raw-value', `${g} ${node[g]}`);
  }
}

async function raw_fill(node) {
  if (!('fills' in node) || !Array.isArray(node.fills)) return;
  for (const f of node.fills) {
    const shade = f.type === 'SOLID' && f.color.r + f.color.g + f.color.b === 0 && f.opacity <= SHADE;
    if (f.type === 'SOLID' && f.visible !== false && f.opacity !== 0 && !shade && !(f.boundVariables && f.boundVariables.color))
      report('error', node, 'raw-fill', `${hex(f.color)}${f.opacity < 1 ? ' at ' + Math.round(f.opacity * 100) + '%' : ''}`);
  }
}

// A bound paint stores a cached colour beside its binding, and the canvas can draw the
// cache (2026-11-17: 12 Preview frames bound to Colors light drew white). Fix: set the
// paint's colour to the live value, then setBoundVariableForPaint (re-binding alone keeps the cache).
async function stale_paint(node) {
  for (const prop of ['fills', 'strokes']) {
    if (!(prop in node) || !Array.isArray(node[prop])) continue;
    for (const p of node[prop]) {
      const b = p.type === 'SOLID' && p.boundVariables && p.boundVariables.color;
      if (!b) continue;
      const v = await variable(b.id), r = v && v.resolveForConsumer(node).value;
      if (r && 'r' in r && Math.max(Math.abs(r.r - p.color.r), Math.abs(r.g - p.color.g), Math.abs(r.b - p.color.b)) >= 1.5 / 255)
        report('error', node, 'stale-paint', `${prop} ${v.name}: cached ${hex(p.color)}, live ${hex(r)}`);
    }
  }
}

function glyph(node) {
  const fonts = node.fontName === figma.mixed ? node.getStyledTextSegments(['fontName']).map(s => s.fontName) : [node.fontName];
  return fonts.some(f => /material|icon|symbol/i.test(f.family)) || /icon|glyph/i.test(node.name);
}

function text(node) {
  const ids = node.textStyleId === figma.mixed ? node.getStyledTextSegments(['textStyleId']).map(s => s.textStyleId) : [node.textStyleId];
  if (ids.some(id => !id) && !glyph(node)) report('error', node, 'unstyled-text', `"${node.characters.slice(0, 24)}"`);
  const style = ids.map(id => styles.get(id)).find(Boolean);
  if ((style === 'body' || style === 'small') && node.width > MEASURE + 1)
    report('error', node, 'line-length', `${style} ${Math.round(node.width)} wide (measure ${MEASURE}); bind maxWidth to measure on its frame`);
}

function child_drives(node) {
  if (!('layoutMode' in node) || node.layoutMode === 'NONE' || node.layoutMode === 'GRID') return;
  if (node.layoutSizingHorizontal !== 'HUG') return;
  // A page root is a shelf of independent things, so it hugs its widest one on purpose.
  if (page_root_of(node)) return;
  // Not a driver: a child named "fixed …", a region that sets its own Scale mode (it is the
  // layout's source by rule), a width bound to a variable, or a master in a folder frame.
  const fixed = k => k.layoutSizingHorizontal === 'FIXED' && k.width >= 120 && !/fixed|sets width/i.test(k.name) &&
    !(k.type === 'TEXT' && k.textAutoResize === 'WIDTH_AND_HEIGHT') &&
    !(scale && (k.explicitVariableModes || {})[scale.id]) && !(k.boundVariables || {}).width &&
    k.type !== 'COMPONENT' && k.type !== 'COMPONENT_SET';
  const kids = node.children.filter(shown);
  if (!kids.length) return;
  const drivers = node.layoutMode === 'VERTICAL'
    ? [kids.reduce((a, b) => (b.width > a.width ? b : a))].filter(fixed)
    : kids.filter(fixed);
  for (const k of drivers)
    report('error', node, 'child-drives', `Hug width set by Fixed child "${k.name.slice(0, 24)}" ${Math.round(k.width)} (${k.id}); make the parent Fill/Fixed or name the child "fixed …"`);
}

async function mode_mismatch(node) {
  if (!scale || !('layoutSizingHorizontal' in node) || node.layoutSizingHorizontal !== 'FIXED') return;
  if (!['FRAME', 'COMPONENT', 'INSTANCE'].includes(node.type) || node.parent.type === 'PAGE') return;
  const mode = (node.resolvedVariableModes || {})[scale.id];
  const width = mode && scale.widths[mode];
  if (!width) return;
  const r = node.width / width, explicit = !!(node.explicitVariableModes || {})[scale.id];
  if (r > 1.6 || (explicit && r < 0.6))
    report('warn', node, 'mode-mismatch', `${Math.round(node.width)} wide on ${scale.names[mode]}${explicit ? '' : ' (inherited)'}`);
}

// --- the page: one root, nothing loose, no connectors (owner, 2026-11-16) ------------
const page_root_of = n => n.parent && n.parent.type === 'PAGE' && n.name === 'Root';
// An archive page sits after the `Archive ↓` divider (rule 29, 2026-11-17): a hidden Archive
// frame on a live page still feeds the swap menu, so archived masters move to those pages.
const archive_page = pg => { const all = figma.root.children, d = all.findIndex(p => p.name === 'Archive ↓'); return d >= 0 && all.indexOf(pg) > d; };
const page_of = n => { let p = n; while (p && p.type !== 'PAGE') p = p.parent; return p; };
const archived = n => { if (archive_page(page_of(n))) return true; for (let p = n; p && p.type !== 'PAGE'; p = p.parent) if (/archive/i.test(p.name) && p.visible === false) return true; return false; };
function page_root(page) {
  const starts = (page.flowStartingPoints || []).map(f => f.nodeId);
  const roots = page.children.filter(page_root_of);
  if (roots.length !== 1 && page.name !== 'Archive ↓') report('error', page, 'page-root', `${roots.length} top-level frames named "Root"; a page has exactly one`);
  if (!archive_page(page)) {
    for (const k of page.children)
      if (!page_root_of(k) && !starts.includes(k.id))
        report('error', k, 'page-root', `loose at the top level (${k.type}); move it into Root`);
    for (const r of roots) for (const k of r.children)
      if (/^archive/i.test(k.name)) report('error', k, 'page-root', 'an Archive frame on a live page still feeds the swap menu; move it to the Archive · Pages page (rule 29)');
  }
  for (const c of page.findAllWithCriteria({ types: ['CONNECTOR'] }))
    if (!archived(c)) report('error', c, 'page-root', 'connector outside an archive; delete it');
}

// --- the walk ---------------------------------------------------------------------
const stroked = n => Array.isArray(n.strokes) && n.strokes.some(s => s.visible !== false && s.opacity !== 0) && n.strokeWeight !== 0;
const on_canvas_master = n => n.parent.type === 'PAGE' && (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET');
const set = n => n.type === 'COMPONENT_SET'; // keeps Figma's default set look (padding 20, gap 24, no fill)

async function walk(node, under, master, allowed) {
  allowed = allowed || !!ALLOW[node.id];
  scanned++;
  const inside = in_instance(node);
  const { ground, painted } = await paint(node, under);
  if (padded(node) && !set(node)) {
    // A border is a visible edge, and a master's look on the bare canvas doesn't matter.
    if (painted && same(ground, under) && !stroked(node) && !on_canvas_master(node) && !allowed)
      report('error', node, 'same-on-same', `fill ${hex(ground)} on ground ${hex(under)}`);
    if (!painted && !inside && (node.parent.type === 'PAGE' || /page|doc|wrapper|region|section/i.test(node.name)))
      report('warn', node, 'padded-no-fill', `padded, no fill, on ${hex(under)}`);
  }
  if (!inside) {
    if (node.type !== 'INSTANCE' && !set(node)) { // an instance's own padding, fills and sizing are its master's
      if (node.type === 'TEXT') text(node);
      await bindings(node);
      await raw_fill(node);
      await stale_paint(node);
      child_drives(node);
    }
    await mode_mismatch(node);
    // A layer hidden by a boolean property is how a master offers an option; not a leftover.
    if (master && node.visible === false && !(node.componentPropertyReferences || {}).visible) report('warn', node, 'hidden-in-master', `${node.type} hidden in ${master.name.slice(0, 24)}`);
  }
  if (node.visible === false || !('children' in node)) return;
  const m = master || (node.type === 'COMPONENT' ? node : null);
  for (const c of node.children) await walk(c, ground, m, allowed);
}

async function lint(ids) {
  styles = new Map((await figma.getLocalTextStylesAsync()).map(s => [s.id, s.name]));
  const col = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === SCALE_COLLECTION);
  if (col) {
    const w = (await Promise.all(col.variableIds.map(variable))).find(v => v.name === 'width');
    scale = { id: col.id, widths: {}, names: {} };
    for (const m of col.modes) { scale.names[m.modeId] = m.name; scale.widths[m.modeId] = w ? Number(w.valuesByMode[m.modeId]) || parseInt(m.name) : parseInt(m.name); }
  }
  const roots = [], checked = new Set();
  for (const id of ids) {
    const root = await figma.getNodeByIdAsync(id);
    if (!root) { roots.push(`missing ${id}`); continue; }
    let page = root; while (page.type !== 'PAGE') page = page.parent;
    if (figma.currentPage !== page) await figma.setCurrentPageAsync(page);
    roots.push(`${root.name} ${id}`);
    if ((root.type === 'PAGE' || root.parent.type === 'PAGE') && !checked.has(page.id)) { checked.add(page.id); page_root(page); }
    const kids = root.type === 'PAGE' ? root.children : [root];
    for (const k of kids) {
      let master = null;
      for (let p = k; p && p.type !== 'PAGE'; p = p.parent) if (p.type === 'COMPONENT') { master = p; break; }
      await walk(k, await ground_above(k), master === k ? null : master);
    }
  }
  findings.sort((a, b) => (a[0] === b[0] ? 0 : a[0] === 'error' ? -1 : 1));
  const errors = findings.filter(f => f[0] === 'error').length;
  return { roots, scanned, errors, warnings: findings.length - errors, counts, findings: findings.slice(0, MAX) };
}

// Add: return await lint(['<node id>', ...]);
