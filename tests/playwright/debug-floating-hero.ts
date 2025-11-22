import { chromium } from 'playwright';

async function debugFloatingHeroDragArea() {
  console.log('🔍 Debugging FloatingHero Drag Area...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the portfolio
    console.log('📱 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Wait for FloatingHero to load
    await page.waitForSelector('[data-floating-hero]', { timeout: 5000 });
    console.log('✅ FloatingHero loaded!\n');
    
    // Get outer container dimensions
    const outerContainer = await page.evaluate(() => {
      const element = document.querySelector('[data-floating-hero]');
      if (!element) return null;
      
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom
      };
    });
    
    // Get inner element dimensions
    const innerElement = await page.evaluate(() => {
      const element = document.querySelector('[data-floating-hero] .glass-card');
      if (!element) return null;
      
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom
      };
    });
    
    console.log('📦 OUTER CONTAINER (Drag Area):');
    console.log(`  Position: (${Math.round(outerContainer?.x || 0)}, ${Math.round(outerContainer?.y || 0)})`);
    console.log(`  Size: ${Math.round(outerContainer?.width || 0)}x${Math.round(outerContainer?.height || 0)}px`);
    console.log(`  Bounds: left=${Math.round(outerContainer?.left || 0)}, top=${Math.round(outerContainer?.top || 0)}, right=${Math.round(outerContainer?.right || 0)}, bottom=${Math.round(outerContainer?.bottom || 0)}`);
    
    console.log('\n🎨 INNER ELEMENT (Visual Area):');
    console.log(`  Position: (${Math.round(innerElement?.x || 0)}, ${Math.round(innerElement?.y || 0)})`);
    console.log(`  Size: ${Math.round(innerElement?.width || 0)}x${Math.round(innerElement?.height || 0)}px`);
    console.log(`  Bounds: left=${Math.round(innerElement?.left || 0)}, top=${Math.round(innerElement?.top || 0)}, right=${Math.round(innerElement?.right || 0)}, bottom=${Math.round(innerElement?.bottom || 0)}`);
    
    // Calculate invisible areas
    const invisibleLeft = Math.max(0, (innerElement?.left || 0) - (outerContainer?.left || 0));
    const invisibleRight = Math.max(0, (outerContainer?.right || 0) - (innerElement?.right || 0));
    const invisibleTop = Math.max(0, (innerElement?.top || 0) - (outerContainer?.top || 0));
    const invisibleBottom = Math.max(0, (outerContainer?.bottom || 0) - (innerElement?.bottom || 0));
    
    console.log('\n🚫 INVISIBLE DRAG AREAS:');
    console.log(`  Left invisible area: ${Math.round(invisibleLeft)}px`);
    console.log(`  Right invisible area: ${Math.round(invisibleRight)}px`);
    console.log(`  Top invisible area: ${Math.round(invisibleTop)}px`);
    console.log(`  Bottom invisible area: ${Math.round(invisibleBottom)}px`);
    
    // Test clicking in invisible areas
    console.log('\n🧪 Testing clicks in invisible areas...');
    
    // Test left invisible area
    if (invisibleLeft > 0) {
      const testX = (outerContainer?.left || 0) + invisibleLeft / 2;
      const testY = (outerContainer?.top || 0) + (outerContainer?.height || 0) / 2;
      console.log(`\nTesting LEFT invisible area at (${Math.round(testX)}, ${Math.round(testY)})`);
      
      await page.mouse.click(testX, testY);
      console.log('  🖱️ Clicked - should NOT start drag');
    }
    
    // Test right invisible area
    if (invisibleRight > 0) {
      const testX = (outerContainer?.right || 0) - invisibleRight / 2;
      const testY = (outerContainer?.top || 0) + (outerContainer?.height || 0) / 2;
      console.log(`\nTesting RIGHT invisible area at (${Math.round(testX)}, ${Math.round(testY)})`);
      
      await page.mouse.click(testX, testY);
      console.log('  🖱️ Clicked - should NOT start drag');
    }
    
    // Test top invisible area
    if (invisibleTop > 0) {
      const testX = (outerContainer?.left || 0) + (outerContainer?.width || 0) / 2;
      const testY = (outerContainer?.top || 0) + invisibleTop / 2;
      console.log(`\nTesting TOP invisible area at (${Math.round(testX)}, ${Math.round(testY)})`);
      
      await page.mouse.click(testX, testY);
      console.log('  🖱️ Clicked - should NOT start drag');
    }
    
    // Test bottom invisible area
    if (invisibleBottom > 0) {
      const testX = (outerContainer?.left || 0) + (outerContainer?.width || 0) / 2;
      const testY = (outerContainer?.bottom || 0) - invisibleBottom / 2;
      console.log(`\nTesting BOTTOM invisible area at (${Math.round(testX)}, ${Math.round(testY)})`);
      
      await page.mouse.click(testX, testY);
      console.log('  🖱️ Clicked - should NOT start drag');
    }
    
    // Test visible area
    console.log(`\nTesting VISIBLE area at center (${Math.round((innerElement?.left || 0) + (innerElement?.width || 0)/2)}, ${Math.round((innerElement?.top || 0) + (innerElement?.height || 0)/2)})`);
    await page.mouse.click((innerElement?.left || 0) + (innerElement?.width || 0)/2, (innerElement?.top || 0) + (innerElement?.height || 0)/2);
    console.log('  🖱️ Clicked - SHOULD start drag');
    
    // Take screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'debug-floating-hero-drag-area.png', fullPage: true });
    console.log('   Screenshot saved as debug-floating-hero-drag-area.png ✅');
    
    console.log('\n🎉 Drag area debug complete!');
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await browser.close();
  }
}

debugFloatingHeroDragArea().catch(console.error);