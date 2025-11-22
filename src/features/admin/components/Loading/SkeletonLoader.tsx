export default function SkeletonLoader({ 
  type = 'card', 
  count = 1 
}: { 
  type?: 'card' | 'text' | 'avatar' | 'button'
  count?: number 
}) {
  const skeletonStyle = {
    background: 'linear-gradient(90deg, var(--glass-bg) 0%, var(--glass-bg-hover) 50%, var(--glass-bg) 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px'
  }

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div 
            className="glass-card"
            style={{
              padding: 'var(--space-lg)',
              minHeight: '200px',
              ...skeletonStyle
            }}
          />
        )
      case 'text':
        return (
          <div
            style={{
              width: '100%',
              height: '1rem',
              ...skeletonStyle
            }}
          />
        )
      case 'avatar':
        return (
          <div
            style={{
              ...skeletonStyle,
              width: '40px',
              height: '40px',
              borderRadius: '50%'
            }}
          />
        )
      case 'button':
        return (
          <div
            style={{
              width: '120px',
              height: '40px',
              ...skeletonStyle
            }}
          />
        )
    }
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  )
}

