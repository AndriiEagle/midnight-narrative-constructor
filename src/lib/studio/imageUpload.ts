"use client";

const MAX_SOURCE_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1600;

export const STORY_IMAGE_ACCEPT =
  "image/png,image/jpeg,image/webp,image/avif,image/gif";

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Не вдалося прочитати вибране зображення."));
    };

    image.src = objectUrl;
  });
}

export async function optimizeStoryImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Можна завантажувати лише файли зображень.");
  }

  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error("Файл завеликий. Обери зображення до 12 МБ.");
  }

  const image = await loadImageElement(file);
  const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longestEdge > MAX_IMAGE_EDGE ? MAX_IMAGE_EDGE / longestEdge : 1;
  const targetWidth = Math.max(1, Math.round(image.naturalWidth * scale));
  const targetHeight = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Браузер не дозволив підготувати зображення.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const outputType = file.type === "image/png" ? "image/png" : "image/webp";
  return canvas.toDataURL(outputType, outputType === "image/png" ? undefined : 0.84);
}
