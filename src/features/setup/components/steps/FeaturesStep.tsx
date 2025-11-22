/**
 * Features Step Component
 * 
 * Step 3: Enable or disable portfolio features
 * 
 * Design: Option 6 - Compact 2-Column Grid per Category
 */

'use client';

import { useState, useEffect, useRef } from 'react';

interface FeaturesStepProps {
  config: {
    features?: {
      projects: boolean;
      skills: boolean;
      aboutMe: boolean;
      blog: boolean;
      terminal: boolean;
      auth: boolean;
      editor: boolean;
      fileUpload: boolean;
      guestbook: boolean;
    };
    auth?: {
      adminPassword: string;
      adminPasswordConfirm: string;
      passwordAlreadySet?: boolean;
    };
  };
  onUpdate: (config: Partial<FeaturesStepProps['config']>) => void;
}

interface Feature {
  key: string;
  icon: string;
  label: string;
  description: string;
  requiresAuth?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: Feature[];
}

export default function FeaturesStep({ config, onUpdate }: FeaturesStepProps) {
  const [features, setFeatures] = useState(() => config?.features || {
    projects: true,
    skills: true,
    aboutMe: true,
    blog: false,
    terminal: false,
    auth: false,
    editor: false,
    fileUpload: false,
    guestbook: false,
  });
  const [auth, setAuth] = useState(() => {
    const authConfig = config?.auth || {
      adminPassword: '',
      adminPasswordConfirm: '',
      passwordAlreadySet: false,
    };
    // If password is already set, show placeholder asterisks
    if (authConfig.passwordAlreadySet) {
      return {
        adminPassword: '************',
        adminPasswordConfirm: '************',
        passwordAlreadySet: true,
      };
    }
    return authConfig;
  });
  const [showAuthSection, setShowAuthSection] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const authSectionRef = useRef<HTMLDivElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const passwordConfirmInputRef = useRef<HTMLInputElement>(null);
  const wasAuthEnabledRef = useRef(false);

  const categories: Category[] = [
    {
      id: 'content',
      name: 'Content Management',
      icon: '📝',
      description: 'Core portfolio content sections',
      features: [
        { key: 'projects', icon: '📁', label: 'Projects', description: 'Showcase your GitHub repositories' },
        { key: 'skills', icon: '🛠️', label: 'Skills', description: 'Display your technical skills' },
        { key: 'aboutMe', icon: '👤', label: 'About Me', description: 'Personal information and bio' },
        { key: 'blog', icon: '📝', label: 'Blog', description: 'Blog posts and articles' },
      ],
    },
    {
      id: 'interactive',
      name: 'Interactive Features',
      icon: '🎨',
      description: 'User engagement and interaction',
      features: [
        { key: 'terminal', icon: '💻', label: 'Terminal', description: 'Interactive terminal game' },
      ],
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      icon: '🔐',
      description: 'Admin access with all management tools (Layout, Theme, Appearance, Content Editor, Features, Settings)',
      features: [
        { key: 'auth', icon: '🔐', label: 'Admin Dashboard', description: 'Admin access with all management tools' },
      ],
    },
    {
      id: 'admin-optional',
      name: 'Optional Admin Features',
      icon: '⚙️',
      description: 'Additional admin features (require Admin Dashboard)',
      features: [
        { key: 'fileUpload', icon: '📤', label: 'Media Library', description: 'File upload and media management', requiresAuth: true },
        { key: 'guestbook', icon: '📋', label: 'Guestbook', description: 'Visitor comments and moderation', requiresAuth: true },
      ],
    },
  ];

  const handleFeatureChange = (featureName: string, enabled?: boolean) => {
    try {
      const currentState = features[featureName as keyof typeof features] || false;
      const newState = enabled !== undefined ? enabled : !currentState;
      
      const newFeatures = { ...features };
      newFeatures[featureName as keyof typeof newFeatures] = newState;

      // Auto-enable auth (Admin Dashboard) for features that require it
      if (featureName === 'fileUpload' && newState) {
        newFeatures.auth = true;
        setShowAuthSection(true);
      }
      if (featureName === 'guestbook' && newState) {
        newFeatures.auth = true;
        setShowAuthSection(true);
      }
      
      // When Admin Dashboard is enabled, also enable Content Editor (it's part of the package)
      if (featureName === 'auth' && newState) {
        newFeatures.editor = true; // Content Editor is part of Admin Dashboard package
        setShowAuthSection(true);
        wasAuthEnabledRef.current = true;
      }
      
      // Disable dependent features when Admin Dashboard is disabled
      if (featureName === 'auth' && !newState) {
        newFeatures.editor = false;
        newFeatures.fileUpload = false;
        newFeatures.guestbook = false;
        setShowAuthSection(false);
      }

      setFeatures(newFeatures);
      if (onUpdate) {
        onUpdate({ features: newFeatures, auth });
      }
    } catch (error) {
      console.error('Error in handleFeatureChange:', error);
    }
  };

  const validatePassword = (password: string, passwordConfirm: string) => {
    // If password is already set (showing asterisks), consider it valid
    if (auth.passwordAlreadySet && password === '************' && passwordConfirm === '************') {
      setPasswordError(null);
      setIsPasswordValid(true);
      return true;
    }
    
    // Clear error if both fields are empty
    if (password.length === 0 && passwordConfirm.length === 0) {
      setPasswordError(null);
      setIsPasswordValid(false);
      return false;
    }
    
    const errors: string[] = [];
    
    // Validate minimum length
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    
    // Must contain uppercase letters
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter (A-Z)');
    }
    
    // Must contain lowercase letters
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter (a-z)');
    }
    
    // Must contain numbers
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number (0-9)');
    }
    
    // Must contain special characters
    if (!/[!@#$%^&*()_+=\-\[\]{};':"\\|,.<>?]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*...)');
    }
    
    // Validate password match (only if both fields have content)
    if (passwordConfirm.length > 0 && password !== passwordConfirm) {
      errors.push('Passwords do not match');
    }
    
    // Set error message (show all errors)
    if (errors.length > 0) {
      setPasswordError(errors.join(' • '));
      setIsPasswordValid(false);
      return false;
    }
    
    // Success: both valid and match
    if (password.length >= 12 && password === passwordConfirm && passwordConfirm.length > 0) {
      setPasswordError(null);
      setIsPasswordValid(true);
      return true;
    }
    
    // No error yet, but not fully valid
    setPasswordError(null);
    setIsPasswordValid(false);
    return false;
  };

  const handleAuthChange = (field: 'adminPassword' | 'adminPasswordConfirm', value: string) => {
    try {
      // If user starts typing and password was already set, clear the flag
      let newAuth = { ...auth, [field]: value };
      if (auth.passwordAlreadySet && value !== '************' && value.length > 0) {
        // User is entering a new password, clear the flag
        newAuth.passwordAlreadySet = false;
        // If the other field still has asterisks, clear it too
        if (field === 'adminPassword' && newAuth.adminPasswordConfirm === '************') {
          newAuth.adminPasswordConfirm = '';
        } else if (field === 'adminPasswordConfirm' && newAuth.adminPassword === '************') {
          newAuth.adminPassword = '';
        }
      }
      
      setAuth(newAuth);
      
      // Validate password
      const password = field === 'adminPassword' ? value : newAuth.adminPassword;
      const passwordConfirm = field === 'adminPasswordConfirm' ? value : newAuth.adminPasswordConfirm;
      validatePassword(password, passwordConfirm);
      
      if (onUpdate) {
        onUpdate({ features, auth: newAuth });
      }
    } catch (error) {
      console.error('Error in handleAuthChange:', error);
    }
  };

  const handlePasswordBlur = () => {
    // Re-validate on blur
    validatePassword(auth.adminPassword, auth.adminPasswordConfirm);
  };

  // Auto-expand, auto-scroll, and auto-focus when Auth is enabled
  useEffect(() => {
    if (features.auth && !wasAuthEnabledRef.current) {
      // Auto-expand
      setShowAuthSection(true);
      wasAuthEnabledRef.current = true;
      
      // Auto-scroll to auth section (smooth)
      setTimeout(() => {
        if (authSectionRef.current) {
          authSectionRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
      
      // Auto-focus on password field (only if password is not already set)
      if (!auth.passwordAlreadySet) {
        setTimeout(() => {
          if (passwordInputRef.current) {
            passwordInputRef.current.focus();
          }
        }, 300);
      }
    }
  }, [features.auth, auth.passwordAlreadySet]);

  // Validate password on mount if it's already set
  useEffect(() => {
    if (auth.passwordAlreadySet) {
      validatePassword(auth.adminPassword, auth.adminPasswordConfirm);
    }
  }, []); // Only run on mount

  // Update auth state when config changes (e.g., when navigating back)
  useEffect(() => {
    if (config?.auth?.passwordAlreadySet && !auth.passwordAlreadySet) {
      // Password was set while we were away, update state to show asterisks
      setAuth({
        adminPassword: '************',
        adminPasswordConfirm: '************',
        passwordAlreadySet: true,
      });
      setIsPasswordValid(true);
      setPasswordError(null);
    }
  }, [config?.auth?.passwordAlreadySet]);

  const getEnabledCount = (categoryFeatures: Feature[]) => {
    return categoryFeatures.filter(f => features[f.key as keyof typeof features]).length;
  };

  const getTotalEnabled = () => {
    // Count enabled features, but don't count editor separately (it's part of Admin Dashboard)
    const featuresToCount = { ...features };
    // If auth is enabled, editor is automatically enabled (part of package), but we don't count it separately
    const count = Object.entries(featuresToCount).filter(([key, value]) => {
      // Don't count editor separately if auth is enabled (it's part of the package)
      if (key === 'editor' && features.auth) {
        return false;
      }
      return value === true;
    }).length;
    return count;
  };

  const isFeatureDisabled = (feature: Feature) => {
    if (feature.requiresAuth && !features.auth) {
      return true;
    }
    return false;
  };

  return (
    <div className="glass-card setup-page__form">
      <h3 className="setup-page__form-title">⚙️ Features</h3>
      <p className="setup-page__form-description">
        Configure which portfolio features to enable
      </p>

      {/* Two-Column Layout */}
      <div className="setup-page__two-column setup-page__two-column--features">
        {/* Left Column: Features List */}
        <div className="setup-page__two-column-left">
          <div className="setup-page__features-container">
            <div className="setup-form">
          {/* Categories */}
          {categories.map((category) => {
            const enabledCount = getEnabledCount(category.features);
            const totalCount = category.features.length;

            return (
              <div key={category.id} className="setup-page__feature-category">
                <div className="setup-page__feature-category-header">
                  <div className="setup-page__feature-category-title">
                    <span className="setup-page__feature-category-icon">{category.icon}</span>
                    <span className="setup-page__feature-category-name">{category.name}</span>
                  </div>
                  <span className="setup-page__feature-category-count">
                    {enabledCount}/{totalCount}
                  </span>
                </div>
                <p className="setup-page__feature-category-description">{category.description}</p>

                {/* 2-Column Grid per Category */}
                <div className="setup-page__feature-category-grid">
                  {category.features.map((feature) => {
                    const isEnabled = features[feature.key as keyof typeof features] || false;
                    const isDisabled = isFeatureDisabled(feature);

                    return (
                      <div
                        key={feature.key}
                        className={`setup-page__feature-card ${
                          isEnabled ? 'setup-page__feature-card--enabled' : ''
                        } ${isDisabled ? 'setup-page__feature-card--disabled' : ''}`}
                        onClick={() => !isDisabled && handleFeatureChange(feature.key)}
                      >
                        <div className="setup-page__feature-card-header">
                          <div className="setup-page__feature-icon">
                            {feature.icon}
                          </div>
                          <div className="setup-page__feature-toggle" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => !isDisabled && handleFeatureChange(feature.key, e.target.checked)}
                              disabled={isDisabled}
                            />
                          </div>
                        </div>
                        <div className="setup-page__feature-content">
                          <h5 className="setup-page__feature-label">{feature.label}</h5>
                          <p className="setup-page__feature-description">{feature.description}</p>
                          {feature.requiresAuth && (
                            <span className="setup-page__feature-dependency">
                              Requires Admin Dashboard
                            </span>
                          )}
                          {feature.key === 'auth' && (
                            <div style={{ 
                              marginTop: 'var(--space-xs)',
                              fontSize: '0.7rem',
                              color: 'var(--neon-blue)',
                              lineHeight: '1.3'
                            }}>
                              Includes: Layout, Theme, Appearance, Content Editor, Features, Settings
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

            {/* Summary */}
            <div className="setup-page__feature-summary">
              <span className="setup-page__feature-summary-text">
                📊 {getTotalEnabled()}/7 features enabled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Settings Panel */}
        <div className="setup-page__two-column-right setup-page__features-settings">
          {/* Summary Card */}
          <div className="glass-card setup-page__form setup-page__form--compact">
            <h3 className="setup-page__form-title setup-page__form-title--compact">📊 Summary</h3>
            <div className="setup-page__summary-grid">
              <div className="setup-page__summary-item">
                <div className="setup-page__summary-label">Enabled</div>
                <div className="setup-page__summary-value">{getTotalEnabled()}</div>
              </div>
              <div className="setup-page__summary-item">
                <div className="setup-page__summary-label">Total</div>
                <div className="setup-page__summary-value">7</div>
              </div>
            </div>
          </div>

          {/* Auth Password Section */}
          {features.auth ? (
            <div 
              ref={authSectionRef}
              className={`glass-card setup-page__form setup-page__form--compact setup-page__auth-section ${showAuthSection ? 'setup-page__auth-section--expanded' : ''} ${passwordError ? 'setup-page__auth-section--error' : ''}`}
            >
              <button
                type="button"
                className="setup-page__auth-section-toggle"
                onClick={() => setShowAuthSection(!showAuthSection)}
              >
                <span>🔐 Admin Password</span>
                <span className="setup-page__auth-section-toggle-icon">
                  {showAuthSection ? '▼' : '▶'}
                </span>
              </button>

              {showAuthSection && (
                <div className="setup-page__auth-section-content">
                  <div className="setup-form__field">
                    <label 
                      className="setup-form__label"
                      htmlFor="admin-password-input"
                    >
                      Password (min 12 chars: A-Z, a-z, 0-9, special)
                    </label>
                    <input
                      ref={passwordInputRef}
                      id="admin-password-input"
                      type="password"
                      className={`setup-form__input ${
                        features.auth && !isPasswordValid && !passwordError ? 'setup-form__input--highlight' : ''
                      } ${
                        isPasswordValid ? 'setup-form__input--success' : ''
                      } ${
                        passwordError ? 'setup-form__input--error' : ''
                      }`}
                      value={auth.adminPassword}
                      onChange={(e) => handleAuthChange('adminPassword', e.target.value)}
                      onFocus={(e) => {
                        // If showing asterisks, clear field when user focuses
                        if (auth.passwordAlreadySet && e.target.value === '************') {
                          setAuth({ ...auth, adminPassword: '', passwordAlreadySet: false });
                        }
                      }}
                      onBlur={handlePasswordBlur}
                      placeholder={auth.passwordAlreadySet ? "Password already set (click to change)" : "Enter admin password"}
                      aria-invalid={passwordError ? 'true' : 'false'}
                      aria-describedby={passwordError ? 'password-error' : isPasswordValid ? 'password-success' : undefined}
                      autoComplete="new-password"
                    />
                    {passwordError && (
                      <p 
                        id="password-error"
                        className="setup-form__error"
                        role="alert"
                        aria-live="polite"
                      >
                        {passwordError}
                      </p>
                    )}
                    {isPasswordValid && !passwordError && (
                      <p 
                        id="password-success"
                        className="setup-form__success"
                        role="status"
                        aria-live="polite"
                      >
                        {auth.passwordAlreadySet ? '✓ Password already set' : '✓ Password is valid'}
                      </p>
                    )}
                  </div>
                  <div className="setup-form__field">
                    <label 
                      className="setup-form__label"
                      htmlFor="admin-password-confirm-input"
                    >
                      Confirm Password
                    </label>
                    <input
                      ref={passwordConfirmInputRef}
                      id="admin-password-confirm-input"
                      type="password"
                      className={`setup-form__input ${
                        features.auth && !isPasswordValid && !passwordError ? 'setup-form__input--highlight' : ''
                      } ${
                        isPasswordValid ? 'setup-form__input--success' : ''
                      } ${
                        passwordError ? 'setup-form__input--error' : ''
                      }`}
                      value={auth.adminPasswordConfirm}
                      onChange={(e) => handleAuthChange('adminPasswordConfirm', e.target.value)}
                      onFocus={(e) => {
                        // If showing asterisks, clear field when user focuses
                        if (auth.passwordAlreadySet && e.target.value === '************') {
                          setAuth({ ...auth, adminPasswordConfirm: '', passwordAlreadySet: false });
                        }
                      }}
                      onBlur={handlePasswordBlur}
                      placeholder={auth.passwordAlreadySet ? "Password already set (click to change)" : "Confirm admin password"}
                      aria-invalid={passwordError ? 'true' : 'false'}
                      aria-describedby={passwordError ? 'password-error' : isPasswordValid ? 'password-success' : undefined}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="setup-page__auth-section-info">
                    <p className="setup-page__auth-section-hint" style={{ marginBottom: 'var(--space-sm)' }}>
                      ✅ <strong>Admin Dashboard</strong> aktiviert folgende Tools:
                    </p>
                    <ul className="setup-page__auth-section-tools" style={{ 
                      margin: 0, 
                      paddingLeft: 'var(--space-lg)',
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                      lineHeight: '1.6'
                    }}>
                      <li>Layout Editor</li>
                      <li>Theme Editor</li>
                      <li>Appearance Editor</li>
                      <li>Content Editor</li>
                      <li>Feature Management</li>
                      <li>Settings</li>
                    </ul>
                    <p className="setup-page__auth-section-hint" style={{ marginTop: 'var(--space-sm)', marginBottom: 0 }}>
                      ⚠️ Optional: Media Library & Guestbook erfordern Admin Dashboard.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card setup-page__form setup-page__form--compact">
              <h3 className="setup-page__form-title setup-page__form-title--compact">⚙️ Settings</h3>
              <p className="setup-page__form-description" style={{ fontSize: '0.875rem', marginTop: 'var(--space-sm)' }}>
                Enable features to see their configuration options here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
