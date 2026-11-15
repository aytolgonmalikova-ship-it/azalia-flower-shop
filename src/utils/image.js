// Сжимает выбранное фото до небольшого JPEG и возвращает data:-адрес.
// Фото хранится прямо в документе товара Firestore (лимит документа — 1 МБ),
// поэтому исходный файл с телефона или камеры туда не поместился бы.
const MAX_SIDE = 800;
const QUALITY = 0.82;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image/load-failed'));
    };
    image.src = url;
  });
}

export async function compressImage(file) {
  const image = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext('2d');
  // Белая подложка: у PNG с прозрачностью фон в JPEG иначе стал бы чёрным.
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', QUALITY);
}
