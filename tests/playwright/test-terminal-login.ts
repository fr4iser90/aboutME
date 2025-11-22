import { chromium } from 'playwright';

async function testLoginOnly() {
  console.log('🔍 Starting Login Only Test...\n');
  
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
    
    // Login process with optimized timing
    console.log('\n🔐 Starting Login Process...');
    
    // Step 1: Enter username
    console.log('👤 Entering username: fr4iser');
    await terminalInput.fill('fr4iser');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000); // Wait 1 second for password prompt
    
    // Step 2: Enter password immediately after username
    console.log('🔑 Entering password: kira');
    // Wait a bit more for password mode to activate
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
    await page.waitForTimeout(2000); // Wait for login to complete
    
    // Check if login was successful
    console.log('✅ Checking Login Status...');
    const terminalOutput = page.locator('.terminal-output, [class*="output"]').first();
    const outputExists = await terminalInput.isVisible();
    console.log(`   Terminal Output visible: ${outputExists ? '✅' : '❌'}`);
    
    // Check terminal content for login success
    const loginOutput = await page.evaluate(() => {
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
    console.log(loginOutput);
    
    // Check if login was successful
    const loginSuccess = loginOutput.includes('fr4iser@') || 
                        loginOutput.includes('Welcome to NixOS') ||
                        loginOutput.includes('$') ||
                        loginOutput.includes('logged in');
    console.log(`   Login Successful: ${loginSuccess ? '✅' : '❌'}`);
    
    // Take Screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'login-test.png', fullPage: true });
    console.log('   Screenshot saved as login-test.png ✅');
    
    // Summary
    console.log('\n📊 LOGIN TEST SUMMARY:');
    console.log(`   Terminal Opens: ${terminalOpen ? '✅' : '❌'}`);
    console.log(`   Input Found: ${inputExists ? '✅' : '❌'}`);
    console.log(`   Login Successful: ${loginSuccess ? '✅' : '❌'}`);
    
    const overallSuccess = terminalOpen && inputExists && loginSuccess;
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ LOGIN WORKING!' : '❌ LOGIN HAS ISSUES'}`);
    
  } catch (error) {
    console.error('❌ Error during login testing:', error);
  } finally {
    await browser.close();
  }
}

testLoginOnly().catch(console.error);
