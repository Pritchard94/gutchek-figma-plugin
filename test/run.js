// Smoke test: drives the four Gutchek plugins against the mock API the way a person would, through their panels.
// Usage: node test/run.js            (variables with Light/Dark modes)
//        MAX_MODES=1 node test/run.js (Starter plan: one mode per collection)
//        NO_JAKARTA=1 node test/run.js (Plus Jakarta Sans unavailable)
// node test/smoke.js runs all three.
const { mock, nodesById, collections, variables, styles, attached } = require('./mock-figma');

global.figma = mock;
global.console = console;

const { open, items, press } = require('./drive');

const fail = (msg) => {
  throw new Error(msg);
};
const check = (ok, msg) => ok || fail(msg);

/** Opens a plugin, ticks items and presses Update. */
async function run(name, pick, expectError) {
  const t0 = Date.now();
  const res = await press(name, pick);
  const ids = res.ids;
  if (expectError) {
    check(res.type === 'error' && res.text.indexOf(expectError) !== -1, name + ' should have failed with "' + expectError + '", got: ' + res.text);
    console.log(`  ${name}: refused as expected (${res.text})`);
    return res;
  }
  if (res.type === 'error') fail(name + ': ' + res.text + '\n' + (res.notes || []).join('\n'));
  console.log(`  ${name} [${ids.length} item(s), ${Date.now() - t0}ms]: ${res.text}`);
  for (const n of res.notes || []) console.log('    note:', n);
  return res;
}

const page = (name) => mock.root.children.find((p) => p.name === name);
const sectionIds = (p) => p.children.map((s) => s.id);

/** Prototype links whose destination is gone, and links in total. */
function links(p) {
  let bad = 0;
  let total = 0;
  for (const n of p.findAll((x) => x.reactions && x.reactions.length)) {
    for (const r of n.reactions) {
      for (const a of r.actions || []) {
        if (a.type !== 'NODE') continue;
        total++;
        const d = nodesById.get(a.destinationId);
        if (!d || d.removed || !attached(d)) bad++;
      }
    }
  }
  return { bad, total };
}

function stats() {
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
  check(unlinked === 0 && fxUnlinked === 0, 'some text or effect styles are not linked');
  for (const p of mock.root.children) {
    const nodes = p.findAll();
    const count = (t) => nodes.filter((n) => n.type === t).length;
    const l = links(p);
    console.log(`  page "${p.name}": ${p.children.length} top-level, ${nodes.length} nodes, ${count('INSTANCE')} instances, ${count('COMPONENT')} components, ${l.total} links`);
    check(l.bad === 0, `${l.bad} prototype links on "${p.name}" point at removed frames`);
  }
  console.log('  collections:', collections.map((c) => c.name + ' [' + c.modes.map((m) => m.name).join('/') + ']').join(', '));
  console.log('  variables:', variables.length, 'styles:', styles.size);
}

/** Instances anywhere in the file whose main component is no longer in the document. */
function orphans() {
  return mock.root.children.reduce((n, p) => n + p.findAll((x) => x.type === 'INSTANCE' && x.mainComponent && !attached(x.mainComponent)).length, 0);
}

