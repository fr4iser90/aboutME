import { test, expect } from '@playwright/test'

// Design definitions with expected values
const designDefinitions = {
  glassmorphism: {
    name: 'Glassmorphism',
    borderRadius: '24px',
    backdropFilter: 'blur(24px)',
    glassBg: 'rgba(255, 255, 255, 0.03)',
    backgroundImage: 'galaxy.png', // Uses theme background
    hasBackgroundImage: true
  },
  'modern-glass': {
    name: 'Modern Glass',
    borderRadius: '24px',
    backdropFilter: 'blur(24px)',
    glassBg: 'rgba(255, 255, 255, 0.03)',
    backgroundImage: 'galaxy.png',
    hasBackgroundImage: true
  },
  cyberpunk: {
    name: 'Cyberpunk',
    borderRadius: '4px',
    backdropFilter: 'blur(4px)',
    glassBg: 'rgba(0, 0, 0, 0.7)',
    backgroundImage: 'cyberpunk-city.png',
    hasBackgroundImage: true
  },
  flat: {
    name: 'Flat',
    borderRadius: '8px',
    backdropFilter: 'none',
    glassBg: 'var(--bg-tertiary)',
    backgroundImage: 'galaxy.png', // Uses theme background
    hasBackgroundImage: true
  },
  minimal: {
    name: 'Minimal',
    borderRadius: '0px',
    backdropFilter: 'none',
    glassBg: 'transparent',
    backgroundImage: 'galaxy.png', // Uses theme background (transparent shows through)
    hasBackgroundImage: true
  },
  clean: {
    name: 'Clean',
    borderRadius: '0px',
    backdropFilter: 'none',
    glassBg: 'var(--bg-tertiary)',
    backgroundImage: 'none',
    hasBackgroundImage: false
  },
  'minimal-clean': {
    name: 'Minimal Clean',
    borderRadius: '0px',
    backdropFilter: 'none',
    glassBg: 'var(--bg-tertiary)',
    backgroundImage: 'none',
    hasBackgroundImage: false
  },
  neumorphism: {
    name: 'Neumorphism',
    borderRadius: '20px',
    backdropFilter: 'none',
    glassBg: 'var(--bg-secondary)',
    backgroundImage: 'none',
    hasBackgroundImage: false
  },
  gradient: {
    name: 'Gradient',
    borderRadius: '16px',
    backdropFilter: 'none',
    glassBg: 'linear-gradient', // Contains gradient
    backgroundImage: 'none',
    hasBackgroundImage: false
  }
}

