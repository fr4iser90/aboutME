'use client'

interface DashboardCardProps {
  title: string
  icon: string
  value: string | number
  description?: string
  onClick?: () => void
  color?: 'blue' | 'purple' | 'green' | 'pink' | 'cyan'
}

export default function DashboardCard({ 
  title, 
  icon, 
  value, 
  description, 
  onClick,
  color = 'blue'
}: DashboardCardProps) {
  return (
    <div 
      className={`glass-card dashboard-card dashboard-card--${color}`}
      onClick={onClick}
    >
      {/* Icon and Title */}
      <div className="dashboard-card__header">
        <span className="dashboard-card__icon">{icon}</span>
        <h3 className="dashboard-card__title">{title}</h3>
      </div>

      {/* Value */}
      <div className="dashboard-card__value">{value}</div>

      {/* Description */}
      {description && (
        <p className="dashboard-card__description">{description}</p>
      )}

      {/* Accent Border */}
      <div className="dashboard-card__accent" />
    </div>
  )
}
