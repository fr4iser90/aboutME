import { chromium } from 'playwright';

async function testModalsPerformance() {
  console.log('🔍 Testing Modals Performance with Pre-parsed HTML...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the portfolio
    console.log('📱 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded successfully!\n');
    
    // Test 1: BlogModal
    console.log('📝 Testing BlogModal...');
    await testBlogModal(page);
    
    // Test 2: ProjectModal
    console.log('\n🚀 Testing ProjectModal...');
    await testProjectModal(page);
    
    // Test 3: YearOverviewModal
    console.log('\n📅 Testing YearOverviewModal...');
    await testYearOverviewModal(page);
    
    console.log('\n🎉 All modal tests completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
}

async function testBlogModal(page: any) {
  try {
    // Find and click a blog post
    const blogCard = page.locator('[class*="card"], [class*="blog"]').filter({ hasText: /Development|Featured/i }).first();
    const blogExists = await blogCard.isVisible();
    console.log(`   Blog card visible: ${blogExists ? '✅' : '❌'}`);
    
    if (!blogExists) {
      console.log('❌ No blog cards found!');
      return;
    }
    
    // Click blog card
    console.log('🖱️ Clicking blog card...');
    await blogCard.click({ force: true });
    await page.waitForTimeout(2000);
    
    // Check if BlogModal is open
    const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    const modalOpen = await modal.isVisible();
    console.log(`   BlogModal visible: ${modalOpen ? '✅' : '❌'}`);
    
    if (!modalOpen) {
      console.log('❌ BlogModal not open!');
      return;
    }
    
    // Check for content
    const contentArea = modal.locator('.about-content, [class*="content"]').first();
    const contentExists = await contentArea.isVisible();
    console.log(`   Content area visible: ${contentExists ? '✅' : '❌'}`);
    
    if (contentExists) {
      const contentText = await contentArea.textContent();
      console.log(`   Content length: ${contentText?.length || 0} characters`);
      console.log(`   Content preview: "${contentText?.substring(0, 100)}..."`);
    }
    
    // Check for sidebar
    const sidebar = modal.locator('.about-sidebar, [class*="sidebar"]').first();
    const sidebarExists = await sidebar.isVisible();
    console.log(`   Sidebar visible: ${sidebarExists ? '✅' : '❌'}`);
    
    // Close modal
    const closeButton = modal.locator('button').filter({ hasText: /✕|close/i }).first();
    await closeButton.click({ force: true });
    await page.waitForTimeout(1000);
    
  } catch (error) {
    console.error('❌ Error testing BlogModal:', (error as Error).message);
  }
}

async function testProjectModal(page: any) {
  try {
    // Find and click a project card (look for specific project names)
    const projectCard = page.locator('.project-card, [class*="project-card"]').filter({ hasText: /PIDEA|Codebreaker|NixOS/i }).first();
    const projectExists = await projectCard.isVisible();
    console.log(`   Project card visible: ${projectExists ? '✅' : '❌'}`);
    
    if (!projectExists) {
      console.log('❌ No project cards found!');
      return;
    }
    
    // Click project card
    console.log('🖱️ Clicking project card...');
    await projectCard.click({ force: true });
    await page.waitForTimeout(2000);
    
    // Check if ProjectModal is open
    const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    const modalOpen = await modal.isVisible();
    console.log(`   ProjectModal visible: ${modalOpen ? '✅' : '❌'}`);
    
    if (!modalOpen) {
      console.log('❌ ProjectModal not open!');
      return;
    }
    
    // Check for content
    const contentArea = modal.locator('.about-content, [class*="content"]').first();
    const contentExists = await contentArea.isVisible();
    console.log(`   Content area visible: ${contentExists ? '✅' : '❌'}`);
    
    if (contentExists) {
      const contentText = await contentArea.textContent();
      console.log(`   Content length: ${contentText?.length || 0} characters`);
    }
    
    // Check for sidebar
    const sidebar = modal.locator('.about-sidebar, [class*="sidebar"]').first();
    const sidebarExists = await sidebar.isVisible();
    console.log(`   Sidebar visible: ${sidebarExists ? '✅' : '❌'}`);
    
    // Test scroll spy
    if (contentExists && sidebarExists) {
      console.log('🧪 Testing scroll spy...');
      
      // Scroll down
      await contentArea.evaluate((el: any) => el.scrollTop = 500);
      await page.waitForTimeout(1000);
      
      // Check active nav item
      const activeNavItem = sidebar.locator('.sidebar-nav-item.active').first();
      const activeText = await activeNavItem.textContent();
      console.log(`   Active nav item after scroll: "${activeText}"`);
    }
    
    // Close modal
    const closeButton = modal.locator('button').filter({ hasText: /✕|close/i }).first();
    await closeButton.click({ force: true });
    await page.waitForTimeout(1000);
    
  } catch (error) {
    console.error('❌ Error testing ProjectModal:', (error as Error).message);
  }
}

async function testYearOverviewModal(page: any) {
  try {
    // Find and click Skills Timeline Card
    const timelineCard = page.locator('[class*="card"], [class*="timeline"], [class*="skill"]').filter({ hasText: /timeline|Timeline|Skills/i }).first();
    const timelineExists = await timelineCard.isVisible();
    console.log(`   Skills Timeline Card visible: ${timelineExists ? '✅' : '❌'}`);
    
    if (!timelineExists) {
      console.log('❌ Skills Timeline Card not found!');
      return;
    }
    
    // Click Skills Timeline Card
    console.log('🖱️ Clicking Skills Timeline Card...');
    await timelineCard.click({ force: true });
    await page.waitForTimeout(2000);
    
    // Click first year card
    const yearCards = page.locator('.timeline-card').filter({ hasText: /202[0-9]/ });
    const yearCount = await yearCards.count();
    console.log(`   Found ${yearCount} year cards`);
    
    if (yearCount === 0) {
      console.log('❌ No year cards found!');
      return;
    }
    
    console.log('🖱️ Clicking first year card...');
    await yearCards.first().click({ force: true });
    await page.waitForTimeout(2000);
    
    // Check if YearOverviewModal is open
    const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    const modalOpen = await modal.isVisible();
    console.log(`   YearOverviewModal visible: ${modalOpen ? '✅' : '❌'}`);
    
    if (!modalOpen) {
      console.log('❌ YearOverviewModal not open!');
      return;
    }
    
    // Check for content
    const contentArea = modal.locator('.about-content').first();
    const contentExists = await contentArea.isVisible();
    console.log(`   Content area visible: ${contentExists ? '✅' : '❌'}`);
    
    if (contentExists) {
      // Check if content is scrollable
      const scrollHeight = await contentArea.evaluate((el: any) => el.scrollHeight);
      const clientHeight = await contentArea.evaluate((el: any) => el.clientHeight);
      console.log(`   Scroll height: ${scrollHeight}, Client height: ${clientHeight}`);
      console.log(`   Content scrollable: ${scrollHeight > clientHeight ? '✅' : '❌'}`);
    }
    
    // Check for sidebar
    const sidebar = modal.locator('.about-sidebar').first();
    const sidebarExists = await sidebar.isVisible();
    console.log(`   Sidebar visible: ${sidebarExists ? '✅' : '❌'}`);
    
    // Test scroll spy
    if (contentExists && sidebarExists) {
      console.log('🧪 Testing scroll spy...');
      
      // Scroll to skills section
      await contentArea.evaluate((el: any) => {
        const skillsSection = document.getElementById('skills');
        if (skillsSection) {
          el.scrollTop = skillsSection.offsetTop - el.offsetTop;
        }
      });
      await page.waitForTimeout(1000);
      
      // Check active nav item
      const activeNavItem = sidebar.locator('.sidebar-nav-item.active').first();
      const activeText = await activeNavItem.textContent();
      console.log(`   Active nav item after scroll: "${activeText}"`);
      
      // Test if scroll spy is working
      const isScrollSpyWorking = activeText && activeText !== '01Overview';
      console.log(`   Scroll spy working: ${isScrollSpyWorking ? '✅' : '❌'}`);
    }
    
    // Close modal
    const closeButton = modal.locator('button').filter({ hasText: /✕|close/i }).first();
    await closeButton.click({ force: true });
    await page.waitForTimeout(1000);
    
  } catch (error) {
    console.error('❌ Error testing YearOverviewModal:', (error as Error).message);
  }
}

testModalsPerformance().catch(console.error);
