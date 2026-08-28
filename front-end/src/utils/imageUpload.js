import { message, Upload } from 'antd';

export const IMAGE_UPLOAD_ACCEPT = 'image/jpeg,image/png,image/webp';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maximumSourceSize = 12 * 1024 * 1024;
const maximumDimension = 1280;

export function validateImageBeforeUpload(file) {
  if (!allowedTypes.has(file.type)) {
    message.error('Seules les images JPG, PNG et WebP sont autorisées.');
    return Upload.LIST_IGNORE;
  }

  if (file.size > maximumSourceSize) {
    message.error('La photo source ne doit pas dépasser 12 Mo.');
    return Upload.LIST_IGNORE;
  }

  return false;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image illisible.'));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
}

export async function optimizeImageFile(file) {
  if (!file || !allowedTypes.has(file.type)) return file;

  try {
    const image = await loadImage(file);
    const scale = Math.min(1, maximumDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return file;

    context.drawImage(image, 0, 0, width, height);
    let optimized = await canvasToBlob(canvas, 0.82);

    if (optimized && optimized.size > 2.8 * 1024 * 1024) {
      optimized = await canvasToBlob(canvas, 0.7);
    }

    if (!optimized || (scale === 1 && optimized.size >= file.size)) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([optimized], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch {
    message.warning('La photo n’a pas pu être optimisée, le fichier original sera utilisé.');
    return file;
  }
}
