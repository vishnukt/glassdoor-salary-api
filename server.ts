import * as dotenv from 'dotenv';
dotenv.config();

import { findGlassdoorSalary } from './src/index';
import express, { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { Request as CloudRequest, Response as CloudResponse } from '@google-cloud/functions-framework';

const app = express();
const port = process.env.PORT || 8080;

// Add some basic logging
app.use((req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Create an adapter for handling the request/response conversion
const expressToCloudFunction = (handler: (req: CloudRequest, res: CloudResponse) => Promise<void>) => {
  return async (req: ExpressRequest, res: ExpressResponse) => {
    // Express and Cloud Functions Response objects are compatible enough
    // Just cast the request object
    await handler(req as unknown as CloudRequest, res as unknown as CloudResponse);
  };
};

// Create an endpoint that will handle requests
app.get('/', expressToCloudFunction(findGlassdoorSalary));

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Try: http://localhost:${port}?companyName=Google&jobTitle=Software+Engineer`);
}); 