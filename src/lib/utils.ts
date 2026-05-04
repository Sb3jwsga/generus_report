export const withTimeout = <T>(promise: Promise<T>, ms: number = 2000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms)
    ),
  ]);
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const formatDate = (dateStr: any): string => {
  if (!dateStr) return '-';
  
  let dStr = String(dateStr).trim();

  // If it's already DD/MM/YYYY, just return it
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dStr)) return dStr;

  // Manual parse YYYY-MM-DD or YYYY-MM-DDTHH:mm:SS
  // We prioritize the date components to avoid timezone shifts
  const match = dStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  // Handle other string formats or Date objects
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      // Use UTC methods to avoid local timezone shift
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {}

  return dStr;
};

/**
 * Ensures a task takes at least minMs, but no more than maxMs.
 */
export const clampedTask = <T>(promise: Promise<T>, minMs: number = 1500, maxMs: number = 2000): Promise<T> => {
  return Promise.race([
    Promise.all([promise, delay(minMs)]).then(([result]) => result),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), maxMs))
  ]);
};
