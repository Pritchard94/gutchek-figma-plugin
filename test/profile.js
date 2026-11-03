// Profiles a generator run against the mock: time per stage (from figma.notify) and the heaviest frames.
const path = require('path');
const { mock } = require('./mock-figma');
global.figma = mock;

const stamps = [];
const notify = mock.notify;
mock.notify = (msg) => {
  stamps.push([Date.now(), msg]);
  notify(msg);
};
const t0 = Date.now();
require(path.join(__dirname, '..', 'code.js'));
const id = setInterval(() => {
  if (mock.closed === null) return;
  clearInterval(id);
  stamps.push([Date.now(), 'done']);
  for (let i = 0; i < stamps.length - 1; i++) console.log(String(stamps[i + 1][0] - stamps[i][0]).padStart(6) + ' ms  ' + stamps[i][1]);
  console.log('total', Date.now() - t0, 'ms');
  for (const pageName of ['Web App', 'Cover', 'Website', 'Screens · Light']) {
    const page = mock.root.children.find((p) => p.name === pageName);
    if (!page) continue;
    const frames = [];
    page.findAll((n) => {
      if (n.type === 'FRAME' && n.parent && (n.parent.type === 'SECTION' || n.parent.type === 'PAGE')) frames.push(n);
      return false;
    });
    const inInstance = (n) => {
      for (let p = n.parent; p; p = p.parent) if (p.type === 'INSTANCE') return true;
      return false;
    };
    const own = (root) => root.findAll((n) => !inInstance(n)).length;
    const rows = frames.map((f) => [f.name, own(f), f.findAll((n) => n.type === 'INSTANCE' && !inInstance(n)).length]).sort((a, b) => b[1] - a[1]);
    console.log(`\n${pageName}: ${frames.length} frames, ${own(page)} created nodes (${page.findAll().length} including instance contents)`);
    for (const r of rows.slice(0, 8)) console.log('  ' + String(r[1]).padStart(6) + ' nodes ' + String(r[2]).padStart(5) + ' instances  ' + r[0]);
  }
  process.exit(0);
}, 20);
