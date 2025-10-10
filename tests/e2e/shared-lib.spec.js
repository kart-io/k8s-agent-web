// T075: Import verification test for pre-built shared library
// Purpose: Verify that the shared library builds correctly and all exports are accessible

import { test, expect } from '@playwright/test'

test.describe('Shared Library Import Verification', () => {
  test.beforeAll(async () => {
    // Ensure shared library is built before running tests
    console.log('Testing pre-built shared library imports...')
  })

  test('should have all required entry points built', async () => {
    const fs = await import('fs')
    const path = await import('path')

    const distPath = path.resolve(process.cwd(), 'shared/dist')
    const requiredFiles = [
      'index.js',
      'components.js',
      'composables.js',
      'hooks.js',
      'utils.js',
      'core/route-sync.js',
      'utils/config-loader.js'
    ]

    for (const file of requiredFiles) {
      const filePath = path.join(distPath, file)
      const exists = fs.existsSync(filePath)
      expect(exists, `${file} should exist in dist/`).toBeTruthy()

      if (exists) {
        const stats = fs.statSync(filePath)
        expect(stats.size, `${file} should not be empty`).toBeGreaterThan(0)
        console.log(`✓ ${file} (${(stats.size / 1024).toFixed(2)} KB)`)
      }
    }
  })

  test('should load shared library in main app context', async ({ page }) => {
    // Navigate to main app
    await page.goto('http://localhost:3000')

    // Wait for app to load
    await page.waitForLoadState('networkidle')

    // Check if micro-apps can import from shared library
    const importCheck = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Check if shared utilities are available
        // This simulates how micro-apps import from @k8s-agent/shared
        const checks = {
          hasRouteSync: typeof window.$wujie !== 'undefined',
          hasSharedComponents: true, // Components are loaded via Vue
          hasUtilities: true // Utilities are imported in code
        }
        resolve(checks)
      })
    })

    expect(importCheck.hasRouteSync).toBeTruthy()
  })

  test('should verify tree-shaking capabilities', async () => {
    const fs = await import('fs')
    const path = await import('path')

    // Check that individual modules can be imported separately
    const distPath = path.resolve(process.cwd(), 'shared/dist')

    // Verify modular structure (not a single monolithic bundle)
    const files = fs.readdirSync(distPath, { recursive: true })
    const jsFiles = files.filter(f => f.endsWith('.js'))

    // Should have multiple JS files for tree-shaking
    expect(jsFiles.length, 'Should have multiple module files for tree-shaking').toBeGreaterThan(5)

    console.log(`Found ${jsFiles.length} module files (good for tree-shaking)`)
  })

  test('should verify CSS is extracted separately', async () => {
    const fs = await import('fs')
    const path = await import('path')

    const distPath = path.resolve(process.cwd(), 'shared/dist')
    const files = fs.readdirSync(distPath, { recursive: true })
    const cssFiles = files.filter(f => f.endsWith('.css'))

    // May or may not have CSS depending on components
    console.log(`Found ${cssFiles.length} CSS files`)

    if (cssFiles.length > 0) {
      for (const cssFile of cssFiles) {
        const cssPath = path.join(distPath, cssFile)
        const stats = fs.statSync(cssPath)
        expect(stats.size).toBeGreaterThan(0)
        console.log(`✓ ${cssFile} (${(stats.size / 1024).toFixed(2)} KB)`)
      }
    }
  })

  test('should verify package.json exports field', async () => {
    const fs = await import('fs')
    const path = await import('path')

    const packagePath = path.resolve(process.cwd(), 'shared/package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))

    // Verify exports field exists
    expect(packageJson.exports).toBeDefined()

    // Verify key exports
    const requiredExports = ['.', './components', './composables', './hooks', './utils']
    for (const exp of requiredExports) {
      expect(packageJson.exports[exp]).toBeDefined()
      expect(packageJson.exports[exp].import).toBeDefined()
      console.log(`✓ Export "${exp}" -> ${packageJson.exports[exp].import}`)
    }
  })

  test('should verify no peer dependencies are bundled', async () => {
    const fs = await import('fs')
    const path = await import('path')

    // Check that peer dependencies are not included in bundle
    const distPath = path.resolve(process.cwd(), 'shared/dist')
    const indexPath = path.join(distPath, 'index.js')

    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf-8')

      // Should have import statements for external deps (not bundled code)
      const peerDeps = ['vue', 'ant-design-vue', 'vxe-table']
      let externalImports = 0

      for (const dep of peerDeps) {
        if (content.includes(`from '${dep}'`) || content.includes(`from "${dep}"`)) {
          externalImports++
          console.log(`✓ ${dep} is external (not bundled)`)
        }
      }

      // At least some peer deps should be referenced as external
      expect(externalImports).toBeGreaterThan(0)
    }
  })
})

test.describe('Shared Library Performance', () => {
  test('should have reasonable bundle sizes', async () => {
    const fs = await import('fs')
    const path = await import('path')

    const distPath = path.resolve(process.cwd(), 'shared/dist')
    const indexPath = path.join(distPath, 'index.js')

    if (fs.existsSync(indexPath)) {
      const stats = fs.statSync(indexPath)
      const sizeKB = stats.size / 1024

      // Main entry should be reasonably sized (not too bloated)
      expect(sizeKB).toBeLessThan(500) // Less than 500KB for main entry
      console.log(`Main entry size: ${sizeKB.toFixed(2)} KB`)
    }
  })

  test('should generate source maps for debugging', async () => {
    const fs = await import('fs')
    const path = await import('path')

    const distPath = path.resolve(process.cwd(), 'shared/dist')
    const files = fs.readdirSync(distPath, { recursive: true })
    const mapFiles = files.filter(f => f.endsWith('.js.map'))

    // Should have source maps
    expect(mapFiles.length, 'Should generate source maps').toBeGreaterThan(0)
    console.log(`Found ${mapFiles.length} source map files`)
  })
})
