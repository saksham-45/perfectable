#!/usr/bin/env node
/**
 * Install script for Perfectable LSP server
 * Copies the server to the extension's server directory
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..', '..');
const serverSrc = path.join(projectRoot, 'lsp', 'server', 'server.mjs');
const serverDestDir = path.join(__dirname, '..', 'server');
const serverDest = path.join(serverDestDir, 'server.mjs');

console.log('Installing Perfectable LSP server...');
console.log(`Source: ${serverSrc}`);
console.log(`Destination: ${serverDest}`);

if (!fs.existsSync(serverSrc)) {
  console.error(`Source server not found: ${serverSrc}`);
  process.exit(1);
}

// Create destination directory
fs.mkdirSync(serverDestDir, { recursive: true });

// Copy server file
fs.copyFileSync(serverSrc, serverDest);

console.log('Perfectable LSP server installed successfully!');
console.log(`Server installed to: ${serverDest}`);