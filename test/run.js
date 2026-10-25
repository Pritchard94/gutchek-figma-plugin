// Smoke test: runs the bundled plugin against the mock API.
// Usage: node test/run.js            (variables with Light/Dark modes)
//        MAX_MODES=1 node test/run.js (Starter plan: one mode per collection)
//        NO_JAKARTA=1 node test/run.js (Plus Jakarta Sans unavailable)
const path = require('path');
const { mock, collections, variables, styles } = require('./mock-figma');

global.figma = mock;
global.console = console;

const bundle = path.join(__dirname, '..', 'code.js');
require(bundle);

let runs = process.env.RERUN ? 2 : 1;
const started = Date.now();
const wait = setInterval(() => {
  if (mock.closed === null && Date.now() - started < 60000) return;
  if (--runs > 0 && mock.closed.indexOf('failed') === -1) {
    console.log('first run:', mock.closed);
    mock.closed = null;
    delete require.cache[require.resolve(bundle)];
    require(bundle);
    return;
  }
  clearInterval(wait);
  console.log('closePlugin:', mock.closed);
  const log = mock.root.children.find((p) => p.name === 'Libra · Generator log');
  if (log) console.log('  log:', log.children.map((t) => t.characters).join('\n').split('\n').slice(0, 8).join(' | '));
  const inInstance = (n) => {
    for (let p = n.parent; p; p = p.parent) if (p.type === 'INSTANCE') return true;
    return n.type === 'INSTANCE';
  };
  const all = mock.root.children.reduce((a, p) => a.concat(p.findAll()), []).filter((n) => !inInstance(n));
  const texts = all.filter((n) => n.type === 'TEXT');
  const unlinked = texts.filter((n) => n.getPluginData('textStyle') && !n._textStyleId).length;
  const fx = all.filter((n) => n.getPluginData && n.getPluginData('effectStyle'));
  const fxUnlinked = fx.filter((n) => !n.effectStyleId).length;
  console.log(`  text styles unlinked: ${unlinked}/${texts.length}, effect styles unlinked: ${fxUnlinked}/${fx.length}`);
  for (const p of mock.root.children) {
    const all = p.findAll();
    const count = (t) => all.filter((n) => n.type === t).length;
    console.log(`  page "${p.name}": ${p.children.length} top-level, ${all.length} nodes, ${count('INSTANCE')} instances, ${count('COMPONENT')} components, ${count('TEXT')} texts`);
  }
  console.log('  collections:', collections.map((c) => c.name + ' [' + c.modes.map((m) => m.name).join('/') + ']').join(', '));
  console.log('  variables:', variables.length, 'styles:', styles.size);
  const screens = mock.root.children.filter((p) => p.name.startsWith('Screens') || p.name === 'Website' || p.name === 'Web App');
  for (const p of screens) {
    const frames = p.findAll((n) => n.getPluginData && (n.getPluginData('screen') === '1' || n.getPluginData('webpage') === '1' || n.getPluginData('webapp') === '1'));
    const withLinks = p.findAll((n) => n.reactions && n.reactions.length).length;
    console.log(`  ${p.name}: ${frames.length} screens, ${withLinks} prototype links`);
  }
  process.exit(mock.closed && mock.closed.indexOf('failed') === -1 ? 0 : 1);
}, 50);
