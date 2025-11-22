// File Analysis Commands
// Implements file, strings, hexdump, and find commands for hacker game

import { FakeFileSystem } from '../fakeFilesystem'
import { CommandContext } from '../terminalCommands'

export interface FileAnalysisResult {
  success: boolean
  output?: string
  error?: string
}

/**
 * File command - determines file type
 * Usage: file [options] file...
 */
export async function fileCommand(
  args: string[],
  context: CommandContext
): Promise<FileAnalysisResult> {
  if (args.length === 0) {
    return {
      success: false,
      error: 'file: missing file operand\nTry \'file --help\' for more information.'
    }
  }

  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: file [OPTION]... FILE...
Determine file type.

  -b, --brief           do not prepend filenames to output lines
  -i, --mime            output MIME type strings
  -L, --dereference     follow symlinks
  -z, --uncompress      try to look inside compressed files
      --help            display this help and exit
      --version         output version information and exit

Examples:
  file document.pdf     # Shows: document.pdf: PDF document
  file -i image.jpg     # Shows: image.jpg: image/jpeg
  file -b script.sh     # Shows: Bourne-Again shell script`
    }
  }

  const results: string[] = []
  const brief = args.includes('-b') || args.includes('--brief')
  const mime = args.includes('-i') || args.includes('--mime')

  for (const fileArg of args) {
    if (fileArg.startsWith('-')) continue // Skip options

    const cleanFile = fileArg.replace(/^['"]|['"]$/g, '')
    const targetPath = context.filesystem.resolvePath ? 
      context.filesystem.resolvePath(cleanFile) : 
      cleanFile

    // Check if file exists
    if (!(await context.filesystem.pathExists(targetPath))) {
      results.push(`file: ${cleanFile}: No such file or directory`)
      continue
    }

    // Check if it's a directory
    if (await context.filesystem.isDirectory(targetPath)) {
      const type = mime ? 'inode/directory' : 'directory'
      const prefix = brief ? '' : `${cleanFile}: `
      results.push(`${prefix}${type}`)
      continue
    }

    // Determine file type based on extension and content
    const fileType = await determineFileType(cleanFile, targetPath, context.filesystem, mime)
    const prefix = brief ? '' : `${cleanFile}: `
    results.push(`${prefix}${fileType}`)
  }

  return {
    success: true,
    output: results.join('\n')
  }
}

/**
 * Strings command - extract printable strings from files
 * Usage: strings [options] file...
 */
export async function stringsCommand(
  args: string[],
  context: CommandContext
): Promise<FileAnalysisResult> {
  if (args.length === 0) {
    return {
      success: false,
      error: 'strings: missing file operand\nTry \'strings --help\' for more information.'
    }
  }

  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: strings [OPTION]... FILE...
Print the sequences of printable characters in files.

  -a, --all                 scan the entire file
  -n, --bytes=number        minimum string length (default: 4)
  -t, --radix={o,d,x}       print offset in octal, decimal, or hex
  -o                        same as -t o
  -d                        same as -t d
  -x                        same as -t x
      --help                display this help and exit
      --version             output version information and exit

Examples:
  strings binary.exe        # Extract strings from binary
  strings -n 8 config.bin   # Strings at least 8 characters
  strings -t x secret.dat   # Show hex offsets`
    }
  }

  const results: string[] = []
  const minLength = getMinLength(args)
  const showOffset = args.includes('-t') || args.includes('-o') || args.includes('-d') || args.includes('-x')
  const offsetFormat = getOffsetFormat(args)

  for (const fileArg of args) {
    if (fileArg.startsWith('-')) continue // Skip options

    const cleanFile = fileArg.replace(/^['"]|['"]$/g, '')
    const targetPath = context.filesystem.resolvePath ? 
      context.filesystem.resolvePath(cleanFile) : 
      cleanFile

    // Check if file exists
    if (!(await context.filesystem.pathExists(targetPath))) {
      results.push(`strings: ${cleanFile}: No such file or directory`)
      continue
    }

    // Check if it's a directory
    if (await context.filesystem.isDirectory(targetPath)) {
      results.push(`strings: ${cleanFile}: Is a directory`)
      continue
    }

    // Extract strings from file
    const strings = await extractStrings(targetPath, context.filesystem, minLength, showOffset, offsetFormat)
    results.push(...strings)
  }

  return {
    success: true,
    output: results.join('\n')
  }
}

/**
 * Hexdump command - display file contents in hexadecimal
 * Usage: hexdump [options] file...
 */
export async function hexdumpCommand(
  args: string[],
  context: CommandContext
): Promise<FileAnalysisResult> {
  if (args.length === 0) {
    return {
      success: false,
      error: 'hexdump: missing file operand\nTry \'hexdump --help\' for more information.'
    }
  }

  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: hexdump [OPTION]... FILE...
Display file contents in hexadecimal, decimal, octal, or ASCII.

  -C, --canonical         canonical hex+ASCII display
  -b, --one-byte-octal    one-byte octal display
  -c, --one-byte-char     one-byte character display
  -d, --two-bytes-decimal two-byte decimal display
  -o, --two-bytes-octal   two-byte octal display
  -x, --two-bytes-hex     two-byte hexadecimal display
  -n, --length=BYTES      interpret only BYTES input bytes
      --help              display this help and exit
      --version           output version information and exit

Examples:
  hexdump -C binary.bin    # Canonical hex+ASCII display
  hexdump -x data.dat      # Two-byte hexadecimal
  hexdump -n 256 file.txt  # First 256 bytes only`
    }
  }

  const results: string[] = []
  const format = getHexdumpFormat(args)
  const maxBytes = getMaxBytes(args)

  for (const fileArg of args) {
    if (fileArg.startsWith('-')) continue // Skip options

    const cleanFile = fileArg.replace(/^['"]|['"]$/g, '')
    const targetPath = context.filesystem.resolvePath ? 
      context.filesystem.resolvePath(cleanFile) : 
      cleanFile

    // Check if file exists
    if (!(await context.filesystem.pathExists(targetPath))) {
      results.push(`hexdump: ${cleanFile}: No such file or directory`)
      continue
    }

    // Check if it's a directory
    if (await context.filesystem.isDirectory(targetPath)) {
      results.push(`hexdump: ${cleanFile}: Is a directory`)
      continue
    }

    // Generate hexdump output
    const hexOutput = await generateHexdump(targetPath, context.filesystem, format, maxBytes)
    results.push(...hexOutput)
  }

  return {
    success: true,
    output: results.join('\n')
  }
}

/**
 * Find command - search for files and directories
 * Usage: find [path...] [expression]
 */
export async function findCommand(
  args: string[],
  context: CommandContext
): Promise<FileAnalysisResult> {
  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: find [path...] [expression]
Search for files in a directory hierarchy.

  -name pattern           file name matches pattern
  -type c                 file type is c (f=file, d=directory)
  -size n[cwbkMG]        file uses n units of space
  -mtime n                file was last modified n*24 hours ago
  -user uname             file is owned by user uname
  -group gname            file belongs to group gname
  -perm mode              file's permission bits are exactly mode
  -exec command {} \\;     execute command on each file
  -print                  print the full file name (default)
      --help              display this help and exit

Examples:
  find . -name "*.txt"    # Find all .txt files
  find /home -type d      # Find all directories
  find . -size +1M        # Files larger than 1MB
  find . -user root       # Files owned by root`
    }
  }

  // Parse find arguments
  const searchPath = args.length > 0 && !args[0].startsWith('-') ? args[0] : '.'
  const expressions = args.filter(arg => arg.startsWith('-') || arg === searchPath)

  // Resolve search path
  const targetPath = context.filesystem.resolvePath ? 
    context.filesystem.resolvePath(searchPath) : 
    searchPath

  // Check if search path exists
  if (!(await context.filesystem.pathExists(targetPath))) {
    return {
      success: false,
      error: `find: '${searchPath}': No such file or directory`
    }
  }

  // Perform search
  const results = await performFind(targetPath, expressions, context.filesystem)

  return {
    success: true,
    output: results.join('\n')
  }
}

