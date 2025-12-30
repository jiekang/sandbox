import cron from 'node-cron';
import { fetchAndStoreJobs } from './services/jobFetcher.js';

/**
 * Initialize the hourly scheduler
 */
export const startScheduler = () => {
  console.log('Starting hourly scheduler for job data fetching...');
  
  // Run every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
  cron.schedule('0 * * * *', async () => {
    console.log(`\n[${new Date().toISOString()}] Scheduled job fetch triggered`);
    try {
      await fetchAndStoreJobs();
    } catch (error) {
      console.error('Scheduled job fetch failed:', error);
    }
  });
  
  // Also run immediately on startup
  console.log('Running initial job fetch...');
  fetchAndStoreJobs().catch(error => {
    console.error('Initial job fetch failed:', error);
  });
};

