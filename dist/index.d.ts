import { Request, Response } from '@google-cloud/functions-framework';
/**
 * Google Cloud Function to find Glassdoor salary information
 *
 * @param {Request} req - The HTTP request object
 * @param {Response} res - The HTTP response object
 */
export declare const findGlassdoorSalary: (req: Request, res: Response) => Promise<void>;
