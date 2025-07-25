import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Vendor, Evaluation, VendorSummary, User } from '../types';
import { storageService } from '../services/storage';
import { calculateVendorSummary } from '../utils/calculations';

export function ResultsPage() {
  const [searchParams] = useSearchParams();
  const selectedVendorId = searchParams.get('vendor');
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vendorSummaries, setVendorSummaries] = useState<VendorSummary[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedVendorId) {
      setSelectedVendor(selectedVendorId);
    }
  }, [selectedVendorId]);

  const loadData = () => {
    const vendorsData = storageService.getVendors();
    const evaluationsData = storageService.getEvaluations();
    const usersData = storageService.getUsers();
    
    setVendors(vendorsData);
    setEvaluations(evaluationsData);
    setUsers(usersData);

    const evaluators = usersData.filter(u => u.role === 'evaluator');
    const summaries = vendorsData.map(vendor => 
      calculateVendorSummary(vendor, evaluationsData, evaluators)
    );
    
    // Sort by weighted score descending
    summaries.sort((a, b) => b.weightedScore - a.weightedScore);
    setVendorSummaries(summaries);
  };

  const filteredSummaries = selectedVendor === 'all' 
    ? vendorSummaries 
    : vendorSummaries.filter(s => s.vendor.id === selectedVendor);

  const evaluators = users.filter(u => u.role === 'evaluator');

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Evaluation Results</h1>
          <div style={filterContainerStyle}>
            <label style={filterLabelStyle}>Filter by vendor:</label>
            <select 
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              style={filterSelectStyle}
            >
              <option value="all">All Vendors</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {vendorSummaries.length === 0 ? (
          <div style={emptyStateStyle}>
            <p>No evaluation results available yet.</p>
            <p>Complete vendor evaluations to see results here.</p>
          </div>
        ) : (
          <div style={summaryStatsStyle}>
            <div style={statCardStyle}>
              <div style={statValueStyle}>{vendorSummaries.length}</div>
              <div style={statLabelStyle}>Total Vendors</div>
            </div>
            <div style={statCardStyle}>
              <div style={statValueStyle}>
                {vendorSummaries.filter(s => s.recommendation === 'strongly-recommend').length}
              </div>
              <div style={statLabelStyle}>Strong Recommendations</div>
            </div>
            <div style={statCardStyle}>
              <div style={statValueStyle}>
                {Math.round(evaluations.filter(e => e.isComplete).length / (vendors.length * evaluators.length) * 100)}%
              </div>
              <div style={statLabelStyle}>Overall Progress</div>
            </div>
          </div>
        )}
      </div>

      {/* Results List */}
      {filteredSummaries.map((summary, index) => (
        <div key={summary.vendor.id} className="card">
          <div style={vendorHeaderStyle}>
            <div style={vendorTitleContainerStyle}>
              <div style={rankBadgeStyle}>#{index + 1}</div>
              <div>
                <h2 style={vendorNameStyle}>{summary.vendor.name}</h2>
                <p style={vendorContactStyle}>
                  {summary.vendor.contactName} - {summary.vendor.contactEmail}
                </p>
              </div>
            </div>
            <div style={scoreContainerStyle}>
              <div style={scoreValueStyle}>{summary.weightedScore.toFixed(0)}</div>
              <div style={scoreLabelStyle}>out of 500</div>
              <div style={recommendationBadgeStyle(summary.recommendation)}>
                {getRecommendationLabel(summary.recommendation)}
              </div>
            </div>
          </div>

          {/* Progress and Deal Breakers */}
          <div style={vendorMetaStyle}>
            <div style={progressInfoStyle}>
              <span>Evaluations: {summary.completedEvaluations}/{summary.totalEvaluators}</span>
              <div style={progressBarContainerStyle}>
                <div style={{
                  ...progressBarStyle, 
                  width: `${(summary.completedEvaluations / summary.totalEvaluators) * 100}%`
                }}></div>
              </div>
            </div>
            
            {summary.dealBreakers.length > 0 && (
              <div style={dealBreakersStyle}>
                <strong>⚠️ Deal Breakers:</strong>
                <ul style={dealBreakerListStyle}>
                  {summary.dealBreakers.map((db, i) => (
                    <li key={i}>{db}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Criteria Breakdown */}
          <div style={criteriaBreakdownStyle}>
            <h3 style={breakdownTitleStyle}>Criteria Scores</h3>
            <div style={criteriaGridStyle}>
              {summary.evaluations.length > 0 && summary.evaluations[0].scores.map(score => {
                const criteria = summary.evaluations[0].scores.find(s => s.criteriaId === score.criteriaId);
                if (!criteria) return null;
                
                // Calculate average for this criteria across all evaluations
                const allScores = summary.evaluations.map(e => 
                  e.scores.find(s => s.criteriaId === score.criteriaId)?.score || 0
                );
                const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
                const criteriaData = summary.evaluations[0].scores.find(s => s.criteriaId === score.criteriaId);
                const criteriaInfo = users.length > 0 ? 
                  evaluations[0]?.scores.find(s => s.criteriaId === score.criteriaId) : null;

                return (
                  <div key={score.criteriaId} style={criteriaItemStyle}>
                    <div style={criteriaNameStyle}>
                      {getCriteriaName(score.criteriaId)}
                    </div>
                    <div style={criteriaScoreStyle}>
                      <div style={criteriaScoreValueStyle}>
                        {avgScore.toFixed(1)}/5
                      </div>
                      <div style={criteriaScoreBarStyle}>
                        <div style={{
                          ...criteriaScoreBarFillStyle,
                          width: `${(avgScore / 5) * 100}%`
                        }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Evaluator Scores */}
          {summary.evaluations.length > 0 && (
            <div style={evaluatorScoresStyle}>
              <h3 style={breakdownTitleStyle}>Individual Evaluator Scores</h3>
              <div style={evaluatorGridStyle}>
                {evaluators.map(evaluator => {
                  const evaluation = summary.evaluations.find(e => e.evaluatorId === evaluator.id);
                  const evaluatorScore = evaluation ? 
                    evaluation.scores.reduce((total, score) => {
                      const criteriaWeight = getCriteriaWeight(score.criteriaId);
                      return total + (score.score * criteriaWeight);
                    }, 0) : 0;

                  return (
                    <div key={evaluator.id} style={evaluatorCardStyle}>
                      <div style={evaluatorNameStyle}>
                        {evaluator.name}
                      </div>
                      <div style={evaluatorScoreStyle}>
                        {evaluation ? (
                          <>
                            <div style={evaluatorScoreValueStyle}>
                              {evaluatorScore.toFixed(0)}
                            </div>
                            <div style={evaluatorScoreLabelStyle}>
                              {evaluation.isComplete ? 'Complete' : 'In Progress'}
                            </div>
                          </>
                        ) : (
                          <div style={evaluatorNotStartedStyle}>
                            Not Started
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comments Summary */}
          {summary.evaluations.some(e => e.overallComments) && (
            <div style={commentsStyle}>
              <h3 style={breakdownTitleStyle}>Overall Comments</h3>
              {summary.evaluations.map(evaluation => {
                if (!evaluation.overallComments) return null;
                const evaluator = evaluators.find(e => e.id === evaluation.evaluatorId);
                
                return (
                  <div key={evaluation.id} style={commentStyle}>
                    <div style={commentAuthorStyle}>
                      {evaluator?.name}:
                    </div>
                    <div style={commentTextStyle}>
                      {evaluation.overallComments}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Helper functions
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
    padding: '6px 12px',
    borderRadius: '16px',
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

function getCriteriaName(criteriaId: string): string {
  const criteriaNames: { [key: string]: string } = {
    'prospecting': 'Prospecting Methodology',
    'negotiation': 'Negotiation & Value Defense',
    'delivery': 'Delivery Format & Logistics',
    'support': 'Ongoing Support & Stickiness',
    'pricing': 'Pricing & ROI',
    'saas_experience': 'SaaS Experience & References',
    'cultural_fit': 'Cultural Fit & Philosophy'
  };
  return criteriaNames[criteriaId] || criteriaId;
}

function getCriteriaWeight(criteriaId: string): number {
  const weights: { [key: string]: number } = {
    'prospecting': 25,
    'negotiation': 20,
    'delivery': 20,
    'support': 15,
    'pricing': 10,
    'saas_experience': 5,
    'cultural_fit': 5
  };
  return weights[criteriaId] || 0;
}

// Styles
const filterContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const filterLabelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#4a5568'
};

const filterSelectStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '14px'
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px',
  color: '#718096'
};

const summaryStatsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '16px',
  marginTop: '20px'
};

const statCardStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '16px',
  backgroundColor: '#f7fafc',
  borderRadius: '8px'
};

const statValueStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#3182ce'
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#718096',
  marginTop: '4px'
};

const vendorHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '20px'
};

const vendorTitleContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px'
};

const rankBadgeStyle: React.CSSProperties = {
  backgroundColor: '#3182ce',
  color: 'white',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: '600'
};

const vendorNameStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a202c',
  margin: '0 0 4px 0'
};

const vendorContactStyle: React.CSSProperties = {
  color: '#718096',
  fontSize: '14px',
  margin: 0
};

const scoreContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px'
};

const scoreValueStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: '600',
  color: '#1a202c'
};

const scoreLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#718096'
};

const vendorMetaStyle: React.CSSProperties = {
  marginBottom: '20px'
};

const progressInfoStyle: React.CSSProperties = {
  marginBottom: '12px'
};

const progressBarContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '6px',
  backgroundColor: '#e2e8f0',
  borderRadius: '3px',
  overflow: 'hidden',
  marginTop: '4px'
};

const progressBarStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#3182ce',
  transition: 'width 0.3s ease'
};

const dealBreakersStyle: React.CSSProperties = {
  backgroundColor: '#fed7d7',
  color: '#742a2a',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '14px'
};

const dealBreakerListStyle: React.CSSProperties = {
  margin: '8px 0 0 0',
  paddingLeft: '20px'
};

const criteriaBreakdownStyle: React.CSSProperties = {
  marginBottom: '24px'
};

const breakdownTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a202c',
  margin: '0 0 16px 0'
};

const criteriaGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: '12px'
};

const criteriaItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  backgroundColor: '#f7fafc',
  borderRadius: '6px'
};

const criteriaNameStyle: React.CSSProperties = {
  fontWeight: '500',
  color: '#2d3748'
};

const criteriaScoreStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  minWidth: '120px'
};

const criteriaScoreValueStyle: React.CSSProperties = {
  fontWeight: '600',
  color: '#1a202c',
  minWidth: '40px'
};

const criteriaScoreBarStyle: React.CSSProperties = {
  width: '60px',
  height: '8px',
  backgroundColor: '#e2e8f0',
  borderRadius: '4px',
  overflow: 'hidden'
};

const criteriaScoreBarFillStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#3182ce',
  transition: 'width 0.3s ease'
};

const evaluatorScoresStyle: React.CSSProperties = {
  marginBottom: '24px'
};

const evaluatorGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '12px'
};

const evaluatorCardStyle: React.CSSProperties = {
  padding: '16px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  textAlign: 'center'
};

const evaluatorNameStyle: React.CSSProperties = {
  fontWeight: '500',
  color: '#2d3748',
  marginBottom: '8px'
};

const evaluatorScoreStyle: React.CSSProperties = {
  
};

const evaluatorScoreValueStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#3182ce'
};

const evaluatorScoreLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#718096',
  marginTop: '2px'
};

const evaluatorNotStartedStyle: React.CSSProperties = {
  color: '#ed8936',
  fontSize: '14px'
};

const commentsStyle: React.CSSProperties = {
  
};

const commentStyle: React.CSSProperties = {
  marginBottom: '16px',
  padding: '12px',
  backgroundColor: '#f7fafc',
  borderRadius: '6px'
};

const commentAuthorStyle: React.CSSProperties = {
  fontWeight: '600',
  color: '#2d3748',
  marginBottom: '4px'
};

const commentTextStyle: React.CSSProperties = {
  color: '#4a5568',
  fontSize: '14px',
  lineHeight: '1.5'
};