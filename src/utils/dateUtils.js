/**
 * Formats a date string or Date object into a user-friendly format
 * @param {string|Date} dateString - The date to format
 * @param {boolean} includeTime - Whether to include the time in the formatted string
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, includeTime = true) {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Format date as DD/MM/YYYY
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  let formattedDate = `${day}/${month}/${year}`;

  // Add time if requested
  if (includeTime) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    formattedDate += ` ${hours}:${minutes}`;
  }

  return formattedDate;
}

/**
 * Returns a relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} dateString - The date to format
 * @returns {string} Relative time string
 */
export function getRelativeTimeString(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  // Time difference in milliseconds
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  // Format based on the difference
  if (diffDays > 0) {
    return diffDays === 1 ? "Tomorrow" : `In ${diffDays} days`;
  } else if (diffDays < 0) {
    return diffDays === -1 ? "Yesterday" : `${Math.abs(diffDays)} days ago`;
  } else if (diffHours > 0) {
    return `In ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  } else if (diffHours < 0) {
    return `${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? "s" : ""} ago`;
  } else if (diffMinutes > 0) {
    return `In ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
  } else if (diffMinutes < 0) {
    return `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) !== 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}
