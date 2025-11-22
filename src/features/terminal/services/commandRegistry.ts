// Command Registry System
// Centralized registration and management of terminal commands

import { CommandContext } from './terminalCommands'
import { fileCommand, stringsCommand, hexdumpCommand, findCommand } from './commands/fileAnalysis'
import { psCommand, lsofCommand, topCommand, killCommand } from './commands/processManagement'
import { netstatCommand, ssCommand, pingCommand, nmapCommand } from './commands/networkAnalysis'
import { chmodCommand, chownCommand, sudoCommand, groupsCommand } from './commands/permissionManagement'
import { suidBinaryCommand } from './commands/suidBinary'

export interface CommandHandler {
  (args: string[], context: CommandContext): Promise<{
    success: boolean
    output?: string
    error?: string
  }>
}

export interface CommandRegistry {
  [commandName: string]: CommandHandler
}

/**
 * Main command registry containing all available commands
 */
export const commandRegistry: CommandRegistry = {
  // File Analysis Commands
  'file': fileCommand,
  'strings': stringsCommand,
  'hexdump': hexdumpCommand,
  'find': findCommand,

  // Process Management Commands
  'ps': psCommand,
  'lsof': lsofCommand,
  'top': topCommand,
  'kill': killCommand,

  // Network Analysis Commands
  'netstat': netstatCommand,
  'ss': ssCommand,
  'ping': pingCommand,
  'nmap': nmapCommand,

  // Permission Management Commands
  'chmod': chmodCommand,
  'chown': chownCommand,
  'sudo': sudoCommand,
  'groups': groupsCommand,

  // SUID Binary Execution
  './documents/server_stuff/backup_tool.sh': suidBinaryCommand,
  'documents/server_stuff/backup_tool.sh': suidBinaryCommand
}

/**
 * Get command handler by name
 */
export function getCommandHandler(commandName: string): CommandHandler | null {
  return commandRegistry[commandName] || null
}

/**
 * Check if command exists in registry
 */
export function hasCommand(commandName: string): boolean {
  return commandName in commandRegistry
}

/**
 * Get all available command names
 */
export function getAllCommandNames(): string[] {
  return Object.keys(commandRegistry)
}

/**
 * Get commands by category
 */
export function getCommandsByCategory(category: string): string[] {
  const categories: { [key: string]: string[] } = {
    'file-analysis': ['file', 'strings', 'hexdump', 'find'],
    'process-management': ['ps', 'lsof', 'top', 'kill'],
    'network-analysis': ['netstat', 'ss', 'ping', 'nmap'],
    'permission-management': ['chmod', 'chown', 'sudo', 'groups']
  }

  return categories[category] || []
}

/**
 * Execute command with error handling
 */
