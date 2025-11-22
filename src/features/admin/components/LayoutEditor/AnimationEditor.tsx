'use client'

import { useState } from 'react'
import type { DetailPageLayoutConfig, DetailLayoutConfig } from '@/features/portfolio/types/layouts'
import type { Block, AnimationType, AnimationConfig } from '@/features/portfolio/types/blocks'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'
import { getBlockDisplayName } from '@/features/admin/utils/blockDisplayName'

interface AnimationEditorProps {
  config: DetailPageLayoutConfig | DetailLayoutConfig
  onConfigUpdate: (newConfig: DetailPageLayoutConfig | DetailLayoutConfig) => void
  markdownSections?: MarkdownSection[]
}

const animationTypes: Array<{ type: AnimationType; label: string }> = [
  { type: 'none', label: 'None' },
  { type: 'fade-in', label: 'Fade In' },
  { type: 'fade-out', label: 'Fade Out' },
  { type: 'slide-up', label: 'Slide Up' },
  { type: 'slide-down', label: 'Slide Down' },
  { type: 'slide-left', label: 'Slide Left' },
  { type: 'slide-right', label: 'Slide Right' },
  { type: 'zoom-in', label: 'Zoom In' },
  { type: 'zoom-out', label: 'Zoom Out' },
  { type: 'bounce-in', label: 'Bounce In' },
  { type: 'bounce-out', label: 'Bounce Out' },
  { type: 'rotate-in', label: 'Rotate In' },
  { type: 'stagger', label: 'Stagger' },
  { type: 'count-up', label: 'Count Up' }
]

const easingOptions = [
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'linear',
  'cubic-bezier(0.4, 0, 0.2, 1)',
  'cubic-bezier(0.4, 0, 1, 1)',
  'cubic-bezier(0, 0, 0.2, 1)'
]

