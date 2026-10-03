import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Persistent File-Backed JSON Database
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'promptforge-db.json');

interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
  settings: {
    defaultMode: string;
    autoRunQualityAudit: boolean;
    strictAssumptionSeparation: boolean;
    alwaysEnforceWorkingCodeRule: boolean;
    preferredExportFormat: 'markdown' | 'json' | 'text';
    customSystemRules: string;
    theme: 'dark' | 'light';
    themePreference?: 'dark' | 'light' | 'system';
  };
}

interface SessionToken {
  token: string;
  userId: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: UserAccount[];
  sessions: SessionToken[];
  prompts: any[];
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_promptforge_salt').digest('hex');
}

function getInitialSeedPrompts(userId: string): any[] {
  const v1Id = 'ver_seed_portfolio_1';
  const v2Id = 'ver_seed_image_1';
  const v3Id = 'ver_seed_agent_1';

  return [
    {
      id: 'prf_seed_portfolio_01',
      userId,
      title: 'Full-Stack Principal Engineer Portfolio & Case Study Platform',
      rawInput: 'I want to make a professional developer portfolio website.',
      detectedCategories: ['Website', 'Portfolio', 'UI/UX design', 'Web application'],
      primaryEngine: 'Website',
      currentVersionId: v1Id,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      isPinned: true,
      versions: [
        {
          versionId: v1Id,
          versionNumber: 1,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          mode: 'Professional',
          changeNote: 'Initial analysis & full-stack portfolio specification with sensible defaults',
          rawInput: 'I want to make a professional developer portfolio website.',
          usedSensibleDefaults: true,
          analysis: {
            title: 'Full-Stack Principal Engineer Portfolio & Case Study Platform',
            detectedCategories: ['Website', 'Portfolio', 'UI/UX design', 'Web application'],
            primaryEngine: 'Website',
            websiteSubType: 'Portfolio & Interactive Engineering Showcase',
            intentAnalysis: {
              mainGoal: 'Build a credible, high-converting engineering portfolio website that demonstrates real architectural capability, interactive case studies, and direct contact workflow.',
              secondaryGoals: [
                'Showcase production code repositories, live deployments, and measurable engineering metrics',
                'Provide recruiters and hiring managers with fast filtering by tech stack and domain',
                'Enable direct message submission and resume download without broken links'
              ],
              actualIntendedOutcome: 'Win senior/staff engineering interviews or high-value technical consulting contracts through verifiable technical proof.',
              targetUsers: 'Engineering VPs, Technical Recruiters, CTOs, and Potential Consulting Clients',
              platform: 'Responsive Web Application (Desktop 1440px baseline + Mobile-first touch support)',
              expectedOutput: 'Complete, deployable React + TypeScript + Tailwind CSS full-stack web application',
              requiredFunctionality: [
                'Interactive project filtering by technology, architecture, and year',
                'Deep-dive technical case study modal/drawer with system architecture notes and trade-offs',
                'Working contact inquiry form with server-side validation and persistent message storage',
                'Searchable engineering writing / technical notes section',
                'Downloadable structured CV / resume view'
              ],
              userExperienceExpectations: [
                'Editorial typography with zero visual clutter and fast keyboard navigation',
                'Immediate scannability of core stack, years of experience, and impact metrics',
                'WCAG AA contrast compliance and reduced-motion support'
              ],
              technicalComplexity: 'Moderate',
              externalServicesRequired: ['Optional GitHub API or structured local project registry', 'Transactional contact endpoint'],
              backendRequirements: 'Node.js / Express API endpoint for contact submissions and dynamic project metrics',
              databaseRequirements: 'Persistent storage for contact inquiries and case study analytics',
              authenticationRequirements: 'Public read access; protected admin view if managing inquiries in-app',
              fileMediaRequirements: 'High-contrast system architecture diagrams and responsive project preview screenshots',
              apiRequirements: 'REST endpoints for /api/projects and /api/contact with strict input validation',
              deploymentRequirements: 'Production build bundling frontend assets with Node.js server on port 3000'
            },
            extractedRequirements: [
              {
                id: 'req_1',
                statement: 'Build a professional developer portfolio website',
                classification: 'Required',
                origin: 'USER REQUIREMENT',
                rationale: 'Explicitly stated core objective in the user prompt.'
              },
              {
                id: 'req_2',
                statement: 'Include interactive project case studies with problem, architecture, and measurable outcome sections',
                classification: 'Recommended',
                origin: 'AI RECOMMENDATION',
                rationale: 'Hiring managers evaluate senior developers on architectural trade-offs and measurable outcomes rather than screenshots alone.'
              },
              {
                id: 'req_3',
                statement: 'Implement a working contact form with server-side validation and submission persistence',
                classification: 'Recommended',
                origin: 'AI RECOMMENDATION',
                rationale: 'Ensures the portfolio is a functional lead-capture application rather than a static mockup.'
              },
              {
                id: 'req_4',
                statement: 'Assume target persona is a Full-Stack Software Engineer showcasing 4-6 flagship projects',
                classification: 'Optional',
                origin: 'ASSUMPTION',
                rationale: 'User did not specify specialization; a balanced full-stack structure is adaptable.'
              }
            ],
            missingInformation: [
              'Specific engineering specialization (e.g., Frontend, Distributed Systems, AI/ML, Mobile)',
              'Whether a CMS/admin dashboard is needed to edit projects dynamically',
              'Preferred visual theme (Dark technical workspace vs. Light editorial broadsheet)'
            ],
            clarificationQuestions: [
              {
                id: 'q_spec',
                category: 'Domain & Persona',
                question: 'What is the primary engineering specialization to highlight?',
                whyImportant: 'Determines whether project cards emphasize UI fidelity, system throughput metrics, or model evaluation benchmarks.',
                options: ['Full-Stack Web Engineering', 'Frontend & Design Systems', 'Backend & Distributed Systems', 'AI / ML Engineering'],
                sensibleDefault: 'Full-Stack Web Engineering'
              },
              {
                id: 'q_contact',
                category: 'Backend & Persistence',
                question: 'How should visitor contact inquiries be handled?',
                whyImportant: 'Dictates backend route implementation and storage schema.',
                options: ['Full backend form with persistent inbox viewer', 'Backend form API with JSON storage', 'Direct mailto & social links only'],
                sensibleDefault: 'Full backend form with persistent inbox viewer'
              },
              {
                id: 'q_theme',
                category: 'UI/UX Direction',
                question: 'Which visual aesthetic best fits your personal brand?',
                whyImportant: 'Shapes typography pairings, surface contrast, and layout rhythm.',
                options: ['High-craft dark technical studio', 'Clean Swiss editorial light mode', 'Adaptive dark/light toggle'],
                sensibleDefault: 'Adaptive dark/light toggle'
              }
            ],
            needsClarification: false,
            assumptions: [
              'Assumed the developer wants a self-contained React + TypeScript + Tailwind CSS application with an Express backend for contact submissions.',
              'Assumed projects should support live filtering by technology tag and search query.',
              'Assumed contact messages are persisted to the backend database and viewable in an inbox drawer.'
            ],
            recommendedTechnologies: [
              {
                name: 'React 19 + TypeScript',
                category: 'Frontend Framework',
                reason: 'Type-safe component architecture for interactive project filtering, modals, and state management.',
                licenseNote: 'MIT License'
              },
              {
                name: 'Tailwind CSS v4',
                category: 'Styling & Design System',
                reason: 'Zero-runtime utility styling for responsive grid layouts, dark/light theme tokens, and accessible focus states.',
                licenseNote: 'MIT License'
              },
              {
                name: 'Express',
                category: 'Backend API',
                reason: 'Handles contact form validation, rate limiting, and persistent storage of inquiries.',
                licenseNote: 'MIT License'
              }
            ],
            qualityAudit: {
              overallPassed: true,
              summary: 'Prompt preserves the core portfolio objective, separates explicit user requests from architectural assumptions, and enforces real working interactive features.',
              autoImprovementsApplied: [
                'Added explicit mandatory rule prohibiting non-functional placeholder buttons or dead links.',
                'Added structured Acceptance Criteria covering mobile responsiveness, keyboard accessibility, and form validation.'
              ],
              checks: [
                { criterion: 'Main goal preserved', passed: true, notes: 'Directly targets a professional developer portfolio.' },
                { criterion: 'Assumptions separated from user requirements', passed: true, notes: 'Explicitly labeled USER REQUIREMENT vs AI RECOMMENDATION vs ASSUMPTION.' },
                { criterion: 'Website functionality rule enforced', passed: true, notes: 'Includes strict mandate that every filter, modal, and form works end-to-end.' }
              ]
            },
            structureSections: [
              {
                heading: '1. ROLE & PROJECT OBJECTIVE',
                content: 'Act as a Principal Full-Stack Engineer and Design Systems Architect. Build a complete, production-ready Developer Portfolio & Interactive Case Study Web Application. This must NOT be a UI-only prototype or static demo. Every interactive feature—including category filtering, live search, case-study deep-dive drawers, theme switching, resume export, and the backend contact submission workflow—must actually work.'
              }
            ],
            finalPrompt: `### 1. ROLE\nAct as a Principal Full-Stack Software Engineer and Design Systems Architect.\n\n### 2. PROJECT OBJECTIVE\nBuild a complete, production-ready **Developer Portfolio & Technical Case Study Web Application**.\n**CRITICAL REQUIREMENT:** This must NOT be a UI-only prototype or static demo. Every interactive feature must actually work end-to-end.`
          }
        }
      ]
    },
    {
      id: 'prf_seed_image_02',
      userId,
      title: 'Photorealistic Watch Studio Commercial Photography Prompt',
      rawInput: 'Create an image prompt for a luxury mechanical chronograph watch on dark stone, keep the dial sharp and do not add random props.',
      detectedCategories: ['Image generation', 'Marketing', 'E-commerce'],
      primaryEngine: 'Image',
      currentVersionId: v2Id,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      isPinned: false,
      versions: [
        {
          versionId: v2Id,
          versionNumber: 1,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          mode: 'Expert',
          changeNote: 'Initial optical & lighting specification for commercial horology photography',
          rawInput: 'Create an image prompt for a luxury mechanical chronograph watch on dark stone, keep the dial sharp and do not add random props.',
          usedSensibleDefaults: true,
          analysis: {
            title: 'Photorealistic Watch Studio Commercial Photography Prompt',
            detectedCategories: ['Image generation', 'Marketing', 'E-commerce'],
            primaryEngine: 'Image',
            intentAnalysis: {
              mainGoal: 'Generate a commercial-grade studio macro photograph of a luxury mechanical chronograph resting on a dark natural stone surface.',
              secondaryGoals: [
                'Ensure tack-sharp optical focus across the watch dial, hands, and tachymeter bezel',
                'Strictly exclude extraneous props, clutter, or distracting background objects'
              ],
              actualIntendedOutcome: 'Hero product visual suitable for a luxury horology campaign or e-commerce showcase.',
              targetUsers: 'Creative Directors, Brand Designers, and E-Commerce Merchandisers',
              platform: 'High-Resolution Image Generation Models (Imagen / Midjourney / Flux / Gemini Image)',
              expectedOutput: 'Structured optical, lighting, composition, and negative-constraint prompt specification',
              requiredFunctionality: [
                'Precise macro lens and aperture specification (100mm f/8 focus-stacked look)',
                'Controlled rim lighting and softbox reflections on brushed steel and sapphire crystal',
                'Strict preservation of user constraint: zero random background props'
              ],
              userExperienceExpectations: ['Copy-paste ready prompt block plus structured parameter breakdown'],
              technicalComplexity: 'Low',
              externalServicesRequired: ['Image Generation Model'],
              backendRequirements: 'N/A (Image Generation Prompt)',
              databaseRequirements: 'N/A',
              authenticationRequirements: 'N/A',
              fileMediaRequirements: '4:3 or 16:9 high-resolution output',
              apiRequirements: 'N/A',
              deploymentRequirements: 'N/A'
            },
            extractedRequirements: [
              {
                id: 'img_req_1',
                statement: 'Subject is a luxury mechanical chronograph watch resting on dark stone',
                classification: 'Required',
                origin: 'USER REQUIREMENT',
                rationale: 'Explicit subject and surface material specified by user.'
              },
              {
                id: 'img_req_2',
                statement: 'Keep the watch dial completely sharp and legible',
                classification: 'Required',
                origin: 'USER REQUIREMENT',
                rationale: 'Explicit optical constraint from user input.'
              },
              {
                id: 'img_req_3',
                statement: 'Do NOT add random props or background objects',
                classification: 'Required',
                origin: 'USER REQUIREMENT',
                rationale: 'Explicit negative constraint that must be strictly preserved.'
              }
            ],
            missingInformation: [],
            clarificationQuestions: [],
            needsClarification: false,
            assumptions: ['Assumed brushed stainless steel case with anthracite sunray dial.'],
            recommendedTechnologies: [],
            qualityAudit: {
              overallPassed: true,
              summary: 'Preserves all negative constraints and specifies exact macro lighting.',
              autoImprovementsApplied: ['Added explicit negative exclusions.'],
              checks: [{ criterion: 'Explicit negative constraints preserved', passed: true, notes: 'Strictly forbids extra props.' }]
            },
            structureSections: [],
            finalPrompt: `Commercial studio macro photography of a Swiss luxury mechanical chronograph watch resting on a matte dark basalt stone slab. Ultra-sharp focus across dial indices. Minimalist, zero extra props.`
          }
        }
      ]
    },
    {
      id: 'prf_seed_agent_03',
      userId,
      title: 'Autonomous SQL & Data Anomaly Triage AI Agent Specification',
      rawInput: 'Build an AI agent that monitors database metrics, queries read-only tables when anomalies happen, and posts a root-cause report.',
      detectedCategories: ['AI agent', 'AI application', 'Database', 'Automation', 'API / backend'],
      primaryEngine: 'AI_Agent',
      currentVersionId: v3Id,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      isPinned: false,
      versions: [
        {
          versionId: v3Id,
          versionNumber: 1,
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          mode: 'Expert',
          changeNote: 'Initial AI Agent specification with strict read-only tool guardrails',
          rawInput: 'Build an AI agent that monitors database metrics, queries read-only tables when anomalies happen, and posts a root-cause report.',
          usedSensibleDefaults: true,
          analysis: {
            title: 'Autonomous SQL & Data Anomaly Triage AI Agent Specification',
            detectedCategories: ['AI agent', 'AI application', 'Database', 'Automation', 'API / backend'],
            primaryEngine: 'AI_Agent',
            intentAnalysis: {
              mainGoal: 'Design and implement an autonomous AI triage agent that detects database metric anomalies, executes safe read-only diagnostic queries, and generates structured root-cause incident reports.',
              secondaryGoals: ['Enforce strict read-only SQL execution guardrails'],
              actualIntendedOutcome: 'Reduce MTTR safely.',
              targetUsers: 'SREs and Data Engineers',
              platform: 'Node.js / TypeScript Backend Service',
              expectedOutput: 'Complete AI Agent system prompt, tool declarations, and guardrails',
              requiredFunctionality: ['inspect_schema', 'execute_readonly_sql', 'publish_incident_report'],
              userExperienceExpectations: ['Transparent tool-call logs'],
              technicalComplexity: 'High',
              externalServicesRequired: ['LLM API with Function Calling'],
              backendRequirements: 'Agent orchestrator loop with max 5 iterations',
              databaseRequirements: 'Read-only replica connection',
              authenticationRequirements: 'Service account credentials',
              fileMediaRequirements: 'Markdown/JSON incident artifacts',
              apiRequirements: 'POST /api/agent/triage',
              deploymentRequirements: 'Stateless server container'
            },
            extractedRequirements: [
              {
                id: 'ag_req_1',
                statement: 'Monitor database metrics and trigger investigation when anomalies occur',
                classification: 'Required',
                origin: 'USER REQUIREMENT',
                rationale: 'Core agent trigger.'
              }
            ],
            missingInformation: [],
            clarificationQuestions: [],
            needsClarification: false,
            assumptions: ['Assumed PostgreSQL read-only replica syntax.'],
            recommendedTechnologies: [],
            qualityAudit: {
              overallPassed: true,
              summary: 'Comprehensive agent prompt with bounded iteration cap.',
              autoImprovementsApplied: ['Defined inputs, outputs, and timeout failure modes for each tool.'],
              checks: [{ criterion: 'Guardrails and tool timeouts defined', passed: true, notes: 'Read-only SQL validator specified.' }]
            },
            structureSections: [],
            finalPrompt: `You are an Autonomous Database Reliability & Anomaly Triage Agent. Follow strict read-only tool contracts and publish structured RCA reports.`
          }
        }
      ]
    }
  ];
}

function loadDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const defaultUserId = 'usr_default_architect';
      const initialDb: DatabaseSchema = {
        users: [
          {
            id: defaultUserId,
            name: 'Alex Rivera',
            email: 'alex.rivera@promptforge.dev',
            passwordHash: hashPassword('promptforge2026'),
            role: 'Principal Prompt Architect',
            createdAt: new Date().toISOString(),
            settings: {
              defaultMode: 'Professional',
              autoRunQualityAudit: true,
              strictAssumptionSeparation: true,
              alwaysEnforceWorkingCodeRule: true,
              preferredExportFormat: 'markdown',
              customSystemRules: 'Always prioritize maintainable open-source tools, explicit error handling, and WCAG AA accessibility.',
              theme: 'dark',
              themePreference: 'dark'
            }
          }
        ],
        sessions: [
          {
            token: 'default_session_token_pf',
            userId: defaultUserId,
            createdAt: new Date().toISOString()
          }
        ],
        prompts: getInitialSeedPrompts(defaultUserId)
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error('Error loading DB:', err);
    const defaultUserId = 'usr_default_architect';
    return {
      users: [
        {
          id: defaultUserId,
          name: 'Alex Rivera',
          email: 'alex.rivera@promptforge.dev',
          passwordHash: hashPassword('promptforge2026'),
          role: 'Principal Prompt Architect',
          createdAt: new Date().toISOString(),
          settings: {
            defaultMode: 'Professional',
            autoRunQualityAudit: true,
            strictAssumptionSeparation: true,
            alwaysEnforceWorkingCodeRule: true,
            preferredExportFormat: 'markdown',
            customSystemRules: '',
            theme: 'dark',
            themePreference: 'dark'
          }
        }
      ],
      sessions: [],
      prompts: getInitialSeedPrompts(defaultUserId)
    };
  }
}

