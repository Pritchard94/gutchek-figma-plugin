// Drives a Gutchek plugin through its panel against the mock API: open it, tick items, press Update.
const path = require('path');
const { mock } = require('./mock-figma');

const bundle = (name) => path.join(__dirname, '..', 'plugins', name, 'code.js');

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
    }, 10);
  });

async function open(name) {
  mock.uiMessages.length = 0;
  delete require.cache[require.resolve(bundle(name))];
  require(bundle(name));
  await until(() => mock.uiMessages.some((m) => m.type === 'init' || m.type === 'error'));
  const init = mock.uiMessages.find((m) => m.type === 'init');
  if (!init) throw new Error(name + ' could not survey the file: ' + JSON.stringify(mock.uiMessages));
  return init;
}

const items = (init) => init.groups.reduce((a, g) => a.concat(g.items), []);

/** `pick` is 'needed', 'all', a list of ids, or a function of the items. Resolves with the done or error message. */
async function press(name, pick) {
  const all = items(await open(name));
  const ids = pick === 'needed' ? all.filter((i) => i.needed).map((i) => i.id) : pick === 'all' ? all.map((i) => i.id) : typeof pick === 'function' ? pick(all) : pick;
  mock.uiMessages.length = 0;
  await mock.ui.onmessage({ type: 'run', ids });
  const res = mock.uiMessages.find((m) => m.type === 'done' || m.type === 'error');
  if (!res) throw new Error(name + ' sent no result');
  return Object.assign({ ids }, res);
}

module.exports = { until, open, items, press };
