import Image from 'next/image'

interface UserData {
  username: string
  name: string
  bio: string
  avatar: string
  location: string
  followers: number
  publicRepos: number
}

interface HeroSectionProps {
  userData: UserData | null
}

export default function HeroSection({ userData }: HeroSectionProps) {
  if (!userData) return null

  return (
    <section className="pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="hero-glass text-center mb-8 relative" style={{ zIndex: 'var(--z-content)' }}>
          <div className="avatar-neon mb-6">
            <Image
              src={userData.avatar}
              alt={userData.name}
              width={112}
              height={112}
              className="w-28 h-28 rounded-full mx-auto border-2 border-white/20"
            />
          </div>
          
          <h1 className="text-5xl font-bold mb-4 neon-text">
            {userData.name}
          </h1>
          
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            {userData.bio}
          </p>
          
          <div className="flex justify-center space-x-8 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <span>📍</span>
              <span>{userData.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>👥</span>
              <span>{userData.followers} followers</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📁</span>
              <span>{userData.publicRepos} repositories</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

