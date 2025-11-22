import { chromium } from 'playwright';

/**
 * 🎯 LIVE PREVIEW EDITOR TEST
 * 
 * Tests:
 * - Editor with Portfolio Live Preview
 * - Preview Mode Toggle (HTML vs Portfolio)
 * - Live Updates via Message Passing
 * - Real-time Content Changes
 * - iframe Communication
 */

async function testLivePreviewEditor() {
  console.log('🎯 Starting Live Preview Editor Test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test 1: Login and Access Editor
    console.log('🔐 Test 1: Login and Access Editor');
    await testLoginAndAccessEditor(page);
    
    // Test 2: Preview Mode Toggle
    console.log('\n🔄 Test 2: Preview Mode Toggle');
    await testPreviewModeToggle(page);
    
    // Test 3: Live Portfolio Preview
    console.log('\n👁️ Test 3: Live Portfolio Preview');
    await testLivePortfolioPreview(page);
    
    // Test 4: Real-time Updates
    console.log('\n⚡ Test 4: Real-time Updates');
    await testRealTimeUpdates(page);
    
    // Test 5: iframe Communication
    console.log('\n📡 Test 5: iframe Communication');
    await testIframeCommunication(page);
    
    console.log('\n🎉 All live preview tests completed!');
    
  } catch (error) {
    console.error('❌ Error during live preview testing:', error);
  } finally {
    await browser.close();
  }
}

