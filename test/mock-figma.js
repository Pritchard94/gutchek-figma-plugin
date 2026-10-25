// Minimal Figma Plugin API mock that enforces the auto-layout and font rules
// most likely to throw at runtime. Layout is not computed; sizes are estimates.

let nextId = 1;
const loadedFonts = new Set();
const fontKey = (f) => f.family + '|' + f.style;

class BaseNode {
  constructor(type) {
    this.id = '1:' + nextId++;
    this.type = type;
    this.name = type;
    this.parent = null;
    this.removed = false;
    this._pluginData = {};
    this.visible = true;
    this.opacity = 1;
    this.x = 0;
    this.y = 0;
    this.width = 100;
    this.height = 100;
    this.rotation = 0;
    this.fills = [];
    this.strokes = [];
    this.effects = [];
    this.boundVariables = {};
    this.reactions = [];
    this._layoutSizingHorizontal = 'FIXED';
    this._layoutSizingVertical = 'FIXED';
    this._layoutPositioning = 'AUTO';
  }
  get layoutSizingHorizontal() {
    return this._layoutSizingHorizontal;
  }
  set layoutSizingHorizontal(v) {
    this._checkSizing(v, 'horizontal');
    this._layoutSizingHorizontal = v;
  }
  get layoutSizingVertical() {
    return this._layoutSizingVertical;
  }
  set layoutSizingVertical(v) {
    this._checkSizing(v, 'vertical');
    this._layoutSizingVertical = v;
  }
  _checkSizing(v, axis) {
    if (v === 'FILL') {
      if (!this.parent || !isAuto(this.parent)) throw new Error(`FILL on ${this.type} "${this.name}" (${axis}) but parent is not auto-layout`);
    }
    if (v === 'HUG') {
      const ok = this.type === 'TEXT' || isAuto(this);
      if (!ok) throw new Error(`HUG on ${this.type} "${this.name}" (${axis}) which is not auto-layout or text`);
    }
  }
  get layoutPositioning() {
    return this._layoutPositioning;
  }
  set layoutPositioning(v) {
    if (v === 'ABSOLUTE' && (!this.parent || !isAuto(this.parent))) throw new Error(`ABSOLUTE on "${this.name}" outside auto-layout`);
    this._layoutPositioning = v;
  }
  set relativeTransform(m) {
    this._rt = m;
    this.x = m[0][2];
    this.y = m[1][2];
  }
  get relativeTransform() {
    return this._rt || [[1, 0, this.x], [0, 1, this.y]];
  }
  resize(w, h) {
    if (!(w >= 0.01) || !(h >= 0.01)) {
      if (this.type !== 'LINE' || !(w >= 0.01)) throw new Error(`resize(${w}, ${h}) on ${this.type} "${this.name}"`);
    }
    this.width = w;
    this.height = h;
  }
  resizeWithoutConstraints(w, h) {
    this.resize(w, h);
  }
  rescale(s) {
    if (!(s > 0)) throw new Error('rescale ' + s);
    this.width *= s;
    this.height *= s;
  }
  remove() {
    if (this.type === 'PAGE') {
      if (mock.currentPage === this) throw new Error('Cannot remove the current page');
      if (mock.root.children.length <= 1) throw new Error('Cannot remove the last page');
    }
    if (this.parent) {
      const i = this.parent.children.indexOf(this);
      if (i >= 0) this.parent.children.splice(i, 1);
    }
    this.parent = null;
    this.removed = true;
  }
  setPluginData(k, v) {
    this._pluginData[k] = v;
  }
  getPluginData(k) {
    return this._pluginData[k] || '';
  }
  setBoundVariable(field, v) {
    if (!v || v.type !== 'VARIABLE') throw new Error('setBoundVariable expects a variable');
    this.boundVariables[field] = { type: 'VARIABLE_ALIAS', id: v.id };
  }
  setExplicitVariableModeForCollection(c, modeId) {
    if (typeof c === 'string') throw new Error('dynamic-page requires collection object');
    if (!c.modes.find((m) => m.modeId === modeId)) throw new Error('Unknown mode ' + modeId);
  }
  _alive(method) {
    if (this.removed) throw new Error(`in ${method}: The node with id "${this.id}" does not exist`);
  }
  setReactionsAsync(r) {
    this._alive('setReactionsAsync');
    return this._setReactions(r);
  }
  async _setReactions(r) {
    if (!Array.isArray(r)) throw new Error('reactions must be array');
    for (const x of r) {
      for (const a of x.actions || []) {
        if (a.type === 'NODE' && !nodesById.get(a.destinationId)) throw new Error('Reaction destination missing');
      }
    }
    this.reactions = r;
  }
  setEffectStyleIdAsync(id) {
    this._alive('setEffectStyleIdAsync');
    if (!styles.has(id)) throw new Error('Unknown effect style ' + id);
    this.effectStyleId = id;
    return Promise.resolve();
  }
  set textStyleId(_) {
    throw new Error('textStyleId is read-only with dynamic-page');
  }
  set effectStyleId(v) {
    this._effectStyleId = v;
  }
  get effectStyleId() {
    return this._effectStyleId || '';
  }
}

