'use client'

import { useState, useEffect, useRef } from 'react'
import { config } from '@/features/shared/services/config'
import { loadTerminalCommands, processCommand, getCommandType, type TerminalCommands, type CommandContext } from '../services/terminalCommands'
import { FakeFileSystem, type FileSystem } from '../services/fakeFilesystem'
import { terminalCache, type TerminalSession } from '../services/terminalCache'
import { createTerminalAutocomplete, type TerminalAutocomplete, type AutocompleteResult } from '../services/terminalAutocomplete'
import { GameStateManager } from '../services/gameState'
import { ProgressTracker } from '../services/progressTracker'
import { HintSystem } from '../services/hintSystem'
import GameInterface from './GameInterface'
import GameProgress from './GameProgress'
import VictoryScreen from './VictoryScreen'

interface TerminalCredentials {
  hostname: string;
  username: string;
  password: string;
  password_hint: string;
  root_username: string;
  root_password: string;
  root_password_hint: string;
}

interface TerminalProps {
  userData: {
    name: string
    username: string
  } | null
  isOpen: boolean
  onClose: () => void
}

interface TerminalLine {
  type: 'command' | 'output'
  content: string
  timestamp?: number
}

export default function Terminal({ userData, isOpen, onClose }: TerminalProps) {
  const [command, setCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState<TerminalLine[]>([])
  const [terminalCommands, setTerminalCommands] = useState<TerminalCommands | null>(null)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [currentUser, setCurrentUser] = useState<string>('')
  const [isPasswordMode, setIsPasswordMode] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [filesystem, setFilesystem] = useState<FakeFileSystem | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isRestoringSession, setIsRestoringSession] = useState(false)
  const [autocomplete, setAutocomplete] = useState<TerminalAutocomplete | null>(null)
  const [currentSuggestion, setCurrentSuggestion] = useState<string>('')
  const [suggestionIndex, setSuggestionIndex] = useState<number>(-1)
  const [showInlineSuggestion, setShowInlineSuggestion] = useState(false)
  const [suggestionPosition, setSuggestionPosition] = useState<number>(0)
  const [terminalCredentials, setTerminalCredentials] = useState<TerminalCredentials | null>(null)
  const [gameManager] = useState(() => GameStateManager.getInstance())
  const [progressTracker] = useState(() => new ProgressTracker())
  const [hintSystem] = useState(() => new HintSystem())
  const [showGameProgress, setShowGameProgress] = useState(false)
  const [showVictoryScreen, setShowVictoryScreen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)

  // Load terminal credentials on component mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const response = await fetch(config.api.terminalUserInfo)
        const data = await response.json()
        setTerminalCredentials({
          hostname: data.hostname,
          username: data.username,
          password: data.password,
          password_hint: data.password_hint,
          root_username: data.root_username,
          root_password: data.root_password,
          root_password_hint: data.root_password_hint
        })
      } catch (error) {
        console.error('Could not load terminal credentials:', error)
        setTerminalCredentials(null)
      }
    }
    loadCredentials()
  }, [])

  // Load terminal commands and system info on component mount
  useEffect(() => {
    const loadCommands = async () => {
      try {
        console.log('Loading terminal commands...')
        const commands = await loadTerminalCommands()
        console.log('Loaded terminal commands:', commands)
        console.log('Available commands:', Object.keys(commands.commands))
        console.log('Has cache-status:', !!commands.commands['cache-status'])
        setTerminalCommands(commands)
      } catch (error) {
        console.error('Failed to load terminal commands:', error)
        setTerminalCommands({ commands: {} })
      }
    }
    loadCommands()
    
    // Load filesystem (will be initialized with correct user after login)
    // Note: Filesystem will be created after terminal credentials are loaded
  }, [])

  // Create filesystem when terminal credentials are loaded
  useEffect(() => {
    if (terminalCredentials && !filesystem) {
      const fs = new FakeFileSystem('', terminalCredentials)
      setFilesystem(fs)
      console.log('🔍 Filesystem created with terminal credentials')
    }
  }, [terminalCredentials, filesystem])

  // Update autocomplete system when terminal commands are loaded
  useEffect(() => {
    if (terminalCommands && filesystem) {
      console.log('🔍 Updating autocomplete system with terminal commands')
      const updatedAutocomplete = createTerminalAutocomplete({
        filesystem: filesystem,
        terminalCommands: terminalCommands,
        commandHistory: commandHistory,
        currentPath: filesystem.getCurrentPath()
      })
      setAutocomplete(updatedAutocomplete)
      console.log('🔍 Autocomplete system updated:', !!updatedAutocomplete)
    } else {
      console.log('🔍 Cannot update autocomplete - missing dependencies:', {
        terminalCommands: !!terminalCommands,
        filesystem: !!filesystem
      })
    }
  }, [terminalCommands, filesystem, commandHistory])

  // Initialize or restore session when terminal opens
  useEffect(() => {
    if (isOpen && userData) {
      const userId = userData.username || userData.name || 'anonymous'
      console.log('=== TERMINAL OPENED ===')
      console.log('User ID:', userId)
      console.log('Checking for active session...')
      
  // Check if user has an active session
  if (terminalCache.hasActiveSession(userId)) {
    console.log('✅ Found active session, restoring...')
    // Restore existing session
    restoreSession(userId)
  } else {
    console.log('❌ No active session found, will create after login')
    // Don't create session yet - wait for login
  }
    }
  }, [isOpen, userData])

  // Update autocomplete context when terminal commands or filesystem changes
  useEffect(() => {
    if (autocomplete && terminalCommands && filesystem) {
      autocomplete.updateContext({
        terminalCommands,
        filesystem,
        commandHistory,
        currentPath: filesystem.getCurrentPath()
      })
    }
  }, [autocomplete, terminalCommands, filesystem, commandHistory])

  // ALSO check for session restoration when component mounts (for page refresh)
  useEffect(() => {
    if (isOpen && userData) {
      const userId = userData.username || userData.name || 'anonymous'
      console.log('=== COMPONENT MOUNTED - CHECKING FOR SESSION ===')
      console.log('User ID:', userId)
      
      // Check if user has an active session (for page refresh)
      if (terminalCache.hasActiveSession(userId)) {
        console.log('✅ Found active session on mount, restoring...')
        // Restore existing session
        restoreSession(userId)
      }
    }
  }, []) // Empty dependency array - runs only on mount

  // Force session restoration on mount if terminal is open
  useEffect(() => {
    if (isOpen && userData) {
      const userId = userData.username || userData.name || 'anonymous'
      console.log('=== FORCE SESSION CHECK ===')
      console.log('User ID:', userId)
      
      // Always check for session when terminal opens
      setTimeout(() => {
        if (terminalCache.hasActiveSession(userId)) {
          console.log('✅ Found active session on force check, restoring...')
          restoreSession(userId)
        }
      }, 1000) // Wait 1 second for everything to load
    }
  }, [isOpen, userData])

  // Auto-save terminal state periodically
  useEffect(() => {
    if (!sessionId || !isLoggedIn) {
      console.log('Auto-save skipped - no session or not logged in')
      return
    }

    console.log('Starting auto-save for session:', sessionId)
    const autoSaveInterval = setInterval(() => {
      if (filesystem) {
        console.log('Auto-saving terminal state...')
        terminalCache.autoSave(
          commandHistory,
          terminalOutput.map(line => line.content),
          filesystem.getCurrentPath(),
          {
            currentUser: filesystem.getCurrentUser(),
            currentPath: filesystem.getCurrentPath(),
            deletedFiles: filesystem.getDeletedFiles()
          },
          isLoggedIn
        )
        console.log('Auto-save completed')
      }
    }, 10000) // Auto-save every 10 seconds for testing

    return () => {
      console.log('Stopping auto-save')
      clearInterval(autoSaveInterval)
    }
  }, [sessionId, commandHistory, terminalOutput, isLoggedIn, filesystem])

  // Save state when terminal closes
  useEffect(() => {
    if (!isOpen && sessionId && filesystem) {
        terminalCache.saveTerminalSnapshot(
          commandHistory,
          terminalOutput.map(line => line.content),
          filesystem.getCurrentPath(),
          {
            currentUser: filesystem.getCurrentUser(),
            currentPath: filesystem.getCurrentPath(),
            deletedFiles: filesystem.getDeletedFiles()
          }
        )
    }
  }, [isOpen, sessionId, commandHistory, terminalOutput, filesystem])

  // Restore session function
  const restoreSession = async (userId: string) => {
    console.log('=== RESTORING SESSION ===')
    console.log('User ID:', userId)
    setIsRestoringSession(true)
    
    try {
      const restoredState = terminalCache.restoreTerminalState()
      console.log('Restored state:', restoredState)
      
      if (restoredState) {
        console.log('✅ Found session to restore!')
        
        // Restore terminal state
        setCommandHistory(restoredState.commandHistory)
        setTerminalOutput(restoredState.terminalOutput.map((content: string) => ({
          type: 'output' as const,
          content,
          timestamp: Date.now()
        })))
        setCurrentUser(restoredState.filesystemState.currentUser)
        setIsLoggedIn(restoredState.isLoggedIn)
        
        // Restore filesystem state
        const fs = new FakeFileSystem(restoredState.filesystemState.currentUser, terminalCredentials!)
        await fs.setCurrentPath(restoredState.filesystemState.currentPath)
        // Restore deleted files
        if (restoredState.filesystemState.deletedFiles) {
          fs.setDeletedFiles(restoredState.filesystemState.deletedFiles)
        }
        setFilesystem(fs)
        
        // Set login mode based on restored state
        if (restoredState.isLoggedIn) {
          console.log('✅ User was logged in, restoring login state')
          setIsLoginMode(false)
          setIsPasswordMode(false)
          
          // Add restoration message
          const restorationMessage = [
            `Session restored - Welcome back!`,
            `Last activity: ${new Date().toLocaleString()}`,
            ``
          ]
          setTerminalOutput(prev => [...prev, ...restorationMessage.map(content => ({
            type: 'output' as const,
            content,
            timestamp: Date.now()
          }))])
          
          // IMPORTANT: Set the terminal as expanded and ready for commands
          setIsExpanded(true)
          console.log('✅ Terminal expanded and ready for commands')
        } else {
          console.log('❌ User was not logged in')
          setIsLoginMode(true)
          setIsPasswordMode(false)
        }
        
        // Expand terminal
        setIsExpanded(true)
        
        // Get session ID
        const activeSession = terminalCache.getActiveSession()
        if (activeSession) {
          setSessionId(activeSession.id)
          console.log('✅ Session ID restored:', activeSession.id)
        }
        
        console.log('✅ Session restoration completed!')
      } else {
        console.log('❌ No session found to restore')
        // No session to restore, initialize normally
        initializeNewTerminal()
      }
    } catch (error) {
      console.error('❌ Failed to restore session:', error)
      initializeNewTerminal()
    } finally {
      setIsRestoringSession(false)
    }
  }

  // Initialize new terminal (when no session exists)
  const initializeNewTerminal = () => {
    const hostname = terminalCredentials?.hostname
    
    // Create welcome message lines (without login prompt)
    const welcomeLines = [
      `Welcome to ${hostname}!`,
      `Linux ${hostname} 6.14.8 #1 SMP PREEMPT_DYNAMIC NixOS 24.11 (Uakari) x86_64`,
      ``,
      `The programs included with the NixOS system are free software;`,
      `the exact distribution terms for each program are described in the`,
      `individual files in /usr/share/doc/*/copyright.`,
      ``,
      `NixOS comes with ABSOLUTELY NO WARRANTY, to the extent permitted by`,
      `applicable law.`,
      ``,
      `Last login: ${new Date().toLocaleString()}`
    ]
    
    // First expand the terminal
    setIsExpanded(true)
    
    // Then add content after animation starts (400ms = animation duration)
    setTimeout(() => {
      setTerminalOutput(welcomeLines.map(content => ({
        type: 'output' as const,
        content,
        timestamp: Date.now()
      })))
      setIsLoginMode(true)
      setIsPasswordMode(false) // Start with username input
    }, 400)
  }

  // Initialize terminal when opened
  useEffect(() => {
    if (isOpen && terminalOutput.length === 0 && !isRestoringSession) {
      initializeNewTerminal()
    }
  }, [isOpen, terminalCredentials, isRestoringSession])

  // Update cursor position when command changes
  useEffect(() => {
    updateCursorPosition()
  }, [command])

  // Auto-focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])


  const updateCursorPosition = () => {
    if (inputRef.current && cursorRef.current) {
      const input = inputRef.current
      const cursor = cursorRef.current
      
      // Get the actual cursor position from the input
      const selectionStart = input.selectionStart || 0
      
      // Create a temporary span to measure text width up to cursor position
      const tempSpan = document.createElement('span')
      tempSpan.style.visibility = 'hidden'
      tempSpan.style.position = 'absolute'
      tempSpan.style.font = window.getComputedStyle(input).font
      tempSpan.style.fontSize = window.getComputedStyle(input).fontSize
      tempSpan.style.fontFamily = window.getComputedStyle(input).fontFamily
      tempSpan.style.fontWeight = window.getComputedStyle(input).fontWeight
      tempSpan.style.letterSpacing = window.getComputedStyle(input).letterSpacing
      tempSpan.textContent = input.value.substring(0, selectionStart)
      document.body.appendChild(tempSpan)
      
      const textWidth = tempSpan.offsetWidth
      document.body.removeChild(tempSpan)
      
      // Position cursor at the exact text position (convert px to rem)
      const fontSize = parseFloat(window.getComputedStyle(input).fontSize)
      const cursorPosition = 0.5 + (textWidth / fontSize)
      cursor.style.left = `${cursorPosition}rem`
      
      // Update suggestion position to match cursor position
      setSuggestionPosition(cursorPosition)
    }
  }


  const addTerminalOutput = (output: string, type: 'command' | 'output' = 'output') => {
    setTerminalOutput(prev => {
      const newOutput = [...prev, { 
        type, 
        content: output, 
        timestamp: Date.now() 
      }]
      
      // Auto-save to cache when output changes
      if (sessionId && filesystem) {
        terminalCache.updateActiveSession({
          terminalOutput: newOutput.map(line => line.content),
          commandHistory: commandHistory
        })
      }
      
      return newOutput
    })
  }

  const getCurrentPrompt = () => {
    if (isLoginMode) {
      if (isPasswordMode) {
        return 'Password: '
      } else {
        return `${terminalCredentials?.hostname} login: `
      }
    } else {
      // Check if we're in password mode for su command
      if (isPasswordMode) {
        return 'Password: '
      }
      
      // Determine the correct home path based on current user
      const homePath = currentUser === 'root' ? '/root' : `/home/${terminalCredentials?.username}`
      const currentPath = filesystem?.getCurrentPath() || homePath
      
      // Create shorter, cleaner path display
      let shortPath = currentPath
      if (currentPath === homePath) {
        shortPath = '~'
      } else if (currentPath.startsWith(homePath + '/')) {
        shortPath = '~' + currentPath.substring(homePath.length)
      } else if (currentPath.startsWith('/home/')) {
        // Extract username from path like /home/username/Downloads -> ~/Downloads
        const pathParts = currentPath.split('/')
        if (pathParts.length >= 3) {
          const username = pathParts[2]
          if (pathParts.length === 3) {
            shortPath = '~'
          } else {
            shortPath = '~/' + pathParts.slice(3).join('/')
          }
        }
      }
      
      return `${currentUser}@${terminalCredentials?.hostname} ${shortPath} `
    }
  }

  const getCurrentPromptJSX = () => {
    if (isLoginMode) {
      if (isPasswordMode) {
        return <span className="terminal-prompt-text">Password: </span>
      } else {
        return <span className="terminal-prompt-text">{terminalCredentials?.hostname} login: </span>
      }
    } else {
      // Check if we're in password mode for su command
      if (isPasswordMode) {
        return <span className="terminal-prompt-text">Password: </span>
      }
      
      // Determine the correct home path based on current user
      const homePath = currentUser === 'root' ? '/root' : `/home/${terminalCredentials?.username}`
      const currentPath = filesystem?.getCurrentPath() || homePath
      
      // Create shorter, cleaner path display
      let shortPath = currentPath
      if (currentPath === homePath) {
        shortPath = '~'
      } else if (currentPath.startsWith(homePath + '/')) {
        shortPath = '~' + currentPath.substring(homePath.length)
      } else if (currentPath.startsWith('/home/')) {
        // Extract username from path like /home/username/Downloads -> ~/Downloads
        const pathParts = currentPath.split('/')
        if (pathParts.length >= 3) {
          const username = pathParts[2]
          if (pathParts.length === 3) {
            shortPath = '~'
          } else {
            shortPath = '~/' + pathParts.slice(3).join('/')
          }
        }
      }

      return (
        <span className="terminal-prompt-agnoster">
          <span className="terminal-prompt-segment terminal-prompt-segment--user">
            {currentUser}@{terminalCredentials?.hostname}
          </span>
          <span className="terminal-prompt-arrow"></span>
          <span className="terminal-prompt-segment terminal-prompt-segment--path">
            {shortPath}
          </span>
          <span className="terminal-prompt-separator"> </span>
        </span>
      )
    }
  }

  const renderTerminalLine = (line: TerminalLine, index: number) => {
    if (line.type === 'command') {
      // Parse the command line to extract prompt and command
      const promptMatch = line.content.match(/^([^:]+:[^ ]+ )(.+)$/)
      if (promptMatch) {
        const [, prompt, command] = promptMatch
        
        // Parse the prompt to extract user, host, and path
        const promptParts = prompt.split('@')
        const user = promptParts[0]
        const hostAndPath = promptParts[1]?.split(':')
        const host = hostAndPath?.[0]
        const path = hostAndPath?.[1]?.trim()
        
        return (
          <div key={index} className="terminal-output-line terminal-output-line--command">
            <div className="terminal-prompt-line-inside">
              <span className="terminal-prompt-agnoster">
                <span className="terminal-prompt-segment terminal-prompt-segment--user">
                  {user}@{host}
                </span>
                <span className="terminal-prompt-arrow"> </span>
                <span className="terminal-prompt-segment terminal-prompt-segment--path">
                  {path}
                </span>
                <span className="terminal-prompt-separator"> </span>
              </span>
              <span className="terminal-command-text">{command}</span>
            </div>
          </div>
        )
      } else {
        // Fallback for malformed command lines
        return (
          <div key={index} className="terminal-output-line terminal-output-line--command">
            <div className="terminal-prompt-line-inside">
              <span className="terminal-command-text">{line.content}</span>
            </div>
          </div>
        )
      }
    } else {
      return (
        <div key={index} className="terminal-output-line terminal-output-line--output">
          {line.content}
        </div>
      )
    }
  }


  // Handle login process
  const handleLogin = (input: string) => {
    if (!isPasswordMode) {
      // Username input - add to output and move to password mode
      addTerminalOutput(`${getCurrentPrompt()}${input}`, 'command')
      setCurrentUser(input)
      setIsPasswordMode(true)
    } else {
      // Password input - use credentials from terminal-user-info.json
      if (!terminalCredentials) {
        addTerminalOutput('Login incorrect')
        setIsPasswordMode(false)
        return
      }

      const passwords: { [key: string]: string } = {
        [terminalCredentials.username]: terminalCredentials.password,
        [terminalCredentials.root_username]: terminalCredentials.root_password
      }

      if (passwords[currentUser] === input) {
        setIsLoggedIn(true)
        setIsLoginMode(false)
        setIsPasswordMode(false)
        
        // Update filesystem user and set initial path based on user
        const homePath = currentUser === 'root' ? '/root' : `/home/${terminalCredentials?.username}`
        
        if (filesystem) {
          filesystem.setUser(currentUser)
          filesystem.setCurrentPath(homePath)
        } else {
          // If filesystem not loaded yet, create it now
          const fs = new FakeFileSystem(currentUser, terminalCredentials)
          fs.setCurrentPath(homePath)
          setFilesystem(fs)
        }
        
        addTerminalOutput(`Welcome to NixOS!`)
        addTerminalOutput(`Last login: ${new Date().toLocaleString()}`)
        
        // Create or update session after successful login
        const userId = userData?.username || userData?.name || 'anonymous'
        let currentSessionId = sessionId
        
        console.log('=== LOGIN SUCCESSFUL ===')
        console.log('User ID:', userId)
        console.log('Current User:', currentUser)
        console.log('Current Session ID:', currentSessionId)
        
        if (!currentSessionId) {
          // Create new session after login
          console.log('Creating NEW session...')
          currentSessionId = terminalCache.createSession(userId, currentUser)
          setSessionId(currentSessionId)
          console.log('✅ Created new session:', currentSessionId)
          
          // Update session with login state
          terminalCache.updateSession(currentSessionId, {
            isLoggedIn: true,
            currentPath: homePath,
            filesystemState: {
              currentUser: currentUser,
              currentPath: homePath,
              deletedFiles: filesystem ? filesystem.getDeletedFiles() : []
            }
          })
          console.log('✅ Updated session with login state')
        } else {
          // Update existing session
          console.log('Updating EXISTING session...')
          terminalCache.updateSession(currentSessionId, {
            isLoggedIn: true,
            currentPath: homePath,
            filesystemState: {
              currentUser: currentUser,
              currentPath: homePath,
              deletedFiles: filesystem ? filesystem.getDeletedFiles() : []
            }
          })
          console.log('✅ Updated existing session:', currentSessionId)
        }
        
        // Test cache immediately
        setTimeout(() => {
          const activeSession = terminalCache.getActiveSession()
          console.log('=== CACHE TEST AFTER LOGIN ===')
          console.log('Active Session:', activeSession)
          console.log('Session ID in state:', sessionId)
        }, 1000)
        
        // Force re-render to update prompt
        setTimeout(() => {
          // This will trigger a re-render and show the correct prompt
        }, 100)
      } else {
        setIsPasswordMode(false)
        addTerminalOutput(`Login incorrect`)
        // Don't add another prompt - the dynamic input will show it
      }
    }
  }

  // Handle password input for su command
  const handlePasswordInput = (password: string) => {
    if (!terminalCredentials) {
      addTerminalOutput('Login incorrect')
      setIsPasswordMode(false)
      return
    }

    // Check if password is correct for root user (since su root was called)
    if (terminalCredentials.root_password === password) {
      // Password correct - switch to root
      setCurrentUser(terminalCredentials.root_username)
      if (filesystem) {
        filesystem.setUser(terminalCredentials.root_username)
        filesystem.setCurrentPath('/root')
        // Clear permission cache when user switches
        filesystem.clearPermissionCache()
      }
      addTerminalOutput('Welcome to NixOS!')
      addTerminalOutput(`Last login: ${new Date().toLocaleString()}`)
      setIsPasswordMode(false)
    } else {
      // Password incorrect
      addTerminalOutput('Login incorrect')
      setIsPasswordMode(false)
    }
  }

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (isExpanded) {
      const outputArea = document.querySelector('.terminal-output-area')
      if (outputArea) {
        outputArea.scrollTop = outputArea.scrollHeight
      }
    }
  }, [terminalOutput, isExpanded])

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return

    const cmd = command.trim()
    
    // Expand terminal
    setIsExpanded(true)
    
    // Handle login mode
    if (isLoginMode) {
      handleLogin(cmd)
      setCommand('')
      return
    }

    // Handle password mode (for su command)
    if (isPasswordMode) {
      handlePasswordInput(cmd)
      setCommand('')
      return
    }

    // Add command to output with proper prompt
    const prompt = getCurrentPrompt()
    addTerminalOutput(`${prompt}${cmd}`, 'command')
    
    // Track command usage for game progression
    const [commandName, ...args] = cmd.split(' ')
    progressTracker.trackCommand(commandName, args)
    
    // Track path exploration
    if (filesystem) {
      progressTracker.trackPath(filesystem.getCurrentPath())
    }
    
    // Clear input field
    setCommand('')
    
    // Add to history
    setCommandHistory(prev => {
      const newHistory = [...prev, cmd]
      
      // Auto-save to cache when history changes
      if (sessionId && filesystem) {
        terminalCache.updateActiveSession({
          commandHistory: newHistory,
          terminalOutput: terminalOutput.map(line => line.content)
        })
      }
      
      return newHistory
    })
    setHistoryIndex(-1)

    // Handle commands using the unified terminalCommands system
    if (terminalCommands && filesystem) {
      const context: CommandContext = {
        userName: currentUser || userData?.name || 'Anonymous Developer',
        currentDate: new Date().toLocaleString(),
        commandHistory: commandHistory,
        sessionId: sessionId || undefined,
        commandCount: commandHistory.length,
        outputCount: terminalOutput.length,
        currentPath: filesystem?.getCurrentPath() || '',
        filesystem: filesystem,
        terminalCredentials: terminalCredentials!
      }
      
      const commandType = getCommandType(cmd, terminalCommands)
      console.log('Processing command:', cmd, 'Type:', commandType, 'Commands loaded:', !!terminalCommands, 'Available:', Object.keys(terminalCommands?.commands || {}))
      const response = processCommand(cmd, terminalCommands, context)
      console.log('Command response:', response)
      
      if (response !== null) {
        if (commandType === 'clear') {
          setTerminalOutput([])
          addTerminalOutput(getCurrentPrompt())
        } else if (commandType === 'exit') {
          if (typeof response === 'string') {
            addTerminalOutput(response)
          }
          setTimeout(() => {
            setIsExpanded(false)
            onClose()
          }, 2000)
        } else if (cmd === 'clear-cache') {
          // Handle clear-cache command
          terminalCache.clearAllSessions()
          if (typeof response === 'string') {
            addTerminalOutput(response)
          }
          setSessionId(null)
        } else if (response === '__SU_PASSWORD_MODE__') {
          // Handle su command - enter password mode
          setIsPasswordMode(true)
          // Don't add Password: as output - the prompt will show it
        } else if (response === '') {
          // Empty response (like cd) - just update prompt and cache
          if (sessionId && filesystem) {
            terminalCache.updateActiveSession({
              currentPath: filesystem.getCurrentPath(),
              filesystemState: {
                currentUser: filesystem.getCurrentUser(),
                currentPath: filesystem.getCurrentPath(),
                deletedFiles: filesystem ? filesystem.getDeletedFiles() : []
              }
            })
          }
        } else if (response && typeof response === 'object' && 'then' in response) {
          // Handle async commands (like ls, cat)
          response.then((result: string) => {
            if (result.includes('\n')) {
              const lines = result.split('\n')
              lines.forEach((line: string) => addTerminalOutput(line))
            } else {
              addTerminalOutput(result)
            }
            
            // Update cache after async command
            if (sessionId && filesystem) {
              terminalCache.updateActiveSession({
                currentPath: filesystem.getCurrentPath(),
                filesystemState: {
                  currentUser: filesystem.getCurrentUser(),
                  currentPath: filesystem.getCurrentPath(),
                  deletedFiles: filesystem ? filesystem.getDeletedFiles() : []
                }
              })
            }
          }).catch(error => {
            console.error('Command error:', error)
            addTerminalOutput(`Error: ${error.message}`)
          })
        } else if (typeof response === 'string') {
          // Handle multiline output
          if (response.includes('\n')) {
            const lines = response.split('\n')
            lines.forEach(line => addTerminalOutput(line))
          } else {
            addTerminalOutput(response)
          }
          
          // Auto-detect puzzle completion from command output
          progressTracker.detectPuzzleFromOutput(response)
        }
      } else {
        // Command not found
        addTerminalOutput(`Command not found: ${cmd}`)
        addTerminalOutput("Try 'help' for available commands.")
      }
    } else {
      // Fallback while commands are loading
      addTerminalOutput(`Command not found: ${cmd}`)
      addTerminalOutput("Try 'help' for available commands.")
    }

    setCommand('')
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCommand(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCommand('')
        } else {
          setHistoryIndex(newIndex)
          setCommand(commandHistory[newIndex])
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      console.log('🔍 Tab key pressed!')
      console.log('🔍 Command:', command)
      console.log('🔍 isLoginMode:', isLoginMode)
      console.log('🔍 autocomplete:', !!autocomplete)
      console.log('🔍 filesystem:', !!filesystem)
      
      // Only handle Tab completion if not in login mode
      if (!isLoginMode && autocomplete && filesystem) {
        console.log('🔍 All conditions met, proceeding with autocomplete')
        const cursorPosition = inputRef.current?.selectionStart || 0
        console.log('🔍 Calling autocomplete.handleTabCompletion with:', { command, cursorPosition })
        
        try {
          const result = await autocomplete.handleTabCompletion(command, cursorPosition)
          console.log('🔍 Autocomplete result:', result)
          
          if (result.suggestions.length > 0) {
            if (result.suggestions.length === 1) {
              // Single suggestion - complete it immediately
              const fullCommand = command + result.suggestions[0]
              console.log('✅ Single suggestion, setting command to:', fullCommand)
              setCommand(fullCommand)
              setShowInlineSuggestion(false)
              setSuggestionIndex(-1)
            } else {
              // Multiple suggestions - cycle through them
              if (!showInlineSuggestion) {
                // First Tab - show first suggestion
                const fullSuggestion = command + result.suggestions[0]
                console.log('✅ Multiple suggestions, showing first:', fullSuggestion)
                setCurrentSuggestion(fullSuggestion)
                setSuggestionIndex(0)
                setShowInlineSuggestion(true)
              } else {
                // Subsequent Tabs - cycle to next suggestion
                const nextIndex = (suggestionIndex + 1) % result.suggestions.length
                const fullSuggestion = command + result.suggestions[nextIndex]
                console.log('✅ Cycling to next suggestion:', fullSuggestion)
                setCurrentSuggestion(fullSuggestion)
                setSuggestionIndex(nextIndex)
              }
            }
          } else {
            // No suggestions - hide inline suggestion
            console.log('❌ No suggestions found')
            setShowInlineSuggestion(false)
            setSuggestionIndex(-1)
          }
        } catch (error) {
          console.error('❌ Error in autocomplete:', error)
          setShowInlineSuggestion(false)
          setSuggestionIndex(-1)
        }
      } else {
        console.log('❌ Conditions not met for autocomplete')
        console.log('❌ isLoginMode:', isLoginMode)
        console.log('❌ autocomplete:', !!autocomplete)
        console.log('❌ filesystem:', !!filesystem)
      }
    } else if (e.key === 'Escape') {
      // Hide inline suggestion on Escape
      setShowInlineSuggestion(false)
      setSuggestionIndex(-1)
    } else if (e.key === 'Enter' && showInlineSuggestion) {
      // Accept current suggestion on Enter
      e.preventDefault()
      setCommand(currentSuggestion)
      setShowInlineSuggestion(false)
      setSuggestionIndex(-1)
    } else if (showInlineSuggestion && (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete')) {
      // Hide suggestion when user types
      setShowInlineSuggestion(false)
      setSuggestionIndex(-1)
    }
    
    // Update cursor position after any key press
    setTimeout(() => {
      updateCursorPosition()
    }, 0)
  }

  // Focus input when clicking on footer
  const handleFooterClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle input changes and cursor position
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(e.target.value)
    setTimeout(() => {
      updateCursorPosition()
    }, 0)
  }

  const minimizeTerminal = () => {
    setIsExpanded(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={`terminal ${isExpanded ? 'terminal--expanded' : ''}`} onClick={handleFooterClick}>
      {/* Close Button - positioned top right */}
      <div 
        className="terminal-close-btn"
        onClick={minimizeTerminal}
        title="Close Terminal"
      >
        ✕
      </div>

      {/* Terminal Console - ASCII Art scrolls up when expanded */}
      <div className={`terminal-console ${isExpanded ? 'terminal-console--expanded' : ''}`}>

        
        {/* Terminal Output - appears below when ASCII scrolls up */}
        <div className={`terminal-output-area ${isExpanded ? 'terminal-output-area--visible' : ''}`}>
          <div className="terminal-output">
            {isRestoringSession && (
              <div className="terminal-output-line" style={{ color: '#00ff00' }}>
                Restoring session...
              </div>
            )}
            {sessionId && !isRestoringSession && (
              <div className="terminal-output-line" style={{ color: '#666', fontSize: '0.8em' }}>
                Session cached (ID: {sessionId.slice(-8)})
              </div>
            )}
            {terminalOutput.map((line, index) => renderTerminalLine(line, index))}
            
            {/* Dynamic Input Line - appears after the last output */}
            <div className="terminal-input-line terminal-input-line--current">
              <form onSubmit={handleCommandSubmit} className="terminal-form-inside">
                <div className="terminal-prompt-line-inside">
                  {getCurrentPromptJSX()}
                  <div className="terminal-input-container-inside">
                    <input
                      ref={inputRef}
                      type={isPasswordMode ? "password" : "text"}
                      value={command}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="terminal-input-inside-field"
                      placeholder=""
                      autoComplete="off"
                      spellCheck="false"
                    />
                    {/* Inline Autocomplete Suggestion */}
                    {showInlineSuggestion && currentSuggestion && !isLoginMode && (
                      <span 
                        className="terminal-inline-suggestion"
                        style={{
                          left: `${suggestionPosition}rem`
                        }}
                      >
                        {currentSuggestion.substring(command.length)}
                      </span>
                    )}
                    <span ref={cursorRef} className="terminal-cursor-dynamic">█</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Game Components - Only show when logged in AND game mode is enabled */}
      {isLoggedIn && gameManager.getGameState().isEnabled && (
        <GameInterface onGameModeToggle={(enabled) => {
          console.log('Game mode toggled:', enabled)
        }} />
      )}
      
      {isLoggedIn && gameManager.getGameState().isEnabled && (
        <>
          <GameProgress 
            isVisible={showGameProgress}
            onClose={() => setShowGameProgress(false)}
          />
          
          <VictoryScreen
            isVisible={showVictoryScreen}
            onClose={() => setShowVictoryScreen(false)}
          />
        </>
      )}

    </div>
  )
}
