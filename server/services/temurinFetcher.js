import TemurinJob from '../models/TemurinJob.js';
import {
  fetchJdk21uJobs,
  isTemurinJob,
  fetchTemurinJobData,
} from './temurinService.js';

/**
 * Fetches and stores temurin job data from Jenkins
 */
export const fetchAndStoreTemurinJobs = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Starting temurin job data fetch...`);
    
    // Fetch all jobs from jdk21u folder
    const allJobs = await fetchJdk21uJobs();
    
    // Filter for temurin jobs
    const temurinJobs = allJobs.filter(job => isTemurinJob(job.name));
    
    console.log(`Found ${temurinJobs.length} temurin jobs`);
    
    if (temurinJobs.length === 0) {
      console.log('No temurin jobs found');
      return { fetched: 0, skipped: 0, errors: 0 };
    }
    
    let fetched = 0;
    let skipped = 0;
    let errors = 0;
    
    // Process each temurin job
    for (const job of temurinJobs) {
      try {
        if (!job.lastBuild) {
          console.log(`Skipping ${job.name} - no builds`);
          skipped++;
          continue;
        }

        // Check if build already exists
        const existingJob = await TemurinJob.findOne({
          mainJobName: job.name,
          mainBuildNumber: job.lastBuild.number,
        });
        
        if (existingJob) {
          // Update existing job (pass all jobs to find related test jobs)
          const jobData = await fetchTemurinJobData(job, allJobs);
          if (jobData) {
            existingJob.mainStatus = jobData.mainStatus;
            existingJob.mainResult = jobData.mainResult;
            existingJob.mainDuration = jobData.mainDuration;
            existingJob.mainTimestamp = jobData.mainTimestamp;
            existingJob.childJobs = jobData.childJobs;
            existingJob.testResults = jobData.testResults;
            existingJob.rawData = jobData.rawData;
            existingJob.fetchedAt = new Date();
            await existingJob.save();
            skipped++;
            console.log(`Updated ${job.name} build #${job.lastBuild.number}`);
          }
          continue;
        }
        
        // Fetch and process job data (pass all jobs to find related test jobs)
        const jobData = await fetchTemurinJobData(job, allJobs);
        
        if (!jobData) {
          errors++;
          console.error(`Failed to process ${job.name}`);
          continue;
        }
        
        // Create new job record
        const temurinJob = new TemurinJob(jobData);
        await temurinJob.save();
        fetched++;
        console.log(`Saved ${job.name} build #${job.lastBuild.number} (${jobData.testResults.length} test results)`);
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - build already exists
          skipped++;
        } else {
          console.error(`Error processing ${job.name}:`, error.message);
          errors++;
        }
      }
    }
    
    console.log(`[${new Date().toISOString()}] Temurin fetch complete: ${fetched} new, ${skipped} existing/updated, ${errors} errors`);
    return { fetched, skipped, errors };
  } catch (error) {
    console.error('Error in fetchAndStoreTemurinJobs:', error.message);
    throw error;
  }
};

