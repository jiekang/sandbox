import express from 'express';
import Job from '../models/Job.js';
import { fetchAndStoreJobs } from '../services/jobFetcher.js';

const router = express.Router();

/**
 * GET /api/jobs
 * Get all jobs with optional query parameters
 */
router.get('/', async (req, res) => {
  try {
    const {
      status,
      jobName,
      limit = 50,
      skip = 0,
      sort = '-fetchedAt',
    } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (jobName) {
      query.jobName = jobName;
    }
    
    const jobs = await Job.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    const total = await Job.countDocuments(query);
    
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
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/jobs/:id
 * Get a specific job by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }
    
    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/jobs/build/:buildNumber
 * Get a job by build number
 */
router.get('/build/:buildNumber', async (req, res) => {
  try {
    const { buildNumber } = req.params;
    const { jobName } = req.query;
    
    const query = { buildNumber: parseInt(buildNumber) };
    if (jobName) {
      query.jobName = jobName;
    }
    
    const job = await Job.findOne(query);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }
    
    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Error fetching job by build number:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/jobs/fetch
 * Manually trigger a job data fetch
 */
router.post('/fetch', async (req, res) => {
  try {
    const result = await fetchAndStoreJobs();
    res.json({
      success: true,
      message: 'Job data fetch completed',
      result,
    });
  } catch (error) {
    console.error('Error in manual fetch:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/jobs/stats/summary
 * Get summary statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const statusCounts = await Job.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    
    const latestJob = await Job.findOne().sort('-fetchedAt');
    
    res.json({
      success: true,
      data: {
        totalJobs,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        latestFetch: latestJob?.fetchedAt || null,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;



