/**
 * Block Move Handler
 * Handles moving blocks between slots
 * 
 * Created: 2025-01-XX
 */

import type { DetailLayoutConfig } from '@/features/portfolio/types/layouts'
import type { Block } from '@/features/portfolio/types/blocks'

/**
 * Move block from one slot to another
 */
export function moveBlockBetweenSlots(
  config: DetailLayoutConfig,
  blockId: string,
  fromSlot: string,
  toSlot: string,
  newIndex: number
): DetailLayoutConfig {
  // Find block in source slot
  const sourceSlot = config.slots[fromSlot as keyof typeof config.slots] as Block[] | undefined
  if (!sourceSlot) {
    console.warn(`Source slot ${fromSlot} not found`)
    return config
  }

  const blockIndex = sourceSlot.findIndex(b => b.id === blockId)
  if (blockIndex === -1) {
    console.warn(`Block ${blockId} not found in slot ${fromSlot}`)
    return config
  }

  // Get block
  const block = sourceSlot[blockIndex]

  // Remove block from source slot
  const newSourceSlot = [...sourceSlot]
  newSourceSlot.splice(blockIndex, 1)

  // Get target slot
  const targetSlot = config.slots[toSlot as keyof typeof config.slots] as Block[] | undefined
  const newTargetSlot = targetSlot ? [...targetSlot] : []

  // Insert block at new position
  if (newIndex === -1 || newIndex >= newTargetSlot.length) {
    // Append to end
    newTargetSlot.push(block)
  } else if (newIndex === 0) {
    // Insert at beginning
    newTargetSlot.unshift(block)
  } else {
    // Insert at specific position
    newTargetSlot.splice(newIndex, 0, block)
  }

  // Create new config
  const newSlots = { ...config.slots }
  newSlots[fromSlot as keyof typeof newSlots] = newSourceSlot.length > 0 ? newSourceSlot : undefined
  newSlots[toSlot as keyof typeof newSlots] = newTargetSlot.length > 0 ? newTargetSlot : undefined

  return {
    ...config,
    slots: newSlots
  }
}

