import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  jobName: {
    type: String,
    required: true,
    index: true,
  },
  jobUrl: {
    type: String,
    required: true,
  },
  buildNumber: {
    type: Number,
    required: true,
  },
  buildUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'UNSTABLE', 'ABORTED', 'IN_PROGRESS'],
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
  },
  duration: {
    type: Number, // Duration in milliseconds
  },
  result: {
    type: String,
  },
  parameters: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
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
jobSchema.index({ jobName: 1, buildNumber: 1 }, { unique: true });

// Index for querying recent jobs
jobSchema.index({ fetchedAt: -1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;

