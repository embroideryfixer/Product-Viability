export interface AnalysisResult {
  productName: string;
  marketOverview: string;
  competitionLevel: 'High' | 'Medium' | 'Low';
  competitors: { name: string; url: string; }[];
  averageRevenuePotential: string;
  potentialVendors: { name: string; url: string; }[];
  topInfluencers: { name: string; platform: string; }[];
  bestMatchedProduct: { name: string; description: string; };
  marketSaturation: number;
  interestOverTime: number[];
  finalDecision: 'Recommended' | 'Not Recommended';
  decisionReasoning: string;
  relatedProductIdeas: { name: string; reasoning: string; }[];
}