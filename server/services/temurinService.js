import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const JENKINS_BASE_URL = process.env.JENKINS_BASE_URL || 'https://ci.adoptium.net';
const JDK21U_JOB_PATH = process.env.JDK21U_JOB_PATH || 'job/build-scripts/job/jobs/job/jdk21u';

// Test job patterns to look for
const TEST_JOB_PATTERNS = [
  'smoke test',
  'sanity.openjdk',
  'sanity.system',
  'extended.system',
  'sanity.perf',
  'sanity.functional',
  'extended.functional',
  'extended.openjdk',
  'extended.perf',
  'special.functional',
  'special.openjdk',
  'dev.functional',
  'special.jck',
  'sanity.jck',
  'extended.jck',
];

/**
 * Fetches all jobs from the jdk21u folder
 */
export const fetchJdk21uJobs = async () => {
  try {
    const url = `${JENKINS_BASE_URL}/${JDK21U_JOB_PATH}/api/json?tree=jobs[name,url,lastBuild[number,url,result,timestamp,duration]]`;
    console.log(`[HTTP Request] GET ${url}`);
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data.jobs || [];
  } catch (error) {
    console.error('Error fetching jdk21u jobs:', error.message);
    throw error;
  }
};

/**
 * Checks if a job name is a temurin build job
 */
export const isTemurinJob = (jobName) => {
  return jobName.includes('temurin') && 
         !jobName.includes('SmokeTests') && 
         !jobName.includes('_SmokeTests');
};

/**
 * Extracts platform and architecture from job name
 */
export const parseJobName = (jobName) => {
  // Example: jdk21u-linux-x64-temurin
  const parts = jobName.split('-');
  if (parts.length >= 4) {
    return {
      platform: parts[1], // linux, windows, mac, etc.
      architecture: parts[2], // x64, aarch64, ppc64le, etc.
    };
  }
  return { platform: 'unknown', architecture: 'unknown' };
};

/**
 * Fetches detailed build information for a job
 */
export const fetchJobBuildInfo = async (jobUrl, buildNumber) => {
  try {
    const url = `${jobUrl}${buildNumber}/api/json?tree=number,url,result,timestamp,duration,actions[*],runs[*]`;
    console.log(`[HTTP Request] GET ${url}`);
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching build info for ${jobUrl}${buildNumber}:`, error.message);
    return null;
  }
};

/**
 * Finds related test jobs by searching for jobs with similar names
 */
export const findRelatedTestJobs = async (mainJobName, jdk21uJobs) => {
  // Extract base name (e.g., "jdk21u-linux-x64-temurin" from "jdk21u-linux-x64-temurin")
  const baseName = mainJobName.replace(/_SmokeTests$/, '');
  const testJobs = [];

  for (const job of jdk21uJobs) {
    // Look for test jobs that match the pattern: baseName + test pattern
    // Examples: jdk21u-linux-x64-temurin_SmokeTests, jdk21u-linux-x64-temurin_sanity.openjdk, etc.
    if (job.name.startsWith(baseName) && job.name !== mainJobName) {
      if (job.lastBuild) {
        testJobs.push({
          jobName: job.name,
          jobUrl: job.url,
          buildNumber: job.lastBuild.number,
          buildUrl: job.lastBuild.url,
          status: mapBuildStatus(job.lastBuild),
          result: job.lastBuild.result || null,
          timestamp: job.lastBuild.timestamp ? new Date(job.lastBuild.timestamp) : null,
          duration: job.lastBuild.duration || null,
          rawData: job.lastBuild,
        });
      }
    }
  }

  return testJobs;
};

/**
 * Fetches child jobs (downstream jobs) for a build
 * In Jenkins, child jobs can be found through downstreamProjects or through the build's actions
 */
export const fetchChildJobs = async (jobUrl, buildNumber, mainJobName, allJdk21uJobs) => {
  try {
    const childJobs = [];

    // First, try to get downstream projects from the job itself
    const jobInfoUrl = `${jobUrl}api/json?tree=downstreamProjects[name,url,lastBuild[number,url,result,timestamp,duration]]`;
    console.log(`[HTTP Request] GET ${jobInfoUrl}`);
    const jobInfoResponse = await axios.get(jobInfoUrl, {
      timeout: 30000,
      headers: { 'Accept': 'application/json' },
    }).catch(() => null);

    // Get downstream projects if available
    if (jobInfoResponse?.data?.downstreamProjects) {
      for (const downstream of jobInfoResponse.data.downstreamProjects) {
        if (downstream.lastBuild) {
          childJobs.push({
            jobName: downstream.name,
            jobUrl: downstream.url,
            buildNumber: downstream.lastBuild.number,
            buildUrl: downstream.lastBuild.url,
            status: mapBuildStatus(downstream.lastBuild),
            result: downstream.lastBuild.result || null,
            timestamp: downstream.lastBuild.timestamp ? new Date(downstream.lastBuild.timestamp) : null,
            duration: downstream.lastBuild.duration || null,
            rawData: downstream.lastBuild,
          });
        }
      }
    }

    // Also try to get runs from the build info
    const buildInfo = await fetchJobBuildInfo(jobUrl, buildNumber);
    if (buildInfo?.runs) {
      for (const run of buildInfo.runs) {
        if (run.url && run.result !== undefined) {
          // Avoid duplicates
          const existing = childJobs.find(cj => cj.jobUrl === run.url);
          if (!existing) {
            childJobs.push({
              jobName: run.url.split('/job/').pop().replace(/\//g, ''),
              jobUrl: run.url,
              buildNumber: run.number,
              buildUrl: run.url,
              status: mapBuildStatus(run),
              result: run.result || null,
              timestamp: run.timestamp ? new Date(run.timestamp) : null,
              duration: run.duration || null,
              rawData: run,
            });
          }
        }
      }
    }

    // Also search for related test jobs by name pattern
    if (allJdk21uJobs && mainJobName) {
      const relatedTestJobs = await findRelatedTestJobs(mainJobName, allJdk21uJobs);
      for (const testJob of relatedTestJobs) {
        const existing = childJobs.find(cj => cj.jobUrl === testJob.jobUrl);
        if (!existing) {
          childJobs.push(testJob);
        }
      }
    }

    return childJobs;
  } catch (error) {
    console.error(`Error fetching child jobs for ${jobUrl}${buildNumber}:`, error.message);
    return [];
  }
};

/**
 * Identifies test type from job name
 */
export const identifyTestType = (jobName) => {
  const lowerName = jobName.toLowerCase();
  // Check for exact matches first, then partial matches
  for (const pattern of TEST_JOB_PATTERNS) {
    const patternLower = pattern.toLowerCase();
    // Check for exact pattern match or pattern with underscores/dashes
    if (lowerName.includes(patternLower) || 
        lowerName.includes(patternLower.replace('.', '')) ||
        lowerName.includes(patternLower.replace('.', '_')) ||
        lowerName.includes(patternLower.replace('.', '-'))) {
      return pattern;
    }
  }
  return null;
};

/**
 * Fetches test results for a test job
 */
export const fetchTestResults = async (testJobUrl, buildNumber) => {
  try {
    const url = `${testJobUrl}${buildNumber}/api/json?tree=number,url,result,timestamp,duration,actions[*],testReport[totalCount,skipCount,failCount,passCount,suites[*]]`;
    console.log(`[HTTP Request] GET ${url}`);
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching test results for ${testJobUrl}${buildNumber}:`, error.message);
    return null;
  }
};

