import { chromium } from 'playwright';

async function testFloatingHeroDragDrop() {
  console.log('🔍 Testing FloatingHero Drag&Drop Boundaries...\n');
  
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
    
    // Get viewport dimensions
    const viewport = await page.viewportSize();
    console.log(`📐 Viewport: ${viewport?.width}x${viewport?.height}px`);
    
    // Get header and footer heights
    const headerHeight = await page.evaluate(() => {
      const header = document.querySelector('.header');
      return header ? header.getBoundingClientRect().height : 0;
    });
    
    const footerHeight = await page.evaluate(() => {
      const footer = document.querySelector('.footer');
      return footer ? footer.getBoundingClientRect().height : 0;
    });
    
    console.log(`📏 Header height: ${headerHeight}px`);
    console.log(`📏 Footer height: ${footerHeight}px`);
    
    // Get FloatingHero dimensions
    const heroBox = await page.locator('[data-floating-hero]').boundingBox();
    console.log(`📦 FloatingHero size: ${Math.round(heroBox?.width || 0)}x${Math.round(heroBox?.height || 0)}px`);
    
    // Calculate expected boundaries
    const expectedMinX = 0;
    const expectedMaxX = (viewport?.width || 0) - (heroBox?.width || 0);
    const expectedMinY = headerHeight;
    const expectedMaxY = (viewport?.height || 0) - footerHeight - (heroBox?.height || 0);
    
    console.log(`🎯 Expected boundaries:`);
    console.log(`   X: ${expectedMinX} to ${expectedMaxX}px`);
    console.log(`   Y: ${expectedMinY} to ${expectedMaxY}px\n`);
    
    // Test dragging to each boundary
    const tests = [
      { name: 'Left edge', x: -100, y: 200, expectedX: expectedMinX },
      { name: 'Right edge', x: (viewport?.width || 0) + 100, y: 200, expectedX: expectedMaxX },
      { name: 'Top edge', x: 200, y: -100, expectedY: expectedMinY },
      { name: 'Bottom edge', x: 200, y: (viewport?.height || 0) + 100, expectedY: expectedMaxY },
      { name: 'Corner (top-left)', x: -100, y: -100, expectedX: expectedMinX, expectedY: expectedMinY },
      { name: 'Corner (bottom-right)', x: (viewport?.width || 0) + 100, y: (viewport?.height || 0) + 100, expectedX: expectedMaxX, expectedY: expectedMaxY }
    ];
    
    console.log('🧪 Testing drag boundaries...\n');
    
    for (const test of tests) {
      console.log(`Testing ${test.name}...`);
      
      // Get initial position
      const initialBox = await page.locator('[data-floating-hero]').boundingBox();
      const initialX = initialBox?.x || 0;
      const initialY = initialBox?.y || 0;
      
      // Simulate drag to test position
      await page.mouse.move(initialX + (heroBox?.width || 0)/2, initialY + (heroBox?.height || 0)/2);
      await page.mouse.down();
      await page.mouse.move(test.x, test.y);
      await page.mouse.up();
      
      // Wait a bit for the constraint to apply
      await page.waitForTimeout(100);
      
      // Get final position
      const finalBox = await page.locator('[data-floating-hero]').boundingBox();
      const finalX = Math.round(finalBox?.x || 0);
      const finalY = Math.round(finalBox?.y || 0);
      
      // Check if constraints worked
      const xCorrect = test.expectedX !== undefined ? finalX === test.expectedX : true;
      const yCorrect = test.expectedY !== undefined ? finalY === test.expectedY : true;
      
      console.log(`   Initial: (${Math.round(initialX)}, ${Math.round(initialY)})`);
      console.log(`   Dragged to: (${test.x}, ${test.y})`);
      console.log(`   Final: (${finalX}, ${finalY})`);
      console.log(`   Expected X: ${test.expectedX}, Got: ${finalX} ${xCorrect ? '✅' : '❌'}`);
      console.log(`   Expected Y: ${test.expectedY}, Got: ${finalY} ${yCorrect ? '✅' : '❌'}`);
      console.log(`   Result: ${xCorrect && yCorrect ? '✅ PASS' : '❌ FAIL'}\n`);
      
      // Reset position for next test
      await page.mouse.move(finalX + (heroBox?.width || 0)/2, finalY + (heroBox?.height || 0)/2);
      await page.mouse.down();
      await page.mouse.move(initialX + (heroBox?.width || 0)/2, initialY + (heroBox?.height || 0)/2);
      await page.mouse.up();
      await page.waitForTimeout(100);
    }
    
    // Take screenshot of final state
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'debug-floating-hero-borders.png', fullPage: true });
    console.log('   Screenshot saved as debug-floating-hero-borders.png ✅');
    
    console.log('\n🎉 Drag&Drop boundary testing complete!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testFloatingHeroDragDrop().catch(console.error);
