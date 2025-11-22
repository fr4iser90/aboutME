'use client'

interface BackgroundImageSelectorProps {
  value: string
  onChange: (image: string) => void
}

const availableImages = [
  { id: 'galaxy', path: '/assets/galaxy.png', name: 'Galaxy' },
  { id: 'sunset', path: '/assets/sunset.png', name: 'Sunset' },
  { id: 'ocean', path: '/assets/ocean.png', name: 'Ocean' },
  { id: 'forest', path: '/assets/forest.png', name: 'Forest' },
  { id: 'abstract-blue', path: '/assets/abstract-blue.png', name: 'Abstract Blue' },
  { id: 'abstract-green', path: '/assets/abstract-green.png', name: 'Abstract Green' },
  { id: 'light-cool', path: '/assets/light-cool.png', name: 'Light Cool' },
  { id: 'light-warm', path: '/assets/light-warm.png', name: 'Light Warm' },
  { id: 'cyberpunk-city', path: '/assets/cyberpunk-city.png', name: 'Cyberpunk City' },
  { id: 'none', path: '', name: 'None (Theme Background)' },
  { id: 'white', path: 'white', name: 'White (No Image)' },
  { id: 'transparent', path: 'transparent', name: 'Transparent' }
]

export default function BackgroundImageSelector({ value, onChange }: BackgroundImageSelectorProps) {
  return (
    <div className="background-image-selector">
      <label className="background-image-selector__label">
        Background Image:
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="background-image-selector__select"
        >
          <option value="">-- Select Background --</option>
          {availableImages.map((image) => (
            <option key={image.id} value={image.path || image.id}>
              {image.name}
            </option>
          ))}
        </select>
      </label>
      {value && value !== 'white' && value !== 'transparent' && value !== '' && (
        <div className="background-image-selector__preview">
          <img 
            src={value} 
            alt="Background preview" 
            className="background-image-selector__preview-image"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
    </div>
  )
}