function saveDb(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist DB:', err);
  }
}

function getAuthenticatedUser(req: express.Request, db: DatabaseSchema): UserAccount {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const session = db.sessions.find((s) => s.token === token);
    if (session) {
      const user = db.users.find((u) => u.id === session.userId);
      if (user) return user;
    }
  }
  return db.users[0];
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured in server environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

const promptAnalysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    detectedCategories: { type: Type.ARRAY, items: { type: Type.STRING } },
    primaryEngine: { type: Type.STRING },
    websiteSubType: { type: Type.STRING },
    intentAnalysis: {
      type: Type.OBJECT,
      properties: {
        mainGoal: { type: Type.STRING },
        secondaryGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
        actualIntendedOutcome: { type: Type.STRING },
        targetUsers: { type: Type.STRING },
        platform: { type: Type.STRING },
        expectedOutput: { type: Type.STRING },
        requiredFunctionality: { type: Type.ARRAY, items: { type: Type.STRING } },
        userExperienceExpectations: { type: Type.ARRAY, items: { type: Type.STRING } },
        technicalComplexity: { type: Type.STRING },
        externalServicesRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
        backendRequirements: { type: Type.STRING },
        databaseRequirements: { type: Type.STRING },
        authenticationRequirements: { type: Type.STRING },
        fileMediaRequirements: { type: Type.STRING },
        apiRequirements: { type: Type.STRING },
        deploymentRequirements: { type: Type.STRING }
      },
      required: [
        'mainGoal', 'secondaryGoals', 'actualIntendedOutcome', 'targetUsers', 'platform',
        'expectedOutput', 'requiredFunctionality', 'userExperienceExpectations', 'technicalComplexity',
        'externalServicesRequired', 'backendRequirements', 'databaseRequirements',
        'authenticationRequirements', 'fileMediaRequirements', 'apiRequirements', 'deploymentRequirements'
      ]
    },
    extractedRequirements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          statement: { type: Type.STRING },
          classification: { type: Type.STRING },
          origin: { type: Type.STRING },
          rationale: { type: Type.STRING }
        },
        required: ['id', 'statement', 'classification', 'origin', 'rationale']
      }
    },
    missingInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
    clarificationQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING },
          question: { type: Type.STRING },
          whyImportant: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          sensibleDefault: { type: Type.STRING }
        },
        required: ['id', 'category', 'question', 'whyImportant', 'options', 'sensibleDefault']
      }
    },
    needsClarification: { type: Type.BOOLEAN },
    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommendedTechnologies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          reason: { type: Type.STRING },
          licenseNote: { type: Type.STRING }
        },
        required: ['name', 'category', 'reason', 'licenseNote']
      }
    },
    qualityAudit: {
      type: Type.OBJECT,
      properties: {
        overallPassed: { type: Type.BOOLEAN },
        summary: { type: Type.STRING },
        autoImprovementsApplied: { type: Type.ARRAY, items: { type: Type.STRING } },
        checks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              criterion: { type: Type.STRING },
              passed: { type: Type.BOOLEAN },
              notes: { type: Type.STRING }
            },
            required: ['criterion', 'passed', 'notes']
          }
        }
      },
      required: ['overallPassed', 'summary', 'autoImprovementsApplied', 'checks']
    },
    structureSections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ['heading', 'content']
      }
    },
    finalPrompt: { type: Type.STRING }
  },
  required: [
    'title', 'detectedCategories', 'primaryEngine', 'intentAnalysis', 'extractedRequirements',
    'missingInformation', 'clarificationQuestions', 'needsClarification', 'assumptions',
    'recommendedTechnologies', 'qualityAudit', 'structureSections', 'finalPrompt'
  ]
};

