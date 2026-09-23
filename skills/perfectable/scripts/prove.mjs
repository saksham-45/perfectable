#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
    if (/menubar/i.test(role)) menu = true;
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
    if (/^AXWindow$/i.test(role) && !title) {
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
  return findings;
}

function arg(args, name) {
  const i = args.indexOf(name);
  if (i >= 0 && args[i + 1]) return args[i + 1];
  const pref = `${name}=`;
  const hit = args.find((a) => a.startsWith(pref));
  return hit ? hit.slice(pref.length) : null;
}

function dumpLive(pid) {
  if (process.platform !== 'darwin') {
    process.stderr.write('Live AX dump is macOS-only. Pass --ax <file.json> on this OS.\n');
    process.exit(3);
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'perfectable-ax-'));
  const src = path.join(dir, 'ax.swift');
  const bin = path.join(dir, 'ax');
  fs.writeFileSync(src, SWIFT);
  const compiled = spawnSync('swiftc', ['-O', '-o', bin, src], { encoding: 'utf8' });
  if (compiled.status !== 0) {
    process.stderr.write(compiled.stderr || 'swiftc failed\n');
    process.exit(3);
  }
  const ran = spawnSync(bin, [String(pid)], { encoding: 'utf8' });
  if (ran.status === 3) {
    process.stderr.write('Accessibility permission missing. Enable Perfectable in System Settings → Privacy → Accessibility.\n');
    process.exit(3);
  }
  if (ran.status !== 0) {
    process.stderr.write(ran.stderr || 'AX dump failed\n');
    process.exit(1);
  }
  return JSON.parse(ran.stdout);
}

function screenshot(outPath) {
  if (process.platform !== 'darwin') return false;
  const r = spawnSync('screencapture', ['-x', outPath], { encoding: 'utf8' });
  return r.status === 0 && fs.existsSync(outPath);
}

export function proveCli(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write('Usage: prove.mjs --ax <tree.json> | --pid <n> [--screenshot out.png] [--golden file]\nExit 0 clean, 2 findings, 3 could not inspect.\n');
    process.exit(0);
  }
  const axPath = arg(argv, '--ax');
  const pid = arg(argv, '--pid');
  const shot = arg(argv, '--screenshot');
  const golden = arg(argv, '--golden');
  let tree;
  if (axPath) {
    tree = JSON.parse(fs.readFileSync(axPath, 'utf8'));
  } else if (pid) {
    tree = dumpLive(pid);
  } else {
    process.stderr.write('Pass --ax <file.json> or --pid <n>. Refusing to report clean without a tree.\n');
    process.exit(3);
  }
  const findings = scoreAx(tree);
  let goldenMismatch = false;
  if (shot) {
    const ok = screenshot(shot);
    if (!ok) findings.push({
      id: 'screenshot-failed',
      severity: 'warning',
      name: 'Screenshot failed',
      message: 'screencapture did not write a file.',
      file: shot,
      line: 1,
      snippet: shot,
    });
    else if (golden && fs.existsSync(golden)) {
      const a = fs.readFileSync(shot);
      const b = fs.readFileSync(golden);
      goldenMismatch = !a.equals(b);
      if (goldenMismatch) {
        findings.push({
          id: 'screenshot-golden-mismatch',
          severity: 'error',
          name: 'Screenshot differs from golden',
          message: 'The captured PNG is not byte-identical to the golden file.',
          file: shot,
          line: 1,
          snippet: golden,
        });
      }
    }
  }
  const payload = { ok: findings.length === 0, findings };
  process.stdout.write(JSON.stringify(payload, null, 2) + '\n');
  process.exit(findings.length ? 2 : 0);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) proveCli();
