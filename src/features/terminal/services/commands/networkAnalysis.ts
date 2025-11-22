// Network Analysis Commands
// Implements netstat, ss, ping, and nmap commands for hacker game

import { FakeFileSystem } from '../fakeFilesystem'
import { CommandContext } from '../terminalCommands'

export interface NetworkAnalysisResult {
  success: boolean
  output?: string
  error?: string
}

/**
 * Network connection data
 */
interface NetworkConnection {
  protocol: string
  localAddress: string
  foreignAddress: string
  state: string
  pid?: number
  program?: string
}

/**
 * netstat command - display network connections
 * Usage: netstat [options]
 */
export async function netstatCommand(
  args: string[],
  context: CommandContext
): Promise<NetworkAnalysisResult> {
  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: netstat [OPTION]...
Display network connections, routing tables, and interface statistics.

  -t, --tcp               show TCP connections
  -u, --udp               show UDP connections
  -l, --listening          show listening sockets
  -p, --programs           show PID and program name
  -n, --numeric            show numerical addresses
  -a, --all                show all connections
      --help              display this help and exit

Examples:
  netstat                  # Show all connections
  netstat -tlnp            # Show listening TCP connections with PIDs
  netstat -u               # Show UDP connections
  netstat -an              # Show all connections numerically`
    }
  }

  const showTcp = args.includes('-t') || args.includes('--tcp')
  const showUdp = args.includes('-u') || args.includes('--udp')
  const showListening = args.includes('-l') || args.includes('--listening')
  const showPrograms = args.includes('-p') || args.includes('--programs')
  const showNumeric = args.includes('-n') || args.includes('--numeric')
  const showAll = args.includes('-a') || args.includes('--all')

  // Default to showing all if no specific protocol specified
  const showTcpConnections = showTcp || (!showTcp && !showUdp)
  const showUdpConnections = showUdp || (!showTcp && !showUdp)

  // Generate simulated network connections
  const connections = generateSimulatedConnections()

  // Filter connections based on options
  let filteredConnections = connections
  if (showTcpConnections && !showUdpConnections) {
    filteredConnections = connections.filter(c => c.protocol === 'tcp')
  } else if (showUdpConnections && !showTcpConnections) {
    filteredConnections = connections.filter(c => c.protocol === 'udp')
  }

  if (showListening) {
    filteredConnections = filteredConnections.filter(c => c.state === 'LISTEN')
  }

  // Format output
  const output = formatNetstatOutput(filteredConnections, showPrograms, showNumeric)

  return {
    success: true,
    output
  }
}

/**
 * ss command - display socket statistics
 * Usage: ss [options]
 */
export async function ssCommand(
  args: string[],
  context: CommandContext
): Promise<NetworkAnalysisResult> {
  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: ss [OPTION]...
Display socket statistics.

  -t, --tcp               show TCP sockets
  -u, --udp               show UDP sockets
  -l, --listening          show listening sockets
  -p, --processes          show process information
  -n, --numeric            show numerical addresses
  -a, --all                show all sockets
  -H, --no-header          suppress header line
      --help              display this help and exit

Examples:
  ss                       # Show all sockets
  ss -tlnp                 # Show listening TCP sockets with processes
  ss -u                    # Show UDP sockets
  ss -an                   # Show all sockets numerically`
    }
  }

  const showTcp = args.includes('-t') || args.includes('--tcp')
  const showUdp = args.includes('-u') || args.includes('--udp')
  const showListening = args.includes('-l') || args.includes('--listening')
  const showProcesses = args.includes('-p') || args.includes('--processes')
  const showNumeric = args.includes('-n') || args.includes('--numeric')
  const showAll = args.includes('-a') || args.includes('--all')
  const noHeader = args.includes('-H') || args.includes('--no-header')

  // Default to showing all if no specific protocol specified
  const showTcpSockets = showTcp || (!showTcp && !showUdp)
  const showUdpSockets = showUdp || (!showTcp && !showUdp)

  // Generate simulated socket data
  const sockets = generateSimulatedSockets()

  // Filter sockets based on options
  let filteredSockets = sockets
  if (showTcpSockets && !showUdpSockets) {
    filteredSockets = sockets.filter(s => s.protocol === 'tcp')
  } else if (showUdpSockets && !showTcpSockets) {
    filteredSockets = sockets.filter(s => s.protocol === 'udp')
  }

  if (showListening) {
    filteredSockets = filteredSockets.filter(s => s.state === 'LISTEN')
  }

  // Format output
  const output = formatSsOutput(filteredSockets, showProcesses, showNumeric, noHeader)

  return {
    success: true,
    output
  }
}

