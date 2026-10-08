import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ShapModal } from './components/ShapModal';
import { ObservationModal } from './components/ObservationModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AuthModal } from './components/AuthModal';

import { OverviewHeroView } from './views/OverviewHeroView';
import { SymptomAnalyzerView } from './views/SymptomAnalyzerView';
import { ResultsView } from './views/ResultsView';
import { HealthJourneyView } from './views/HealthJourneyView';
import { MLArchitectureView } from './views/MLArchitectureView';

import {
  Symptom,
  SymptomInput,
  AnalysisContext,
  AnalysisResponse,
  Observation,
  User,
} from './types';

import {
  fetchSymptoms,
  runSymptomAnalysis,
  fetchObservations,
  fetchAnalysisHistory,
  getCurrentUser,
  logoutUser,
  exportClinicalSummary,
} from './services/api';

// 48 Standardized Symptoms Fallback Catalog
const INITIAL_FALLBACK_SYMPTOMS: Symptom[] = [
  { id: '1', code: 'RESP_COUGH_DRY', name: 'Persistent Dry Cough', category: 'Respiratory', anatomical_region: 'chest', default_severity: 6, is_red_flag: false },
  { id: '2', code: 'RESP_COUGH_PROD', name: 'Productive Cough with Phlegm', category: 'Respiratory', anatomical_region: 'chest', default_severity: 5, is_red_flag: false },
  { id: '3', code: 'RESP_SOB', name: 'Shortness of Breath on Exertion', category: 'Respiratory', anatomical_region: 'chest', default_severity: 7, is_red_flag: false },
  { id: '4', code: 'RESP_SOB_REST', name: 'Shortness of Breath at Rest', category: 'Respiratory', anatomical_region: 'chest', default_severity: 9, is_red_flag: true },
  { id: '5', code: 'RESP_WHEEZING', name: 'Expiratory Wheezing', category: 'Respiratory', anatomical_region: 'chest', default_severity: 6, is_red_flag: false },
  { id: '6', code: 'RESP_CHEST_TIGHT', name: 'Chest Tightness / Constriction', category: 'Respiratory', anatomical_region: 'chest', default_severity: 6, is_red_flag: false },
  { id: '7', code: 'RESP_CHEST_PAIN_PLEUR', name: 'Sharp Pleuritic Chest Pain', category: 'Respiratory', anatomical_region: 'chest', default_severity: 8, is_red_flag: true },
  { id: '8', code: 'RESP_SORE_THROAT', name: 'Sore Pharynx / Odynophagia', category: 'Respiratory', anatomical_region: 'head', default_severity: 4, is_red_flag: false },
  { id: '9', code: 'RESP_NASAL_CONG', name: 'Nasal Congestion / Obstruction', category: 'Respiratory', anatomical_region: 'head', default_severity: 4, is_red_flag: false },
  { id: '10', code: 'RESP_RHINORRHEA', name: 'Clear Rhinorrhea / Runny Nose', category: 'Respiratory', anatomical_region: 'head', default_severity: 3, is_red_flag: false },
  { id: '11', code: 'RESP_SNEEZING', name: 'Paroxysmal Sneezing', category: 'Respiratory', anatomical_region: 'head', default_severity: 3, is_red_flag: false },
  { id: '12', code: 'RESP_HEMOPTYSIS', name: 'Hemoptysis (Coughing Blood)', category: 'Respiratory', anatomical_region: 'chest', default_severity: 10, is_red_flag: true },
  { id: '13', code: 'CARD_CHEST_PAIN_PRESS', name: 'Substernal Pressure / Squeezing', category: 'Cardiovascular', anatomical_region: 'chest', default_severity: 9, is_red_flag: true },
  { id: '14', code: 'CARD_CHEST_PAIN_RAD', name: 'Chest Pain Radiating to Left Arm/Jaw', category: 'Cardiovascular', anatomical_region: 'chest', default_severity: 10, is_red_flag: true },
  { id: '15', code: 'CARD_PALPITATIONS', name: 'Cardiac Palpitations / Tachycardia', category: 'Cardiovascular', anatomical_region: 'chest', default_severity: 6, is_red_flag: false },
  { id: '16', code: 'CARD_SYNCOPE', name: 'Syncope (Loss of Consciousness)', category: 'Cardiovascular', anatomical_region: 'general', default_severity: 9, is_red_flag: true },
  { id: '17', code: 'CARD_DIZZINESS', name: 'Postural Dizziness / Lightheadedness', category: 'Cardiovascular', anatomical_region: 'head', default_severity: 5, is_red_flag: false },
  { id: '18', code: 'CARD_EDEMA_ANKLE', name: 'Bilateral Ankle / Pedal Edema', category: 'Cardiovascular', anatomical_region: 'limbs', default_severity: 5, is_red_flag: false },
  { id: '19', code: 'NEURO_HEADACHE_TENS', name: 'Bilateral Band-like Tension Headache', category: 'Neurological', anatomical_region: 'head', default_severity: 5, is_red_flag: false },
  { id: '20', code: 'NEURO_HEADACHE_THROB', name: 'Unilateral Throbbing Headache', category: 'Neurological', anatomical_region: 'head', default_severity: 7, is_red_flag: false },
  { id: '21', code: 'NEURO_HEADACHE_THUNDER', name: 'Thunderclap Headache (Worst Ever)', category: 'Neurological', anatomical_region: 'head', default_severity: 10, is_red_flag: true },
  { id: '22', code: 'NEURO_PHOTOPHOBIA', name: 'Photophobia & Visual Hyperreactivity', category: 'Neurological', anatomical_region: 'head', default_severity: 6, is_red_flag: false },
  { id: '23', code: 'NEURO_PHONOPHOBIA', name: 'Phonophobia / Auditory Sensitivity', category: 'Neurological', anatomical_region: 'head', default_severity: 5, is_red_flag: false },
  { id: '24', code: 'NEURO_AURA', name: 'Visual Scintillating Aura', category: 'Neurological', anatomical_region: 'head', default_severity: 6, is_red_flag: false },
  { id: '25', code: 'NEURO_VERTIGO', name: 'True Rotational Vertigo', category: 'Neurological', anatomical_region: 'head', default_severity: 6, is_red_flag: false },
  { id: '26', code: 'NEURO_ANOSMIA', name: 'Anosmia (Loss of Smell)', category: 'Neurological', anatomical_region: 'head', default_severity: 4, is_red_flag: false },
  { id: '27', code: 'NEURO_AGEUSIA', name: 'Ageusia (Loss of Taste)', category: 'Neurological', anatomical_region: 'head', default_severity: 4, is_red_flag: false },
  { id: '28', code: 'NEURO_WEAKNESS_FACIAL', name: 'Sudden Unilateral Facial Droop', category: 'Neurological', anatomical_region: 'head', default_severity: 10, is_red_flag: true },
  { id: '29', code: 'NEURO_WEAKNESS_ARM', name: 'Sudden Unilateral Arm / Leg Weakness', category: 'Neurological', anatomical_region: 'limbs', default_severity: 10, is_red_flag: true },
  { id: '30', code: 'NEURO_SPEECH_DIFF', name: 'Dysarthria / Slurred Speech', category: 'Neurological', anatomical_region: 'head', default_severity: 10, is_red_flag: true },
  { id: '31', code: 'NEURO_CONFUSION', name: 'Acute Cognitive Confusion / Delirium', category: 'Neurological', anatomical_region: 'head', default_severity: 9, is_red_flag: true },
  { id: '32', code: 'NEURO_NECK_STIFF', name: 'Nuchal Rigidity (Stiff Neck with Fever)', category: 'Neurological', anatomical_region: 'head', default_severity: 10, is_red_flag: true },
  { id: '33', code: 'GI_NAUSEA', name: 'Nausea & Gastric Sickness', category: 'Gastrointestinal', anatomical_region: 'abdomen', default_severity: 4, is_red_flag: false },
  { id: '34', code: 'GI_VOMITING', name: 'Vomiting / Emesis', category: 'Gastrointestinal', anatomical_region: 'abdomen', default_severity: 6, is_red_flag: false },
  { id: '35', code: 'GI_DIARRHEA', name: 'Watery Diarrheal Stools', category: 'Gastrointestinal', anatomical_region: 'abdomen', default_severity: 5, is_red_flag: false },
  { id: '36', code: 'GI_ABDO_PAIN_CRAMP', name: 'Diffuse Abdominal Cramping', category: 'Gastrointestinal', anatomical_region: 'abdomen', default_severity: 5, is_red_flag: false },
  { id: '37', code: 'GI_ABDO_PAIN_RLQ', name: 'Localized Severe Right Lower Quadrant Pain', category: 'Gastrointestinal', anatomical_region: 'abdomen', default_severity: 9, is_red_flag: true },
  { id: '38', code: 'GI_HEARTBURN', name: 'Retrosternal Pyrosis (Heartburn / Reflux)', category: 'Gastrointestinal', anatomical_region: 'chest', default_severity: 4, is_red_flag: false },
  { id: '39', code: 'SYS_FEVER_LOW', name: 'Low-Grade Pyrexia (37.8°C - 38.4°C)', category: 'Systemic', anatomical_region: 'general', default_severity: 4, is_red_flag: false },
  { id: '40', code: 'SYS_FEVER_HIGH', name: 'High Pyrexia (>38.5°C)', category: 'Systemic', anatomical_region: 'general', default_severity: 7, is_red_flag: false },
  { id: '41', code: 'SYS_CHILLS', name: 'Chills & Rigors', category: 'Systemic', anatomical_region: 'general', default_severity: 5, is_red_flag: false },
  { id: '42', code: 'SYS_NIGHT_SWEATS', name: 'Profuse Nocturnal Diaphoresis', category: 'Systemic', anatomical_region: 'general', default_severity: 6, is_red_flag: false },
  { id: '43', code: 'SYS_FATIGUE', name: 'Generalized Physical Fatigue & Malaise', category: 'Systemic', anatomical_region: 'general', default_severity: 5, is_red_flag: false },
  { id: '44', code: 'SYS_MYALGIA', name: 'Generalized Muscle Aches / Myalgia', category: 'Systemic', anatomical_region: 'general', default_severity: 5, is_red_flag: false },
  { id: '45', code: 'MSK_ARTHRALGIA', name: 'Polyarticular Joint Pain / Stiffness', category: 'Musculoskeletal', anatomical_region: 'joints', default_severity: 5, is_red_flag: false },
  { id: '46', code: 'MSK_JOINT_SWELLING', name: 'Erythematous Joint Swelling', category: 'Musculoskeletal', anatomical_region: 'joints', default_severity: 6, is_red_flag: false },
  { id: '47', code: 'DERM_RASH', name: 'Maculopapular Skin Rash / Exanthem', category: 'Dermatological', anatomical_region: 'general', default_severity: 5, is_red_flag: false },
  { id: '48', code: 'DERM_CYANOSIS', name: 'Peripheral Cyanosis (Bluish Lips/Nails)', category: 'Dermatological', anatomical_region: 'general', default_severity: 10, is_red_flag: true },
];