export default function AnimationEditor({
  config,
  onConfigUpdate,
  markdownSections
}: AnimationEditorProps) {
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [globalAnimation, setGlobalAnimation] = useState<{
    enabled: boolean
    defaultType: AnimationType
    defaultDuration: number
    defaultDelay: number
  }>({
    enabled: true,
    defaultType: 'fade-in',
    defaultDuration: 500,
    defaultDelay: 0
  })

  const getAllBlocks = (): Block[] => {
    const allBlocks: Block[] = []
    Object.values(config.slots).forEach(slot => {
      if (slot) {
        allBlocks.push(...slot)
      }
    })
    return allBlocks
  }

  const handleGlobalAnimationChange = (updates: Partial<typeof globalAnimation>) => {
    const newGlobal = { ...globalAnimation, ...updates }
    setGlobalAnimation(newGlobal)

    // Apply to all blocks without animations
    const allBlocks = getAllBlocks()
    const newConfig: DetailLayoutConfig = {
      ...config,
      slots: Object.fromEntries(
        Object.entries(config.slots).map(([key, blocks]) => [
          key,
          blocks?.map(block => {
            if (!block.animation && newGlobal.enabled) {
              return {
                ...block,
                animation: {
                  type: newGlobal.defaultType,
                  duration: newGlobal.defaultDuration,
                  delay: newGlobal.defaultDelay,
                  easing: 'ease-in-out'
                }
              }
            }
            return block
          })
        ])
      ) as DetailLayoutConfig['slots']
    }
    onConfigUpdate(newConfig)
  }

  const handleBlockAnimationChange = (blockId: string, animation: AnimationConfig | null) => {
    const allBlocks = getAllBlocks()
    const block = allBlocks.find(b => b.id === blockId)
    if (!block) return

    const slotKey = Object.keys(config.slots).find(key => 
      config.slots[key as keyof typeof config.slots]?.some(b => b.id === blockId)
    )
    if (!slotKey) return

    const newConfig: DetailLayoutConfig = {
      ...config,
      slots: {
        ...config.slots,
        [slotKey]: config.slots[slotKey as keyof typeof config.slots]?.map(b =>
          b.id === blockId
            ? { ...b, animation: animation || undefined }
            : b
        )
      }
    }
    onConfigUpdate(newConfig)
  }

  const allBlocks = getAllBlocks()

  return (
    <div className="animation-editor">
      {/* Global Animation Settings */}
      <div className="animation-editor__global">
        <h3 className="animation-editor__section-title">Global Animation Settings</h3>
        <div className="animation-editor__global-controls">
          <label className="animation-editor__checkbox-label">
            <input
              type="checkbox"
              checked={globalAnimation.enabled}
              onChange={(e) => handleGlobalAnimationChange({ enabled: e.target.checked })}
              className="animation-editor__checkbox"
            />
            <span>Enable animations</span>
          </label>
          {globalAnimation.enabled && (
            <>
              <label className="animation-editor__label">
                Default Type:
                <select
                  value={globalAnimation.defaultType}
                  onChange={(e) => handleGlobalAnimationChange({ defaultType: e.target.value as AnimationType })}
                  className="animation-editor__select"
                >
                  {animationTypes.map((at) => (
                    <option key={at.type} value={at.type}>
                      {at.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="animation-editor__label">
                Default Duration (ms):
                <input
                  type="number"
                  value={globalAnimation.defaultDuration}
                  onChange={(e) => handleGlobalAnimationChange({ defaultDuration: parseInt(e.target.value) || 500 })}
                  className="animation-editor__input"
                  min="0"
                  step="50"
                />
              </label>
              <label className="animation-editor__label">
                Default Delay (ms):
                <input
                  type="number"
                  value={globalAnimation.defaultDelay}
                  onChange={(e) => handleGlobalAnimationChange({ defaultDelay: parseInt(e.target.value) || 0 })}
                  className="animation-editor__input"
                  min="0"
                  step="50"
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Per-Block Animation Settings */}
      <div className="animation-editor__blocks">
        <h3 className="animation-editor__section-title">Block Animations</h3>
        {allBlocks.length === 0 ? (
          <p className="animation-editor__empty">No blocks to animate. Add blocks first.</p>
        ) : (
          <div className="animation-editor__blocks-list">
            {allBlocks.map((block) => (
              <div key={block.id} className="animation-editor__block-item">
                <div className="animation-editor__block-header">
                  <span className="animation-editor__block-title">
                    {getBlockDisplayName(block, markdownSections)}
                  </span>
                </div>
                <div className="animation-editor__block-controls">
                  <label className="animation-editor__label">
                    Type:
                    <select
                      value={block.animation?.type || 'none'}
                      onChange={(e) => {
                        const type = e.target.value as AnimationType
                        if (type === 'none') {
                          handleBlockAnimationChange(block.id, null)
                        } else {
                          handleBlockAnimationChange(block.id, {
                            type,
                            delay: block.animation?.delay || globalAnimation.defaultDelay,
                            duration: block.animation?.duration || globalAnimation.defaultDuration,
                            easing: block.animation?.easing || 'ease-in-out'
                          })
                        }
                      }}
                      className="animation-editor__select"
                    >
                      {animationTypes.map((at) => (
                        <option key={at.type} value={at.type}>
                          {at.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {block.animation && block.animation.type !== 'none' && (
                    <>
                      <label className="animation-editor__label">
                        Delay (ms):
                        <input
                          type="number"
                          value={block.animation.delay || 0}
                          onChange={(e) => handleBlockAnimationChange(block.id, {
                            ...block.animation!,
                            delay: parseInt(e.target.value) || 0
                          })}
                          className="animation-editor__input"
                          min="0"
                          step="50"
                        />
                      </label>
                      <label className="animation-editor__label">
                        Duration (ms):
                        <input
                          type="number"
                          value={block.animation.duration || 500}
                          onChange={(e) => handleBlockAnimationChange(block.id, {
                            ...block.animation!,
                            duration: parseInt(e.target.value) || 500
                          })}
                          className="animation-editor__input"
                          min="0"
                          step="50"
                        />
                      </label>
                      <label className="animation-editor__label">
                        Easing:
                        <select
                          value={block.animation.easing || 'ease-in-out'}
                          onChange={(e) => handleBlockAnimationChange(block.id, {
                            ...block.animation!,
                            easing: e.target.value
                          })}
                          className="animation-editor__select"
                        >
                          {easingOptions.map((easing) => (
                            <option key={easing} value={easing}>
                              {easing}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

