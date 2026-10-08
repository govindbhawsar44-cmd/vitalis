import React, { useState, useMemo } from 'react';
import { Symptom, SymptomInput, AnalysisContext } from '../types';
import { BodyMap3D } from '../components/BodyMap3D';

interface SymptomAnalyzerViewProps {
  availableSymptoms: Symptom[];
  selectedSymptoms: SymptomInput[];
  onAddSymptom: (symptom: SymptomInput) => void;
  onRemoveSymptom: (id: string) => void;
  onUpdateSymptomSeverity: (id: string, severity: number) => void;
  onClearSymptoms: () => void;
  context: AnalysisContext;
  onUpdateContext: (updates: Partial<AnalysisContext>) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

const PHYSIOLOGICAL_SYSTEMS = [
  { id: 'all', name: 'All Physiological Systems', icon: 'grid_view', region: 'all' },
  { id: 'respiratory', name: 'Pulmonology & Airway', icon: 'air', region: 'chest' },
  { id: 'cranial', name: 'Cranial & Neurological', icon: 'psychology', region: 'head' },
  { id: 'gastrointestinal', name: 'Gastrointestinal & Hepatic', icon: 'nutrition', region: 'abdomen' },
  { id: 'musculoskeletal', name: 'Musculoskeletal & Articular', icon: 'accessibility_new', region: 'joints' },
  { id: 'systemic', name: 'Systemic & Thermal', icon: 'thermostat', region: 'general' },
];

const COMMON_TAGS = [
  { name: 'Wheezing', code: 'RESP_WHEEZING' },
  { name: 'Sputum', code: 'RESP_SPUTUM_PROD' },
  { name: 'Chills', code: 'SYS_CHILLS' },
  { name: 'Anosmia', code: 'NEURO_ANOSMIA' },
  { name: 'Headache', code: 'NEURO_HEADACHE' },
  { name: 'Fatigue', code: 'SYS_FATIGUE' },
];

export const SymptomAnalyzerView: React.FC<SymptomAnalyzerViewProps> = ({
  availableSymptoms,
  selectedSymptoms,
  onAddSymptom,
  onRemoveSymptom,
  onUpdateSymptomSeverity,
  onClearSymptoms,
  context,
  onUpdateContext,
  onRunAnalysis,
  isAnalyzing,
}) => {
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [activeRegion, setActiveRegion] = useState<string>('chest');
  const [viewAngle, setViewAngle] = useState<'anterior' | 'posterior'>('anterior');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOverlay, setShowOverlay] = useState<boolean>(true);

  // Compute active symptoms count per physiological tier
  const systemCounts = useMemo(() => {
    const counts: { [key: string]: number } = {
      all: availableSymptoms.length,
      respiratory: 0,
      cranial: 0,
      gastrointestinal: 0,
      musculoskeletal: 0,
      systemic: 0,
    };

    selectedSymptoms.forEach(s => {
      const full = availableSymptoms.find(item => item.id === s.id);
      if (!full) return;
      const cat = (full.category || '').toLowerCase();
      const region = (full.anatomical_region || '').toLowerCase();

      if (cat.includes('resp') || region.includes('chest')) counts.respiratory++;
      else if (cat.includes('cranial') || cat.includes('neuro') || region.includes('head')) counts.cranial++;
      else if (cat.includes('gastro') || region.includes('abdomen')) counts.gastrointestinal++;
      else if (cat.includes('musculo') || region.includes('joints') || region.includes('limbs')) counts.musculoskeletal++;
      else counts.systemic++;
    });

    return counts;
  }, [availableSymptoms, selectedSymptoms]);

