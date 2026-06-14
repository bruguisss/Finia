const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DEBOUNCE_MS = 5000;

let timer = null;
let running = false;
let pending = false;

function run(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { cwd: ROOT }, (err, stdout, stderr) => {
      resolve({ code: err ? (err.code ?? 1) : 0, stdout, stderr });
    });
  });
}

async function commitAndPush() {
  if (running) {
    pending = true;
    return;
  }
  running = true;

  await run('git add -A');

  const diff = await run('git diff --cached --quiet');
  if (diff.code === 0) {
    console.log('[autopush] Sin cambios, nada que commitear.');
  } else {
    const commit = await run('git commit -m "auto: cambios"');
    if (commit.code !== 0) {
      console.error('[autopush] Error en commit:', commit.stderr || commit.stdout);
    } else {
      const push = await run('git push');
      if (push.code !== 0) {
        console.error('[autopush] Error en push:', push.stderr || push.stdout);
      } else {
        console.log(`[autopush] ${new Date().toISOString()} Cambios subidos a GitHub.`);
      }
    }
  }

  running = false;
  if (pending) {
    pending = false;
    scheduleCommit();
  }
}

function scheduleCommit() {
  clearTimeout(timer);
  timer = setTimeout(commitAndPush, DEBOUNCE_MS);
}

const watcher = chokidar.watch(ROOT, {
  ignored: [
    /(^|[\/\\])\.git([\/\\]|$)/,
    '**/node_modules/**',
    '**/dist/**',
    '**/.env',
    '**/*.log',
  ],
  ignoreInitial: true,
  persistent: true,
});

watcher.on('all', (event, filePath) => {
  console.log(`[autopush] ${event}: ${path.relative(ROOT, filePath)}`);
  scheduleCommit();
});

console.log(`[autopush] Vigilando cambios en ${ROOT} (Ctrl+C para detener)`);
