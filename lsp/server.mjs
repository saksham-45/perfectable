/**
 * Workbench Language Server
 * 
 * Provides real-time desktop/IDE UI quality diagnostics via LSP.
 * Compatible with VS Code, Cursor, Zed, Neovim, and other LSP clients.
 */

import { createConnection, TextDocuments, Diagnostic, DiagnosticSeverity, ProposedFeatures, InitializeParams, InitializeResult, TextDocumentSyncKind, Position, Range } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findRoot, inferProject, loadConfig, walkFiles, loadTargets, isUiFile } from '../skills/perfectable/scripts/lib.mjs';
import { detectFiles } from '../skills/perfectable/scripts/detect.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create LSP connection
const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

// Server state
let workspaceRoot = null;
let projectContext = null;
let projectConfig = null;

// Diagnostics cache
const diagnosticsCache = new Map<string, Diagnostic[]>();

// Initialize
connection.onInitialize((params: InitializeParams) => {
  workspaceRoot = params.rootUri ? path.dirname(params.rootUri.replace('file://', '')) : process.cwd();
  
  // Initialize project context
  if (workspaceRoot && fs.existsSync(workspaceRoot)) {
    projectContext = inferProject(workspaceRoot);
    projectConfig = loadConfig(workspaceRoot);
  }
  
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      diagnosticProvider: {
        interFileDependencies: true,
        workspaceDiagnostics: true,
      },
    },
  };
  
  connection.console.log(`Perfectable LSP initialized. Root: ${workspaceRoot}`);
  connection.console.log(`Platform: ${projectContext?.platform}, Shell: ${projectContext?.shell}`);
  
  return result;
});

// Handle document changes
documents.onDidChangeContent(change => {
  validateDocument(change.document);
});

// Handle document close
documents.onDidClose(close => {
  diagnosticsCache.delete(close.document.uri);
});

// Validate a single document
async function validateDocument(document: TextDocument) {
  if (!workspaceRoot || !projectContext) return;
  
  const filePath = document.uri.replace('file://', '');
  const relativePath = path.relative(workspaceRoot, filePath);
  
  // Only validate UI files
  if (!isUiFile(filePath)) return;
  
  try {
    // Create a temporary file object for detection
    const fileObj = {
      file: filePath,
      rel: relativePath,
      content: document.getText(),
    };
    
    const findings = detectFiles([fileObj], {
      config: projectConfig,
      ctx: projectContext,
      immediate: true, // Use immediate rules for real-time feedback
    });
    
    // Convert findings to LSP diagnostics
    const diagnostics: Diagnostic[] = findings.map(f => ({
      severity: mapSeverity(f.severity),
      range: Range.create(
        Position.create(f.line - 1, 0),
        Position.create(f.line - 1, 100)
      ),
      message: `[${f.id}] ${f.message}`,
      source: 'perfectable',
      code: f.id,
      tags: f.severity === 'error' ? [DiagnosticTag.Unnecessary] : undefined,
    }));
    
    // Cache and send diagnostics
    diagnosticsCache.set(document.uri, diagnostics);
    connection.sendDiagnostics({ uri: document.uri, diagnostics });
  } catch (error) {
    connection.console.error(`Validation error for ${filePath}:`, error);
  }
}

// Map Perfectable severity to LSP DiagnosticSeverity
function mapSeverity(severity: string): DiagnosticSeverity {
  switch (severity) {
    case 'error': return DiagnosticSeverity.Error;
    case 'warning': return DiagnosticSeverity.Warning;
    case 'advisory': return DiagnosticSeverity.Hint;
    default: return DiagnosticSeverity.Information;
  }
}

// Handle workspace diagnostics request (for inter-file dependencies)
connection.onWorkspaceDiagnostic(async (params) => {
  if (!workspaceRoot || !projectContext) return { items: [] };
  
  try {
    const files = walkFiles(workspaceRoot).filter(isUiFile);
    const fileObjs = files.map(file => {
      const content = fs.readFileSync(file, 'utf8');
      return { file, rel: path.relative(workspaceRoot, file), content };
    });
    
    const findings = detectFiles(fileObjs, {
      config: projectConfig,
      ctx: projectContext,
      immediate: false, // Full scan for workspace diagnostics
    });
    
    // Group findings by file
    const fileDiagnostics = new Map<string, Diagnostic[]>();
    for (const f of findings) {
      const fileUri = `file://${f.file}`;
      if (!fileDiagnostics.has(fileUri)) {
        fileDiagnostics.set(fileUri, []);
      }
      fileDiagnostics.get(fileUri)!.push({
        severity: mapSeverity(f.severity),
        range: Range.create(Position.create(f.line - 1, 0), Position.create(f.line - 1, 100)),
        message: `[${f.id}] ${f.message}`,
        source: 'perfectable',
        code: f.id,
      });
    }
    
    // Convert to workspace diagnostic items
    const items = Array.from(fileDiagnostics.entries()).map(([uri, diagnostics]) => ({
      uri,
      version: null,
      diagnostics,
    }));
    
    return { items };
  } catch (error) {
    connection.console.error('Workspace diagnostic error:', error);
    return { items: [] };
  }
});

// Handle configuration changes
connection.onDidChangeConfiguration(change => {
  if (workspaceRoot) {
    projectConfig = loadConfig(workspaceRoot);
    // Re-validate all open documents
    documents.all().forEach(validateDocument);
  }
});

// Start the server
documents.listen(connection);
connection.listen();

connection.console.log('Perfectable LSP server started');