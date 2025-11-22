/**
 * Terminal Hint System
 * 
 * This script manages subtle hints to encourage users to discover the terminal feature.
 * It triggers a gentle glow animation on the terminal button after 1 minute on the page,
 * and repeats every few minutes if the user hasn't clicked the terminal button yet.
 */

interface TerminalHintConfig {
  initialDelay: number // Time before first hint (in milliseconds)
  repeatInterval: number // Time between repeated hints (in milliseconds)
  animationDuration: number // Duration of the glow animation (in milliseconds)
  maxHints: number // Maximum number of hints to show
}

class TerminalHintManager {
  private config: TerminalHintConfig
  private hintCount: number = 0
  private hasClickedTerminal: boolean = false
  private timeouts: NodeJS.Timeout[] = []
  private terminalButton: HTMLElement | null = null

  constructor(config: Partial<TerminalHintConfig> = {}) {
    this.config = {
      initialDelay: 60000, // 1 minute
      repeatInterval: 180000, // 3 minutes
      animationDuration: 2000, // 2 seconds
      maxHints: 3, // Maximum 3 hints
      ...config
    }
  }

  /**
   * Initialize the terminal hint system
   */
  public init(): void {
    // Find the terminal button
    this.terminalButton = document.querySelector('.footer-terminal-btn')
    
    if (!this.terminalButton) {
      console.warn('Terminal button not found, hints disabled')
      return
    }

    // Track if user clicks the terminal button
    this.terminalButton.addEventListener('click', () => {
      this.hasClickedTerminal = true
      this.stop()
    })

    // Start the hint sequence
    this.scheduleNextHint(this.config.initialDelay)
  }

  /**
   * Schedule the next hint
   */
  private scheduleNextHint(delay: number): void {
    const timeout = setTimeout(() => {
      if (!this.hasClickedTerminal && this.hintCount < this.config.maxHints) {
        this.showHint()
        this.hintCount++
        
        // Schedule next hint if we haven't reached max hints
        if (this.hintCount < this.config.maxHints) {
          this.scheduleNextHint(this.config.repeatInterval)
        }
      }
    }, delay)

    this.timeouts.push(timeout)
  }

  /**
   * Show a hint by adding the glow animation
   */
  private showHint(): void {
    if (!this.terminalButton) return

    // Add the glow class
    this.terminalButton.classList.add('terminal-hint-glow')

    // Remove the glow class after animation duration
    setTimeout(() => {
      if (this.terminalButton) {
        this.terminalButton.classList.remove('terminal-hint-glow')
      }
    }, this.config.animationDuration)
  }

  /**
   * Stop all scheduled hints
   */
  public stop(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout))
    this.timeouts = []
    
    // Remove any active glow
    if (this.terminalButton) {
      this.terminalButton.classList.remove('terminal-hint-glow')
    }
  }

  /**
   * Reset the hint system (useful for testing or if user wants to see hints again)
   */
  public reset(): void {
    this.stop()
    this.hintCount = 0
    this.hasClickedTerminal = false
    this.init()
  }

  /**
   * Check if user has clicked the terminal button
   */
  public hasUserClickedTerminal(): boolean {
    return this.hasClickedTerminal
  }

  /**
   * Get current hint count
   */
  public getHintCount(): number {
    return this.hintCount
  }
}

// Create a singleton instance
let terminalHintManager: TerminalHintManager | null = null

/**
 * Initialize the terminal hint system
 */
export function initTerminalHints(config?: Partial<TerminalHintConfig>): TerminalHintManager {
  if (terminalHintManager) {
    terminalHintManager.stop()
  }
  
  terminalHintManager = new TerminalHintManager(config)
  terminalHintManager.init()
  
  return terminalHintManager
}

/**
 * Get the current terminal hint manager instance
 */
export function getTerminalHintManager(): TerminalHintManager | null {
  return terminalHintManager
}

/**
 * Stop all terminal hints
 */
export function stopTerminalHints(): void {
  if (terminalHintManager) {
    terminalHintManager.stop()
  }
}

/**
 * Reset terminal hints (useful for testing)
 */
export function resetTerminalHints(): void {
  if (terminalHintManager) {
    terminalHintManager.reset()
  }
}

export default TerminalHintManager