/**
 * ping command - test network connectivity
 * Usage: ping [options] host
 */
export async function pingCommand(
  args: string[],
  context: CommandContext
): Promise<NetworkAnalysisResult> {
  if (args.length === 0) {
    return {
      success: false,
      error: 'ping: missing host operand\nTry \'ping --help\' for more information.'
    }
  }

  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: ping [OPTION]... HOST
Send ICMP ECHO_REQUEST packets to network hosts.

  -c, --count=NUMBER      stop after sending NUMBER packets
  -i, --interval=SECONDS  wait SECONDS between sending each packet
  -t, --ttl=NUMBER        set the IP Time To Live
  -W, --timeout=SECONDS   time to wait for a response
      --help              display this help and exit

Examples:
  ping google.com         # Ping Google
  ping -c 4 8.8.8.8      # Ping 4 times
  ping -i 2 example.com   # Ping every 2 seconds`
    }
  }

  const host = args.find(arg => !arg.startsWith('-'))
  if (!host) {
    return {
      success: false,
      error: 'ping: missing host operand\nTry \'ping --help\' for more information.'
    }
  }

  const count = args.find(arg => arg.startsWith('-c'))?.split('=')[1] || 
                args[args.findIndex(arg => arg.startsWith('-c')) + 1] || '4'
  const interval = args.find(arg => arg.startsWith('-i'))?.split('=')[1] || 
                   args[args.findIndex(arg => arg.startsWith('-i')) + 1] || '1'

  // Simulate ping results
  const pingCount = parseInt(count) || 4
  const pingInterval = parseFloat(interval) || 1.0

  const results = await simulatePing(host, pingCount, pingInterval)

  return {
    success: true,
    output: results
  }
}

/**
 * nmap command - network port scanner
 * Usage: nmap [options] target
 */
export async function nmapCommand(
  args: string[],
  context: CommandContext
): Promise<NetworkAnalysisResult> {
  if (args.length === 0) {
    return {
      success: false,
      error: 'nmap: missing target operand\nTry \'nmap --help\' for more information.'
    }
  }

  if (args.includes('--help')) {
    return {
      success: true,
      output: `Usage: nmap [OPTION]... TARGET
Network exploration tool and security scanner.

  -sS                    TCP SYN scan
  -sT                    TCP connect scan
  -sU                    UDP scan
  -p PORTS               scan specific ports
  -O                     enable OS detection
  -sV                    enable service version detection
  -A                     enable OS detection, version detection, script scanning
      --help             display this help and exit

Examples:
  nmap 192.168.1.1       # Scan single host
  nmap -sS -O 10.0.0.1   # SYN scan with OS detection
  nmap -p 80,443 example.com  # Scan specific ports
  nmap -A target.com     # Aggressive scan`
    }
  }

  const target = args.find(arg => !arg.startsWith('-'))
  if (!target) {
    return {
      success: false,
      error: 'nmap: missing target operand\nTry \nmap --help\' for more information.'
    }
  }

  const synScan = args.includes('-sS')
  const tcpScan = args.includes('-sT')
  const udpScan = args.includes('-sU')
  const osDetection = args.includes('-O')
  const versionDetection = args.includes('-sV')
  const aggressive = args.includes('-A')

  // Parse port specification
  const portArg = args.find(arg => arg.startsWith('-p'))
  const ports = portArg ? portArg.split(' ')[1] || portArg.split('=')[1] : '1-1000'

  // Simulate nmap scan
  const results = await simulateNmapScan(target, ports, {
    synScan,
    tcpScan,
    udpScan,
    osDetection,
    versionDetection,
    aggressive
  })

  return {
    success: true,
    output: results
  }
}

// Helper functions

