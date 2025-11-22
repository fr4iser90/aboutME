/**
 * Setup Mode Detector Unit Tests
 * 
 * Tests for the SetupModeDetector service and related functionality.
 */

import { SetupModeDetector } from '../../lib/setup-mode-detector';

// Mock fetch for testing
global.fetch = jest.fn();

describe('SetupModeDetector', () => {
  let detector: SetupModeDetector;

  beforeEach(() => {
    detector = new SetupModeDetector();
    (fetch as jest.Mock).mockClear();
  });

  describe('getSetupModeType', () => {
    it('should return "initial" when system is not configured', async () => {
      // Mock system not configured
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ isConfigured: false })
      });

      const result = await detector.getSetupModeType();
      expect(result).toBe('initial');
    });

    it('should return "build-required" when CSS has changes', async () => {
      // Mock system configured but CSS changed
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ isConfigured: true })
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ hasCSSChanges: true })
        });

      const result = await detector.getSetupModeType();
      expect(result).toBe('build-required');
    });

    it('should return "editor" when admin is logged in', async () => {
      // Mock system configured, no CSS changes, admin logged in
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ isConfigured: true })
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ hasCSSChanges: false })
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ isAdminLoggedIn: true })
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ isEditorModeEnabled: true })
        });

      const result = await detector.getSetupModeType();
      expect(result).toBe('editor');
    });

    it('should return null when system is fully configured', async () => {
      // Mock system configured, no CSS changes, no admin logged in
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ isConfigured: true })
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ hasCSSChanges: false })
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ isAdminLoggedIn: false })
        });

      const result = await detector.getSetupModeType();
      expect(result).toBe(null);
    });
  });

  describe('isSystemConfigured', () => {
    it('should return true when all config files exist', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ isConfigured: true })
      });

      const result = await detector.isSystemConfigured();
      expect(result).toBe(true);
    });

    it('should return false when config files are missing', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ isConfigured: false })
      });

      const result = await detector.isSystemConfigured();
      expect(result).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await detector.isSystemConfigured();
      expect(result).toBe(false);
    });
  });

  describe('hasCSSChanges', () => {
    it('should return true when CSS files have changed', async () => {
      // Mock CSS changes detected
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ hasCSSChanges: true })
      });

      const result = await detector.hasCSSChanges();
      expect(result).toBe(true);
    });

    it('should return false when no CSS changes', async () => {
      // Mock no CSS changes
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ hasCSSChanges: false })
      });

      const result = await detector.hasCSSChanges();
      expect(result).toBe(false);
    });
  });

  describe('isAdminLoggedIn', () => {
    it('should return true when admin is logged in', async () => {
      // Mock admin logged in
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ isAdminLoggedIn: true })
      });

      const result = await detector.isAdminLoggedIn();
      expect(result).toBe(true);
    });

    it('should return false when admin is not logged in', async () => {
      // Mock admin not logged in
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ isAdminLoggedIn: false })
      });

      const result = await detector.isAdminLoggedIn();
      expect(result).toBe(false);
    });
  });

  describe('isEditorModeEnabled', () => {
    it('should return true when editor mode is enabled', async () => {
      // Mock editor mode enabled
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ isEditorModeEnabled: true })
      });

      const result = await detector.isEditorModeEnabled();
      expect(result).toBe(true);
    });

    it('should return false when editor mode is disabled', async () => {
      // Mock editor mode disabled
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ isEditorModeEnabled: false })
      });

      const result = await detector.isEditorModeEnabled();
      expect(result).toBe(false);
    });
  });

  describe('caching', () => {
    it('should cache results for performance', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ isConfigured: true })
      });

      // First call
      const result1 = await detector.isSystemConfigured();
      expect(result1).toBe(true);

      // Second call should use cache (no additional fetch calls)
      const result2 = await detector.isSystemConfigured();
      expect(result2).toBe(true);

      // Should only have made one fetch call
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should clear cache when requested', () => {
      detector.clearCache();
      // Cache should be empty after clear
      expect(detector['cache'].size).toBe(0);
    });
  });
});