async function testLoginAndAccessEditor(page: any) {
  try {
    // Login
    console.log('   🔑 Logging in...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Check if redirected to editor
    const currentUrl = page.url();
    const isInEditor = currentUrl.includes('/editor');
    console.log(`   Current URL: ${currentUrl}`);
    console.log(`   In editor: ${isInEditor ? '✅' : '❌'}`);
    
    // Check for editor elements
    const editorContainer = page.locator('.editor-container');
    const editorExists = await editorContainer.isVisible();
    console.log(`   Editor container visible: ${editorExists ? '✅' : '❌'}`);
    
    // Check for sidebar
    const sidebar = page.locator('.sidebar');
    const sidebarExists = await sidebar.isVisible();
    console.log(`   Sidebar visible: ${sidebarExists ? '✅' : '❌'}`);
    
    // Check for main content (use more specific selector)
    const mainContent = page.locator('.main-content').first();
    const mainContentExists = await mainContent.isVisible();
    console.log(`   Main content visible: ${mainContentExists ? '✅' : '❌'}`);
    
    // Wait for files to load and check
    console.log('   📁 Waiting for files to load...');
    await page.waitForTimeout(3000);
    
    const fileItems = page.locator('.file-item');
    const fileCount = await fileItems.count();
    console.log(`   Files loaded: ${fileCount}`);
    
    if (fileCount === 0) {
      console.log('   ⚠️ No files loaded - checking API...');
      
      // Try to check API directly
      const response = await page.request.get('http://localhost:3000/api/editor/files');
      console.log(`   API Status: ${response.status()}`);
      
      if (response.status() === 200) {
        const data = await response.json();
        console.log(`   API Response: ${JSON.stringify(data)}`);
      } else {
        console.log(`   API Error: ${response.status()}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing login and editor access:', (error as Error).message);
  }
}

async function testPreviewModeToggle(page: any) {
  try {
    // Check for preview mode toggle buttons
    console.log('   🔄 Checking preview mode toggle...');
    
    const htmlButton = page.locator('button').filter({ hasText: '📝 HTML' });
    const portfolioButton = page.locator('button').filter({ hasText: '🏠 Portfolio' });
    
    const htmlButtonExists = await htmlButton.isVisible();
    const portfolioButtonExists = await portfolioButton.isVisible();
    
    console.log(`   HTML button visible: ${htmlButtonExists ? '✅' : '❌'}`);
    console.log(`   Portfolio button visible: ${portfolioButtonExists ? '✅' : '❌'}`);
    
    if (htmlButtonExists && portfolioButtonExists) {
      // Test HTML mode
      console.log('   📝 Testing HTML mode...');
      await htmlButton.click();
      await page.waitForTimeout(1000);
      
      const htmlPreview = page.locator('.preview-content');
      const htmlPreviewExists = await htmlPreview.isVisible();
      console.log(`   HTML preview visible: ${htmlPreviewExists ? '✅' : '❌'}`);
      
      // Test Portfolio mode
      console.log('   🏠 Testing Portfolio mode...');
      await portfolioButton.click();
      await page.waitForTimeout(2000);
      
      const portfolioIframe = page.locator('.portfolio-preview-frame');
      const portfolioIframeExists = await portfolioIframe.isVisible();
      console.log(`   Portfolio iframe visible: ${portfolioIframeExists ? '✅' : '❌'}`);
      
      // Check iframe src
      if (portfolioIframeExists) {
        const iframeSrc = await portfolioIframe.getAttribute('src');
        console.log(`   iframe src: ${iframeSrc}`);
        console.log(`   iframe src correct: ${iframeSrc === '/preview' ? '✅' : '❌'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing preview mode toggle:', (error as Error).message);
  }
}

async function testLivePortfolioPreview(page: any) {
  try {
    // Ensure we're in portfolio mode
    console.log('   👁️ Testing live portfolio preview...');
    
    const portfolioButton = page.locator('button').filter({ hasText: '🏠 Portfolio' });
    await portfolioButton.click();
    await page.waitForTimeout(2000);
    
    // Check iframe
    const portfolioIframe = page.locator('.portfolio-preview-frame');
    const iframeExists = await portfolioIframe.isVisible();
    console.log(`   Portfolio iframe visible: ${iframeExists ? '✅' : '❌'}`);
    
    if (iframeExists) {
      // Try to access iframe content
      const iframe = await portfolioIframe.elementHandle();
      if (iframe) {
        const iframeContent = await iframe.contentFrame();
        if (iframeContent) {
          console.log('   📄 iframe content accessible: ✅');
          
          // Check for preview header
          const previewHeader = iframeContent.locator('.preview-header');
          const headerExists = await previewHeader.isVisible();
          console.log(`   Preview header visible: ${headerExists ? '✅' : '❌'}`);
          
          // Check for live status
          const liveStatus = iframeContent.locator('.status-indicator');
          const liveStatusExists = await liveStatus.isVisible();
          console.log(`   Live status visible: ${liveStatusExists ? '✅' : '❌'}`);
          
          if (liveStatusExists) {
            const liveText = await liveStatus.textContent();
            console.log(`   Live status text: "${liveText}"`);
          }
          
          // Check what's actually in the iframe
          const iframeBody = await iframeContent.locator('body').textContent();
          console.log(`   iframe content preview: "${iframeBody?.substring(0, 100)}..."`);
          
          // Check if it's still loading
          const loadingText = iframeContent.locator('text=Loading Portfolio Preview');
          const isLoading = await loadingText.isVisible();
          console.log(`   Still loading: ${isLoading ? '✅' : '❌'}`);
          
          // Check for any error messages
          const errorText = iframeContent.locator('text=Error');
          const hasError = await errorText.isVisible();
          console.log(`   Has error: ${hasError ? '✅' : '❌'}`);
          
          if (hasError) {
            const errorContent = await errorText.textContent();
            console.log(`   Error message: "${errorContent}"`);
          }
        } else {
          console.log('   📄 iframe content not accessible: ❌');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing live portfolio preview:', (error as Error).message);
  }
}

async function testRealTimeUpdates(page: any) {
  try {
    // Ensure we're in portfolio mode
    console.log('   ⚡ Testing real-time updates...');
    
    const portfolioButton = page.locator('button').filter({ hasText: '🏠 Portfolio' });
    await portfolioButton.click();
    await page.waitForTimeout(2000);
    
    // Load a file to edit
    console.log('   📁 Loading a file to edit...');
    const fileItems = page.locator('.file-item');
    const fileCount = await fileItems.count();
    console.log(`   Files available: ${fileCount}`);
    
    if (fileCount > 0) {
      // Click on first file
      await fileItems.first().click();
      await page.waitForTimeout(1000);
      
      // Check if editor is populated
      const textarea = page.locator('.editor-textarea');
      const textareaExists = await textarea.isVisible();
      console.log(`   Editor textarea visible: ${textareaExists ? '✅' : '❌'}`);
      
      if (textareaExists) {
        // Get current content
        const currentContent = await textarea.inputValue();
        console.log(`   Current content length: ${currentContent.length}`);
        
        // Make a change
        console.log('   ✏️ Making content change...');
        const newContent = currentContent + '\n\n<!-- Test update -->';
        await textarea.fill(newContent);
        await page.waitForTimeout(2000);
        
        // Check if iframe received update
        const portfolioIframe = page.locator('.portfolio-preview-frame');
        const iframe = await portfolioIframe.elementHandle();
        
        if (iframe) {
          const iframeContent = await iframe.contentFrame();
          if (iframeContent) {
            // Check for updated timestamp
            const lastUpdated = iframeContent.locator('.preview-status');
            const lastUpdatedExists = await lastUpdated.isVisible();
            console.log(`   Last updated visible: ${lastUpdatedExists ? '✅' : '❌'}`);
            
            if (lastUpdatedExists) {
              const updatedText = await lastUpdated.textContent();
              console.log(`   Updated text: "${updatedText}"`);
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing real-time updates:', (error as Error).message);
  }
}

async function testIframeCommunication(page: any) {
  try {
    console.log('   📡 Testing iframe communication...');
    
    // Ensure we're in portfolio mode
    const portfolioButton = page.locator('button').filter({ hasText: '🏠 Portfolio' });
    await portfolioButton.click();
    await page.waitForTimeout(2000);
    
    // Test message passing
    console.log('   📤 Testing message passing...');
    
    const portfolioIframe = page.locator('.portfolio-preview-frame');
    const iframe = await portfolioIframe.elementHandle();
    
    if (iframe) {
      const iframeContent = await iframe.contentFrame();
      if (iframeContent) {
        // Send test message
        await iframeContent.evaluate(() => {
          window.postMessage({
            type: 'UPDATE_PORTFOLIO',
            data: { test: 'message', timestamp: Date.now() }
          }, '*');
        });
        
        await page.waitForTimeout(1000);
        
        // Check if message was received
        const testResult = await iframeContent.evaluate(() => {
          return (window as any).lastReceivedMessage || null;
        });
        
        console.log(`   Message received: ${testResult ? '✅' : '❌'}`);
        if (testResult) {
          console.log(`   Message data: ${JSON.stringify(testResult)}`);
        }
      }
    }
    
    // Test editor to iframe communication
    console.log('   📤 Testing editor to iframe communication...');
    
    // Load a file and make changes
    const fileItems = page.locator('.file-item');
    const fileCount = await fileItems.count();
    
    if (fileCount > 0) {
      await fileItems.first().click();
      await page.waitForTimeout(1000);
      
      const textarea = page.locator('.editor-textarea');
      await textarea.fill('{"test": "iframe communication", "timestamp": ' + Date.now() + '}');
      await page.waitForTimeout(2000);
      
      // Check if iframe received the update
      if (iframe) {
        const iframeContent = await iframe.contentFrame();
        if (iframeContent) {
          const receivedData = await iframeContent.evaluate(() => {
            return (window as any).lastPortfolioUpdate || null;
          });
          
          console.log(`   Portfolio update received: ${receivedData ? '✅' : '❌'}`);
          if (receivedData) {
            console.log(`   Update data: ${JSON.stringify(receivedData)}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing iframe communication:', (error as Error).message);
  }
}

// Run the tests
testLivePreviewEditor().catch(console.error);
