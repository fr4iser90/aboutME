interface UserData {
  username: string
  name: string
  bio: string
  avatar: string
  location: string
  followers: number
  publicRepos: number
}

interface FooterMinimalProps {
  userData: UserData | null
  onTerminalOpen?: () => void
  showTerminalButton?: boolean
}

export default function FooterMinimal({ userData, onTerminalOpen, showTerminalButton = true }: FooterMinimalProps) {
  if (!userData) return null

  return (
    <footer className="footer footer--minimal">
      <div className="footer__container">
        <p className="footer__text">&copy; 2025 {userData.name}</p>
        
        {showTerminalButton && onTerminalOpen && (
          <button 
            className="footer-terminal-btn footer-terminal-btn--minimal"
            onClick={onTerminalOpen}
            title="Open Terminal"
          >
            <span className="footer-terminal-btn__icon">💻</span>
          </button>
        )}
      </div>
    </footer>
  )
}

