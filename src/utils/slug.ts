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
 * Generate a unique message ID from title and optional ID
 */
export function generateMessageId(title: string, id?: string | number): string {
  const slug = generateSlug(title);
  if (id) {
    return `${id}-${slug}`.substring(0, 100); // Limit length
  }
  return slug;
} 