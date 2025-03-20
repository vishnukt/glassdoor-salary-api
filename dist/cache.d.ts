/**
 * Simple in-memory cache implementation for Cloud Functions
 */
/**
 * Generate a cache key from parameters
 * @param companyName The company name
 * @param jobTitle The job title
 * @returns A unique cache key
 */
export declare function generateCacheKey(companyName: string, jobTitle: string): string;
/**
 * Generate a cache key for company data
 * @param companyName The company name
 * @returns A unique cache key for company
 */
export declare function generateCompanyCacheKey(companyName: string): string;
/**
 * Generate a cache key for job title data
 * @param jobTitle The job title
 * @returns A unique cache key for job title
 */
export declare function generateJobCacheKey(jobTitle: string): string;
/**
 * Set a value in the cache with expiration
 * @param key The cache key
 * @param value The value to store
 * @param ttlSeconds Time to live in seconds (default: 24 hours)
 */
export declare function setCacheValue<T>(key: string, value: T, ttlSeconds?: number): void;
/**
 * Get a value from the cache
 * @param key The cache key
 * @returns The cached value or null if not found or expired
 */
export declare function getCacheValue<T>(key: string): T | null;
/**
 * Clear all cache entries or specific entries by prefix
 * @param prefix Optional prefix to selectively clear cache entries
 */
export declare function clearCache(prefix?: string): void;
/**
 * Get cache stats
 * @returns Object with cache statistics
 */
export declare function getCacheStats(): any;
