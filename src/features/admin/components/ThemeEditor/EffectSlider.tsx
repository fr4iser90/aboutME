'use client'

import { useState } from 'react'

export default function EffectSlider() {
  const [glassmorphism, setGlassmorphism] = useState({
    enabled: true,
    intensity: 50,
    blur: 10
  })
  const [shadows, setShadows] = useState({
    enabled: true,
    intensity: 50
  })
  const [gradients, setGradients] = useState(false)

  return (
    <div className="effect-slider">
      {/* Glassmorphism */}
      <div className="effect-slider__item">
        <div className="effect-slider__header">
          <label className="effect-slider__checkbox-label">
            <input
              type="checkbox"
              checked={glassmorphism.enabled}
              onChange={(e) => setGlassmorphism({ ...glassmorphism, enabled: e.target.checked })}
              className="effect-slider__checkbox"
            />
            <span>Glassmorphism</span>
          </label>
        </div>
        {glassmorphism.enabled && (
          <div className="effect-slider__controls">
            <label className="effect-slider__label">
              Intensity: {glassmorphism.intensity}%
              <input
                type="range"
                min="0"
                max="100"
                value={glassmorphism.intensity}
                onChange={(e) => setGlassmorphism({ ...glassmorphism, intensity: parseInt(e.target.value) })}
                className="effect-slider__slider"
              />
            </label>
            <label className="effect-slider__label">
              Blur: {glassmorphism.blur}px
              <input
                type="range"
                min="0"
                max="20"
                value={glassmorphism.blur}
                onChange={(e) => setGlassmorphism({ ...glassmorphism, blur: parseInt(e.target.value) })}
                className="effect-slider__slider"
              />
            </label>
          </div>
        )}
      </div>

      {/* Shadows */}
      <div className="effect-slider__item">
        <div className="effect-slider__header">
          <label className="effect-slider__checkbox-label">
            <input
              type="checkbox"
              checked={shadows.enabled}
              onChange={(e) => setShadows({ ...shadows, enabled: e.target.checked })}
              className="effect-slider__checkbox"
            />
            <span>Shadows</span>
          </label>
        </div>
        {shadows.enabled && (
          <div className="effect-slider__controls">
            <label className="effect-slider__label">
              Intensity: {shadows.intensity}%
              <input
                type="range"
                min="0"
                max="100"
                value={shadows.intensity}
                onChange={(e) => setShadows({ ...shadows, intensity: parseInt(e.target.value) })}
                className="effect-slider__slider"
              />
            </label>
          </div>
        )}
      </div>

      {/* Gradients */}
      <div className="effect-slider__item">
        <label className="effect-slider__checkbox-label">
          <input
            type="checkbox"
            checked={gradients}
            onChange={(e) => setGradients(e.target.checked)}
            className="effect-slider__checkbox"
          />
          <span>Gradients</span>
        </label>
      </div>
    </div>
  )
}

