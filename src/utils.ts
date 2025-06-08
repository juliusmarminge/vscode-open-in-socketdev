export function extractPackageName(word: string): string | null {
  // Remove quotes if present
  const packageName = word.replace(/['"]/g, '')

  // Handle scoped packages
  if (packageName.startsWith('@') && !packageName.includes('/')) {
    return null // Incomplete scoped package name
  }

  // Basic validation for npm package names
  if (packageName.length > 0 && /^[@\w/-]+$/.test(packageName)) {
    return packageName
  }

  return null
}

export function isPackageName(line: string, text: string, offset: number): boolean {
  // Check if we're in a dependencies section
  const beforeText = text.substring(0, offset)

  // Look for dependencies sections
  const lastDependencyMatch = beforeText.match(/.*"(dependencies|devDependencies|peerDependencies|optionalDependencies)"\s*:\s*\{/g)

  if (!lastDependencyMatch) {
    return false
  }

  // Check if we're still inside the dependencies object
  const lastMatch = lastDependencyMatch[lastDependencyMatch.length - 1]!
  const lastMatchIndex = beforeText.lastIndexOf(lastMatch)
  const textAfterMatch = text.substring(lastMatchIndex)

  // Count braces to see if we're still inside the dependencies object
  let braceCount = 0
  let inString = false
  let escapeNext = false

  for (let i = 0; i < textAfterMatch.length && i <= offset - lastMatchIndex; i++) {
    const char = textAfterMatch[i]

    if (escapeNext) {
      escapeNext = false
      continue
    }

    if (char === '\\') {
      escapeNext = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (!inString) {
      if (char === '{') {
        braceCount++
      }
      else if (char === '}') {
        braceCount--
        if (braceCount === 0) {
          return false // We've exited the dependencies object
        }
      }
    }
  }

  // Check if the current line looks like a package dependency
  const packageLinePattern = /^\s*"[^"]+"\s*:\s*"[^"]*"\s*(?:,\s*)?$/
  return packageLinePattern.test(line.trim()) && braceCount > 0
}