  // Filtered symptoms based on system selection and search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return availableSymptoms
      .filter(s => s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query))
      .slice(0, 6);
  }, [availableSymptoms, searchQuery]);

  // Handle region select from 3D model
  const handleRegionSelect = (regionId: string) => {
    setActiveRegion(regionId);
    if (regionId === 'head') setSelectedSystem('cranial');
    else if (regionId === 'chest') setSelectedSystem('respiratory');
    else if (regionId === 'abdomen') setSelectedSystem('gastrointestinal');
    else if (regionId === 'joints') setSelectedSystem('musculoskeletal');
    else setSelectedSystem('all');
  };

  // Quick add tag
  const handleQuickAdd = (tagName: string) => {
    const found = availableSymptoms.find(
      s => s.name.toLowerCase().includes(tagName.toLowerCase())
    );
    if (found) {
      const already = selectedSymptoms.some(s => s.id === found.id);
      if (!already) {
        onAddSymptom({
          id: found.id,
          name: found.name,
          severity: found.default_severity || 5,
          duration: 3,
        });
      }
    }
  };

  // Add from search
  const handleAddSearchResult = (symptom: Symptom) => {
    const already = selectedSymptoms.some(s => s.id === symptom.id);
    if (!already) {
      onAddSymptom({
        id: symptom.id,
        name: symptom.name,
        severity: symptom.default_severity || 5,
        duration: 3,
      });
    }
    setSearchQuery('');
  };

  // Compute aggregate confidence
  const aggregateConfidence = useMemo(() => {
    if (selectedSymptoms.length === 0) return 0;
    const base = 40;
    const increment = selectedSymptoms.length * 12;
    return Math.min(96, base + increment);
  }, [selectedSymptoms.length]);

  // Distinct biological systems
  const activeSystemsCount = useMemo(() => {
    let count = 0;
    if (systemCounts.respiratory > 0) count++;
    if (systemCounts.cranial > 0) count++;
    if (systemCounts.gastrointestinal > 0) count++;
    if (systemCounts.musculoskeletal > 0) count++;
    if (systemCounts.systemic > 0) count++;
    return Math.max(count, selectedSymptoms.length > 0 ? 1 : 0);
  }, [systemCounts, selectedSymptoms.length]);

  // Toggle trigger in context
  const handleToggleTrigger = (trigger: string) => {
    const current = context.triggers || [];
    if (current.includes(trigger)) {
      onUpdateContext({ triggers: current.filter(t => t !== trigger) });
    } else {
      onUpdateContext({ triggers: [...current, trigger] });
    }
  };

  return (
    <div className="w-full px-margin-desktop py-space-lg bg-background">
      {/* Breadcrumb & Workspace Metadata Header */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md bg-surface-container-low p-space-sm rounded-xl shadow-sm border border-outline-variant/20">
        <div className="flex items-center gap-space-xs text-outline">
          <span className="font-code-md text-code-md text-primary font-medium tracking-wide">WORKSPACE //</span>
          <span className="font-body-sm text-body-sm text-on-surface font-medium">Diagnostic Triangulation & Systemic Mapping</span>
          <span className="text-outline-variant">•</span>
          <span className="font-code-md text-code-md text-outline">LATENCY: 18ms</span>
        </div>
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-2xs bg-surface-container px-space-xs py-space-2xs rounded-lg shadow-sm border border-outline-variant/20">
            <span className="material-symbols-outlined text-[15px] text-primary">memory</span>
            <span className="font-code-md text-code-md text-on-surface-variant">ENGINE: HYBRID-BAYES-v4</span>
          </div>
          <div className="flex items-center gap-space-2xs bg-surface-container px-space-xs py-space-2xs rounded-lg shadow-sm border border-outline-variant/20">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            <span className="font-code-md text-code-md text-primary">BUFFER SYNCHRONIZED</span>
          </div>
        </div>
      </div>

      {/* 3-Column Diagnostic Workstation Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        
        {/* COLUMN 1: LEFT TELEMETRY & FILTERS (Col span 3) */}
        <div className="xl:col-span-3 flex flex-col gap-space-md">
          {/* Step Progress Indicator */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-sm border border-outline-variant/20">
            <div className="flex items-center justify-between pb-space-xs">
              <span className="font-label-caps text-label-caps text-outline tracking-wider">PROTOCOL PIPELINE</span>
              <span className="font-code-md text-code-md text-primary">PHASE 01/04</span>
            </div>
            <div className="flex flex-col gap-space-xs">
              {/* Step 01: Active */}
              <div className="flex items-center justify-between p-space-xs rounded-lg bg-primary-container/10 border border-primary/30 shadow-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-6 h-6 rounded bg-primary text-on-primary font-code-md text-code-md flex items-center justify-center font-bold">01</span>
                  <div className="flex flex-col">
                    <span className="font-headline-md text-body-md font-semibold text-primary">Select Symptoms</span>
                    <span className="font-label-sm text-label-sm text-outline">Body Region & Keywords</span>
                  </div>
                </div>
                <span className="px-space-2xs py-0.5 rounded bg-primary/10 text-primary font-label-caps text-label-caps tracking-widest shadow-sm">ACTIVE</span>
              </div>

              {/* Step 02: Pending */}
              <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-lowest text-outline border border-outline-variant/10">
                <div className="flex items-center gap-space-xs">
                  <span className="w-6 h-6 rounded bg-surface-container-high text-outline font-code-md text-code-md flex items-center justify-center">02</span>
                  <div className="flex flex-col">
                    <span className="font-body-md text-body-md font-medium text-on-surface-variant">Set Severity & Duration</span>
                    <span className="font-label-sm text-label-sm text-outline">Intensity Ratings</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline-variant">lock</span>
              </div>

              {/* Step 03: Pending */}
              <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-lowest text-outline border border-outline-variant/10">
                <div className="flex items-center gap-space-xs">
                  <span className="w-6 h-6 rounded bg-surface-container-high text-outline font-code-md text-code-md flex items-center justify-center">03</span>
                  <div className="flex flex-col">
                    <span className="font-body-md text-body-md font-medium text-on-surface-variant">AI Pattern Analysis</span>
                    <span className="font-label-sm text-label-sm text-outline">Machine Learning Model</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline-variant">lock</span>
              </div>

              {/* Step 04: Pending */}
              <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-lowest text-outline border border-outline-variant/10">
                <div className="flex items-center gap-space-xs">
                  <span className="w-6 h-6 rounded bg-surface-container-high text-outline font-code-md text-code-md flex items-center justify-center">04</span>
                  <div className="flex flex-col">
                    <span className="font-body-md text-body-md font-medium text-on-surface-variant">Health Insights & Guidance</span>
                    <span className="font-label-sm text-label-sm text-outline">Summary & Explanations</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline-variant">lock</span>
              </div>
            </div>
          </div>

          {/* Body System Filter Selector */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-xs border border-outline-variant/20">
            <div className="flex items-center justify-between pb-space-2xs">
              <span className="font-label-caps text-label-caps text-outline tracking-wider">BODY SYSTEM CATEGORIES</span>
              <span className="font-label-sm text-label-sm text-outline">FILTER</span>
            </div>
            <div className="flex flex-col gap-1.5" id="system-filter-list">
              {PHYSIOLOGICAL_SYSTEMS.map(sys => {
                const isActive = selectedSystem === sys.id;
                const activeCount = systemCounts[sys.id] || 0;

                return (
                  <button
                    key={sys.id}
                    onClick={() => {
                      setSelectedSystem(sys.id);
                      if (sys.region !== 'all') {
                        setActiveRegion(sys.region);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-space-xs py-space-xs rounded-lg transition-all text-left group ${
                      isActive
                        ? 'bg-surface-container-highest text-primary shadow-sm border border-primary/40'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="flex items-center gap-space-xs">
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          isActive ? 'text-primary' : 'text-outline group-hover:text-primary'
                        }`}
                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        {sys.icon}
                      </span>
                      <span className={`font-body-sm text-body-sm ${isActive ? 'font-semibold text-on-surface' : 'font-medium'}`}>
                        {sys.name}
                      </span>
                    </div>
                    {isActive && activeCount > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <span className="font-code-md text-code-md bg-primary/20 text-primary px-space-2xs rounded font-semibold">
                          {activeCount} Active
                        </span>
                      </div>
                    ) : (
                      <span className="font-code-md text-code-md bg-surface-container-high px-space-2xs rounded text-outline group-hover:text-on-surface">
                        {sys.id === 'all' ? availableSymptoms.length : activeCount > 0 ? `${activeCount} Active` : '0'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical Parameter Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col gap-space-sm border border-outline-variant/20">
            <div className="flex items-center justify-between border-b border-surface-container-highest pb-space-2xs">
              <span className="font-label-caps text-label-caps text-outline tracking-wider">HEALTH ANALYSIS SUMMARY</span>
              <span className="font-code-md text-code-md text-primary">ONLINE</span>
            </div>
            <div className="flex flex-col gap-space-xs">
              <div className="flex justify-between items-center py-1">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Model Validation Accuracy</span>
                <span className="font-code-md text-code-md text-primary font-semibold">92.9%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Symptom Catalog Size</span>
                <span className="font-code-md text-code-md text-secondary">48 Symptoms</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Condition Database</span>
                <span className="font-code-md text-code-md text-outline">30 Diseases</span>
              </div>
            </div>

            {/* Micro Sparkline Telemetry Visual */}
            <div className="mt-space-2xs p-space-xs rounded-lg bg-surface-container-low flex flex-col gap-1 border border-outline-variant/20">
              <div className="flex justify-between text-outline font-label-caps text-label-caps">
                <span>AI ANALYSIS CONFIDENCE</span>
                <span className="text-primary font-code-md">OPTIMAL</span>
              </div>
              <svg className="w-full h-8 text-primary overflow-visible" viewBox="0 0 200 32">
                <path
                  d="M0 24 Q 25 22, 50 14 T 100 18 T 150 6 T 200 8"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                <circle className="fill-primary animate-ping opacity-75" cx="200" cy="8" r="3.5" />
                <circle className="fill-surface-container-lowest stroke-primary stroke-2" cx="200" cy="8" r="2.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* COLUMN 2: CENTER HERO WORK AREA (Col span 5) */}
        <div className="xl:col-span-5 flex flex-col gap-space-md">
          <div className="relative bg-surface-container-low rounded-xl p-space-md shadow-xl flex flex-col min-h-[640px] overflow-hidden border border-outline-variant/20">
            
            {/* Viewport Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm z-20">
              <div className="flex flex-col">
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                  Interactive Anatomical Locator
                </h2>
                <span className="font-label-caps text-label-caps text-outline">SPATIAL BIOMETRIC REGISTER</span>
              </div>
              <div className="flex items-center gap-space-xs">
                {/* Anterior / Posterior Toggle */}
                <div className="flex items-center p-0.5 rounded-lg bg-surface-container-high shadow-inner" id="view-toggle">
                  <button
                    onClick={() => setViewAngle('anterior')}
                    className={`px-space-xs py-1 rounded font-code-md text-code-md font-medium shadow-sm transition-all ${
                      viewAngle === 'anterior'
                        ? 'text-on-primary bg-primary-container'
                        : 'text-outline hover:text-on-surface'
                    }`}
                  >
                    ANTERIOR
                  </button>
                  <button
                    onClick={() => setViewAngle('posterior')}
                    className={`px-space-xs py-1 rounded font-code-md text-code-md font-medium shadow-sm transition-all ${
                      viewAngle === 'posterior'
                        ? 'text-on-primary bg-primary-container'
                        : 'text-outline hover:text-on-surface'
                    }`}
                  >
                    POSTERIOR
                  </button>
                </div>

                {/* System Overlay Button */}
                <button
                  onClick={() => setShowOverlay(!showOverlay)}
                  className={`flex items-center gap-1 px-space-xs py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary transition-all shadow-sm border border-outline-variant/30 ${
                    showOverlay ? 'text-primary' : ''
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">layers</span>
                  <span className="font-code-md text-code-md">OVERLAY</span>
                </button>
              </div>
            </div>

            {/* Anatomical Stage Container */}
            <div className="relative w-full flex-1 flex items-center justify-center min-h-[500px]">
              <div className="relative w-full h-[520px] rounded-xl overflow-hidden bg-surface-container-lowest/60 flex items-center justify-center border border-outline-variant/20">
                
                {/* Three.js 3D Body Map Component */}
                <BodyMap3D
                  activeRegion={activeRegion}
                  onSelectRegion={handleRegionSelect}
                  viewAngle={viewAngle}
                />

                {/* Subtle Background Precision Grid Coordinates */}
                <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between p-space-sm">
                  <div className="flex justify-between font-code-md text-code-md text-outline">
                    <span>LAT: 44.8912 N</span>
                    <span>Z-AXIS: +1.04</span>
                  </div>
                  <div className="flex justify-between font-code-md text-code-md text-outline">
                    <span>MESH RESOLUTION: 120k VERTS</span>
                    <span>CALIBRATION: RIGID_BODY</span>
                  </div>
                </div>

                {/* Floating Contextual Tags when Overlay is active */}
                {showOverlay && (
                  <>
                    {/* 1. Cranial Node */}
                    <div
                      onClick={() => handleRegionSelect('head')}
                      className="absolute top-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 group cursor-pointer"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="w-3 h-3 rounded-full bg-secondary animate-ping absolute opacity-75"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-secondary relative shadow-[0_0_12px_rgba(180,197,255,0.8)]"></span>
                      </div>
                      <div className="bg-surface-container-highest/90 backdrop-blur-md px-space-xs py-1 rounded-lg shadow-lg flex items-center gap-space-2xs border border-outline-variant/30">
                        <span className="material-symbols-outlined text-[14px] text-secondary">psychology</span>
                        <div className="flex flex-col">
                          <span className="font-body-sm text-body-sm font-semibold text-on-surface leading-tight">
                            Bilateral Frontal Tension
                          </span>
                          <span className="font-label-caps text-label-caps text-outline text-[10px]">CEPHALIC VECT</span>
                        </div>
                      </div>
                    </div>

                    {/* Interplay Connector Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 500 520">
                      <path
                        className="text-primary/40 stroke-1"
                        d="M 250 85 Q 260 140, 235 180"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="3 3"
                      />
                      <path
                        className="text-tertiary-fixed-dim/40 stroke-1"
                        d="M 235 220 Q 210 260, 250 310"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="3 3"
                      />
                    </svg>

                    {/* 2. Thoracic Node (Primary Trigger) */}
                    <div
                      onClick={() => handleRegionSelect('chest')}
                      className="absolute top-[180px] left-[45%] -translate-x-1/2 z-20 flex items-center gap-2 group cursor-pointer"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="w-4 h-4 rounded-full bg-primary animate-ping absolute opacity-80"></span>
                        <span className="w-3 h-3 rounded-full bg-primary relative shadow-[0_0_16px_rgba(76,255,228,1)]"></span>
                      </div>
                      <div className="bg-surface-container-highest/95 backdrop-blur-md px-space-sm py-1.5 rounded-lg shadow-xl flex items-center gap-space-xs border border-primary/40">
                        <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                          air
                        </span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-body-sm text-body-sm font-bold text-on-surface leading-tight">
                              Persistent Dry Cough
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                          </div>
                          <span className="font-label-caps text-label-caps text-primary text-[10px] tracking-wider">
                            PRIMARY ACTIVE TRIGGER
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Systemic Thermal Node */}
                    <div
                      onClick={() => handleRegionSelect('abdomen')}
                      className="absolute top-[310px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 group cursor-pointer"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim animate-ping absolute opacity-60"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim relative shadow-[0_0_12px_rgba(255,185,95,0.8)]"></span>
                      </div>
                      <div className="bg-surface-container-highest/90 backdrop-blur-md px-space-xs py-1 rounded-lg shadow-lg flex items-center gap-space-2xs border border-outline-variant/30">
                        <span className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim">device_thermostat</span>
                        <div className="flex flex-col">
                          <span className="font-body-sm text-body-sm font-semibold text-on-surface leading-tight">
                            Low-Grade Pyrexia (38.2°C)
                          </span>
                          <span className="font-label-caps text-label-caps text-tertiary-fixed-dim text-[10px]">
                            CORE THERMAL DRIFT
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Interactive Add Pin Tooltip Pill */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-surface-container-high/90 backdrop-blur-md px-space-sm py-space-2xs rounded-full flex items-center gap-space-xs text-outline shadow-md border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[16px] text-primary">touch_app</span>
                  <span className="font-code-md text-code-md text-on-surface-variant">Click body region to select symptoms</span>
                </div>
              </div>
            </div>

            {/* Bottom Micro Visualizer / Coordinate Tracker */}
            <div className="flex items-center justify-between pt-space-xs text-outline font-code-md text-code-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-primary">3d_rotation</span>
                <span>Interactive 3D Body Map: Click any region to highlight symptoms</span>
              </div>
              <span className="text-on-surface-variant">3D View: Active</span>
            </div>
          </div>
        </div>

        {/* COLUMN 3: RIGHT INTERACTION TRAY (Col span 4) */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          {/* Search Bar with Live Filter Tags */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-sm border border-outline-variant/20">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-space-xs top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-space-xs py-space-xs rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-inner border border-outline-variant/30"
                placeholder="Search symptoms (e.g. Cough, Dyspnea, Fatigue)..."
              />
            </div>

            {/* Live Search Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="flex flex-col gap-1 p-space-xs rounded-lg bg-surface-container-highest/90 border border-primary/30 shadow-lg">
                <span className="font-label-caps text-label-caps text-outline text-[10px] px-1">MATCHING SYMPTOMS:</span>
                {searchResults.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleAddSearchResult(item)}
                    className="flex items-center justify-between px-2 py-1.5 rounded text-left hover:bg-primary/20 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">add_circle</span>
                      <span className="font-body-sm text-on-surface font-medium group-hover:text-primary">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-code-md text-outline text-[11px] uppercase">
                      {item.anatomical_region}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Suggestion Filter Tags & Custom Trigger Action */}
            <div className="flex flex-wrap gap-1.5 items-center justify-between">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="font-label-caps text-label-caps text-outline text-[10px]">COMMON:</span>
                {COMMON_TAGS.map(tag => (
                  <button
                    key={tag.name}
                    onClick={() => handleQuickAdd(tag.name)}
                    className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-primary font-body-sm text-body-sm transition-colors border border-outline-variant/20"
                  >
                    + {tag.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowOverlay(!showOverlay)}
                className="px-2 py-0.5 rounded bg-primary-container/20 hover:bg-primary-container text-primary font-body-sm text-body-sm transition-all border border-primary/30 flex items-center gap-1 font-semibold"
              >
                <span className="material-symbols-outlined text-[14px]">add_circle</span>
                <span>Custom Trigger</span>
              </button>
            </div>

            {/* Custom Trigger Builder Panel */}
            {showOverlay && (
              <div className="p-space-sm rounded-lg bg-surface-container-lowest border border-primary/30 shadow-md flex flex-col gap-space-xs">
                <div className="flex items-center justify-between border-b border-surface-container-highest pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
                    <span className="font-headline-sm text-body-sm font-bold text-on-surface">Add Custom Trigger / Symptom</span>
                  </div>
                  <button onClick={() => setShowOverlay(false)} className="text-outline hover:text-on-surface">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Enter custom trigger (e.g., Post-Workout Shortness of Breath)..."
                    className="w-full px-space-xs py-1.5 rounded bg-surface-container text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                  />
                  <div className="flex items-center justify-between text-outline font-code-md text-code-md">
                    <span>Initial Severity:</span>
                    <span className="text-primary font-bold">5 / 10 (Moderate)</span>
                  </div>
                  <button
                    onClick={() => {
                      if (searchQuery.trim()) {
                        handleQuickAdd(searchQuery.trim());
                        setSearchQuery('');
                      }
                    }}
                    disabled={!searchQuery.trim()}
                    className="w-full py-1.5 rounded bg-primary text-on-primary font-headline-sm text-body-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Add Custom Trigger to Analysis Queue</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Selected Symptoms Tray */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-sm border border-outline-variant/20">
            <div className="flex items-center justify-between pb-space-2xs border-b border-surface-container-highest">
              <div className="flex items-center gap-space-2xs">
                <span className="font-headline-md text-headline-md text-on-surface font-semibold">Symptom Queue</span>
                <span className="px-space-2xs py-0.5 rounded-full bg-primary/20 text-primary font-code-md text-code-md font-bold">
                  {selectedSymptoms.length}
                </span>
              </div>
              {selectedSymptoms.length > 0 && (
                <button
                  onClick={onClearSymptoms}
                  className="font-code-md text-code-md text-outline hover:text-error transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Interactive Symptom List Items */}
            <div className="flex flex-col gap-space-xs max-h-[260px] overflow-y-auto pr-1" id="symptom-tray">
              {selectedSymptoms.length === 0 ? (
                <div className="p-space-lg text-center text-outline flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[28px] text-outline-variant">stethoscope</span>
                  <span className="font-body-sm text-body-sm">
                    No symptoms selected yet. Use the search bar, common tags, or click the 3D body nodes.
                  </span>
                </div>
              ) : (
                selectedSymptoms.map(item => {
                  const severityLabel =
                    item.severity <= 3 ? 'Mild' : item.severity <= 6 ? 'Moderate' : 'Severe';
                  const severityColor =
                    item.severity <= 3
                      ? 'text-primary'
                      : item.severity <= 6
                      ? 'text-tertiary-fixed-dim'
                      : 'text-error';
                  const dotColor =
                    item.severity <= 3
                      ? 'bg-primary'
                      : item.severity <= 6
                      ? 'bg-tertiary-fixed-dim'
                      : 'bg-error';

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col p-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors shadow-sm group border border-outline-variant/20 gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-body-md text-body-md font-semibold text-on-surface">
                            {item.name || item.id}
                          </span>
                          <div className="flex items-center gap-space-xs text-outline font-code-md text-code-md">
                            <span className={`inline-flex items-center gap-1 ${severityColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span> {severityLabel} ({item.severity}/10)
                            </span>
                            <span>•</span>
                            <span>{item.duration || 3} Days</span>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveSymptom(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="w-7 h-7 rounded flex items-center justify-center text-outline hover:text-error hover:bg-error-container/20 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>

                      {/* Micro Severity Slider */}
                      <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/10">
                        <span className="font-label-caps text-outline text-[10px]">SEVERITY:</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={item.severity}
                          onChange={e => onUpdateSymptomSeverity(item.id, parseInt(e.target.value))}
                          className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <span className="font-code-md text-primary text-[11px] w-4 text-right">
                          {item.severity}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Progressive Disclosure Context Accordion */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-sm border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-outline tracking-wider">
                TEMPORAL & ENVIRONMENTAL CONTEXT
              </span>
              <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
            </div>
            <div className="flex flex-col gap-space-xs">
              {/* Context Field 1: Duration & Onset */}
              <div className="flex flex-col gap-1">
                <label className="font-body-sm text-body-sm text-on-surface-variant">Symptom Duration & Onset Speed</label>
                <div className="relative">
                  <select
                    value={context.onset}
                    onChange={e => onUpdateContext({ onset: e.target.value })}
                    className="w-full bg-surface-container px-space-xs py-space-xs rounded-lg text-on-surface font-body-sm text-body-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary shadow-sm cursor-pointer border border-outline-variant/20"
                  >
                    <option value="Gradual (3 - 5 days)">Gradual (3 - 5 days)</option>
                    <option value="Sudden / Acute (< 24 hours)">Sudden / Acute (&lt; 24 hours)</option>
                    <option value="Insidious / Protracted (> 2 weeks)">Insidious / Protracted (&gt; 2 weeks)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-space-xs top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Context Field 2: Progression */}
              <div className="flex flex-col gap-1">
                <label className="font-body-sm text-body-sm text-on-surface-variant">Clinical Progression</label>
                <div className="relative">
                  <select
                    value={context.progression}
                    onChange={e => onUpdateContext({ progression: e.target.value })}
                    className="w-full bg-surface-container px-space-xs py-space-xs rounded-lg text-on-surface font-body-sm text-body-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary shadow-sm cursor-pointer border border-outline-variant/20"
                  >
                    <option value="Slowly worsening">Slowly worsening</option>
                    <option value="Fluctuating / Episodic">Fluctuating / Episodic</option>
                    <option value="Plateaued / Stable">Plateaued / Stable</option>
                    <option value="Gradually resolving">Gradually resolving</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-space-xs top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Context Field 3: Associated Triggers */}
              <div className="flex flex-col gap-1 mt-space-2xs">
                <label className="font-body-sm text-body-sm text-on-surface-variant">Observed Associated Triggers</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Cold air', 'Physical exertion', 'Recent travel', 'Dust / Allergens'].map(trigger => {
                    const isSelected = (context.triggers || []).includes(trigger);
                    return (
                      <button
                        key={trigger}
                        onClick={() => handleToggleTrigger(trigger)}
                        className={`px-2.5 py-1 rounded-md font-code-md text-code-md flex items-center gap-1 transition-all border ${
                          isSelected
                            ? 'bg-surface-container-high text-primary border-primary/40 shadow-sm'
                            : 'bg-surface-container text-outline hover:text-on-surface border-outline-variant/20'
                        }`}
                      >
                        {isSelected ? (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        ) : (
                          '+'
                        )}{' '}
                        {trigger}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Bar & Main Action CTA */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-xl flex flex-col gap-space-sm relative overflow-hidden border border-outline-variant/20">
            {/* Subtle Top Gradient Highlight */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary to-primary-container"></div>
            
            {/* Telemetry Summary */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline tracking-wider">AGGREGATE CONFIDENCE</span>
                <span className="font-code-md text-code-md text-primary font-bold">
                  {aggregateConfidence.toFixed(1)}%
                </span>
              </div>

              {/* Progress confidence meter */}
              <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden border border-outline-variant/20">
                <div
                  className="h-full bg-gradient-to-r from-secondary-container via-primary-container to-primary rounded-full shadow-[0_0_12px_rgba(10,226,200,0.6)] transition-all duration-500"
                  style={{ width: `${aggregateConfidence}%` }}
                ></div>
              </div>

              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                <strong className="text-on-surface font-semibold">{selectedSymptoms.length} Symptoms</strong> registered across{' '}
                <strong className="text-on-surface font-semibold">{activeSystemsCount} Biological Systems</strong>.
              </p>
            </div>

            {/* Primary Action Button with Glowing Visual Accent */}
            <div className="relative group mt-space-2xs">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-40 group-hover:opacity-80 transition duration-300"></div>
              <button
                onClick={onRunAnalysis}
                disabled={selectedSymptoms.length === 0 || isAnalyzing}
                className={`relative w-full py-space-sm px-space-md rounded-lg font-headline-md text-body-md font-bold flex items-center justify-center gap-space-xs transition-all shadow-lg active:scale-[0.99] ${
                  selectedSymptoms.length === 0
                    ? 'bg-surface-container-high text-outline cursor-not-allowed opacity-60'
                    : isAnalyzing
                    ? 'bg-primary text-on-primary cursor-wait'
                    : 'bg-primary-container text-on-primary hover:bg-primary'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    <span>Computing Bayesian Posteriors...</span>
                  </>
                ) : (
                  <>
                    <span>Run ML Probability Analysis</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>

            {/* Legal / Safety Medical Disclaimer Note */}
            <div className="flex items-start gap-space-2xs pt-space-xs">
              <span className="material-symbols-outlined text-[14px] text-outline flex-shrink-0 mt-0.5">info</span>
              <p className="font-body-sm text-body-sm text-outline text-[11px] leading-tight">
                Vitalis utilizes statistical pattern classification. Not a clinical diagnosis. Consult a qualified medical practitioner for diagnosis or acute emergencies.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
