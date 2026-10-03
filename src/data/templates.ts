export interface StarterTemplate {
  id: string;
  label: string;
  categorySummary: string;
  engine: 'Website' | 'Coding' | 'Image' | 'Video' | 'AI_Agent' | 'Writing';
  rawPrompt: string;
  recommendedMode: 'Quick' | 'Standard' | 'Professional' | 'Expert' | 'Custom';
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'tpl_portfolio',
    label: 'Developer Portfolio Website',
    categorySummary: 'Website · Portfolio · UI/UX design',
    engine: 'Website',
    recommendedMode: 'Professional',
    rawPrompt: 'I want to make a professional developer portfolio website.'
  },
  {
    id: 'tpl_hybrid_ai_img',
    label: 'AI Image Studio Web App (Hybrid)',
    categorySummary: 'Website · AI application · Image generation',
    engine: 'Website',
    recommendedMode: 'Expert',
    rawPrompt: 'Build a website that uses AI to generate images, lets users edit prompts, compare variations side by side, and save their favorite generations to a gallery.'
  },
  {
    id: 'tpl_saas_dashboard',
    label: 'B2B FinOps Analytics SaaS',
    categorySummary: 'SaaS · Dashboard · Web application · Data analysis',
    engine: 'Website',
    recommendedMode: 'Expert',
    rawPrompt: 'Create a B2B cloud cost anomaly dashboard where engineering leads can inspect daily spend by service, filter spikes, configure budget alerts, and export CSV reports.'
  },
  {
    id: 'tpl_coding_api',
    label: 'Idempotent Webhook & Queue Worker',
    categorySummary: 'Software / coding · API / backend · Database',
    engine: 'Coding',
    recommendedMode: 'Expert',
    rawPrompt: 'Write a production TypeScript backend service that ingests Stripe webhooks idempotently, verifies signatures, stores events in PostgreSQL, and retries failed handlers with exponential backoff.'
  },
  {
    id: 'tpl_image_portrait',
    label: 'Editorial Portrait (Face Constraint)',
    categorySummary: 'Image generation · Image editing',
    engine: 'Image',
    recommendedMode: 'Professional',
    rawPrompt: 'Generate an editorial studio portrait of a watchmaker in a dimly lit Geneva workshop examining a brass tourbillon cage. Do not change the person\'s face and do not add modern neon lights.'
  },
  {
    id: 'tpl_video_cinematic',
    label: 'Cinematic Product Reveal Video',
    categorySummary: 'Video generation · Marketing',
    engine: 'Video',
    recommendedMode: 'Professional',
    rawPrompt: 'Create a cinematic 10-second 16:9 video showing an espresso machine pulling a rich crema shot in slow motion with warm morning window light and subtle acoustic room sound.'
  },
  {
    id: 'tpl_ai_agent',
    label: 'Autonomous PR Security Reviewer Agent',
    categorySummary: 'AI agent · Software / coding · Automation',
    engine: 'AI_Agent',
    recommendedMode: 'Expert',
    rawPrompt: 'Design an AI agent that reviews pull request diffs for OWASP vulnerabilities, runs static AST checks via tools, verifies dependency licenses, and posts inline remediation patches.'
  },
  {
    id: 'tpl_mobile_offline',
    label: 'Field Inspection Mobile App',
    categorySummary: 'Cross-platform mobile application · Android application · iOS application',
    engine: 'Coding',
    recommendedMode: 'Professional',
    rawPrompt: 'Build an offline-first mobile app for solar panel field technicians to log inspection checklists, annotate photos, capture GPS coordinates, and sync when connectivity returns.'
  }
];

export const REFINEMENT_PRESETS = [
  { label: 'Make it more professional', instruction: 'Elevate the specification to enterprise production standards with stricter acceptance criteria and clear architectural boundaries.' },
  { label: 'Make it shorter', instruction: 'Condense the final prompt into a high-density, concise specification removing all secondary explanations while preserving 100% of required constraints.' },
  { label: 'Make it more technical', instruction: 'Deepen the technical depth: specify concrete data structures, API request/response contracts, state management patterns, and edge-case handling.' },
  { label: 'Add backend & database', instruction: 'Add complete server-side API endpoints, data persistence schema, input validation, and transactional error handling.' },
  { label: 'Add authentication & RBAC', instruction: 'Integrate real authentication (session/token management, protected routes, password hashing, and role-based access control).' },
  { label: 'Make it mobile-first & accessible', instruction: 'Enforce mobile-first responsive layout rules, >=44px touch targets, WCAG AA contrast, semantic HTML landmarks, and keyboard navigation.' },
  { label: 'Use open-source tools', instruction: 'Recommend and specify actively maintained, lightweight open-source libraries with practical justification and license compatibility checks.' },
  { label: 'Add testing & security', instruction: 'Add comprehensive unit/integration/E2E verification steps, input sanitization, secret protection, and OWASP security requirements.' }
];
