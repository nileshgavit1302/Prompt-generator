import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  History,
  Settings,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Trash2,
  CopyPlus,
  Edit3,
  Search,
  ChevronDown,
  Terminal,
  ShieldCheck,
  FileText,
  User,
  Sun,
  Moon,
  Laptop,
  Pin,
  Plus,
  X,
  HelpCircle,
  Code2,
  Image as ImageIcon,
  Video,
  Globe,
  Bot
} from 'lucide-react';
import {
  PromptMode,
  ThemePreference,
  PromptAnalysisResult,
  SavedPromptRecord,
  UserProfile,
  UserSettings,
  ALL_PROMPT_CATEGORIES
} from './types';
import { STARTER_TEMPLATES, REFINEMENT_PRESETS } from './data/templates';

type ActiveView = 'studio' | 'history' | 'engines' | 'settings';
type AnalysisTab = 'prompt' | 'intent' | 'requirements' | 'tech_audit' | 'sections';

export function App() {
  // Navigation
  const [activeView, setActiveView] = useState<ActiveView>('studio');
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>('prompt');

  // Dedicated Theme Management State
  // themePreference can be 'dark' | 'light' | 'system'
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    return (localStorage.getItem('pf_theme_preference') as ThemePreference) || 'dark';
  });
  // systemPrefersDark tracks the live OS media query
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
  });

  // Listen to OS system color-scheme changes in real-time
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute the effective active theme ('dark' or 'light')
  const effectiveTheme: 'dark' | 'light' = useMemo(() => {
    if (themePreference === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return themePreference;
  }, [themePreference, systemPrefersDark]);

  const isDark = effectiveTheme === 'dark';

  // Auth & User State
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem('pf_auth_token') || 'default_session_token_pf');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    defaultMode: 'Professional',
    autoRunQualityAudit: true,
    strictAssumptionSeparation: true,
    alwaysEnforceWorkingCodeRule: true,
    preferredExportFormat: 'markdown',
    customSystemRules: 'Always prioritize maintainable open-source tools, explicit error handling, and WCAG AA accessibility.',
    theme: 'dark',
    themePreference: 'dark'
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'Senior Prompt Engineer' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Studio Input & Generation State
  const [rawInput, setRawInput] = useState<string>('I want to make a professional developer portfolio website.');
  const [selectedMode, setSelectedMode] = useState<PromptMode>('Professional');
  const [customRulesInput, setCustomRulesInput] = useState<string>('');
  const [selectedCategoryHints, setSelectedCategoryHints] = useState<string[]>([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // Active Prompt Record & Analysis
  const [savedPrompts, setSavedPrompts] = useState<SavedPromptRecord[]>([]);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<PromptAnalysisResult | null>(null);
  const [editableFinalPrompt, setEditableFinalPrompt] = useState<string>('');
  const [isEditingPromptText, setIsEditingPromptText] = useState(false);

  // Smart Clarification State
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
  const [showClarificationPanel, setShowClarificationPanel] = useState(false);

  // Refinement State
  const [customRefinementInput, setCustomRefinementInput] = useState('');

  // History Search & Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<string>('All');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Status, Loading & Feedback
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [activeRefinementLabel, setActiveRefinementLabel] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<string | null>(null);

  // Helper to show temporary toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Dedicated Theme Change Handler: user can force Light, Dark, or System
  const handleUpdateTheme = (newPref: ThemePreference) => {
    setThemePreference(newPref);
    localStorage.setItem('pf_theme_preference', newPref);
    const computed = newPref === 'system' ? (systemPrefersDark ? 'dark' : 'light') : newPref;
    // Persist to backend settings
    handleSaveSettings({
      themePreference: newPref,
      theme: computed
    });
    triggerToast(
      newPref === 'system'
        ? `Theme set to Match System (${systemPrefersDark ? 'Dark Mode' : 'Light Mode'})`
        : `Theme forced to ${newPref.toUpperCase()} mode`
    );
  };

  // Load initial user profile & saved prompts
  useEffect(() => {
    async function bootstrap() {
      try {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${authToken}`
        };
        const [meRes, promptsRes] = await Promise.all([
          fetch('/api/auth/me', { headers }),
          fetch('/api/prompts', { headers })
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
          if (meData.settings) {
            setSettings(meData.settings);
            if (meData.settings.themePreference) {
              setThemePreference(meData.settings.themePreference);
              localStorage.setItem('pf_theme_preference', meData.settings.themePreference);
            }
            setSelectedMode(meData.settings.defaultMode || 'Professional');
            setCustomRulesInput(meData.settings.customSystemRules || '');
          }
        }

        if (promptsRes.ok) {
          const pData = await promptsRes.json();
          const list: SavedPromptRecord[] = pData.prompts || [];
          setSavedPrompts(list);
          if (list.length > 0 && !currentAnalysis) {
            const first = list[0];
            setActiveRecordId(first.id);
            const activeVer =
              first.versions.find((v) => v.versionId === first.currentVersionId) ||
              first.versions[first.versions.length - 1];
            if (activeVer) {
              setRawInput(first.rawInput);
              setSelectedMode(activeVer.mode);
              setCurrentAnalysis(activeVer.analysis);
              setEditableFinalPrompt(activeVer.analysis.finalPrompt);
            }
          }
        }
      } catch (err) {
        console.error('Bootstrap error:', err);
      }
    }
    bootstrap();
  }, [authToken]);

  // Active Record Helper
  const activeRecord = useMemo(
    () => savedPrompts.find((p) => p.id === activeRecordId) || null,
    [savedPrompts, activeRecordId]
  );

  // Copy helper
  const handleCopyPrompt = async (textToCopy?: string, label = 'Final Prompt') => {
    const target = textToCopy ?? editableFinalPrompt ?? currentAnalysis?.finalPrompt ?? '';
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target);
      setCopiedState(label);
      triggerToast(`${label} copied to clipboard`);
      setTimeout(() => setCopiedState(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = target;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedState(label);
      triggerToast(`${label} copied to clipboard`);
      setTimeout(() => setCopiedState(null), 2000);
    }
  };

  // Export helper
  const handleExportPrompt = (format?: 'markdown' | 'json' | 'text') => {
    if (!currentAnalysis) return;
    const fmt = format || settings.preferredExportFormat || 'markdown';
    let content = '';
    let ext = 'md';
    let mime = 'text/markdown';

    if (fmt === 'json') {
      content = JSON.stringify(
        {
          title: currentAnalysis.title,
          detectedCategories: currentAnalysis.detectedCategories,
          primaryEngine: currentAnalysis.primaryEngine,
          mode: selectedMode,
          rawInput,
          intentAnalysis: currentAnalysis.intentAnalysis,
          extractedRequirements: currentAnalysis.extractedRequirements,
          missingInformation: currentAnalysis.missingInformation,
          assumptions: currentAnalysis.assumptions,
          recommendedTechnologies: currentAnalysis.recommendedTechnologies,
          qualityAudit: currentAnalysis.qualityAudit,
          finalPrompt: editableFinalPrompt || currentAnalysis.finalPrompt
        },
        null,
        2
      );
      ext = 'json';
      mime = 'application/json';
    } else if (fmt === 'text') {
      content = editableFinalPrompt || currentAnalysis.finalPrompt;
      ext = 'txt';
      mime = 'text/plain';
    } else {
      content = `# ${currentAnalysis.title}\n\n` +
        `**Detected Categories:** ${currentAnalysis.detectedCategories.join(' · ')}\n` +
        `**Primary Engine:** ${currentAnalysis.primaryEngine} (${selectedMode} Mode)\n` +
        `**Original Request:** ${rawInput}\n\n` +
        `---\n\n` +
        `## Main Goal\n${currentAnalysis.intentAnalysis.mainGoal}\n\n` +
        `## Assumptions Applied\n${currentAnalysis.assumptions.map((a) => `- ${a}`).join('\n')}\n\n` +
        `---\n\n` +
        `## Copy-Paste Ready Prompt\n\n${editableFinalPrompt || currentAnalysis.finalPrompt}\n`;
      ext = 'md';
      mime = 'text/markdown';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = (currentAnalysis.title || 'promptforge-spec')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    a.href = url;
    a.download = `${slug}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast(`Exported specification as .${ext}`);
  };

  // Core Analyze & Generate Handler
  const handleAnalyzeAndGenerate = async (options?: {
    useSensibleDefaults?: boolean;
    withClarifications?: boolean;
    overrideInput?: string;
    overrideMode?: PromptMode;
  }) => {
    const inputToAnalyze = options?.overrideInput !== undefined ? options.overrideInput : rawInput;
    const modeToUse = options?.overrideMode || selectedMode;

    if (!inputToAnalyze.trim()) {
      setErrorBanner('Please enter a project idea, rough request, or prompt before analyzing.');
      return;
    }

    setErrorBanner(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          rawInput: inputToAnalyze,
          mode: modeToUse,
          clarificationAnswers: options?.withClarifications ? clarificationAnswers : undefined,
          useSensibleDefaults: Boolean(options?.useSensibleDefaults),
          customRules: modeToUse === 'Custom' ? customRulesInput : settings.customSystemRules,
          forceCategories: selectedCategoryHints
        })
      });

      const data = await response.json();
      if (!response.ok || !data.analysis) {
        throw new Error(data.error || 'Failed to analyze request.');
      }

      const analysis: PromptAnalysisResult = data.analysis;
      setCurrentAnalysis(analysis);
      setEditableFinalPrompt(analysis.finalPrompt);
      setIsEditingPromptText(false);
      setAnalysisTab('prompt');

      if (analysis.clarificationQuestions && analysis.clarificationQuestions.length > 0) {
        const defaultsMap: Record<string, string> = {};
        analysis.clarificationQuestions.forEach((q) => {
          defaultsMap[q.question] = q.sensibleDefault || q.options?.[0] || '';
        });
        setClarificationAnswers(defaultsMap);
        setShowClarificationPanel(analysis.needsClarification && !options?.useSensibleDefaults && !options?.withClarifications);
      } else {
        setShowClarificationPanel(false);
      }

      const saveRes = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          rawInput: inputToAnalyze,
          mode: modeToUse,
          analysis,
          clarificationAnswers: options?.withClarifications ? clarificationAnswers : {},
          usedSensibleDefaults: Boolean(options?.useSensibleDefaults),
          changeNote: options?.useSensibleDefaults
            ? `Compiled with sensible defaults (${modeToUse})`
            : options?.withClarifications
              ? `Compiled with custom clarifications (${modeToUse})`
              : `Initial analysis & prompt generation (${modeToUse})`
        })
      });

      if (saveRes.ok) {
        const savedData = await saveRes.json();
        setSavedPrompts((prev) => [savedData.prompt, ...prev]);
        setActiveRecordId(savedData.prompt.id);
      }

      triggerToast('Prompt analyzed and saved to history');
    } catch (err: any) {
      setErrorBanner(err?.message || 'An unexpected error occurred during prompt analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Refine Existing Prompt
  const handleRefinePrompt = async (instruction: string, label?: string) => {
    if (!currentAnalysis || !instruction.trim()) return;

    setErrorBanner(null);
    setIsRefining(true);
    setActiveRefinementLabel(label || 'Custom Refinement');

    try {
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          rawInput,
          currentAnalysis: {
            ...currentAnalysis,
            finalPrompt: editableFinalPrompt || currentAnalysis.finalPrompt
          },
          refinementInstruction: instruction,
          mode: selectedMode,
          customRules: selectedMode === 'Custom' ? customRulesInput : settings.customSystemRules
        })
      });

      const data = await response.json();
      if (!response.ok || !data.analysis) {
        throw new Error(data.error || 'Failed to refine prompt.');
      }

      const updatedAnalysis: PromptAnalysisResult = data.analysis;
      setCurrentAnalysis(updatedAnalysis);
      setEditableFinalPrompt(updatedAnalysis.finalPrompt);
      setCustomRefinementInput('');

      if (activeRecordId) {
        const updateRes = await fetch(`/api/prompts/${activeRecordId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({
            newVersion: {
              mode: selectedMode,
              changeNote: label ? `Refined: ${label}` : `Refined: ${instruction.slice(0, 50)}`,
              rawInput,
              analysis: updatedAnalysis
            }
          })
        });

        if (updateRes.ok) {
          const updatedData = await updateRes.json();
          setSavedPrompts((prev) =>
            prev.map((item) => (item.id === activeRecordId ? updatedData.prompt : item))
          );
        }
      }

      triggerToast(`Prompt upgraded (${label || 'Refinement applied'})`);
    } catch (err: any) {
      setErrorBanner(err?.message || 'Failed to refine prompt.');
    } finally {
      setIsRefining(false);
      setActiveRefinementLabel(null);
    }
  };

  const handleSelectSavedPrompt = (record: SavedPromptRecord, versionId?: string) => {
    setActiveRecordId(record.id);
    const targetVer =
      record.versions.find((v) => v.versionId === (versionId || record.currentVersionId)) ||
      record.versions[record.versions.length - 1];
    if (targetVer) {
      setRawInput(targetVer.rawInput || record.rawInput);
      setSelectedMode(targetVer.mode);
      setCurrentAnalysis(targetVer.analysis);
      setEditableFinalPrompt(targetVer.analysis.finalPrompt);
      setShowClarificationPanel(false);
    }
    setActiveView('studio');
  };

  const handleRestoreVersion = async (recordId: string, versionId: string) => {
    try {
      const res = await fetch(`/api/prompts/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ currentVersionId: versionId })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPrompts((prev) => prev.map((p) => (p.id === recordId ? data.prompt : p)));
        handleSelectSavedPrompt(data.prompt, versionId);
        triggerToast('Restored selected prompt version');
      }
    } catch {
      setErrorBanner('Could not restore version.');
    }
  };

  const handleRenamePrompt = async (recordId: string) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      const res = await fetch(`/api/prompts/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ title: renameValue.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPrompts((prev) => prev.map((p) => (p.id === recordId ? data.prompt : p)));
        if (activeRecordId === recordId && currentAnalysis) {
          setCurrentAnalysis({ ...currentAnalysis, title: renameValue.trim() });
        }
        triggerToast('Prompt renamed');
      }
    } finally {
      setRenamingId(null);
    }
  };

  const handleTogglePin = async (record: SavedPromptRecord) => {
    try {
      const res = await fetch(`/api/prompts/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ isPinned: !record.isPinned })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPrompts((prev) => prev.map((p) => (p.id === record.id ? data.prompt : p)));
      }
    } catch {
      // ignore
    }
  };

  const handleDuplicatePrompt = async (recordId: string) => {
    try {
      const res = await fetch(`/api/prompts/${recordId}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPrompts((prev) => [data.prompt, ...prev]);
        triggerToast('Prompt duplicated');
      }
    } catch {
      setErrorBanner('Failed to duplicate prompt.');
    }
  };

  const handleDeletePrompt = async (recordId: string) => {
    try {
      const res = await fetch(`/api/prompts/${recordId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const remaining = savedPrompts.filter((p) => p.id !== recordId);
        setSavedPrompts(remaining);
        if (activeRecordId === recordId) {
          if (remaining.length > 0) {
            handleSelectSavedPrompt(remaining[0]);
          } else {
            setActiveRecordId(null);
            setCurrentAnalysis(null);
            setEditableFinalPrompt('');
          }
        }
        triggerToast('Prompt deleted from history');
      }
    } catch {
      setErrorBanner('Failed to delete prompt.');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }
      localStorage.setItem('pf_auth_token', data.token);
      setAuthToken(data.token);
      setUser(data.user);
      if (data.settings) {
        setSettings(data.settings);
        if (data.settings.themePreference) {
          setThemePreference(data.settings.themePreference);
        }
      }
      setShowAuthModal(false);
      triggerToast(`Signed in as ${data.user.name}`);
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveSettings = async (updatedSettings: Partial<UserSettings> & { name?: string; role?: string }) => {
    const merged = { ...settings, ...updatedSettings };
    setSettings(merged);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSettings(data.settings);
      }
    } catch {
      setErrorBanner('Failed to save settings to server.');
    }
  };

  const filteredHistory = useMemo(() => {
    return savedPrompts.filter((item) => {
      const matchesCategory =
        historyCategoryFilter === 'All' ||
        item.detectedCategories.some((c) => c.toLowerCase() === historyCategoryFilter.toLowerCase()) ||
        item.primaryEngine.toLowerCase() === historyCategoryFilter.toLowerCase();
      const q = historySearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.rawInput.toLowerCase().includes(q) ||
        item.detectedCategories.some((c) => c.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [savedPrompts, historyCategoryFilter, historySearch]);

  const renderEngineIcon = (engine?: string) => {
    switch (engine) {
      case 'Website':
        return <Globe className="w-4 h-4 text-sky-400 shrink-0" />;
      case 'Coding':
        return <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'Image':
        return <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'Video':
        return <Video className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'AI_Agent':
        return <Bot className="w-4 h-4 text-indigo-400 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-150 ${
        isDark ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Top Bar Contract: Brand — 4 Nav links — Primary Actions */}
      <header
        className={`sticky top-0 z-30 h-14 px-4 lg:px-6 flex items-center justify-between border-b ${
          isDark ? 'bg-[#0B0F17]/95 border-slate-800/80' : 'bg-white/95 border-slate-200'
        } backdrop-blur-md`}
      >
        <a
          href="#studio"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('studio');
          }}
          className={`text-base font-bold tracking-tight whitespace-nowrap ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          PromptForge AI
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveView('studio')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeView === 'studio'
                ? 'border-sky-500 text-sky-400'
                : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-100'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Prompt Studio
          </button>
          <button
            type="button"
            onClick={() => setActiveView('history')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeView === 'history'
                ? 'border-sky-500 text-sky-400'
                : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-100'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            History ({savedPrompts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('engines')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeView === 'engines'
                ? 'border-sky-500 text-sky-400'
                : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-100'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Engine Specs
          </button>
          <button
            type="button"
            onClick={() => setActiveView('settings')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeView === 'settings'
                ? 'border-sky-500 text-sky-400'
                : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-100'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Top Header Controls: Quick Theme Toggle & Profile Button */}
        <div className="flex items-center gap-2.5">
          {/* Quick 3-way Theme Cycle Button */}
          <button
            type="button"
            onClick={() => {
              const next: ThemePreference =
                themePreference === 'dark' ? 'light' : themePreference === 'light' ? 'system' : 'dark';
              handleUpdateTheme(next);
            }}
            title={`Active: ${themePreference.toUpperCase()} mode (Click to cycle Light / Dark / System)`}
            aria-label="Toggle theme appearance"
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
              isDark
                ? 'border-slate-800 text-slate-300 hover:bg-slate-800/70'
                : 'border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {themePreference === 'system' ? (
              <Laptop className="w-4 h-4 text-sky-400" />
            ) : themePreference === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
            <span className="text-[11px] font-medium hidden sm:inline capitalize">
              {themePreference}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap flex items-center gap-2 ${
              isDark
                ? 'border-slate-700 bg-slate-800/90 text-slate-100 hover:bg-slate-700'
                : 'border-slate-300 bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="truncate max-w-[140px]">{user ? user.name : 'Sign In'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div
        className={`md:hidden flex items-center justify-around border-b px-2 py-1.5 text-xs font-medium ${
          isDark ? 'bg-[#0F1623] border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveView('studio')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeView === 'studio' ? 'bg-sky-600 text-white' : ''
          }`}
        >
          Studio
        </button>
        <button
          type="button"
          onClick={() => setActiveView('history')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap tabular-nums ${
            activeView === 'history' ? 'bg-sky-600 text-white' : ''
          }`}
        >
          History ({savedPrompts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveView('engines')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeView === 'engines' ? 'bg-sky-600 text-white' : ''
          }`}
        >
          Engines
        </button>
        <button
          type="button"
          onClick={() => setActiveView('settings')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeView === 'settings' ? 'bg-sky-600 text-white' : ''
          }`}
        >
          Settings
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-sky-600 text-white text-xs font-medium shadow-lg"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorBanner && (
        <div
          role="alert"
          className="mx-4 lg:mx-6 mt-4 p-3.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 flex items-center justify-between gap-4 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            className="px-2.5 py-1 rounded border border-red-400/30 hover:bg-red-500/20 text-red-200 whitespace-nowrap"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`hidden xl:flex flex-col w-72 shrink-0 border-r ${
            isDark ? 'bg-[#0E131F] border-slate-800/80' : 'bg-white border-slate-200'
          }`}
        >
          <div className="p-4 border-b border-slate-800/60">
            <button
              type="button"
              onClick={() => {
                setActiveRecordId(null);
                setRawInput('');
                setCurrentAnalysis(null);
                setEditableFinalPrompt('');
                setShowClarificationPanel(false);
                setActiveView('studio');
              }}
              className="w-full py-2 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Prompt Request</span>
            </button>
          </div>

          <div className="p-4 border-b border-slate-800/60">
            <div className="flex items-center justify-between mb-2.5">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Domain Presets
              </span>
              <span className="text-[11px] text-slate-500 tabular-nums">{STARTER_TEMPLATES.length} engines</span>
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {STARTER_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    setRawInput(tpl.rawPrompt);
                    setSelectedMode(tpl.recommendedMode);
                    setActiveView('studio');
                    handleAnalyzeAndGenerate({
                      overrideInput: tpl.rawPrompt,
                      overrideMode: tpl.recommendedMode
                    });
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors flex items-start gap-2 ${
                    isDark ? 'hover:bg-slate-800/70 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="mt-0.5">{renderEngineIcon(tpl.engine)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{tpl.label}</div>
                    <div className="text-[11px] text-slate-500 truncate">{tpl.categorySummary}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Saved Specifications
              </span>
              <button
                type="button"
                onClick={() => setActiveView('history')}
                className="text-[11px] text-sky-400 hover:underline whitespace-nowrap"
              >
                Manage All
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {savedPrompts.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No saved prompts yet.</p>
              ) : (
                savedPrompts.map((item) => {
                  const isSelected = item.id === activeRecordId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSavedPrompt(item)}
                      className={`group cursor-pointer rounded-lg p-2.5 border transition-colors ${
                        isSelected
                          ? isDark
                            ? 'bg-sky-950/40 border-sky-500/50 text-white'
                            : 'bg-sky-50 border-sky-300 text-slate-900'
                          : isDark
                            ? 'border-transparent hover:bg-slate-800/50 text-slate-300'
                            : 'border-transparent hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium truncate">{item.title}</span>
                        {item.isPinned && <Pin className="w-3 h-3 text-amber-400 shrink-0" />}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 tabular-nums">
                        <span>{item.primaryEngine}</span>
                        <span aria-hidden="true">·</span>
                        <span>v{item.versions.length}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{item.detectedCategories[0]}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto">
          {/* ================================================================= */}
          {/* VIEW 1: STUDIO                                                    */}
          {/* ================================================================= */}
          {activeView === 'studio' && (
            <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800/60">
                <div>
                  <h1
                    className={`text-xl lg:text-2xl font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Prompt Analyzer, Requirement Extractor & Compiler
                  </h1>
                  <p className="text-xs lg:text-sm text-slate-400 mt-1">
                    Transform rough, incomplete, or complex requests into verified, architecture-ready AI prompts.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 mr-1.5 font-medium">Mode:</span>
                  <div
                    className={`inline-flex items-center p-1 rounded-lg border ${
                      isDark ? 'bg-[#111827] border-slate-800' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    {(['Quick', 'Standard', 'Professional', 'Expert', 'Custom'] as PromptMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSelectedMode(mode)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                          selectedMode === mode
                            ? 'bg-sky-600 text-white shadow-xs'
                            : isDark
                              ? 'text-slate-400 hover:text-slate-200'
                              : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Two Column Workbench */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left 5 Cols */}
                <div className="lg:col-span-5 space-y-5">
                  <section
                    className={`rounded-xl border p-4 lg:p-5 ${
                      isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <label
                        htmlFor="raw-prompt-input"
                        className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
                      >
                        01. User Request or Idea
                      </label>
                      <div className="flex items-center gap-2 text-xs text-slate-400 tabular-nums">
                        <span>{rawInput.trim().length} chars</span>
                        {rawInput && (
                          <>
                            <span aria-hidden="true">·</span>
                            <button
                              type="button"
                              onClick={() => setRawInput('')}
                              className="text-slate-400 hover:text-red-400 transition-colors"
                            >
                              Clear
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <textarea
                      id="raw-prompt-input"
                      rows={5}
                      value={rawInput}
                      onChange={(e) => setRawInput(e.target.value)}
                      placeholder="Describe what you want to build or generate..."
                      className={`w-full rounded-lg border p-3.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${
                        isDark
                          ? 'bg-[#0B0F17] border-slate-800 text-slate-100 placeholder-slate-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />

                    {selectedMode === 'Custom' && (
                      <div className="mt-3">
                        <label
                          htmlFor="custom-mode-rules"
                          className="block text-xs font-medium text-slate-400 mb-1.5"
                        >
                          Custom Prompt Mode Constraints
                        </label>
                        <input
                          id="custom-mode-rules"
                          type="text"
                          value={customRulesInput}
                          onChange={(e) => setCustomRulesInput(e.target.value)}
                          placeholder="e.g. Target Next.js App Router, strictly zero external CSS..."
                          className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                            isDark
                              ? 'bg-[#0B0F17] border-slate-800 text-slate-200'
                              : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    )}

                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setShowCategorySelector(!showCategorySelector)}
                        className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1.5 transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>
                          {selectedCategoryHints.length > 0
                            ? `Category overrides (${selectedCategoryHints.length} selected)`
                            : 'Auto-detecting from 28 prompt categories (click to pin)'}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {showCategorySelector && (
                        <div
                          className={`mt-2.5 p-3 rounded-lg border max-h-48 overflow-y-auto ${
                            isDark ? 'bg-[#0B0F17] border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] text-slate-400">
                              Select category hints (optional):
                            </span>
                            {selectedCategoryHints.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setSelectedCategoryHints([])}
                                className="text-[11px] text-sky-400 hover:underline"
                              >
                                Reset to Auto
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {ALL_PROMPT_CATEGORIES.map((cat) => {
                              const active = selectedCategoryHints.includes(cat);
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() =>
                                    setSelectedCategoryHints((prev) =>
                                      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                                    )
                                  }
                                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                                    active
                                      ? 'bg-sky-600 text-white'
                                      : isDark
                                        ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                  }`}
                                >
                                  {cat}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <button
                        type="button"
                        disabled={isAnalyzing}
                        onClick={() => handleAnalyzeAndGenerate({ useSensibleDefaults: false })}
                        className="flex-1 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Analyzing Intent & Compiling...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Analyze & Generate Prompt</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isAnalyzing}
                        onClick={() => handleAnalyzeAndGenerate({ useSensibleDefaults: true })}
                        className={`py-2.5 px-3.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                          isDark
                            ? 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700'
                            : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        Use Sensible Defaults
                      </button>
                    </div>
                  </section>

                  {/* Smart Clarification */}
                  {currentAnalysis &&
                    currentAnalysis.clarificationQuestions &&
                    currentAnalysis.clarificationQuestions.length > 0 && (
                      <section
                        className={`rounded-xl border p-4 lg:p-5 ${
                          isDark ? 'bg-[#111827] border-amber-500/30' : 'bg-amber-50/40 border-amber-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                              <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                02. Smart Clarification ({currentAnalysis.clarificationQuestions.length} Details)
                              </h2>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Answer these missing details to lock in exact specifications.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowClarificationPanel(!showClarificationPanel)}
                            className="text-xs text-sky-400 hover:underline whitespace-nowrap"
                          >
                            {showClarificationPanel ? 'Hide' : 'Configure'}
                          </button>
                        </div>

                        {showClarificationPanel && (
                          <div className="mt-4 space-y-4 pt-3 border-t border-slate-800/60">
                            {currentAnalysis.clarificationQuestions.map((q, idx) => (
                              <div key={q.id || idx} className="space-y-1.5">
                                <div className="flex items-baseline justify-between gap-2">
                                  <label className="text-xs font-medium text-slate-200">
                                    {idx + 1}. {q.question}
                                  </label>
                                  <span className="text-[11px] text-slate-500 shrink-0">{q.category}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {q.options.map((opt) => {
                                    const selected = clarificationAnswers[q.question] === opt;
                                    return (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={() =>
                                          setClarificationAnswers((prev) => ({
                                            ...prev,
                                            [q.question]: opt
                                          }))
                                        }
                                        className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                                          selected
                                            ? 'bg-sky-600 text-white font-medium'
                                            : isDark
                                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}

                            <div className="flex flex-wrap items-center gap-2.5 pt-2">
                              <button
                                type="button"
                                disabled={isAnalyzing}
                                onClick={() => handleAnalyzeAndGenerate({ withClarifications: true })}
                                className="py-2 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                              >
                                Recompile With Selected Answers
                              </button>
                            </div>
                          </div>
                        )}
                      </section>
                    )}

                  {/* Refinement */}
                  {currentAnalysis && (
                    <section
                      className={`rounded-xl border p-4 lg:p-5 ${
                        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h2 className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          03. Improve & Refine Existing Prompt
                        </h2>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        Upgrade the current specification incrementally. Preserves all previous requirements.
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-3.5">
                        {REFINEMENT_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            disabled={isRefining}
                            onClick={() => handleRefinePrompt(preset.instruction, preset.label)}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap ${
                              activeRefinementLabel === preset.label
                                ? 'bg-sky-600 border-sky-500 text-white'
                                : isDark
                                  ? 'bg-[#0B0F17] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {activeRefinementLabel === preset.label ? 'Refining...' : preset.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customRefinementInput}
                          onChange={(e) => setCustomRefinementInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customRefinementInput.trim()) {
                              handleRefinePrompt(customRefinementInput);
                            }
                          }}
                          placeholder="Custom refinement instructions..."
                          className={`flex-1 rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                            isDark
                              ? 'bg-[#0B0F17] border-slate-800 text-slate-100 placeholder-slate-500'
                              : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                          }`}
                        />
                        <button
                          type="button"
                          disabled={isRefining || !customRefinementInput.trim()}
                          onClick={() => handleRefinePrompt(customRefinementInput)}
                          className="py-2 px-3.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          {isRefining ? 'Updating...' : 'Apply'}
                        </button>
                      </div>

                      {activeRecord && activeRecord.versions.length > 1 && (
                        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-400">Versions:</span>
                          <div className="flex items-center gap-1.5 overflow-x-auto">
                            {activeRecord.versions.map((ver) => {
                              const isCurrent = ver.versionId === activeRecord.currentVersionId;
                              return (
                                <button
                                  key={ver.versionId}
                                  type="button"
                                  onClick={() => handleRestoreVersion(activeRecord.id, ver.versionId)}
                                  className={`px-2.5 py-1 rounded text-xs font-mono tabular-nums transition-colors whitespace-nowrap ${
                                    isCurrent
                                      ? 'bg-sky-600 text-white font-semibold'
                                      : isDark
                                        ? 'bg-slate-800 text-slate-400 hover:text-white'
                                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  v{ver.versionNumber}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </section>
                  )}
                </div>

                {/* Right 7 Cols */}
                <div className="lg:col-span-7 space-y-5">
                  {!currentAnalysis ? (
                    <div
                      className={`rounded-xl border p-10 text-center ${
                        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <Terminal className="w-8 h-8 text-sky-400 mx-auto mb-3" />
                      <h2 className="text-base font-semibold">Ready to Analyze Your Request</h2>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                        Enter any rough idea on the left or select a domain preset from the sidebar to extract
                        requirements and compile a production-ready prompt.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Summary Banner */}
                      <section
                        className={`rounded-xl border p-4 lg:p-5 ${
                          isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-sky-400 font-medium">
                              {renderEngineIcon(currentAnalysis.primaryEngine)}
                              <span>{currentAnalysis.detectedCategories.join(' + ')}</span>
                              <span aria-hidden="true" className="text-slate-600">·</span>
                              <span className="text-slate-400">{selectedMode} Mode</span>
                            </div>
                            <h2
                              className={`text-lg font-bold tracking-tight ${
                                isDark ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {currentAnalysis.title}
                            </h2>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopyPrompt()}
                              className="py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap shadow-xs"
                            >
                              {copiedState === 'Final Prompt' ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>COPIED TO CLIPBOARD</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>COPY PROMPT</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleExportPrompt()}
                              title="Download specification file"
                              className={`p-2.5 rounded-lg border transition-colors ${
                                isDark
                                  ? 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700'
                                  : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div
                          className={`mt-4 pt-3.5 border-t grid grid-cols-1 md:grid-cols-2 gap-4 text-xs ${
                            isDark ? 'border-slate-800/80' : 'border-slate-200'
                          }`}
                        >
                          <div>
                            <span className="font-semibold text-slate-400 block mb-1">Main Goal</span>
                            <p className={`leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                              {currentAnalysis.intentAnalysis.mainGoal}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-400 block mb-1">Intended Outcome</span>
                            <p className={`leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                              {currentAnalysis.intentAnalysis.actualIntendedOutcome}
                            </p>
                          </div>
                        </div>
                      </section>

                      {/* Workbench Tabs */}
                      <div
                        className={`flex items-center gap-1 p-1 rounded-lg border overflow-x-auto ${
                          isDark ? 'bg-[#111827] border-slate-800' : 'bg-slate-100 border-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setAnalysisTab('prompt')}
                          className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                            analysisTab === 'prompt' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Final Prompt
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnalysisTab('requirements')}
                          className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                            analysisTab === 'requirements' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Requirements ({currentAnalysis.extractedRequirements.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnalysisTab('intent')}
                          className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                            analysisTab === 'intent' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Intent Analysis
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnalysisTab('tech_audit')}
                          className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                            analysisTab === 'tech_audit' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Tech Stack & Quality Audit
                        </button>
                      </div>

                      {analysisTab === 'prompt' && (
                        <section
                          className={`rounded-xl border overflow-hidden ${
                            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div
                            className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2 ${
                              isDark ? 'bg-[#0E131F] border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <span className="font-semibold text-xs text-slate-200">Copy-Paste Ready Prompt</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setIsEditingPromptText(!isEditingPromptText)}
                                className="px-2.5 py-1 rounded border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-1.5"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{isEditingPromptText ? 'Done' : 'Edit'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyPrompt()}
                                className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                              >
                                Copy Prompt
                              </button>
                            </div>
                          </div>

                          {isEditingPromptText ? (
                            <div className="p-4">
                              <textarea
                                rows={20}
                                value={editableFinalPrompt}
                                onChange={(e) => setEditableFinalPrompt(e.target.value)}
                                className={`w-full rounded-lg border p-4 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                                  isDark ? 'bg-[#0B0F17] border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                                }`}
                              />
                            </div>
                          ) : (
                            <pre
                              className={`p-5 font-mono text-xs lg:text-[13px] leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-[600px] overflow-y-auto ${
                                isDark ? 'text-slate-200 bg-[#0B0F17]/60' : 'text-slate-800 bg-white'
                              }`}
                            >
                              {editableFinalPrompt}
                            </pre>
                          )}
                        </section>
                      )}

                      {analysisTab === 'requirements' && (
                        <section
                          className={`rounded-xl border p-4 lg:p-5 space-y-4 ${
                            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                          }`}
                        >
                          <h3 className="text-sm font-semibold">Extracted Requirements & Classification</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-800 text-slate-400">
                                  <th className="py-2 pr-3">Origin</th>
                                  <th className="py-2 px-3">Classification</th>
                                  <th className="py-2 px-3">Requirement</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {currentAnalysis.extractedRequirements.map((req, idx) => (
                                  <tr key={req.id || idx}>
                                    <td className="py-2.5 pr-3 font-mono text-[11px] font-semibold text-sky-400">
                                      {req.origin}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-300">{req.classification}</td>
                                    <td className="py-2.5 px-3">{req.statement}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </section>
                      )}

                      {analysisTab === 'intent' && (
                        <section
                          className={`rounded-xl border p-4 lg:p-5 space-y-4 ${
                            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                          }`}
                        >
                          <h3 className="text-sm font-semibold">Intent Analysis Decomposition</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-lg border border-slate-800 bg-[#0B0F17]">
                              <span className="text-slate-400 block mb-1">Target Users</span>
                              <p>{currentAnalysis.intentAnalysis.targetUsers}</p>
                            </div>
                            <div className="p-3 rounded-lg border border-slate-800 bg-[#0B0F17]">
                              <span className="text-slate-400 block mb-1">Platform</span>
                              <p>{currentAnalysis.intentAnalysis.platform}</p>
                            </div>
                            <div className="p-3 rounded-lg border border-slate-800 bg-[#0B0F17]">
                              <span className="text-slate-400 block mb-1">Backend</span>
                              <p>{currentAnalysis.intentAnalysis.backendRequirements}</p>
                            </div>
                            <div className="p-3 rounded-lg border border-slate-800 bg-[#0B0F17]">
                              <span className="text-slate-400 block mb-1">Database</span>
                              <p>{currentAnalysis.intentAnalysis.databaseRequirements}</p>
                            </div>
                          </div>
                        </section>
                      )}

                      {analysisTab === 'tech_audit' && (
                        <section
                          className={`rounded-xl border p-4 lg:p-5 space-y-4 ${
                            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-semibold">Quality Audit Summary</h3>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {currentAnalysis.qualityAudit.summary}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {currentAnalysis.qualityAudit.checks.map((c, i) => (
                              <div key={i} className="p-2.5 rounded border border-slate-800 bg-[#0B0F17] flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <div>
                                  <div className="font-medium">{c.criterion}</div>
                                  <div className="text-[11px] text-slate-400">{c.notes}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 2: HISTORY                                                   */}
          {/* ================================================================= */}
          {activeView === 'history' && (
            <div className="max-w-[1280px] mx-auto p-4 lg:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Prompt History & Version Repository</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage all saved specifications, search, rename, and duplicate.
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search saved prompts..."
                    className={`pl-9 pr-3 py-2 rounded-lg border text-xs w-64 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
                        {renderEngineIcon(item.primaryEngine)}
                        <span>{item.detectedCategories.join(' · ')}</span>
                      </div>
                      <h3 className="text-base font-bold mt-1">{item.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">"{item.rawInput}"</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectSavedPrompt(item)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                      >
                        Open in Studio
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicatePrompt(item.id)}
                        title="Duplicate"
                        className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300"
                      >
                        <CopyPlus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePrompt(item.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 3: ENGINES                                                   */}
          {/* ================================================================= */}
          {activeView === 'engines' && (
            <div className="max-w-[1280px] mx-auto p-4 lg:p-6 space-y-6">
              <div className="pb-4 border-b border-slate-800/60">
                <h1 className="text-xl font-bold tracking-tight">Prompt Engines Reference</h1>
                <p className="text-xs text-slate-400 mt-1">
                  PromptForge AI provides specialized prompt generation engines for websites, code, images, videos, agents, and writing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    engine: 'Website',
                    title: 'Website & SaaS Engine',
                    desc: 'Mandates full working functionality, pro-design sections, and open-source stacks.'
                  },
                  {
                    engine: 'Coding',
                    title: 'Software & Coding Engine',
                    desc: 'Produces 20-point technical specs covering data structures, edge cases, and unit tests.'
                  },
                  {
                    engine: 'Image',
                    title: 'Image Prompt Engine',
                    desc: 'Specifies composition, lighting, camera angles, and strictly preserves negative facial constraints.'
                  },
                  {
                    engine: 'Video',
                    title: 'Video Prompt Engine',
                    desc: 'Structures camera choreography, motion pacing, sound effects, and transitions.'
                  },
                  {
                    engine: 'AI_Agent',
                    title: 'AI Agent Prompt Engine',
                    desc: 'Defines tools, inputs, outputs, failure modes, and execution safety guardrails.'
                  },
                  {
                    engine: 'Writing',
                    title: 'Writing & Docs Engine',
                    desc: 'Tailors tone, structure, and quantitative proof for launch copy and RFCs.'
                  }
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-xl border p-5 ${
                      isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {renderEngineIcon(item.engine)}
                      <h3 className="text-base font-bold">{item.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 4: SETTINGS (Includes Dedicated Theme Settings Section)       */}
          {/* ================================================================= */}
          {activeView === 'settings' && (
            <div className="max-w-3xl mx-auto p-4 lg:p-6 space-y-6">
              <div className="pb-4 border-b border-slate-800/60">
                <h1 className="text-xl font-bold tracking-tight">Workspace & Prompt Compiler Settings</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Configure visual appearance, theme modes, prompt compilation depth, and account profile.
                </p>
              </div>

              {/* DEDICATED THEME SETTINGS SECTION */}
              <section
                className={`rounded-xl border p-5 space-y-4 ${
                  isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Theme & Visual Appearance</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Choose how PromptForge AI looks. You can force Dark mode, force Light mode, or follow your operating system preferences automatically.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded border border-sky-500/40 text-sky-400 bg-sky-500/10">
                    Active: {effectiveTheme.toUpperCase()}
                  </span>
                </div>

                {/* 3 Theme Options Cards (Force Dark, Force Light, Match System) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Option 1: Force Dark Mode */}
                  <button
                    type="button"
                    onClick={() => handleUpdateTheme('dark')}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      themePreference === 'dark'
                        ? 'border-sky-500 ring-2 ring-sky-500/30 bg-sky-950/20'
                        : isDark
                          ? 'border-slate-800 bg-[#0B0F17] hover:border-slate-700'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                          <Moon className="w-5 h-5" />
                        </div>
                        {themePreference === 'dark' && (
                          <CheckCircle2 className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                      <div className="text-xs font-bold">Dark Mode</div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                        Forced dark palette (#0B0F17) with high-contrast slate surfaces.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-mono text-slate-500">
                      Independent of OS
                    </div>
                  </button>

                  {/* Option 2: Force Light Mode */}
                  <button
                    type="button"
                    onClick={() => handleUpdateTheme('light')}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      themePreference === 'light'
                        ? 'border-sky-500 ring-2 ring-sky-500/30 bg-sky-50'
                        : isDark
                          ? 'border-slate-800 bg-[#0B0F17] hover:border-slate-700'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                          <Sun className="w-5 h-5" />
                        </div>
                        {themePreference === 'light' && (
                          <CheckCircle2 className="w-4 h-4 text-sky-600" />
                        )}
                      </div>
                      <div className="text-xs font-bold">Light Mode</div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        Forced clean editorial white (#FFFFFF) with crisp border contrast.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-mono text-slate-400">
                      Independent of OS
                    </div>
                  </button>

                  {/* Option 3: System Match */}
                  <button
                    type="button"
                    onClick={() => handleUpdateTheme('system')}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      themePreference === 'system'
                        ? 'border-sky-500 ring-2 ring-sky-500/30 bg-sky-950/20'
                        : isDark
                          ? 'border-slate-800 bg-[#0B0F17] hover:border-slate-700'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                          <Laptop className="w-5 h-5" />
                        </div>
                        {themePreference === 'system' && (
                          <CheckCircle2 className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                      <div className="text-xs font-bold">Match System</div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                        Dynamically mirrors OS preference (currently: {systemPrefersDark ? 'Dark' : 'Light'}).
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-mono text-slate-500">
                      Dynamic auto-switch
                    </div>
                  </button>
                </div>
              </section>

              {/* General Compiler Settings Section */}
              <section
                className={`rounded-xl border p-5 space-y-5 ${
                  isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <h2 className="text-sm font-semibold">Compiler Defaults & Rule Enforcement</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Default Prompt Mode</label>
                    <select
                      value={settings.defaultMode}
                      onChange={(e) => handleSaveSettings({ defaultMode: e.target.value as PromptMode })}
                      className={`w-full rounded-lg border px-3 py-2 text-xs ${
                        isDark ? 'bg-[#0B0F17] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="Quick">Quick (Concise & Direct)</option>
                      <option value="Standard">Standard (Balanced)</option>
                      <option value="Professional">Professional (Full Implementation)</option>
                      <option value="Expert">Expert (Deep Architecture, Security & Testing)</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Preferred Export Format</label>
                    <select
                      value={settings.preferredExportFormat}
                      onChange={(e) =>
                        handleSaveSettings({
                          preferredExportFormat: e.target.value as 'markdown' | 'json' | 'text'
                        })
                      }
                      className={`w-full rounded-lg border px-3 py-2 text-xs ${
                        isDark ? 'bg-[#0B0F17] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="markdown">Markdown (.md)</option>
                      <option value="json">Structured JSON (.json)</option>
                      <option value="text">Plain Text (.txt)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800/60">
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <div>
                      <div className="text-xs font-semibold">Enforce Working Website Functionality Rule</div>
                      <div className="text-[11px] text-slate-400">
                        Automatically require every website prompt to prohibit static prototypes.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.alwaysEnforceWorkingCodeRule}
                      onChange={(e) => handleSaveSettings({ alwaysEnforceWorkingCodeRule: e.target.checked })}
                      className="w-4 h-4 accent-sky-500"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <div>
                      <div className="text-xs font-semibold">Strict Requirement vs. Assumption Separation</div>
                      <div className="text-[11px] text-slate-400">
                        Always separate explicit user requests from AI recommendations and assumptions.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.strictAssumptionSeparation}
                      onChange={(e) => handleSaveSettings({ strictAssumptionSeparation: e.target.checked })}
                      className="w-4 h-4 accent-sky-500"
                    />
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <label className="block text-xs font-semibold mb-1.5">
                    Standing Custom System Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={settings.customSystemRules}
                    onChange={(e) => setSettings({ ...settings, customSystemRules: e.target.value })}
                    className={`w-full rounded-lg border p-3 text-xs ${
                      isDark ? 'bg-[#0B0F17] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveSettings({ customSystemRules: settings.customSystemRules });
                      triggerToast('Standing instructions saved');
                    }}
                    className="mt-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
                  >
                    Save Standing Instructions
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
        >
          <div
            className={`w-full max-w-md rounded-xl border p-6 shadow-xl ${
              isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">
                {user ? 'Workspace Account & Session' : authMode === 'login' ? 'Sign In' : 'Register Account'}
              </h2>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {user && (
              <div className={`mb-5 p-3.5 rounded-lg border text-xs ${isDark ? 'bg-[#0B0F17] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="font-semibold text-sky-400">Active Authenticated Session</div>
                <div className="mt-1"><strong>Name:</strong> {user.name}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Role:</strong> {user.role}</div>
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                  authMode === 'login' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                  authMode === 'register' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="mb-3 p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      isDark ? 'bg-[#0B0F17] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 ${
                    isDark ? 'bg-[#0B0F17] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 ${
                    isDark ? 'bg-[#0B0F17] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors"
              >
                {authLoading ? 'Authenticating...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
