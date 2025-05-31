/**
 * Generate a URL-friendly slug from a message title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique message ID - now using only ID for simplicity
 */
export function generateMessageId(title: string, id?: string | number): string {
  // If we have an ID, use it directly
  if (id) {
    return id.toString();
  }
  // Otherwise fall back to slug
  return generateSlug(title);
} 