/**
 * Extracts test results from child jobs
 */
export const extractTestResults = async (childJobs) => {
  const testResults = [];

  for (const childJob of childJobs) {
    const testType = identifyTestType(childJob.jobName);
    if (!testType) {
      continue;
    }

    try {
      const testData = await fetchTestResults(childJob.jobUrl, childJob.buildNumber);
      testResults.push({
        testType,
        jobName: childJob.jobName,
        jobUrl: childJob.jobUrl,
        buildNumber: childJob.buildNumber,
        buildUrl: childJob.buildUrl,
        status: childJob.status,
        result: childJob.result,
        timestamp: childJob.timestamp,
        duration: childJob.duration,
        testResults: testData?.testReport || null,
        rawData: testData,
      });
    } catch (error) {
      console.error(`Error extracting test results for ${childJob.jobName}:`, error.message);
      // Still add the test job even if we couldn't fetch detailed results
      testResults.push({
        testType,
        jobName: childJob.jobName,
        jobUrl: childJob.jobUrl,
        buildNumber: childJob.buildNumber,
        buildUrl: childJob.buildUrl,
        status: childJob.status,
        result: childJob.result,
        timestamp: childJob.timestamp,
        duration: childJob.duration,
        testResults: null,
        rawData: childJob.rawData,
      });
    }
  }

  return testResults;
};

/**
 * Maps Jenkins build status to our status enum
 */
export const mapBuildStatus = (build) => {
  if (!build.result) {
    return 'IN_PROGRESS';
  }
  
  const statusMap = {
    'SUCCESS': 'SUCCESS',
    'FAILURE': 'FAILURE',
    'UNSTABLE': 'UNSTABLE',
    'ABORTED': 'ABORTED',
  };
  
  return statusMap[build.result] || 'UNSTABLE';
};

/**
 * Fetches and processes a temurin job with its child jobs and test results
 */
export const fetchTemurinJobData = async (job, allJdk21uJobs = null) => {
  try {
    if (!job.lastBuild) {
      return null;
    }

    const { platform, architecture } = parseJobName(job.name);
    const mainBuild = job.lastBuild;

    // Fetch child jobs (pass all jobs to search for related test jobs)
    const childJobs = await fetchChildJobs(job.url, mainBuild.number, job.name, allJdk21uJobs);

    // Extract test results from child jobs
    const testResults = await extractTestResults(childJobs);

    return {
      mainJobName: job.name,
      mainJobUrl: job.url,
      platform,
      architecture,
      variant: 'temurin',
      mainBuildNumber: mainBuild.number,
      mainBuildUrl: mainBuild.url,
      mainStatus: mapBuildStatus(mainBuild),
      mainResult: mainBuild.result || null,
      mainTimestamp: mainBuild.timestamp ? new Date(mainBuild.timestamp) : new Date(),
      mainDuration: mainBuild.duration || null,
      childJobs,
      testResults,
      rawData: {
        mainJob: job,
        mainBuild,
      },
    };
  } catch (error) {
    console.error(`Error processing temurin job ${job.name}:`, error.message);
    return null;
  }
};

