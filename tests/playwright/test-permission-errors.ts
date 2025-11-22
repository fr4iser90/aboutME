import { chromium } from 'playwright';

async function testPermissionErrorMessages() {
  console.log('🔍 Starting Permission Error Messages Test...\n');
  
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
    await page.waitForTimeout(2000);
    
    // Check if terminal is open
    console.log('📟 Checking Terminal Window...');
    const terminalWindow = page.locator('.terminal-window, [class*="terminal"]').first();
    const terminalOpen = await terminalWindow.isVisible();
    console.log(`   Terminal Window visible: ${terminalOpen ? '✅' : '❌'}`);
    
    if (!terminalOpen) {
      console.log('❌ Terminal window not found!');
      return;
    }
    
    // Login if needed
    console.log('🔍 Checking for login...');
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
    
    if (!sessionRestored) {
      console.log('⚠️ No session found, attempting login...');
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
        
        await terminalInput.fill(terminalData.username);
        await terminalInput.press('Enter');
        await page.waitForTimeout(1000);
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
    
    // Test specific permission error scenarios
    console.log('\n🚫 Testing Permission Error Messages...');
    
    // Test 1: Directory access denied
    console.log('📋 Test 1: cd /root (directory access denied)');
    await terminalInput.fill('cd /root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 2: File read access denied
    console.log('📋 Test 2: cat /etc/shadow (file read denied)');
    await terminalInput.fill('cat /etc/shadow');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 3: File write access denied
    console.log('📋 Test 3: rm /etc/passwd (file write denied)');
    await terminalInput.fill('rm /etc/passwd');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 4: Directory listing denied
    console.log('📋 Test 4: ls /root (directory listing denied)');
    await terminalInput.fill('ls /root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 5: Multiple file operations denied
    console.log('📋 Test 5: rm /etc/passwd /etc/shadow (multiple files denied)');
    await terminalInput.fill('rm /etc/passwd /etc/shadow');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 6: Test with sudo suggestion
    console.log('📋 Test 6: cat /root/secret.txt (should suggest sudo)');
    await terminalInput.fill('cat /root/secret.txt');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 7: Test recursive directory access
    console.log('📋 Test 7: cd /root/secret (nested directory denied)');
    await terminalInput.fill('cd /root/secret');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 8: Test with quotes in path
    console.log('📋 Test 8: cat "/root/secret.txt" (quoted path denied)');
    await terminalInput.fill('cat "/root/secret.txt"');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 9: Test with spaces in path
    console.log('📋 Test 9: cat "/root/secret file.txt" (spaced path denied)');
    await terminalInput.fill('cat "/root/secret file.txt"');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 10: Test relative path traversal
    console.log('📋 Test 10: cat ../../../etc/passwd (path traversal denied)');
    await terminalInput.fill('cat ../../../etc/passwd');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 11: Test system file access
    console.log('📋 Test 11: cat /proc/meminfo (system file access)');
    await terminalInput.fill('cat /proc/meminfo');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 12: Test binary file access
    console.log('📋 Test 12: cat /bin/ls (binary file access)');
    await terminalInput.fill('cat /bin/ls');
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
    
    // Check if permission error messages are working
    const errorMessagesWorking = finalOutput.includes('Permission denied') ||
                                finalOutput.includes('Hint:') ||
                                finalOutput.includes('Try using \'sudo\'') ||
                                finalOutput.includes('Access denied') ||
                                finalOutput.includes('Insufficient privileges');
    
    console.log(`\n🎯 Permission Error Messages Working: ${errorMessagesWorking ? '✅' : '❌'}`);
    
    // Count permission denied messages
    const permissionDeniedCount = (finalOutput.match(/Permission denied/g) || []).length;
    const hintCount = (finalOutput.match(/Hint:/g) || []).length;
    
    console.log(`   Permission Denied Messages: ${permissionDeniedCount}`);
    console.log(`   Helpful Hints Provided: ${hintCount}`);
    
    // Take Screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'permission-errors-test.png', fullPage: true });
    console.log('   Screenshot saved as permission-errors-test.png ✅');
    
    // Summary
    console.log('\n📊 PERMISSION ERROR MESSAGES TEST SUMMARY:');
    console.log(`   Terminal Opens: ${terminalOpen ? '✅' : '❌'}`);
    console.log(`   Input Found: ${inputExists ? '✅' : '❌'}`);
    console.log(`   Error Messages Working: ${errorMessagesWorking ? '✅' : '❌'}`);
    console.log(`   Permission Denied Count: ${permissionDeniedCount}`);
    console.log(`   Helpful Hints Count: ${hintCount}`);
    
    const overallSuccess = terminalOpen && inputExists && errorMessagesWorking && permissionDeniedCount > 0;
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ PERMISSION ERROR MESSAGES WORKING!' : '❌ PERMISSION ERROR MESSAGES HAVE ISSUES'}`);
    
  } catch (error) {
    console.error('❌ Error during permission error messages testing:', error);
  } finally {
    await browser.close();
  }
}

testPermissionErrorMessages().catch(console.error);
