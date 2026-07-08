export interface SEORecommendation {
  id: string;
  category: 'onPage' | 'technical' | 'content' | 'accessibility' | 'performance' | 'security';
  issue: string;
  problem: string;
  whyItMatters: string;
  seoImpact: 'Critical' | 'High' | 'Medium' | 'Low';
  priority: 'Red' | 'Amber' | 'Yellow' | 'Green';
  stepByStepFix: string[];
  estimatedImprovement: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface DetailedScores {
  overall: number;
  technical: number;
  onPage: number;
  content: number;
  accessibility: number;
  performance: number;
  security: number;
}

export interface KeywordSuggestion {
  keyword: string;
  searchVolume: string;
  difficulty: number; // 0 - 100
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  cpc: string;
  relevance: number; // 0 - 100
}

export interface AIRecommendationResponse {
  scores: DetailedScores;
  recommendations: SEORecommendation[];
  keywords: KeywordSuggestion[];
  seoTitles: string[];
  metaDescriptions: string[];
  h1h2Suggestions: { h1: string[]; h2: string[] };
  faqBlogIdeas: { questionOrTopic: string; type: 'FAQ' | 'Blog'; targetKeywords: string[] }[];
  linkingSuggestions: { anchorText: string; targetKeyword: string; reason: string }[];
}
