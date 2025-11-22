// Process Management Commands
// Implements ps, lsof, top, and kill commands for hacker game

import { FakeFileSystem } from '../fakeFilesystem'
import { CommandContext } from '../terminalCommands'

export interface ProcessManagementResult {
  success: boolean
  output?: string
  error?: string
}

/**
 * Process simulator data
 */
interface Process {
  pid: number
  user: string
  cpu: number
  mem: number
  command: string
  args: string[]
  startTime: string
  state: 'R' | 'S' | 'D' | 'Z' | 'T'
}

/**
 * ps command - list running processes
 * Usage: ps [options]
 */
export async function psCommand(
  args: string[],
  context: CommandContext
): Promise<ProcessManagementResult> {
  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: ps [OPTION]...
Display information about running processes.

  -a, --all              show processes for all users
  -u, --user=USER        show processes for specific user
  -x, --no-headers        don't print column headers
  -o, --format=FORMAT     specify output format
  -p, --pid=PID          show specific process by PID
      --help              display this help and exit

Examples:
  ps                      # Show your processes
  ps -a                   # Show all processes
  ps -u root              # Show root's processes
  ps -p 1234              # Show process 1234`
    }
  }

  const showAll = args.includes('-a') || args.includes('--all')
  const userFilter = args.find(arg => arg.startsWith('-u'))?.split('=')[1] || 
                    args[args.findIndex(arg => arg.startsWith('-u')) + 1]
  const pidFilter = args.find(arg => arg.startsWith('-p'))?.split('=')[1] || 
                   args[args.findIndex(arg => arg.startsWith('-p')) + 1]

  // Generate simulated processes
  const processes = generateSimulatedProcesses(context.userName)

  // Filter processes
  let filteredProcesses = processes
  if (userFilter) {
    filteredProcesses = processes.filter(p => p.user === userFilter)
  }
  if (pidFilter) {
    const pid = parseInt(pidFilter)
    filteredProcesses = processes.filter(p => p.pid === pid)
  }
  if (!showAll && !userFilter) {
    filteredProcesses = processes.filter(p => p.user === context.userName)
  }

  // Format output
  const output = formatPsOutput(filteredProcesses, args.includes('-x') || args.includes('--no-headers'))

  return {
    success: true,
    output
  }
}

/**
 * lsof command - list open files and processes
 * Usage: lsof [options] [file...]
 */
export async function lsofCommand(
  args: string[],
  context: CommandContext
): Promise<ProcessManagementResult> {
  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: lsof [OPTION]... [FILE]...
List open files and the processes that opened them.

  -p PID                  show files opened by process PID
  -u USER                 show files opened by user USER
  -c COMMAND              show files opened by command COMMAND
  -i [46][protocol][@hostname|hostaddr][:service|port]
                          show network connections
      --help              display this help and exit

Examples:
  lsof                    # Show all open files
  lsof -p 1234            # Files opened by process 1234
  lsof -u root            # Files opened by root
  lsof /home/user         # Processes using /home/user
  lsof -i :80             # Network connections on port 80`
    }
  }

  const pidFilter = args.find(arg => arg.startsWith('-p'))?.split('=')[1] || 
                   args[args.findIndex(arg => arg.startsWith('-p')) + 1]
  const userFilter = args.find(arg => arg.startsWith('-u'))?.split('=')[1] || 
                    args[args.findIndex(arg => arg.startsWith('-u')) + 1]
  const commandFilter = args.find(arg => arg.startsWith('-c'))?.split('=')[1] || 
                       args[args.findIndex(arg => arg.startsWith('-c')) + 1]
  const networkFilter = args.find(arg => arg.startsWith('-i'))

  // Generate simulated open files
  const openFiles = generateSimulatedOpenFiles(context.userName)

  // Filter based on arguments
  let filteredFiles = openFiles
  if (pidFilter) {
    const pid = parseInt(pidFilter)
    filteredFiles = openFiles.filter(f => f.pid === pid)
  }
  if (userFilter) {
    filteredFiles = openFiles.filter(f => f.user === userFilter)
  }
  if (commandFilter) {
    filteredFiles = openFiles.filter(f => f.command.includes(commandFilter))
  }
  if (networkFilter) {
    filteredFiles = openFiles.filter(f => f.type === 'network')
  }

  // Format output
  const output = formatLsofOutput(filteredFiles)

  return {
    success: true,
    output
  }
}

