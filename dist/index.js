"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findGlassdoorSalary = void 0;
const glassdoor_1 = require("./glassdoor");
const cache_1 = require("./cache");
/**
 * Google Cloud Function to find Glassdoor salary information
 *
 * @param {Request} req - The HTTP request object
 * @param {Response} res - The HTTP response object
 */
const findGlassdoorSalary = async (req, res) => {
    var _a, _b;
    try {
        // Reject all non-GET requests
        if (req.method !== 'GET') {
            res.status(404).json({
                error: 'NOT FOUND',
                message: 'API Not Found'
            });
            return;
        }
        // Get parameters from the request
        const { companyName, jobTitle, location, showCacheStats } = req.query;
        if (!jobTitle) {
            res.status(400).json({ error: 'Missing required parameter: jobTitle' });
            return;
        }
        if (!companyName) {
            res.status(400).json({ error: 'Missing required parameter: companyName' });
            return;
        }
        // Track start time for timing info
        const startTime = Date.now();
        // Fetch salary data from Glassdoor (with caching)
        const glassdoorData = await (0, glassdoor_1.getSalaryInfo)(companyName, jobTitle);
        // Calculate request time
        const requestTime = Date.now() - startTime;
        // Format the response
        const salaryData = {
            jobTitle: glassdoorData.job.title,
            company: glassdoorData.company.name,
            companyRating: glassdoorData.company.rating,
            location: location || 'All locations',
            averageSalary: glassdoorData.salary.median,
            salaryRange: glassdoorData.salary.range,
            salaryCount: glassdoorData.job.salaryCount,
            source: `${glassdoorData.source} (${glassdoorData.job.salaryCount} salary reports)`,
            timestamp: new Date().toISOString(),
            // details: glassdoorData,
            requestTimeMs: requestTime
        };
        // Include cache stats if requested
        if (showCacheStats === 'true') {
            salaryData.cacheStats = (0, cache_1.getCacheStats)();
        }
        // Return the salary data
        res.status(200).json(salaryData);
    }
    catch (error) {
        // Log detailed error information for debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : '';
        console.error('Error processing salary request:', {
            error: errorMessage,
            stack: errorStack,
            params: {
                companyName: (_a = req.query) === null || _a === void 0 ? void 0 : _a.companyName,
                jobTitle: (_b = req.query) === null || _b === void 0 ? void 0 : _b.jobTitle,
                // location: req.query?.location,
                method: req.method,
                path: req.path,
                headers: req.headers,
            },
            timestamp: new Date().toISOString()
        });
        // Return a masked error response without detailed error info
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Unable to retrieve salary data. Please try again later.',
            requestId: Date.now().toString(36) + Math.random().toString(36).substring(2),
            timestamp: new Date().toISOString()
        });
    }
};
exports.findGlassdoorSalary = findGlassdoorSalary;
//# sourceMappingURL=index.js.map