function buildSystemInstruction(mode: string, customRules?: string): string {
  return `You are PromptForge AI, a Principal Prompt Engineering Architect, Requirement Extractor, Intent Analyzer, and Quality Auditor.
Take ANY rough, incomplete, or complex request and compile it into a verified, copy-paste-ready AI prompt.
Distinguish strictly between "USER REQUIREMENT", "AI RECOMMENDATION", and "ASSUMPTION".
For websites and web apps, mandate: "This must NOT be a UI-only prototype or static demo."
Selected mode: ${mode}. Custom instructions: ${customRules || 'None'}.`;
}

// Routes
app.get('/api/auth/me', (req, res) => {
  const db = loadDb();
  const user = getAuthenticatedUser(req, db);
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    settings: user.settings
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }
  const db = loadDb();
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user || user.passwordHash !== hashPassword(String(password))) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }
  const token = 'pf_tok_' + crypto.randomBytes(24).toString('hex');
  db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  saveDb(db);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    settings: user.settings
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }
  const db = loadDb();
  const normalizedEmail = String(email).trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }
  const newUserId = 'usr_' + crypto.randomBytes(8).toString('hex');
  const newUser: UserAccount = {
    id: newUserId,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(String(password)),
    role: role ? String(role).trim() : 'Prompt Engineer',
    createdAt: new Date().toISOString(),
    settings: {
      defaultMode: 'Professional',
      autoRunQualityAudit: true,
      strictAssumptionSeparation: true,
      alwaysEnforceWorkingCodeRule: true,
      preferredExportFormat: 'markdown',
      customSystemRules: '',
      theme: 'dark',
      themePreference: 'dark'
    }
  };
  db.users.push(newUser);
  db.prompts.push(...getInitialSeedPrompts(newUserId));
  const token = 'pf_tok_' + crypto.randomBytes(24).toString('hex');
  db.sessions.push({ token, userId: newUser.id, createdAt: new Date().toISOString() });
  saveDb(db);
  res.status(201).json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, createdAt: newUser.createdAt },
    settings: newUser.settings
  });
});

