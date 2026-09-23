#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { comparePng } from './image-diff.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

const SWIFT = `
import Cocoa
import ApplicationServices
import Foundation

let prompt = kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String
let opts = [prompt: false] as CFDictionary
guard AXIsProcessTrustedWithOptions(opts) else {
  fputs("ax-untrusted\\n", stderr)
  exit(3)
}

func value(_ el: AXUIElement, _ attr: String) -> AnyObject? {
  var out: AnyObject?
  if AXUIElementCopyAttributeValue(el, attr as CFString, &out) != .success { return nil }
  return out
}

func dump(_ el: AXUIElement, depth: Int) -> [String: Any] {
  if depth > 6 { return ["role": "truncated"] }
  let role = value(el, kAXRoleAttribute) as? String ?? ""
  let title = value(el, kAXTitleAttribute) as? String ?? ""
  let desc = value(el, kAXDescriptionAttribute) as? String ?? ""
  var children: [[String: Any]] = []
  if let kids = value(el, kAXChildrenAttribute) as? [AXUIElement], depth < 4 {
    children = kids.prefix(40).map { dump($0, depth: depth + 1) }
  }
  return ["role": role, "title": title, "description": desc, "children": children]
}

let pid: pid_t
if CommandLine.arguments.count > 1, let n = Int32(CommandLine.arguments[1]) {
  pid = n
} else {
  fputs("need pid\\n", stderr)
  exit(1)
}
let app = AXUIElementCreateApplication(pid)
let tree = dump(app, depth: 0)
let data = try! JSONSerialization.data(withJSONObject: tree, options: [.prettyPrinted])
FileHandle.standardOutput.write(data)
`;

export function walkAx(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const child of node.children || []) walkAx(child, visit);
}

export function scoreAx(tree) {
  const findings = [];
  let menu = false;
  walkAx(tree, (node) => {
    const role = String(node.role || '');
    const title = String(node.title || '').trim();
    const description = String(node.description || '').trim();
    if (/menu\s*bar/i.test(role)) menu = true;
    if (/button/i.test(role) && !title && !description) {
      findings.push({
        id: 'ax-unlabeled-button',
        severity: 'error',
        name: 'Unlabeled control',
        message: 'An AXButton has no title or description.',
        file: 'ax',
        line: 1,
        snippet: role,
      });
    }
    if (/(^|\.)(AX)?Window$/i.test(role) || /^frame$/i.test(role) || role.toLowerCase() === 'window') {
      if (!title) {
      findings.push({
        id: 'ax-untitled-window',
        severity: 'error',
        name: 'Untitled window',
        message: 'A window has an empty accessibility title.',
        file: 'ax',
        line: 1,
        snippet: role,
      });
      }
    }
  });
  if (!menu) {
    findings.push({
      id: 'ax-no-menubar',
      severity: 'error',
      name: 'No menu bar',
      message: 'The accessibility tree has no menu bar.',
      file: 'ax',
      line: 1,
      snippet: 'AXMenuBar',
    });
  }
  let caption = false;
  walkAx(tree, (node) => {
    const role = String(node.role || '');
    const title = String(node.title || '');
    if (/button/i.test(role) && /close|minimize|minimise|maximize|maximise|zoom/i.test(title)) caption = true;
  });
  if (!caption) {
    findings.push({
      id: 'hig-no-caption',
      severity: 'error',
      name: 'No window caption buttons',
      message: 'The running window has no Close, Minimize, or Maximize control in the accessibility tree.',
      file: 'ax',
      line: 1,
      snippet: 'caption',
    });
  }
  return findings;
}

function arg(args, name) {
  const i = args.indexOf(name);
  if (i >= 0 && args[i + 1]) return args[i + 1];
  const pref = `${name}=`;
  const hit = args.find((a) => a.startsWith(pref));
  return hit ? hit.slice(pref.length) : null;
}

function failInspect(message, code = 3) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function dumpMac(pid) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'perfectable-ax-'));
  const src = path.join(dir, 'ax.swift');
  const bin = path.join(dir, 'ax');
  fs.writeFileSync(src, SWIFT);
  const compiled = spawnSync('swiftc', ['-O', '-o', bin, src], { encoding: 'utf8' });
  if (compiled.status !== 0) failInspect(compiled.stderr || 'swiftc failed');
  const ran = spawnSync(bin, [String(pid)], { encoding: 'utf8' });
  if (ran.status === 3) failInspect('Accessibility permission missing. Enable the terminal in System Settings → Privacy → Accessibility.');
  if (ran.status !== 0) failInspect(ran.stderr || 'macOS AX dump failed', 1);
  return JSON.parse(ran.stdout);
}

function dumpWindows(pid) {
  const script = path.join(SCRIPT_DIR, 'dump-windows.ps1');
  const ran = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, '-TargetPid', String(pid)], { encoding: 'utf8' });
  if (ran.status === 3) failInspect(ran.stderr || 'Windows UIA could not see that process.');
  if (ran.status !== 0) failInspect(ran.stderr || ran.stdout || 'Windows UIA dump failed', ran.status || 1);
  return JSON.parse(ran.stdout);
}

