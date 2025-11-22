#!/usr/bin/env node

/**
 * Portfolio Setup Script
 * 
 * Setup das:
 * 1. .env Konfiguration prüft oder interaktiv erstellt
 * 2. generate-static-data.js aufruft
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import { spawn } from 'child_process';

// Lade .env-Datei
dotenv.config();

// Setup für readline Interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

interface SetupConfig {
  githubUsername: string;
  githubToken?: string;
  portfolioTitle: string;
  portfolioDescription: string;
  portfolioAuthor: string;
  enableTerminal: boolean;
  enableBlog: boolean;
  enableContact: boolean;
  terminalHostname?: string;
  terminalUsername?: string;
  terminalPassword?: string;
  terminalRootPassword?: string;
}

// Hilfsfunktion für Eingaben
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Hilfsfunktion für Ja/Nein Fragen
async function askYesNo(question: string, defaultValue: boolean = false): Promise<boolean> {
  const defaultText = defaultValue ? ' (Y/n)' : ' (y/N)';
  const answer = await askQuestion(`${question}${defaultText}: `);
  
  if (answer === '') return defaultValue;
  return answer.toLowerCase().startsWith('y');
}

// Validiert GitHub Username
function isValidGitHubUsername(username: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username);
}

// Schreibt .env Datei (OHNE GitHub Token für Sicherheit)
function writeEnvFile(config: SetupConfig): void {
  const envContent = `# GitHub Configuration
GITHUB_USERNAME=${config.githubUsername}

# Terminal Configuration (optional)
TERMINAL_HOSTNAME=${config.terminalHostname || ''}
TERMINAL_USERNAME=${config.terminalUsername || ''}
TERMINAL_PASSWORD=${config.terminalPassword || ''}
TERMINAL_ROOTSPASSWORD=${config.terminalRootPassword || ''}

# Portfolio Configuration
PORTFOLIO_TITLE="${config.portfolioTitle || ''}"
PORTFOLIO_DESCRIPTION="${config.portfolioDescription || ''}"
PORTFOLIO_AUTHOR="${config.portfolioAuthor || ''}"

# Features
ENABLE_TERMINAL=${config.enableTerminal ? 'true' : 'false'}
ENABLE_BLOG=${config.enableBlog ? 'true' : 'true'}
ENABLE_CONTACT=${config.enableContact ? 'true' : 'false'}
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created/updated successfully (GitHub token NOT saved for security)');
}

// Hauptfunktion
async function main(): Promise<void> {
  console.log('🚀 Portfolio Setup');
  console.log('=================\n');
  
  console.log('📁 Script Organization:');
  console.log('  📊 data-generation/  - Portfolio data scripts');
  console.log('  🖥️  terminal-system/  - Terminal/OS features');
  console.log('  🔧 utils/            - Configuration & utilities');
  console.log('');
  
  let config: SetupConfig = {
    githubUsername: '',
    portfolioTitle: '',
    portfolioDescription: '',
    portfolioAuthor: '',
    enableTerminal: false,
    enableBlog: true,
    enableContact: false
  };
  
  // 1. GitHub Username (REQUIRED)
  console.log('📋 Step 1: GitHub Configuration');
  console.log('-------------------------------');
  
  if (process.env.GITHUB_USERNAME && process.env.GITHUB_USERNAME.trim() !== '') {
    console.log(`✅ GitHub Username found in .env: ${process.env.GITHUB_USERNAME}`);
    config.githubUsername = process.env.GITHUB_USERNAME;
  } else {
    console.log('❌ GITHUB_USERNAME not found in .env');
    let username;
    do {
      username = await askQuestion('Enter your GitHub username (REQUIRED): ');
      if (!isValidGitHubUsername(username)) {
        console.log('❌ Invalid GitHub username format. Please try again.');
      }
    } while (!isValidGitHubUsername(username));
    config.githubUsername = username;
  }
  
  // 2. GitHub Token (optional)
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim() !== '') {
    console.log('✅ GitHub Token found in .env');
    config.githubToken = process.env.GITHUB_TOKEN;
  } else {
    console.log('\n🔑 Step 2: GitHub Token (Optional)');
    console.log('-----------------------------------');
    console.log('A GitHub token provides:');
    console.log('• Higher API rate limits (5000 vs 60 requests/hour)');
    console.log('• Access to private repositories');
    console.log('• REAL Lines of Code (LOC) data from GitHub API');
    console.log('• Without token: Only percentages, no actual code lines');
    console.log('');
    console.log('You can create one at: https://github.com/settings/tokens');
    console.log('Required scopes: repo (for private repos), read:user');
    console.log('');
    console.log('⚠️  WITHOUT TOKEN:');
    console.log('   - Only public repos visible');
    console.log('   - No real Lines of Code data');
    console.log('   - Only percentage estimates');
    console.log('   - Lower rate limits');
    
    const useToken = await askYesNo('Do you want to use a GitHub token?', false);
    if (useToken) {
      const token = await askQuestion('Enter your GitHub token: ');
      config.githubToken = token;
    }
  }
  
  // 3. Portfolio Configuration (optional)
  console.log('\n⚙️  Step 3: Portfolio Configuration (Optional)');
  console.log('----------------------------------------------');
  
  config.portfolioTitle = process.env.PORTFOLIO_TITLE || await askQuestion(`Portfolio title (default: "${config.githubUsername}'s Portfolio"): `) || `${config.githubUsername}'s Portfolio`;
  config.portfolioDescription = process.env.PORTFOLIO_DESCRIPTION || await askQuestion('Portfolio description: ') || 'A modern portfolio website';
  config.portfolioAuthor = process.env.PORTFOLIO_AUTHOR || await askQuestion(`Author name (default: ${config.githubUsername}): `) || config.githubUsername;
  
  // 4. Feature Flags
  console.log('\n🎮 Step 4: Feature Configuration');
  console.log('------------------------------');
  
  if (process.env.ENABLE_TERMINAL !== undefined) {
    config.enableTerminal = process.env.ENABLE_TERMINAL === 'true';
    console.log(`✅ Terminal feature: ${config.enableTerminal ? 'Enabled' : 'Disabled'} (from .env)`);
  } else {
    config.enableTerminal = await askYesNo('Enable interactive terminal feature?', false);
  }
  
  if (process.env.ENABLE_BLOG !== undefined) {
    config.enableBlog = process.env.ENABLE_BLOG !== 'false';
    console.log(`✅ Blog feature: ${config.enableBlog ? 'Enabled' : 'Disabled'} (from .env)`);
  } else {
    config.enableBlog = await askYesNo('Enable blog section?', true);
  }
  
  if (process.env.ENABLE_CONTACT !== undefined) {
    config.enableContact = process.env.ENABLE_CONTACT === 'true';
    console.log(`✅ Contact feature: ${config.enableContact ? 'Enabled' : 'Disabled'} (from .env)`);
  } else {
    config.enableContact = await askYesNo('Enable contact form?', false);
  }
  
  // 5. Terminal Configuration (nur wenn aktiviert)
  if (config.enableTerminal) {
    console.log('\n🖥️  Step 5: Terminal Configuration');
    console.log('----------------------------------');
    
    config.terminalHostname = process.env.TERMINAL_HOSTNAME || await askQuestion('Terminal hostname: ') || 'Gaming';
    config.terminalUsername = process.env.TERMINAL_USERNAME || await askQuestion('Terminal username: ') || 'user';
    config.terminalPassword = process.env.TERMINAL_PASSWORD || await askQuestion('Terminal password: ') || 'password';
    config.terminalRootPassword = process.env.TERMINAL_ROOTSPASSWORD || await askQuestion('Root password: ') || 'rootpassword';
  }
  
  // 6. Schreibe .env Datei
  console.log('\n💾 Step 6: Saving Configuration');
  console.log('-------------------------------');
  
  writeEnvFile(config);
  
  // 7. Generiere Portfolio-Daten
  console.log('\n🚀 Step 7: Generating Portfolio Data');
  console.log('------------------------------------');
  
  try {
    // Setze GitHub Token temporär für diese Session (wird NICHT gespeichert)
    const env = { ...process.env };
    if (config.githubToken) {
      env.GITHUB_TOKEN = config.githubToken;
      console.log('🔑 Using GitHub token for this session (NOT saved)');
    } else {
      console.log('⚠️  No GitHub token - using fallback methods');
    }
    
    
    console.log('🚀 Starting data generation...');
    
    const child = spawn('npx', ['tsx', 'src/features/setup/scripts/data-orchestrator.ts'], {
      stdio: 'inherit',
      env: env
    });
    
    await new Promise((resolve, reject) => {
      child.on('close', (code) => {
        if (code === 0) {
          resolve(undefined);
        } else {
          reject(new Error(`Data generation failed with code ${code}`));
        }
      });
      child.on('error', reject);
    });
    
    console.log('\n✅ Portfolio data generated successfully!');
  } catch (error) {
    console.log('\n❌ Error generating portfolio data:', (error as Error).message);
    console.log('You can run the script manually later with: npm run generate');
    process.exit(1);
  }
  
  console.log('\n🎉 Setup Complete!');
  console.log('==================');
  console.log(`✅ GitHub Username: ${config.githubUsername}`);
  console.log(`✅ GitHub Token: ${config.githubToken ? 'Used for this session (NOT saved)' : 'Not configured'}`);
  console.log(`✅ Portfolio Title: ${config.portfolioTitle}`);
  console.log(`✅ Terminal Feature: ${config.enableTerminal ? 'Enabled' : 'Disabled'}`);
  console.log(`✅ Blog Feature: ${config.enableBlog ? 'Enabled' : 'Disabled'}`);
  console.log(`✅ Contact Feature: ${config.enableContact ? 'Enabled' : 'Disabled'}`);
  
  console.log('\n📊 Data Quality:');
  if (config.githubToken) {
    console.log('✅ REAL Lines of Code data will be fetched');
    console.log('✅ Private repositories accessible');
    console.log('✅ High API rate limits (5000/hour)');
  } else {
    console.log('⚠️  Only percentage estimates available');
    console.log('⚠️  Only public repositories');
    console.log('⚠️  Limited API rate limits (60/hour)');
    console.log('💡 Add GitHub token for real LOC data!');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Run "npm run dev" to start the development server');
  console.log('2. Run "npm run build" to build for production');
  console.log('3. Deploy to your preferred hosting platform');
  
  console.log('\n🔧 Manual Commands:');
  console.log('- Regenerate data: npm run generate');
  console.log('- Terminal setup: node scripts/terminal-system/copy-fake-os-structure.js');
  console.log('- Filesystem setup: node scripts/terminal-system/convert-os-structure-to-filesystem.js');
  console.log('- Start dev server: npm run dev');
  console.log('- Build for production: npm run build');
  
  rl.close();
}

// Error Handling
process.on('unhandledRejection', (error: Error) => {
  console.error('❌ Unexpected error:', error);
  rl.close();
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Setup cancelled by user (Ctrl+C)');
  console.log('🔄 Cleaning up...');
  rl.close();
  
  // Kill any child processes
  try {
    process.kill(process.pid, 'SIGTERM');
  } catch (e) {
    // Ignore errors
  }
  
  process.exit(0);
});

// Führe Setup aus
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: Error) => {
    console.error('❌ Setup failed:', error);
    rl.close();
    process.exit(1);
  });
}

export { main };
