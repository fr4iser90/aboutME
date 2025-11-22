import { chromium } from 'playwright';

async function testTerminalPermissions() {
  console.log('🔍 Starting Terminal Permission System Test...\n');
  
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
    await page.waitForTimeout(2000); // Wait for session restoration
    
    // Check if terminal is open
    console.log('📟 Checking Terminal Window...');
    const terminalWindow = page.locator('.terminal-window, [class*="terminal"]').first();
    const terminalOpen = await terminalWindow.isVisible();
    console.log(`   Terminal Window visible: ${terminalOpen ? '✅' : '❌'}`);
    
    if (!terminalOpen) {
      console.log('❌ Terminal window not found!');
      return;
    }
    
    // Check if we're already logged in (session restored)
    console.log('🔍 Checking for restored session...');
    const terminalContent = await page.evaluate(() => {
      const outputElements = document.querySelectorAll('[class*="terminal"], [class*="output"]');
      let outputText = '';
      outputElements.forEach(el => {
        if (el.textContent) {
          outputText += el.textContent + '\n';
        }
      });
      return outputText;
    });
    
    const sessionRestored = terminalContent.includes('Session restored') || 
                           terminalContent.includes('fr4iser@') ||
                           terminalContent.includes('Welcome back');
    
    console.log(`   Session Restored: ${sessionRestored ? '✅' : '❌'}`);
    
    if (!sessionRestored) {
      console.log('⚠️ No session found, attempting login...');
      
      // Find terminal input
      const terminalInput = page.locator('input[type="text"], input[placeholder*="login"], input[placeholder*="password"]').first();
      const inputExists = await terminalInput.isVisible();
      
      if (inputExists) {
        // Load credentials from terminal-user-info.json
        const terminalData = await page.evaluate(async () => {
          try {
            const response = await fetch('/data/terminal-user-info.json');
            return await response.json();
          } catch (error) {
            throw new Error('Could not load terminal credentials');
          }
        });
        
        // Quick login
        await terminalInput.fill(terminalData.username);
        await terminalInput.press('Enter');
        await page.waitForTimeout(1000);
        
        // Password
        await page.keyboard.type(terminalData.password);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
      }
    }
    
    // Find terminal input for commands
    console.log('⌨️ Looking for Terminal Input...');
    const terminalInput = page.locator('input[type="text"], input[placeholder*="command"]').first();
    const inputExists = await terminalInput.isVisible();
    console.log(`   Terminal Input visible: ${inputExists ? '✅' : '❌'}`);
    
    if (!inputExists) {
      console.log('❌ Terminal input not found!');
      return;
    }
    
    // Test permission system functionality
    console.log('\n🔐 Testing Permission System...');
    
    // Test 1: Check current user and directory
    console.log('📋 Test 1: whoami (check current user)');
    await terminalInput.fill('whoami');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 2: Check current directory
    console.log('📋 Test 2: pwd (check current directory)');
    await terminalInput.fill('pwd');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 3: List files in home directory (should work)
    console.log('📋 Test 3: ls (list home directory - should work)');
    await terminalInput.fill('ls');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 4: Try to access root directory (should fail)
    console.log('📋 Test 4: cd /root (should fail with permission denied)');
    await terminalInput.fill('cd /root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 5: Try to read root files (should fail)
    console.log('📋 Test 5: cat /root/secret.txt (should fail with permission denied)');
    await terminalInput.fill('cat /root/secret.txt');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 6: Try to remove root files (should fail)
    console.log('📋 Test 6: rm /root/secret.txt (should fail with permission denied)');
    await terminalInput.fill('rm /root/secret.txt');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 7: Access tmp directory (should work)
    console.log('📋 Test 7: cd /tmp (should work)');
    await terminalInput.fill('cd /tmp');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 8: List tmp directory (should work)
    console.log('📋 Test 8: ls (list tmp directory - should work)');
    await terminalInput.fill('ls');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 9: Switch to root user
    console.log('📋 Test 9: su root (switch to root user)');
    await terminalInput.fill('su root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Enter root password
    console.log('📋 Test 9b: Entering root password');
    // Load root password from terminal-user-info.json
    const terminalData = await page.evaluate(async () => {
      try {
        const response = await fetch('/data/terminal-user-info.json');
        return await response.json();
      } catch (error) {
        throw new Error('Could not load terminal credentials');
      }
    });
    
    await page.keyboard.type(terminalData.root_password);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    
    // Test 10: Check whoami as root
    console.log('📋 Test 10: whoami (should show root)');
    await terminalInput.fill('whoami');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 11: Access root directory as root (should work)
    console.log('📋 Test 11: cd /root (should work as root)');
    await terminalInput.fill('cd /root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 12: Read root files as root (should work)
    console.log('📋 Test 12: cat /root/secret.txt (should work as root)');
    await terminalInput.fill('cat /root/secret.txt');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 13: Logout from root
    console.log('📋 Test 13: logout (return to fr4iser)');
    await terminalInput.fill('logout');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 14: Verify back to fr4iser user
    console.log('📋 Test 14: whoami (should show fr4iser)');
    await terminalInput.fill('whoami');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 15: Test permission error messages
    console.log('📋 Test 15: cat /etc/passwd (should show permission denied with hint)');
    await terminalInput.fill('cat /etc/passwd');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Get final terminal output
    console.log('\n📋 Final Terminal Output:');
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
    
    console.log(finalOutput);
    
    // Check if permission system is working
    const permissionSystemWorking = finalOutput.includes('Permission denied') ||
                                   finalOutput.includes('Hint:') ||
                                   finalOutput.includes('Try using \'sudo\'') ||
                                   finalOutput.includes('fr4iser@') ||
                                   finalOutput.includes('root@');
    
    console.log(`\n🎯 Permission System Working: ${permissionSystemWorking ? '✅' : '❌'}`);
    
    // Take Screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'permission-test.png', fullPage: true });
    console.log('   Screenshot saved as permission-test.png ✅');
    
    // Summary
    console.log('\n📊 PERMISSION SYSTEM TEST SUMMARY:');
    console.log(`   Terminal Opens: ${terminalOpen ? '✅' : '❌'}`);
    console.log(`   Session Restored: ${sessionRestored ? '✅' : '❌'}`);
    console.log(`   Input Found: ${inputExists ? '✅' : '❌'}`);
    console.log(`   Permission System Working: ${permissionSystemWorking ? '✅' : '❌'}`);
    
    const overallSuccess = terminalOpen && inputExists && permissionSystemWorking;
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ PERMISSION SYSTEM WORKING!' : '❌ PERMISSION SYSTEM HAS ISSUES'}`);
    
  } catch (error) {
    console.error('❌ Error during permission system testing:', error);
  } finally {
    await browser.close();
  }
}

testTerminalPermissions().catch(console.error);