export async function executeCommand(
  commandName: string,
  args: string[],
  context: CommandContext
): Promise<{
  success: boolean
  output?: string
  error?: string
}> {
  const handler = getCommandHandler(commandName)
  
  if (!handler) {
    return {
      success: false,
      error: `Command not found: ${commandName}`
    }
  }

  try {
    return await handler(args, context)
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error)
    return {
      success: false,
      error: `Error executing ${commandName}: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Validate command arguments
 */
export function validateCommandArgs(commandName: string, args: string[]): {
  valid: boolean
  error?: string
} {
  // Basic validation rules
  const validationRules: { [key: string]: (args: string[]) => { valid: boolean; error?: string } } = {
    'file': (args) => {
      if (args.length === 0) {
        return { valid: false, error: 'file: missing file operand' }
      }
      return { valid: true }
    },
    'strings': (args) => {
      if (args.length === 0) {
        return { valid: false, error: 'strings: missing file operand' }
      }
      return { valid: true }
    },
    'hexdump': (args) => {
      if (args.length === 0) {
        return { valid: false, error: 'hexdump: missing file operand' }
      }
      return { valid: true }
    },
    'find': (args) => {
      // find can have 0 args (searches current directory)
      return { valid: true }
    },
    'ps': (args) => {
      // ps can have 0 args
      return { valid: true }
    },
    'lsof': (args) => {
      // lsof can have 0 args
      return { valid: true }
    },
    'top': (args) => {
      // top can have 0 args
      return { valid: true }
    },
    'kill': (args) => {
      if (args.length === 0) {
        return { valid: false, error: 'kill: missing process operand' }
      }
      return { valid: true }
    },
    'netstat': (args) => {
      // netstat can have 0 args
      return { valid: true }
    },
    'ss': (args) => {
      // ss can have 0 args
      return { valid: true }
    },
    'ping': (args) => {
      if (args.length === 0) {
        return { valid: false, error: 'ping: missing host operand' }
      }
      return { valid: true }
    },
    'nmap': (args) => {
      if (args.length === 0) {
        return { valid: false, error: 'nmap: missing target operand' }
      }
      return { valid: true }
    },
    'chmod': (args) => {
      if (args.length < 2) {
        return { valid: false, error: 'chmod: missing operand' }
      }
      return { valid: true }
    },
    'chown': (args) => {
      if (args.length < 2) {
        return { valid: false, error: 'chown: missing operand' }
      }
      return { valid: true }
    },
    'sudo': (args) => {
      // sudo can have 0 args (shows help)
      return { valid: true }
    },
    'groups': (args) => {
      // groups can have 0 args
      return { valid: true }
    }
  }

  const rule = validationRules[commandName]
  if (!rule) {
    return { valid: true } // No specific validation rule
  }

  return rule(args)
}

/**
 * Get command help text
 */
export function getCommandHelp(commandName: string): string {
  const helpTexts: { [key: string]: string } = {
    'file': 'Determine file type',
    'strings': 'Extract printable strings from files',
    'hexdump': 'Display file contents in hexadecimal',
    'find': 'Search for files and directories',
    'ps': 'Display information about running processes',
    'lsof': 'List open files and processes',
    'top': 'Display running processes in real-time',
    'kill': 'Send signals to processes',
    'netstat': 'Display network connections',
    'ss': 'Display socket statistics',
    'ping': 'Test network connectivity',
    'nmap': 'Network port scanner',
    'chmod': 'Change file permissions',
    'chown': 'Change file ownership',
    'sudo': 'Execute commands as another user',
    'groups': 'Display group memberships'
  }

  return helpTexts[commandName] || 'No help available'
}

/**
 * Get command usage examples
 */
export function getCommandExamples(commandName: string): string[] {
  const examples: { [key: string]: string[] } = {
    'file': [
      'file document.pdf',
      'file -i image.jpg',
      'file -b script.sh'
    ],
    'strings': [
      'strings binary.exe',
      'strings -n 8 config.bin',
      'strings -t x secret.dat'
    ],
    'hexdump': [
      'hexdump -C binary.bin',
      'hexdump -x data.dat',
      'hexdump -n 256 file.txt'
    ],
    'find': [
      'find . -name "*.txt"',
      'find /home -type d',
      'find . -size +1M'
    ],
    'ps': [
      'ps',
      'ps -a',
      'ps -u root'
    ],
    'lsof': [
      'lsof',
      'lsof -p 1234',
      'lsof -u root'
    ],
    'top': [
      'top',
      'top -n 1',
      'top -u root'
    ],
    'kill': [
      'kill 1234',
      'kill -9 1234',
      'kill -s HUP 1234'
    ],
    'netstat': [
      'netstat',
      'netstat -tlnp',
      'netstat -u'
    ],
    'ss': [
      'ss',
      'ss -tlnp',
      'ss -u'
    ],
    'ping': [
      'ping google.com',
      'ping -c 4 8.8.8.8',
      'ping -i 2 example.com'
    ],
    'nmap': [
      'nmap 192.168.1.1',
      'nmap -sS -O 10.0.0.1',
      'nmap -p 80,443 example.com'
    ],
    'chmod': [
      'chmod 755 script.sh',
      'chmod +x script.sh',
      'chmod u+w file.txt'
    ],
    'chown': [
      'chown user file.txt',
      'chown user:group file',
      'chown -R user directory/'
    ],
    'sudo': [
      'sudo ls /root',
      'sudo -u user command',
      'sudo -l'
    ],
    'groups': [
      'groups',
      'groups root',
      'groups user1 user2'
    ]
  }

  return examples[commandName] || []
}
