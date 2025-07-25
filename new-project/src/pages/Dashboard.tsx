import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vendor, Evaluation, VendorSummary, User } from '../types';
import { storageService } from '../services/storage';
import { calculateVendorSummary } from '../utils/calculations';

export function Dashboard() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vendorSummaries, setVendorSummaries] = useState<VendorSummary[]>([]);
  const currentUser = storageService.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const vendorsData = storageService.getVendors();
    const evaluationsData = storageService.getEvaluations();
    const usersData = storageService.getUsers();
    
    setVendors(vendorsData);
    setEvaluations(evaluationsData);
    setUsers(usersData);

    // Calculate summaries
    const summaries = vendorsData.map(vendor => 
      calculateVendorSummary(vendor, evaluationsData, usersData.filter(u => u.role === 'evaluator'))
    );
    setVendorSummaries(summaries);
  };

  const evaluators = users.filter(u => u.role === 'evaluator');
  const totalEvaluations = vendors.length * evaluators.length;
  const completedEvaluations = evaluations.filter(e => e.isComplete).length;
  const progressPercentage = totalEvaluations > 0 ? (completedEvaluations / totalEvaluations) * 100 : 0;

  const myEvaluations = currentUser ? evaluations.filter(e => e.evaluatorId === currentUser.id) : [];
  const myCompletedEvaluations = myEvaluations.filter(e => e.isComplete).length;
  const myProgressPercentage = vendors.length > 0 ? (myCompletedEvaluations / vendors.length) * 100 : 0;

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Sales Training Vendor Evaluation Dashboard</h1>
          <div style={{ fontSize: '14px', color: '#718096' }}>
            Decision needed by early August 2024
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-2 mb-6">
          <div style={statsCardStyle}>
            <h3 style={statsHeaderStyle}>Overall Progress</h3>
            <div style={statsValueStyle}>{completedEvaluations} / {totalEvaluations}</div>
            <div style={progressBarContainerStyle}>
              <div style={{...progressBarStyle, width: `${progressPercentage}%`}}></div>
            </div>
            <div style={statsSubtextStyle}>{progressPercentage.toFixed(0)}% Complete</div>
          </div>

          <div style={statsCardStyle}>
            <h3 style={statsHeaderStyle}>Your Progress</h3>
            <div style={statsValueStyle}>{myCompletedEvaluations} / {vendors.length}</div>
            <div style={progressBarContainerStyle}>
              <div style={{...progressBarStyle, width: `${myProgressPercentage}%`}}></div>
            </div>
            <div style={statsSubtextStyle}>{myProgressPercentage.toFixed(0)}% Complete</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-3 mb-6">
          <div style={quickStatStyle}>
            <div style={quickStatValueStyle}>{vendors.length}</div>
            <div style={quickStatLabelStyle}>Vendors</div>
          </div>
          <div style={quickStatStyle}>
            <div style={quickStatValueStyle}>{evaluators.length}</div>  
            <div style={quickStatLabelStyle}>Evaluators</div>
          </div>
          <div style={quickStatStyle}>
            <div style={quickStatValueStyle}>
              {vendorSummaries.filter(v => v.recommendation === 'strongly-recommend').length}
            </div>
            <div style={quickStatLabelStyle}>Strong Recommendations</div>
          </div>
        </div>
      </div>

      {/* Vendor Status */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Vendor Evaluation Status</h2>
          {currentUser?.role === 'admin' && (
            <Link to="/vendors" className="btn btn-primary">
              Manage Vendors
            </Link>
          )}
        </div>

        {vendors.length === 0 ? (
          <div style={emptyStateStyle}>
            <p>No vendors have been added yet.</p>
            {currentUser?.role === 'admin' && (
              <Link to="/vendors" className="btn btn-primary mt-4">
                Add First Vendor
              </Link>
            )}
          </div>
        ) : (
          <div style={vendorListStyle}>
            {vendorSummaries.map((summary) => {
              const myEvaluation = myEvaluations.find(e => e.vendorId === summary.vendor.id);
              
              return (
                <div key={summary.vendor.id} style={vendorCardStyle}>
                  <div style={vendorHeaderStyle}>
                    <h3 style={vendorNameStyle}>{summary.vendor.name}</h3>
                    <div style={vendorMetaStyle}>
                      <span style={recommendationBadgeStyle(summary.recommendation)}>
                        {getRecommendationLabel(summary.recommendation)}
                      </span>
                    </div>
                  </div>
                  
                  <div style={vendorStatsStyle}>
                    <div style={vendorStatStyle}>
                      <div style={vendorStatValueStyle}>{summary.weightedScore.toFixed(0)}</div>
                      <div style={vendorStatLabelStyle}>Score (out of 500)</div>
                    </div>
                    <div style={vendorStatStyle}>
                      <div style={vendorStatValueStyle}>{summary.completedEvaluations}/{summary.totalEvaluators}</div>
                      <div style={vendorStatLabelStyle}>Evaluations</div>
                    </div>
                  </div>

                  {summary.dealBreakers.length > 0 && (
                    <div style={dealBreakerStyle}>
                      <strong>Deal Breakers:</strong> {summary.dealBreakers.join(', ')}
                    </div>
                  )}

                  <div style={vendorActionsStyle}>
                    {!myEvaluation || !myEvaluation.isComplete ? (
                      <Link 
                        to={`/evaluate/${summary.vendor.id}`}
                        className="btn btn-primary"
                      >
                        {myEvaluation ? 'Continue Evaluation' : 'Start Evaluation'}
                      </Link>
                    ) : (
                      <div style={completedStyle}>
                        ✓ Your evaluation complete
                      </div>
                    )}
                    <Link 
                      to={`/results?vendor=${summary.vendor.id}`}
                      className="btn btn-secondary"
                    >
                      View Results
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="card-title">Quick Actions</h2>
        <div className="grid grid-2">
          <Link to="/results" className="btn btn-secondary" style={{textAlign: 'center'}}>
            View All Results
          </Link>
          <Link to="/comparison" className="btn btn-secondary" style={{textAlign: 'center'}}>
            Compare Vendors
          </Link>
        </div>
      </div>
    </div>
  );
}

function getRecommendationLabel(recommendation: string): string {
  switch (recommendation) {
    case 'strongly-recommend': return 'Strongly Recommend';
    case 'recommend-with-considerations': return 'Recommend with Considerations';
    case 'neutral': return 'Neutral';
    case 'not-recommended': return 'Not Recommended';
    default: return 'Pending';
  }
}

function recommendationBadgeStyle(recommendation: string): React.CSSProperties {
  const baseStyle = {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  };

  switch (recommendation) {
    case 'strongly-recommend':
      return { ...baseStyle, backgroundColor: '#c6f6d5', color: '#22543d' };
    case 'recommend-with-considerations':
      return { ...baseStyle, backgroundColor: '#feebc8', color: '#744210' };
    case 'neutral':
      return { ...baseStyle, backgroundColor: '#fed7d7', color: '#742a2a' };
    case 'not-recommended':
      return { ...baseStyle, backgroundColor: '#fed7d7', color: '#742a2a' };
    default:
      return { ...baseStyle, backgroundColor: '#e2e8f0', color: '#4a5568' };
  }
}

// Styles
const statsCardStyle: React.CSSProperties = {
  padding: '24px',
  backgroundColor: '#f7fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0'
};

const statsHeaderStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#4a5568',
  margin: '0 0 8px 0'
};

const statsValueStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: '600',
  color: '#1a202c',
  margin: '0 0 12px 0'
};

const progressBarContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '8px',
  backgroundColor: '#e2e8f0',
  borderRadius: '4px',
  overflow: 'hidden',
  marginBottom: '8px'
};

const progressBarStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#3182ce',
  transition: 'width 0.3s ease'
};

const statsSubtextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#718096'
};

const quickStatStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '16px'
};

const quickStatValueStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: '600',
  color: '#3182ce',
  margin: '0 0 4px 0'
};

const quickStatLabelStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#718096'
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px',
  color: '#718096'
};

const vendorListStyle: React.CSSProperties = {
  display: 'grid',
  gap: '16px'
};

const vendorCardStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px'
};

const vendorHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px'
};

const vendorNameStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a202c',
  margin: 0
};

const vendorMetaStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px'
};

const vendorStatsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '32px',
  marginBottom: '16px'
};

const vendorStatStyle: React.CSSProperties = {
  textAlign: 'center'
};

const vendorStatValueStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1a202c'
};

const vendorStatLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#718096',
  marginTop: '2px'
};

const dealBreakerStyle: React.CSSProperties = {
  backgroundColor: '#fed7d7',
  color: '#742a2a',
  padding: '8px 12px',
  borderRadius: '6px',
  fontSize: '14px',
  marginBottom: '16px'
};

const vendorActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
};

const completedStyle: React.CSSProperties = {
  color: '#38a169',
  fontWeight: '500',
  fontSize: '14px'
};