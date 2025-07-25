import React, { useState, useEffect } from 'react';
import { Vendor, Evaluation, VendorSummary, User, EVALUATION_CRITERIA } from '../types';
import { storageService } from '../services/storage';
import { calculateVendorSummary, calculateCriteriaAverages } from '../utils/calculations';

export function ComparisonPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vendorSummaries, setVendorSummaries] = useState<VendorSummary[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

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

    const evaluators = usersData.filter(u => u.role === 'evaluator');
    const summaries = vendorsData.map(vendor => 
      calculateVendorSummary(vendor, evaluationsData, evaluators)
    );
    
    // Sort by weighted score descending
    summaries.sort((a, b) => b.weightedScore - a.weightedScore);
    setVendorSummaries(summaries);

    // Auto-select top 3 vendors for comparison
    if (summaries.length >= 3) {
      setSelectedVendors(summaries.slice(0, 3).map(s => s.vendor.id));
    } else {
      setSelectedVendors(summaries.map(s => s.vendor.id));
    }
  };

  const handleVendorToggle = (vendorId: string) => {
    setSelectedVendors(prev => {
      if (prev.includes(vendorId)) {
        return prev.filter(id => id !== vendorId);
      } else if (prev.length < 4) { // Limit to 4 vendors for comparison
        return [...prev, vendorId];
      }
      return prev;
    });
  };

  const selectedSummaries = vendorSummaries.filter(s => 
    selectedVendors.includes(s.vendor.id)
  );

  const topRecommendations = vendorSummaries
    .filter(s => s.recommendation === 'strongly-recommend')
    .slice(0, 3);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Vendor Comparison</h1>
          <p style={{ color: '#718096', margin: '8px 0 0 0' }}>
            Compare up to 4 vendors side-by-side
          </p>
        </div>

        {/* Vendor Selection */}
        <div style={selectionSectionStyle}>
          <h3 style={sectionTitleStyle}>Select Vendors to Compare</h3>
          <div style={vendorSelectionGridStyle}>
            {vendorSummaries.map((summary) => (
              <div
                key={summary.vendor.id}
                onClick={() => handleVendorToggle(summary.vendor.id)}
                style={{
                  ...vendorSelectionCardStyle,
                  ...(selectedVendors.includes(summary.vendor.id) ? selectedVendorCardStyle : {})
                }}
              >
                <div style={selectionCheckboxStyle}>
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes(summary.vendor.id)}
                    onChange={() => {}} // Handled by div onClick
                    disabled={!selectedVendors.includes(summary.vendor.id) && selectedVendors.length >= 4}
                  />
                </div>
                <div style={selectionVendorInfoStyle}>
                  <div style={selectionVendorNameStyle}>{summary.vendor.name}</div>
                  <div style={selectionVendorScoreStyle}>
                    {summary.weightedScore.toFixed(0)} / 500
                  </div>
                  <div style={selectionVendorRecommendationStyle(summary.recommendation)}>
                    {getRecommendationLabel(summary.recommendation)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Recommendations Summary */}
      {topRecommendations.length > 0 && (
        <div className="card">
          <h2 style={sectionTitleStyle}>Top 3 Recommendations</h2>
          <div style={topRecommendationsGridStyle}>
            {topRecommendations.map((summary, index) => (
              <div key={summary.vendor.id} style={topRecommendationCardStyle}>
                <div style={topRecommendationRankStyle}>#{index + 1}</div>
                <div style={topRecommendationContentStyle}>
                  <h3 style={topRecommendationNameStyle}>{summary.vendor.name}</h3>
                  <div style={topRecommendationScoreStyle}>
                    {summary.weightedScore.toFixed(0)} / 500
                  </div>
                  <div style={topRecommendationMetaStyle}>
                    <div>✓ {summary.completedEvaluations}/{summary.totalEvaluators} evaluations</div>
                    {summary.dealBreakers.length === 0 && (
                      <div style={noDealBreakersStyle}>✓ No deal breakers</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selectedSummaries.length > 0 && (
        <div className="card">
          <h2 style={sectionTitleStyle}>Side-by-Side Comparison</h2>
          
          <div style={comparisonTableStyle}>
            {/* Header Row */}
            <div style={comparisonHeaderStyle}>
              <div style={comparisonRowHeaderStyle}>Criteria</div>
              {selectedSummaries.map(summary => (
                <div key={summary.vendor.id} style={comparisonVendorHeaderStyle}>
                  <div style={comparisonVendorNameStyle}>{summary.vendor.name}</div>
                  <div style={comparisonVendorScoreStyle}>
                    {summary.weightedScore.toFixed(0)} / 500
                  </div>
                  <div style={comparisonVendorRecommendationStyle(summary.recommendation)}>
                    {getRecommendationLabel(summary.recommendation)}
                  </div>
                </div>
              ))}
            </div>

            {/* Criteria Rows */}
            {EVALUATION_CRITERIA.map(criteria => (
              <div key={criteria.id} style={comparisonRowStyle}>
                <div style={comparisonCriteriaHeaderStyle}>
                  <div style={comparisonCriteriaNameStyle}>{criteria.name}</div>
                  <div style={comparisonCriteriaWeightStyle}>({criteria.weight}%)</div>
                </div>
                {selectedSummaries.map(summary => {
                  const criteriaAverages = calculateCriteriaAverages(summary.evaluations);
                  const avgScore = criteriaAverages[criteria.id] || 0;
                  const weightedScore = avgScore * criteria.weight;
                  
                  return (
                    <div key={summary.vendor.id} style={comparisonCellStyle}>
                      <div style={comparisonScoreStyle}>
                        <div style={comparisonScoreValueStyle}>
                          {avgScore.toFixed(1)} / 5
                        </div>
                        <div style={comparisonScorePointsStyle}>
                          {weightedScore.toFixed(0)} pts
                        </div>
                      </div>
                      <div style={comparisonScoreBarStyle}>
                        <div style={{
                          ...comparisonScoreBarFillStyle,
                          width: `${(avgScore / 5) * 100}%`,
                          backgroundColor: getScoreColor(avgScore)
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Deal Breakers Row */}
            <div style={comparisonRowStyle}>
              <div style={comparisonCriteriaHeaderStyle}>
                <div style={comparisonCriteriaNameStyle}>Deal Breakers</div>
              </div>
              {selectedSummaries.map(summary => (
                <div key={summary.vendor.id} style={comparisonCellStyle}>
                  {summary.dealBreakers.length === 0 ? (
                    <div style={noDealBreakersIndicatorStyle}>✓ None</div>
                  ) : (
                    <div style={dealBreakersIndicatorStyle}>
                      ⚠️ {summary.dealBreakers.length} issues
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Row */}
            <div style={comparisonRowStyle}>
              <div style={comparisonCriteriaHeaderStyle}>
                <div style={comparisonCriteriaNameStyle}>Evaluation Progress</div>
              </div>
              {selectedSummaries.map(summary => (
                <div key={summary.vendor.id} style={comparisonCellStyle}>
                  <div style={progressTextStyle}>
                    {summary.completedEvaluations} / {summary.totalEvaluators}
                  </div>
                  <div style={progressBarContainerStyle}>
                    <div style={{
                      ...progressBarFillStyle,
                      width: `${(summary.completedEvaluations / summary.totalEvaluators) * 100}%`
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Differentiators */}
      {selectedSummaries.length > 0 && (
        <div className="card">
          <h2 style={sectionTitleStyle}>Key Differentiators</h2>
          <div style={differentiatorsGridStyle}>
            {selectedSummaries.map(summary => (
              <div key={summary.vendor.id} style={differentiatorCardStyle}>
                <h3 style={differentiatorVendorNameStyle}>{summary.vendor.name}</h3>
                <p style={differentiatorTextStyle}>
                  {summary.vendor.keyDifferentiators || 'No differentiators specified'}
                </p>
                <div style={differentiatorContactStyle}>
                  <strong>Contact:</strong> {summary.vendor.contactName}<br />
                  <strong>Email:</strong> {summary.vendor.contactEmail}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSummaries.length === 0 && (
        <div className="card">
          <div style={emptyStateStyle}>
            <p>Select vendors above to begin comparison</p>
          </div>
        </div>
      )}
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

function getScoreColor(score: number): string {
  if (score >= 4.5) return '#38a169';
  if (score >= 3.5) return '#ed8936';
  if (score >= 2.5) return '#d69e2e';
  return '#e53e3e';
}

// Styles
const selectionSectionStyle: React.CSSProperties = {
  marginTop: '20px'
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a202c',
  margin: '0 0 16px 0'
};

const vendorSelectionGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: '12px'
};

const vendorSelectionCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const selectedVendorCardStyle: React.CSSProperties = {
  borderColor: '#3182ce',
  backgroundColor: '#ebf8ff'
};

const selectionCheckboxStyle: React.CSSProperties = {
  
};

const selectionVendorInfoStyle: React.CSSProperties = {
  flex: 1
};

const selectionVendorNameStyle: React.CSSProperties = {
  fontWeight: '600',
  color: '#1a202c',
  marginBottom: '4px'
};

const selectionVendorScoreStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#3182ce',
  fontWeight: '500'
};

function selectionVendorRecommendationStyle(recommendation: string): React.CSSProperties {
  const baseStyle = {
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '12px',
    marginTop: '4px',
    display: 'inline-block'
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

const topRecommendationsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '16px'
};

const topRecommendationCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '20px',
  backgroundColor: '#f0fff4',
  border: '1px solid #9ae6b4',
  borderRadius: '8px'
};

const topRecommendationRankStyle: React.CSSProperties = {
  backgroundColor: '#38a169',
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

const topRecommendationContentStyle: React.CSSProperties = {
  flex: 1
};

const topRecommendationNameStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a202c',
  margin: '0 0 4px 0'
};

const topRecommendationScoreStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#38a169',
  marginBottom: '8px'
};

const topRecommendationMetaStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#22543d'
};

const noDealBreakersStyle: React.CSSProperties = {
  color: '#38a169'
};

const comparisonTableStyle: React.CSSProperties = {
  display: 'grid',
  gap: '1px',
  backgroundColor: '#e2e8f0',
  borderRadius: '8px',
  overflow: 'hidden'
};

const comparisonHeaderStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '200px repeat(auto-fit, minmax(150px, 1fr))',
  backgroundColor: '#f7fafc'
};

const comparisonRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '200px repeat(auto-fit, minmax(150px, 1fr))',
  backgroundColor: 'white'
};

const comparisonRowHeaderStyle: React.CSSProperties = {
  padding: '16px',
  fontWeight: '600',
  color: '#1a202c',
  backgroundColor: '#f7fafc'
};

const comparisonVendorHeaderStyle: React.CSSProperties = {
  padding: '16px',
  textAlign: 'center',
  backgroundColor: '#f7fafc'
};

const comparisonVendorNameStyle: React.CSSProperties = {
  fontWeight: '600',
  color: '#1a202c',
  marginBottom: '4px'
};

const comparisonVendorScoreStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#3182ce',
  marginBottom: '4px'
};

function comparisonVendorRecommendationStyle(recommendation: string): React.CSSProperties {
  return selectionVendorRecommendationStyle(recommendation);
}

const comparisonCriteriaHeaderStyle: React.CSSProperties = {
  padding: '16px'
};

const comparisonCriteriaNameStyle: React.CSSProperties = {
  fontWeight: '500',
  color: '#2d3748',
  fontSize: '14px'
};

const comparisonCriteriaWeightStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#718096',
  marginTop: '2px'
};

const comparisonCellStyle: React.CSSProperties = {
  padding: '16px',
  textAlign: 'center'
};

const comparisonScoreStyle: React.CSSProperties = {
  marginBottom: '8px'
};

const comparisonScoreValueStyle: React.CSSProperties = {
  fontWeight: '600',
  color: '#1a202c'
};

const comparisonScorePointsStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#718096',
  marginTop: '2px'
};

const comparisonScoreBarStyle: React.CSSProperties = {
  width: '100%',
  height: '6px',
  backgroundColor: '#e2e8f0',
  borderRadius: '3px',
  overflow: 'hidden'
};

const comparisonScoreBarFillStyle: React.CSSProperties = {
  height: '100%',
  transition: 'width 0.3s ease'
};

const noDealBreakersIndicatorStyle: React.CSSProperties = {
  color: '#38a169',
  fontWeight: '500'
};

const dealBreakersIndicatorStyle: React.CSSProperties = {
  color: '#e53e3e',
  fontWeight: '500'
};

const progressTextStyle: React.CSSProperties = {
  fontWeight: '500',
  color: '#1a202c',
  marginBottom: '4px'
};

const progressBarContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '6px',
  backgroundColor: '#e2e8f0',
  borderRadius: '3px',
  overflow: 'hidden'
};

const progressBarFillStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#3182ce',
  transition: 'width 0.3s ease'
};

const differentiatorsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '16px'
};

const differentiatorCardStyle: React.CSSProperties = {
  padding: '20px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px'
};

const differentiatorVendorNameStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a202c',
  margin: '0 0 12px 0'
};

const differentiatorTextStyle: React.CSSProperties = {
  color: '#4a5568',
  lineHeight: '1.5',
  marginBottom: '16px'
};

const differentiatorContactStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#718096',
  lineHeight: '1.4'
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px',
  color: '#718096'
};