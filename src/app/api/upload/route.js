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

/**
 * Upload an image buffer directly to Cloudinary using signed REST API.
 * Eliminates filesystem dependence so uploads succeed on serverless platforms (e.g. Vercel).
 */
async function uploadToCloudinary(buffer, mimeType, folder = 'products') {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials missing');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const targetFolder = `triven/${folder}`;
  const strToSign = `folder=${targetFolder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

  const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const fd = new FormData();
  fd.append('file', base64Data);
  fd.append('api_key', apiKey);
  fd.append('timestamp', timestamp.toString());
  fd.append('folder', targetFolder);
  fd.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: fd,
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || 'Failed to upload image to Cloudinary');
  }

  return json.secure_url || json.url;
}

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
    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    const uploadedUrls = [];

    for (const file of files) {
      if (!(file instanceof Blob)) continue;

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return errorResponse(
          `Unsupported file type: ${file.type}. Allowed formats: JPG, PNG, WEBP, AVIF, GIF, SVG.`,
          400
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return errorResponse(`File "${file.name}" exceeds maximum allowed size of 10MB.`, 400);
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (isCloudinaryConfigured) {
        // Upload to Cloudinary (Production & Live Serverless friendly)
        const cloudUrl = await uploadToCloudinary(buffer, file.type, uploadSubdir);
        uploadedUrls.push(cloudUrl);
      } else {
        // Local Filesystem fallback (only works in non-serverless local environments)
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadSubdir);
          await mkdir(uploadDir, { recursive: true });

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

          const safePrefix = (file.name || 'product')
            .replace(/\.[^/.]+$/, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .slice(0, 30);
          const randomSuffix = crypto.randomBytes(6).toString('hex');
          const filename = `${safePrefix || 'img'}-${Date.now()}-${randomSuffix}${ext}`;
          const filePath = path.join(uploadDir, filename);

          await writeFile(filePath, buffer);
          uploadedUrls.push(`/uploads/${uploadSubdir}/${filename}`);
        } catch (fsError) {
          throw new Error(
            `Filesystem is read-only and Cloudinary credentials are not set. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables. Error: ${fsError.message}`
          );
        }
      }
    }

    try {
      await logAuditEvent({
        userId: user.id || user._id,
        userEmail: user.email,
        action: 'PRODUCT_IMAGES_UPLOADED',
        entity: 'ProductImage',
        details: { count: uploadedUrls.length, urls: uploadedUrls },
      });
    } catch {
      // Don't fail image upload if audit log fails
    }

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