const nodesById = new Map();
const styles = new Map();

function isAuto(n) {
  return n && n.layoutMode && n.layoutMode !== 'NONE';
}

class ParentNode extends BaseNode {
  constructor(type) {
    super(type);
    this.children = [];
  }
  appendChild(c) {
    this.insertChild(this.children.length, c);
  }
  insertChild(i, c) {
    if (this.type === 'INSTANCE' || insideInstance(this)) throw new Error('Cannot append into an instance');
    if (c.type === 'PAGE' && this.type !== 'DOCUMENT') throw new Error('Pages go in the document');
    if (c.parent) {
      const j = c.parent.children.indexOf(c);
      if (j >= 0) c.parent.children.splice(j, 1);
    }
    if (c.type === 'COMPONENT' && insideComponent(this)) throw new Error(`Component "${c.name}" cannot be nested inside component "${this.name}"`);
    this.children.splice(Math.min(i, this.children.length), 0, c);
    c.parent = this;
  }
  findAll(fn) {
    const out = [];
    const walk = (n) => {
      for (const c of n.children || []) {
        if (!fn || fn(c)) out.push(c);
        walk(c);
      }
    };
    walk(this);
    return out;
  }
  findOne(fn) {
    const walk = (n) => {
      for (const c of n.children || []) {
        if (fn(c)) return c;
        const r = walk(c);
        if (r) return r;
      }
      return null;
    };
    return walk(this);
  }
  findChild(fn) {
    return this.children.find(fn) || null;
  }
}

function pageOf(n) {
  let p = n;
  while (p && p.type !== 'PAGE') p = p.parent;
  return p || null;
}

function insideInstance(n) {
  let p = n.parent;
  while (p) {
    if (p.type === 'INSTANCE') return true;
    p = p.parent;
  }
  return false;
}

function insideComponent(n) {
  let p = n;
  while (p) {
    if (p.type === 'COMPONENT') return true;
    p = p.parent;
  }
  return false;
}

class FrameNode extends ParentNode {
  constructor(type = 'FRAME') {
    super(type);
    this.layoutMode = 'NONE';
    this.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    this.clipsContent = true;
    this.itemSpacing = 0;
    this.layoutGrow = 0;
    this._layoutWrap = 'NO_WRAP';
  }
  set layoutWrap(v) {
    if (v === 'WRAP' && this.layoutMode !== 'HORIZONTAL') throw new Error('WRAP needs HORIZONTAL');
    this._layoutWrap = v;
  }
  get layoutWrap() {
    return this._layoutWrap;
  }
  clone() {
    return deepClone(this, false);
  }
  createInstance() {
    if (this.type !== 'COMPONENT') throw new Error('createInstance on non-component');
    if (this.removed) throw new Error('createInstance on removed component');
    const inst = deepClone(this, true);
    inst.type = 'INSTANCE';
    inst.mainComponent = this;
    mock.currentPage.appendChild(inst);
    return inst;
  }
  swapComponent(c) {
    if (this.type !== 'INSTANCE') throw new Error('swapComponent on non-instance');
    this.mainComponent = c;
    this.children = [];
    for (const ch of c.children) {
      const k = deepClone(ch, true);
      k.parent = this;
      this.children.push(k);
    }
  }
}

