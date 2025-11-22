/**
 * Upload API Integration Tests
 * 
 * Tests for upload API endpoints
 */

import { NextRequest } from 'next/server';
import { POST, GET, DELETE } from '@/app/api/upload/admin/route';

// Mock authentication
jest.mock('@/features/auth/services/auth', () => ({
  validateSecureSession: jest.fn((sessionId: string) => sessionId === 'valid-session')
}));

// Mock file system
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
  mkdirSync: jest.fn()
}));

describe('Upload API', () => {
  describe('POST /api/upload/admin', () => {
    it('should reject unauthenticated requests', async () => {
      const request = new NextRequest('http://localhost/api/upload/admin', {
        method: 'POST',
        headers: {
          'Cookie': 'admin_session=invalid'
        }
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });
    
    it('should reject requests without file', async () => {
      const request = new NextRequest('http://localhost/api/upload/admin', {
        method: 'POST',
        headers: {
          'Cookie': 'admin_session=valid-session'
        }
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('No file provided');
    });
    
    it('should reject invalid category', async () => {
      const formData = new FormData();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', file);
      formData.append('category', 'invalid');
      
      const request = new NextRequest('http://localhost/api/upload/admin', {
        method: 'POST',
        headers: {
          'Cookie': 'admin_session=valid-session'
        },
        body: formData
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid category');
    });
  });
  
  describe('GET /api/upload/admin', () => {
    it('should reject unauthenticated requests', async () => {
      const request = new NextRequest('http://localhost/api/upload/admin', {
        method: 'GET',
        headers: {
          'Cookie': 'admin_session=invalid'
        }
      });
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });
  });
  
  describe('DELETE /api/upload/admin', () => {
    it('should reject unauthenticated requests', async () => {
      const request = new NextRequest('http://localhost/api/upload/admin?category=hero&filename=test.jpg', {
        method: 'DELETE',
        headers: {
          'Cookie': 'admin_session=invalid'
        }
      });
      
      const response = await DELETE(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });
    
    it('should reject requests without category and filename', async () => {
      const request = new NextRequest('http://localhost/api/upload/admin', {
        method: 'DELETE',
        headers: {
          'Cookie': 'admin_session=valid-session'
        }
      });
      
      const response = await DELETE(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Category and filename required');
    });
  });
});

