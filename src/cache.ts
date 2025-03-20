/**
 * Simple in-memory cache implementation for Cloud Functions
 */

// Cache entry with value and expiration time
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// Cache storage
const cache: Record<string, CacheEntry<any>> = {};

/**
 * Generate a cache key from parameters
 * @param companyName The company name
 * @param jobTitle The job title
 * @returns A unique cache key
 */
export function generateCacheKey(companyName: string, jobTitle: string): string {
  // Normalize inputs by trimming whitespace and converting to lowercase
  const normalizedCompany = companyName.trim().toLowerCase();
  const normalizedJob = jobTitle.trim().toLowerCase();
  return `salary:${normalizedCompany}:${normalizedJob}`;
}

/**
 * Generate a cache key for company data
 * @param companyName The company name
 * @returns A unique cache key for company
 */
export function generateCompanyCacheKey(companyName: string): string {
  const normalizedCompany = companyName.trim().toLowerCase();
  return `company:${normalizedCompany}`;
}

/**
 * Generate a cache key for job title data
 * @param jobTitle The job title
 * @returns A unique cache key for job title
 */
export function generateJobCacheKey(jobTitle: string): string {
  const normalizedJob = jobTitle.trim().toLowerCase();
  return `job:${normalizedJob}`;
}

/**
 * Set a value in the cache with expiration
 * @param key The cache key
 * @param value The value to store
 * @param ttlSeconds Time to live in seconds (default: 24 hours)
 */
export function setCacheValue<T>(key: string, value: T, ttlSeconds: number = 86400): void {
  const expiresAt = Date.now() + (ttlSeconds * 1000);
  cache[key] = { value, expiresAt };
  
  // Log cache write for debugging
  console.log(`Cache write: ${key} (expires in ${ttlSeconds}s)`);
}

/**
 * Get a value from the cache
 * @param key The cache key
 * @returns The cached value or null if not found or expired
 */
export function getCacheValue<T>(key: string): T | null {
  const entry = cache[key];
  
  // Return null if entry doesn't exist
  if (!entry) {
    return null;
  }
  
  // Check if entry has expired
  if (Date.now() > entry.expiresAt) {
    // Clean up expired entry
    delete cache[key];
    console.log(`Cache expired: ${key}`);
    return null;
  }
  
  // Return valid entry
  console.log(`Cache hit: ${key}`);
  return entry.value;
}

/**
 * Clear all cache entries or specific entries by prefix
 * @param prefix Optional prefix to selectively clear cache entries
 */
export function clearCache(prefix?: string): void {
  if (prefix) {
    // Clear entries with specific prefix
    Object.keys(cache).forEach(key => {
      if (key.startsWith(prefix)) {
        delete cache[key];
      }
    });
    console.log(`Cache entries cleared with prefix: ${prefix}`);
  } else {
    // Clear all entries
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });
    console.log('All cache entries cleared');
  }
}

/**
 * Get cache stats
 * @returns Object with cache statistics
 */
export function getCacheStats(): any {
  const stats = {
    totalEntries: 0,
    byPrefix: {} as Record<string, number>,
    memoryUsageEstimate: 0
  };
  
  Object.keys(cache).forEach(key => {
    stats.totalEntries++;
    
    // Count by prefix
    const prefix = key.split(':')[0];
    stats.byPrefix[prefix] = (stats.byPrefix[prefix] || 0) + 1;
    
    // Rough memory estimate (very approximate)
    const entry = cache[key];
    stats.memoryUsageEstimate += JSON.stringify(entry.value).length * 2; // × 2 for overhead
  });
  
  return stats;
} 