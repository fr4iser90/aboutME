/**
 * Unit tests for asset-fetcher module
 * 
 * Created: 2025-11-15T20:13:40.000Z
 */

const { detectAssetsInReadme, replaceAssetUrls } = require('../../../src/features/setup/scripts/asset-fetcher');

describe('Asset Fetcher', () => {
  describe('detectAssetsInReadme', () => {
    it('should detect markdown image links', () => {
      const readme = '![Logo](./images/logo.png)';
      const repoUrl = 'https://github.com/user/repo';
      const assets = detectAssetsInReadme(readme, repoUrl);
      
      expect(assets.length).toBeGreaterThan(0);
      expect(assets[0].type).toBe('image');
    });

    it('should detect HTML image tags', () => {
      const readme = '<img src="./screenshot.png" alt="Screenshot">';
      const repoUrl = 'https://github.com/user/repo';
      const assets = detectAssetsInReadme(readme, repoUrl);
      
      expect(assets.length).toBeGreaterThan(0);
    });

    it('should handle relative URLs', () => {
      const readme = '![Image](./assets/image.jpg)';
      const repoUrl = 'https://github.com/user/repo';
      const assets = detectAssetsInReadme(readme, repoUrl);
      
      expect(assets.length).toBeGreaterThan(0);
    });

    it('should handle absolute GitHub URLs', () => {
      const readme = '![Image](https://github.com/user/repo/blob/main/image.png)';
      const repoUrl = 'https://github.com/user/repo';
      const assets = detectAssetsInReadme(readme, repoUrl);
      
      expect(assets.length).toBeGreaterThan(0);
    });

    it('should return empty array for no assets', () => {
      const readme = 'Just text content';
      const repoUrl = 'https://github.com/user/repo';
      const assets = detectAssetsInReadme(readme, repoUrl);
      
      expect(assets).toEqual([]);
    });
  });

  describe('replaceAssetUrls', () => {
    it('should replace markdown image URLs', () => {
      const readme = '![Logo](https://raw.githubusercontent.com/user/repo/main/logo.png)';
      const urlMapping = {
        'https://raw.githubusercontent.com/user/repo/main/logo.png': '/uploads/projects/repo/assets/logo.png'
      };
      const result = replaceAssetUrls(readme, urlMapping);
      
      expect(result).toContain('/uploads/projects/repo/assets/logo.png');
      expect(result).not.toContain('raw.githubusercontent.com');
    });

    it('should replace HTML image URLs', () => {
      const readme = '<img src="https://raw.githubusercontent.com/user/repo/main/image.png">';
      const urlMapping = {
        'https://raw.githubusercontent.com/user/repo/main/image.png': '/uploads/projects/repo/assets/image.png'
      };
      const result = replaceAssetUrls(readme, urlMapping);
      
      expect(result).toContain('/uploads/projects/repo/assets/image.png');
    });

    it('should preserve markdown syntax', () => {
      const readme = '![Alt text](https://example.com/image.png)';
      const urlMapping = {
        'https://example.com/image.png': '/local/image.png'
      };
      const result = replaceAssetUrls(readme, urlMapping);
      
      expect(result).toMatch(/!\[.*?\]\(.*?\)/);
    });

    it('should handle empty mapping', () => {
      const readme = '![Image](https://example.com/image.png)';
      const urlMapping = {};
      const result = replaceAssetUrls(readme, urlMapping);
      
      expect(result).toBe(readme);
    });
  });
});

