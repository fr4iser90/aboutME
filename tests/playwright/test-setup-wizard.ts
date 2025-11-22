import { chromium } from 'playwright';

async function testSetupWizardFlow() {
  console.log('🚀 Starting Complete Setup Wizard Flow Test');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Step 1: Go to homepage
    console.log('📍 Step 1: Going to homepage');
    await page.goto('http://localhost:3000');
    
    // Check initial URL
    let currentUrl = page.url();
    console.log('🔍 Initial URL:', currentUrl);
    
    // Step 2: Check if redirected to setup (expected for unconfigured portfolio)
    if (currentUrl.includes('/setup')) {
      console.log('✅ Redirected to setup page (portfolio unconfigured)');
      
      // Wait for setup page to load
      await page.waitForTimeout(2000);
      
      // Check if setup wizard is shown
      const setupWizard = await page.locator('.setup-wizard').isVisible();
      console.log('🔍 Setup wizard container visible:', setupWizard);
      
      const setupTitle = await page.locator('text=Portfolio Setup Required').isVisible();
      console.log('🔍 Setup title visible:', setupTitle);
      
      const wizardTitle = await page.locator('text=Portfolio Setup Wizard').isVisible();
      console.log('🔍 Wizard title visible:', wizardTitle);
      
      // Step 3: Try to interact with setup wizard
      console.log('📍 Step 3: Interacting with setup wizard');
      
      // Check for GitHub input
      const githubInput = await page.locator('input[placeholder*="GitHub"]').isVisible();
      console.log('🔍 GitHub input visible:', githubInput);
      
      // Try different selectors for GitHub input
      const githubInputAlt = await page.locator('input[type="text"]').first().isVisible();
      console.log('🔍 GitHub input (alt) visible:', githubInputAlt);
      
      if (githubInput) {
        await page.fill('input[placeholder*="GitHub"]', 'testuser');
        console.log('✅ Filled GitHub username');
      } else if (githubInputAlt) {
        await page.fill('input[type="text"]', 'testuser');
        console.log('✅ Filled GitHub username (alt)');
      }
      
      // Check for next button
      const nextButton = await page.locator('button:has-text("Next")').isVisible();
      console.log('🔍 Next button visible:', nextButton);
      
      if (nextButton) {
        await page.click('button:has-text("Next")');
        console.log('✅ Clicked Next button');
        await page.waitForTimeout(1000);
      }
      
      // Check for generate button
      const generateButton = await page.locator('button:has-text("Generate")').isVisible();
      console.log('🔍 Generate button visible:', generateButton);
      
      if (generateButton) {
        await page.click('button:has-text("Generate")');
        console.log('✅ Clicked Generate button');
        await page.waitForTimeout(3000);
      }
      
    } else if (currentUrl.includes('/login')) {
      console.log('✅ Redirected to login page (portfolio unconfigured)');
      
      // Check if password info is shown
      const passwordInfo = await page.locator('text=No password set?').isVisible();
      console.log('🔍 Password info visible:', passwordInfo);
      
      // Step 3: Login with correct password
      console.log('📍 Step 3: Logging in with correct password');
      await page.fill('input[name="password"]', 'WaAkaEQ&5QM^W0!F');
      
      // Listen for console logs
      page.on('console', msg => {
        console.log('🖥️ Browser console:', msg.text());
      });
      
      // Listen for network requests
      page.on('request', request => {
        console.log('🌐 Request:', request.method(), request.url());
      });
      
      page.on('response', response => {
        console.log('🌐 Response:', response.status(), response.url());
      });
      
      await page.click('button[type="submit"]');
      
      // Wait for redirect with longer timeout
      try {
        await page.waitForLoadState('networkidle', { timeout: 15000 });
      } catch (error) {
        console.log('⚠️ Network idle timeout, checking current state...');
        const currentUrl = page.url();
        console.log('🔍 Current URL after timeout:', currentUrl);
        
        // Check if we're still on login page
        if (currentUrl.includes('/login')) {
          console.log('❌ Still on login page - login failed');
          
          // Check for error messages
          const errorElement = await page.locator('.login-card__error').isVisible();
          if (errorElement) {
            const errorText = await page.locator('.login-card__error').textContent();
            console.log('🔍 Error message:', errorText);
          }
          
          // Check page content
          const pageContent = await page.textContent('body');
          console.log('🔍 Page content:', pageContent);
          
          return; // Exit early
        }
      }
      
      // Check URL after login
      currentUrl = page.url();
      console.log('🔍 URL after login:', currentUrl);
      
      // Step 4: Check if we're on homepage
      if (currentUrl === 'http://localhost:3000/' || currentUrl === 'http://localhost:3000') {
        console.log('✅ Successfully redirected to homepage');
        
        // Step 5: Check if setup wizard is shown
        console.log('📍 Step 5: Checking for setup wizard');
        
        // Wait a bit for any dynamic content to load
        await page.waitForTimeout(2000);
        
        // Check for setup wizard elements
        const setupWizard = await page.locator('.setup-wizard').isVisible();
        console.log('🔍 Setup wizard container visible:', setupWizard);
        
        const setupTitle = await page.locator('text=Portfolio Setup Required').isVisible();
        console.log('🔍 Setup title visible:', setupTitle);
        
        const wizardTitle = await page.locator('text=Portfolio Setup Wizard').isVisible();
        console.log('🔍 Wizard title visible:', wizardTitle);
        
        // Check for wizard steps
        const step1 = await page.locator('text=Step 1').isVisible();
        console.log('🔍 Step 1 visible:', step1);
        
        const githubInput = await page.locator('input[placeholder*="GitHub"]').isVisible();
        console.log('🔍 GitHub input visible:', githubInput);
        
        // Check page content
        const pageContent = await page.textContent('body');
        console.log('🔍 Page content preview:', pageContent?.substring(0, 500) || 'No content');
        
        // Step 6: Try to interact with setup wizard
        if (setupWizard || setupTitle || wizardTitle) {
          console.log('📍 Step 6: Interacting with setup wizard');
          
          // Try to fill GitHub username
          if (githubInput) {
            await page.fill('input[placeholder*="GitHub"]', 'testuser');
            console.log('✅ Filled GitHub username');
          }
          
          // Check for next button
          const nextButton = await page.locator('button:has-text("Next")').isVisible();
          console.log('🔍 Next button visible:', nextButton);
          
          if (nextButton) {
            await page.click('button:has-text("Next")');
            console.log('✅ Clicked Next button');
            await page.waitForTimeout(1000);
          }
          
          // Check for generate button
          const generateButton = await page.locator('button:has-text("Generate")').isVisible();
          console.log('🔍 Generate button visible:', generateButton);
          
        } else {
          console.log('❌ Setup wizard not found');
          
          // Check what's actually on the page
          const allText = await page.textContent('body');
          console.log('🔍 All page text:', allText);
        }
        
      } else {
        console.log('❌ Not redirected to homepage, current URL:', currentUrl);
      }
      
    } else {
      console.log('❌ Not redirected to login page');
      console.log('🔍 Current URL:', currentUrl);
      
      // Check if portfolio is already configured
      const portfolioContent = await page.textContent('body');
      console.log('🔍 Portfolio content preview:', portfolioContent?.substring(0, 200) || 'No content');
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-setup-wizard-result.png' });
    console.log('📸 Screenshot saved as test-setup-wizard-result.png');
    
    // Check browser console logs
    page.on('console', msg => {
      console.log('🖥️ Browser console:', msg.text());
    });
    
    console.log('✅ Setup Wizard Flow Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testSetupWizardFlow();