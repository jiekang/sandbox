import Job from '../models/Job.js';
import {
  fetchJobInfo,
  fetchRecentBuilds,
  mapBuildStatus,
  extractParameters,
} from './jenkinsService.js';

/**
 * Fetches and stores job data from Jenkins
 */
export const fetchAndStoreJobs = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Starting job data fetch...`);
    
    // Fetch job info to get the job name and URL
    const jobInfo = await fetchJobInfo();
    const jobName = jobInfo.name;
    const jobUrl = jobInfo.url;
    
    // Fetch recent builds (last 20 builds)
    const builds = await fetchRecentBuilds(20);
    
    if (!builds || builds.length === 0) {
      console.log('No builds found');
      return { fetched: 0, skipped: 0 };
    }
    
    let fetched = 0;
    let skipped = 0;
    
    // Process each build
    for (const build of builds) {
      try {
        // Check if build already exists
        const existingJob = await Job.findOne({
          jobName,
          buildNumber: build.number,
        });
        
        if (existingJob) {
          // Update existing job if needed
          existingJob.status = mapBuildStatus(build);
          existingJob.result = build.result || null;
          existingJob.duration = build.duration || null;
          existingJob.timestamp = build.timestamp ? new Date(build.timestamp) : new Date();
          existingJob.parameters = extractParameters(build);
          existingJob.rawData = build;
          existingJob.fetchedAt = new Date();
          await existingJob.save();
          skipped++;
          continue;
        }
        
        // Create new job record
        const job = new Job({
          jobName,
          jobUrl,
          buildNumber: build.number,
          buildUrl: build.url,
          status: mapBuildStatus(build),
          result: build.result || null,
          duration: build.duration || null,
          timestamp: build.timestamp ? new Date(build.timestamp) : new Date(),
          parameters: extractParameters(build),
          rawData: build,
        });
        
        await job.save();
        fetched++;
        console.log(`Saved build #${build.number} (${mapBuildStatus(build)})`);
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - build already exists
          skipped++;
        } else {
          console.error(`Error processing build ${build.number}:`, error.message);
        }
      }
    }
    
    console.log(`[${new Date().toISOString()}] Fetch complete: ${fetched} new, ${skipped} existing/updated`);
    return { fetched, skipped };
  } catch (error) {
    console.error('Error in fetchAndStoreJobs:', error.message);
    throw error;
  }
};



