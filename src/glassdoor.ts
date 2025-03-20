/**
 * Glassdoor API integration functions
 */

import { generateCacheKey, getCacheValue, setCacheValue, generateCompanyCacheKey, generateJobCacheKey } from './cache';

// Check and provide fallbacks for environment variables
const baseUrl = process.env.GLASSDOOR_BASE_URL;
const graphUrl = process.env.GLASSDOOR_GRAPH_URL;
const graphUrlHeaders = JSON.parse(process.env.GLASSDOOR_GRAPH_URL_HEADERS as string);

/**
 * Fetches companies from Glassdoor based on company name
 * @param companyName Name of the company to search for
 * @returns List of matching companies with details
 */
export async function fetchGlassdoorCompanies(companyName: string): Promise<any> {
  try {
    // Check company cache first
    const companyCacheKey = generateCompanyCacheKey(companyName);
    const cachedCompanies = getCacheValue<any[]>(companyCacheKey);
    
    if (cachedCompanies) {
      console.log(`Using cached company data for ${companyName}`);
      return cachedCompanies;
    }
    
    console.log(`Fetching fresh company data for ${companyName}`);
    
    if (!baseUrl) {
      throw new Error('Glassdoor base URL is not configured');
    }
    
    const url = `${baseUrl}?company=${encodeURIComponent(companyName)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const jsonResponse = await response.json();
    const companies = jsonResponse.json.response.employers;

    // Cache company results (30 days TTL)
    if (companies && companies.length > 0) {
      setCacheValue(companyCacheKey, companies, 30 * 24 * 60 * 60);
    }

    return companies;
  } catch (error) {
    console.error('Error fetching Glassdoor company data:', error);
    throw error;
  }
}

/**
 * Fetches job titles from Glassdoor based on job title input
 * @param jobTitleInput Job title to search for
 * @returns List of matching job titles
 */
export async function fetchJobTitles(jobTitleInput: string): Promise<any> {
  try {
    // Check job title cache first
    const jobCacheKey = generateJobCacheKey(jobTitleInput);
    const cachedJobs = getCacheValue<any[]>(jobCacheKey);
    
    if (cachedJobs) {
      console.log(`Using cached job title data for ${jobTitleInput}`);
      return cachedJobs;
    }
    
    console.log(`Fetching fresh job title data for ${jobTitleInput}`);
    
    if (!graphUrl) {
      throw new Error('Glassdoor graph URL is not configured');
    }

    const graphqlQuery = [
      {
        "operationName": "jobTitleAutocomplete",
        "variables": {
          "input": jobTitleInput,
          "enableUFJT": false
        },
        "query": "query jobTitleAutocomplete($input: String!, $enableUFJT: Boolean) {\n  jobTitleAutocomplete(term: $input, returnUserFriendlyJobTitle: $enableUFJT) {\n    id\n    label\n    __typename\n  }\n}\n"
      }
    ];
    
    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: graphUrlHeaders,
      body: JSON.stringify(graphqlQuery),
    });
    
    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`);
    }
    
    const jsonResponse = await response.json();
    const jobs = jsonResponse[0]?.data?.jobTitleAutocomplete || [];
    
    // Cache job title results (30 days TTL)
    if (jobs && jobs.length > 0) {
      setCacheValue(jobCacheKey, jobs, 30 * 24 * 60 * 60);
    }
    
    return jobs;
  } catch (error) {
    console.error('Error fetching job title autocomplete data:', error);
    throw error;
  }
}

/**
 * Fetches salary information for a specific company and job title
 * @param companyId Glassdoor company ID
 * @param jobId Glassdoor job title ID
 * @param jobTitle Job title text
 * @returns Salary information
 */