// Helper functions

async function determineFileType(
  fileName: string, 
  filePath: string, 
  filesystem: FakeFileSystem, 
  mime: boolean
): Promise<string> {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const baseName = fileName.split('.').slice(0, -1).join('.')

  // Special files
  if (fileName === 'credentials.txt') {
    return mime ? 'text/plain' : 'ASCII text'
  }
  
  if (fileName === 'flag.txt') {
    return mime ? 'text/plain' : 'ASCII text'
  }

  if (fileName === 'id_rsa') {
    return mime ? 'text/plain' : 'OpenSSH private key'
  }

  if (fileName === 'id_rsa.pub') {
    return mime ? 'text/plain' : 'OpenSSH public key'
  }

  // File type detection based on extension
  switch (ext) {
    case 'txt':
    case 'md':
    case 'log':
      return mime ? 'text/plain' : 'ASCII text'
    case 'js':
      return mime ? 'application/javascript' : 'JavaScript source text'
    case 'py':
      return mime ? 'text/x-python' : 'Python script'
    case 'json':
      return mime ? 'application/json' : 'JSON data'
    case 'yml':
    case 'yaml':
      return mime ? 'text/yaml' : 'YAML document'
    case 'sh':
      return mime ? 'application/x-sh' : 'Bourne-Again shell script'
    case 'bash':
      return mime ? 'application/x-sh' : 'Bourne-Again shell script'
    case 'zsh':
      return mime ? 'application/x-sh' : 'Zsh shell script'
    case 'desktop':
      return mime ? 'application/x-desktop' : 'Desktop entry'
    case 'pdf':
      return mime ? 'application/pdf' : 'PDF document'
    case 'png':
      return mime ? 'image/png' : 'PNG image data'
    case 'jpg':
    case 'jpeg':
      return mime ? 'image/jpeg' : 'JPEG image data'
    case 'gif':
      return mime ? 'image/gif' : 'GIF image data'
    case 'mp4':
      return mime ? 'video/mp4' : 'MP4 video data'
    case 'zip':
      return mime ? 'application/zip' : 'Zip archive data'
    case 'tar':
      return mime ? 'application/x-tar' : 'tar archive'
    case 'gz':
      return mime ? 'application/gzip' : 'gzip compressed data'
    case 'exe':
      return mime ? 'application/x-executable' : 'PE32 executable'
    case 'bin':
      return mime ? 'application/octet-stream' : 'data'
    case 'secret':
      return mime ? 'text/plain' : 'ASCII text'
    default:
      return mime ? 'text/plain' : 'ASCII text'
  }
}

