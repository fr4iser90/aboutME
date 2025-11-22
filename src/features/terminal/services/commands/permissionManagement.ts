// Permission Management Commands
// Implements chmod, chown, sudo, and groups commands for hacker game

import { FakeFileSystem } from '../fakeFilesystem'
import { CommandContext } from '../terminalCommands'

export interface PermissionManagementResult {
  success: boolean
  output?: string
  error?: string
}

/**
 * chmod command - change file permissions
 * Usage: chmod [options] mode file...
 */
export async function chmodCommand(
  args: string[],
  context: CommandContext
): Promise<PermissionManagementResult> {
  if (args.length === 0) {
    return {
      success: false,
      error: 'chmod: missing operand\nTry \'chmod --help\' for more information.'
    }
  }

  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: chmod [OPTION]... MODE[,MODE]... FILE...
Change file mode bits.

  -R, --recursive         change files and directories recursively
  -v, --verbose           output a diagnostic for every file processed
  -c, --changes           like verbose but report only when a change is made
      --help              display this help and exit

MODE can be:
  u[+-=]rwx               user permissions
  g[+-=]rwx               group permissions
  o[+-=]rwx               other permissions
  a[+-=]rwx               all permissions
  [0-7][0-7][0-7]         octal mode

Examples:
  chmod 755 script.sh     # Set permissions to rwxr-xr-x
  chmod +x script.sh      # Add execute permission
  chmod u+w file.txt      # Add write permission for user
  chmod -R 644 directory/ # Set permissions recursively`
    }
  }

  const recursive = args.includes('-R') || args.includes('--recursive')
  const verbose = args.includes('-v') || args.includes('--verbose')
  const changes = args.includes('-c') || args.includes('--changes')

  // Find mode and files
  const modeArg = args.find(arg => !arg.startsWith('-') && !arg.includes('/') && !arg.includes('.'))
  const files = args.filter(arg => !arg.startsWith('-') && arg !== modeArg)

  if (!modeArg) {
    return {
      success: false,
      error: 'chmod: missing operand\nTry \'chmod --help\' for more information.'
    }
  }

  if (files.length === 0) {
    return {
      success: false,
      error: 'chmod: missing operand after mode\nTry \'chmod --help\' for more information.'
    }
  }

  // Parse mode
  const mode = parseChmodMode(modeArg)
  if (!mode) {
    return {
      success: false,
      error: `chmod: invalid mode: '${modeArg}'\nTry \'chmod --help\' for more information.`
    }
  }

  const results: string[] = []
  let changed = 0

  for (const fileArg of files) {
    const cleanFile = fileArg.replace(/^['"]|['"]$/g, '')
    const targetPath = context.filesystem.resolvePath ? 
      context.filesystem.resolvePath(cleanFile) : 
      cleanFile

    // Check if file exists
    if (!(await context.filesystem.pathExists(targetPath))) {
      results.push(`chmod: cannot access '${cleanFile}': No such file or directory`)
      continue
    }

    // Check permissions
    const hasPermission = await context.filesystem.hasPermission(
      context.userName,
      targetPath,
      'write'
    )

    if (!hasPermission) {
      results.push(`chmod: changing permissions of '${cleanFile}': Operation not permitted`)
      continue
    }

    // Simulate permission change
    const oldPerms = await getCurrentPermissions(targetPath, context.filesystem)
    const newPerms = applyChmodMode(oldPerms, mode)

    if (oldPerms !== newPerms) {
      changed++
      if (verbose || changes) {
        results.push(`mode of '${cleanFile}' changed from ${oldPerms} to ${newPerms}`)
      }
    } else if (verbose) {
      results.push(`mode of '${cleanFile}' retained as ${oldPerms}`)
    }

    // Handle recursive
    if (recursive && await context.filesystem.isDirectory(targetPath)) {
      const lsResult = await context.filesystem.ls(targetPath)
      if (lsResult.success && lsResult.files) {
        for (const subFile of lsResult.files) {
          const cleanSubFile = subFile.replace(/^['"]|['"]$/g, '')
          const subPath = `${targetPath}/${cleanSubFile}`
          
          const subOldPerms = await getCurrentPermissions(subPath, context.filesystem)
          const subNewPerms = applyChmodMode(subOldPerms, mode)
          
          if (subOldPerms !== subNewPerms) {
            changed++
            if (verbose || changes) {
              results.push(`mode of '${subPath}' changed from ${subOldPerms} to ${subNewPerms}`)
            }
          }
        }
      }
    }
  }

  if (changes && changed === 0) {
    return {
      success: true,
      output: ''
    }
  }

  return {
    success: true,
    output: results.join('\n')
  }
}

/**
 * chown command - change file ownership
 * Usage: chown [options] owner[:group] file...
 */
export async function chownCommand(
  args: string[],
  context: CommandContext
): Promise<PermissionManagementResult> {
  if (args.length === 0) {
    return {
      success: false,
      error: 'chown: missing operand\nTry \'chown --help\' for more information.'
    }
  }

  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: chown [OPTION]... [OWNER][:[GROUP]] FILE...
Change file owner and group.

  -R, --recursive         change files and directories recursively
  -v, --verbose           output a diagnostic for every file processed
  -c, --changes           like verbose but report only when a change is made
      --help              display this help and exit

Examples:
  chown user file.txt     # Change owner to user
  chown user:group file   # Change owner and group
  chown :group file       # Change group only
  chown -R user directory/ # Change ownership recursively`
    }
  }

  const recursive = args.includes('-R') || args.includes('--recursive')
  const verbose = args.includes('-v') || args.includes('--verbose')
  const changes = args.includes('-c') || args.includes('--changes')

  // Find ownership and files
  const ownershipArg = args.find(arg => !arg.startsWith('-') && !arg.includes('/') && !arg.includes('.'))
  const files = args.filter(arg => !arg.startsWith('-') && arg !== ownershipArg)

  if (!ownershipArg) {
    return {
      success: false,
      error: 'chown: missing operand\nTry \'chown --help\' for more information.'
    }
  }

  if (files.length === 0) {
    return {
      success: false,
      error: 'chown: missing operand after ownership\nTry \'chown --help\' for more information.'
    }
  }

  // Parse ownership
  const { owner, group } = parseChownOwnership(ownershipArg)

  const results: string[] = []
  let changed = 0

  for (const fileArg of files) {
    const cleanFile = fileArg.replace(/^['"]|['"]$/g, '')
    const targetPath = context.filesystem.resolvePath ? 
      context.filesystem.resolvePath(cleanFile) : 
      cleanFile

    // Check if file exists
    if (!(await context.filesystem.pathExists(targetPath))) {
      results.push(`chown: cannot access '${cleanFile}': No such file or directory`)
      continue
    }

    // Check if user can change ownership (usually requires root)
    if (context.userName !== context.terminalCredentials.root_username) {
      results.push(`chown: changing ownership of '${cleanFile}': Operation not permitted`)
      continue
    }

    // Simulate ownership change
    const oldOwner = await getCurrentOwner(targetPath, context.filesystem)
    const oldGroup = await getCurrentGroup(targetPath, context.filesystem)

    let newOwner = owner || oldOwner
    let newGroup = group || oldGroup

    if (oldOwner !== newOwner || oldGroup !== newGroup) {
      changed++
      if (verbose || changes) {
        results.push(`ownership of '${cleanFile}' changed from ${oldOwner}:${oldGroup} to ${newOwner}:${newGroup}`)
      }
    } else if (verbose) {
      results.push(`ownership of '${cleanFile}' retained as ${oldOwner}:${oldGroup}`)
    }

    // Handle recursive
    if (recursive && await context.filesystem.isDirectory(targetPath)) {
      const lsResult = await context.filesystem.ls(targetPath)
      if (lsResult.success && lsResult.files) {
        for (const subFile of lsResult.files) {
          const cleanSubFile = subFile.replace(/^['"]|['"]$/g, '')
          const subPath = `${targetPath}/${cleanSubFile}`
          
          const subOldOwner = await getCurrentOwner(subPath, context.filesystem)
          const subOldGroup = await getCurrentGroup(subPath, context.filesystem)
          
          if (subOldOwner !== newOwner || subOldGroup !== newGroup) {
            changed++
            if (verbose || changes) {
              results.push(`ownership of '${subPath}' changed from ${subOldOwner}:${subOldGroup} to ${newOwner}:${newGroup}`)
            }
          }
        }
      }
    }
  }

  if (changes && changed === 0) {
    return {
      success: true,
      output: ''
    }
  }

  return {
    success: true,
    output: results.join('\n')
  }
}

/**
 * sudo command - execute commands as another user
 * Usage: sudo [options] command
 */
export async function sudoCommand(
  args: string[],
  context: CommandContext
): Promise<PermissionManagementResult> {
  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: sudo [OPTION]... COMMAND
Execute a command as another user.

  -u, --user=USER         run command as USER (default: ${context.terminalCredentials.root_username})
  -l, --list              list user's privileges
  -v, --validate          update user's timestamp
      --help              display this help and exit

Examples:
  sudo ls /${context.terminalCredentials.root_username}           # List ${context.terminalCredentials.root_username}'s directory
  sudo -u user command    # Run command as user
  sudo -l                 # List your privileges`
    }
  }

  if (args.includes('-l') || args.includes('--list')) {
    return {
      success: true,
      output: `User ${context.userName} may run the following commands on this host:

    (ALL) ALL
    (${context.terminalCredentials.root_username}) /bin/ls, /bin/cat, /bin/rm
    (user) /usr/bin/whoami, /bin/pwd`
    }
  }

  if (args.includes('-v') || args.includes('--validate')) {
    return {
      success: true,
      output: `Matching Defaults entries for ${context.userName} on this host:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User ${context.userName} may run the following commands on this host:
    (ALL) ALL`
    }
  }

  // Find target user
  const userArg = args.find(arg => arg.startsWith('-u'))?.split('=')[1] || 
                 args[args.findIndex(arg => arg.startsWith('-u')) + 1]
  const targetUser = userArg || context.terminalCredentials.root_username

  // Find command to execute
  const commandArgs = args.filter(arg => !arg.startsWith('-') && arg !== userArg)
  
  if (commandArgs.length === 0) {
    return {
      success: false,
      error: 'sudo: a command is required\nTry \'sudo --help\' for more information.'
    }
  }

  // Check if user can use sudo
  if (context.userName !== context.terminalCredentials.root_username && context.userName !== context.terminalCredentials.username) {
    return {
      success: false,
      error: `${context.userName} is not in the sudoers file. This incident will be reported.`
    }
  }

  // Simulate sudo execution
  const command = commandArgs.join(' ')
  
  return {
    success: true,
    output: `[sudo] password for ${context.userName}: \nExecuting: ${command} as ${targetUser}`
  }
}

/**
 * groups command - display group memberships
 * Usage: groups [user...]
 */
export async function groupsCommand(
  args: string[],
  context: CommandContext
): Promise<PermissionManagementResult> {
  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: groups [OPTION]... [USERNAME]...
Print group memberships for each USERNAME.

      --help              display this help and exit

Examples:
  groups                 # Show your groups
  groups ${context.terminalCredentials.root_username}            # Show ${context.terminalCredentials.root_username}'s groups
  groups user1 user2     # Show groups for multiple users`
    }
  }

  const users = args.filter(arg => !arg.startsWith('-'))
  const targetUsers = users.length > 0 ? users : [context.userName]

  const results: string[] = []

  for (const user of targetUsers) {
    const groups = getUserGroups(user)
    results.push(`${user} : ${groups.join(' ')}`)
  }

  return {
    success: true,
    output: results.join('\n')
  }
}

// Helper functions

function parseChmodMode(mode: string): string | null {
  // Octal mode
  if (/^[0-7]{3}$/.test(mode)) {
    return mode
  }

  // Symbolic mode
  if (/^[ugoa]*[+-=][rwx]+$/.test(mode)) {
    return mode
  }

  return null
}

function applyChmodMode(currentPerms: string, mode: string): string {
  // Simple implementation - just return a new permission string
  if (/^[0-7]{3}$/.test(mode)) {
    return modeToPermissions(mode)
  }

  // For symbolic modes, apply changes to current permissions
  return applySymbolicMode(currentPerms, mode)
}

function modeToPermissions(mode: string): string {
  const octal = parseInt(mode, 8)
  const user = (octal >> 6) & 7
  const group = (octal >> 3) & 7
  const other = octal & 7

  return `${octalToPerms(user)}${octalToPerms(group)}${octalToPerms(other)}`
}

function octalToPerms(octal: number): string {
  const perms = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx']
  return perms[octal] || '---'
}

function applySymbolicMode(currentPerms: string, mode: string): string {
  // Simplified symbolic mode application
  if (mode.includes('+x')) {
    return currentPerms.replace(/---$/, '--x').replace(/-w-$/, '-wx').replace(/r--$/, 'r-x').replace(/rw-$/, 'rwx')
  }
  if (mode.includes('-x')) {
    return currentPerms.replace(/--x$/, '---').replace(/-wx$/, '-w-').replace(/r-x$/, 'r--').replace(/rwx$/, 'rw-')
  }
  return currentPerms
}

function parseChownOwnership(ownership: string): { owner: string | null, group: string | null } {
  if (ownership.includes(':')) {
    const [owner, group] = ownership.split(':')
    return {
      owner: owner || null,
      group: group || null
    }
  }
  return { owner: ownership, group: null }
}

async function getCurrentPermissions(path: string, filesystem: FakeFileSystem): Promise<string> {
  // Simulate getting current permissions
  return 'rw-r--r--'
}

async function getCurrentOwner(path: string, filesystem: FakeFileSystem): Promise<string> {
  // Simulate getting current owner - this should be dynamic based on context
  return 'fr4iser' // This is a simulation function, keeping static for now
}

async function getCurrentGroup(path: string, filesystem: FakeFileSystem): Promise<string> {
  // Simulate getting current group - this should be dynamic based on context
  return 'fr4iser' // This is a simulation function, keeping static for now
}

function getUserGroups(user: string): string[] {
  const groupMap: { [key: string]: string[] } = {
    'root': ['root', 'sudo', 'wheel'],
    'fr4iser': ['fr4iser', 'sudo', 'users'],
    'user': ['user', 'users'],
    'admin': ['admin', 'sudo', 'users']
  }

  return groupMap[user] || ['users']
}
