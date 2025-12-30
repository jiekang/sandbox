import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const JENKINS_BASE_URL = process.env.JENKINS_BASE_URL || 'https://ci.adoptium.net';
const PIPELINE_JOB_PATH = process.env.PIPELINE_JOB_PATH || 'job/build-scripts/job/openjdk21-pipeline';

/**
 * Fetches job information from Jenkins API
 */
export const fetchJobInfo = async () => {
  try {
    const url = `${JENKINS_BASE_URL}/${PIPELINE_JOB_PATH}/api/json?tree=name,url,lastBuild[number,url,result,timestamp,duration,parameters[value,name]]`;
    console.log(`[HTTP Request] GET ${url}`);
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching job info:', error.message);
    throw error;
  }
};

/**
 * Fetches build information for a specific build number
 */
export const fetchBuildInfo = async (buildNumber) => {
  try {
    const url = `${JENKINS_BASE_URL}/${PIPELINE_JOB_PATH}/${buildNumber}/api/json?tree=number,url,result,timestamp,duration,parameters[value,name],actions[*]`;
    console.log(`[HTTP Request] GET ${url}`);
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching build ${buildNumber} info:`, error.message);
    throw error;
  }
};

/**
 * Fetches recent builds from the pipeline
 */
export const fetchRecentBuilds = async (limit = 10) => {
  try {
    const url = `${JENKINS_BASE_URL}/${PIPELINE_JOB_PATH}/api/json?tree=builds[number,url,result,timestamp,duration,parameters[value,name]]{0,${limit}}`;
    console.log(`[HTTP Request] GET ${url}`);
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data.builds || [];
  } catch (error) {
    console.error('Error fetching recent builds:', error.message);
    throw error;
  }
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
 * Extracts parameters from build actions
 */
export const extractParameters = (build) => {
  const params = {};
  
  if (build.parameters && Array.isArray(build.parameters)) {
    build.parameters.forEach(param => {
      if (param.name && param.value !== undefined) {
        params[param.name] = param.value;
      }
    });
  }
  
  return params;
};

