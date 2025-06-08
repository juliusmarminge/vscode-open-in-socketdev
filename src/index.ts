// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { PackageJsonHoverProvider } from './hovers.ts'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  const outputChannel = vscode.window.createOutputChannel('Socket.dev Extension')
  outputChannel.appendLine('Socket.dev extension is now active!')

  // Register the hover provider for package.json files
  const hoverProvider = vscode.languages.registerHoverProvider(
    { pattern: '**/package.json' },
    new PackageJsonHoverProvider(),
  )

  context.subscriptions.push(hoverProvider)
  outputChannel.appendLine('Hover provider registered for package.json files')
}

// This method is called when your extension is deactivated
export function deactivate(): void {}
