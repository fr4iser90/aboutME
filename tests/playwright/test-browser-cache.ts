import { chromium } from 'playwright';

async function testBrowserCache() {
  console.log('🔍 Testing Browser Cache Directly...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the portfolio
    console.log('📱 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded successfully!\n');
    
    // Check localStorage BEFORE login
    console.log('🗄️ Checking localStorage BEFORE login...');
    const initialCache = await page.evaluate(() => {
      return localStorage.getItem('terminal-cache');
    });
    console.log(`   Initial Cache: ${initialCache ? 'EXISTS' : 'EMPTY'}`);
    if (initialCache) {
      const parsed = JSON.parse(initialCache);
      console.log(`   Sessions: ${Object.keys(parsed.sessions || {}).length}`);
      console.log(`   Active Session: ${parsed.activeSessionId || 'None'}`);
    }
    
    // Find and click terminal button
    console.log('🎯 Opening Terminal...');
    const terminalButton = page.locator('button').filter({ hasText: /terminal|Terminal/i }).first();
    await terminalButton.click();
    await page.waitForTimeout(1000);
    
    // Login process with working method
    console.log('🔐 Logging in...');
    const terminalInput = page.locator('input[type="text"], input[placeholder*="login"], input[placeholder*="password"]').first();
    
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
    
    // Check localStorage AFTER login
    console.log('🗄️ Checking localStorage AFTER login...');
    const afterLoginCache = await page.evaluate(() => {
      return localStorage.getItem('terminal-cache');
    });
    console.log(`   After Login Cache: ${afterLoginCache ? 'EXISTS' : 'EMPTY'}`);
    if (afterLoginCache) {
      const parsed = JSON.parse(afterLoginCache);
      console.log(`   Sessions: ${Object.keys(parsed.sessions || {}).length}`);
      console.log(`   Active Session: ${parsed.activeSessionId || 'None'}`);
      if (parsed.activeSessionId && parsed.sessions[parsed.activeSessionId]) {
        const session = parsed.sessions[parsed.activeSessionId];
        console.log(`   Is Logged In: ${session.isLoggedIn}`);
        console.log(`   Username: ${session.username}`);
        console.log(`   Commands: ${session.commandHistory.length}`);
      }
    }
    
    // Test cache-status command
    console.log('📊 Testing cache-status command...');
    await terminalInput.fill('cache-status');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Check if cache-status worked
    const terminalOutput = await page.evaluate(() => {
      const outputElements = document.querySelectorAll('[class*="terminal"], [class*="output"]');
      let outputText = '';
      outputElements.forEach(el => {
        if (el.textContent) {
          outputText += el.textContent + '\n';
        }
      });
      return outputText;
    });
    
    const cacheStatusFound = terminalOutput.includes('TERMINAL CACHE STATUS') || 
                           terminalOutput.includes('Session ID') || 
                           terminalOutput.includes('Cache Status');
    console.log(`   Cache Status Command: ${cacheStatusFound ? '✅ WORKING' : '❌ FAILED'}`);
    
    // NOW TEST PAGE REFRESH
    console.log('\n🔄 TESTING PAGE REFRESH...');
    console.log('🔄 Refreshing page...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check localStorage AFTER refresh
    console.log('🗄️ Checking localStorage AFTER refresh...');
    const afterRefreshCache = await page.evaluate(() => {
      return localStorage.getItem('terminal-cache');
    });
    console.log(`   After Refresh Cache: ${afterRefreshCache ? 'EXISTS' : 'EMPTY'}`);
    if (afterRefreshCache) {
      const parsed = JSON.parse(afterRefreshCache);
      console.log(`   Sessions: ${Object.keys(parsed.sessions || {}).length}`);
      console.log(`   Active Session: ${parsed.activeSessionId || 'None'}`);
      if (parsed.activeSessionId && parsed.sessions[parsed.activeSessionId]) {
        const session = parsed.sessions[parsed.activeSessionId];
        console.log(`   Is Logged In: ${session.isLoggedIn}`);
        console.log(`   Username: ${session.username}`);
        console.log(`   Commands: ${session.commandHistory.length}`);
      }
    }
    
    // Open terminal again after refresh
    console.log('🎯 Opening Terminal AFTER refresh...');
    const newTerminalButton = page.locator('button').filter({ hasText: /terminal|Terminal/i }).first();
    await newTerminalButton.click();
    await page.waitForTimeout(2000);
    
    // Check if session was restored
    console.log('🔍 Checking if session was restored...');
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
    
    console.log('📋 Terminal Output After Refresh:');
    console.log(restoredOutput);
    
    const sessionRestored = restoredOutput.includes('Session restored') || 
                           restoredOutput.includes('Welcome back') ||
                           restoredOutput.includes('fr4iser@') ||
                           restoredOutput.includes('Welcome to NixOS');
    console.log(`   Session Restored: ${sessionRestored ? '✅ YES' : '❌ NO'}`);
    
    // Test cache-status after restoration
    console.log('📊 Testing cache-status after restoration...');
    const newInput = page.locator('input[type="text"]').first();
    if (await newInput.isVisible()) {
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
      
      const finalCacheStatus = finalOutput.includes('TERMINAL CACHE STATUS') || 
                              finalOutput.includes('Session ID') || 
                              finalOutput.includes('Cache Status');
      console.log(`   Final Cache Status: ${finalCacheStatus ? '✅ WORKING' : '❌ FAILED'}`);
    }
    
    // Final localStorage check
    console.log('\n🗄️ FINAL localStorage CHECK...');
    const finalCache = await page.evaluate(() => {
      return localStorage.getItem('terminal-cache');
    });
    console.log(`   Final Cache: ${finalCache ? 'EXISTS' : 'EMPTY'}`);
    if (finalCache) {
      const parsed = JSON.parse(finalCache);
      console.log(`   Final Sessions: ${Object.keys(parsed.sessions || {}).length}`);
      console.log(`   Final Active Session: ${parsed.activeSessionId || 'None'}`);
    }
    
    // Summary
    console.log('\n📊 BROWSER CACHE TEST SUMMARY:');
    console.log(`   Initial Cache: ${initialCache ? '✅' : '❌'}`);
    console.log(`   After Login Cache: ${afterLoginCache ? '✅' : '❌'}`);
    console.log(`   After Refresh Cache: ${afterRefreshCache ? '✅' : '❌'}`);
    console.log(`   Session Restored: ${sessionRestored ? '✅' : '❌'}`);
    console.log(`   Final Cache: ${finalCache ? '✅' : '❌'}`);
    
    const overallSuccess = afterLoginCache && afterRefreshCache && sessionRestored && finalCache;
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ BROWSER CACHE WORKING!' : '❌ BROWSER CACHE HAS ISSUES'}`);
    
    // Take Screenshot
    console.log('\n📸 Taking final screenshot...');
    await page.screenshot({ path: 'browser-cache-test.png', fullPage: true });
    console.log('   Screenshot saved as browser-cache-test.png ✅');
    
  } catch (error) {
    console.error('❌ Error during browser cache testing:', error);
  } finally {
    await browser.close();
  }
}

testBrowserCache().catch(console.error);
