"use strict";
/**
 * Simple in-memory cache implementation for Cloud Functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheStats = exports.clearCache = exports.getCacheValue = exports.setCacheValue = exports.generateJobCacheKey = exports.generateCompanyCacheKey = exports.generateCacheKey = void 0;
// Cache storage
const cache = {};
/**
 * Generate a cache key from parameters
 * @param companyName The company name
 * @param jobTitle The job title
 * @returns A unique cache key
 */
function generateCacheKey(companyName, jobTitle) {
    // Normalize inputs by trimming whitespace and converting to lowercase
    const normalizedCompany = companyName.trim().toLowerCase();
    const normalizedJob = jobTitle.trim().toLowerCase();
    return `salary:${normalizedCompany}:${normalizedJob}`;
}
exports.generateCacheKey = generateCacheKey;
/**
 * Generate a cache key for company data
 * @param companyName The company name
 * @returns A unique cache key for company
 */
function generateCompanyCacheKey(companyName) {
    const normalizedCompany = companyName.trim().toLowerCase();
    return `company:${normalizedCompany}`;
}
exports.generateCompanyCacheKey = generateCompanyCacheKey;
/**
 * Generate a cache key for job title data
 * @param jobTitle The job title
 * @returns A unique cache key for job title
 */
function generateJobCacheKey(jobTitle) {
    const normalizedJob = jobTitle.trim().toLowerCase();
    return `job:${normalizedJob}`;
}
exports.generateJobCacheKey = generateJobCacheKey;
/**
 * Set a value in the cache with expiration
 * @param key The cache key
 * @param value The value to store
 * @param ttlSeconds Time to live in seconds (default: 24 hours)
 */
function setCacheValue(key, value, ttlSeconds = 86400) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    cache[key] = { value, expiresAt };
    // Log cache write for debugging
    console.log(`Cache write: ${key} (expires in ${ttlSeconds}s)`);
}
exports.setCacheValue = setCacheValue;
/**
 * Get a value from the cache
 * @param key The cache key
 * @returns The cached value or null if not found or expired
 */
function getCacheValue(key) {
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
exports.getCacheValue = getCacheValue;
/**
 * Clear all cache entries or specific entries by prefix
 * @param prefix Optional prefix to selectively clear cache entries
 */
function clearCache(prefix) {
    if (prefix) {
        // Clear entries with specific prefix
        Object.keys(cache).forEach(key => {
            if (key.startsWith(prefix)) {
                delete cache[key];
            }
        });
        console.log(`Cache entries cleared with prefix: ${prefix}`);
    }
    else {
        // Clear all entries
        Object.keys(cache).forEach(key => {
            delete cache[key];
        });
        console.log('All cache entries cleared');
    }
}
exports.clearCache = clearCache;
/**
 * Get cache stats
 * @returns Object with cache statistics
 */
function getCacheStats() {
    const stats = {
        totalEntries: 0,
        byPrefix: {},
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
exports.getCacheStats = getCacheStats;
//# sourceMappingURL=cache.js.map