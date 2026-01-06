import express from 'express';
import TemurinJob from '../models/TemurinJob.js';
import { fetchAndStoreTemurinJobs } from '../services/temurinFetcher.js';

const router = express.Router();

/**
 * GET /api/temurin-jobs
 * Get all temurin jobs with optional query parameters
 */
router.get('/', async (req, res) => {
  try {
    const {
      platform,
      architecture,
      status,
      mainJobName,
      limit = 50,
      skip = 0,
      sort = '-fetchedAt',
    } = req.query;
    
    const query = {};
    
    if (platform) {
      query.platform = platform;
    }
    
    if (architecture) {
      query.architecture = architecture;
    }
    
    if (status) {
      query.mainStatus = status;
    }
    
    if (mainJobName) {
      query.mainJobName = mainJobName;
    }
    
    const jobs = await TemurinJob.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    const total = await TemurinJob.countDocuments(query);
    
    res.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    console.error('Error fetching temurin jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/temurin-jobs/:id
 * Get a specific temurin job by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await TemurinJob.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Temurin job not found',
      });
    }
    
    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Error fetching temurin job:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/temurin-jobs/job/:jobName/build/:buildNumber
 * Get a temurin job by job name and build number
 */
router.get('/job/:jobName/build/:buildNumber', async (req, res) => {
  try {
    const { jobName, buildNumber } = req.params;
    
    const job = await TemurinJob.findOne({
      mainJobName: jobName,
      mainBuildNumber: parseInt(buildNumber),
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Temurin job not found',
      });
    }
    
    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Error fetching temurin job by build number:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/temurin-jobs/fetch
 * Manually trigger a temurin job data fetch
 */
router.post('/fetch', async (req, res) => {
  try {
    const result = await fetchAndStoreTemurinJobs();
    res.json({
      success: true,
      message: 'Temurin job data fetch completed',
      result,
    });
  } catch (error) {
    console.error('Error in manual temurin fetch:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/temurin-jobs/stats/summary
 * Get summary statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const totalJobs = await TemurinJob.countDocuments();
    const statusCounts = await TemurinJob.aggregate([
      {
        $group: {
          _id: '$mainStatus',
          count: { $sum: 1 },
        },
      },
    ]);
    
    const platformCounts = await TemurinJob.aggregate([
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
        },
      },
    ]);
    
    const architectureCounts = await TemurinJob.aggregate([
      {
        $group: {
          _id: '$architecture',
          count: { $sum: 1 },
        },
      },
    ]);
    
    const latestJob = await TemurinJob.findOne().sort('-fetchedAt');
    
    res.json({
      success: true,
      data: {
        totalJobs,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        platformCounts: platformCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        architectureCounts: architectureCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        latestFetch: latestJob?.fetchedAt || null,
      },
    });
  } catch (error) {
    console.error('Error fetching temurin stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/temurin-jobs/test-results/:testType
 * Get all test results for a specific test type
 */
router.get('/test-results/:testType', async (req, res) => {
  try {
    const { testType } = req.params;
    const { limit = 100, skip = 0 } = req.query;
    
    const jobs = await TemurinJob.find({
      'testResults.testType': testType,
    })
      .select('mainJobName mainBuildNumber testResults platform architecture mainTimestamp')
      .sort('-mainTimestamp')
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    // Extract test results for the specified type
    const testResults = [];
    for (const job of jobs) {
      const testResult = job.testResults.find(tr => tr.testType === testType);
      if (testResult) {
        testResults.push({
          mainJobName: job.mainJobName,
          mainBuildNumber: job.mainBuildNumber,
          platform: job.platform,
          architecture: job.architecture,
          mainTimestamp: job.mainTimestamp,
          ...testResult,
        });
      }
    }
    
    res.json({
      success: true,
      data: testResults,
      pagination: {
        total: testResults.length,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;



