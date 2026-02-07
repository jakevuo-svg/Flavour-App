/**
 * Returns current time as formatted timestamp "dd.mm.yyyy HH:MM"
 */
export function now() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Returns current date only as "dd.mm.yyyy"
 */
export function today() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Splits "dd.mm.yyyy" to {day, month, year}
 */
export function parseDateParts(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { day: '', month: '', year: '' };
  }
  const parts = dateStr.split('.');
  return {
    day: parts[0] || '',
    month: parts[1] || '',
    year: parts[2] || ''
  };
}

/**
 * Joins {day, month, year} back to "dd.mm.yyyy"
 */
export function formatDateParts({ day, month, year }) {
  return `${day}.${month}.${year}`;
}

/**
 * Splits "HH:MM-HH:MM" to {startH, startM, endH, endM}
 */
export function parseTimeParts(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    return { startH: '', startM: '', endH: '', endM: '' };
  }
  const parts = timeStr.split('-');
  const startParts = (parts[0] || '').split(':');
  const endParts = (parts[1] || '').split(':');
  
  return {
    startH: startParts[0] || '',
    startM: startParts[1] || '',
    endH: endParts[0] || '',
    endM: endParts[1] || ''
  };
}

/**
 * Joins {startH, startM, endH, endM} back to "HH:MM-HH:MM"
 */
export function formatTimeParts({ startH, startM, endH, endM }) {
  return `${startH}:${startM}-${endH}:${endM}`;
}
