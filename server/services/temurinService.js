import axios from 'axios';
import dotenv from 'dotenv';
import { logHttpRequest } from '../utils/logger.js';

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
    logHttpRequest('GET', url);
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
    logHttpRequest('GET', url);
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
 * Fetches console output from a Jenkins build
 */
export const fetchConsoleOutput = async (jobUrl, buildNumber) => {
  try {
    const url = `${jobUrl}${buildNumber}/consoleText`;
    logHttpRequest('GET', url);
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'Accept': 'text/plain',
      },
      responseType: 'text',
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching console output for ${jobUrl}${buildNumber}:`, error.message);
    return null;
  }
};

/**
 * Parses console output to find test job references
 * Looks for patterns like "Starting building: Test_openjdk21_hs_sanity.openjdk_x86-64_linux #368"
 */
export const parseTestJobsFromConsole = (consoleOutput) => {
  if (!consoleOutput) {
    return [];
  }

  const testJobs = [];
  // Pattern to match: "Starting building: Test_openjdk21_hs_sanity.openjdk_x86-64_linux #368"
  // Also matches variations like "Triggering: Test_..." or "Building: Test_..."
  const patterns = [
    /Starting building:\s*(Test_[^\s#]+)\s*#(\d+)/gi,
    /Triggering:\s*(Test_[^\s#]+)\s*#(\d+)/gi,
    /Building:\s*(Test_[^\s#]+)\s*#(\d+)/gi,
    /Started building:\s*(Test_[^\s#]+)\s*#(\d+)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(consoleOutput)) !== null) {
      const testJobName = match[1].trim();
      const buildNumber = parseInt(match[2], 10);
      
      // Avoid duplicates
      const existing = testJobs.find(tj => tj.jobName === testJobName && tj.buildNumber === buildNumber);
      if (!existing) {
        testJobs.push({
          jobName: testJobName,
          buildNumber: buildNumber,
        });
      }
    }
  }

  return testJobs;
};

/**
 * Fetches test job data from Jenkins
 */
export const fetchTestJobData = async (testJobName, buildNumber) => {
  try {
    // Construct the test job URL
    // Test job names like "Test_openjdk21_hs_sanity.openjdk_x86-64_linux" 
    // need to be URL encoded: "Test%5Fopenjdk21%5Fhs%5Fsanity.openjdk%5Fx86-64%5Flinux"
    const encodedJobName = encodeURIComponent(testJobName);
    const testJobUrl = `${JENKINS_BASE_URL}/job/${encodedJobName}/`;
    
    // Fetch build info with test report
    const url = `${testJobUrl}${buildNumber}/api/json?tree=number,url,result,timestamp,duration,testReport[totalCount,skipCount,failCount,passCount,suites[*]]`;
    logHttpRequest('GET', url);
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    });

    const buildData = response.data;
    
    return {
      jobName: testJobName,
      jobUrl: testJobUrl,
      buildNumber: buildData.number,
      buildUrl: buildData.url,
      status: mapBuildStatus(buildData),
      result: buildData.result || null,
      timestamp: buildData.timestamp ? new Date(buildData.timestamp) : null,
      duration: buildData.duration || null,
      testReport: buildData.testReport || null,
      rawData: buildData,
    };
  } catch (error) {
    console.error(`Error fetching test job data for ${testJobName} #${buildNumber}:`, error.message);
    // Return basic info even if detailed fetch fails
    const encodedJobName = encodeURIComponent(testJobName);
    const testJobUrl = `${JENKINS_BASE_URL}/job/${encodedJobName}/`;
    return {
      jobName: testJobName,
      jobUrl: testJobUrl,
      buildNumber: buildNumber,
      buildUrl: `${testJobUrl}${buildNumber}/`,
      status: 'UNKNOWN',
      result: null,
      timestamp: null,
      duration: null,
      testReport: null,
      rawData: null,
    };
  }
};

/**
 * Fetches child jobs (test jobs) by parsing console output
 * This is the primary method for finding test jobs triggered by the temurin build
 */
export const fetchChildJobs = async (jobUrl, buildNumber, mainJobName, allJdk21uJobs) => {
  try {
    const childJobs = [];

    // Fetch console output to find test job references
    const consoleOutput = await fetchConsoleOutput(jobUrl, buildNumber);
    const testJobRefs = parseTestJobsFromConsole(consoleOutput);

    console.log(`Found ${testJobRefs.length} test job references in console output`);

    // Fetch data for each test job found in console
    for (const testJobRef of testJobRefs) {
      try {
        const testJobData = await fetchTestJobData(testJobRef.jobName, testJobRef.buildNumber);
        if (testJobData) {
          childJobs.push({
            jobName: testJobData.jobName,
            jobUrl: testJobData.jobUrl,
            buildNumber: testJobData.buildNumber,
            buildUrl: testJobData.buildUrl,
            status: testJobData.status,
            result: testJobData.result,
            timestamp: testJobData.timestamp,
            duration: testJobData.duration,
            rawData: {
              ...testJobData.rawData,
              testReport: testJobData.testReport, // Ensure testReport is included
            },
          });
        }
      } catch (error) {
        console.error(`Error fetching test job ${testJobRef.jobName} #${testJobRef.buildNumber}:`, error.message);
      }
    }

    // Fallback: Also try to get downstream projects from the job itself
    if (childJobs.length === 0) {
      const jobInfoUrl = `${jobUrl}api/json?tree=downstreamProjects[name,url,lastBuild[number,url,result,timestamp,duration]]`;
      logHttpRequest('GET', jobInfoUrl);
      const jobInfoResponse = await axios.get(jobInfoUrl, {
        timeout: 30000,
        headers: { 'Accept': 'application/json' },
      }).catch(() => null);

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
    logHttpRequest('GET', url);
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
 * Identifies test type from test job name
 * Test job names like "Test_openjdk21_hs_sanity.openjdk_x86-64_linux" contain the test type
 */
export const identifyTestTypeFromTestJob = (testJobName) => {
  const lowerName = testJobName.toLowerCase();
  
  // Map test job patterns to test types
  const testTypeMap = {
    'smoke': 'smoke test',
    'sanity.openjdk': 'sanity.openjdk',
    'sanity.system': 'sanity.system',
    'extended.system': 'extended.system',
    'sanity.perf': 'sanity.perf',
    'sanity.functional': 'sanity.functional',
    'extended.functional': 'extended.functional',
    'extended.openjdk': 'extended.openjdk',
    'extended.perf': 'extended.perf',
    'special.functional': 'special.functional',
    'special.openjdk': 'special.openjdk',
    'dev.functional': 'dev.functional',
    'special.jck': 'special.jck',
    'sanity.jck': 'sanity.jck',
    'extended.jck': 'extended.jck',
  };

  for (const [pattern, testType] of Object.entries(testTypeMap)) {
    if (lowerName.includes(pattern.replace('.', '')) || lowerName.includes(pattern.replace('.', '_'))) {
      return testType;
    }
  }

  return null;
};

/**
 * Extracts test results from child jobs
 * Child jobs are already fetched with test data, so we just need to identify the test type
 */
export const extractTestResults = async (childJobs) => {
  const testResults = [];

  for (const childJob of childJobs) {
    // Identify test type from the test job name
    const testType = identifyTestTypeFromTestJob(childJob.jobName);
    if (!testType) {
      // Skip if we can't identify the test type
      continue;
    }

    // Extract test report from the raw data if available
    // The testReport contains: totalCount, skipCount, failCount, passCount, suites
    const testReport = childJob.rawData?.testReport || null;

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
      testResults: testReport,
      rawData: childJob.rawData,
    });
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