function generateSimulatedConnections(): NetworkConnection[] {
  return [
    {
      protocol: 'tcp',
      localAddress: '0.0.0.0:22',
      foreignAddress: '0.0.0.0:*',
      state: 'LISTEN',
      pid: 3456,
      program: 'sshd'
    },
    {
      protocol: 'tcp',
      localAddress: '127.0.0.1:3000',
      foreignAddress: '0.0.0.0:*',
      state: 'LISTEN',
      pid: 2345,
      program: 'node'
    },
    {
      protocol: 'tcp',
      localAddress: '192.168.1.100:45678',
      foreignAddress: '93.184.216.34:80',
      state: 'ESTABLISHED',
      pid: 1234,
      program: 'curl'
    },
    {
      protocol: 'tcp',
      localAddress: '192.168.1.100:45679',
      foreignAddress: '151.101.193.140:443',
      state: 'ESTABLISHED',
      pid: 1234,
      program: 'curl'
    },
    {
      protocol: 'udp',
      localAddress: '0.0.0.0:53',
      foreignAddress: '0.0.0.0:*',
      state: '',
      pid: 1234,
      program: 'systemd-resolve'
    },
    {
      protocol: 'udp',
      localAddress: '0.0.0.0:68',
      foreignAddress: '0.0.0.0:*',
      state: '',
      pid: 1234,
      program: 'dhclient'
    }
  ]
}

function generateSimulatedSockets() {
  return [
    {
      protocol: 'tcp',
      state: 'LISTEN',
      recvQ: 0,
      sendQ: 0,
      localAddress: '0.0.0.0:22',
      peerAddress: '0.0.0.0:*',
      pid: 3456,
      process: 'sshd'
    },
    {
      protocol: 'tcp',
      state: 'LISTEN',
      recvQ: 0,
      sendQ: 0,
      localAddress: '127.0.0.1:3000',
      peerAddress: '0.0.0.0:*',
      pid: 2345,
      process: 'node'
    },
    {
      protocol: 'tcp',
      state: 'ESTABLISHED',
      recvQ: 0,
      sendQ: 0,
      localAddress: '192.168.1.100:45678',
      peerAddress: '93.184.216.34:80',
      pid: 1234,
      process: 'curl'
    },
    {
      protocol: 'udp',
      state: '',
      recvQ: 0,
      sendQ: 0,
      localAddress: '0.0.0.0:53',
      peerAddress: '0.0.0.0:*',
      pid: 1234,
      process: 'systemd-resolve'
    }
  ]
}

async function simulatePing(host: string, count: number, interval: number): Promise<string> {
  const lines: string[] = []
  
  // Resolve host to IP (simulate)
  const ip = await resolveHost(host)
  
  lines.push(`PING ${host} (${ip}) 56(84) bytes of data.`)
  
  let totalTime = 0
  let received = 0
  
  for (let i = 0; i < count; i++) {
    // Simulate ping response
    const time = Math.random() * 50 + 10 // 10-60ms
    totalTime += time
    received++
    
    lines.push(`64 bytes from ${ip}: icmp_seq=${i + 1} ttl=64 time=${time.toFixed(3)} ms`)
    
    // Add delay between pings
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, interval * 1000))
    }
  }
  
  // Statistics
  const avgTime = totalTime / received
  const loss = ((count - received) / count) * 100
  
  lines.push('')
  lines.push(`--- ${host} ping statistics ---`)
  lines.push(`${count} packets transmitted, ${received} received, ${loss.toFixed(1)}% packet loss, time ${(count * interval * 1000).toFixed(0)}ms`)
  lines.push(`rtt min/avg/max/mdev = ${(avgTime * 0.8).toFixed(3)}/${avgTime.toFixed(3)}/${(avgTime * 1.2).toFixed(3)}/${(avgTime * 0.1).toFixed(3)} ms`)
  
  return lines.join('\n')
}

