/* Client-side image prep. Supabase's free tier has no server-side image
   transformation, so photos are resized and re-encoded in the browser before
   anything is uploaded — which is what a phone-first menu wants anyway. */

export async function resizeImage(file, { maxSize = 1200, quality = 0.82 } = {}) {
  if (!file.type.startsWith('image/')) throw new Error('That file is not an image.');

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  return new Promise((res, rej) =>
    canvas.toBlob(b => (b ? res(b) : rej(new Error('Could not encode the image.'))), 'image/jpeg', quality)
  );
}

export function blobToDataUrl(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error('Could not read the image.'));
    r.readAsDataURL(blob);
  });
}

export const prettyBytes = n =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`;