/**
 * top command - display running processes
 * Usage: top [options]
 */
export async function topCommand(
  args: string[],
  context: CommandContext
): Promise<ProcessManagementResult> {
  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: top [OPTION]...
Display running processes in real-time.

  -n, --iterations=NUMBER  number of iterations to show
  -u, --user=USER         show processes for specific user
  -p, --pid=PID           show specific process by PID
  -d, --delay=SECONDS     delay between updates
      --help              display this help and exit

Examples:
  top                     # Show processes (interactive)
  top -n 1                # Show processes once
  top -u root             # Show root's processes
  top -p 1234             # Show process 1234`
    }
  }

  const iterations = args.find(arg => arg.startsWith('-n'))?.split('=')[1] || 
                    args[args.findIndex(arg => arg.startsWith('-n')) + 1] || '1'
  const userFilter = args.find(arg => arg.startsWith('-u'))?.split('=')[1] || 
                    args[args.findIndex(arg => arg.startsWith('-u')) + 1]

  // Generate system info and processes
  const systemInfo = generateSystemInfo()
  const processes = generateSimulatedProcesses(context.userName)

  // Filter processes
  let filteredProcesses = processes
  if (userFilter) {
    filteredProcesses = processes.filter(p => p.user === userFilter)
  }

  // Sort by CPU usage
  filteredProcesses.sort((a, b) => b.cpu - a.cpu)

  // Format output
  const output = formatTopOutput(systemInfo, filteredProcesses)

  return {
    success: true,
    output
  }
}

/**
 * kill command - terminate processes
 * Usage: kill [options] pid...
 */
export async function killCommand(
  args: string[],
  context: CommandContext
): Promise<ProcessManagementResult> {
  if (args.length === 0) {
    return {
      success: false,
      error: 'kill: missing process operand\nTry \'kill --help\' for more information.'
    }
  }

  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: kill [OPTION]... PID...
Send signals to processes.

  -l, --list              list signal names
  -s, --signal=SIGNAL     send specific signal (default: TERM)
  -9, -KILL               send KILL signal
  -15, -TERM              send TERM signal
      --help              display this help and exit

Examples:
  kill 1234               # Send TERM signal to process 1234
  kill -9 1234            # Force kill process 1234
  kill -s HUP 1234        # Send HUP signal to process 1234
  kill -l                 # List available signals`
    }
  }

  if (args.includes('-l') || args.includes('--list')) {
    return {
      success: true,
      output: ` 1) SIGHUP       2) SIGINT       3) SIGQUIT      4) SIGILL       5) SIGTRAP
 6) SIGABRT      7) SIGBUS       8) SIGFPE       9) SIGKILL     10) SIGUSR1
11) SIGSEGV     12) SIGUSR2     13) SIGPIPE     14) SIGALRM     15) SIGTERM
16) SIGSTKFLT   17) SIGCHLD     18) SIGCONT     19) SIGSTOP     20) SIGTSTP
21) SIGTTIN     22) SIGTTOU     23) SIGURG      24) SIGXCPU     25) SIGXFSZ
26) SIGVTALRM   27) SIGPROF     28) SIGWINCH    29) SIGIO       30) SIGPWR
31) SIGSYS      34) SIGRTMIN    35) SIGRTMIN+1  36) SIGRTMIN+2  37) SIGRTMIN+3
38) SIGRTMIN+4  39) SIGRTMIN+5  40) SIGRTMIN+6  41) SIGRTMIN+7  42) SIGRTMIN+8
43) SIGRTMIN+9  44) SIGRTMIN+10 45) SIGRTMIN+11 46) SIGRTMIN+12 47) SIGRTMIN+13
48) SIGRTMIN+14 49) SIGRTMIN+15 50) SIGRTMAX-14 51) SIGRTMAX-13 52) SIGRTMAX-12
53) SIGRTMAX-11 54) SIGRTMAX-10 55) SIGRTMAX-9  56) SIGRTMAX-8  57) SIGRTMAX-7
58) SIGRTMAX-6  59) SIGRTMAX-5  60) SIGRTMAX-4  61) SIGRTMAX-3  62) SIGRTMAX-2
63) SIGRTMAX-1  64) SIGRTMAX`
    }
  }

  // Determine signal
  let signal = 'TERM'
  if (args.includes('-9') || args.includes('-KILL')) {
    signal = 'KILL'
  } else if (args.includes('-15') || args.includes('-TERM')) {
    signal = 'TERM'
  } else {
    const signalArg = args.find(arg => arg.startsWith('-s'))?.split('=')[1] || 
                     args[args.findIndex(arg => arg.startsWith('-s')) + 1]
    if (signalArg) {
      signal = signalArg
    }
  }

  // Get PIDs to kill
  const pids = args.filter(arg => !arg.startsWith('-') && !isNaN(parseInt(arg)))

  if (pids.length === 0) {
    return {
      success: false,
      error: 'kill: missing process operand\nTry \'kill --help\' for more information.'
    }
  }

  // Simulate killing processes
  const results: string[] = []
  for (const pidStr of pids) {
    const pid = parseInt(pidStr)
    if (isNaN(pid)) {
      results.push(`kill: ${pidStr}: invalid process id`)
      continue
    }

    // Check if process exists (simulate)
    if (pid < 1000 || pid > 9999) {
      results.push(`kill: (${pid}): No such process`)
      continue
    }

    // Simulate successful kill
    results.push(`Process ${pid} terminated with signal ${signal}`)
  }

  return {
    success: true,
    output: results.join('\n')
  }
}

