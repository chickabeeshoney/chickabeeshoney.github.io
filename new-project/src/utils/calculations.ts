import { Vendor, Evaluation, User, VendorSummary, RecommendationLevel, EVALUATION_CRITERIA, DEAL_BREAKER_RULES } from '../types';

export function calculateVendorSummary(
  vendor: Vendor, 
  allEvaluations: Evaluation[], 
  evaluators: User[]
): VendorSummary {
  const vendorEvaluations = allEvaluations.filter(e => e.vendorId === vendor.id && e.isComplete);
  const completedEvaluations = vendorEvaluations.length;
  const totalEvaluators = evaluators.length;

  // Calculate weighted score
  let totalWeightedScore = 0;
  let totalEvaluators_withScores = 0;

  if (vendorEvaluations.length > 0) {
    vendorEvaluations.forEach(evaluation => {
      let evaluationWeightedScore = 0;
      
      evaluation.scores.forEach(score => {
        const criteria = EVALUATION_CRITERIA.find(c => c.id === score.criteriaId);
        if (criteria) {
          evaluationWeightedScore += (score.score * criteria.weight);
        }
      });
      
      totalWeightedScore += evaluationWeightedScore;
      totalEvaluators_withScores++;
    });
  }

  const averageScore = totalEvaluators_withScores > 0 ? totalWeightedScore / totalEvaluators_withScores : 0;
  const weightedScore = averageScore;

  // Determine recommendation level
  const recommendation = getRecommendationLevel(weightedScore);

  // Check for deal breakers
  const dealBreakers = checkDealBreakers(vendorEvaluations, vendor);

  return {
    vendor,
    evaluations: vendorEvaluations,
    averageScore: averageScore / 5, // Convert to 1-5 scale for display
    weightedScore,
    recommendation,
    dealBreakers,
    completedEvaluations,
    totalEvaluators
  };
}

function getRecommendationLevel(weightedScore: number): RecommendationLevel {
  if (weightedScore >= 400) return 'strongly-recommend';
  if (weightedScore >= 350) return 'recommend-with-considerations';
  if (weightedScore >= 300) return 'neutral';
  return 'not-recommended';
}

function checkDealBreakers(evaluations: Evaluation[], vendor: Vendor): string[] {
  const dealBreakers: string[] = [];

  if (evaluations.length === 0) return dealBreakers;

  // Check delivery format scores (must be 3 or above)
  const deliveryScores = evaluations.map(e => 
    e.scores.find(s => s.criteriaId === 'delivery')?.score || 0
  );
  
  const avgDeliveryScore = deliveryScores.reduce((a, b) => a + b, 0) / deliveryScores.length;
  
  if (avgDeliveryScore < DEAL_BREAKER_RULES.delivery_format_min_score) {
    dealBreakers.push('Below minimum delivery format requirements (Chicago in-person)');
  }

  // Check pricing threshold (assuming we store pricing info in vendor details)
  // This would need to be implemented based on how pricing is stored
  
  // Check for any individual scores of 1 or 2 (red flags)
  const hasRedFlags = evaluations.some(evaluation =>
    evaluation.scores.some(score => score.score <= 2)
  );
  
  if (hasRedFlags) {
    dealBreakers.push('Critical weaknesses identified (scores of 1-2)');
  }

  return dealBreakers;
}

export function calculateCriteriaAverages(evaluations: Evaluation[]) {
  const criteriaAverages: { [criteriaId: string]: number } = {};
  
  EVALUATION_CRITERIA.forEach(criteria => {
    const scores = evaluations
      .map(e => e.scores.find(s => s.criteriaId === criteria.id)?.score)
      .filter(score => score !== undefined) as number[];
    
    if (scores.length > 0) {
      criteriaAverages[criteria.id] = scores.reduce((a, b) => a + b, 0) / scores.length;
    } else {
      criteriaAverages[criteria.id] = 0;
    }
  });
  
  return criteriaAverages;
}

export function getScoreColor(score: number): string {
  if (score >= 4.5) return '#38a169'; // Green
  if (score >= 3.5) return '#ed8936'; // Orange
  if (score >= 2.5) return '#d69e2e'; // Yellow
  return '#e53e3e'; // Red
}

export function getRecommendationColor(recommendation: RecommendationLevel): string {
  switch (recommendation) {
    case 'strongly-recommend': return '#38a169';
    case 'recommend-with-considerations': return '#ed8936';
    case 'neutral': return '#d69e2e';
    case 'not-recommended': return '#e53e3e';
    default: return '#718096';
  }
}

export function generateVendorReport(summary: VendorSummary): string {
  const { vendor, evaluations, weightedScore, recommendation, dealBreakers } = summary;
  
  let report = `# ${vendor.name} - Evaluation Report\n\n`;
  report += `**Overall Score:** ${weightedScore.toFixed(0)}/500\n`;
  report += `**Recommendation:** ${getRecommendationLabel(recommendation)}\n`;
  report += `**Evaluations Completed:** ${evaluations.length}\n\n`;
  
  if (dealBreakers.length > 0) {
    report += `## ⚠️ Deal Breakers\n`;
    dealBreakers.forEach(db => report += `- ${db}\n`);
    report += '\n';
  }
  
  report += `## Criteria Breakdown\n`;
  const criteriaAverages = calculateCriteriaAverages(evaluations);
  
  EVALUATION_CRITERIA.forEach(criteria => {
    const avg = criteriaAverages[criteria.id];
    const weightedScore = avg * criteria.weight;
    report += `- **${criteria.name}** (${criteria.weight}%): ${avg.toFixed(1)}/5 (${weightedScore.toFixed(0)} points)\n`;
  });
  
  report += `\n## Key Differentiators\n${vendor.keyDifferentiators}\n`;
  
  return report;
}

function getRecommendationLabel(recommendation: RecommendationLevel): string {
  switch (recommendation) {
    case 'strongly-recommend': return 'Strongly Recommend';
    case 'recommend-with-considerations': return 'Recommend with Considerations';
    case 'neutral': return 'Neutral - Further Evaluation Needed';
    case 'not-recommended': return 'Not Recommended';
    default: return 'Pending';
  }
}