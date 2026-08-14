/**
 * Format a Date object or string to YYYY-MM-DD
 */
function formatDate(dateInput = new Date()) {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date string for N days ago
 */
function getPastDateStr(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return formatDate(d);
}

/**
 * Check if a date string YYYY-MM-DD matches today
 */
function isToday(dateStr) {
  return formatDate() === dateStr;
}

/**
 * Get difference in days between two YYYY-MM-DD strings
 */
function daysDifference(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = Math.abs(d2 - d1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

module.exports = {
  formatDate,
  getPastDateStr,
  isToday,
  daysDifference,
};
