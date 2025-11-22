/**
 * File Upload API
 * 
 * Handles file uploads with validation and security checks
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { FileValidator } from '@/features/upload/services/fileValidator';
import { SecurityValidator } from '@/features/upload/services/securityValidator';
import { FileStorage } from '@/features/upload/services/fileStorage';
import { UploadCategory, FileUploadResponse, FileInfo } from '@/features/upload/types';

const UPLOAD_BASE_PATH = path.join(process.cwd(), 'public/uploads');
const fileStorage = new FileStorage(UPLOAD_BASE_PATH);

/**
 * Check authentication - uses same logic as other API routes
 */
function checkAuthentication(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('admin_session');
  return !!sessionCookie?.value;
}

/**
 * POST - Upload file
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!checkAuthentication(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!category || !['hero', 'background', 'projects', 'blog', 'about', 'general'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }
    
    const uploadCategory = category as UploadCategory;
    
    // Get file data
    const filename = formData.get('filename') as string || file.name;
    const mimeType = file.type;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileSize = fileBuffer.length;
    
    // Validate filename
    const filenameValidation = FileValidator.validateFilename(filename);
    if (!filenameValidation.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename', validationErrors: filenameValidation.errors },
        { status: 400 }
      );
    }
    
    // Sanitize filename
    const { sanitized: sanitizedFilename, validation: sanitizedValidation } = 
      SecurityValidator.sanitizeAndValidateFilename(filename);
    
    if (!sanitizedValidation.valid) {
      return NextResponse.json(
        { success: false, error: 'Filename validation failed', validationErrors: sanitizedValidation.errors },
        { status: 400 }
      );
    }
    
    // Validate file type
    const typeValidation = FileValidator.validateFileType(sanitizedFilename, mimeType, uploadCategory);
    if (!typeValidation.valid) {
      return NextResponse.json(
        { success: false, error: 'File type validation failed', validationErrors: typeValidation.errors },
        { status: 400 }
      );
    }
    
    // Validate file size
    const sizeValidation = FileValidator.validateFileSize(fileSize, uploadCategory);
    if (!sizeValidation.valid) {
      return NextResponse.json(
        { success: false, error: 'File size validation failed', validationErrors: sizeValidation.errors },
        { status: 400 }
      );
    }
    
    // Validate file header (magic numbers)
    const headerValidation = SecurityValidator.validateFileHeader(fileBuffer, mimeType, sanitizedFilename);
    if (!headerValidation.valid) {
      return NextResponse.json(
        { success: false, error: 'File header validation failed', validationErrors: headerValidation.errors },
        { status: 400 }
      );
    }
    
    // Check storage limits
    const storageCheck = fileStorage.checkStorageLimits(fileSize, uploadCategory);
    if (!storageCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Storage limit exceeded', validationErrors: storageCheck.errors },
        { status: 400 }
      );
    }
    
    // Generate unique filename
    const uniqueFilename = fileStorage.generateUniqueFilename(uploadCategory, sanitizedFilename);
    const filePath = fileStorage.getFilePath(uploadCategory, uniqueFilename);
    
    // Validate path
    const pathValidation = SecurityValidator.validatePath(filePath, UPLOAD_BASE_PATH);
    if (!pathValidation.valid) {
      return NextResponse.json(
        { success: false, error: 'Path validation failed', validationErrors: pathValidation.errors },
        { status: 400 }
      );
    }
    
    // Write file
    fs.writeFileSync(filePath, fileBuffer);
    
    // Verify file was written
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'File write failed' },
        { status: 500 }
      );
    }
    
    // Get file stats
    const fileStats = fs.statSync(filePath);
    
    // Return file info
    const fileUrl = `/uploads/${uploadCategory}/${uniqueFilename}`;
    const response: FileUploadResponse = {
      success: true,
      file: {
        filename: uniqueFilename,
        path: filePath,
        url: fileUrl,
        size: fileStats.size,
        mimeType: mimeType,
        category: uploadCategory
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete file
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    if (!checkAuthentication(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as UploadCategory;
    const filename = searchParams.get('filename');
    
    if (!category || !filename) {
      return NextResponse.json(
        { success: false, error: 'Category and filename required' },
        { status: 400 }
      );
    }
    
    const filePath = fileStorage.getFilePath(category, filename);
    
    // Validate path
    const pathValidation = SecurityValidator.validatePath(filePath, UPLOAD_BASE_PATH);
    if (!pathValidation.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid file path' },
        { status: 400 }
      );
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET - List files
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    if (!checkAuthentication(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as UploadCategory | null;
    
    if (category) {
      // List files in specific category
      const files = fileStorage.getFilesInCategory(category);
      const fileInfos: FileInfo[] = [];
      
      for (const filename of files) {
        // Skip .gitkeep and other hidden/system files
        if (filename.startsWith('.') || filename === 'Thumbs.db') {
          continue;
        }
        const filePath = fileStorage.getFilePath(category, filename);
        const fileStats = fs.statSync(filePath);
        const fileUrl = `/uploads/${category}/${filename}`;
        
        // Try to detect MIME type from extension
        const ext = path.extname(filename).toLowerCase();
        let mimeType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        else if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.gif') mimeType = 'image/gif';
        else if (ext === '.webp') mimeType = 'image/webp';
        else if (ext === '.svg') mimeType = 'image/svg+xml';
        else if (ext === '.mp4') mimeType = 'video/mp4';
        else if (ext === '.webm') mimeType = 'video/webm';
        else if (ext === '.pdf') mimeType = 'application/pdf';
        
        fileInfos.push({
          filename,
          path: filePath,
          url: fileUrl,
          size: fileStats.size,
          mimeType,
          category,
          uploadedAt: fileStats.mtime.toISOString()
        });
      }
      
      return NextResponse.json({ success: true, files: fileInfos });
    } else {
      // Return storage stats
      const stats = fileStorage.getStorageStats();
      return NextResponse.json({ success: true, stats });
    }
    
  } catch (error) {
    console.error('List API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