// Helper functions

function generateSimulatedProcesses(currentUser: string): Process[] {
  const processes: Process[] = [
    {
      pid: 1,
      user: 'root',
      cpu: 0.1,
      mem: 0.5,
      command: 'systemd',
      args: ['/sbin/init'],
      startTime: '00:00:01',
      state: 'S'
    },
    {
      pid: 1234,
      user: currentUser,
      cpu: 2.3,
      mem: 1.2,
      command: 'bash',
      args: ['/bin/bash'],
      startTime: '10:30:15',
      state: 'R'
    },
    {
      pid: 2345,
      user: currentUser,
      cpu: 0.8,
      mem: 0.8,
      command: 'node',
      args: ['node', 'server.js'],
      startTime: '10:35:22',
      state: 'S'
    },
    {
      pid: 3456,
      user: 'root',
      cpu: 0.2,
      mem: 0.3,
      command: 'sshd',
      args: ['/usr/sbin/sshd', '-D'],
      startTime: '00:00:05',
      state: 'S'
    },
    {
      pid: 4567,
      user: currentUser,
      cpu: 1.5,
      mem: 2.1,
      command: 'vim',
      args: ['vim', 'document.txt'],
      startTime: '11:15:30',
      state: 'S'
    }
  ]

  return processes
}

function generateSimulatedOpenFiles(currentUser: string) {
  return [
    {
      command: 'bash',
      pid: 1234,
      user: currentUser,
      fd: '0u',
      type: 'CHR',
      device: '136,0',
      size: '0t0',
      node: 'pts/0',
      name: '/dev/pts/0'
    },
    {
      command: 'bash',
      pid: 1234,
      user: currentUser,
      fd: '1u',
      type: 'CHR',
      device: '136,0',
      size: '0t0',
      node: 'pts/0',
      name: '/dev/pts/0'
    },
    {
      command: 'bash',
      pid: 1234,
      user: currentUser,
      fd: '2u',
      type: 'CHR',
      device: '136,0',
      size: '0t0',
      node: 'pts/0',
      name: '/dev/pts/0'
    },
    {
      command: 'node',
      pid: 2345,
      user: currentUser,
      fd: '3r',
      type: 'REG',
      device: '8,1',
      size: '1234',
      node: '123456',
      name: '/home/user/server.js'
    },
    {
      command: 'sshd',
      pid: 3456,
      user: 'root',
      fd: '3u',
      type: 'network',
      device: 'IPv4',
      size: '0t0',
      node: 'TCP',
      name: '*:22 (LISTEN)'
    }
  ]
}

