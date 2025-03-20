// Modules
import { Request, Response } from '@google-cloud/functions-framework';
import { getSalaryInfo } from './glassdoor';
import { getCacheStats } from './cache';

/**
 * Interface for salary data response
 */
interface SalaryData {
  jobTitle: string;
  company?: string;
  companyRating?: string;
  location?: string;
  averageSalary?: string;
  salaryRange?: string;
  salaryCount?: string;
  source: string;
  timestamp: string;
  error?: string;
  details?: any;
  requestTimeMs?: number;
  cacheStats?: any;
}

/**
 * Google Cloud Function to find Glassdoor salary information
 * 
 * @param {Request} req - The HTTP request object
 * @param {Response} res - The HTTP response object
 */
export const findGlassdoorSalary = async (req: Request, res: Response): Promise<void> => {
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
    const glassdoorData = await getSalaryInfo(companyName as string, jobTitle as string);
    
    // Calculate request time
    const requestTime = Date.now() - startTime;
    
    // Format the response
    const salaryData: SalaryData = {
      jobTitle: glassdoorData.job.title,
      company: glassdoorData.company.name,
      companyRating: glassdoorData.company.rating,
      location: location as string || 'All locations',
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
      salaryData.cacheStats = getCacheStats();
    }

    // Return the salary data
    res.status(200).json(salaryData);
  } catch (error) {
    // Log detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('Error processing salary request:', {
      error: errorMessage,
      stack: errorStack,
      params: {
        companyName: req.query?.companyName,
        jobTitle: req.query?.jobTitle,
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