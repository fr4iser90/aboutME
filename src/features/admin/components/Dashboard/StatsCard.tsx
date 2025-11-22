'use client'

import { useEffect, useState } from 'react'

interface StatsCardProps {
  label: string
  icon: string
  dataPath: string
  countKey?: string
  color?: 'blue' | 'purple' | 'green' | 'pink' | 'cyan'
}

export default function StatsCard({ 
  label, 
  icon, 
  dataPath,
  countKey = 'length',
  color = 'blue'
}: StatsCardProps) {
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(dataPath)
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const data = await response.json()
        
        // Count based on countKey
        if (countKey === 'length' && Array.isArray(data)) {
          setCount(data.length)
        } else if (data[countKey] !== undefined) {
          setCount(Array.isArray(data[countKey]) ? data[countKey].length : data[countKey])
        } else {
          setCount(0)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError('N/A')
        setLoading(false)
      }
    }

    fetchStats()
  }, [dataPath, countKey])

  return (
    <div className={`glass-card stats-card stats-card--${color}`}>
      {/* Icon */}
      <div className="stats-card__icon">{icon}</div>

      {/* Count */}
      <div className="stats-card__value">
        {loading ? '...' : error || count}
      </div>

      {/* Label */}
      <p className="stats-card__label">{label}</p>

      {/* Background Accent */}
      <div className="stats-card__background" />
    </div>
  )
}
