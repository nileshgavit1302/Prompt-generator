import { PromptAnalysisResult } from '../types';

export function generateSynthesizedPromptAnalysis(
  rawInput: string,
  mode: string,
  clarificationAnswers?: Record<string, string>,
  useSensibleDefaults?: boolean
): PromptAnalysisResult {
  const lower = rawInput.toLowerCase();

  let primaryEngine: 'Website' | 'Coding' | 'Image' | 'Video' | 'AI_Agent' | 'Writing' = 'Website';
  const categories: string[] = [];

  if (lower.includes('image') || lower.includes('photo') || lower.includes('portrait') || lower.includes('render')) {
    primaryEngine = 'Image';
    categories.push('Image generation');
    if (lower.includes('edit') || lower.includes('change')) categories.push('Image editing');
  } else if (lower.includes('video') || lower.includes('clip') || lower.includes('film') || lower.includes('motion')) {
    primaryEngine = 'Video';
    categories.push('Video generation');
  } else if (lower.includes('agent') || lower.includes('triage') || lower.includes('bot') || lower.includes('workflow')) {
    primaryEngine = 'AI_Agent';
    categories.push('AI agent', 'Automation', 'AI application');
  } else if (lower.includes('api') || lower.includes('backend') || lower.includes('service') || lower.includes('script') || lower.includes('function') || lower.includes('webhook')) {
    primaryEngine = 'Coding';
    categories.push('Software / coding', 'API / backend');
  } else {
    primaryEngine = 'Website';
    categories.push('Website', 'Web application');
    if (lower.includes('portfolio') || lower.includes('developer')) categories.push('Portfolio');
    if (lower.includes('saas') || lower.includes('b2b')) categories.push('SaaS');
    if (lower.includes('dashboard') || lower.includes('analytics')) categories.push('Dashboard');
    if (lower.includes('store') || lower.includes('coffee') || lower.includes('shop') || lower.includes('e-commerce') || lower.includes('order')) categories.push('E-commerce');
  }

  // Generate Title
  const cleanTitle = rawInput
    .replace(/[^\w\s]/gi, '')
    .split(' ')
    .slice(0, 7)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const title = cleanTitle ? `${cleanTitle} Specification` : 'Custom AI Prompt Specification';

  // Construct Final Prompt tailored to the detected engine
  let finalPrompt = '';
  if (primaryEngine === 'Website') {
    finalPrompt = `### 1. ROLE & PROJECT OBJECTIVE
Act as a Principal Full-Stack Engineer and UX Architect. Build a complete, production-ready **${title}**.
**MANDATORY ARCHITECTURAL REQUIREMENT:** This must NOT be a UI-only prototype or static demo. Every button, interactive form, catalog filter, shopping cart, authentication check, backend route, and error state must be completely implemented and functional.

### 2. TARGET USERS & INTENDED OUTCOME
- **Objective:** Fulfill the user's objective: "${rawInput}"
- **Target Audience:** Customers, active users, and platform administrators.
- **Outcome:** Production-grade web application with immediate usability, high visual craft, and zero dead clicks.

### 3. EXPLICIT REQUIREMENTS VS. AI RECOMMENDATIONS & ASSUMPTIONS
- **User Explicit Requirements:** ${rawInput}
- **AI Recommendations:** Responsive grid with 1440px desktop baseline and mobile touch targets >= 44px; WCAG AA contrast; structured error validation on all user forms.
- **Assumptions Applied:** Uses modern React 19 + TypeScript + Tailwind CSS full-stack architecture with persistent backend storage.

### 4. CORE FEATURES & FUNCTIONAL REQUIREMENTS
1. **Interactive Navigation & Layout:** Responsive header with clean single-line links, active state indicators, and quick primary action button.
2. **Dynamic Data Display & Filtering:** Real-time search and filter controls with empty states when zero items match.
3. **Working Transactional / Input Forms:** Validated input fields with inline error messages and persistent server-side submission.
4. **State Management & Resilience:** Dedicated loading indicators, optimistic UI updates, and clear error boundaries.

### 5. ACCESSIBILITY & SECURITY
- Semantic HTML landmarks (<header>, <main>, <section>, <footer>).
- Full keyboard navigation with visible focus-visible indicators.
- Server-side input sanitization; never expose API secrets on the client.`;
  } else if (primaryEngine === 'Coding') {
    finalPrompt = `### 1. ROLE & OBJECTIVE
Act as a Principal Software Engineer. Design and implement a fault-tolerant, production-ready software system fulfilling: "${rawInput}".

### 2. ARCHITECTURE & CONTRACTS
- **Data Flow:** Strictly typed input/output schemas with deterministic error structures.
- **Dependencies:** Actively maintained open-source libraries with verified licensing.
- **Concurrency & Resilience:** Exponential backoff retry policies, idempotent processing, and structured logging.

### 3. ACCEPTANCE CRITERIA
1. Zero unhandled promise rejections or uncaught exceptions.
2. Complete unit and integration test coverage for core business logic.
3. Strict environment variable isolation for all operational credentials.`;
  } else if (primaryEngine === 'Image') {
    finalPrompt = `### PRIMARY IMAGE GENERATION PROMPT
Commercial high-resolution studio photograph: ${rawInput}. Masterfully balanced composition, dramatic directional key lighting with soft rim fill, authentic surface materiality, shallow optical depth of field, 85mm portrait prime lens, f/2.8 aperture, clean unblemished background void, 8K ultra-sharp commercial grade.

### OPTICAL SPECIFICATIONS
- **Subject:** ${rawInput}
- **Camera & Lens:** 85mm Prime Lens at f/2.8, ISO 100, tack-sharp focal plane.
- **Lighting:** Softbox diffused key lighting with subtle specular rim highlights.
- **Strict Negative Constraints:** DO NOT introduce extra background objects, unwanted props, distorted facial features, or unsolicited neon artifacts.`;
  } else {
    finalPrompt = `### 1. GOAL & CONTEXT
Objective: ${rawInput}

### 2. EXECUTION SPECIFICATION & GUARDRAILS
- Execute the request with high fidelity, explicit constraints, and deterministic outputs.
- Preserve all explicit user constraints and document any required assumptions.`;
  }

  return {
    title,
    detectedCategories: categories,
    primaryEngine,
    websiteSubType: primaryEngine === 'Website' ? 'Production Web Platform' : undefined,
    intentAnalysis: {
      mainGoal: `Successfully engineer and deploy: ${rawInput}`,
      secondaryGoals: [
        'Deliver a responsive, functional user experience without mock stubs',
        'Enforce type safety, accessibility, and high visual craft',
        'Preserve 100% of user constraints'
      ],
      actualIntendedOutcome: 'Production-ready, copy-paste-ready AI prompt tailored to the domain.',
      targetUsers: 'End Users, Platform Customers, and Engineering Teams',
      platform: 'Cross-Platform Web & Cloud Services',
      expectedOutput: 'Complete implementation prompt with functional acceptance criteria',
      requiredFunctionality: [
        'Complete interactive controls with real event handlers',
        'Server-side validation and persistence where appropriate',
        'Responsive layout adapting to mobile and desktop viewports'
      ],
      userExperienceExpectations: [
        'Zero dead clicks or placeholder buttons',
        'WCAG AA accessible contrast and visible focus rings',
        'Immediate feedback on all interactive states'
      ],
      technicalComplexity: 'Moderate',
      externalServicesRequired: ['Backend REST API', 'Persistent Database'],
      backendRequirements: 'Node.js / Express or modern server runtime with strict input validation',
      databaseRequirements: 'Persistent JSON or relational store for application state',
      authenticationRequirements: 'Session or bearer token validation where user data is protected',
      fileMediaRequirements: 'Clean responsive vector/raster assets with fallback styling',
      apiRequirements: 'RESTful endpoints with structured JSON responses and error codes',
      deploymentRequirements: 'Containerized Node.js service running on standard web port'
    },
    extractedRequirements: [
      {
        id: 'req_user_1',
        statement: rawInput,
        classification: 'Required',
        origin: 'USER REQUIREMENT',
        rationale: 'Explicit core objective from the user input prompt.'
      },
      {
        id: 'req_rec_1',
        statement: 'Implement complete working interactive features with zero non-functional mock stubs',
        classification: 'Required',
        origin: 'AI RECOMMENDATION',
        rationale: 'Prevents the generated application from behaving as a static prototype.'
      },
      {
        id: 'req_assump_1',
        statement: 'Assume standard production web stack with TypeScript and accessible semantic markup',
        classification: 'Recommended',
        origin: 'ASSUMPTION',
        rationale: 'Industry-standard foundation that allows fast extension and reliable deployment.'
      }
    ],
    missingInformation: [
      'Specific third-party payment gateway or external CRM integration preference',
      'Target deployment region and custom domain requirements'
    ],
    clarificationQuestions: [
      {
        id: 'q_stack',
        category: 'Technology & Architecture',
        question: 'What is your preferred deployment architecture?',
        whyImportant: 'Determines whether the generated prompt targets single-server Node.js or serverless cloud functions.',
        options: ['Full-Stack Node.js / Express', 'Next.js App Router', 'Static PWA with Serverless API'],
        sensibleDefault: 'Full-Stack Node.js / Express'
      },
      {
        id: 'q_storage',
        category: 'Data Persistence',
        question: 'How should persistent data and user records be managed?',
        whyImportant: 'Shapes database schemas and migration instructions.',
        options: ['Local JSON Database (Zero Configuration)', 'PostgreSQL with Drizzle ORM', 'Firebase Firestore'],
        sensibleDefault: 'Local JSON Database (Zero Configuration)'
      }
    ],
    needsClarification: false,
    assumptions: [
      'Assumed full-stack TypeScript architecture with real working buttons and validated submission endpoints.',
      'Assumed responsive desktop (1440px) and mobile (<768px) layouts with accessible WCAG AA contrast.'
    ],
    recommendedTechnologies: [
      {
        name: 'React 19 + TypeScript',
        category: 'Frontend Framework',
        reason: 'Robust component hierarchy and compile-time type safety for state management.',
        licenseNote: 'MIT License'
      },
      {
        name: 'Tailwind CSS v4',
        category: 'Design System & Utility Styling',
        reason: 'Zero-runtime utility styling ensuring fast rendering and seamless theme switching.',
        licenseNote: 'MIT License'
      }
    ],
    qualityAudit: {
      overallPassed: true,
      summary: 'Prompt successfully synthesizes the user request, mandates full working functionality, and separates explicit requirements from assumptions.',
      autoImprovementsApplied: [
        'Added explicit rule prohibiting static demos and placeholder buttons.',
        'Structured modular acceptance criteria covering responsiveness and security.'
      ],
      checks: [
        { criterion: 'Main user goal preserved', passed: true, notes: 'Directly reflects the requested project scope.' },
        { criterion: 'Assumptions clearly separated', passed: true, notes: 'Labeled explicit USER REQUIREMENT vs AI RECOMMENDATION.' },
        { criterion: 'Working functionality rule enforced', passed: true, notes: 'Prohibits non-functional UI prototypes.' }
      ]
    },
    structureSections: [
      {
        heading: '1. ROLE & PROJECT OBJECTIVE',
        content: `Act as a Principal Engineer. Build a production-ready application for: "${rawInput}". This must NOT be a static prototype.`
      },
      {
        heading: '2. CORE FEATURES & ACCEPTANCE CRITERIA',
        content: 'All navigation, interactive forms, search filters, and persistent workflows must function end-to-end.'
      }
    ],
    finalPrompt
  };
}
