interface UserData {
  username: string
  name: string
  bio: string
  avatar: string
  location: string
  followers: number
  publicRepos: number
}

interface FooterDefaultProps {
  userData: UserData | null
  onTerminalOpen?: () => void
  showTerminalButton?: boolean
}

export default function FooterDefault({ userData, onTerminalOpen, showTerminalButton = true }: FooterDefaultProps) {
  if (!userData) return null

  return (
    <footer className="footer">
      <div className="footer__container">
        <p className="footer__text">&copy; 2025 {userData.name}. Built with Next.js and UnoCSS.</p>
        
        {/* Terminal Button */}
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

