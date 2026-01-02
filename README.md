# sandbox
Random code playground

## OpenJDK Pipeline Job Fetcher API

A Node.js API that fetches job data from OpenJDK pipelines on ci.adoptium.net every hour and stores it in MongoDB.

### Features

- Automatically fetches job data from Jenkins CI every hour
  - Pipeline jobs from OpenJDK build pipelines
  - Temurin build jobs from jdk21u folder with test results
- Stores build information in MongoDB
- RESTful API to query stored job data
- Manual fetch endpoints for on-demand updates
- Statistics and summary endpoints
- Test result tracking for temurin jobs (15 test types)

### Prerequisites

- Node.js 18+ (Vite 7 requires Node.js 20.19+ or 22.12+)
- MongoDB (local or MongoDB Atlas)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your MongoDB connection string:
   ```
   MONGO_URI=mongodb://localhost:27017/openjdk_jobs
   PORT=3001
   JENKINS_BASE_URL=https://ci.adoptium.net
   PIPELINE_JOB_PATH=job/build-scripts/job/weekly-openjdk21-pipeline
   JDK21U_JOB_PATH=job/build-scripts/job/jobs/job/jdk21u
   ```

3. **Start MongoDB** (if running locally):
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   ```

4. **Start the API server:**
   ```bash
   npm run server
   ```
   
   Or with auto-reload:
   ```bash
   npm run server:dev
   ```

The server will:
- Connect to MongoDB
- Run an initial job fetch (both pipeline and temurin jobs)
- Start the hourly scheduler (runs at the top of every hour)

### API Endpoints

#### Health Check
- `GET /health` - Check if the server is running

#### Jobs
- `GET /api/jobs` - Get all jobs
  - Query parameters:
    - `status` - Filter by status (SUCCESS, FAILURE, UNSTABLE, ABORTED, IN_PROGRESS)
    - `jobName` - Filter by job name
    - `limit` - Number of results (default: 50)
    - `skip` - Number of results to skip (default: 0)
    - `sort` - Sort field (default: -fetchedAt)
  
- `GET /api/jobs/:id` - Get a specific job by MongoDB ID
  
- `GET /api/jobs/build/:buildNumber` - Get a job by build number
  - Query parameter: `jobName` (optional)
  
- `POST /api/jobs/fetch` - Manually trigger a job data fetch
  
- `GET /api/jobs/stats/summary` - Get summary statistics

#### Temurin Jobs

The API also fetches and stores temurin build jobs from the [jdk21u folder](https://ci.adoptium.net/job/build-scripts/job/jobs/job/jdk21u/), including main job status, child job statuses, and test results.

- `GET /api/temurin-jobs` - Get all temurin jobs
  - Query parameters:
    - `platform` - Filter by platform (linux, windows, mac, etc.)
    - `architecture` - Filter by architecture (x64, aarch64, ppc64le, etc.)
    - `status` - Filter by main job status
    - `mainJobName` - Filter by main job name
    - `limit` - Number of results (default: 50)
    - `skip` - Number of results to skip (default: 0)
    - `sort` - Sort field (default: -fetchedAt)
  
- `GET /api/temurin-jobs/:id` - Get a specific temurin job by MongoDB ID
  
- `GET /api/temurin-jobs/job/:jobName/build/:buildNumber` - Get a temurin job by job name and build number
  
- `POST /api/temurin-jobs/fetch` - Manually trigger a temurin job data fetch
  
- `GET /api/temurin-jobs/stats/summary` - Get summary statistics for temurin jobs
  
- `GET /api/temurin-jobs/test-results/:testType` - Get all test results for a specific test type
  - Test types: `smoke test`, `sanity.openjdk`, `sanity.system`, `extended.system`, `sanity.perf`, `sanity.functional`, `extended.functional`, `extended.openjdk`, `extended.perf`, `special.functional`, `special.openjdk`, `dev.functional`, `special.jck`, `sanity.jck`, `extended.jck`

### Example API Calls

```bash
# Get all jobs
curl http://localhost:3001/api/jobs

# Get only successful builds
curl http://localhost:3001/api/jobs?status=SUCCESS

# Get a specific build
curl http://localhost:3001/api/jobs/build/123

# Manually trigger a fetch
curl -X POST http://localhost:3001/api/jobs/fetch

# Get statistics
curl http://localhost:3001/api/jobs/stats/summary

# Get all temurin jobs
curl http://localhost:3001/api/temurin-jobs

# Get temurin jobs for Linux x64 platform
curl http://localhost:3001/api/temurin-jobs?platform=linux&architecture=x64

# Get a specific temurin job
curl http://localhost:3001/api/temurin-jobs/job/jdk21u-linux-x64-temurin/build/123

# Manually trigger temurin job fetch
curl -X POST http://localhost:3001/api/temurin-jobs/fetch

# Get temurin job statistics
curl http://localhost:3001/api/temurin-jobs/stats/summary

# Get test results for a specific test type
curl http://localhost:3001/api/temurin-jobs/test-results/sanity.openjdk
```

### Frontend Development

The React frontend provides a web interface to view and interact with the build data stored in MongoDB.

#### Starting the Frontend

1. **Ensure the backend server is running** (see [Setup](#setup) above):
   ```bash
   npm run server
   ```

2. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

3. **Access the frontend:**
   - Open your browser and navigate to: `http://localhost:5173`
   - The Vite dev server typically runs on port 5173 by default
   - Check the terminal output for the exact URL if different

#### Frontend Features

The homepage displays:
- **Statistics Dashboard** - Total builds, success/failure counts, and last fetch time
- **Build Data Table** - Sortable and filterable table showing:
  - Build number
  - Status (color-coded badges)
  - Duration
  - Timestamp
  - Fetched at time
  - Direct links to Jenkins build pages
- **Filtering** - Filter by status and limit results
- **Manual Fetch** - Button to trigger immediate data fetch from Jenkins
- **Refresh** - Button to reload the current data

#### Development Notes

- The frontend uses Vite's proxy configuration to forward `/api` requests to the backend server (port 3001)
- Hot module replacement (HMR) is enabled for fast development
- Both frontend and backend can run simultaneously in separate terminals

### Project Structure

```
.
├── server/
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── models/
│   │   └── Job.js            # Job data model
│   ├── routes/
│   │   └── jobs.js           # API routes
│   ├── services/
│   │   ├── jenkinsService.js # Jenkins API client
│   │   └── jobFetcher.js     # Job fetching logic
│   ├── scheduler.js          # Hourly scheduler
│   └── index.js              # Express server
├── src/                      # React frontend
├── .env.example              # Environment variables template
└── package.json
```