async function extractStrings(
  filePath: string,
  filesystem: FakeFileSystem,
  minLength: number,
  showOffset: boolean,
  offsetFormat: string
): Promise<string[]> {
  // Get file content
  const catResult = await filesystem.cat(filePath)
  if (!catResult.success || !catResult.content) {
    return []
  }

  const content = catResult.content
  const strings: string[] = []
  
  // Extract printable strings
  let currentString = ''
  let offset = 0
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    
    if (char >= ' ' && char <= '~') {
      // Printable character
      if (currentString === '') {
        offset = i
      }
      currentString += char
    } else {
      // Non-printable character - end current string
      if (currentString.length >= minLength) {
        const prefix = showOffset ? `${formatOffset(offset, offsetFormat)} ` : ''
        strings.push(`${prefix}${currentString}`)
      }
      currentString = ''
    }
  }
  
  // Handle string at end of file
  if (currentString.length >= minLength) {
    const prefix = showOffset ? `${formatOffset(offset, offsetFormat)} ` : ''
    strings.push(`${prefix}${currentString}`)
  }

  return strings
}

async function generateHexdump(
  filePath: string,
  filesystem: FakeFileSystem,
  format: string,
  maxBytes: number
): Promise<string[]> {
  // Get file content
  const catResult = await filesystem.cat(filePath)
  if (!catResult.success || !catResult.content) {
    return []
  }

  const content = catResult.content
  const lines: string[] = []
  
  // Limit content if maxBytes specified
  const limitedContent = maxBytes > 0 ? content.substring(0, maxBytes) : content
  
  if (format === 'canonical') {
    // Canonical hex+ASCII display
    for (let i = 0; i < limitedContent.length; i += 16) {
      const chunk = limitedContent.substring(i, i + 16)
      const hex = chunk.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')
      const ascii = chunk.split('').map(c => c >= ' ' && c <= '~' ? c : '.').join('')
      const offset = i.toString(16).padStart(8, '0')
      
      lines.push(`${offset}  ${hex.padEnd(47)}  |${ascii.padEnd(16)}|`)
    }
  } else if (format === 'hex') {
    // Two-byte hexadecimal
    for (let i = 0; i < limitedContent.length; i += 2) {
      const chunk = limitedContent.substring(i, i + 2)
      const hex = chunk.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
      const offset = i.toString(16).padStart(8, '0')
      
      lines.push(`${offset}  ${hex}`)
    }
  } else {
    // Default format
    for (let i = 0; i < limitedContent.length; i += 16) {
      const chunk = limitedContent.substring(i, i + 16)
      const hex = chunk.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')
      const offset = i.toString(16).padStart(8, '0')
      
      lines.push(`${offset}  ${hex}`)
    }
  }

  return lines
}

