interface UserData {
  username: string
  name: string
  bio: string
  avatar: string
  location: string
  followers: number
  publicRepos: number
}

interface FooterCenteredProps {
  userData: UserData | null
  onTerminalOpen?: () => void
  showTerminalButton?: boolean
}

export default function FooterCentered({ userData, onTerminalOpen, showTerminalButton = true }: FooterCenteredProps) {
  if (!userData) return null

  return (
    <footer className="footer footer--centered">
      <div className="footer__container footer__container--centered">
        <p className="footer__text">&copy; 2025 {userData.name}. Built with Next.js and UnoCSS.</p>
        
        {showTerminalButton && onTerminalOpen && (
          <button 
            className="footer-terminal-btn"
            onClick={onTerminalOpen}
            title="Open Terminal"
          >
            <span className="footer-terminal-btn__icon">💻</span>
            <span className="footer-terminal-btn__text">Terminal</span>
          </button>
        )}
      </div>
    </footer>
  )
}

