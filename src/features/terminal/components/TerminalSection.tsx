'use client'

import BaseSection from '@/features/shared/components/BaseSection'

interface TerminalSectionProps {
  id: string
  title: string
  children: React.ReactNode
  className?: string
  /** Public portfolio uses simple chrome; terminal OS chrome is opt-in */
  chrome?: 'simple' | 'terminal'
}

export default function TerminalSection({
  id,
  title,
  children,
  className = '',
  chrome = 'simple',
}: TerminalSectionProps) {
  const isTerminal = chrome === 'terminal'
  return (
    <BaseSection
      id={id}
      title={title}
      className={className}
      variant={isTerminal ? 'terminal' : 'simple'}
      showControls={isTerminal}
      showTypewriter={isTerminal}
    >
      {children}
    </BaseSection>
  )
}
