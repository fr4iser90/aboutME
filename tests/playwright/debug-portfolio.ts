import { chromium } from 'playwright';

async function debugPortfolio() {
  console.log('🔍 Starting Portfolio Debug...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the portfolio
    console.log('📱 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded successfully!\n');
    
    // Check Hero Section
    console.log('🎯 Checking Hero Section...');
    const heroSection = await page.locator('section').first();
    const heroExists = await heroSection.isVisible();
    console.log(`   Hero Section visible: ${heroExists ? '✅' : '❌'}`);
    
    // Check Hero Centering
    const heroText = await page.locator('h1').first();
    const heroTextExists = await heroText.isVisible();
    console.log(`   Hero Title visible: ${heroTextExists ? '✅' : '❌'}`);
    
    // Check Floating Hero specifically
    const floatingHero = page.locator('.fixed.top-8.left-8');
    const floatingVisible = await floatingHero.isVisible();
    const floatingSize = await floatingHero.boundingBox();
    
    console.log(`   Floating Hero visible: ${floatingVisible ? '✅' : '❌'}`);
    if (floatingSize) {
      console.log(`   Floating Hero size: ${Math.round(floatingSize.width)}x${Math.round(floatingSize.height)}px`);
      console.log(`   Expected: ~256px width, got: ${Math.round(floatingSize.width)}px`);
    }
    
    // Check Projects Grid
    console.log('\n📦 Checking Projects Grid...');
    const projectsSection = await page.locator('#projects');
    const projectsExists = await projectsSection.isVisible();
    console.log(`   Projects Section visible: ${projectsExists ? '✅' : '❌'}`);
    
    // Check the actual grid container
    const projectsGrid = await page.locator('#projects > div > div').last();
    const gridDisplay = await projectsGrid.evaluate(el => {
      return window.getComputedStyle(el).display;
    });
    console.log(`   Grid Display: ${gridDisplay} ${gridDisplay === 'grid' ? '✅' : '❌'}`);
    
    // Check grid template columns
    const gridTemplateColumns = await projectsGrid.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    console.log(`   Grid Template Columns: ${gridTemplateColumns}`);
    
    // Count Project Cards
    const projectCards = await page.locator('#projects .glass-card').count();
    console.log(`   Project Cards found: ${projectCards} ${projectCards > 0 ? '✅' : '❌'}`);
    
    // Check Skills Grid
    console.log('\n🛠️ Checking Skills Grid...');
    const skillsSection = await page.locator('#skills');
    const skillsExists = await skillsSection.isVisible();
    console.log(`   Skills Section visible: ${skillsExists ? '✅' : '❌'}`);
    
    // Check the actual skills grid container
    const skillsGrid = await page.locator('#skills > div > div').last();
    const skillsGridDisplay = await skillsGrid.evaluate(el => {
      return window.getComputedStyle(el).display;
    });
    console.log(`   Skills Grid Display: ${skillsGridDisplay} ${skillsGridDisplay === 'grid' ? '✅' : '❌'}`);
    
    // Check skills grid template columns
    const skillsGridTemplateColumns = await skillsGrid.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    console.log(`   Skills Grid Template Columns: ${skillsGridTemplateColumns}`);
    
    // Count Skill Cards
    const skillCards = await page.locator('#skills .glass-card').count();
    console.log(`   Skill Cards found: ${skillCards} ${skillCards > 0 ? '✅' : '❌'}`);
    
    // Check Glass Effects
    console.log('\n🔮 Checking Glass Effects...');
    const glassCards = await page.locator('.glass-card');
    const glassCount = await glassCards.count();
    console.log(`   Glass Cards found: ${glassCount} ${glassCount > 0 ? '✅' : '❌'}`);
    
    if (glassCount > 0) {
      const firstGlassCard = glassCards.first();
      const glassStyles = await firstGlassCard.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          backdropFilter: styles.backdropFilter,
          backgroundColor: styles.backgroundColor,
          border: styles.border
        };
      });
      console.log(`   Backdrop Filter: ${glassStyles.backdropFilter ? '✅' : '❌'}`);
      console.log(`   Background Color: ${glassStyles.backgroundColor}`);
      console.log(`   Border: ${glassStyles.border}`);
    }
    
    // Check UnoCSS Classes
    console.log('\n⚡ Checking UnoCSS Classes...');
    const unoClasses = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="grid"], [class*="glass"], [class*="neon"]');
      return Array.from(elements).map(el => el.className);
    });
    console.log(`   Elements with UnoCSS classes: ${unoClasses.length} ${unoClasses.length > 0 ? '✅' : '❌'}`);
    
    // Take Screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
    console.log('   Screenshot saved as debug-screenshot.png ✅');
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Hero Section: ${heroExists ? '✅' : '❌'}`);
    console.log(`   Projects Grid: ${gridDisplay === 'grid' ? '✅' : '❌'}`);
    console.log(`   Skills Grid: ${skillsGridDisplay === 'grid' ? '✅' : '❌'}`);
    console.log(`   Glass Effects: ${glassCount > 0 ? '✅' : '❌'}`);
    console.log(`   UnoCSS Classes: ${unoClasses.length > 0 ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await browser.close();
  }
}

debugPortfolio().catch(console.error);
