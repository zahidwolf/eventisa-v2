const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) {
    return "Use JPG, PNG, or WebP only";
  }
  if (file.size > MAX_BYTES) {
    return "Image must be 2MB or smaller";
  }
  return null;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
