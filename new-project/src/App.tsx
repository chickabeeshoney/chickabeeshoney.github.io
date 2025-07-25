import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { VendorManagement } from './pages/VendorManagement';
import { EvaluationPage } from './pages/EvaluationPage';
import { ResultsPage } from './pages/ResultsPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import './App.css';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Router>
      <div className="App">
        <Header user={currentUser} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vendors" element={<VendorManagement />} />
            <Route path="/evaluate/:vendorId" element={<EvaluationPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;