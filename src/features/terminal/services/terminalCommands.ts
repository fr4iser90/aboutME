import { executeCommand, hasCommand } from './commandRegistry'
import { config } from '@/features/shared/services/config'

export interface TerminalCommands {
  commands: { [key: string]: string }
}

export interface CommandContext {
  userName: string
  currentDate: string
  commandHistory: string[]
  sessionId?: string
  commandCount?: number
  outputCount?: number
  currentPath?: string
  filesystem: any // FakeFileSystem instance
  terminalCredentials: {
    hostname: string
    username: string
    password: string
    root_username: string
    root_password: string
  }
}

export const loadTerminalCommands = async (): Promise<TerminalCommands> => {
  try {
    console.log('Loading terminal commands from /data/terminal-commands.json')
    const response = await fetch(config.api.terminalCommands)
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Loaded terminal commands data:', data)
    console.log('Available commands:', Object.keys(data.commands))
    return data
  } catch (error) {
    console.error('Failed to load terminal commands:', error)
    return {
      commands: {}
    }
  }
}

export const processCommand = (
  command: string,
  commands: TerminalCommands,
  context: CommandContext
): string | Promise<string> | null => {
  const cmd = command.trim().toLowerCase()
  const originalCommand = command.trim()
  
  console.log('processCommand called with:', { 
    cmd, 
    originalCommand,
    commandsAvailable: Object.keys(commands.commands), 
    hasCommand: !!commands.commands[cmd],
    commandsObject: commands.commands
  })
  
  // Special handling for su command with arguments
  if (cmd.startsWith('su ')) {
    const args = cmd.split(' ')
    if (args.length >= 2) {
      const targetUser = args[1]
      const currentUser = context.filesystem.getCurrentUser()
      console.log('su command with user:', targetUser, 'current user:', currentUser)
      
      // Check if the target user exists in terminal credentials
      if (context.terminalCredentials) {
        const validUsers = [context.terminalCredentials.username, context.terminalCredentials.root_username]
        console.log('Valid users:', validUsers)
        console.log('Target user:', targetUser)
        console.log('User exists:', validUsers.includes(targetUser))
        
        if (validUsers.includes(targetUser)) {
          // If current user is root, allow switching without password
          if (currentUser === context.terminalCredentials.root_username) {
            console.log('Root user switching to:', targetUser)
            context.filesystem.setUser(targetUser)
            context.filesystem.setCurrentPath(`/home/${targetUser}`)
            return `Switched to user ${targetUser}`
          } else {
            return '__SU_PASSWORD_MODE__'
          }
        } else {
          return `su: user ${targetUser} does not exist`
        }
      } else {
        console.log('No terminal credentials available')
        // Fallback if no credentials available
        return '__SU_PASSWORD_MODE__'
      }
    } else {
      return 'su: missing user operand'
    }
  }
  
  // Special handling for su command without arguments
  if (cmd === 'su') {
    return 'su: missing user operand'
  }

  // Filesystem commands
  if (cmd === 'pwd') {
    return context.filesystem.getCurrentPath()
  }

  if (cmd.startsWith('cd ')) {
    const args = originalCommand.split(' ').slice(1).filter(arg => arg.trim() !== '')
    if (args.length === 0) {
      const targetPath = `/home/${context.terminalCredentials.username}`
      return context.filesystem.cd(targetPath).then((result: any) => 
        result.success ? '' : result.error || 'cd: failed'
      )
    } else {
      const targetPath = args[0]  // Use original case!
      return context.filesystem.cd(targetPath).then((result: any) => 
        result.success ? '' : result.error || 'cd: failed'
      )
    }
  }

  if (cmd === 'cd') {
    const targetPath = `/home/${context.terminalCredentials.username}`
    return context.filesystem.cd(targetPath).then((result: any) => 
      result.success ? '' : result.error || 'cd: failed'
    )
  }

  if (cmd === 'ls') {
    return context.filesystem.ls().then((result: any) => {
      if (result.success && result.files) {
        return result.files.join('\n')
      }
      return result.error || 'ls: failed'
    })
  }

  if (cmd.startsWith('ls ')) {
    const args = originalCommand.split(' ').slice(1)
    if (args.length === 0) {
      return context.filesystem.ls().then((result: any) => {
        if (result.success && result.files) {
          return result.files.join('\n')
        }
        return result.error || 'ls: failed'
      })
    } else {
      const targetPath = args[0]  // Use original case!
      return context.filesystem.ls(targetPath).then((result: any) => {
        if (result.success && result.files) {
          return result.files.join('\n')
        }
        return result.error || `ls: ${targetPath}: failed`
      })
    }
  }

  if (cmd.startsWith('cat ')) {
    const args = originalCommand.split(' ').slice(1)
    if (args.length === 0) {
      return 'cat: missing file operand'
    }
    
    return Promise.all(args.map(async (file: string) => {
      const result = await context.filesystem.cat(file)  // Use original case!
      if (!result.success) {
        return result.error || `cat: ${file}: failed`
      }
      return result.content || ''
    })).then(results => results.join('\n'))
  }

  if (cmd === 'whoami') {
    return context.filesystem.getCurrentUser()
  }

  // Handle script execution (SUID binaries)
  if (cmd.startsWith('./') || cmd.startsWith('documents/')) {
    // Check if this is a registered SUID binary command
    const baseCommand = cmd.split(' ')[0]
    if (hasCommand(baseCommand)) {
      const args = originalCommand.split(' ').slice(1)
      console.log('Executing SUID binary:', baseCommand, 'with args:', args)
      return executeCommand(baseCommand, args, context).then(result => {
        console.log('SUID binary result:', result)
        if (result.success) {
          return result.output || ''
        } else {
          return result.error || `Error executing ${baseCommand}`
        }
      })
    }
  }

  if (cmd === 'logout') {
    // Return to default user from terminal credentials
    const defaultUsername = context.terminalCredentials.username
    context.filesystem.setUser(defaultUsername)
    context.filesystem.setCurrentPath(`/home/${defaultUsername}`)
    return 'Goodbye!'
  }

  if (cmd.startsWith('rm ')) {
    const args = originalCommand.split(' ').slice(1)
    if (args.length === 0) {
      return 'rm: missing file operand\nTry \'rm --help\' for more information.'
    }
    
    // Parse rm options
    let recursive = false
    let force = false
    let interactive = false
    const filesToDelete: string[] = []
    
    for (const arg of args) {
      if (arg.startsWith('-')) {
        // Parse options
        if (arg.includes('r') || arg.includes('R')) {
          recursive = true
        }
        if (arg.includes('f')) {
          force = true
        }
        if (arg.includes('i')) {
          interactive = true
        }
        if (arg === '--help') {
          return `Usage: rm [OPTION]... FILE...
Remove (unlink) the FILE(s).

  -f, --force           ignore nonexistent files and arguments, never prompt
  -i                    prompt before every removal
  -r, -R, --recursive   remove directories and their contents recursively
  -v, --verbose         explain what is being done
      --help     display this help and exit
      --version  output version information and exit

By default, rm does not remove directories.  Use the --recursive (-r or -R)
option to remove each listed directory, too, along with all of its contents.

To remove a file whose name starts with a '-', for example '-foo',
use one of these commands:
  rm -- -foo

  rm ./-foo

Note that if you use rm to remove a file, it is usually possible to recover
the contents of that file.  If you want more assurance that the contents are
truly unrecoverable, consider using shred.`
        }
      } else {
        filesToDelete.push(arg)
      }
    }
    
    if (filesToDelete.length === 0) {
      return 'rm: missing file operand\nTry \'rm --help\' for more information.'
    }
    
    // Handle interactive mode
    if (interactive) {
      return `rm: remove ${filesToDelete.length > 1 ? 'files' : 'file'} '${filesToDelete.join(' ')}'? (y/n)`
    }
    
    // Execute rm command
    return context.filesystem.rmMultiple(filesToDelete, recursive, force).then((result: any) => {
      if (!result.success && result.errors) {
        return result.errors.join('\n')
      }
      return '' // Success - no output
    })
  }
  
  // Check new command registry first (before regular commands)
  // Extract base command name (without arguments)
  const baseCommand = cmd.split(' ')[0]
  if (hasCommand(baseCommand)) {
    const args = originalCommand.split(' ').slice(1)
    console.log('Executing command from registry:', baseCommand, 'with args:', args)
    return executeCommand(baseCommand, args, context).then(result => {
      console.log('Command registry result:', result)
      if (result.success) {
        return result.output || ''
      } else {
        return result.error || `Error executing ${baseCommand}`
      }
    })
  }

  // Check regular commands (also check base command)
  if (commands.commands[cmd] || commands.commands[baseCommand]) {
    let response = commands.commands[cmd] || commands.commands[baseCommand]
    
    // Replace placeholders
    response = response.replace('{{userName}}', context.userName)
    response = response.replace('{{currentDate}}', context.currentDate)
    response = response.replace('{{currentPath}}', context.currentPath || '')
    response = response.replace('{{commandHistory}}', 
      context.commandHistory.length > 0 
        ? context.commandHistory.join('\n') 
        : 'No commands in history yet'
    )
    response = response.replace('{{sessionId}}', context.sessionId || 'N/A')
    response = response.replace('{{commandCount}}', (context.commandCount || 0).toString())
    response = response.replace('{{outputCount}}', (context.outputCount || 0).toString())
    
    console.log('Command found, response:', response)
    return response
  }
  
  console.log('Command not found:', cmd, 'base command:', baseCommand)
  return null
}

export const getCommandType = (
  command: string,
  commands: TerminalCommands
): 'clear' | 'exit' | 'normal' => {
  const cmd = command.trim().toLowerCase()
  
  if (cmd === 'clear') {
    return 'clear'
  } else if (cmd === 'exit') {
    return 'exit'
  }
  
  return 'normal'
}
