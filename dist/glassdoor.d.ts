/**
 * Glassdoor API integration functions
 */
/**
 * Fetches companies from Glassdoor based on company name
 * @param companyName Name of the company to search for
 * @returns List of matching companies with details
 */
export declare function fetchGlassdoorCompanies(companyName: string): Promise<any>;
/**
 * Fetches job titles from Glassdoor based on job title input
 * @param jobTitleInput Job title to search for
 * @returns List of matching job titles
 */
export declare function fetchJobTitles(jobTitleInput: string): Promise<any>;
/**
 * Fetches salary information for a specific company and job title
 * @param companyId Glassdoor company ID
 * @param jobId Glassdoor job title ID
 * @param jobTitle Job title text
 * @returns Salary information
 */
export declare function fetchSalaries(companyId: number, jobId: number, jobTitle: string): Promise<any>;
/**
 * Formats a name by removing special characters and content after commas or parentheses
 * @param name Name to format
 * @returns Formatted name
 */
export declare function formatName(name: string): string;
/**
 * Formats a salary number into a human-readable string with appropriate currency symbol and suffix
 * @param salary Salary amount
 * @param currency Currency code (INR, USD, etc.)
 * @returns Formatted salary string
 */
export declare function formatSalary(salary: number, currency: string): string;
/**
 * Retrieves salary information for a specific company and job title
 * @param companyName Company name to search for
 * @param jobTitle Job title to search for
 * @returns Object containing salary and company information
 */
export declare function getSalaryInfo(companyName: string, jobTitle: string): Promise<any>;