function deepClone(n, intoInstance) {
  const c = Object.create(Object.getPrototypeOf(n));
  for (const k of Object.keys(n)) {
    if (k === 'children' || k === 'parent') continue;
    c[k] = n[k];
  }
  c.id = (intoInstance ? 'I' : '') + '1:' + nextId++;
  nodesById.set(c.id, c);
  c.parent = null;
  if (n.children) {
    c.children = [];
    for (const ch of n.children) {
      const k = deepClone(ch, intoInstance);
      k.parent = c;
      c.children.push(k);
    }
    if (intoInstance) for (const ch of c.children) markInstanceChild(ch);
  }
  return c;
}

function markInstanceChild(n) {
  if (n.type === 'COMPONENT') n.type = 'FRAME';
  for (const ch of n.children || []) markInstanceChild(ch);
}

class TextNode extends BaseNode {
  constructor() {
    super('TEXT');
    this._fontName = { family: 'Inter', style: 'Regular' };
    this._characters = '';
    this.fontSize = 12;
    this.textAutoResize = 'WIDTH_AND_HEIGHT';
  }
  get fontName() {
    return this._fontName;
  }
  set fontName(f) {
    if (!loadedFonts.has(fontKey(f))) throw new Error('Font not loaded: ' + fontKey(f));
    this._fontName = f;
  }
  get characters() {
    return this._characters;
  }
  set characters(s) {
    if (!loadedFonts.has(fontKey(this._fontName))) throw new Error('Set characters before loading ' + fontKey(this._fontName));
    if (typeof s !== 'string') throw new Error('characters must be string');
    this._characters = s;
    this.width = Math.max(1, s.length * 7);
    this.height = 20;
  }
  setRangeFills(start, end, fills) {
    if (!(start >= 0 && end <= this._characters.length && start < end)) throw new Error('Bad range ' + start + '-' + end);
    if (!Array.isArray(fills)) throw new Error('fills must be array');
  }
  setRangeFontName(start, end, f) {
    if (!(start >= 0 && end <= this._characters.length && start < end)) throw new Error('Bad range');
    if (!loadedFonts.has(fontKey(f))) throw new Error('Range font not loaded ' + fontKey(f));
  }
  setTextStyleIdAsync(id) {
    this._alive('setTextStyleIdAsync');
    return this._setTextStyle(id);
  }
  async _setTextStyle(id) {
    if (!styles.has(id)) throw new Error('Unknown text style ' + id);
    const s = styles.get(id);
    if (!loadedFonts.has(fontKey(s.fontName))) throw new Error('Style font not loaded');
    this._textStyleId = id;
  }
  clone() {
    return deepClone(this, false);
  }
}

class ShapeNode extends BaseNode {
  clone() {
    return deepClone(this, false);
  }
}

class PageNode extends ParentNode {
  constructor() {
    super('PAGE');
    this.backgrounds = [];
    this.flowStartingPoints = [];
  }
  async loadAsync() {}
}

class DocumentNode extends ParentNode {
  constructor() {
    super('DOCUMENT');
  }
}

function track(n) {
  nodesById.set(n.id, n);
  if (n.type !== 'PAGE' && n.type !== 'DOCUMENT') mock.currentPage.appendChild(n);
  return n;
}

const collections = [];
const variables = [];
const MAX_MODES = Number(process.env.MAX_MODES || 4);

