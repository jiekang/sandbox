import { useState, useEffect } from 'react';
import './TemurinJobList.css';

function TemurinJobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({
    status: '',
    platform: '',
    architecture: '',
    limit: 50,
  });
  const [sort, setSort] = useState({
    column: 'mainBuildNumber',
    direction: 'desc',
  });

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [filter, sort]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.platform) params.append('platform', filter.platform);
      if (filter.architecture) params.append('architecture', filter.architecture);
      params.append('limit', filter.limit);
      
      const sortParam = sort.direction === 'desc' ? `-${sort.column}` : sort.column;
      params.append('sort', sortParam);

      const response = await fetch(`/api/temurin-jobs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.data);
      } else {
        setError(data.error || 'Failed to fetch temurin jobs');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/temurin-jobs/stats/summary');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      SUCCESS: '#10b981',
      FAILURE: '#ef4444',
      UNSTABLE: '#f59e0b',
      ABORTED: '#6b7280',
      IN_PROGRESS: '#3b82f6',
      UNKNOWN: '#9ca3af',
    };
    return colors[status] || '#6b7280';
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleRefresh = () => {
    fetchJobs();
    fetchStats();
  };

  const handleManualFetch = async () => {
    try {
      const response = await fetch('/api/temurin-jobs/fetch', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        alert(`Fetch completed: ${data.result.fetched} new, ${data.result.skipped} existing, ${data.result.errors} errors`);
        fetchJobs();
        fetchStats();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSort = (column) => {
    setSort((prevSort) => {
      if (prevSort.column === column) {
        return {
          column,
          direction: prevSort.direction === 'asc' ? 'desc' : 'asc',
        };
      } else {
        return {
          column,
          direction: 'desc',
        };
      }
    });
  };

  const getSortIcon = (column) => {
    if (sort.column !== column) {
      return <span className="sort-icon" aria-label="Not sorted">↕</span>;
    }
    return sort.direction === 'asc' ? (
      <span className="sort-icon sort-icon-active" aria-label="Sorted ascending">↑</span>
    ) : (
      <span className="sort-icon sort-icon-active" aria-label="Sorted descending">↓</span>
    );
  };

  const getTestResultsSummary = (testResults) => {
    if (!testResults || testResults.length === 0) {
      return 'No tests';
    }
    const passed = testResults.filter(tr => tr.status === 'SUCCESS').length;
    const failed = testResults.filter(tr => tr.status === 'FAILURE').length;
    const unstable = testResults.filter(tr => tr.status === 'UNSTABLE').length;
    return `${passed} passed, ${failed} failed, ${unstable} unstable`;
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="temurin-job-list-container">
        <div className="loading">Loading temurin job data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="temurin-job-list-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  // Get unique platforms and architectures for filters
  const uniquePlatforms = [...new Set(jobs.map(j => j.platform).filter(Boolean))].sort();
  const uniqueArchitectures = [...new Set(jobs.map(j => j.architecture).filter(Boolean))].sort();

  return (
    <div className="temurin-job-list-container">
      <div className="header">
        <h1>Temurin Build Jobs</h1>
        <div className="header-actions">
          <button onClick={handleRefresh} className="btn btn-secondary">
            Refresh
          </button>
          <button onClick={handleManualFetch} className="btn btn-primary">
            Fetch Latest
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats">
          <div className="stat-card">
            <div className="stat-label">Total Jobs</div>
            <div className="stat-value">{stats.totalJobs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Success</div>
            <div className="stat-value" style={{ color: '#10b981' }}>
              {stats.statusCounts.SUCCESS || 0}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Failure</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {stats.statusCounts.FAILURE || 0}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Unstable</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              {stats.statusCounts.UNSTABLE || 0}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Platforms</div>
            <div className="stat-value">{Object.keys(stats.platformCounts || {}).length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Last Fetch</div>
            <div className="stat-value">
              {stats.latestFetch ? formatDate(stats.latestFetch) : 'N/A'}
            </div>
          </div>
        </div>
      )}

      <div className="filters">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILURE">Failure</option>
          <option value="UNSTABLE">Unstable</option>
          <option value="ABORTED">Aborted</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="UNKNOWN">Unknown</option>
        </select>
        <select
          value={filter.platform}
          onChange={(e) => setFilter({ ...filter, platform: e.target.value })}
          className="filter-select"
        >
          <option value="">All Platforms</option>
          {uniquePlatforms.map(platform => (
            <option key={platform} value={platform}>{platform}</option>
          ))}
        </select>
        <select
          value={filter.architecture}
          onChange={(e) => setFilter({ ...filter, architecture: e.target.value })}
          className="filter-select"
        >
          <option value="">All Architectures</option>
          {uniqueArchitectures.map(arch => (
            <option key={arch} value={arch}>{arch}</option>
          ))}
        </select>
        <select
          value={filter.limit}
          onChange={(e) => setFilter({ ...filter, limit: parseInt(e.target.value) })}
          className="filter-select"
        >
          <option value="25">25 jobs</option>
          <option value="50">50 jobs</option>
          <option value="100">100 jobs</option>
        </select>
      </div>

      <div className="jobs-table">
        <table>
          <thead>
            <tr>
              <th 
                className="sortable" 
                onClick={() => handleSort('mainJobName')}
                title="Click to sort by Job Name"
              >
                Job Name {getSortIcon('mainJobName')}
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort('platform')}
                title="Click to sort by Platform"
              >
                Platform {getSortIcon('platform')}
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort('architecture')}
                title="Click to sort by Architecture"
              >
                Architecture {getSortIcon('architecture')}
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort('mainBuildNumber')}
                title="Click to sort by Build Number"
              >
                Build # {getSortIcon('mainBuildNumber')}
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort('mainStatus')}
                title="Click to sort by Status"
              >
                Status {getSortIcon('mainStatus')}
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort('mainDuration')}
                title="Click to sort by Duration"
              >
                Duration {getSortIcon('mainDuration')}
              </th>
              <th>Test Results</th>
              <th 
                className="sortable" 
                onClick={() => handleSort('mainTimestamp')}
                title="Click to sort by Timestamp"
              >
                Timestamp {getSortIcon('mainTimestamp')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No temurin jobs found
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job._id}>
                  <td className="job-name">{job.mainJobName}</td>
                  <td>{job.platform || 'N/A'}</td>
                  <td>{job.architecture || 'N/A'}</td>
                  <td className="build-number">#{job.mainBuildNumber}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(job.mainStatus) }}
                    >
                      {job.mainStatus}
                    </span>
                  </td>
                  <td>{formatDuration(job.mainDuration)}</td>
                  <td className="test-results">
                    {job.testResults && job.testResults.length > 0 ? (
                      <span title={getTestResultsSummary(job.testResults)}>
                        {job.testResults.length} tests
                      </span>
                    ) : (
                      <span className="no-tests">No tests</span>
                    )}
                  </td>
                  <td className="timestamp">{formatDate(job.mainTimestamp)}</td>
                  <td>
                    <a
                      href={job.mainBuildUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="build-link"
                    >
                      View Build
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TemurinJobList;

