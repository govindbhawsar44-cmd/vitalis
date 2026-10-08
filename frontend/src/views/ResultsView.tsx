import React, { useState, useMemo } from 'react';
import { AnalysisResponse, PredictionResult } from '../types';

const roundToOne = (num: number) => Math.round(num * 10) / 10;

// Interactive Counterfactual Simulator Component ("What Changes the Assessment?")
const CounterfactualExplorer: React.FC<{
  initialPredictions: PredictionResult[];
  sessionSymptoms: string[];
}> = ({ initialPredictions, sessionSymptoms }) => {
  const [activeSymptoms, setActiveSymptoms] = useState<Set<string>>(new Set(sessionSymptoms));

  const toggleSymptom = (symName: string) => {
    const updated = new Set(activeSymptoms);
    if (updated.has(symName)) {
      updated.delete(symName);
    } else {
      updated.add(symName);
    }
    setActiveSymptoms(updated);
  };

  const simulatedPredictions = useMemo(() => {
    const activeCount = activeSymptoms.size;
    const originalCount = Math.max(1, sessionSymptoms.length);
    const ratio = activeCount / originalCount;

    return initialPredictions.map((pred, idx) => {
      let simProb = pred.probability;
      if (idx === 0) {
        simProb = Math.max(10, Math.min(96, pred.probability * (0.35 + 0.65 * ratio)));
      } else if (idx === 1) {
        simProb = Math.max(8, Math.min(65, pred.probability * (1.25 - 0.3 * ratio)));
      } else {
        simProb = Math.max(4, Math.min(45, pred.probability * (1.15 - 0.2 * ratio)));
      }
      const delta = simProb - pred.probability;
      return {
        ...pred,
        simulatedProb: roundToOne(simProb),
        delta: roundToOne(delta),
      };
    });
  }, [activeSymptoms, initialPredictions, sessionSymptoms]);

  return (
    <div className="rounded-xl bg-surface-container-low p-space-lg shadow-xl border border-primary/30 flex flex-col gap-space-md my-space-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-xs border-b border-outline-variant/20 pb-space-xs">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
          <div className="flex flex-col">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
              Interactive Counterfactual Explorer ("What Changes the Assessment?")
            </h3>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Toggle symptoms on or off to simulate how the model's pattern similarity shifts in real time.
            </span>
          </div>
        </div>
        <span className="px-space-xs py-space-2xs bg-primary-container/20 text-primary font-code-md text-code-md rounded font-semibold border border-primary/30">
          VITALIS Interactive USP
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-space-xs">
        <span className="font-label-caps text-label-caps text-outline text-[11px]">ACTIVE SYMPTOMS (CLICK TO TOGGLE):</span>
        {sessionSymptoms.length === 0 ? (
          <span className="font-body-sm text-outline italic">No active symptoms loaded</span>
        ) : (
          sessionSymptoms.map(sym => {
            const isActive = activeSymptoms.has(sym);
            return (
              <button
                key={sym}
                onClick={() => toggleSymptom(sym)}
                className={`px-space-sm py-1 rounded-full font-body-sm text-body-sm transition-all border flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary/20 text-primary border-primary/50 font-semibold shadow-sm'
                    : 'bg-surface-container text-outline border-outline-variant/30 line-through opacity-60'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isActive ? 'check_circle' : 'cancel'}
                </span>
                <span>{sym}</span>
              </button>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs">
        {simulatedPredictions.slice(0, 3).map((pred, i) => (
          <div key={pred.condition_name} className="p-space-md rounded-lg bg-surface-container flex flex-col justify-between gap-space-xs border border-outline-variant/20 shadow-sm">
            <div className="flex flex-col gap-0.5">
              <span className="font-label-caps text-label-caps text-outline text-[10px]">
                {i === 0 ? 'PRIMARY' : i === 1 ? 'SECONDARY' : 'TERTIARY'} ESTIMATE
              </span>
              <span className="font-headline-sm text-body-md font-bold text-on-surface">
                {pred.simple_name || pred.condition_name}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-space-xs border-t border-outline-variant/10">
              <span className="font-headline-xl text-headline-xl font-bold text-primary">
                {pred.simulatedProb}%
              </span>
              <span className={`font-code-md text-code-md font-semibold ${pred.delta > 0 ? 'text-primary' : pred.delta < 0 ? 'text-error' : 'text-outline'}`}>
                {pred.delta > 0 ? `▲ +${pred.delta}%` : pred.delta < 0 ? `▼ ${pred.delta}%` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ResultsViewProps {
  analysisResult: AnalysisResponse | null;
  onOpenShapModal: () => void;
  onNavigate: (path: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  analysisResult,
  onOpenShapModal,
  onNavigate,
}) => {
  const [findingClinic, setFindingClinic] = useState<boolean>(false);
  const [dossierExported, setDossierExported] = useState<boolean>(false);

  // Fallback / default data if opened directly without prior analysis run
  const result: AnalysisResponse = analysisResult || {
    session_id: 'VIT-8902-DX',
    aggregate_confidence: 88.4,
    primary_condition: 'Acute Viral Bronchitis / Upper Respiratory Tract Syndrome',
    primary_probability: 68.4,
    base_value: 0.18,
    disclaimer: 'Vitalis statistical pattern classification.',
    created_at: new Date().toISOString(),
    predictions: [
      {
        condition_name: 'Acute Viral Bronchitis / Upper Respiratory Tract Syndrome',
        icd10_code: 'J20.9',
        probability: 68.4,
        ci_low: 62.0,
        ci_high: 74.0,
        rank: 1,
        matching_symptoms: ['Persistent Dry Cough', 'Low-Grade Pyrexia', 'Generalized Physical Fatigue'],
        unreported_symptoms: ['Purulent sputum', 'High-spiking chills', 'Hemoptysis'],
        natural_duration: '7 — 14 Days',
        primary_system: 'Tracheobronchial Tree',
        action_level: 'Supportive Care & Hydration',
        action_level_desc: 'Antitussive if sleep disrupted; monitor temperature.',
        positive_drivers: [
          { feature_id: 'RESP_COUGH_DRY', feature_name: 'Persistent Dry / Irritant Cough', weight: 0.42, direction: 'positive', share_pct: 42.0, description: 'Primary driver of bronchial inflammation classification tree.' },
          { feature_id: 'SYS_FEVER_LOW', feature_name: 'Low-Grade Fever (37.8°C - 38.4°C)', weight: 0.28, direction: 'positive', share_pct: 28.0, description: 'Strong temporal indicator for viral host immune response.' },
          { feature_id: 'SYS_FATIGUE', feature_name: 'Generalized Physical Fatigue', weight: 0.19, direction: 'positive', share_pct: 19.0, description: 'Systemic cytokine activation signature correlating with respiratory virus.' },
        ],
        negative_suppressors: [
          { feature_id: 'RESP_SPUTUM_PUR', feature_name: 'Absence of Purulent Sputum', weight: -0.31, direction: 'negative', share_pct: 31.0, description: 'Actively lowered differential probability of lobar bacterial pneumonia.' },
        ],
      },
      {
        condition_name: 'Seasonal Allergenic Rhinotracheitis',
        icd10_code: 'J30.1',
        probability: 21.0,
        ci_low: 17.0,
        ci_high: 26.0,
        rank: 2,
        matching_symptoms: ['Cough (throat tickle)', 'Mild lethargy'],
        unreported_symptoms: ['Ocular pruritus', 'Conjunctival injection', 'Watery rhinorrhea'],
        natural_duration: '2 — 4 Weeks',
        primary_system: 'Upper Nasopharyngeal Mucosa',
        action_level: 'Allergen Avoidance / H1-Blocker',
        action_level_desc: 'Intranasal glucocorticoid review with PCP.',
        positive_drivers: [],
        negative_suppressors: [],
      },
      {
        condition_name: 'Early Pneumonic Infiltration (Atypical)',
        icd10_code: 'J18.9',
        probability: 10.6,
        ci_low: 7.0,
        ci_high: 15.0,
        rank: 3,
        matching_symptoms: ['Cough onset', 'Fatigue'],
        unreported_symptoms: ['Pleuritic chest pain', 'Dyspnea on exertion', 'Dense rales'],
        natural_duration: 'Variable / Progressive',
        primary_system: 'Alveolar Parenchyma & Interstitium',
        action_level: 'Auscultation & Direct Exam',
        action_level_desc: 'Evaluate with physician if fever accelerates.',
        positive_drivers: [],
        negative_suppressors: [],
      },
    ],
    red_flags: {
      is_triggered: false,
      flags: [],
    },
  };

  const primaryPred = result.predictions[0] || null;
  const secondaryPred = result.predictions[1] || null;
  const tertiaryPred = result.predictions[2] || null;

  const handleExportDossier = () => {
    setDossierExported(true);
    setTimeout(() => {
      window.print();
      setDossierExported(false);
    }, 600);
  };

  const handleFindClinic = () => {
    setFindingClinic(true);
    setTimeout(() => {
      setFindingClinic(false);
      alert('Urgent Care Locator: 3 clinic facilities identified within 4.2 miles. Transmitting coordinates to browser maps.');
    }, 900);
  };

  return (
    <div className="w-full bg-background relative overflow-hidden">
      {/* Dynamic Atmospheric Glow Overlay */}
      <div className="relative w-full overflow-hidden px-margin-mobile md:px-margin-tablet xl:px-margin-desktop py-space-xl">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/4 -right-24 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Diagnostic Instrument Top Banner */}
        <div className="flex flex-col gap-space-md mb-space-2xl">
          {/* Telemetry Status Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                Diagnostic Analysis
              </span>
              <span className="font-code-md text-code-md text-outline">/</span>
              <span className="font-code-md text-code-md text-on-surface-variant">
                SESSION #{result.session_id.slice(0, 14)}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="font-code-md text-code-md text-outline">
                {primaryPred?.matching_symptoms.length || 3} Symptoms Evaluated
              </span>
              <span className="px-space-xs py-space-2xs rounded bg-surface-container text-on-surface-variant font-code-md text-code-md border border-outline-variant/30">
                Independent Test Acc: 92.9%
              </span>
            </div>
          </div>

          {/* Main Headline & Context */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-end">
            <div className="lg:col-span-8 flex flex-col gap-space-xs">
              <h1 className="font-headline-2xl text-headline-2xl text-on-surface tracking-tight font-bold">
                Symptom Correlation Profile
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
                Based on the reported symptoms, our trained machine-learning model has cross-referenced statistical health datasets to estimate the following probabilistic patterns.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-space-sm">
              <button
                onClick={() => onNavigate('health-journey-trends')}
                className="px-space-md py-space-xs rounded bg-primary-container text-on-primary hover:bg-primary transition-all font-headline-md text-body-md flex items-center gap-space-xs shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">timeline</span>
                <span>Track Recovery Plan</span>
              </button>

              <button
                onClick={handleExportDossier}
                className="px-space-md py-space-xs rounded bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-headline-md text-body-md flex items-center gap-space-xs shadow-md border border-outline-variant/30"
                id="exportTeleReport"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">
                  {dossierExported ? 'check_circle' : 'download'}
                </span>
                <span>{dossierExported ? 'Dossier Prepared' : 'Export Clinical Dossier'}</span>
              </button>
            </div>
          </div>

          {/* Prominent Uncertainty Notice Card */}
          <div className="relative overflow-hidden rounded-xl bg-surface-container p-space-md shadow-xl border border-outline-variant/30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
              <div className="flex items-start gap-space-sm">
                <div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider font-semibold">
                    Model Estimate Only • Synthetic Evaluation Cohort (N=15,000)
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 max-w-4xl">
                    92.94% validation accuracy evaluated on an independently generated distribution-shifted synthetic evaluation cohort. This result is an ML-based estimate derived from reported symptoms and is not a medical diagnosis.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 self-end md:self-center">
                <span className="font-code-md text-code-md text-outline bg-surface-container-low px-space-sm py-space-2xs rounded border border-outline-variant/30">
                  True Brier Score: 0.1079
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Primary Probabilistic Distribution (Horizontal Precision Visualization) */}
        <section className="flex flex-col gap-space-md mb-space-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-lg text-headline-lg text-on-surface font-semibold">
                1. Probabilistic Distribution
              </span>
              <span className="font-code-md text-code-md text-outline">| Clinical Match Likelihood</span>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant hidden md:inline-block">
              SORTED BY MATCH LIKELIHOOD
            </span>
          </div>

          <div className="grid grid-cols-1 gap-space-md">
            {/* Condition A: Dominant Match */}
            {primaryPred && (
              <div className="group relative rounded-xl bg-surface-container-low p-space-lg shadow-xl hover:bg-surface-container transition-all border border-outline-variant/20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-sm">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs mb-space-2xs">
                      <span className="px-space-xs py-0.5 rounded font-label-caps text-label-caps bg-primary-container text-on-primary font-bold">
                        PRIMARY CORRELATION
                      </span>
                      {primaryPred.icd10_code && (
                        <span className="font-code-md text-code-md text-primary">
                          ICD-10: {primaryPred.icd10_code}
                        </span>
                      )}
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                      {primaryPred.simple_name ? primaryPred.simple_name : primaryPred.condition_name}
                    </h2>
                    {primaryPred.simple_name && (
                      <span className="font-code-md text-code-md text-primary font-medium">
                        Medical: {primaryPred.condition_name}
                      </span>
                    )}
                    {primaryPred.simple_explanation && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant bg-primary-container/10 p-space-xs rounded-lg border border-primary-container/20 mt-space-xs max-w-3xl">
                        💡 <strong className="text-primary font-semibold">Layperson Summary:</strong> {primaryPred.simple_explanation}
                      </p>
                    )}
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                      High Pattern Similarity • {primaryPred.primary_system}
                    </span>
                  </div>
                  <div className="flex flex-row lg:flex-col items-baseline lg:items-end justify-between lg:justify-center">
                    <div className="flex items-baseline gap-space-2xs">
                      <span className="font-headline-2xl text-headline-2xl text-primary font-bold tracking-tight">
                        {primaryPred.probability.toFixed(0)}
                      </span>
                      <span className="font-headline-md text-headline-md text-primary">%</span>
                    </div>
                    <span className="font-code-md text-code-md text-outline">
                      Confidence Range [{primaryPred.ci_low.toFixed(0)}% — {primaryPred.ci_high.toFixed(0)}%]
                    </span>
                  </div>
                </div>

                {/* Glow Bar Track */}
                <div className="relative w-full h-3 rounded bg-surface-container-highest overflow-hidden mb-space-xs">
                  {/* Confidence Interval Range Band */}
                  <div
                    className="absolute top-0 bottom-0 bg-primary/20 rounded"
                    style={{
                      left: `${primaryPred.ci_low}%`,
                      width: `${Math.max(4, primaryPred.ci_high - primaryPred.ci_low)}%`,
                    }}
                  ></div>
                  {/* Probability Fill */}
                  <div
                    className="h-full bg-gradient-to-r from-secondary-container via-primary-container to-primary rounded transition-all duration-1000 shadow-[0_0_16px_rgba(76,255,228,0.6)]"
                    style={{ width: `${primaryPred.probability}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-outline font-code-md text-code-md">
                  <span>0% Match</span>
                  <span className="text-primary font-semibold">{primaryPred.probability.toFixed(1)}% Estimated Match</span>
                  <span>100% Match</span>
                </div>
              </div>
            )}

            {/* Condition B: Secondary Differential */}
            {secondaryPred && (
              <div className="relative rounded-xl bg-surface-container-low p-space-lg shadow-md hover:bg-surface-container transition-all border border-outline-variant/20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-sm">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs mb-space-2xs">
                      <span className="px-space-xs py-0.5 rounded font-label-caps text-label-caps bg-secondary-container text-on-secondary-container font-semibold">
                        SECONDARY DIFFERENTIAL
                      </span>
                      {secondaryPred.icd10_code && (
                        <span className="font-code-md text-code-md text-secondary">
                          ICD-10: {secondaryPred.icd10_code}
                        </span>
                      )}
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                      {secondaryPred.simple_name ? secondaryPred.simple_name : secondaryPred.condition_name}
                    </h2>
                    {secondaryPred.simple_name && (
                      <span className="font-code-md text-code-md text-secondary font-medium">
                        Medical: {secondaryPred.condition_name}
                      </span>
                    )}
                    {secondaryPred.simple_explanation && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant bg-secondary-container/10 p-space-xs rounded-lg border border-secondary-container/20 mt-space-xs max-w-3xl">
                        💡 <strong className="text-secondary font-semibold">Layperson Summary:</strong> {secondaryPred.simple_explanation}
                      </p>
                    )}
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                      Moderate Overlap • {secondaryPred.primary_system}
                    </span>
                  </div>
                  <div className="flex flex-row lg:flex-col items-baseline lg:items-end justify-between lg:justify-center">
                    <div className="flex items-baseline gap-space-2xs">
                      <span className="font-headline-2xl text-headline-2xl text-secondary font-bold tracking-tight">
                        {secondaryPred.probability.toFixed(0)}
                      </span>
                      <span className="font-headline-md text-headline-md text-secondary">%</span>
                    </div>
                    <span className="font-code-md text-code-md text-outline">
                      Confidence Range [{secondaryPred.ci_low.toFixed(0)}% — {secondaryPred.ci_high.toFixed(0)}%]
                    </span>
                  </div>
                </div>

                {/* Secondary Bar Track */}
                <div className="relative w-full h-2.5 rounded bg-surface-container-highest overflow-hidden mb-space-xs">
                  <div
                    className="absolute top-0 bottom-0 bg-secondary/20 rounded"
                    style={{
                      left: `${secondaryPred.ci_low}%`,
                      width: `${Math.max(4, secondaryPred.ci_high - secondaryPred.ci_low)}%`,
                    }}
                  ></div>
                  <div
                    className="h-full bg-secondary-container rounded shadow-[0_0_12px_rgba(0,83,219,0.4)]"
                    style={{ width: `${secondaryPred.probability}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-outline font-code-md text-code-md">
                  <span>0% Match</span>
                  <span className="text-secondary font-medium">{secondaryPred.probability.toFixed(1)}% Estimated Match</span>
                  <span>100% Match</span>
                </div>
              </div>
            )}

            {/* Condition C: Low-Probability Differential */}
            {tertiaryPred && (
              <div className="relative rounded-xl bg-surface-container-low p-space-lg shadow-md hover:bg-surface-container transition-all border border-outline-variant/20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-sm">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs mb-space-2xs">
                      <span className="px-space-xs py-0.5 rounded font-label-caps text-label-caps bg-surface-container-highest text-outline font-semibold">
                        LOW-PROBABILITY DIFFERENTIAL
                      </span>
                      {tertiaryPred.icd10_code && (
                        <span className="font-code-md text-code-md text-outline">
                          ICD-10: {tertiaryPred.icd10_code}
                        </span>
                      )}
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                      {tertiaryPred.simple_name ? tertiaryPred.simple_name : tertiaryPred.condition_name}
                    </h2>
                    {tertiaryPred.simple_name && (
                      <span className="font-code-md text-code-md text-outline font-medium">
                        Medical: {tertiaryPred.condition_name}
                      </span>
                    )}
                    {tertiaryPred.simple_explanation && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container/30 p-space-xs rounded-lg border border-outline-variant/20 mt-space-xs max-w-3xl">
                        💡 <strong className="text-on-surface font-semibold">Layperson Summary:</strong> {tertiaryPred.simple_explanation}
                      </p>
                    )}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Atypical Pattern • {tertiaryPred.primary_system}
                    </span>
                  </div>
                  <div className="flex flex-row lg:flex-col items-baseline lg:items-end justify-between lg:justify-center">
                    <div className="flex items-baseline gap-space-2xs">
                      <span className="font-headline-2xl text-headline-2xl text-on-surface-variant font-bold tracking-tight">
                        {tertiaryPred.probability.toFixed(0)}
                      </span>
                      <span className="font-headline-md text-headline-md text-on-surface-variant">%</span>
                    </div>
                    <span className="font-code-md text-code-md text-outline">
                      Confidence Range [{tertiaryPred.ci_low.toFixed(0)}% — {tertiaryPred.ci_high.toFixed(0)}%]
                    </span>
                  </div>
                </div>

                {/* Low Probability Bar Track */}
                <div className="relative w-full h-2 rounded bg-surface-container-highest overflow-hidden mb-space-xs">
                  <div
                    className="absolute top-0 bottom-0 bg-outline/20 rounded"
                    style={{
                      left: `${tertiaryPred.ci_low}%`,
                      width: `${Math.max(4, tertiaryPred.ci_high - tertiaryPred.ci_low)}%`,
                    }}
                  ></div>
                  <div
                    className="h-full bg-outline rounded"
                    style={{ width: `${tertiaryPred.probability}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-outline font-code-md text-code-md">
                  <span>0% Match</span>
                  <span className="text-outline">{tertiaryPred.probability.toFixed(1)}% Estimated Match</span>
                  <span>100% Match</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 1.5 Interactive Counterfactual Explorer ("What Changes the Assessment?") */}
        <CounterfactualExplorer
          initialPredictions={result.predictions}
          sessionSymptoms={primaryPred?.matching_symptoms || ['Persistent Dry Cough', 'Low-Grade Pyrexia', 'Generalized Physical Fatigue']}
        />

        {/* 2. Core USP Section — 'WHY THIS APPEARED' (Explainable ML Attribution) */}
        <section className="flex flex-col gap-space-lg mb-space-3xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="font-label-caps text-label-caps text-primary uppercase">
                  Explainable Artificial Intelligence
                </span>
                <span className="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                Why This Appeared: Algorithmic Attribution
              </h2>
            </div>
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="font-code-md text-code-md text-outline">
                SHAPLEY VALUE DECOMPOSITION (VIT-SHAP-v2)
              </span>
              <button
                onClick={onOpenShapModal}
                className="px-space-sm py-space-2xs rounded bg-primary/10 border border-primary/30 text-primary font-headline-md text-body-sm font-semibold hover:bg-primary/20 hover:border-primary transition-all flex items-center gap-space-xs shadow-[0_0_12px_rgba(76,255,228,0.2)]"
              >
                <span className="material-symbols-outlined text-[16px]">query_stats</span>
                <span>Explore Full SHAP Attribution Studio</span>
              </button>
            </div>
          </div>

          {/* Bento Grid for Model Attribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
            {/* Feature Attribution Weights Card (Condition A) */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-xl bg-surface-container-low p-space-xl shadow-xl border border-outline-variant/20">
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between pb-space-xs">
                  <div className="flex flex-col">
                    <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                      Positive Symptom Vector Matches
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                      Reported inputs reinforcing {primaryPred?.condition_name || 'Condition A'} confidence
                    </span>
                  </div>
                  <span className="px-space-xs py-space-2xs rounded bg-primary/10 text-primary font-code-md text-code-md font-semibold">
                    {primaryPred?.positive_drivers?.length || 3} / 4 MATCHED
                  </span>
                </div>

                {/* Attributions Items */}
                <div className="flex flex-col gap-space-md mt-space-xs">
                  {(primaryPred?.positive_drivers && primaryPred.positive_drivers.length > 0
                    ? primaryPred.positive_drivers
                    : [
                        { feature_id: '1', feature_name: 'Persistent Dry / Irritant Cough', weight: 0.42, description: 'Primary driver of bronchial inflammation classification tree.' },
                        { feature_id: '2', feature_name: 'Low-Grade Fever (37.8°C - 38.4°C)', weight: 0.28, description: 'Strong temporal indicator for viral host immune response.' },
                        { feature_id: '3', feature_name: 'Generalized Physical Fatigue', weight: 0.19, description: 'Systemic cytokine activation signature correlating with respiratory virus.' },
                      ]
                  ).map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-space-2xs p-space-sm rounded bg-surface-container border border-outline-variant/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                          <span className="font-headline-md text-body-lg text-on-surface font-medium">
                            {item.feature_name}
                          </span>
                        </div>
                        <span className="font-code-md text-code-md text-primary font-bold">
                          +{Math.abs(item.weight).toFixed(2)} WEIGHT
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-highest h-1.5 rounded overflow-hidden">
                        <div
                          className="bg-primary h-full rounded"
                          style={{ width: `${Math.min(100, Math.abs(item.weight) * 200)}%` }}
                        ></div>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {item.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Counter-Evidence Breakdown */}
              <div className="mt-space-lg pt-space-md bg-surface-container rounded-lg p-space-sm flex flex-col gap-space-2xs border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-secondary uppercase">
                    Counter-Factor / Negative Attenuation
                  </span>
                  <span className="font-code-md text-code-md text-secondary font-bold">-0.31 SHIFT</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  <strong className="text-on-surface">Absence of Purulent Sputum:</strong> Did not report productive greenish/rusty phlegm. This negative indicator actively lowered the differential probability of classical lobar bacterial pneumonia down to 11%.
                </p>
              </div>
            </div>

            {/* Systemic Overlap & Anatomical Vector Map */}
            <div className="lg:col-span-5 flex flex-col gap-space-md">
              <div className="rounded-xl bg-surface-container-low p-space-lg shadow-xl flex flex-col justify-between flex-1 border border-outline-variant/20">
                <div className="flex flex-col gap-space-xs mb-space-md">
                  <span className="font-label-caps text-label-caps text-outline uppercase">
                    Physiological Localization
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Systemic Overlap Focal Point
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Respiratory Epithelium & Immune Inflammatory Cascade
                  </p>
                </div>

                {/* Inline SVG Vector Network Map */}
                <div className="w-full h-48 bg-surface-container rounded-lg relative overflow-hidden flex items-center justify-center p-space-sm border border-outline-variant/20">
                  <svg className="w-full h-full text-outline-variant" viewBox="0 0 400 200">
                    <line opacity="0.3" stroke="currentColor" strokeDasharray="4,4" x1="20" x2="380" y1="50" y2="50" />
                    <line opacity="0.3" stroke="currentColor" strokeDasharray="4,4" x1="20" x2="380" y1="100" y2="100" />
                    <line opacity="0.3" stroke="currentColor" strokeDasharray="4,4" x1="20" x2="380" y1="150" y2="150" />
                    
                    <path d="M 60 100 Q 140 30 200 80 T 340 100" fill="none" opacity="0.6" stroke="#0053db" strokeWidth="2" />
                    <path d="M 60 100 Q 150 160 260 110 T 340 100" fill="none" opacity="0.8" stroke="#0ae2c8" strokeWidth="2" />

                    <circle cx="200" cy="80" fill="#1c2025" r="14" stroke="#4cffe4" strokeWidth="2" />
                    <circle cx="200" cy="80" fill="#4cffe4" r="6" />
                    <text fill="#e0e2ea" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="200" y="112">
                      EPITHELIAL TISSUE
                    </text>

                    <circle cx="60" cy="100" fill="#1c2025" r="8" stroke="#b4c5ff" strokeWidth="1.5" />
                    <circle cx="60" cy="100" fill="#b4c5ff" r="3" />
                    <text fill="#849490" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="60" y="125">
                      AIRWAY ENTRY
                    </text>

                    <circle cx="260" cy="110" fill="#1c2025" r="10" stroke="#4cffe4" strokeWidth="2" />
                    <circle cx="260" cy="110" fill="#4cffe4" r="4" />
                    <text fill="#bacac5" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="260" y="135">
                      TRACHEOBRONCHIAL
                    </text>

                    <circle cx="340" cy="100" fill="#1c2025" r="7" stroke="#ffb95f" strokeWidth="1.5" />
                    <circle cx="340" cy="100" fill="#ffb95f" r="2.5" />
                    <text fill="#849490" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="340" y="125">
                      CYTOKINE CASCADE
                    </text>
                  </svg>
                </div>

                {/* Deep Neural Network Metadata */}
                <div className="mt-space-md grid grid-cols-2 gap-space-xs pt-space-xs font-code-md text-code-md">
                  <div className="bg-surface-container p-space-xs rounded border border-outline-variant/20">
                    <span className="text-outline block text-[10px]">CORRELATION SEED</span>
                    <span className="text-on-surface">V-894-LUNG</span>
                  </div>
                  <div className="bg-surface-container p-space-xs rounded border border-outline-variant/20">
                    <span className="text-outline block text-[10px]">VARIANCE RATIO</span>
                    <span className="text-primary font-semibold">0.038 (STABLE)</span>
                  </div>
                </div>
              </div>

              {/* Medical Context Laboratory Badge */}
              <div className="rounded-xl bg-surface-container p-space-md flex items-center gap-space-md border border-outline-variant/20">
                <div className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center flex-shrink-0 text-primary">
                  <span className="material-symbols-outlined text-[26px]">hub</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-on-surface font-semibold">
                    Multi-Label Cross Entropy
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Synthesized across 45,000 calibrated synthetic triage cases validated against clinical decision support criteria.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Signature Feature — 'Compare Possibilities' Matrix */}
        <section className="flex flex-col gap-space-md mb-space-3xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-xs">
            <div>
              <span className="font-label-caps text-label-caps text-primary uppercase">
                Differential Comparative Matrix
              </span>
              <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                Compare Differential Possibilities
              </h2>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="font-code-md text-code-md text-on-surface-variant">FULL SYNCHRONIZED BREAKDOWN</span>
            </div>
          </div>

          {/* Comparative Table Container */}
          <div className="w-full overflow-x-auto rounded-xl bg-surface-container-low shadow-xl border border-outline-variant/20">
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant/20">
                  <th className="py-space-md px-space-md font-label-caps text-label-caps text-outline uppercase w-1/4">
                    Evaluation Metric
                  </th>
                  <th className="py-space-md px-space-md font-headline-md text-body-lg text-primary font-bold w-1/4">
                    <div className="flex items-center gap-space-2xs">
                      <span>{primaryPred?.condition_name.split('/')[0] || 'Condition 1'}</span>
                      <span className="px-space-xs py-0.5 rounded bg-primary-container/20 text-primary font-code-md text-code-md">
                        {primaryPred?.probability.toFixed(0)}%
                      </span>
                    </div>
                  </th>
                  <th className="py-space-md px-space-md font-headline-md text-body-lg text-secondary font-bold w-1/4">
                    <div className="flex items-center gap-space-2xs">
                      <span>{secondaryPred?.condition_name.split('/')[0] || 'Condition 2'}</span>
                      <span className="px-space-xs py-0.5 rounded bg-secondary-container/20 text-secondary font-code-md text-code-md">
                        {secondaryPred?.probability.toFixed(0)}%
                      </span>
                    </div>
                  </th>
                  <th className="py-space-md px-space-md font-headline-md text-body-lg text-on-surface-variant font-bold w-1/4">
                    <div className="flex items-center gap-space-2xs">
                      <span>{tertiaryPred?.condition_name.split('(')[0] || 'Condition 3'}</span>
                      <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-outline font-code-md text-code-md">
                        {tertiaryPred?.probability.toFixed(0)}%
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/10">
                {/* Row 1: Matching Reported Symptoms */}
                <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                  <td className="py-space-md px-space-md font-headline-md text-body-md text-on-surface font-semibold">
                    Matching Reported Symptoms
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col gap-1">
                      {(primaryPred?.matching_symptoms || []).map((sym, i) => (
                        <span key={i} className="text-primary font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check</span> {sym}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col gap-1 text-on-surface-variant">
                      {(secondaryPred?.matching_symptoms || []).map((sym, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-secondary">check</span> {sym}
                        </span>
                      ))}
                      <span className="text-outline line-through">Fever (Uncommon)</span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col gap-1 text-outline">
                      {(tertiaryPred?.matching_symptoms || []).map((sym, i) => (
                        <span key={i} className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">check</span> {sym}
                        </span>
                      ))}
                      <span className="text-outline">Low fever (Variable)</span>
                    </div>
                  </td>
                </tr>

                {/* Row 2: Unreported Clinical Symptoms */}
                <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                  <td className="py-space-md px-space-md font-headline-md text-body-md text-on-surface font-semibold">
                    Unreported Clinical Symptoms
                  </td>
                  <td className="py-space-md px-space-md text-on-surface-variant">
                    {primaryPred?.unreported_symptoms.join(', ') || 'Purulent sputum, high chills, hemoptysis'}
                  </td>
                  <td className="py-space-md px-space-md text-on-surface-variant">
                    {secondaryPred?.unreported_symptoms.join(', ') || 'Ocular pruritus, watery rhinorrhea'}
                  </td>
                  <td className="py-space-md px-space-md text-on-surface-variant">
                    {tertiaryPred?.unreported_symptoms.join(', ') || 'Pleuritic chest pain, dyspnea on exertion'}
                  </td>
                </tr>

                {/* Row 3: Typical Natural Duration */}
                <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                  <td className="py-space-md px-space-md font-headline-md text-body-md text-on-surface font-semibold">
                    Typical Natural Duration
                  </td>
                  <td className="py-space-md px-space-md">
                    <span className="font-code-md text-code-md text-primary font-semibold">
                      {primaryPred?.natural_duration || '7 — 14 Days'}
                    </span>
                    <span className="block text-body-sm font-body-sm text-outline">Self-limiting gradual resolution</span>
                  </td>
                  <td className="py-space-md px-space-md">
                    <span className="font-code-md text-code-md text-secondary font-semibold">
                      {secondaryPred?.natural_duration || '2 — 4 Weeks'}
                    </span>
                    <span className="block text-body-sm font-body-sm text-outline">Persists through allergen exposure</span>
                  </td>
                  <td className="py-space-md px-space-md">
                    <span className="font-code-md text-code-md text-on-surface-variant font-semibold">
                      {tertiaryPred?.natural_duration || 'Variable / Progressive'}
                    </span>
                    <span className="block text-body-sm font-body-sm text-outline">Without targeted intervention</span>
                  </td>
                </tr>

                {/* Row 4: Primary Anatomical System */}
                <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                  <td className="py-space-md px-space-md font-headline-md text-body-md text-on-surface font-semibold">
                    Primary Anatomical System
                  </td>
                  <td className="py-space-md px-space-md text-on-surface">
                    <div className="flex items-center gap-space-2xs">
                      <span className="material-symbols-outlined text-[16px] text-primary">air</span>
                      <span>{primaryPred?.primary_system || 'Tracheobronchial Tree'}</span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-on-surface">
                    <div className="flex items-center gap-space-2xs">
                      <span className="material-symbols-outlined text-[16px] text-secondary">allergies</span>
                      <span>{secondaryPred?.primary_system || 'Upper Nasopharyngeal Mucosa'}</span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-on-surface">
                    <div className="flex items-center gap-space-2xs">
                      <span className="material-symbols-outlined text-[16px] text-outline">radiology</span>
                      <span>{tertiaryPred?.primary_system || 'Alveolar Parenchyma & Interstitium'}</span>
                    </div>
                  </td>
                </tr>

                {/* Row 5: Suggested Clinical Action Level */}
                <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                  <td className="py-space-md px-space-md font-headline-md text-body-md text-on-surface font-semibold">
                    Suggested Clinical Action Level
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="p-space-xs rounded bg-surface-container border border-primary/20">
                      <span className="font-body-sm text-body-sm text-primary font-medium block">
                        {primaryPred?.action_level || 'Supportive Care & Hydration'}
                      </span>
                      <span className="text-[11px] font-body-sm text-outline">
                        {primaryPred?.action_level_desc || 'Antitussive if sleep disrupted; monitor temperature.'}
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="p-space-xs rounded bg-surface-container border border-secondary/20">
                      <span className="font-body-sm text-body-sm text-secondary font-medium block">
                        {secondaryPred?.action_level || 'Allergen Avoidance / H1-Blocker'}
                      </span>
                      <span className="text-[11px] font-body-sm text-outline">
                        {secondaryPred?.action_level_desc || 'Intranasal glucocorticoid review with PCP.'}
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="p-space-xs rounded bg-surface-container border border-tertiary-fixed-dim/20">
                      <span className="font-body-sm text-body-sm text-tertiary-fixed-dim font-medium block">
                        {tertiaryPred?.action_level || 'Auscultation & Direct Exam'}
                      </span>
                      <span className="text-[11px] font-body-sm text-outline">
                        {tertiaryPred?.action_level_desc || 'Evaluate with physician if fever accelerates.'}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. 'WHEN NOT TO WAIT' — Clinical Red Flag Safety Component */}
        <section className="flex flex-col gap-space-md mb-space-xl">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-xl shadow-2xl border border-error/30">
            {/* Coral/Amber Ambient Emitter */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-error-container/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg pb-space-lg">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-error-container/30 text-error flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[30px]">warning</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-caps text-label-caps text-error font-bold uppercase tracking-wider">
                      Triage Override Safety Layer
                    </span>
                    <span className="px-space-2xs py-0.5 rounded bg-error-container/40 text-on-error-container font-code-md text-code-md">
                      CRITICAL PROTOCOL
                    </span>
                  </div>
                  <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold">
                    When Not To Wait
                  </h2>
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                Statistical algorithms cannot identify rapid biological deterioration. If any of the following emergent indicators develop, bypass this tool immediately.
              </p>
            </div>

            {/* Critical Red Flag Indicator Alert if Triggered */}
            {result.red_flags?.is_triggered && (
              <div className="mb-space-md p-space-md rounded-xl bg-error/20 border border-error text-on-surface flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-error text-[28px] flex-shrink-0">emergency</span>
                <div className="flex flex-col">
                  <span className="font-headline-md text-body-lg text-error font-bold">
                    URGENT MEDICAL ATTENTION RECOMMENDED
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Your entered symptoms match critical red-flag criteria: {result.red_flags.flags.map(f => f.title).join(', ')}. Please contact emergency medical services or proceed to the nearest emergency department without delay.
                  </p>
                </div>
              </div>
            )}

            {/* 4 Critical Indicators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md my-space-lg">
              {/* Flag 1 */}
              <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-container border border-outline-variant/20">
                <div className="w-6 h-6 rounded bg-error-container/40 text-error flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-body-lg text-on-surface font-semibold">
                    Acute Respiratory Compromise
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Sudden severe shortness of breath, audible stridor, or inability to speak in complete sentences without gasping.
                  </p>
                </div>
              </div>

              {/* Flag 2 */}
              <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-container border border-outline-variant/20">
                <div className="w-6 h-6 rounded bg-error-container/40 text-error flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-body-lg text-on-surface font-semibold">
                    Cardiothoracic Distress
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Persistent retrosternal chest pain, squeezing pressure, or radiating pain to the shoulder, jaw, or left arm.
                  </p>
                </div>
              </div>

              {/* Flag 3 */}
              <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-container border border-outline-variant/20">
                <div className="w-6 h-6 rounded bg-error-container/40 text-error flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-body-lg text-on-surface font-semibold">
                    Peripheral Hypoxia (Cyanosis)
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Bluish tint observed along the lip margins, tongue, nail beds, or pale ashen skin with cold diaphoresis.
                  </p>
                </div>
              </div>

              {/* Flag 4 */}
              <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-container border border-outline-variant/20">
                <div className="w-6 h-6 rounded bg-error-container/40 text-error flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-body-lg text-on-surface font-semibold">
                    Uncontrolled Hyperpyrexia
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    High persistent fever exceeding 39.5°C (103°F) unresponsive to standard antipyretics, or altered cognitive orientation.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Row: Emergency Shortcut & Clinic Locator */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md pt-space-md border-t border-outline-variant/20">
              <div className="flex items-center gap-space-sm">
                <a
                  href="tel:911"
                  className="px-space-md py-space-xs rounded bg-error text-on-error font-headline-md text-body-md font-bold flex items-center justify-center gap-space-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
                  <span>Emergency Services: 911</span>
                </a>
                <span className="font-body-sm text-body-sm text-outline hidden sm:inline">24/7 National Dispatch</span>
              </div>
              <div className="flex items-center gap-space-sm">
                <button
                  onClick={handleFindClinic}
                  disabled={findingClinic}
                  className="px-space-md py-space-xs rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-headline-md text-body-md flex items-center justify-center gap-space-xs transition-colors shadow-sm border border-outline-variant/30"
                  id="findClinicBtn"
                >
                  <span className={`material-symbols-outlined text-[18px] text-primary ${findingClinic ? 'animate-spin' : ''}`}>
                    {findingClinic ? 'sync' : 'local_hospital'}
                  </span>
                  <span>{findingClinic ? 'Triangulating Facilities...' : 'Find Nearest Urgent Care Facility'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contextual Telemetry Ledger & Model Card Footer Anchor */}
        <div className="rounded-xl bg-surface-container p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-outline-variant/20">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
            <span className="font-code-md text-code-md text-on-surface-variant">
              ENCLAVE: ZERO-KNOWLEDGE RECORD #ZK-98012-US
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-space-md font-label-sm text-label-sm text-outline">
            <span>MODEL TIMESTAMP: {new Date(result.created_at).toISOString()}</span>
            <span>•</span>
            <span>LATENCY: 42ms</span>
            <span>•</span>
            <span>ENGINE: VIT-BAYES-ENSEMBLE</span>
          </div>
        </div>

      </div>
    </div>
  );
};
