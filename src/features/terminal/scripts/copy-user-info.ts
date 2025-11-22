#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Lade .env-Datei
dotenv.config();

interface UserInfo {
  hostname: string;
  username: string;
  password: string;
  password_hint: string;
  root_username: string;
  root_password: string;
  root_password_hint: string;
}

function copyUserInfoFromEnv(): UserInfo {
  console.log('📋 Creating terminal-user-info.json from .env...');
  
  try {
    // Prüfe ob .env existiert
    if (!fs.existsSync('.env')) {
      console.error('❌ .env file not found!');
      console.log('💡 Run: node setup.js first to create .env');
      process.exit(1);
    }
    
    // Hole Werte aus .env
    const hostname = process.env.TERMINAL_HOSTNAME;
    const username = process.env.TERMINAL_USERNAME;
    const password = process.env.TERMINAL_PASSWORD;
    const rootPassword = process.env.TERMINAL_ROOTSPASSWORD;
    
    // Prüfe ob alle Werte vorhanden sind
    if (!hostname || !username || !password || !rootPassword) {
      console.error('❌ Missing terminal configuration in .env!');
      console.log('Required variables:');
      console.log('- TERMINAL_HOSTNAME');
      console.log('- TERMINAL_USERNAME');
      console.log('- TERMINAL_PASSWORD');
      console.log('- TERMINAL_ROOTSPASSWORD');
      console.log('💡 Run: node setup.js first to configure terminal settings');
      process.exit(1);
    }
    
    console.log(`👤 Username: ${username}`);
    console.log(`🖥️  Hostname: ${hostname}`);
    
    // Erstelle das User-Info Objekt
    const userInfo = {
      hostname: hostname,
      username: username,
      password: password,
      password_hint: "",
      root_username: "root",
      root_password: rootPassword,
      root_password_hint: ""
    };
    
    // Speichere als JSON (in terminal/ Ordner)
    const terminalDir = path.join(__dirname, '../../frontend/public/data/terminal');
    if (!fs.existsSync(terminalDir)) {
      fs.mkdirSync(terminalDir, { recursive: true });
    }
    const outputPath = path.join(terminalDir, 'terminal-user-info.json');
    fs.writeFileSync(outputPath, JSON.stringify(userInfo, null, 2));
    
    console.log(`✅ terminal-user-info.json created at: ${outputPath}`);
    
    console.log('\n🎯 Next steps:');
    console.log('1. Run: node scripts/terminal-system/generate-permission-rules.js');
    console.log('2. Run: node scripts/terminal-system/copy-fake-os-structure.js');
    console.log('3. Run: node scripts/terminal-system/convert-os-structure-to-filesystem.js');
    
    return userInfo;
    
  } catch (error) {
    console.error('❌ Error creating user info:', error);
    process.exit(1);
  }
}

function main(): void {
  try {
    const userInfo = copyUserInfoFromEnv();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { copyUserInfoFromEnv };