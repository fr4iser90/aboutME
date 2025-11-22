import { chromium } from 'playwright';

async function testPreviewIframe() {
  console.log('🚀 Starting Preview Iframe Test');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Step 1: Go to login page
    console.log('📍 Step 1: Going to login page');
    await page.goto('http://localhost:3000/login');
    
    // Step 2: Login
    console.log('📍 Step 2: Logging in');
    await page.fill('input[name="password"]', 'WaAkaEQ&5QM^W0!F');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Check if login was successful
    const currentUrl = page.url();
    console.log('🔍 URL after login:', currentUrl);
    
    // Check cookies
    const cookies = await page.context().cookies();
    console.log('🍪 Cookies after login:', cookies.map(c => `${c.name}=${c.value}`));
    
    // Step 3: Go to editor
    console.log('📍 Step 3: Going to editor');
    await page.goto('http://localhost:3000/editor');
    
    // Wait for editor to load
    await page.waitForTimeout(3000);
    
    // Check browser console for session detection
    page.on('console', msg => {
      if (msg.text().includes('📡') || msg.text().includes('🍪') || msg.text().includes('❌') || msg.text().includes('✅')) {
        console.log('🖥️ Editor console:', msg.type(), msg.text());
      }
    });
    
    // Step 4: Check if editor loaded
    const editorLoaded = await page.locator('.editor-component').isVisible();
    console.log('🔍 Editor loaded:', editorLoaded);
    
    if (!editorLoaded) {
      console.log('❌ Editor not loaded');
      return;
    }
    
    // Check cookies in editor
    const editorCookies = await page.context().cookies();
    console.log('🍪 Cookies in editor:', editorCookies.map(c => `${c.name}=${c.value}`));
    
    // Check iframe src
    const iframeSrcAfterLoad = await page.locator('.editor-component__preview-frame').getAttribute('src');
    console.log('🔍 Iframe src after editor load:', iframeSrcAfterLoad);
    
    // Step 5: Check if preview panel exists
    const previewPanel = await page.locator('.editor-component__preview-panel').isVisible();
    console.log('🔍 Preview panel visible:', previewPanel);
    
    // Step 6: Check if iframe exists
    const iframe = await page.locator('.editor-component__preview-frame').isVisible();
    console.log('🔍 Iframe visible:', iframe);
    
    // Step 7: Check iframe src
    const iframeSrc = await page.locator('.editor-component__preview-frame').getAttribute('src');
    console.log('🔍 Iframe src:', iframeSrc);
    
    // Step 8: Check if iframe loads
    console.log('📍 Step 8: Checking iframe load');
    
    // Listen for iframe load events
    page.on('response', response => {
      if (response.url().includes('/preview')) {
        console.log('🌐 Preview response:', response.status(), response.url());
      }
    });
    
    // Wait for iframe to load
    await page.waitForTimeout(5000);
    
    // Step 9: Check iframe content
    try {
      const iframeElement = page.locator('.editor-component__preview-frame');
      const iframeContent = await iframeElement.textContent();
      console.log('🔍 Iframe content length:', iframeContent ? iframeContent.length : 0);
      
      if (iframeContent && iframeContent.length > 0) {
        console.log('✅ Iframe loaded successfully');
      } else {
        console.log('❌ Iframe content empty');
      }
    } catch (error) {
      console.log('❌ Error accessing iframe content:', (error as Error).message);
    }
    
    // Step 10: Test direct preview access
    console.log('📍 Step 10: Testing direct preview access');
    
    // Open preview in new tab
    const previewPage = await browser.newPage();
    await previewPage.goto('http://localhost:3000/preview');
    
    // Wait for preview to load
    await previewPage.waitForLoadState('networkidle', { timeout: 10000 });
    
    const previewUrl = previewPage.url();
    console.log('🔍 Preview URL:', previewUrl);
    
    // Check if preview loaded
    const previewContent = await previewPage.textContent('body');
    console.log('🔍 Preview content length:', previewContent ? previewContent.length : 0);
    
    if (previewContent && previewContent.length > 0) {
      console.log('✅ Preview loaded successfully');
    } else {
      console.log('❌ Preview content empty');
    }
    
    // Close preview page
    await previewPage.close();
    
    // Step 11: Test Firefox-specific iframe issue
    console.log('📍 Step 11: Testing Firefox iframe issue');
    
    // Check browser console for errors
    page.on('console', msg => {
      console.log('🖥️ Browser console:', msg.type(), msg.text());
    });
    
    // Check for iframe (error as Error).messages
    const iframeError = await page.locator('text=Firefox Can\'t Open This Page').isVisible();
    console.log('🔍 Firefox iframe error visible:', iframeError);
    
    // Take screenshot
    await page.screenshot({ path: 'test-preview-iframe-result.png' });
    console.log('📸 Screenshot saved as test-preview-iframe-result.png');
    
    console.log('✅ Preview Iframe Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testPreviewIframe();