async function simulateNmapScan(
  target: string,
  ports: string,
  options: {
    synScan: boolean
    tcpScan: boolean
    udpScan: boolean
    osDetection: boolean
    versionDetection: boolean
    aggressive: boolean
  }
): Promise<string> {
  const lines: string[] = []
  
  // Parse ports
  const portList = parsePorts(ports)
  
  lines.push(`Starting Nmap 7.80 ( https://nmap.org ) at ${new Date().toLocaleString()}`)
  lines.push(`Nmap scan report for ${target}`)
  lines.push(`Host is up (0.001s latency).`)
  lines.push('')
  
  // Scan ports
  const openPorts = scanPorts(target, portList, options)
  
  if (openPorts.length > 0) {
    lines.push('PORT     STATE SERVICE')
    for (const port of openPorts) {
      lines.push(`${port.port.toString().padStart(5)}/${port.protocol} ${port.state.padEnd(5)} ${port.service}`)
    }
  } else {
    lines.push('All 1000 scanned ports on the target are closed')
  }
  
  // OS detection
  if (options.osDetection || options.aggressive) {
    lines.push('')
    lines.push('OS details: Linux 5.4.0-74-generic')
  }
  
  lines.push('')
  lines.push(`Nmap done: 1 IP address (1 host up) scanned in 2.34 seconds`)
  
  return lines.join('\n')
}

function formatNetstatOutput(connections: NetworkConnection[], showPrograms: boolean, showNumeric: boolean): string {
  const lines: string[] = []
  
  if (showPrograms) {
    lines.push('Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name')
  } else {
    lines.push('Proto Recv-Q Send-Q Local Address           Foreign Address         State')
  }
  
  for (const conn of connections) {
    let line = `${conn.protocol.toUpperCase().padEnd(5)} ${'0'.padStart(7)} ${'0'.padStart(7)} ${conn.localAddress.padEnd(23)} ${conn.foreignAddress.padEnd(23)} ${conn.state.padEnd(11)}`
    
    if (showPrograms && conn.pid && conn.program) {
      line += ` ${conn.pid}/${conn.program}`
    }
    
    lines.push(line)
  }
  
  return lines.join('\n')
}

function formatSsOutput(sockets: any[], showProcesses: boolean, showNumeric: boolean, noHeader: boolean): string {
  const lines: string[] = []
  
  if (!noHeader) {
    if (showProcesses) {
      lines.push('Netid State  Recv-Q Send-Q Local Address:Port Peer Address:Port Process')
    } else {
      lines.push('Netid State  Recv-Q Send-Q Local Address:Port Peer Address:Port')
    }
  }
  
  for (const socket of sockets) {
    let line = `${socket.protocol.toUpperCase().padEnd(6)} ${socket.state.padEnd(6)} ${socket.recvQ.toString().padStart(7)} ${socket.sendQ.toString().padStart(7)} ${socket.localAddress.padEnd(23)} ${socket.peerAddress.padEnd(23)}`
    
    if (showProcesses && socket.pid && socket.process) {
      line += ` ${socket.pid}/${socket.process}`
    }
    
    lines.push(line)
  }
  
  return lines.join('\n')
}

async function resolveHost(host: string): Promise<string> {
  // Simulate DNS resolution
  const hostMap: { [key: string]: string } = {
    'google.com': '142.250.191.14',
    'github.com': '140.82.112.3',
    'stackoverflow.com': '151.101.193.69',
    'example.com': '93.184.216.34',
    'localhost': '127.0.0.1',
    '127.0.0.1': '127.0.0.1'
  }
  
  return hostMap[host] || '192.168.1.1'
}

function parsePorts(ports: string): number[] {
  if (ports.includes('-')) {
    const [start, end] = ports.split('-').map(p => parseInt(p))
    const result: number[] = []
    for (let i = start; i <= end; i++) {
      result.push(i)
    }
    return result
  } else if (ports.includes(',')) {
    return ports.split(',').map(p => parseInt(p.trim()))
  } else {
    return [parseInt(ports)]
  }
}

function scanPorts(target: string, ports: number[], options: any): any[] {
  const openPorts: any[] = []
  
  // Simulate common open ports
  const commonPorts = [22, 80, 443, 3000, 8080, 3306, 5432]
  
  for (const port of ports) {
    if (commonPorts.includes(port)) {
      const service = getServiceName(port)
      openPorts.push({
        port,
        protocol: 'tcp',
        state: 'open',
        service
      })
    }
  }
  
  return openPorts
}

function getServiceName(port: number): string {
  const services: { [key: number]: string } = {
    22: 'ssh',
    80: 'http',
    443: 'https',
    3000: 'http',
    8080: 'http-proxy',
    3306: 'mysql',
    5432: 'postgresql'
  }
  
  return services[port] || 'unknown'
}
