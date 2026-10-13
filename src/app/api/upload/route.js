import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

// Maximum allowed image size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
];

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || (!hasPermission(user, PERMISSIONS.PRODUCTS_MANAGE) && user.role === 'customer')) {
      return errorResponse('Unauthorized: Staff access required for image uploads.', 403);
    }

    const formData = await request.formData();
    
    // Support both 'files' (array) and 'file' (single or multiple)
    let files = formData.getAll('files');
    if (!files || files.length === 0) {
      files = formData.getAll('file');
    }

    if (!files || files.length === 0 || !(files[0] instanceof Blob)) {
      return errorResponse('No valid image files provided in form data.', 400);
    }

    const uploadSubdir = formData.get('folder') || 'products';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadSubdir);

    // Ensure the destination directory exists
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls = [];

    for (const file of files) {
      // Basic validation
      if (!(file instanceof Blob)) continue;

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return errorResponse(`Unsupported file type: ${file.type}. Allowed formats: JPG, PNG, WEBP, AVIF, GIF, SVG.`, 400);
      }

      if (file.size > MAX_FILE_SIZE) {
        return errorResponse(`File "${file.name}" exceeds maximum allowed size of 10MB.`, 400);
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determine extension
      let ext = path.extname(file.name || '').toLowerCase();
      if (!ext || ext.length > 5) {
        switch (file.type) {
          case 'image/jpeg': ext = '.jpg'; break;
          case 'image/png': ext = '.png'; break;
          case 'image/webp': ext = '.webp'; break;
          case 'image/avif': ext = '.avif'; break;
          case 'image/gif': ext = '.gif'; break;
          case 'image/svg+xml': ext = '.svg'; break;
          default: ext = '.jpg';
        }
      }

      // Generate a clean, unique file name
      const safePrefix = (file.name || 'product')
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 30);
      const randomSuffix = crypto.randomBytes(6).toString('hex');
      const filename = `${safePrefix || 'img'}-${Date.now()}-${randomSuffix}${ext}`;
      const filePath = path.join(uploadDir, filename);

      // Write file to disk
      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${uploadSubdir}/${filename}`;
      uploadedUrls.push(publicUrl);
    }

    await logAuditEvent({
      userId: user.id || user._id,
      userEmail: user.email,
      action: 'PRODUCT_IMAGES_UPLOADED',
      entity: 'ProductImage',
      details: { count: uploadedUrls.length, urls: uploadedUrls },
    });

    return successResponse({
      urls: uploadedUrls,
      url: uploadedUrls[0] || null,
      count: uploadedUrls.length,
      message: `Successfully uploaded ${uploadedUrls.length} image(s)`,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return errorResponse(error.message || 'Image upload failed', 500);
  }
}