(async () => {
  console.log('1. Section plugins refuse to run before General');
  await run('mobile', 'all', 'Run the Gutchek General plugin first');

  console.log('2. First build, one plugin at a time');
  await run('general', 'needed');
  for (const name of ['Cover', 'Brand Guidelines', 'Foundations', 'Components']) check(page(name), 'General did not create ' + name);
  check(!page('Screens · Light') && !page('Website'), 'General touched pages it does not own');
  await run('mobile', 'needed');
  await run('website', 'needed');
  await run('webapp', 'needed');
  const order = mock.root.children.map((p) => p.name).filter((n) => n !== 'Page 1');
  check(order.join('|') === 'Cover|Brand Guidelines|Foundations|Components|Screens · Light|Screens · Dark|Web App|User Flow|Website|Waitlist', 'unexpected page order: ' + order.join(', '));
  stats();

  console.log('3. Nothing is ticked once everything is in the file');
  for (const name of ['general', 'mobile', 'website', 'webapp']) {
    const needed = items(await open(name)).filter((i) => i.needed);
    check(needed.length === 0, name + ' still wants to build: ' + needed.map((i) => i.label).join(', '));
  }

  console.log('4. Rebuilding one mobile group touches only that group');
  const light = page('Screens · Light');
  const dark = page('Screens · Dark');
  const note = mock.createFrame();
  note.name = 'My review notes';
  light.appendChild(note);
  note.x = -3000;
  const before = sectionIds(light);
  const darkBefore = sectionIds(dark);
  const report = light.children.find((s) => /· Report$/.test(s.name));
  const reportPos = [report.x, report.y];
  const linksBefore = links(light).total;
  await run('mobile', (all) => all.filter((i) => i.id.indexOf('light:') === 0 && /· Report$/.test(i.label)).map((i) => i.id));
  const after = sectionIds(light);
  const fresh = light.children.find((s) => /· Report$/.test(s.name));
  check(fresh.id !== report.id && report.removed, 'the Report section was not replaced');
  check(fresh.x === reportPos[0] && fresh.y === reportPos[1], 'the rebuilt Report section moved');
  check(before.filter((id) => id !== report.id && id !== note.id).every((id) => after.indexOf(id) !== -1), 'other light sections were replaced');
  check(after.length === before.length && !note.removed, 'the page gained or lost top-level nodes');
  check(sectionIds(dark).join() === darkBefore.join(), 'Screens · Dark changed');
  check(links(light).bad === 0 && links(light).total === linksBefore, `links on Screens · Light: ${JSON.stringify(links(light))}, before ${linksBefore}`);

  console.log('5. Updating tokens keeps every variable and style id');
  const varIds = variables.map((v) => v.id).join();
  const styleIds = [...styles.keys()].join();
  await run('general', ['tokens']);
  check(variables.map((v) => v.id).join() === varIds, 'variables were recreated');
  check([...styles.keys()].join() === styleIds, 'styles were recreated');
  check(sectionIds(light).join() === after.join(), 'updating tokens touched the screens');

  console.log('6. Rebuilding components keeps every instance linked');
  const oldLib = page('Components').children.filter((c) => /^Components · /.test(c.name)).map((c) => c.id);
  await run('general', ['rebuild']);
  const newLib = page('Components').children.filter((c) => /^Components · /.test(c.name)).map((c) => c.id);
  check(newLib.length === oldLib.length && newLib.every((id) => oldLib.indexOf(id) === -1), 'the library was not rebuilt');
  const lost = orphans();
  check(lost === 0, lost + ' instances still point at removed components');
  check(sectionIds(light).join() === after.join(), 'rebuilding components replaced screens');

  console.log('7. Website: one section, and a file whose sections were never tagged');
  const site = page('Website');
  const siteBefore = sectionIds(site);
  for (const n of site.findAll()) delete n._shared;
  for (const n of site.children) delete n._shared;
  await run('website', (all) => all.filter((i) => i.label === 'Website · Mobile 390').map((i) => i.id));
  const siteAfter = sectionIds(site);
  check(siteAfter.length === siteBefore.length, 'website sections were duplicated: ' + site.children.map((s) => s.name).join(', '));
  check(siteAfter.indexOf(siteBefore[0]) !== -1 && siteAfter.indexOf(siteBefore[2]) !== -1 && siteAfter.indexOf(siteBefore[1]) === -1, 'untouched website sections were replaced');
  check(links(site).bad === 0, 'website links point at removed pages');

  console.log('8. Web app: one dark group stays in the dark column');
  const app = page('Web App');
  const darkCol = app.children.filter((s) => / · Dark$/.test(s.name));
  const x = darkCol[0].x;
  await run('webapp', (all) => all.filter((i) => i.id === 'dark:1').map((i) => i.id));
  check(app.children.filter((s) => / · Dark$/.test(s.name)).every((s) => s.x === x), 'dark sections left their column');
  check(links(app).bad === 0, 'web app links point at removed pages');

  console.log('9. A deleted section is the only thing ticked');
  page('Waitlist').children.find((s) => s.name === 'Waitlist · Mobile 390').remove();
  const needed = items(await open('website')).filter((i) => i.needed);
  check(needed.length === 1 && needed[0].label === 'Waitlist · Mobile 390', 'expected only the deleted section to be ticked, got ' + needed.map((i) => i.label).join(', '));
  await run('website', 'needed');
  check(page('Waitlist').children.length === 2, 'the waitlist section was not restored');

  stats();
  console.log('plugins: ok');
  process.exit(0);
})().catch((e) => {
  console.error('plugins: FAILED', e && e.stack ? e.stack : e);
  process.exit(1);
});
