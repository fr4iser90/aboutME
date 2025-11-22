// Terminal Cache Service - Simplified Version
// Handles session persistence and terminal state caching

export interface TerminalSession {
  id: string
  userId: string
  username: string
  isLoggedIn: boolean
  currentPath: string
  commandHistory: string[]
  terminalOutput: string[]
  filesystemState: {
    currentUser: string
    currentPath: string
    deletedFiles: string[] // Track deleted files for cache consistency
  }
  lastActivity: number
  createdAt: number
}

export interface TerminalCache {
  sessions: { [sessionId: string]: TerminalSession }
  activeSessionId: string | null
}

class TerminalCacheService {
  private readonly CACHE_KEY = 'terminal-cache'
  private readonly SESSION_TIMEOUT = 10 * 60 * 1000 // 10 minutes
  private readonly MAX_SESSIONS = 5 // Maximum number of cached sessions

  // Generate a unique session ID
  private generateSessionId(): string {
    const sessionId = `terminal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('Generated session ID:', sessionId)
    return sessionId
  }

  // Get cache from localStorage
  private getCache(): TerminalCache {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      console.log('Getting cache from localStorage:', cached)
      if (cached) {
        const cache: TerminalCache = JSON.parse(cached)
        console.log('Parsed cache:', cache)
        // Clean up expired sessions
        this.cleanupExpiredSessions(cache)
        return cache
      }
    } catch (error) {
      console.warn('Failed to load terminal cache:', error)
    }
    
    console.log('No cache found, returning empty cache')
    return {
      sessions: {},
      activeSessionId: null
    }
  }

  // Save cache to localStorage
  private saveCache(cache: TerminalCache): void {
    try {
      console.log('Saving cache to localStorage:', cache)
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
      console.log('Cache saved successfully')
    } catch (error) {
      console.warn('Failed to save terminal cache:', error)
    }
  }

  // Clean up expired sessions
  private cleanupExpiredSessions(cache: TerminalCache): void {
    console.log('Cleaning up expired sessions')
    const now = Date.now()
    const expiredSessions: string[] = []

    for (const [sessionId, session] of Object.entries(cache.sessions)) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        console.log('Session expired:', sessionId)
        expiredSessions.push(sessionId)
      }
    }

    // Remove expired sessions
    expiredSessions.forEach(sessionId => {
      delete cache.sessions[sessionId]
    })

    // If active session was expired, clear it
    if (cache.activeSessionId && expiredSessions.includes(cache.activeSessionId)) {
      console.log('Active session expired, clearing')
      cache.activeSessionId = null
    }

    // Limit number of sessions
    const sessionIds = Object.keys(cache.sessions)
    if (sessionIds.length > this.MAX_SESSIONS) {
      console.log('Too many sessions, removing oldest')
      // Sort by last activity and remove oldest
      const sortedSessions = sessionIds
        .map(id => ({ id, lastActivity: cache.sessions[id].lastActivity }))
        .sort((a, b) => a.lastActivity - b.lastActivity)

      const toRemove = sortedSessions.slice(0, sessionIds.length - this.MAX_SESSIONS)
      toRemove.forEach(session => {
        console.log('Removing old session:', session.id)
        delete cache.sessions[session.id]
        if (cache.activeSessionId === session.id) {
          cache.activeSessionId = null
        }
      })
    }
    
    console.log('Cleanup complete, remaining sessions:', Object.keys(cache.sessions).length)
  }

  // Create a new session
  createSession(userId: string, username: string): string {
    console.log('Creating new session for user:', userId, username)
    const cache = this.getCache()
    const sessionId = this.generateSessionId()
    
    const session: TerminalSession = {
      id: sessionId,
      userId,
      username,
      isLoggedIn: false,
      currentPath: '/home/fr4iser',
      commandHistory: [],
      terminalOutput: [],
      filesystemState: {
        currentUser: username,
        currentPath: '/home/fr4iser',
        deletedFiles: []
      },
      lastActivity: Date.now(),
      createdAt: Date.now()
    }

    console.log('Created session:', session)
    cache.sessions[sessionId] = session
    cache.activeSessionId = sessionId
    this.saveCache(cache)
    console.log('Saved cache with new session')

    return sessionId
  }

  // Get active session
  getActiveSession(): TerminalSession | null {
    const cache = this.getCache()
    console.log('Getting active session, cache:', cache)
    
    if (!cache.activeSessionId) {
      console.log('No active session ID')
      return null
    }
    
    const session = cache.sessions[cache.activeSessionId]
    console.log('Active session:', session)
    
    if (!session) {
      console.log('Session not found in cache')
      return null
    }

    // Check if session is still valid
    if (Date.now() - session.lastActivity > this.SESSION_TIMEOUT) {
      console.log('Session expired, clearing')
      this.clearActiveSession()
      return null
    }

    console.log('Returning valid active session')
    return session
  }

  // Update session data
  updateSession(sessionId: string, updates: Partial<TerminalSession>): boolean {
    const cache = this.getCache()
    const session = cache.sessions[sessionId]
    
    console.log('Updating session:', sessionId, 'updates:', updates)
    
    if (!session) {
      console.log('Session not found for update')
      return false
    }

    // Update session with new data
    Object.assign(session, updates, {
      lastActivity: Date.now()
    })

    console.log('Updated session:', session)
    cache.sessions[sessionId] = session
    this.saveCache(cache)
    console.log('Saved updated session to cache')
    return true
  }

  // Update active session
  updateActiveSession(updates: Partial<TerminalSession>): boolean {
    const cache = this.getCache()
    console.log('Updating active session, cache:', cache, 'updates:', updates)
    
    if (!cache.activeSessionId) {
      console.log('No active session ID to update')
      return false
    }
    
    return this.updateSession(cache.activeSessionId, updates)
  }

  // Save terminal state snapshot
  saveTerminalSnapshot(
    commandHistory: string[],
    terminalOutput: string[],
    currentPath: string,
    filesystemState: { currentUser: string; currentPath: string; deletedFiles: string[] }
  ): boolean {
    console.log('Saving terminal snapshot:', {
      commandHistory: commandHistory.length,
      terminalOutput: terminalOutput.length,
      currentPath,
      filesystemState
    })
    
    return this.updateActiveSession({
      commandHistory: [...commandHistory],
      terminalOutput: [...terminalOutput],
      currentPath,
      filesystemState: { ...filesystemState }
    })
  }

  // Restore terminal state from cache
  restoreTerminalState(): {
    commandHistory: string[]
    terminalOutput: string[]
    currentPath: string
    filesystemState: { currentUser: string; currentPath: string; deletedFiles: string[] }
    isLoggedIn: boolean
  } | null {
    const session = this.getActiveSession()
    console.log('Restoring terminal state from session:', session)
    
    if (!session) {
      console.log('No active session to restore')
      return null
    }

    console.log('Restoring state:', {
      commandHistory: session.commandHistory,
      terminalOutput: session.terminalOutput,
      currentPath: session.currentPath,
      filesystemState: session.filesystemState,
      isLoggedIn: session.isLoggedIn
    })

    return {
      commandHistory: [...session.commandHistory],
      terminalOutput: [...session.terminalOutput],
      currentPath: session.currentPath,
      filesystemState: { 
        ...session.filesystemState,
        deletedFiles: session.filesystemState.deletedFiles || []
      },
      isLoggedIn: session.isLoggedIn
    }
  }

  // Set active session
  setActiveSession(sessionId: string): boolean {
    console.log('Setting active session:', sessionId)
    const cache = this.getCache()
    if (!cache.sessions[sessionId]) {
      console.log('Session not found for activation')
      return false
    }

    cache.activeSessionId = sessionId
    this.saveCache(cache)
    console.log('Active session set successfully')
    return true
  }

  // Clear active session
  clearActiveSession(): void {
    console.log('Clearing active session')
    const cache = this.getCache()
    cache.activeSessionId = null
    this.saveCache(cache)
    console.log('Active session cleared')
  }

  // Get all sessions for a user
  getUserSessions(userId: string): TerminalSession[] {
    console.log('Getting sessions for user:', userId)
    const cache = this.getCache()
    const sessions = Object.values(cache.sessions)
      .filter(session => session.userId === userId)
      .sort((a, b) => b.lastActivity - a.lastActivity)
    
    console.log('Found sessions for user:', sessions.length)
    return sessions
  }

  // Delete a specific session
  deleteSession(sessionId: string): boolean {
    console.log('Deleting session:', sessionId)
    const cache = this.getCache()
    if (!cache.sessions[sessionId]) {
      console.log('Session not found for deletion')
      return false
    }

    delete cache.sessions[sessionId]
    
    if (cache.activeSessionId === sessionId) {
      cache.activeSessionId = null
    }

    this.saveCache(cache)
    console.log('Session deleted successfully')
    return true
  }

  // Clear all sessions
  clearAllSessions(): void {
    console.log('Clearing all sessions')
    const cache: TerminalCache = {
      sessions: {},
      activeSessionId: null
    }
    this.saveCache(cache)
    console.log('All sessions cleared')
  }

  // Check if user has active session
  hasActiveSession(userId: string): boolean {
    console.log('Checking for active session for user:', userId)
    const session = this.getActiveSession()
    const hasSession = session !== null && (session.userId === userId || session.username === userId)
    console.log('Has active session:', hasSession, 'Session:', session)
    console.log('User ID match:', session?.userId === userId, 'Username match:', session?.username === userId)
    return hasSession
  }

  // Get session info for display
  getSessionInfo(sessionId: string): {
    id: string
    username: string
    isLoggedIn: boolean
    lastActivity: string
    commandCount: number
  } | null {
    console.log('Getting session info for:', sessionId)
    const cache = this.getCache()
    const session = cache.sessions[sessionId]
    
    if (!session) {
      console.log('Session not found for info')
      return null
    }

    const info = {
      id: session.id,
      username: session.username,
      isLoggedIn: session.isLoggedIn,
      lastActivity: new Date(session.lastActivity).toLocaleString(),
      commandCount: session.commandHistory.length
    }
    
    console.log('Session info:', info)
    return info
  }

  // Auto-save terminal state (called periodically)
  autoSave(
    commandHistory: string[],
    terminalOutput: string[],
    currentPath: string,
    filesystemState: { currentUser: string; currentPath: string; deletedFiles: string[] },
    isLoggedIn: boolean
  ): void {
    console.log('Auto-saving terminal state:', {
      commandHistory: commandHistory.length,
      terminalOutput: terminalOutput.length,
      currentPath,
      filesystemState,
      isLoggedIn
    })
    
    this.updateActiveSession({
      commandHistory: [...commandHistory],
      terminalOutput: [...terminalOutput],
      currentPath,
      filesystemState: { ...filesystemState },
      isLoggedIn
    })
  }
}

// Export singleton instance
export const terminalCache = new TerminalCacheService()