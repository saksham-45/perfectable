import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';
import * as path from 'path';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(path.join('..', 'server', 'server.mjs'));
  
  // If the extension is launched in debug mode, the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: { module: serverModule, transport: TransportKind.ipc, options: { execArgv: ['--nolazy', '--inspect=6009'] } }
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for all supported document types
    documentSelector: [
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'javascript' },
      { scheme: 'file', language: 'html' },
      { scheme: 'file', language: 'css' },
      { scheme: 'file', language: 'scss' },
      { scheme: 'file', language: 'less' },
      { scheme: 'file', language: 'json' },
      { scheme: 'file', language: 'jsonc' },
      { scheme: 'file', language: 'toml' },
      { scheme: 'file', language: 'vue' },
      { scheme: 'file', language: 'svelte' },
    ],
    synchronize: {
      // Notify the server about file changes to files contained in the workspace
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{ts,tsx,js,jsx,mjs,cjs,html,css,scss,less,json,jsonc,toml,vue,svelte}'),
      // Synchronize the setting section 'perfectable' to the server
      configurationSection: 'perfectable',
    },
    initializationOptions: {
      // Pass any initialization options to the server
    },
    middleware: {
      // Handle workspace diagnostics
      provideWorkspaceDiagnostics: async (token) => {
        return client.sendRequest('workspace/diagnostic', { identifier: 'perfectable', previousResultIds: [] }, token);
      },
    },
  };

  // Create the language client and start the client
  client = new LanguageClient('perfectable', 'Perfectable LSP', serverOptions, clientOptions);

  // Start the client
  client.start();

  // Register a command to toggle the LSP
  context.subscriptions.push(
    vscode.commands.registerCommand('perfectable.toggle', () => {
      if (client.isRunning()) {
        client.stop().then(() => {
          vscode.window.showInformationMessage('Perfectable LSP stopped');
        });
      } else {
        client.start().then(() => {
          vscode.window.showInformationMessage('Perfectable LSP started');
        });
      }
    })
  );

  // Register a command to run workspace-wide scan
  context.subscriptions.push(
    vscode.commands.registerCommand('perfectable.scanWorkspace', () => {
      client.sendRequest('workspace/diagnostic', { identifier: 'perfectable', previousResultIds: [] });
      vscode.window.showInformationMessage('Workbench workspace scan started');
    })
  );

  // Show status bar item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '$(pulse) Workbench';
  statusBarItem.tooltip = 'Perfectable LSP: Click to toggle';
  statusBarItem.command = 'perfectable.toggle';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}