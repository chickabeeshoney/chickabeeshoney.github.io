import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vendor, Evaluation, CriteriaScore, EVALUATION_CRITERIA, SCORE_LABELS } from '../types';
import { storageService } from '../services/storage';

export function EvaluationPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [scores, setScores] = useState<CriteriaScore[]>([]);
  const [overallComments, setOverallComments] = useState('');
  const [saving, setSaving] = useState(false);
  
  const currentUser = storageService.getCurrentUser();

  useEffect(() => {
    if (!vendorId || !currentUser) return;

    // Load vendor
    const vendors = storageService.getVendors();
    const foundVendor = vendors.find(v => v.id === vendorId);
    if (!foundVendor) {
      navigate('/');
      return;
    }
    setVendor(foundVendor);

    // Load existing evaluation
    const evaluations = storageService.getEvaluations();
    const existingEvaluation = evaluations.find(
      e => e.vendorId === vendorId && e.evaluatorId === currentUser.id
    );

    if (existingEvaluation) {
      setEvaluation(existingEvaluation);
      setScores(existingEvaluation.scores);
      setOverallComments(existingEvaluation.overallComments || '');
    } else {
      // Initialize with empty scores
      const initialScores: CriteriaScore[] = EVALUATION_CRITERIA.map(criteria => ({
        criteriaId: criteria.id,
        score: 0,
        comments: ''
      }));
      setScores(initialScores);
    }
  }, [vendorId, currentUser, navigate]);

  const updateScore = (criteriaId: string, score: number, comments?: string) => {
    setScores(prev => prev.map(s => 
      s.criteriaId === criteriaId 
        ? { ...s, score, comments: comments ?? s.comments }
        : s
    ));
  };

  const updateComments = (criteriaId: string, comments: string) => {
    setScores(prev => prev.map(s => 
      s.criteriaId === criteriaId 
        ? { ...s, comments }
        : s
    ));
  };

  const calculateWeightedScore = () => {
    return scores.reduce((total, score) => {
      const criteria = EVALUATION_CRITERIA.find(c => c.id === score.criteriaId);
      return total + (score.score * (criteria?.weight || 0));
    }, 0);
  };

  const isComplete = () => {
    return scores.every(s => s.score > 0);
  };

  const handleSave = async (submitForReview = false) => {
    if (!currentUser || !vendor) return;

    setSaving(true);
    
    const now = new Date().toISOString();
    const evaluationData: Evaluation = {
      id: evaluation?.id || `eval_${Date.now()}`,
      vendorId: vendor.id,
      evaluatorId: currentUser.id,
      scores,
      overallComments,
      isComplete: submitForReview && isComplete(),
      submittedAt: submitForReview && isComplete() ? now : evaluation?.submittedAt,
      createdAt: evaluation?.createdAt || now,
      updatedAt: now
    };

    if (evaluation) {
      storageService.updateEvaluation(evaluationData);
    } else {
      storageService.addEvaluation(evaluationData);
    }

    setSaving(false);
    
    if (submitForReview && isComplete()) {
      navigate('/', { state: { message: 'Evaluation submitted successfully!' } });
    }
  };

  if (!vendor) {
    return (
      <div className="card">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading vendor...</p>
        </div>
      </div>
    );
  }

  const weightedScore = calculateWeightedScore();
  const isEvaluationComplete = isComplete();
  const completionPercentage = (scores.filter(s => s.score > 0).length / scores.length) * 100;

  return (
    <div>
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">Evaluating: {vendor.name}</h1>
            <p style={{ color: '#718096', margin: '8px 0 0 0' }}>
              Complete your evaluation using the weighted criteria below
            </p>
          </div>
          <div style={headerStatsStyle}>
            <div style={statStyle}>
              <div style={statValueStyle}>{weightedScore.toFixed(0)}</div>
              <div style={statLabelStyle}>Current Score (out of 500)</div>
            </div>
            <div style={statStyle}>
              <div style={statValueStyle}>{completionPercentage.toFixed(0)}%</div>
              <div style={statLabelStyle}>Complete</div>
            </div>
          </div>
        </div>

        <div style={progressBarContainerStyle}>
          <div style={{...progressBarStyle, width: `${completionPercentage}%`}}></div>
        </div>
      </div>

      {/* Vendor Info */}
      <div className="card">
        <h2 style={sectionTitleStyle}>Vendor Information</h2>
        <div className="grid grid-2">
          <div>
            <p><strong>Contact:</strong> {vendor.contactName}</p>
            <p><strong>Email:</strong> {vendor.contactEmail}</p>
            {vendor.contactPhone && <p><strong>Phone:</strong> {vendor.contactPhone}</p>}
          </div>
          <div>
            <p><strong>Proposal Date:</strong> {new Date(vendor.proposalDate).toLocaleDateString()}</p>
            <p><strong>Documents:</strong> {vendor.documents.length} files</p>
          </div>
        </div>
        
        {vendor.keyDifferentiators && (
          <div style={{marginTop: '16px'}}>
            <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px'}}>Key Differentiators</h3>
            <p style={{color: '#4a5568'}}>{vendor.keyDifferentiators}</p>
          </div>
        )}
      </div>

      {/* Evaluation Criteria */}
      <div className="card">
        <h2 style={sectionTitleStyle}>Evaluation Criteria</h2>
        <div style={criteriaListStyle}>
          {EVALUATION_CRITERIA.map((criteria) => {
            const score = scores.find(s => s.criteriaId === criteria.id);
            
            return (
              <div key={criteria.id} style={criteriaCardStyle}>
                <div style={criteriaHeaderStyle}>
                  <div style={criteriaTitleContainerStyle}>
                    <h3 style={criteriaTitleStyle}>
                      {criteria.name}
                      <span style={criteriaWeightStyle}>({criteria.weight}%)</span>
                    </h3>
                    <p style={criteriaDescriptionStyle}>{criteria.description}</p>
                  </div>
                  <div style={criteriaScoreStyle}>
                    <div style={scoreDisplayStyle}>
                      {score?.score || 0}/5
                    </div>
                    <div style={scorePointsStyle}>
                      {((score?.score || 0) * criteria.weight).toFixed(0)} pts
                    </div>
                  </div>
                </div>

                {/* Examples */}
                <div style={examplesStyle}>
                  <strong>Examples:</strong>
                  <ul style={exampleListStyle}>
                    {criteria.examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>

                {/* Score Buttons */}
                <div style={scoreButtonsContainerStyle}>
                  <div style={scoreButtonsStyle}>
                    {[1, 2, 3, 4, 5].map((scoreValue) => (
                      <button
                        key={scoreValue}
                        onClick={() => updateScore(criteria.id, scoreValue)}
                        style={{
                          ...scoreButtonStyle,
                          ...(score?.score === scoreValue ? activeScoreButtonStyle : {})
                        }}
                      >
                        <div style={scoreButtonValueStyle}>{scoreValue}</div>
                        <div style={scoreButtonLabelStyle}>
                          {SCORE_LABELS[scoreValue as keyof typeof SCORE_LABELS]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div style={commentsContainerStyle}>
                  <label style={commentsLabelStyle}>
                    Comments & Notes (optional)
                  </label>
                  <textarea
                    value={score?.comments || ''}
                    onChange={(e) => updateComments(criteria.id, e.target.value)}
                    placeholder="Add specific observations, strengths, concerns, or questions..."
                    style={commentsTextareaStyle}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Comments */}
      <div className="card">
        <h2 style={sectionTitleStyle}>Overall Comments</h2>
        <textarea
          value={overallComments}
          onChange={(e) => setOverallComments(e.target.value)}
          placeholder="Add any overall thoughts, concerns, or recommendations about this vendor..."
          style={overallCommentsStyle}
        />
      </div>

      {/* Actions */}
      <div className="card">
        <div style={actionsContainerStyle}>
          <div>
            {isEvaluationComplete ? (
              <div style={readyToSubmitStyle}>
                ✓ Evaluation complete - ready to submit
              </div>
            ) : (
              <div style={incompleteStyle}>
                Complete all criteria to submit for review
              </div>
            )}
          </div>
          
          <div style={actionButtonsStyle}>
            <button 
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Back to Dashboard
            </button>
            
            <button 
              onClick={() => handleSave(false)}
              disabled={saving}
              className="btn btn-secondary"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            
            <button 
              onClick={() => handleSave(true)}
              disabled={saving || !isEvaluationComplete}
              className="btn btn-primary"
            >
              {saving ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const headerStatsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '32px'
};

const statStyle: React.CSSProperties = {
  textAlign: 'center'
};

const statValueStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#3182ce'
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#718096',
  marginTop: '2px'
};

const progressBarContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '8px',
  backgroundColor: '#e2e8f0',
  borderRadius: '4px',
  overflow: 'hidden',
  marginTop: '16px'
};

const progressBarStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#3182ce',
  transition: 'width 0.3s ease'
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1a202c',
  margin: '0 0 20px 0'
};

const criteriaListStyle: React.CSSProperties = {
  display: 'grid',
  gap: '24px'
};

const criteriaCardStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '24px',
  backgroundColor: '#fafafa'
};

const criteriaHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px'
};

const criteriaTitleContainerStyle: React.CSSProperties = {
  flex: 1
};

const criteriaTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a202c',
  margin: '0 0 4px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const criteriaWeightStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#3182ce',
  backgroundColor: '#ebf8ff',
  padding: '2px 8px',
  borderRadius: '12px'
};

const criteriaDescriptionStyle: React.CSSProperties = {
  color: '#4a5568',
  fontSize: '14px',
  margin: 0,
  fontStyle: 'italic'
};

const criteriaScoreStyle: React.CSSProperties = {
  textAlign: 'center',
  minWidth: '80px'
};

const scoreDisplayStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a202c'
};

const scorePointsStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#718096',
  marginTop: '2px'
};

const examplesStyle: React.CSSProperties = {
  marginBottom: '20px',
  fontSize: '14px',
  color: '#4a5568'
};

const exampleListStyle: React.CSSProperties = {
  margin: '8px 0 0 0',
  paddingLeft: '20px'
};

const scoreButtonsContainerStyle: React.CSSProperties = {
  marginBottom: '20px'
};

const scoreButtonsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap'
};

const scoreButtonStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '120px',
  padding: '12px 8px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  backgroundColor: 'white',
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'all 0.2s'
};

const activeScoreButtonStyle: React.CSSProperties = {
  borderColor: '#3182ce',
  backgroundColor: '#ebf8ff',
  boxShadow: '0 0 0 2px rgba(49, 130, 206, 0.1)'
};

const scoreButtonValueStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a202c'
};

const scoreButtonLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#718096',
  marginTop: '2px'
};

const commentsContainerStyle: React.CSSProperties = {
  
};

const commentsLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  color: '#2d3748',
  marginBottom: '8px'
};

const commentsTextareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '80px',
  padding: '12px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '14px',
  resize: 'vertical' as const
};

const overallCommentsStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '120px',
  padding: '16px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  resize: 'vertical' as const
};

const actionsContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const readyToSubmitStyle: React.CSSProperties = {
  color: '#38a169',
  fontWeight: '500',
  fontSize: '14px'
};

const incompleteStyle: React.CSSProperties = {
  color: '#ed8936',
  fontSize: '14px'
};

const actionButtonsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px'
};