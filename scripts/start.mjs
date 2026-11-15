import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const node = process.execPath;

// Free ports 3000 + 3001 before boot
process.argv.push('3000', '3001');
await import('./free-ports.mjs');
await sleep(1200);

const apiEntry = path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const viteEntry = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

/** @type {Map<string, import('node:child_process').ChildProcess>} */
const children = new Map();
let shuttingDown = false;

function start(name, args) {
  if (shuttingDown) return;

  const child = spawn(node, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    windowsHide: true,
    env: process.env,
  });

  children.set(name, child);

  child.on('exit', (code, signal) => {
    children.delete(name);
    if (shuttingDown) return;
    console.log(
      `\n[${name}] stopped (code=${code ?? 'null'}, signal=${signal ?? 'null'}). Restarting in 2s…`,
    );
    setTimeout(() => start(name, args), 2000);
  });
}

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('\nStopping College ERP…');
  for (const child of children.values()) {
    try {
      if (process.platform === 'win32' && child.pid) {
        spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
          stdio: 'ignore',
          shell: true,
          windowsHide: true,
        });
      } else {
        child.kill('SIGTERM');
      }
    } catch {
      // ignore
    }
  }
  setTimeout(() => process.exit(0), 800);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('Starting College ERP (API :3001 + UI :3000)…');
console.log('Keep THIS terminal open. Press Ctrl+C to stop.\n');

start('api', [apiEntry, path.join(root, 'server', 'index.ts')]);
start('web', [viteEntry, '--port=3000', '--host=0.0.0.0']);

setInterval(() => {}, 1 << 30);
