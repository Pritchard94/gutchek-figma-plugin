// Runs test/run.js under each plan and font scenario. Works on Windows, macOS and Linux.
const { spawnSync } = require('child_process');
const path = require('path');

const scenarios = [
  ['Light and Dark modes', {}],
  ['Starter plan (one mode per collection)', { MAX_MODES: '1' }],
  ['Plus Jakarta Sans missing', { NO_JAKARTA: '1' }],
];

for (const [label, env] of scenarios) {
  console.log('\n== ' + label);
  const res = spawnSync(process.execPath, [path.join(__dirname, 'run.js')], { stdio: 'inherit', env: Object.assign({}, process.env, env) });
  if (res.status !== 0) {
    console.error('smoke: FAILED in "' + label + '"');
    process.exit(1);
  }
}
