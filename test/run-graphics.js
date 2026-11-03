// Smoke test for the Graphic Designer plugin against the mock API.
// 1. An empty file: tokens, styles and icons are created, phones fall back to illustrations.
// 2. After Gutchek General and Mobile have run: tokens are reused and phone mockups use real app screens.
// 3. The .docx reader in ui.html extracts text from a real Word file.
const fs = require('fs');
const path = require('path');
const { mock } = require('./mock-figma');

global.figma = mock;
global.__html__ = '<html></html>';

const root = path.join(__dirname, '..');
const graphics = path.join(root, 'graphics', 'code.js');
const { press } = require('./drive');

const until = (pred, ms = 120000) =>
  new Promise((resolve, reject) => {
    const t0 = Date.now();
    const id = setInterval(() => {
      if (pred()) {
        clearInterval(id);
        resolve();
      } else if (Date.now() - t0 > ms) {
        clearInterval(id);
        reject(new Error('timed out'));
      }
    }, 25);
  });

async function runGraphics(label, text) {
  mock.uiMessages.length = 0;
  delete require.cache[require.resolve(graphics)];
  require(graphics);
  const sample = mock.uiMessages.find((m) => m.type === 'sample');
  if (!sample) throw new Error('UI did not receive the sample brief');
  await mock.ui.onmessage({ type: 'generate', text: text || sample.text });
  await until(() => mock.uiMessages.some((m) => m.type === 'done' || m.type === 'error'));
  const res = mock.uiMessages.find((m) => m.type === 'done' || m.type === 'error');
  if (res.type === 'error') throw new Error(label + ': ' + res.text);
  const page = mock.root.children.find((p) => p.name === 'Graphic Design');
  const frames = page.findAll((n) => n.type === 'FRAME' && /·\s\d+×\d+$/.test(n.name));
  const phones = page.findAll((n) => n.type === 'FRAME' && /^Phone · /.test(n.name)).length;
  console.log(`  ${label}: ${res.count} graphics, ${frames.length} frames, ${phones} phone mockups, ${page.findAll().length} nodes`);
  for (const n of res.notes) console.log('    note:', n);
  return { res, frames, phones };
}

(async () => {
  const empty = await runGraphics('empty file');
  if (empty.res.count !== 28) throw new Error('expected 28 graphics from the sample brief, got ' + empty.res.count);
  const again = await runGraphics('second run on the same page');
  if (again.frames.length !== 28) throw new Error('rerun did not replace the page contents');

  for (const name of ['general', 'mobile']) {
    const res = await press(name, 'needed');
    if (res.type !== 'done') throw new Error(name + ' failed: ' + res.text);
  }
  const withScreens = await runGraphics('after General and Mobile');
  if (withScreens.phones < 8) throw new Error('expected phone mockups from real screens, got ' + withScreens.phones);

  const small = await runGraphics('short brief', 'Campaign: Test\n## Google display\nHeadline: Hello\n## Unknown thing\n## Instagram story\nTheme: dark\nVisual: notes');
  if (small.res.count !== 9) throw new Error('expected 9 graphics from the short brief, got ' + small.res.count);

  const html = fs.readFileSync(path.join(root, 'graphics', 'ui.html'), 'utf8');
  const code = html.slice(html.indexOf('/* docx:start */'), html.indexOf('/* docx:end */'));
  const reader = new Function(code + '; return readDocx;')();
  const docx = process.env.DOCX || '/Users/bigmac/Downloads/Gutchek_Product_Spec(1).docx';
  if (fs.existsSync(docx)) {
    const buf = fs.readFileSync(docx);
    const text = await reader(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    const lines = text.split('\n');
    if (lines.length < 100 || text.indexOf('Gutchek') === -1) throw new Error('docx text extraction looks wrong');
    console.log(`  docx reader: ${lines.length} lines from ${path.basename(docx)}`);
  }
  const tpl = fs.readFileSync(path.join(root, 'graphics', 'brief-template.docx'));
  const tplText = await reader(tpl.buffer.slice(tpl.byteOffset, tpl.byteOffset + tpl.byteLength));
  const fromWord = await runGraphics('Word template brief', tplText);
  if (fromWord.res.count !== 28) throw new Error('the Word template should give 28 graphics, got ' + fromWord.res.count);
  const calendar = fs.readFileSync(path.join(root, 'graphics', 'briefs', 'waitlist-calendar-nov-2-13.md'), 'utf8');
  const cal = await runGraphics('waitlist calendar brief', calendar);
  if (cal.res.count !== 26) throw new Error('the calendar brief should give 26 graphics, got ' + cal.res.count);
  const names = cal.frames.map((f) => f.name);
  if (new Set(names).size !== names.length) throw new Error('duplicate graphic names: ' + names.join(', '));
  if (cal.res.notes.some((n) => /not one of|Unknown format|ignored/.test(n))) throw new Error('calendar brief produced warnings');
  console.log('    ' + names.slice(0, 5).join(' | '));
  const calDocx = fs.readFileSync(path.join(root, 'graphics', 'briefs', 'waitlist-calendar-nov-2-13.docx'));
  const calText = await reader(calDocx.buffer.slice(calDocx.byteOffset, calDocx.byteOffset + calDocx.byteLength));
  const calWord = await runGraphics('waitlist calendar brief (Word)', calText);
  if (calWord.res.count !== 26) throw new Error('the Word calendar brief should give 26 graphics, got ' + calWord.res.count);
  console.log('graphics: ok');
  process.exit(0);
})().catch((e) => {
  console.error('graphics: FAILED', e && e.stack ? e.stack : e);
  process.exit(1);
});
