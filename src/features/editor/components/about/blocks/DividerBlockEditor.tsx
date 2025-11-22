'use client'

import { type AboutDividerBlock } from '../../../types/about'

interface DividerBlockEditorProps {
  block: AboutDividerBlock
  onUpdate: (block: AboutDividerBlock) => void
}

export default function DividerBlockEditor({ block, onUpdate }: DividerBlockEditorProps) {
  // Divider has no editable properties, just display
  return (
    <div className="about-divider-block-editor">
      <div className="about-divider-block-editor__divider">
        <hr />
      </div>
      <p className="about-divider-block-editor__info">
        This is a visual divider. No configuration needed.
      </p>
    </div>
  )
}

