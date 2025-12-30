import { useState, useEffect } from 'react';
import './JobList.css';

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({
    status: '',
    limit: 50,
  });

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      params.append('limit', filter.limit);
      params.append('sort', '-fetchedAt');

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.data);
      } else {
        setError(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/jobs/stats/summary');
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
      const response = await fetch('/api/jobs/fetch', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        alert(`Fetch completed: ${data.result.fetched} new, ${data.result.skipped} existing`);
        fetchJobs();
        fetchStats();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="job-list-container">
        <div className="loading">Loading build data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-list-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="job-list-container">
      <div className="header">
        <h1>OpenJDK Pipeline Builds</h1>
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
            <div className="stat-label">Total Builds</div>
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
        </select>
        <select
          value={filter.limit}
          onChange={(e) => setFilter({ ...filter, limit: parseInt(e.target.value) })}
          className="filter-select"
        >
          <option value="25">25 builds</option>
          <option value="50">50 builds</option>
          <option value="100">100 builds</option>
        </select>
      </div>

      <div className="jobs-table">
        <table>
          <thead>
            <tr>
              <th>Build #</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Timestamp</th>
              <th>Fetched At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No builds found
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job._id}>
                  <td className="build-number">#{job.buildNumber}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(job.status) }}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td>{formatDuration(job.duration)}</td>
                  <td className="timestamp">{formatDate(job.timestamp)}</td>
                  <td className="timestamp">{formatDate(job.fetchedAt)}</td>
                  <td>
                    <a
                      href={job.buildUrl}
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

export default JobList;

