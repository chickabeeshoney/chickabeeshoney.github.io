export interface User {
  id: string;
  name: string;
  role: 'admin' | 'evaluator';
  email: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  proposalDate: string;
  keyDifferentiators: string;
  documents: VendorDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface VendorDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url?: string;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  weight: number;
  description: string;
  examples: string[];
}

export interface CriteriaScore {
  criteriaId: string;
  score: number; // 1-5
  comments?: string;
}

export interface Evaluation {
  id: string;
  vendorId: string;
  evaluatorId: string;
  scores: CriteriaScore[];
  overallComments?: string;
  isComplete: boolean;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorSummary {
  vendor: Vendor;
  evaluations: Evaluation[];
  averageScore: number;
  weightedScore: number;
  recommendation: RecommendationLevel;
  dealBreakers: string[];
  completedEvaluations: number;
  totalEvaluators: number;
}

export type RecommendationLevel = 
  | 'strongly-recommend' 
  | 'recommend-with-considerations' 
  | 'neutral' 
  | 'not-recommended';

export interface Discussion {
  id: string;
  vendorId: string;
  userId: string;
  message: string;
  createdAt: string;
}

export interface Question {
  id: string;
  vendorId: string;
  question: string;
  status: 'pending' | 'answered' | 'follow-up';
  createdBy: string;
  createdAt: string;
  answeredAt?: string;
}

export const EVALUATION_CRITERIA: EvaluationCriteria[] = [
  {
    id: 'prospecting',
    name: 'Prospecting Methodology & Process',
    weight: 25,
    description: 'Multi-channel approach for SDRs, frameworks not scripts',
    examples: [
      'Structured prospecting frameworks',
      'Multi-channel sequencing (email, phone, LinkedIn)',
      'Research methodologies',
      'Personalization techniques'
    ]
  },
  {
    id: 'negotiation',
    name: 'Negotiation & Value Defense Training',
    weight: 20,
    description: 'Defending value during price increases, trade vs negotiate',
    examples: [
      'Value-based selling techniques',
      'Handling price objections',
      'Negotiation frameworks',
      'Deal defense strategies'
    ]
  },
  {
    id: 'delivery',
    name: 'Delivery Format & Logistics',
    weight: 20,
    description: 'Must offer in-person training in Chicago, August timeline',
    examples: [
      'In-person Chicago availability',
      'August 2024 timeline compatibility',
      'Training format options',
      'Logistical coordination'
    ]
  },
  {
    id: 'support',
    name: 'Ongoing Support & Stickiness',
    weight: 15,
    description: 'Long-term reinforcement and skill retention programs',
    examples: [
      'Post-training reinforcement',
      'Ongoing coaching programs',
      'Skill assessment tools',
      'Long-term partnership approach'
    ]
  },
  {
    id: 'pricing',
    name: 'Pricing & ROI',
    weight: 10,
    description: 'Cost effectiveness and return on investment',
    examples: [
      'Total program cost under $60K',
      'ROI measurement tools',
      'Value demonstration',
      'Cost per participant'
    ]
  },
  {
    id: 'saas_experience',
    name: 'SaaS Experience & References',
    weight: 5,
    description: 'Experience with SaaS companies and relevant case studies',
    examples: [
      'SaaS client references',
      'Industry-specific experience',
      'Case study relevance',
      'Success metrics'
    ]
  },
  {
    id: 'cultural_fit',
    name: 'Cultural Fit & Philosophy',
    weight: 5,
    description: 'Alignment with LoadSmart values and approach',
    examples: [
      'Training philosophy alignment',
      'Cultural compatibility',
      'Communication style',
      'Team collaboration approach'
    ]
  }
];

export const SCORE_LABELS = {
  1: 'Poor',
  2: 'Below Average', 
  3: 'Average',
  4: 'Above Average',
  5: 'Great'
};

export const DEAL_BREAKER_RULES = {
  delivery_format_min_score: 3,
  max_pricing_threshold: 60000
};