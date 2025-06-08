import * as vscode from 'vscode'
import { extractPackageName, isPackageName } from './utils.ts'

export class PackageJsonHoverProvider implements vscode.HoverProvider {
  private outputChannel = vscode.window.createOutputChannel('Socket.dev Hover Debug')

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.Hover> {
    this.outputChannel.appendLine(`Hover triggered at position: line ${position.line}, character ${position.character}`)

    // Get the word range at the current position
    // Updated regex to include quotes and dots for package names
    const wordRange = document.getWordRangeAtPosition(position, /["']?[@\w.-]+\/?[@\w.-]*["']?/)
    if (!wordRange) {
      this.outputChannel.appendLine('No word range found at position')
      return
    }

    const word = document.getText(wordRange)
    const line = document.lineAt(position).text
    this.outputChannel.appendLine(`Word at position: "${word}", Line: "${line}"`)

    // Check if we're hovering over a package name in dependencies
    const isInDependencies = isPackageName(line, document.getText(), document.offsetAt(position))
    this.outputChannel.appendLine(`Is in dependencies: ${isInDependencies}`)

    if (isInDependencies) {
      const packageName = extractPackageName(word)
      this.outputChannel.appendLine(`Extracted package name: "${packageName}"`)

      if (packageName) {
        const socketUrl = `https://socket.dev/npm/package/${packageName}`
        const markdownString = new vscode.MarkdownString()
        markdownString.appendMarkdown(`[Open in Socket.dev](${socketUrl})\n\n`)
        markdownString.appendMarkdown(`📦 **${packageName}**\n\n`)
        markdownString.appendMarkdown(`View security analysis and package information on Socket.dev`)
        markdownString.isTrusted = true

        this.outputChannel.appendLine(`Returning hover for package: ${packageName}`)
        return new vscode.Hover(markdownString, wordRange)
      }
    }
    this.outputChannel.appendLine('No hover returned')
  }
}
