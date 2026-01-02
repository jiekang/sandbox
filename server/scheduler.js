import cron from 'node-cron';
import { fetchAndStoreJobs } from './services/jobFetcher.js';
import { fetchAndStoreTemurinJobs } from './services/temurinFetcher.js';

/**
 * Initialize the hourly scheduler
 */
export const startScheduler = () => {
  console.log('Starting hourly scheduler for job data fetching...');
  
  // Run every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
  cron.schedule('0 * * * *', async () => {
    console.log(`\n[${new Date().toISOString()}] Scheduled job fetch triggered`);
    try {
      // Fetch pipeline jobs
      await fetchAndStoreJobs();
    } catch (error) {
      console.error('Scheduled pipeline job fetch failed:', error);
    }
    try {
      // Fetch temurin jobs
      await fetchAndStoreTemurinJobs();
    } catch (error) {
      console.error('Scheduled temurin job fetch failed:', error);
    }
  });
  
  // Also run immediately on startup
  console.log('Running initial job fetches...');
  fetchAndStoreJobs().catch(error => {
    console.error('Initial pipeline job fetch failed:', error);
  });
  fetchAndStoreTemurinJobs().catch(error => {
    console.error('Initial temurin job fetch failed:', error);
  });
};