const mock = {
  root: new DocumentNode(),
  currentPage: null,
  closed: null,
  notes: [],
  createPage() {
    const p = new PageNode();
    nodesById.set(p.id, p);
    mock.root.appendChild(p);
    return p;
  },
  async setCurrentPageAsync(p) {
    if (p.type !== 'PAGE') throw new Error('not a page');
    mock.currentPage = p;
  },
  createFrame: () => track(new FrameNode()),
  createComponent: () => track(new FrameNode('COMPONENT')),
  createSection() {
    const s = new FrameNode('SECTION');
    s.layoutMode = undefined;
    return track(s);
  },
  createText: () => track(new TextNode()),
  createRectangle: () => track(new ShapeNode('RECTANGLE')),
  createEllipse: () => track(new ShapeNode('ELLIPSE')),
  createLine() {
    const l = track(new ShapeNode('LINE'));
    l.height = 0;
    return l;
  },
  createNodeFromSvg(svg) {
    if (!/^<svg[\s\S]*<\/svg>$/.test(svg)) throw new Error('bad svg');
    const f = track(new FrameNode());
    f.width = Number((svg.match(/width="(\d+)"/) || [])[1] || 24);
    f.height = Number((svg.match(/height="(\d+)"/) || [])[1] || 24);
    const els = svg.match(/<(path|circle|rect|line|polyline|polygon)\b[^>]*>/g) || [];
    for (const e of els) {
      const v = new ShapeNode(e.startsWith('<circle') ? 'ELLIPSE' : e.startsWith('<rect') ? 'RECTANGLE' : 'VECTOR');
      nodesById.set(v.id, v);
      const filled = /fill="#/.test(e);
      v.fills = filled ? [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }] : [];
      v.strokes = /stroke=/.test(e) || !filled ? [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }] : [];
      v.constraints = { horizontal: 'MIN', vertical: 'MIN' };
      f.appendChild(v);
    }
    return f;
  },
  // Like Figma: the converted node is replaced by a new component node; children move over.
  createComponentFromNode(n) {
    if (n.type !== 'FRAME') throw new Error('createComponentFromNode expects frame, got ' + n.type);
    const c = new FrameNode('COMPONENT');
    for (const k of Object.keys(n)) {
      if (k === 'id' || k === 'children' || k === 'parent' || k === 'removed' || k === '_pluginData') continue;
      c[k] = n[k];
    }
    c.type = 'COMPONENT';
    nodesById.set(c.id, c);
    const parent = n.parent;
    const index = parent ? parent.children.indexOf(n) : -1;
    for (const ch of n.children.slice()) c.appendChild(ch);
    n.remove();
    nodesById.delete(n.id);
    if (parent) parent.insertChild(index, c);
    return c;
  },
  combineAsVariants(nodes, parent) {
    if (!nodes.length) throw new Error('no nodes');
    for (const n of nodes) if (n.type !== 'COMPONENT') throw new Error('combineAsVariants needs components');
    const target = pageOf(parent);
    for (const n of nodes) {
      if (pageOf(n) !== target) throw new Error(`Variant "${n.name}" is on a different page from the set parent "${parent.name}"`);
    }
    const names = new Set();
    for (const n of nodes) {
      if (names.has(n.name)) throw new Error('Duplicate variant name ' + n.name);
      names.add(n.name);
      if (!/=/.test(n.name)) throw new Error('Variant name missing property: ' + n.name);
    }
    const cs = new FrameNode('COMPONENT_SET');
    nodesById.set(cs.id, cs);
    parent.appendChild(cs);
    for (const n of nodes) cs.appendChild(n);
    return cs;
  },
  createTextStyle() {
    const s = { id: 'S:' + nextId++, type: 'TEXT', name: '', remove() { styles.delete(this.id); } };
    let fn = { family: 'Inter', style: 'Regular' };
    Object.defineProperty(s, 'fontName', {
      get: () => fn,
      set: (f) => {
        if (!loadedFonts.has(fontKey(f))) throw new Error('Style font not loaded ' + fontKey(f));
        fn = f;
      },
    });
    styles.set(s.id, s);
    return s;
  },
  createEffectStyle() {
    const s = { id: 'S:' + nextId++, type: 'EFFECT', name: '', effects: [], remove() { styles.delete(this.id); } };
    styles.set(s.id, s);
    return s;
  },
  async getLocalTextStylesAsync() {
    return [...styles.values()].filter((s) => s.type === 'TEXT');
  },
  async getLocalEffectStylesAsync() {
    return [...styles.values()].filter((s) => s.type === 'EFFECT');
  },
  async listAvailableFontsAsync() {
    const out = [];
    for (const style of ['Regular', 'Medium', 'Semi Bold', 'Bold', 'Extra Bold']) out.push({ fontName: { family: 'Inter', style } });
    if (!process.env.NO_JAKARTA) for (const style of ['Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold']) out.push({ fontName: { family: 'Plus Jakarta Sans', style } });
    return out;
  },
  async loadFontAsync(f) {
    const avail = await mock.listAvailableFontsAsync();
    if (!avail.find((a) => fontKey(a.fontName) === fontKey(f))) throw new Error('Font unavailable ' + fontKey(f));
    loadedFonts.add(fontKey(f));
  },
  notify(msg) {
    mock.notes.push(msg);
  },
  closePlugin(msg) {
    mock.closed = msg || '';
  },
  viewport: { scrollAndZoomIntoView() {} },
  async setFileThumbnailNodeAsync() {},
  variables: {
    createVariableCollection(name) {
      const c = {
        id: 'VC:' + nextId++,
        name,
        modes: [{ modeId: 'M:' + nextId++, name: 'Mode 1' }],
        renameMode(id, n) {
          const m = this.modes.find((x) => x.modeId === id);
          if (!m) throw new Error('mode');
          m.name = n;
        },
        addMode(n) {
          if (this.modes.length >= MAX_MODES) throw new Error('Limited to ' + MAX_MODES + ' modes');
          const id = 'M:' + nextId++;
          this.modes.push({ modeId: id, name: n });
          return id;
        },
        remove() {
          collections.splice(collections.indexOf(this), 1);
          for (let i = variables.length - 1; i >= 0; i--) if (variables[i].collection === this) variables.splice(i, 1);
        },
      };
      collections.push(c);
      return c;
    },
    createVariable(name, collection, type) {
      if (typeof collection === 'string') throw new Error('dynamic-page requires collection object');
      if (variables.find((v) => v.name === name && v.collection === collection)) throw new Error('Duplicate variable ' + name);
      const v = {
        id: 'V:' + nextId++,
        type: 'VARIABLE',
        name,
        collection,
        resolvedType: type,
        values: {},
        scopes: [],
        setValueForMode(m, val) {
          if (!collection.modes.find((x) => x.modeId === m)) throw new Error('Unknown mode for ' + name);
          if (type === 'COLOR' && !(val.type === 'VARIABLE_ALIAS' || 'r' in val)) throw new Error('bad colour value');
          this.values[m] = val;
        },
        setVariableCodeSyntax() {},
      };
      variables.push(v);
      return v;
    },
    createVariableAlias(v) {
      return { type: 'VARIABLE_ALIAS', id: v.id };
    },
    setBoundVariableForPaint(p, field, v) {
      if (p.type !== 'SOLID') throw new Error('bind on non-solid');
      if (v.resolvedType !== 'COLOR') throw new Error('bind non-colour');
      return Object.assign({}, p, { boundVariables: { color: { type: 'VARIABLE_ALIAS', id: v.id } } });
    },
    async getLocalVariableCollectionsAsync() {
      return collections.slice();
    },
  },
};

const first = new PageNode();
first.name = 'Page 1';
nodesById.set(first.id, first);
mock.root.appendChild(first);
mock.currentPage = first;

module.exports = { mock, nodesById, collections, variables, styles };
