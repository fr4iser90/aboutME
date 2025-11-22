'use client'

import { useState, useRef, useEffect } from 'react'

interface ScreenshotEditorProps {
  imageUrl: string
  onSave: (croppedUrl: string) => void
  onCancel: () => void
}

export default function ScreenshotEditor({ imageUrl, onSave, onCancel }: ScreenshotEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 })
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 })
  const [isCropping, setIsCropping] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [aspectRatio, setAspectRatio] = useState<string | null>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)

  const aspectRatioPresets = [
    { label: 'Free', value: null },
    { label: '1:1 (Square)', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '16:9', value: '16:9' },
    { label: '3:2', value: '3:2' },
    { label: '21:9', value: '21:9' },
  ]

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.onload = () => {
        // Initialize crop area to full image
        if (imageRef.current) {
          setCropEnd({
            x: imageRef.current.width,
            y: imageRef.current.height
          })
        }
      }
    }
  }, [imageUrl])

  // Apply aspect ratio constraint when cropping
  const applyAspectRatio = (width: number, height: number, ratio: number): { width: number; height: number } => {
    if (width / height > ratio) {
      return { width: height * ratio, height }
    } else {
      return { width, height: width / ratio }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    setIsDragging(true)
    setIsCropping(true)
    setCropStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setCropEnd({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    let newX = e.clientX - rect.left
    let newY = e.clientY - rect.top

    // Apply aspect ratio constraint if set
    if (aspectRatio) {
      const [w, h] = aspectRatio.split(':').map(Number)
      const ratio = w / h
      const width = Math.abs(newX - cropStart.x)
      const height = Math.abs(newY - cropStart.y)
      
      if (width > 0 && height > 0) {
        const constrained = applyAspectRatio(width, height, ratio)
        if (newX > cropStart.x) {
          newX = cropStart.x + constrained.width
        } else {
          newX = cropStart.x - constrained.width
        }
        if (newY > cropStart.y) {
          newY = cropStart.y + constrained.height
        } else {
          newY = cropStart.y - constrained.height
        }
      }
    }

    setCropEnd({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const applyFilters = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    const brightnessFactor = brightness / 100
    const contrastFactor = (contrast / 100) * 255
    const saturationFactor = saturation / 100

    for (let i = 0; i < data.length; i += 4) {
      // Brightness
      data[i] = Math.min(255, Math.max(0, data[i] * brightnessFactor))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * brightnessFactor))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * brightnessFactor))

      // Contrast
      data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * contrastFactor / 255) + 128))
      data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * contrastFactor / 255) + 128))
      data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * contrastFactor / 255) + 128))

      // Saturation (simplified)
      if (saturationFactor !== 1) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
        data[i] = Math.min(255, Math.max(0, gray + (data[i] - gray) * saturationFactor))
        data[i + 1] = Math.min(255, Math.max(0, gray + (data[i + 1] - gray) * saturationFactor))
        data[i + 2] = Math.min(255, Math.max(0, gray + (data[i + 2] - gray) * saturationFactor))
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const handleCrop = () => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    const x = Math.min(cropStart.x, cropEnd.x)
    const y = Math.min(cropStart.y, cropEnd.y)
    const width = Math.abs(cropEnd.x - cropStart.x)
    const height = Math.abs(cropEnd.y - cropStart.y)

    // Set canvas size to crop dimensions
    canvas.width = width
    canvas.height = height

    // Draw cropped image
    ctx.drawImage(
      img,
      x, y, width, height,
      0, 0, width, height
    )

    // Apply filters
    if (brightness !== 100 || contrast !== 100 || saturation !== 100) {
      applyFilters(ctx, width, height)
    }

    // Convert to blob URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        onSave(url)
      }
    }, 'image/png')
  }

  const handleResize = (newScale: number) => {
    setScale(Math.max(0.5, Math.min(2, newScale)))
  }

  const cropWidth = Math.abs(cropEnd.x - cropStart.x)
  const cropHeight = Math.abs(cropEnd.y - cropStart.y)

  return (
    <div className="screenshot-editor">
      <div className="screenshot-editor__header">
        <h3 className="screenshot-editor__title">Edit Screenshot</h3>
        <div className="screenshot-editor__controls">
          <label className="screenshot-editor__control">
            Scale:
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => handleResize(parseFloat(e.target.value))}
              className="screenshot-editor__slider"
            />
            <span>{Math.round(scale * 100)}%</span>
          </label>
        </div>
      </div>

      {/* Aspect Ratio Presets */}
      <div className="screenshot-editor__presets">
        <label className="screenshot-editor__preset-label">Aspect Ratio:</label>
        <div className="screenshot-editor__preset-buttons">
          {aspectRatioPresets.map((preset) => (
            <button
              key={preset.value || 'free'}
              onClick={() => setAspectRatio(preset.value)}
              className={`screenshot-editor__preset-btn ${aspectRatio === preset.value ? 'screenshot-editor__preset-btn--active' : ''}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="screenshot-editor__filters">
        <h4 className="screenshot-editor__filters-title">Filters</h4>
        <div className="screenshot-editor__filter-controls">
          <label className="screenshot-editor__filter-control">
            Brightness:
            <input
              type="range"
              min="0"
              max="200"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="screenshot-editor__slider"
            />
            <span>{brightness}%</span>
          </label>
          <label className="screenshot-editor__filter-control">
            Contrast:
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={(e) => setContrast(parseInt(e.target.value))}
              className="screenshot-editor__slider"
            />
            <span>{contrast}%</span>
          </label>
          <label className="screenshot-editor__filter-control">
            Saturation:
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => setSaturation(parseInt(e.target.value))}
              className="screenshot-editor__slider"
            />
            <span>{saturation}%</span>
          </label>
          <button
            onClick={() => {
              setBrightness(100)
              setContrast(100)
              setSaturation(100)
            }}
            className="screenshot-editor__reset-filters"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="screenshot-editor__canvas-container">
        <div 
          className="screenshot-editor__image-wrapper"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Screenshot to edit"
            className="screenshot-editor__image"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            draggable={false}
          />
          
          {isCropping && (
            <div
              className="screenshot-editor__crop-overlay"
              style={{
                left: Math.min(cropStart.x, cropEnd.x),
                top: Math.min(cropStart.y, cropEnd.y),
                width: cropWidth,
                height: cropHeight
              }}
            />
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div className="screenshot-editor__info">
        Crop: {Math.round(cropWidth)} × {Math.round(cropHeight)}px
        {aspectRatio && (
          <span className="screenshot-editor__aspect-ratio-info">
            {' '}• {aspectRatio}
          </span>
        )}
      </div>

      <div className="screenshot-editor__actions">
        <button
          onClick={onCancel}
          className="screenshot-editor__btn screenshot-editor__btn--secondary"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setIsCropping(false)
            setCropStart({ x: 0, y: 0 })
            setCropEnd({ x: 0, y: 0 })
          }}
          className="screenshot-editor__btn screenshot-editor__btn--secondary"
        >
          Reset Crop
        </button>
        <button
          onClick={handleCrop}
          className="screenshot-editor__btn screenshot-editor__btn--primary"
          disabled={cropWidth < 10 || cropHeight < 10}
        >
          ✂️ Crop & Save
        </button>
      </div>
    </div>
  )
}

