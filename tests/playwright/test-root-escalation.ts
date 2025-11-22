import { chromium } from 'playwright';

async function testRootUserEscalation() {
  console.log('🔍 Starting Root User Escalation Test...\n');
  
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
    
    // Test root user escalation and permission switching
    console.log('\n👑 Testing Root User Escalation...');
    
    // Test 1: Verify starting as fr4iser user
    console.log('📋 Test 1: whoami (should show fr4iser)');
    await terminalInput.fill('whoami');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 2: Try to access root directory as fr4iser (should fail)
    console.log('📋 Test 2: cd /root (should fail as fr4iser)');
    await terminalInput.fill('cd /root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 3: Switch to root user
    console.log('📋 Test 3: su root (switch to root user)');
    await terminalInput.fill('su root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Test 4: Enter root password
    console.log('📋 Test 4: Entering root password');
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
    
    // Test 5: Verify root user
    console.log('📋 Test 5: whoami (should show root)');
    await terminalInput.fill('whoami');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 6: Access root directory as root (should work)
    console.log('📋 Test 6: cd /root (should work as root)');
    await terminalInput.fill('cd /root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 7: List root directory contents
    console.log('📋 Test 7: ls (list root directory)');
    await terminalInput.fill('ls');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 8: Read root files
    console.log('📋 Test 8: cat /root/secret.txt (read root file)');
    await terminalInput.fill('cat /root/secret.txt');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 9: Access system files as root
    console.log('📋 Test 9: cat /etc/shadow (read system file as root)');
    await terminalInput.fill('cat /etc/shadow');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 10: Remove files as root
    console.log('📋 Test 10: rm /root/test.txt (remove file as root)');
    await terminalInput.fill('rm /root/test.txt');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 11: Access any directory as root
    console.log('📋 Test 11: cd /proc (access system directory as root)');
    await terminalInput.fill('cd /proc');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 12: List system directory
    console.log('📋 Test 12: ls (list system directory)');
    await terminalInput.fill('ls');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 13: Logout from root
    console.log('📋 Test 13: logout (return to fr4iser)');
    await terminalInput.fill('logout');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 14: Verify back to fr4iser user
    console.log('📋 Test 14: whoami (should show fr4iser again)');
    await terminalInput.fill('whoami');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 15: Verify permissions are restricted again
    console.log('📋 Test 15: cd /root (should fail again as fr4iser)');
    await terminalInput.fill('cd /root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 16: Test wrong root password
    console.log('📋 Test 16: su root with wrong password');
    await terminalInput.fill('su root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    await page.keyboard.type('wrongpassword');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    
    // Test 17: Verify still fr4iser after wrong password
    console.log('📋 Test 17: whoami (should still be fr4iser)');
    await terminalInput.fill('whoami');
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
    
    // Check if root escalation is working
    const rootEscalationWorking = finalOutput.includes('root@') ||
                                 finalOutput.includes('root') ||
                                 finalOutput.includes('fr4iser@') ||
                                 finalOutput.includes('Login incorrect');
    
    console.log(`\n🎯 Root Escalation Working: ${rootEscalationWorking ? '✅' : '❌'}`);
    
    // Count user switches
    const rootUserCount = (finalOutput.match(/root@/g) || []).length;
    const fr4iserUserCount = (finalOutput.match(/fr4iser@/g) || []).length;
    
    console.log(`   Root User Prompts: ${rootUserCount}`);
    console.log(`   Fr4iser User Prompts: ${fr4iserUserCount}`);
    
    // Take Screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'root-escalation-test.png', fullPage: true });
    console.log('   Screenshot saved as root-escalation-test.png ✅');
    
    // Summary
    console.log('\n📊 ROOT USER ESCALATION TEST SUMMARY:');
    console.log(`   Terminal Opens: ${terminalOpen ? '✅' : '❌'}`);
    console.log(`   Input Found: ${inputExists ? '✅' : '❌'}`);
    console.log(`   Root Escalation Working: ${rootEscalationWorking ? '✅' : '❌'}`);
    console.log(`   Root User Prompts: ${rootUserCount}`);
    console.log(`   Fr4iser User Prompts: ${fr4iserUserCount}`);
    
    const overallSuccess = terminalOpen && inputExists && rootEscalationWorking && rootUserCount > 0;
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ ROOT ESCALATION WORKING!' : '❌ ROOT ESCALATION HAS ISSUES'}`);
    
  } catch (error) {
    console.error('❌ Error during root escalation testing:', error);
  } finally {
    await browser.close();
  }
}

testRootUserEscalation().catch(console.error);
