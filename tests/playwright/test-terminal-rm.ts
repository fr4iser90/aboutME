import { chromium } from 'playwright';

async function testRmCommand() {
  console.log('🔍 Starting rm Command Test...\n');
  
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
    await page.waitForTimeout(2000); // Wait longer for session restoration
    
    // Check if terminal is open and if session was restored
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
        // Quick login
        await terminalInput.fill('fr4iser');
        await terminalInput.press('Enter');
        await page.waitForTimeout(1000);
        
        // Password
        await page.keyboard.type('kira');
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
    
    // Test rm command functionality
    console.log('\n🗑️ Testing rm Command...');
    
    // Test 1: rm --help
    console.log('📋 Test 1: rm --help');
    await terminalInput.fill('rm --help');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 2: rm without arguments (should show error)
    console.log('📋 Test 2: rm without arguments');
    await terminalInput.fill('rm');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 3: rm with non-existent file
    console.log('📋 Test 3: rm nonexistent.txt');
    await terminalInput.fill('rm nonexistent.txt');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 4: rm with force flag
    console.log('📋 Test 4: rm -f nonexistent.txt');
    await terminalInput.fill('rm -f nonexistent.txt');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 5: rm with recursive flag on directory
    console.log('📋 Test 5: rm -r Documents');
    await terminalInput.fill('rm -r Documents');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 6: rm with interactive flag
    console.log('📋 Test 6: rm -i testfile.txt');
    await terminalInput.fill('rm -i testfile.txt');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 7: rm multiple files
    console.log('📋 Test 7: rm file1.txt file2.txt');
    await terminalInput.fill('rm file1.txt file2.txt');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 8: Check ls to see current directory
    console.log('📋 Test 8: ls (check current directory)');
    await terminalInput.fill('ls');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 9: Test cache-status to verify cache is working
    console.log('📋 Test 9: cache-status');
    await terminalInput.fill('cache-status');
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
    
    // Check if rm command is working
    const rmWorking = finalOutput.includes('rm: missing file operand') ||
                     finalOutput.includes('rm: nonexistent.txt: No such file or directory') ||
                     finalOutput.includes('Usage: rm [OPTION]... FILE...') ||
                     finalOutput.includes('rm: remove');
    
    console.log(`\n🎯 rm Command Working: ${rmWorking ? '✅' : '❌'}`);
    
    // Take Screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'rm-test.png', fullPage: true });
    console.log('   Screenshot saved as rm-test.png ✅');
    
    // Summary
    console.log('\n📊 RM COMMAND TEST SUMMARY:');
    console.log(`   Terminal Opens: ${terminalOpen ? '✅' : '❌'}`);
    console.log(`   Session Restored: ${sessionRestored ? '✅' : '❌'}`);
    console.log(`   Input Found: ${inputExists ? '✅' : '❌'}`);
    console.log(`   rm Command Working: ${rmWorking ? '✅' : '❌'}`);
    
    const overallSuccess = terminalOpen && inputExists && rmWorking;
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ RM COMMAND WORKING!' : '❌ RM COMMAND HAS ISSUES'}`);
    
  } catch (error) {
    console.error('❌ Error during rm command testing:', error);
  } finally {
    await browser.close();
  }
}

testRmCommand().catch(console.error);
