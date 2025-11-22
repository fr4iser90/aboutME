'use client'

interface EffectSelectorProps {
  value: string
  onChange: (effect: string) => void
}

const availableEffects = [
  { id: 'glassmorphism', name: 'Glassmorphism', description: 'Glass effects with blur and transparency' },
  { id: 'flat', name: 'Flat', description: 'Solid backgrounds, no blur' },
  { id: 'minimal', name: 'Minimal', description: 'Minimal design, sharp edges' },
  { id: 'clean', name: 'Clean', description: 'Clean design, no effects' },
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Neon glows and cyberpunk style' },
  { id: 'neumorphism', name: 'Neumorphism', description: 'Soft shadows and neumorphic style' },
  { id: 'gradient', name: 'Gradient', description: 'Gradient backgrounds' },
  { id: 'skeuomorphism', name: 'Skeuomorphism', description: 'Realistic textures' },
  { id: 'brutalism', name: 'Brutalism', description: 'Bold, raw design' },
  { id: 'soft', name: 'Soft', description: 'Soft, rounded design' },
  { id: 'sharp', name: 'Sharp', description: 'Sharp, angular design' }
]

export default function EffectSelector({ value, onChange }: EffectSelectorProps) {
  return (
    <div className="effect-selector">
      <label className="effect-selector__label">
        Effect:
        <select
          value={value || 'glassmorphism'}
          onChange={(e) => onChange(e.target.value)}
          className="effect-selector__select"
        >
          {availableEffects.map((effect) => (
            <option key={effect.id} value={effect.id}>
              {effect.name}
            </option>
          ))}
        </select>
      </label>
      {value && (
        <p className="effect-selector__description">
          {availableEffects.find(e => e.id === value)?.description}
        </p>
      )}
    </div>
  )
}

