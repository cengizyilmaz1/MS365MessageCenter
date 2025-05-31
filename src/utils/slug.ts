/**
 * Generate a URL-friendly slug from a message title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Keep letters, numbers, spaces, and hyphens
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique message ID - using title slug for better SEO
 */
export function generateMessageId(title: string, id?: string | number): string {
  // Always use title slug for better SEO and readability
  return generateSlug(title);
} 