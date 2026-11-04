'use client'

/**
 * In-flow hero for the public portfolio (replaces fixed floating window).
 */
interface UserData {
  name: string
  bio: string
  avatar_url: string
  followers?: number
  public_repos?: number
  location?: string
  username?: string
}

interface Props {
  userData: UserData
}

export default function InlineHero({ userData }: Props) {
  return (
    <section className="inline-hero" aria-label="Profile">
      <div className="inline-hero__card glass-card">
        {userData.avatar_url && (
          <img
            className="inline-hero__avatar"
            src={userData.avatar_url}
            alt={userData.name || userData.username || 'Avatar'}
          />
        )}
        <div className="inline-hero__body">
          <h1 className="inline-hero__name neon-text">
            {userData.name || userData.username}
          </h1>
          {userData.bio ? <p className="inline-hero__bio">{userData.bio}</p> : null}
          <div className="inline-hero__meta">
            {typeof userData.followers === 'number' && (
              <span>{userData.followers} followers</span>
            )}
            {typeof userData.public_repos === 'number' && (
              <span>{userData.public_repos} repos</span>
            )}
            {userData.location ? <span>{userData.location}</span> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