export const App: React.FC = () => {
  // Navigation
  const [currentPath, setCurrentPath] = useState<string>('overview-hero');

  // Auth & Theme
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(true);

  // Modals & Drawers
  const [isShapModalOpen, setIsShapModalOpen] = useState<boolean>(false);
  const [isObservationModalOpen, setIsObservationModalOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);

  // Analysis State
  const [availableSymptoms, setAvailableSymptoms] = useState<Symptom[]>(INITIAL_FALLBACK_SYMPTOMS);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomInput[]>([
    { id: '1', name: 'Persistent Dry Cough', severity: 6, duration: 4 },
    { id: '39', name: 'Low-Grade Pyrexia (37.8°C - 38.4°C)', severity: 5, duration: 2 },
    { id: '43', name: 'Generalized Physical Fatigue & Malaise', severity: 5, duration: 5 },
    { id: '6', name: 'Chest Tightness / Constriction', severity: 4, duration: 1 },
  ]);

  const [context, setContext] = useState<AnalysisContext>({
    onset: 'Gradual (3 - 5 days)',
    progression: 'Slowly worsening',
    triggers: ['Cold air', 'Physical exertion'],
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [historySessions, setHistorySessions] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Initial Load from API
  useEffect(() => {
    // 1. Current user
    getCurrentUser().then(u => {
      if (u) setUser(u);
    });

    // 2. Fetch Symptoms catalog from backend
    fetchSymptoms()
      .then(syms => {
        if (syms && syms.length > 0) {
          setAvailableSymptoms(syms);
        }
      })
      .catch(() => {
        // Fallback to initial static taxonomy if backend is still spinning up
      });

    // 3. Fetch Observations
    fetchObservations()
      .then(obs => {
        if (obs && obs.length > 0) setObservations(obs);
      })
      .catch(() => {});

    // 4. Fetch History Sessions
    fetchAnalysisHistory()
      .then(hist => {
        if (hist && hist.length > 0) setHistorySessions(hist);
      })
      .catch(() => {});
  }, []);

  // Navigation Handler
  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Symptom Queue Operations
  const handleAddSymptom = (symptom: SymptomInput) => {
    setSelectedSymptoms(prev => {
      if (prev.some(s => s.id === symptom.id)) return prev;
      return [...prev, symptom];
    });
    showToast(`Added ${symptom.name || 'symptom'} to diagnostic queue`);
  };

  const handleRemoveSymptom = (id: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateSymptomSeverity = (id: string, severity: number) => {
    setSelectedSymptoms(prev =>
      prev.map(s => (s.id === id ? { ...s, severity } : s))
    );
  };

  const handleClearSymptoms = () => {
    setSelectedSymptoms([]);
    showToast('Symptom queue cleared');
  };

  const handleUpdateContext = (updates: Partial<AnalysisContext>) => {
    setContext(prev => ({ ...prev, ...updates }));
  };

  // Run ML Probability Analysis
  const handleRunAnalysis = async () => {
    if (selectedSymptoms.length === 0) return;

    setIsAnalyzing(true);
    try {
      const res = await runSymptomAnalysis(selectedSymptoms, context);
      setAnalysisResult(res);
      setIsAnalyzing(false);
      handleNavigate('results-probabilities');
      showToast(`Analysis Computed: ${res.primary_condition} (${Math.round(res.primary_probability)}%)`);

      // Refresh history list
      fetchAnalysisHistory()
        .then(hist => setHistorySessions(hist))
        .catch(() => {});
    } catch (err: any) {
      setIsAnalyzing(false);
      showToast(err.message || 'Error running analysis');
    }
  };

  // Handle Select Session from History Drawer
  const handleSelectSession = (sessionId: string) => {
    showToast(`Restoring Diagnostic Episode #${sessionId.slice(0, 12)}`);
    handleNavigate('results-probabilities');
  };

  // Observation Added
  const handleObservationAdded = (newObs: Observation) => {
    setObservations(prev => [...prev, newObs]);
    showToast(`Day ${newObs.day_number} observation committed to telemetry ledger`);
  };

  // Export Clinical Summary
  const handleExportSummary = async () => {
    try {
      showToast('Compiling HL7/FHIR Clinical PDF dossier...');
      await exportClinicalSummary();
      setTimeout(() => {
        window.print();
      }, 500);
    } catch {
      window.print();
    }
  };

  // Logout
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    showToast('Logged out of clinician enclave');
  };

  return (
    <div className={`min-h-screen bg-background font-body-md text-on-surface antialiased ${isDark ? 'dark' : ''}`}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container-high border border-primary/40 text-on-surface shadow-2xl backdrop-blur-xl animate-bounce">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
          <span className="font-body-sm text-body-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentPath={currentPath}
        onNavigate={handleNavigate}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main View Router */}
      <main className="w-full pt-20 bg-background min-h-screen">
        {currentPath === 'overview-hero' && (
          <OverviewHeroView onNavigate={handleNavigate} />
        )}

        {currentPath === 'symptom-analyzer' && (
          <SymptomAnalyzerView
            availableSymptoms={availableSymptoms}
            selectedSymptoms={selectedSymptoms}
            onAddSymptom={handleAddSymptom}
            onRemoveSymptom={handleRemoveSymptom}
            onUpdateSymptomSeverity={handleUpdateSymptomSeverity}
            onClearSymptoms={handleClearSymptoms}
            context={context}
            onUpdateContext={handleUpdateContext}
            onRunAnalysis={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
          />
        )}

        {currentPath === 'results-probabilities' && (
          <ResultsView
            analysisResult={analysisResult}
            onOpenShapModal={() => setIsShapModalOpen(true)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPath === 'health-journey-trends' && (
          <HealthJourneyView
            observations={observations}
            onOpenObservationModal={() => setIsObservationModalOpen(true)}
            onOpenHistoryDrawer={() => setIsHistoryDrawerOpen(true)}
            onExportReport={handleExportSummary}
            currentEpisodeId={analysisResult?.session_id ? analysisResult.session_id.slice(0, 12) : undefined}
          />
        )}

        {currentPath === 'ml-architecture' && (
          <MLArchitectureView />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* SHAP Studio Modal */}
      <ShapModal
        isOpen={isShapModalOpen}
        onClose={() => setIsShapModalOpen(false)}
        prediction={analysisResult ? analysisResult.predictions[0] : null}
        baseValue={analysisResult ? analysisResult.base_value : 0.18}
      />

      {/* Observation Entry Modal */}
      <ObservationModal
        isOpen={isObservationModalOpen}
        onClose={() => setIsObservationModalOpen(false)}
        onObservationAdded={handleObservationAdded}
        currentDayCount={observations.length + 1}
      />

      {/* Historical Sessions Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        sessions={historySessions}
        onSelectSession={handleSelectSession}
      />

      {/* Clinician Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={u => {
          setUser(u);
          showToast(`Authenticated as ${u.username}`);
        }}
      />
    </div>
  );
};

export default App;
