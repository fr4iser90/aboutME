import { chromium } from 'playwright';

async function runAllPermissionTests() {
  console.log('🚀 Starting Comprehensive Permission System Test Suite...\n');
  
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
    
    // Test Results Tracking
    const testResults = {
      basicPermissions: false,
      errorMessages: false,
      rootEscalation: false,
      userSwitching: false,
      fileOperations: false,
      directoryOperations: false
    };
    
    console.log('\n🧪 Running Comprehensive Permission Tests...\n');
    
    // Test Suite 1: Basic Permission System
    console.log('📋 Test Suite 1: Basic Permission System');
    console.log('   Testing: whoami, pwd, ls');
    await terminalInput.fill('whoami');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    await terminalInput.fill('pwd');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    await terminalInput.fill('ls');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Test Suite 2: Permission Denied Scenarios
    console.log('📋 Test Suite 2: Permission Denied Scenarios');
    console.log('   Testing: cd /root, cat /etc/shadow, rm /etc/passwd');
    await terminalInput.fill('cd /root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    await terminalInput.fill('cat /etc/shadow');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    await terminalInput.fill('rm /etc/passwd');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Test Suite 3: Root User Escalation
    console.log('📋 Test Suite 3: Root User Escalation');
    console.log('   Testing: su root, root password, root operations');
    await terminalInput.fill('su root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
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
    
    await terminalInput.fill('whoami');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    await terminalInput.fill('cd /root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    await terminalInput.fill('cat /root/secret.txt');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Test Suite 4: User Switching Back
    console.log('📋 Test Suite 4: User Switching Back');
    console.log('   Testing: logout, return to fr4iser');
    await terminalInput.fill('logout');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    await terminalInput.fill('whoami');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Test Suite 5: Permission Error Messages
    console.log('📋 Test Suite 5: Permission Error Messages');
    console.log('   Testing: error messages with hints');
    await terminalInput.fill('cat /root/secret.txt');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    await terminalInput.fill('rm /root/secret.txt');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Test Suite 6: Edge Cases
    console.log('📋 Test Suite 6: Edge Cases');
    console.log('   Testing: path traversal, quoted paths, system files');
    await terminalInput.fill('cat ../../../etc/passwd');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    await terminalInput.fill('cat "/root/secret.txt"');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    await terminalInput.fill('cat /proc/meminfo');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Test Suite 7: Multiple File Operations
    console.log('📋 Test Suite 7: Multiple File Operations');
    console.log('   Testing: rm multiple files, ls with paths');
    await terminalInput.fill('rm /etc/passwd /etc/shadow');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    await terminalInput.fill('ls /root');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Test Suite 8: Cache and Session
    console.log('📋 Test Suite 8: Cache and Session');
    console.log('   Testing: cache-status, session persistence');
    await terminalInput.fill('cache-status');
    await terminalInput.press('Enter');
    await page.waitForTimeout(1000);
    
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
    
    // Analyze test results
    console.log('\n📊 Analyzing Test Results...');
    
    // Check basic permissions
    testResults.basicPermissions = finalOutput.includes('fr4iser') && 
                                  finalOutput.includes('/home/fr4iser') &&
                                  finalOutput.includes('Documents');
    
    // Check error messages
    testResults.errorMessages = finalOutput.includes('Permission denied') &&
                               finalOutput.includes('Hint:') &&
                               finalOutput.includes('Try using \'sudo\'');
    
    // Check root escalation
    testResults.rootEscalation = finalOutput.includes('root@') &&
                                 finalOutput.includes('root') &&
                                 finalOutput.includes('logout');
    
    // Check user switching
    testResults.userSwitching = (finalOutput.match(/fr4iser@/g) || []).length > 0 &&
                                (finalOutput.match(/root@/g) || []).length > 0;
    
    // Check file operations
    testResults.fileOperations = finalOutput.includes('cat:') &&
                                 finalOutput.includes('rm:') &&
                                 finalOutput.includes('No such file or directory');
    
    // Check directory operations
    testResults.directoryOperations = finalOutput.includes('cd:') &&
                                      finalOutput.includes('ls:') &&
                                      finalOutput.includes('Not a directory');
    
    // Calculate overall success
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    const successRate = (passedTests / totalTests) * 100;
    
    console.log('\n📊 COMPREHENSIVE PERMISSION TEST RESULTS:');
    console.log(`   Basic Permissions: ${testResults.basicPermissions ? '✅' : '❌'}`);
    console.log(`   Error Messages: ${testResults.errorMessages ? '✅' : '❌'}`);
    console.log(`   Root Escalation: ${testResults.rootEscalation ? '✅' : '❌'}`);
    console.log(`   User Switching: ${testResults.userSwitching ? '✅' : '❌'}`);
    console.log(`   File Operations: ${testResults.fileOperations ? '✅' : '❌'}`);
    console.log(`   Directory Operations: ${testResults.directoryOperations ? '✅' : '❌'}`);
    console.log(`   Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    
    // Take Screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'comprehensive-permission-test.png', fullPage: true });
    console.log('   Screenshot saved as comprehensive-permission-test.png ✅');
    
    // Final Summary
    const overallSuccess = successRate >= 80; // 80% success rate threshold
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ PERMISSION SYSTEM WORKING!' : '❌ PERMISSION SYSTEM NEEDS ATTENTION'}`);
    
    if (overallSuccess) {
      console.log('🎉 Congratulations! The Terminal Permission System is working correctly!');
    } else {
      console.log('⚠️ Some tests failed. Please review the implementation.');
    }
    
  } catch (error) {
    console.error('❌ Error during comprehensive testing:', error);
  } finally {
    await browser.close();
  }
}

runAllPermissionTests().catch(console.error);