async function performFind(
  searchPath: string,
  expressions: string[],
  filesystem: FakeFileSystem
): Promise<string[]> {
  const results: string[] = []
  
  // Simple find implementation - search for files matching patterns
  const namePattern = expressions.find(expr => expr.startsWith('-name'))
  const typeFilter = expressions.find(expr => expr.startsWith('-type'))
  
  if (namePattern) {
    const pattern = namePattern.split(' ')[1]?.replace(/['"]/g, '')
    if (pattern) {
      // Search for files matching pattern
      const matches = await searchFilesByName(searchPath, pattern, filesystem)
      results.push(...matches)
    }
  } else if (typeFilter) {
    const type = typeFilter.split(' ')[1]
    if (type === 'd') {
      // Find directories
      const dirs = await searchDirectories(searchPath, filesystem)
      results.push(...dirs)
    } else if (type === 'f') {
      // Find files
      const files = await searchFiles(searchPath, filesystem)
      results.push(...files)
    }
  } else {
    // Default: find all files and directories
    const all = await searchAll(searchPath, filesystem)
    results.push(...all)
  }

  return results
}

async function searchFilesByName(
  searchPath: string,
  pattern: string,
  filesystem: FakeFileSystem
): Promise<string[]> {
  const results: string[] = []
  
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')
  const regex = new RegExp(`^${regexPattern}$`)
  
  // Get directory contents
  const lsResult = await filesystem.ls(searchPath, true)
  if (lsResult.success && lsResult.files) {
    for (const file of lsResult.files) {
      const cleanFile = file.replace(/^['"]|['"]$/g, '')
      if (regex.test(cleanFile)) {
        results.push(`${searchPath}/${cleanFile}`)
      }
    }
  }
  
  return results
}

async function searchDirectories(
  searchPath: string,
  filesystem: FakeFileSystem
): Promise<string[]> {
  const results: string[] = []
  
  const lsResult = await filesystem.ls(searchPath, true)
  if (lsResult.success && lsResult.files) {
    for (const file of lsResult.files) {
      const cleanFile = file.replace(/^['"]|['"]$/g, '')
      const fullPath = `${searchPath}/${cleanFile}`
      
      if (await filesystem.isDirectory(fullPath)) {
        results.push(fullPath)
      }
    }
  }
  
  return results
}

async function searchFiles(
  searchPath: string,
  filesystem: FakeFileSystem
): Promise<string[]> {
  const results: string[] = []
  
  const lsResult = await filesystem.ls(searchPath, true)
  if (lsResult.success && lsResult.files) {
    for (const file of lsResult.files) {
      const cleanFile = file.replace(/^['"]|['"]$/g, '')
      const fullPath = `${searchPath}/${cleanFile}`
      
      if (await filesystem.isFile(fullPath)) {
        results.push(fullPath)
      }
    }
  }
  
  return results
}

async function searchAll(
  searchPath: string,
  filesystem: FakeFileSystem
): Promise<string[]> {
  const results: string[] = []
  
  const lsResult = await filesystem.ls(searchPath, true)
  if (lsResult.success && lsResult.files) {
    for (const file of lsResult.files) {
      const cleanFile = file.replace(/^['"]|['"]$/g, '')
      results.push(`${searchPath}/${cleanFile}`)
    }
  }
  
  return results
}

function getMinLength(args: string[]): number {
  const nIndex = args.findIndex(arg => arg.startsWith('-n'))
  if (nIndex !== -1) {
    const value = args[nIndex].split('=')[1] || args[nIndex + 1]
    return parseInt(value) || 4
  }
  return 4
}

function getOffsetFormat(args: string[]): string {
  if (args.includes('-t')) {
    const tIndex = args.findIndex(arg => arg.startsWith('-t'))
    const format = args[tIndex].split('=')[1] || args[tIndex + 1]
    return format || 'd'
  }
  if (args.includes('-o')) return 'o'
  if (args.includes('-d')) return 'd'
  if (args.includes('-x')) return 'x'
  return 'd'
}

function getHexdumpFormat(args: string[]): string {
  if (args.includes('-C') || args.includes('--canonical')) return 'canonical'
  if (args.includes('-x')) return 'hex'
  return 'default'
}

function getMaxBytes(args: string[]): number {
  const nIndex = args.findIndex(arg => arg.startsWith('-n'))
  if (nIndex !== -1) {
    const value = args[nIndex].split('=')[1] || args[nIndex + 1]
    return parseInt(value) || 0
  }
  return 0
}

function formatOffset(offset: number, format: string): string {
  switch (format) {
    case 'o':
      return offset.toString(8).padStart(8, '0')
    case 'x':
      return offset.toString(16).padStart(8, '0')
    case 'd':
    default:
      return offset.toString().padStart(8, '0')
  }
}
