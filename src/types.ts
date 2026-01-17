
export interface PlantAnalysis {
  id: string;
  timestamp: string;
  imageUrl: string;
  plantType: string;
  plantTypeTamil: string;
  healthStatus: 'Healthy' | 'Stressed' | 'Diseased' | 'Unknown';
  description: string;
  descriptionTamil: string;
  confidenceScore: number;
  recommendations: string[];
  recommendationsTamil: string[];
}

export interface User {
  name: string;
  email: string;
  farmName: string;
}

export enum NavigationTab {
  DASHBOARD = 'dashboard',
  ANALYZER = 'analyzer',
  HISTORY = 'history',
  GUIDE = 'guide'
}
