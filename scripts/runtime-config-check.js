#!/usr/bin/env node

/**
 * Runtime Configuration Check
 * 
 * This script runs at container startup (AFTER volumes are mounted)
 * to validate the portfolio data and set SETUP_MODE accordingly.
 * 
 * Why needed?
 * - next.config.ts runs at BUILD time with build-time files
 * - Runtime files might be different (e.g. volume mounts)
 * - We need to check the ACTUAL runtime data
 */

const fs = require('fs');
const path = require('path');

/**
 * Structured logging (13th Factor compliant)
 */
function logStructured(level, event, message, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level,
    event: event,
    message: message,
    service: 'runtime-config-check',
    environment: process.env.NODE_ENV || 'production',
    ...context
  };
  
  const output = ['WARNING', 'ERROR', 'CRITICAL'].includes(level) ? console.error : console.log;
  output(JSON.stringify(logEntry));
}

/**
 * Main validation logic
 */
function validatePortfolioConfig() {
  try {
    const DATA_DIR = path.join(process.cwd(), 'public/data');
    const configFile = path.join(DATA_DIR, 'config.json');
    const userFile = path.join(DATA_DIR, 'user.json');
    const projectsFile = path.join(DATA_DIR, 'projects.json');
    const skillsFile = path.join(DATA_DIR, 'skills.json');
    
    // Step 1: Check critical files
    const criticalFiles = [configFile, userFile];
    for (const filePath of criticalFiles) {
      if (!fs.existsSync(filePath)) {
        logStructured('WARNING', 'missing_file', 'Critical file missing', {
          file: path.basename(filePath),
          setupModeRequired: true
        });
        return true; // Needs setup mode
      }
    }
    
    // Step 2: Read config
    let config;
    try {
      const configContent = fs.readFileSync(configFile, 'utf-8');
      config = JSON.parse(configContent);
    } catch (error) {
      logStructured('ERROR', 'config_parse_error', 'Could not read config.json', {
        error: error.message,
        setupModeRequired: true
      });
      return true; // Needs setup mode
    }
    
    // Step 3: Validate enabled features
    const validationErrors = [];
    
    // Check user data
    try {
      const userContent = fs.readFileSync(userFile, 'utf-8');
      const userData = JSON.parse(userContent);
      
      if (!userData.username || !userData.name) {
        validationErrors.push('user.json missing username or name');
      }
      
      // Check About Me if enabled
      if (config.features?.aboutMe?.enabled) {
        if (!userData.aboutMe || userData.aboutMe === null) {
          validationErrors.push('About Me is enabled but user.aboutMe is null/missing');
        }
      }
    } catch (error) {
      validationErrors.push('Could not read/parse user.json');
    }
    
    // Check projects if enabled
    if (config.features?.projects?.enabled) {
      try {
        if (!fs.existsSync(projectsFile)) {
          validationErrors.push('Projects is enabled but projects.json missing');
        } else {
          const projectsContent = fs.readFileSync(projectsFile, 'utf-8');
          const projectsData = JSON.parse(projectsContent);
          
          if (!projectsData.projects || projectsData.projects.length === 0) {
            validationErrors.push('Projects is enabled but projects.json has no projects');
          }
        }
      } catch (error) {
        validationErrors.push('Projects is enabled but projects.json invalid');
      }
    }
    
    // Check skills if enabled
    if (config.features?.skills?.enabled) {
      try {
        if (!fs.existsSync(skillsFile)) {
          validationErrors.push('Skills is enabled but skills.json missing');
        } else {
          const skillsContent = fs.readFileSync(skillsFile, 'utf-8');
          const skillsData = JSON.parse(skillsContent);
          
          if (!skillsData.languages && !skillsData.frameworks && !skillsData.tools) {
            validationErrors.push('Skills is enabled but skills.json has no data');
          }
        }
      } catch (error) {
        validationErrors.push('Skills is enabled but skills.json invalid');
      }
    }
    
    // Step 4: Decision
    if (validationErrors.length > 0) {
      logStructured('WARNING', 'runtime_validation_failed', 'Portfolio validation failed at runtime', {
        validationErrors: validationErrors,
        errorCount: validationErrors.length,
        setupModeRequired: true
      });
      return true; // Needs setup mode
    } else {
      const enabledFeatures = Object.keys(config.features || {}).filter(
        key => config.features[key]?.enabled
      );
      logStructured('INFO', 'runtime_validation_success', 'Portfolio is fully configured', {
        enabledFeatures: enabledFeatures,
        featureCount: enabledFeatures.length,
        setupModeRequired: false
      });
      return false; // No setup mode needed
    }
    
  } catch (error) {
    logStructured('CRITICAL', 'runtime_check_error', 'Runtime config check failed', {
      error: error.message,
      stack: error.stack,
      setupModeRequired: true
    });
    return true; // Needs setup mode on error
  }
}

// Run validation
const needsSetupMode = validatePortfolioConfig();

// Exit with appropriate code
// 0 = normal mode, 1 = setup mode needed
process.exit(needsSetupMode ? 1 : 0);