test.describe('Design Validation - Preview → Apply → Global Check', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin theme editor
    await page.goto('http://localhost:3000/admin/theme')
    await page.waitForLoadState('networkidle')
    
    // Wait for page to load and check if login is required
    const isLoginPage = await page.locator('input[type="password"], button:has-text("Login")').count() > 0
    if (isLoginPage) {
      // Login if needed
      await page.fill('input[type="password"]', 'your-super-secret-password')
      await page.click('button:has-text("Login"), button[type="submit"]')
      await page.waitForURL('**/admin/**', { timeout: 10000 })
      await page.goto('http://localhost:3000/admin/theme')
      await page.waitForLoadState('networkidle')
    }
    
    // Wait for theme editor to be visible
    await page.waitForSelector('.theme-editor, .design-selector', { timeout: 10000 })
  })

  // Test each design: Preview → Apply → Global Check
  for (const [designId, designDef] of Object.entries(designDefinitions)) {
    test(`should validate ${designDef.name}: Preview → Apply → Global`, async ({ page }) => {
      console.log(`\n=== Testing ${designDef.name} (${designId}) ===`)
      
      // STEP 1: Click design card
      const designCard = page.locator('.design-selector__card').filter({ hasText: new RegExp(designDef.name, 'i') })
      await expect(designCard).toBeVisible({ timeout: 5000 })
      await designCard.click()
      await page.waitForTimeout(500) // Wait for state update
      
      // STEP 2: Check Preview Container
      const previewContainer = page.locator('.theme-preview__container')
      await expect(previewContainer).toHaveAttribute('data-design', designId, { timeout: 5000 })
      console.log(`✓ Preview container has data-design="${designId}"`)
      
      // STEP 3: Check CSS Variables in Preview
      const previewVariables = await previewContainer.evaluate((el) => {
        const computed = getComputedStyle(el)
        return {
          '--design-border-radius': computed.getPropertyValue('--design-border-radius').trim(),
          '--design-backdrop-filter': computed.getPropertyValue('--design-backdrop-filter').trim(),
          '--glass-bg': computed.getPropertyValue('--glass-bg').trim(),
        }
      })
      
      console.log('Preview CSS Variables:', previewVariables)
      
      // Validate preview variables
      expect(previewVariables['--design-border-radius']).toBe(designDef.borderRadius)
      if (designDef.backdropFilter !== 'none') {
        expect(previewVariables['--design-backdrop-filter']).toContain(designDef.backdropFilter)
      } else {
        expect(previewVariables['--design-backdrop-filter']).toBe('none')
      }
      
      // Validate glass-bg (can be CSS variable or rgba value)
      if (designDef.glassBg.startsWith('var(')) {
        // CSS variable - just check it's not empty
        expect(previewVariables['--glass-bg']).toBeTruthy()
      } else if (designDef.glassBg === 'transparent') {
        expect(previewVariables['--glass-bg']).toBe('transparent')
      } else if (designDef.glassBg === 'linear-gradient') {
        expect(previewVariables['--glass-bg']).toContain('gradient')
      } else {
        expect(previewVariables['--glass-bg']).toContain(designDef.glassBg)
      }
      
      // STEP 4: Check Preview Card Styles
      const previewCard = page.locator('.preview-components__card').first()
      const previewCardStyles = await previewCard.evaluate((el) => {
        const computed = getComputedStyle(el)
        return {
          'border-radius': computed.borderRadius,
          'backdrop-filter': computed.backdropFilter,
        }
      })
      
      console.log('Preview Card Styles:', previewCardStyles)
      expect(previewCardStyles['border-radius']).toBe(designDef.borderRadius)
      
      // STEP 5: Check Preview Background
      const previewBackground = await previewContainer.evaluate((el) => {
        const computed = getComputedStyle(el)
        return {
          'background-image': computed.backgroundImage,
          'background-color': computed.backgroundColor,
        }
      })
      
      console.log('Preview Background:', previewBackground)
      
      if (designDef.hasBackgroundImage && designDef.backgroundImage !== 'none') {
        // Should have background image
        expect(previewBackground['background-image']).not.toBe('none')
        if (designDef.backgroundImage !== 'galaxy.png') {
          // Specific background image (e.g., cyberpunk-city.png)
          expect(previewBackground['background-image']).toContain(designDef.backgroundImage.replace('.png', ''))
        }
      } else {
        // Should have no background image
        expect(previewBackground['background-image']).toBe('none')
      }
      
      // STEP 6: Click "Apply Design" Button
      const applyButton = page.locator('button:has-text("Apply Design"), button:has-text("✓ Apply Design")')
      await expect(applyButton).toBeVisible({ timeout: 5000 })
      await applyButton.click()
      await page.waitForTimeout(1000) // Wait for apply to complete
      console.log('✓ Applied design globally')
      
      // STEP 7: Check Global HTML Element
      const htmlDesign = await page.evaluate(() => {
        return document.documentElement.getAttribute('data-design')
      })
      expect(htmlDesign).toBe(designId)
      console.log(`✓ Global HTML has data-design="${htmlDesign}"`)
      
      // STEP 8: Check Global Body Background
      const globalBodyBackground = await page.evaluate(() => {
        const body = document.body
        const computed = window.getComputedStyle(body)
        return {
          'background-image': computed.backgroundImage,
          'background-color': computed.backgroundColor,
        }
      })
      
      console.log('Global Body Background:', globalBodyBackground)
      
      if (designDef.hasBackgroundImage && designDef.backgroundImage !== 'none') {
        // Should have background image
        expect(globalBodyBackground['background-image']).not.toBe('none')
        if (designDef.backgroundImage !== 'galaxy.png') {
          // Specific background image (e.g., cyberpunk-city.png)
          expect(globalBodyBackground['background-image']).toContain(designDef.backgroundImage.replace('.png', ''))
        }
      } else {
        // Should have no background image
        expect(globalBodyBackground['background-image']).toBe('none')
      }
      
      // STEP 9: Navigate to main page and check
      await page.goto('http://localhost:3000')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
      
      const mainPageDesign = await page.evaluate(() => {
        return document.documentElement.getAttribute('data-design')
      })
      expect(mainPageDesign).toBe(designId)
      console.log(`✓ Main page has data-design="${mainPageDesign}"`)
      
      const mainPageBodyBackground = await page.evaluate(() => {
        const body = document.body
        const computed = window.getComputedStyle(body)
        return {
          'background-image': computed.backgroundImage,
          'background-color': computed.backgroundColor,
        }
      })
      
      console.log('Main Page Body Background:', mainPageBodyBackground)
      
      if (designDef.hasBackgroundImage && designDef.backgroundImage !== 'none') {
        expect(mainPageBodyBackground['background-image']).not.toBe('none')
        if (designDef.backgroundImage !== 'galaxy.png') {
          expect(mainPageBodyBackground['background-image']).toContain(designDef.backgroundImage.replace('.png', ''))
        }
      } else {
        expect(mainPageBodyBackground['background-image']).toBe('none')
      }
      
      console.log(`✓ ${designDef.name} validation complete\n`)
    })
  }

  test('should verify all designs are different', async ({ page }) => {
    const results: Record<string, any> = {}

    for (const [designId, designDef] of Object.entries(designDefinitions)) {
      const designCard = page.locator('.design-selector__card').filter({ hasText: new RegExp(designDef.name, 'i') })
      await designCard.click()
      await page.waitForTimeout(500)

      const card = page.locator('.preview-components__card').first()
      const styles = await card.evaluate((el) => {
        const computed = getComputedStyle(el)
        return {
          'border-radius': computed.borderRadius,
          'backdrop-filter': computed.backdropFilter,
        }
      })

      results[designId] = styles
      console.log(`${designDef.name} (${designId}):`, styles)
    }

    // Verify designs are different
    const borderRadii = Object.values(results).map(r => r['border-radius'])
    const uniqueRadii = new Set(borderRadii)
    expect(uniqueRadii.size).toBeGreaterThan(1) // At least 2 different border-radius values

    const backdropFilters = Object.values(results).map(r => r['backdrop-filter'])
    const uniqueFilters = new Set(backdropFilters)
    expect(uniqueFilters.size).toBeGreaterThan(1) // At least 2 different backdrop-filter values
  })
})
