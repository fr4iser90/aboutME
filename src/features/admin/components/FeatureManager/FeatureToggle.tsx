'use client'

interface FeatureToggleProps {
  name: string
  label: string
  description: string
  enabled: boolean
  disabled?: boolean
  warning?: string
  hasConfig?: boolean
  dependencies?: string[]
  onChange: (enabled: boolean) => void
  onConfigure?: () => void
}

export default function FeatureToggle({
  label,
  description,
  enabled,
  disabled = false,
  warning,
  hasConfig = false,
  dependencies = [],
  onChange,
  onConfigure,
}: FeatureToggleProps) {
  return (
    <div className={`glass-card feature-toggle ${disabled ? 'feature-toggle--disabled' : ''}`}>
      <div
        className={`feature-toggle__switch ${enabled ? 'feature-toggle__switch--enabled' : ''} ${disabled ? 'feature-toggle__switch--disabled' : ''}`}
        onClick={() => !disabled && onChange(!enabled)}
        role="switch"
        aria-checked={enabled}
        aria-disabled={disabled}
      >
        <div className="feature-toggle__switch-handle" />
      </div>

      <div className="feature-toggle__info">
        <div className="feature-toggle__header">
          <h4 className="feature-toggle__label">{label}</h4>
          {warning && (
            <span className="feature-toggle__warning" title={warning}>
              warn
            </span>
          )}
        </div>
        <p className="feature-toggle__description">{description}</p>
        {dependencies.length > 0 && (
          <p className="feature-toggle__dependencies">
            <span className="feature-toggle__dependencies-label">Requires:</span>{' '}
            <span className="feature-toggle__dependencies-list">
              {dependencies.join(', ')}
            </span>
          </p>
        )}
      </div>

      {hasConfig && onConfigure && (
        <button
          type="button"
          className="feature-toggle__config-btn"
          onClick={(e) => {
            e.stopPropagation()
            onConfigure()
          }}
        >
          Configure
        </button>
      )}

      <div
        className={`feature-toggle__status ${enabled ? 'feature-toggle__status--enabled' : ''}`}
      />
    </div>
  )
}
