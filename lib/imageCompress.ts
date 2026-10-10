// 前端图片压缩：Vercel 函数请求体上限 4.5MB，且图片直接存数据库，
// 故在上传前先把照片缩到最大 MAX_DIM 像素、JPEG 质量 QUALITY，避免超限并省存储。
export async function compressImage(
  file: File,
  maxDim = 1024,
  quality = 0.72
): Promise<File> {
  // 不满足压缩条件时原样返回，省去无谓处理
  const shouldCompress =
    file.size > 400 * 1024 || (await needsDownscale(file, maxDim));
  if (!shouldCompress) return file;

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (width > maxDim || height > maxDim) {
    const scale = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
  );
  if (!blob) return file;
  return new File([blob], `food-${Date.now()}.jpg`, { type: "image/jpeg" });
}

async function needsDownscale(file: File, maxDim: number): Promise<boolean> {
  try {
    const bmp = await createImageBitmap(file);
    const r = bmp.width > maxDim || bmp.height > maxDim;
    bmp.close?.();
    return r;
  } catch {
    return false;
  }
}
