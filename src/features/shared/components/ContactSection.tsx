interface UserData {
  username: string
  name: string
  bio: string
  avatar: string
  location: string
  followers: number
  publicRepos: number
}

interface ContactSectionProps {
  userData: UserData | null
}

export default function ContactSection({ userData }: ContactSectionProps) {
  if (!userData) return null

  return (
    <section id="contact" className="py-32 px-8 mt-20">
      <div className="max-w-6xl mx-auto text-center">
        <div className="hero-glass">
          <h2 className="text-5xl font-bold mb-12 neon-text">
            Let's Connect
          </h2>
          
          <p className="text-2xl text-gray-200 mb-20 leading-relaxed">
            Ready to build something together?
          </p>
          
          <div className="flex justify-center space-x-12">
            <a 
              href={`https://github.com/${userData.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon text-xl px-12 py-6"
            >
              GitHub
            </a>
            <a 
              href="mailto:contact@example.com"
              className="btn-neon text-xl px-12 py-6"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
