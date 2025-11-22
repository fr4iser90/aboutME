import { chromium } from 'playwright';

async function testSimpleLogin() {
  console.log('🔒 Starting Simple Login Test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set up event listeners before navigation
  const logs: string[] = [];
  page.on('console', msg => {
    logs.push(`Console ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/auth/login')) {
      console.log(`API Response: ${response.status()} ${response.statusText()}`);
    }
  });
  
  try {
    // Go to login page
    console.log('📝 Going to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Check if form is visible
    const formVisible = await page.locator('form').isVisible();
    console.log(`Form visible: ${formVisible ? '✅' : '❌'}`);
    
    const passwordInput = await page.locator('input[type="password"]').isVisible();
    console.log(`Password input visible: ${passwordInput ? '✅' : '❌'}`);
    
    const submitButton = await page.locator('button[type="submit"]').isVisible();
    console.log(`Submit button visible: ${submitButton ? '✅' : '❌'}`);
    
    // Fill password
    console.log('🔑 Filling password...');
    await page.fill('input[type="password"]', 'your-super-secure-admin-password-here-123456789');
    
    // Click submit
    console.log('🚀 Clicking submit...');
    await page.click('button[type="submit"]');
    
    // Wait for response
    console.log('⏳ Waiting for response...');
    await page.waitForTimeout(5000);
    
    if (logs.length > 0) {
      console.log('Console logs:');
      logs.forEach(log => console.log(`  ${log}`));
    }
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Check for error message
    const errorMessage = await page.locator('text=/error|invalid/i').isVisible();
    console.log(`Error message visible: ${errorMessage ? '✅' : '❌'}`);
    
    if (errorMessage) {
      const errorText = await page.locator('text=/error|invalid/i').textContent();
      console.log(`Error text: "${errorText}"`);
    }
    
    // Check if redirected to editor
    const isRedirectedToEditor = currentUrl.includes('/editor');
    console.log(`Redirected to editor: ${isRedirectedToEditor ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  } finally {
    await browser.close();
  }
}

testSimpleLogin();
