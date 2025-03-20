"use strict";
/**
 * Glassdoor API integration functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalaryInfo = exports.formatSalary = exports.formatName = exports.fetchSalaries = exports.fetchJobTitles = exports.fetchGlassdoorCompanies = void 0;
const cache_1 = require("./cache");
// Check and provide fallbacks for environment variables
const baseUrl = "test"; // process.env.GLASSDOOR_BASE_URL;
const graphUrl = "test"; // process.env.GLASSDOOR_GRAPH_URL;
const graphUrlHeaders = {}; // JSON.parse(process.env.GLASSDOOR_GRAPH_URL_HEADERS as string);
/**
 * Fetches companies from Glassdoor based on company name
 * @param companyName Name of the company to search for
 * @returns List of matching companies with details
 */
async function fetchGlassdoorCompanies(companyName) {
    try {
        // Check company cache first
        const companyCacheKey = (0, cache_1.generateCompanyCacheKey)(companyName);
        const cachedCompanies = (0, cache_1.getCacheValue)(companyCacheKey);
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
            (0, cache_1.setCacheValue)(companyCacheKey, companies, 30 * 24 * 60 * 60);
        }
        return companies;
    }
    catch (error) {
        console.error('Error fetching Glassdoor company data:', error);
        throw error;
    }
}
exports.fetchGlassdoorCompanies = fetchGlassdoorCompanies;
/**
 * Fetches job titles from Glassdoor based on job title input
 * @param jobTitleInput Job title to search for
 * @returns List of matching job titles
 */
async function fetchJobTitles(jobTitleInput) {
    var _a, _b;
    try {
        // Check job title cache first
        const jobCacheKey = (0, cache_1.generateJobCacheKey)(jobTitleInput);
        const cachedJobs = (0, cache_1.getCacheValue)(jobCacheKey);
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
        const jobs = ((_b = (_a = jsonResponse[0]) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.jobTitleAutocomplete) || [];
        // Cache job title results (30 days TTL)
        if (jobs && jobs.length > 0) {
            (0, cache_1.setCacheValue)(jobCacheKey, jobs, 30 * 24 * 60 * 60);
        }
        return jobs;
    }
    catch (error) {
        console.error('Error fetching job title autocomplete data:', error);
        throw error;
    }
}
exports.fetchJobTitles = fetchJobTitles;
/**
 * Fetches salary information for a specific company and job title
 * @param companyId Glassdoor company ID
 * @param jobId Glassdoor job title ID
 * @param jobTitle Job title text
 * @returns Salary information
 */
async function fetchSalaries(companyId, jobId, jobTitle) {
    var _a, _b;
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
        return ((_b = (_a = jsonResponse[0]) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.aggregatedSalaryEstimates.results) || [];
    }
    catch (error) {
        console.error('Error fetching salary data:', error);
        throw error;
    }
}
exports.fetchSalaries = fetchSalaries;
/**
 * Formats a name by removing special characters and content after commas or parentheses
 * @param name Name to format
 * @returns Formatted name
 */
function formatName(name) {
    // Remove content after commas and parentheses, and remove special characters
    if (!name)
        return '';
    // Remove content after comma or opening parenthesis
    let cleanedName = name.split(/[,(]/)[0].trim();
    // Remove special characters, keeping only alphanumeric characters and spaces
    cleanedName = cleanedName.replace(/[^\w\s]/g, '');
    return cleanedName;
}
exports.formatName = formatName;
/**
 * Formats a salary number into a human-readable string with appropriate currency symbol and suffix
 * @param salary Salary amount
 * @param currency Currency code (INR, USD, etc.)
 * @returns Formatted salary string
 */
function formatSalary(salary, currency) {
    if (!salary) {
        return 'N/A';
    }
    const currencySymbols = {
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
    }
    else if (salary >= 100000) { // 1 lakh = 100,000
        return currencySymbol + Math.round(salary / 100000) + ' lakh';
    }
    else if (salary >= 1000) { // 1k = 1,000
        return currencySymbol + Math.round(salary / 1000) + ' k';
    }
    else {
        return currencySymbol + salary;
    }
}
exports.formatSalary = formatSalary;
/**
 * Retrieves salary information for a specific company and job title
 * @param companyName Company name to search for
 * @param jobTitle Job title to search for
 * @returns Object containing salary and company information
 */
async function getSalaryInfo(companyName, jobTitle) {
    var _a, _b, _c, _d, _e;
    try {
        // Generate cache key for the combined salary data
        const cacheKey = (0, cache_1.generateCacheKey)(companyName, jobTitle);
        // Check combined cache first
        const cachedData = (0, cache_1.getCacheValue)(cacheKey);
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
        const salaryCurrency = (_a = salary === null || salary === void 0 ? void 0 : salary.currency) === null || _a === void 0 ? void 0 : _a.code;
        // Get salary range percentiles
        const salaryPercentiles = ((_b = salary === null || salary === void 0 ? void 0 : salary.totalPayStatistics) === null || _b === void 0 ? void 0 : _b.percentiles) || [];
        const salaryLow = (_c = salaryPercentiles.find((item) => item.ident === "P25")) === null || _c === void 0 ? void 0 : _c.value;
        const salaryMed = (_d = salaryPercentiles.find((item) => item.ident === "P50")) === null || _d === void 0 ? void 0 : _d.value;
        const salaryHigh = (_e = salaryPercentiles.find((item) => item.ident === "P75")) === null || _e === void 0 ? void 0 : _e.value;
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
        (0, cache_1.setCacheValue)(cacheKey, result, 15 * 24 * 60 * 60);
        return result;
    }
    catch (error) {
        console.error("Error getting salary info:", error);
        throw error;
    }
}
exports.getSalaryInfo = getSalaryInfo;
//# sourceMappingURL=glassdoor.js.map