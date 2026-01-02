import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import JobList from './components/JobList';
import TemurinJobList from './components/TemurinJobList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<JobList />} />
          <Route path="/temurin" element={<TemurinJobList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

