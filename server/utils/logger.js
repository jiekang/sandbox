import dotenv from 'dotenv';

dotenv.config();

// Configuration for logging
const LOG_HTTP_REQUESTS = process.env.LOG_HTTP_REQUESTS !== 'false';

/**
 * Logs HTTP request information if HTTP request logging is enabled
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} url - Request URL
 */
export const logHttpRequest = (method, url) => {
  if (LOG_HTTP_REQUESTS) {
    console.log(`[HTTP Request] ${method} ${url}`);
  }
};

/**
 * General logging function (always logs)
 * @param {...any} args - Arguments to log
 */
export const log = (...args) => {
  console.log(...args);
};

/**
 * Error logging function (always logs)
 * @param {...any} args - Arguments to log
 */
export const logError = (...args) => {
  console.error(...args);
};