export async function fetchSalaries(companyId: number, jobId: number, jobTitle: string): Promise<any> {
  try {
    if (!graphUrl) {
      throw new Error('Glassdoor graph URL is not configured');
    }

    const graphqlQuery = [
      {
        "operationName": "EiSalariesGraphQuery",
        "variables": {
          "employerId": companyId,
          "countryId": 115,
          "jobTitle": jobTitle,
          "jobTitleId": jobId,
          "page": 1,
          "pageSize": 1,
          "sort": "UGC_SALARY_COUNT_DESC",
          "payPeriod": "ANNUAL",
          "enableUfjt": false
        },
        "query": "query EiSalariesGraphQuery($employerId: Int!, $stateId: Int, $countryId: Int, $cityId: Int, $metroId: Int, $jobTitle: String!, $jobTitleId: Int!, $page: Int!, $sgoc: Int, $sort: SalariesSortOrder, $payPeriod: PayPeriodEnum, $enableUfjt: Boolean, $pageSize: Int!) {\n  aggregatedSalaryEstimates(\n    aggregatedSalaryEstimatesInput: {employer: {id: $employerId}, jobTitle: {text: $jobTitle}, location: {cityId: $cityId, metroId: $metroId, stateId: $stateId, countryId: $countryId}, viewAsPayPeriodId: $payPeriod, sort: $sort, goc: {sgocId: $sgoc}, page: {num: $page, size: $pageSize}, enableUfjt: $enableUfjt}\n  ) {\n    numPages\n    jobTitleCount\n    salaryCount\n    mostRecent\n    queryLocation {\n      id\n      type\n      name\n      __typename\n    }\n    estimateSourceName\n    results {\n      currency {\n        code\n        __typename\n      }\n      jobTitle {\n        id\n        text\n        __typename\n      }\n      salaryCount\n      basePayStatistics {\n        percentiles {\n          ident\n          value\n          __typename\n        }\n        __typename\n      }\n      cashBonusStatistics {\n        percentiles {\n          ident\n          value\n          __typename\n        }\n        __typename\n      }\n      profitSharingStatistics {\n        percentiles {\n          ident\n          value\n          __typename\n        }\n        __typename\n      }\n      salesCommissionStatistics {\n        percentiles {\n          ident\n          value\n          __typename\n        }\n        __typename\n      }\n      stockBonusStatistics {\n        percentiles {\n          ident\n          value\n          __typename\n        }\n        __typename\n      }\n      tipsStatistics {\n        percentiles {\n          ident\n          value\n          __typename\n        }\n        __typename\n      }\n      totalAdditionalPayStatistics {\n        percentiles {\n          ident\n          value\n          __typename\n        }\n        __typename\n      }\n      totalPayStatistics {\n        percentiles {\n          ident\n          value\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  jobTitle(id: $jobTitleId) {\n    mgocId\n    __typename\n  }\n}\n"
      }
    ];
    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: graphUrlHeaders,
      body: JSON.stringify(graphqlQuery),
    });
    
    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`);
    }
    
    const jsonResponse = await response.json();
    return jsonResponse[0]?.data?.aggregatedSalaryEstimates.results || [];
  } catch (error) {
    console.error('Error fetching salary data:', error);
    throw error;
  }
}

/**
 * Formats a name by removing special characters and content after commas or parentheses
 * @param name Name to format
 * @returns Formatted name
 */
export function formatName(name: string): string {
  // Remove content after commas and parentheses, and remove special characters
  if (!name) return '';
  
  // Remove content after comma or opening parenthesis
  let cleanedName = name.split(/[,(]/)[0].trim();
  
  // Remove special characters, keeping only alphanumeric characters and spaces
  cleanedName = cleanedName.replace(/[^\w\s]/g, '');
  
  return cleanedName;
}

/**
 * Formats a salary number into a human-readable string with appropriate currency symbol and suffix
 * @param salary Salary amount
 * @param currency Currency code (INR, USD, etc.)
 * @returns Formatted salary string
 */
export function formatSalary(salary: number, currency: string): string {
  if (!salary) {
    return 'N/A';
  }

  const currencySymbols: { [key: string]: string } = {
    'INR': '₹',
    'GBP': '£',
    'USD': '$',
    'EUR': '€',
    'JPY': '¥',
    'AUD': 'A$',
    'CAD': 'C$'
  };

  const currencySymbol = currencySymbols[currency] || '';

  salary = Number(salary);

  // For Indian numbering system (lakhs and crores)
  if (salary >= 10000000) { // 1 crore = 10,000,000
    return currencySymbol + Math.round(salary / 10000000) + ' cr';
  } else if (salary >= 100000) { // 1 lakh = 100,000
    return currencySymbol + Math.round(salary / 100000) + ' lakh';
  } else if (salary >= 1000) { // 1k = 1,000
    return currencySymbol + Math.round(salary / 1000) + ' k';
  } else {
    return currencySymbol + salary;
  }
}

/**
 * Retrieves salary information for a specific company and job title
 * @param companyName Company name to search for
 * @param jobTitle Job title to search for
 * @returns Object containing salary and company information
 */
export async function getSalaryInfo(companyName: string, jobTitle: string) {
  try {
    // Generate cache key for the combined salary data
    const cacheKey = generateCacheKey(companyName, jobTitle);
    
    // Check combined cache first
    const cachedData = getCacheValue<any>(cacheKey);
    if (cachedData) {
      console.log(`Using cached salary data for ${companyName} - ${jobTitle}`);
      return cachedData;
    }
    
    console.log(`Fetching salary data for ${companyName} - ${jobTitle}`);
    
    // Format the input parameters
    const formattedCompanyName = formatName(companyName);
    const formattedJobTitle = formatName(jobTitle);

    // Step 1: Get company information
    const companies = await fetchGlassdoorCompanies(formattedCompanyName);
    if (!companies || companies.length === 0) {
      throw new Error(`No company found matching '${companyName}'`);
    }
    
    const { id: companyId, name: glassdoorCompanyName, overallRating: companyRating } = companies[0];

    // Step 2: Get job title information
    const jobs = await fetchJobTitles(formattedJobTitle);
    if (!jobs || jobs.length === 0) {
      throw new Error(`No job titles found matching '${jobTitle}'`);
    }
    
    const { id: jobId, label: jobName } = jobs[0];

    // Step 3: Get salary information
    const salaries = await fetchSalaries(companyId, jobId, jobName);
    if (!salaries || salaries.length === 0) {
      // throw new Error(`No salary data found for ${glassdoorCompanyName} and ${jobName}`);
    }
    
    const salary = salaries[0] || {};
    const salaryCurrency = salary?.currency?.code;
    
    // Get salary range percentiles
    const salaryPercentiles = salary?.totalPayStatistics?.percentiles || [];
    const salaryLow = salaryPercentiles.find((item: any) => item.ident === "P25")?.value;
    const salaryMed = salaryPercentiles.find((item: any) => item.ident === "P50")?.value;
    const salaryHigh = salaryPercentiles.find((item: any) => item.ident === "P75")?.value;
    
    // Format the salary values
    const salaryLowRange = formatSalary(salaryLow, salaryCurrency);
    const salaryMedian = formatSalary(salaryMed, salaryCurrency);
    const salaryHighRange = formatSalary(salaryHigh, salaryCurrency);

    // Create result object
    const result = {
      company: {
        name: glassdoorCompanyName,
        rating: companyRating
      },
      job: {
        title: jobName,
        salaryCount: salary.salaryCount || 0
      },
      salary: {
        currency: salaryCurrency,
        low: salaryLowRange,
        median: salaryMedian,
        high: salaryHighRange,
        range: `${salaryLowRange} - ${salaryHighRange}`,
      },
      source: "Glassdoor",
      timestamp: new Date().toISOString()
    };
    
    // Store in cache (15 days combined data)
    setCacheValue(cacheKey, result, 15 * 24 * 60 * 60);
    
    return result;
  } catch (error) {
    console.error("Error getting salary info:", error);
    throw error;
  }
} 