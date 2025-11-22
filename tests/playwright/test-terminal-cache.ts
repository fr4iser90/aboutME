import { chromium } from 'playwright';

async function testTerminalCache() {
  console.log('🔍 Starting Terminal Cache Test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the portfolio
    console.log('📱 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded successfully!\n');
    
    // Find and click terminal button
    console.log('🎯 Looking for Terminal Button...');
    const terminalButton = page.locator('button').filter({ hasText: /terminal|Terminal/i }).first();
    const terminalExists = await terminalButton.isVisible();
    console.log(`   Terminal Button visible: ${terminalExists ? '✅' : '❌'}`);
    
    if (!terminalExists) {
      console.log('❌ Terminal button not found!');
      return;
    }
    
    // Click terminal button
    console.log('🖱️ Clicking Terminal Button...');
    await terminalButton.click();
    await page.waitForTimeout(1000);
    
    // Check if terminal is open
    console.log('📟 Checking Terminal Window...');
    const terminalWindow = page.locator('.terminal-window, [class*="terminal"]').first();
    const terminalOpen = await terminalWindow.isVisible();
    console.log(`   Terminal Window visible: ${terminalOpen ? '✅' : '❌'}`);
    
    if (!terminalOpen) {
      console.log('❌ Terminal window not found!');
      return;
    }
    
    // Find terminal input
    console.log('⌨️ Looking for Terminal Input...');
    const terminalInput = page.locator('input[type="text"], input[placeholder*="login"], input[placeholder*="password"]').first();
    const inputExists = await terminalInput.isVisible();
    console.log(`   Terminal Input visible: ${inputExists ? '✅' : '❌'}`);
    
    if (!inputExists) {
      console.log('❌ Terminal input not found!');
      return;
    }
    
    // Login process with working method
    console.log('\n🔐 Starting Login Process...');
    
    // Step 1: Enter username
    console.log('👤 Entering username: fr4iser');
    await terminalInput.fill('fr4iser');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Step 2: Enter password with robust method
    console.log('🔑 Entering password: kira');
    await page.waitForTimeout(500);
    
    // Try multiple approaches for password input
    try {
      // Method 1: Try to find password input specifically
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        console.log('   Found password input field');
        await passwordInput.fill('kira');
        await passwordInput.press('Enter');
      } else {
        // Method 2: Use JavaScript to find and set password
        await page.evaluate(() => {
          const inputs = document.querySelectorAll('input');
          let passwordInput = null;
          
          // Find the password input or the active text input
          for (let input of inputs) {
            if (input.type === 'password' || 
                (input.type === 'text' && input.offsetParent !== null)) {
              passwordInput = input;
              break;
            }
          }
          
          if (passwordInput) {
            console.log('Setting password via JavaScript');
            passwordInput.focus();
            passwordInput.value = 'kira';
            
            // Trigger all necessary events
            passwordInput.dispatchEvent(new Event('focus', { bubbles: true }));
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
            passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Submit the form
            const form = passwordInput.closest('form');
            if (form) {
              form.dispatchEvent(new Event('submit', { bubbles: true }));
            } else {
              // Fallback: trigger Enter key
              passwordInput.dispatchEvent(new KeyboardEvent('keydown', { 
                key: 'Enter', 
                keyCode: 13, 
                bubbles: true 
              }));
              passwordInput.dispatchEvent(new KeyboardEvent('keyup', { 
                key: 'Enter', 
                keyCode: 13, 
                bubbles: true 
              }));
            }
          }
        });
      }
    } catch (error) {
      console.log('   Password input failed, trying alternative method');
      // Fallback: try to press keys directly
      await page.keyboard.type('kira');
      await page.keyboard.press('Enter');
    }
    await page.waitForTimeout(2000);
    
    // Check if login was successful
    console.log('✅ Checking Login Status...');
    const terminalOutput = page.locator('.terminal-output, [class*="output"]').first();
    const outputExists = await terminalOutput.isVisible();
    console.log(`   Terminal Output visible: ${outputExists ? '✅' : '❌'}`);
    
    // Test cache-status command
    console.log('\n💾 Testing Cache System...');
    
    // Enter cache-status command
    console.log('📊 Running cache-status command...');
    await terminalInput.fill('cache-status');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Check cache-status output
    console.log('🔍 Checking Cache Status Output...');
    const cacheOutput = await page.evaluate(() => {
      const outputElements = document.querySelectorAll('[class*="terminal"], [class*="output"]');
      let outputText = '';
      outputElements.forEach(el => {
        if (el.textContent) {
          outputText += el.textContent + '\n';
        }
      });
      return outputText;
    });
    
    console.log('📋 Terminal Output:');
    console.log(cacheOutput);
    
    // Check if cache-status worked
    const cacheStatusFound = cacheOutput.includes('TERMINAL CACHE STATUS') || 
                           cacheOutput.includes('Session ID') || 
                           cacheOutput.includes('Cache Status');
    console.log(`   Cache Status Command Working: ${cacheStatusFound ? '✅' : '❌'}`);
    
    // Test localStorage
    console.log('\n🗄️ Testing localStorage...');
    const localStorageData = await page.evaluate(() => {
      const cache = localStorage.getItem('terminal-cache');
      return cache ? JSON.parse(cache) : null;
    });
    
    console.log(`   localStorage Cache Found: ${localStorageData ? '✅' : '❌'}`);
    if (localStorageData) {
      console.log(`   Active Session ID: ${localStorageData.activeSessionId || 'None'}`);
      console.log(`   Sessions Count: ${Object.keys(localStorageData.sessions || {}).length}`);
      console.log(`   Cache Data:`, JSON.stringify(localStorageData, null, 2));
    }
    
    // Test session persistence
    console.log('\n🔄 Testing Session Persistence...');
    
    // Close terminal
    console.log('❌ Closing Terminal...');
    const closeButton = page.locator('button').filter({ hasText: /close|×|✕/i }).first();
    const closeExists = await closeButton.isVisible();
    if (closeExists) {
      await closeButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Reopen terminal
    console.log('🔄 Reopening Terminal...');
    await terminalButton.click();
    await page.waitForTimeout(1000);
    
    // Check if session was restored
    console.log('🔍 Checking Session Restoration...');
    const restoredOutput = await page.evaluate(() => {
      const outputElements = document.querySelectorAll('[class*="terminal"], [class*="output"]');
      let outputText = '';
      outputElements.forEach(el => {
        if (el.textContent) {
          outputText += el.textContent + '\n';
        }
      });
      return outputText;
    });
    
    const sessionRestored = restoredOutput.includes('Session restored') || 
                           restoredOutput.includes('Welcome back') ||
                           restoredOutput.includes('fr4iser@');
    console.log(`   Session Restored: ${sessionRestored ? '✅' : '❌'}`);
    
    // Test cache-status again
    console.log('📊 Testing cache-status after restoration...');
    const newInput = page.locator('input[type="text"]').first();
    await newInput.fill('cache-status');
    await newInput.press('Enter');
    await page.waitForTimeout(1000);
    
    const finalOutput = await page.evaluate(() => {
      const outputElements = document.querySelectorAll('[class*="terminal"], [class*="output"]');
      let outputText = '';
      outputElements.forEach(el => {
        if (el.textContent) {
          outputText += el.textContent + '\n';
        }
      });
      return outputText;
    });
    
    console.log('📋 Final Terminal Output:');
    console.log(finalOutput);
    
    // Final cache test
    const finalCacheData = await page.evaluate(() => {
      const cache = localStorage.getItem('terminal-cache');
      return cache ? JSON.parse(cache) : null;
    });
    
    console.log(`   Final Cache Status: ${finalCacheData ? '✅' : '❌'}`);
    if (finalCacheData) {
      console.log(`   Final Session ID: ${finalCacheData.activeSessionId || 'None'}`);
      console.log(`   Final Sessions Count: ${Object.keys(finalCacheData.sessions || {}).length}`);
    }
    
    // Take Screenshot
    console.log('\n📸 Taking final screenshot...');
    await page.screenshot({ path: 'terminal-cache-test.png', fullPage: true });
    console.log('   Screenshot saved as terminal-cache-test.png ✅');
    
    // Summary
    console.log('\n📊 CACHE TEST SUMMARY:');
    console.log(`   Terminal Opens: ${terminalOpen ? '✅' : '❌'}`);
    console.log(`   Login Works: ${outputExists ? '✅' : '❌'}`);
    console.log(`   Cache Command Works: ${cacheStatusFound ? '✅' : '❌'}`);
    console.log(`   localStorage Works: ${localStorageData ? '✅' : '❌'}`);
    console.log(`   Session Persistence: ${sessionRestored ? '✅' : '❌'}`);
    
    const overallSuccess = terminalOpen && outputExists && cacheStatusFound && localStorageData && sessionRestored;
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ CACHE SYSTEM WORKING!' : '❌ CACHE SYSTEM HAS ISSUES'}`);
    
  } catch (error) {
    console.error('❌ Error during cache testing:', error);
  } finally {
    await browser.close();
  }
}

testTerminalCache().catch(console.error);