app.put('/api/settings', (req, res) => {
  const db = loadDb();
  const user = getAuthenticatedUser(req, db);
  const updates = req.body || {};
  user.settings = { ...user.settings, ...updates };
  if (updates.name && typeof updates.name === 'string') user.name = updates.name.trim();
  if (updates.role && typeof updates.role === 'string') user.role = updates.role.trim();
  saveDb(db);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    settings: user.settings
  });
});

app.get('/api/prompts', (req, res) => {
  const db = loadDb();
  const user = getAuthenticatedUser(req, db);
  const userPrompts = db.prompts
    .filter((p) => p.userId === user.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  res.json({ prompts: userPrompts });
});

app.post('/api/prompts', (req, res) => {
  const db = loadDb();
  const user = getAuthenticatedUser(req, db);
  const { rawInput, mode, analysis, clarificationAnswers, usedSensibleDefaults, changeNote } = req.body || {};
  if (!rawInput || !analysis) {
    res.status(400).json({ error: 'rawInput and analysis are required.' });
    return;
  }
  const now = new Date().toISOString();
  const versionId = 'ver_' + crypto.randomBytes(8).toString('hex');
  const promptId = 'prf_' + crypto.randomBytes(8).toString('hex');

  const newRecord = {
    id: promptId,
    userId: user.id,
    title: analysis.title || String(rawInput).slice(0, 60),
    rawInput: String(rawInput),
    detectedCategories: analysis.detectedCategories || ['Other / custom'],
    primaryEngine: analysis.primaryEngine || 'Website',
    currentVersionId: versionId,
    createdAt: now,
    updatedAt: now,
    isPinned: false,
    versions: [
      {
        versionId,
        versionNumber: 1,
        createdAt: now,
        mode: mode || 'Professional',
        changeNote: changeNote || 'Initial prompt generation',
        rawInput: String(rawInput),
        clarificationAnswers: clarificationAnswers || {},
        usedSensibleDefaults: Boolean(usedSensibleDefaults),
        analysis
      }
    ]
  };

  db.prompts.unshift(newRecord);
  saveDb(db);
  res.status(201).json({ prompt: newRecord });
});

app.put('/api/prompts/:id', (req, res) => {
  const db = loadDb();
  const user = getAuthenticatedUser(req, db);
  const promptIndex = db.prompts.findIndex((p) => p.id === req.params.id && p.userId === user.id);
  if (promptIndex === -1) {
    res.status(404).json({ error: 'Prompt not found.' });
    return;
  }
  const record = db.prompts[promptIndex];
  const { title, isPinned, currentVersionId, newVersion } = req.body || {};
  if (typeof title === 'string' && title.trim()) record.title = title.trim();
  if (typeof isPinned === 'boolean') record.isPinned = isPinned;
  if (typeof currentVersionId === 'string') record.currentVersionId = currentVersionId;
  if (newVersion && newVersion.analysis) {
    const versionId = 'ver_' + crypto.randomBytes(8).toString('hex');
    const versionNumber = record.versions.length + 1;
    record.versions.push({
      versionId,
      versionNumber,
      createdAt: new Date().toISOString(),
      mode: newVersion.mode || 'Professional',
      changeNote: newVersion.changeNote || `Refinement v${versionNumber}`,
      rawInput: newVersion.rawInput || record.rawInput,
      clarificationAnswers: newVersion.clarificationAnswers || {},
      usedSensibleDefaults: Boolean(newVersion.usedSensibleDefaults),
      analysis: newVersion.analysis
    });
    record.currentVersionId = versionId;
  }
  record.updatedAt = new Date().toISOString();
  db.prompts[promptIndex] = record;
  saveDb(db);
  res.json({ prompt: record });
});

app.post('/api/prompts/:id/duplicate', (req, res) => {
  const db = loadDb();
  const user = getAuthenticatedUser(req, db);
  const original = db.prompts.find((p) => p.id === req.params.id && p.userId === user.id);
  if (!original) {
    res.status(404).json({ error: 'Prompt not found.' });
    return;
  }
  const now = new Date().toISOString();
  const duplicate = {
    ...JSON.parse(JSON.stringify(original)),
    id: 'prf_' + crypto.randomBytes(8).toString('hex'),
    title: `${original.title} (Copy)`,
    createdAt: now,
    updatedAt: now,
    isPinned: false
  };
  db.prompts.unshift(duplicate);
  saveDb(db);
  res.status(201).json({ prompt: duplicate });
});

app.delete('/api/prompts/:id', (req, res) => {
  const db = loadDb();
  const user = getAuthenticatedUser(req, db);
  const initialLen = db.prompts.length;
  db.prompts = db.prompts.filter((p) => !(p.id === req.params.id && p.userId === user.id));
  if (db.prompts.length === initialLen) {
    res.status(404).json({ error: 'Prompt not found.' });
    return;
  }
  saveDb(db);
  res.json({ deletedId: req.params.id });
});

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { rawInput, mode = 'Professional', clarificationAnswers, useSensibleDefaults = false, customRules = '', forceCategories = [] } = req.body || {};
    if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
      res.status(400).json({ error: 'Please provide a non-empty request to analyze.' });
      return;
    }
    const ai = getGeminiClient();
    let userPrompt = `USER REQUEST:\n"""\n${rawInput.trim()}\n"""\nMODE: ${mode}\n`;
    if (forceCategories.length) userPrompt += `CATEGORIES: ${forceCategories.join(', ')}\n`;
    if (useSensibleDefaults) {
      userPrompt += `User chose "Use sensible defaults". Make safe assumptions, document them in assumptions, set needsClarification=false.\n`;
    } else if (clarificationAnswers && Object.keys(clarificationAnswers).length > 0) {
      userPrompt += `Clarifications: ${JSON.stringify(clarificationAnswers)}\n`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: buildSystemInstruction(mode, customRules),
        responseMimeType: 'application/json',
        responseSchema: promptAnalysisResponseSchema,
        temperature: 0.35
      }
    });

    const text = response.text;
    if (!text) {
      res.status(502).json({ error: 'Empty AI response' });
      return;
    }
    res.json({ analysis: JSON.parse(text) });
  } catch (err: any) {
    console.error('AI error:', err);
    res.status(500).json({ error: err?.message || 'AI generation failed.' });
  }
});

app.post('/api/ai/refine', async (req, res) => {
  try {
    const { rawInput, currentAnalysis, refinementInstruction, mode = 'Professional', customRules = '' } = req.body || {};
    if (!currentAnalysis || !refinementInstruction) {
      res.status(400).json({ error: 'Analysis and refinement instruction are required.' });
      return;
    }
    const ai = getGeminiClient();
    const refinePrompt = `ORIGINAL: ${rawInput}\nPREVIOUS: ${JSON.stringify(currentAnalysis)}\nREFINEMENT: ${refinementInstruction}\nMODE: ${mode}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: refinePrompt,
      config: {
        systemInstruction: buildSystemInstruction(mode, customRules),
        responseMimeType: 'application/json',
        responseSchema: promptAnalysisResponseSchema,
        temperature: 0.35
      }
    });

    const text = response.text;
    if (!text) {
      res.status(502).json({ error: 'Empty AI refinement response' });
      return;
    }
    res.json({ analysis: JSON.parse(text) });
  } catch (err: any) {
    console.error('AI refine error:', err);
    res.status(500).json({ error: err?.message || 'Refinement failed.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
    }
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PromptForge AI server running on port ${PORT}`);
  });
}

startServer();
