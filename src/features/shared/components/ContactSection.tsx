interface UserData {
  username: string
  name: string
  bio: string
  avatar: string
  location: string
  followers: number
  publicRepos: number
  email?: string
  github?: string
}

interface ContactSectionProps {
  userData: UserData | null
}

export default function ContactSection({ userData }: ContactSectionProps) {
  if (!userData) return null

  const githubUrl =
    userData.github ||
    (userData.username ? `https://github.com/${userData.username}` : null)
  const email = (userData as any).email || null

  return (
    <section id="contact" className="py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6 neon-text">Let's Connect</h2>
        <p className="text-lg text-gray-200 mb-10 leading-relaxed">
          Ready to build something together?
        </p>
        <div className="flex justify-center flex-wrap gap-6">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon text-lg px-8 py-4"
            >
              GitHub
            </a>
          )}
          {email ? (
            <a href={`mailto:${email}`} className="btn-neon text-lg px-8 py-4">
              Email
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}
