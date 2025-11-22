/**
 * Basic Info Step Component
 * 
 * Step 1: Collect basic portfolio information
 */

'use client';

import { useState, useRef, useEffect } from 'react';

interface BasicInfoStepProps {
  config: {
    githubUsername: string;
    githubToken?: string;
    portfolioTitle: string;
    portfolioDescription: string;
    portfolioAuthor: string;
  };
  onUpdate: (config: Partial<BasicInfoStepProps['config']>) => void;
}

export default function BasicInfoStep({ config, onUpdate }: BasicInfoStepProps) {
  const [githubUsername, setGithubUsername] = useState(config.githubUsername || '');
  const [githubToken, setGithubToken] = useState(config.githubToken || '');
  const [portfolioTitle, setPortfolioTitle] = useState(config.portfolioTitle || '');
  const [portfolioDescription, setPortfolioDescription] = useState(config.portfolioDescription || '');
  const [portfolioAuthor, setPortfolioAuthor] = useState(config.portfolioAuthor || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local state when config changes (e.g., when navigating back or loading from API)
  // Only update if the config value is different from current state to avoid loops
  useEffect(() => {
    if (config.githubUsername && config.githubUsername !== githubUsername) {
      setGithubUsername(config.githubUsername);
    }
    if (config.githubToken !== undefined && config.githubToken !== githubToken) {
      setGithubToken(config.githubToken || '');
    }
    if (config.portfolioTitle && config.portfolioTitle !== portfolioTitle) {
      setPortfolioTitle(config.portfolioTitle);
    }
    if (config.portfolioDescription !== undefined && config.portfolioDescription !== portfolioDescription) {
      setPortfolioDescription(config.portfolioDescription || '');
    }
    if (config.portfolioAuthor && config.portfolioAuthor !== portfolioAuthor) {
      setPortfolioAuthor(config.portfolioAuthor);
    }
  }, [
    config.githubUsername, 
    config.githubToken, 
    config.portfolioTitle, 
    config.portfolioDescription, 
    config.portfolioAuthor
  ]);

  // Update parent when local state changes
  useEffect(() => {
    onUpdate({
      githubUsername,
      githubToken,
      portfolioTitle,
      portfolioDescription,
      portfolioAuthor,
    });
  }, [githubUsername, githubToken, portfolioTitle, portfolioDescription, portfolioAuthor, onUpdate]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [portfolioDescription]);

  return (
    <div className="glass-card setup-page__form">
      <h3 className="setup-page__form-title">📝 Basic Information</h3>
      <p className="setup-page__form-description">
        Enter your GitHub username and portfolio details
      </p>

      <div className="setup-form">
        <div className="setup-form__field">
          <label className="setup-form__label">
            GitHub Username <span className="setup-form__required">*</span>
          </label>
          <input
            type="text"
            className="setup-form__input"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            placeholder="your-github-username"
            required
          />
        </div>

        <div className="setup-form__field">
          <label className="setup-form__label">GitHub API Token (Optional)</label>
          <input
            type="password"
            className="setup-form__input"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          />
          <small className="setup-form__hint">
            Only needed for API strategy. Create at:{' '}
            <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
              GitHub Settings → Developer settings → Personal access tokens
            </a>
          </small>
        </div>

        <div className="setup-form__field">
          <label className="setup-form__label">Portfolio Title</label>
          <input
            type="text"
            className="setup-form__input"
            value={portfolioTitle}
            onChange={(e) => setPortfolioTitle(e.target.value)}
            placeholder="My Awesome Portfolio"
          />
        </div>

        <div className="setup-form__field">
          <label className="setup-form__label">Portfolio Description</label>
          <textarea
            ref={textareaRef}
            className="setup-form__textarea"
            value={portfolioDescription}
            onChange={(e) => {
              setPortfolioDescription(e.target.value);
              adjustTextareaHeight();
            }}
            placeholder="A brief description of your portfolio..."
          />
        </div>

        <div className="setup-form__field">
          <label className="setup-form__label">Your Name</label>
          <input
            type="text"
            className="setup-form__input"
            value={portfolioAuthor}
            onChange={(e) => setPortfolioAuthor(e.target.value)}
            placeholder="Your Name"
          />
        </div>
      </div>
    </div>
  );
}

