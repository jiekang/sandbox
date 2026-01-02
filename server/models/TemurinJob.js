import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  testType: {
    type: String,
    required: true,
    enum: [
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
    ],
  },
  jobName: String,
  jobUrl: String,
  buildNumber: Number,
  buildUrl: String,
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'UNSTABLE', 'ABORTED', 'IN_PROGRESS'],
  },
  result: String,
  timestamp: Date,
  duration: Number,
  testResults: {
    type: mongoose.Schema.Types.Mixed,
  },
  rawData: {
    type: mongoose.Schema.Types.Mixed,
  },
}, { _id: false });

const childJobSchema = new mongoose.Schema({
  jobName: {
    type: String,
    required: true,
  },
  jobUrl: String,
  buildNumber: Number,
  buildUrl: String,
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'UNSTABLE', 'ABORTED', 'IN_PROGRESS'],
  },
  result: String,
  timestamp: Date,
  duration: Number,
  rawData: {
    type: mongoose.Schema.Types.Mixed,
  },
}, { _id: false });

const temurinJobSchema = new mongoose.Schema({
  mainJobName: {
    type: String,
    required: true,
    index: true,
  },
  mainJobUrl: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    index: true,
  },
  architecture: {
    type: String,
    index: true,
  },
  variant: {
    type: String,
    default: 'temurin',
  },
  mainBuildNumber: {
    type: Number,
    required: true,
  },
  mainBuildUrl: {
    type: String,
    required: true,
  },
  mainStatus: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'UNSTABLE', 'ABORTED', 'IN_PROGRESS'],
    required: true,
  },
  mainResult: String,
  mainTimestamp: {
    type: Date,
    required: true,
    index: true,
  },
  mainDuration: Number,
  childJobs: [childJobSchema],
  testResults: [testResultSchema],
  rawData: {
    type: mongoose.Schema.Types.Mixed,
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate builds
temurinJobSchema.index({ mainJobName: 1, mainBuildNumber: 1 }, { unique: true });

// Index for querying recent jobs
temurinJobSchema.index({ fetchedAt: -1 });
temurinJobSchema.index({ mainTimestamp: -1 });
temurinJobSchema.index({ platform: 1, architecture: 1 });

const TemurinJob = mongoose.model('TemurinJob', temurinJobSchema);

export default TemurinJob;

