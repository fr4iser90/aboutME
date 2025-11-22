'use client'

import BaseSection from '@/features/shared/components/BaseSection'

interface TerminalSectionProps {
  id: string
  title: string
  children: React.ReactNode
  className?: string
}

export default function TerminalSection({ id, title, children, className = '' }: TerminalSectionProps) {
  return (
    <BaseSection 
      id={id} 
      title={title} 
      className={className}
      variant="terminal"
      showControls={true}
      showTypewriter={true}
    >
      {children}
    </BaseSection>
  )
}