function generateSystemInfo() {
  return {
    uptime: '2 days, 14:32:15',
    users: 2,
    loadAverage: [0.15, 0.23, 0.18],
    tasks: { total: 156, running: 1, sleeping: 155, stopped: 0, zombie: 0 },
    cpu: { us: 2.3, sy: 1.1, ni: 0.0, id: 96.4, wa: 0.1, hi: 0.0, si: 0.1, st: 0.0 },
    memory: { total: 8192, used: 2048, free: 6144, shared: 512, buff: 256, cache: 1024 },
    swap: { total: 2048, used: 0, free: 2048 }
  }
}

function formatPsOutput(processes: Process[], noHeaders: boolean): string {
  const lines: string[] = []
  
  if (!noHeaders) {
    lines.push('    PID USER       %CPU %MEM COMMAND')
  }
  
  for (const proc of processes) {
    const line = `${proc.pid.toString().padStart(8)} ${proc.user.padEnd(8)} ${proc.cpu.toFixed(1).padStart(5)} ${proc.mem.toFixed(1).padStart(5)} ${proc.command}`
    lines.push(line)
  }
  
  return lines.join('\n')
}

function formatLsofOutput(openFiles: any[]): string {
  const lines: string[] = []
  
  lines.push('COMMAND     PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME')
  
  for (const file of openFiles) {
    const line = `${file.command.padEnd(11)} ${file.pid.toString().padStart(4)} ${file.user.padEnd(6)} ${file.fd.padEnd(3)} ${file.type.padEnd(4)} ${file.device.padEnd(6)} ${file.size.padEnd(8)} ${file.node.padEnd(4)} ${file.name}`
    lines.push(line)
  }
  
  return lines.join('\n')
}

function formatTopOutput(systemInfo: any, processes: Process[]): string {
  const lines: string[] = []
  
  // System info header
  lines.push(`top - ${new Date().toLocaleTimeString()} up ${systemInfo.uptime}, ${systemInfo.users} users, load average: ${systemInfo.loadAverage.join(', ')}`)
  lines.push(`Tasks: ${systemInfo.tasks.total} total, ${systemInfo.tasks.running} running, ${systemInfo.tasks.sleeping} sleeping, ${systemInfo.tasks.stopped} stopped, ${systemInfo.tasks.zombie} zombie`)
  lines.push(`%Cpu(s): ${systemInfo.cpu.us} us, ${systemInfo.cpu.sy} sy, ${systemInfo.cpu.ni} ni, ${systemInfo.cpu.id} id, ${systemInfo.cpu.wa} wa, ${systemInfo.cpu.hi} hi, ${systemInfo.cpu.si} si, ${systemInfo.cpu.st} st`)
  lines.push(`MiB Mem: ${systemInfo.memory.total} total, ${systemInfo.memory.used} free, ${systemInfo.memory.free} used, ${systemInfo.memory.shared} buff/cache`)
  lines.push(`MiB Swap: ${systemInfo.swap.total} total, ${systemInfo.swap.used} used, ${systemInfo.swap.free} avail Mem`)
  lines.push('')
  
  // Process list header
  lines.push('    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND')
  
  // Process list
  for (const proc of processes) {
    const virt = Math.floor(proc.mem * 1000)
    const res = Math.floor(proc.mem * 500)
    const shr = Math.floor(proc.mem * 100)
    const time = `${Math.floor(proc.cpu * 10)}:${Math.floor(proc.cpu * 60).toString().padStart(2, '0')}.${Math.floor(proc.cpu * 100).toString().padStart(2, '0')}`
    
    const line = `${proc.pid.toString().padStart(8)} ${proc.user.padEnd(8)} ${'20'.padStart(2)} ${'0'.padStart(2)} ${virt.toString().padStart(8)} ${res.toString().padStart(8)} ${shr.toString().padStart(6)} ${proc.state} ${proc.cpu.toFixed(1).padStart(6)} ${proc.mem.toFixed(1).padStart(6)} ${time.padStart(9)} ${proc.command}`
    lines.push(line)
  }
  
  return lines.join('\n')
}
