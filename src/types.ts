export type PromptCategory =
  | 'Website'
  | 'Web application'
  | 'Android application'
  | 'iOS application'
  | 'Cross-platform mobile application'
  | 'Software / coding'
  | 'API / backend'
  | 'AI application'
  | 'AI agent'
  | 'Image generation'
  | 'Image editing'
  | 'Video generation'
  | 'Video editing'
  | 'UI/UX design'
  | 'Portfolio'
  | 'Landing page'
  | 'SaaS'
  | 'E-commerce'
  | 'Dashboard'
  | 'Data analysis'
  | 'Automation'
  | 'Database'
  | 'Documentation'
  | 'Writing'
  | 'Marketing'
  | 'Social media content'
  | 'Game'
  | 'Other / custom';

export const ALL_PROMPT_CATEGORIES: PromptCategory[] = [
  'Website',
  'Web application',
  'Android application',
  'iOS application',
  'Cross-platform mobile application',
  'Software / coding',
  'API / backend',
  'AI application',
  'AI agent',
  'Image generation',
  'Image editing',
  'Video generation',
  'Video editing',
  'UI/UX design',
  'Portfolio',
  'Landing page',
  'SaaS',
  'E-commerce',
  'Dashboard',
  'Data analysis',
  'Automation',
  'Database',
  'Documentation',
  'Writing',
  'Marketing',
  'Social media content',
  'Game',
  'Other / custom'
];

export type PromptMode = 'Quick' | 'Standard' | 'Professional' | 'Expert' | 'Custom';

export type ThemePreference = 'dark' | 'light' | 'system';

export type RequirementClassification =
  | 'Required'
  | 'Recommended'
  | 'Optional'
  | 'Unknown'
  | 'Potentially conflicting';

export type RequirementOrigin =
  | 'USER REQUIREMENT'
  | 'AI RECOMMENDATION'
  | 'ASSUMPTION';

export interface ExtractedRequirement {
  id: string;
  statement: string;
  classification: RequirementClassification;
  origin: RequirementOrigin;
  rationale: string;
}

export interface ClarificationQuestion {
  id: string;
  category: string;
  question: string;
  whyImportant: string;
  options: string[];
  sensibleDefault: string;
}

export interface IntentAnalysis {
  mainGoal: string;
  secondaryGoals: string[];
  actualIntendedOutcome: string;
  targetUsers: string;
  platform: string;
  expectedOutput: string;
  requiredFunctionality: string[];
  userExperienceExpectations: string[];
  technicalComplexity: 'Low' | 'Moderate' | 'High' | 'Enterprise-Grade';
  externalServicesRequired: string[];
  backendRequirements: string;
  databaseRequirements: string;
  authenticationRequirements: string;
  fileMediaRequirements: string;
  apiRequirements: string;
  deploymentRequirements: string;
}

export interface RecommendedTechnology {
  name: string;
  category: string;
  reason: string;
  licenseNote: string;
}

export interface QualityCheckItem {
  criterion: string;
  passed: boolean;
  notes: string;
}

export interface QualityAudit {
  overallPassed: boolean;
  summary: string;
  autoImprovementsApplied: string[];
  checks: QualityCheckItem[];
}

export interface PromptAnalysisResult {
  title: string;
  detectedCategories: string[];
  primaryEngine: 'Website' | 'Coding' | 'Image' | 'Video' | 'AI_Agent' | 'Writing';
  websiteSubType?: string;
  intentAnalysis: IntentAnalysis;
  extractedRequirements: ExtractedRequirement[];
  missingInformation: string[];
  clarificationQuestions: ClarificationQuestion[];
  needsClarification: boolean;
  assumptions: string[];
  recommendedTechnologies: RecommendedTechnology[];
  qualityAudit: QualityAudit;
  finalPrompt: string;
  structureSections: { heading: string; content: string }[];
}

export interface PromptVersion {
  versionId: string;
  versionNumber: number;
  createdAt: string;
  mode: PromptMode;
  changeNote: string;
  rawInput: string;
  clarificationAnswers?: Record<string, string>;
  usedSensibleDefaults?: boolean;
  analysis: PromptAnalysisResult;
}

export interface SavedPromptRecord {
  id: string;
  userId: string;
  title: string;
  rawInput: string;
  detectedCategories: string[];
  primaryEngine: string;
  currentVersionId: string;
  versions: PromptVersion[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface UserSettings {
  defaultMode: PromptMode;
  autoRunQualityAudit: boolean;
  strictAssumptionSeparation: boolean;
  alwaysEnforceWorkingCodeRule: boolean;
  preferredExportFormat: 'markdown' | 'json' | 'text';
  customSystemRules: string;
  theme: 'dark' | 'light';
  themePreference?: ThemePreference;
}