function dumpLinux(pid) {
  const script = path.join(SCRIPT_DIR, 'dump-linux.py');
  const ran = spawnSync('python3', [script, String(pid)], { encoding: 'utf8' });
  if (ran.status === 3) failInspect(ran.stderr || 'AT-SPI is not available. Install python3-gi and gir1.2-atspi-2.0, and run a session bus.');
  if (ran.status !== 0) failInspect(ran.stderr || 'Linux AT-SPI dump failed', ran.status || 1);
  return JSON.parse(ran.stdout);
}

function normalizeTree(node) {
  if (!node || typeof node !== 'object') return node;
  if (node.children && !Array.isArray(node.children)) node.children = [node.children];
  for (const child of node.children || []) normalizeTree(child);
  return node;
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function dumpLive(pid) {
  let tree;
  if (process.platform === 'darwin') tree = dumpMac(pid);
  else if (process.platform === 'win32') tree = dumpWindows(pid);
  else if (process.platform === 'linux') tree = dumpLinux(pid);
  else failInspect(`No accessibility dumper for ${process.platform}.`);
  return normalizeTree(tree);
}

function screenshot(outPath) {
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  if (process.platform === 'darwin') {
    const r = spawnSync('screencapture', ['-x', outPath], { encoding: 'utf8' });
    return r.status === 0 && fs.existsSync(outPath);
  }
  if (process.platform === 'win32') {
    const ps = `
Add-Type -AssemblyName System.Windows.Forms,System.Drawing
$b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size)
$bmp.Save(${JSON.stringify(path.resolve(outPath))}, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
`;
    const r = spawnSync('powershell.exe', ['-NoProfile', '-Command', ps], { encoding: 'utf8' });
    return r.status === 0 && fs.existsSync(outPath);
  }
  const attempts = [
    ['grim', [outPath]],
    ['gnome-screenshot', ['-f', outPath]],
    ['scrot', ['-o', outPath]],
    ['import', ['-window', 'root', outPath]],
  ];
  for (const [cmd, args] of attempts) {
    const r = spawnSync(cmd, args, { encoding: 'utf8' });
    if (r.status === 0 && fs.existsSync(outPath)) return true;
  }
  return false;
}

export function proveCli(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write('Usage: prove.mjs (--ax <tree.json> | --pid <n> | --launch <cmd>) [--screenshot out.png] [--golden file]\nmacOS uses AX, Windows uses UI Automation, Linux uses AT-SPI. Golden compare is perceptual (dHash + downsample MAE), not byte identity.\nExit 0 clean, 2 findings, 3 could not inspect.\n');
    process.exit(0);
  }
  const axPath = arg(argv, '--ax');
  const pidArg = arg(argv, '--pid');
  const launch = arg(argv, '--launch');
  const shot = arg(argv, '--screenshot');
  const golden = arg(argv, '--golden');
  let tree;
  let launched = null;
  try {
    if (axPath) {
      tree = normalizeTree(JSON.parse(fs.readFileSync(axPath, 'utf8')));
    } else if (pidArg || launch) {
      let pid = pidArg;
      if (launch) {
        launched = spawn(launch, { shell: true, detached: true, stdio: 'ignore' });
        sleep(Number(arg(argv, '--wait-ms') || 800));
        if (!pid) pid = String(launched.pid);
      }
      if (!pid) failInspect('Pass --pid or a --launch command. Refusing to report clean without a process.');
      tree = dumpLive(pid);
    } else {
      failInspect('Pass --ax <file.json>, --pid <n>, or --launch <cmd>. Refusing to report clean without a tree.');
    }
  } finally {
    if (launched && launched.pid) {
      try { process.kill(-launched.pid); } catch { try { process.kill(launched.pid); } catch { /* already gone */ } }
    }
  }
  const findings = scoreAx(tree);
  let perception = null;
  if (shot) {
    const ok = screenshot(shot);
    if (!ok) findings.push({
      id: 'screenshot-failed',
      severity: 'warning',
      name: 'Screenshot failed',
      message: 'No screenshot tool wrote a file (screencapture, PowerShell, grim, gnome-screenshot, scrot, or import).',
      file: shot,
      line: 1,
      snippet: shot,
    });
    else if (golden && fs.existsSync(golden)) {
      perception = comparePng(fs.readFileSync(shot), fs.readFileSync(golden));
      if (!perception.match) {
        findings.push({
          id: 'screenshot-perceptual-mismatch',
          severity: 'error',
          name: 'Screenshot does not match the golden',
          message: `Perceptual diff failed (MAE ${perception.mae.toFixed(1)} / 255, dHash hamming ${perception.hamming}). Byte differences that do not change the picture are ignored.`,
          file: shot,
          line: 1,
          snippet: golden,
        });
      }
    }
  }
  const payload = { ok: findings.length === 0, platform: process.platform, perception, findings };
  process.stdout.write(JSON.stringify(payload, null, 2) + '\n');
  process.exit(findings.length ? 2 : 0);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) proveCli();
