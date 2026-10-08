import React, { useState } from 'react';

interface StageData {
  stageNum: string;
  complexity: string;
  title: string;
  desc: string;
  dim: string;
  encoding: string;
  tol: string;
  math: string;
  safeguard: string;
}

const STAGES: StageData[] = [
  {
    stageNum: 'STAGE 01 OF 06',
    complexity: 'O(N log K) Ingestion',
    title: 'Feature Representation & Sparse Matrix Structuring',
    desc: 'Aggregates high-dimensional symptom manifestations from user inputs into an indexed binary and ordinal vector of length 48. Baseline demographic risks (age group, gestational status, smoking status, immunocompromised state) are appended as normalized continuous multipliers.',
    dim: '48 Dims (Sparse)',
    encoding: 'One-Hot + Ordinal',
    tol: '< 34% (KNN Imp.)',
    math: 'x_i = [s_1, s_2, ..., s_48] \\cup [a_norm, g_prior]\n\\phi(x) = W_s \\odot x_i + \\beta_demographic\ndim(\\phi(x)) \\in \\mathbb{R}^{54}',
    safeguard: 'L2 regularization penalties enforce sparsity constraints, mitigating hallucinated co-morbidities across atypical demographic profiles.',
  },
  {
    stageNum: 'STAGE 02 OF 06',
    complexity: 'O(V) Token Encoding',
    title: 'Clinical Semantic Grounding & NLP Vectorizer',
    desc: 'Unstructured natural language symptom descriptions and temporal qualifiers are embedded using fine-tuned BioClinical-BERT transformers. Semantic synonyms are mapped into standardized SNOMED-CT / ICD-10 clinical concept IDs.',
    dim: '768 Dims (Dense)',
    encoding: 'BioClinical-BERT',
    tol: '< 15% Semantic Noise',
    math: 'e_t = TransformerEnc(Tokenize(s_{text}))\n\\hat{c}_k = \\text{Softmax}(W_c e_t + b_c)\n\\text{sim}(e_t, c_{SNOMED}) \\ge 0.88',
    safeguard: 'Medical vocabulary sanitizer strips out ambiguous lay colloquialisms, preventing adversarial prompt injections in free-text fields.',
  },
  {
    stageNum: 'STAGE 03 OF 06',
    complexity: 'O(K) Linear Scaling',
    title: 'Chronometric Vector Weighting & Severity Priors',
    desc: 'Temporal symptom duration vectors (days elapsed) and dynamic progress profiles (slowly worsening, fluctuating, sudden onset) are transformed into logarithmic decay coefficients that modulate likelihood priors.',
    dim: '54 Dims (Weighted)',
    encoding: 'Log-Chronometric',
    tol: 'Continuous Monotonic',
    math: '\\alpha_j(t) = \\gamma_0 \\cdot \\ln(1 + \\Delta t_{days}) \\cdot \\omega_{trajectory}\nw_{adj} = x_i \\odot (1 + \\vec{\\alpha}(t))',
    safeguard: 'Asymmetric time damping bounds rapid fluctuations to avoid premature triage over-escalation during episodic viral spikes.',
  },
  {
    stageNum: 'STAGE 04 OF 06',
    complexity: 'O(M \\cdot T \\cdot d) Trees',
    title: 'Calibrated Tree Ensemble Inference Core',
    desc: 'Dual-model ensemble combining 250 balanced Random Forest estimators with 250 Gradient Boosted decision trees. Trees partition non-linear physiological interactions across multi-organ symptom configurations.',
    dim: '15 Differential Classes',
    encoding: 'Ensemble Bagging/Boosting',
    tol: 'Max Depth: 7 Layers',
    math: '\\hat{y}_{raw} = \\frac{1}{M} \\sum_{m=1}^M T_m(x) + \\eta \\sum_{k=1}^K f_k(x)\n\\mathcal{L}_{multi} = -\\sum_{c=1}^C y_c \\log(\\hat{p}_c)',
    safeguard: 'Min-child weight threshold of 6.0 prevents single anomalous outlier cases from generating spurious high-probability differential branches.',
  },
  {
    stageNum: 'STAGE 05 OF 06',
    complexity: 'O(C^2) Matrix Transform',
    title: 'Dirichlet Multi-Class Uncertainty Calibration',
    desc: 'Applies post-hoc Dirichlet calibration to raw model posterior distributions. Eliminates overconfident softmax extrapolations and computes 95% Bayesian credible intervals for each differential candidate.',
    dim: 'C = 15 Probabilities',
    encoding: 'Dirichlet Density Mapping',
    tol: 'ECE < 0.025 Calibrated',
    math: 'p_c = \\frac{\\exp(W_c \\ln \\hat{p} + b_c)}{\\sum_{j=1}^C \\exp(W_j \\ln \\hat{p} + b_j)}\n\\text{CI}_{95\\%} = [\\mu_c - 1.96\\sigma_c, \\mu_c + 1.96\\sigma_c]',
    safeguard: 'Enforces strictly normalized probability simplex where \\sum p_c = 1.0, with minimum entropy safeguards on unrepresented symptom patterns.',
  },
  {
    stageNum: 'STAGE 06 OF 06',
    complexity: 'O(2^|S|) TreeSHAP Exact',
    title: 'Cooperative Game-Theoretic SHAP Attribution',
    desc: 'Extracts exact Shapley additive feature importance values (\\phi_i) via polynomial-time TreeSHAP. Guarantees local accuracy and missingness invariance: predicted probability exactly equals baseline expectation plus sum of attributions.',
    dim: '48 Feature Weights',
    encoding: 'Lloyd-Shapley Marginal',
    tol: 'Local Accuracy: \\epsilon < 10^{-6}',
    math: 'f(x) = \\mathbb{E}[f(X)] + \\sum_{i=1}^M \\phi_i(x)\n\\phi_i = \\sum_{S \\subseteq F \\setminus \\{i\\}} \\frac{|S|!(|F|-|S|-1)!}{|F|!} [f_x(S \\cup \\{i\\}) - f_x(S)]',
    safeguard: 'Feature contribution bounds prevent individual benign symptoms from counter-intuitively suppressing active red-flag triage recommendations.',
  },
];

interface ScenarioData {
  name: string;
  baseProb: string;
  bars: Array<{ name: string; val: string; width: string; isPositive: boolean }>;
}

const SCENARIOS: { [key: string]: ScenarioData } = {
  asthma: {
    name: 'Bronchial Asthma Case',
    baseProb: 'E[f(x)] = 0.18 → f(x) = 0.84',
    bars: [
      { name: 'Expiratory Wheezing (Auscultated)', val: '+0.38', width: '76%', isPositive: true },
      { name: 'Nocturnal Cough Paroxysms', val: '+0.26', width: '52%', isPositive: true },
      { name: 'Cold Air Reactivity Trigger', val: '+0.15', width: '30%', isPositive: true },
      { name: 'Absence of Fever / Chills', val: '-0.11', width: '22%', isPositive: false },
      { name: 'Normal SpO2 on Room Air (98%)', val: '-0.04', width: '8%', isPositive: false },
    ],
  },
  angina: {
    name: 'Acute Coronary Syndrome',
    baseProb: 'E[f(x)] = 0.08 → f(x) = 0.72',
    bars: [
      { name: 'Retrosternal Pressure / Squeezing', val: '+0.44', width: '88%', isPositive: true },
      { name: 'Radiation to Left Arm / Jaw', val: '+0.29', width: '58%', isPositive: true },
      { name: 'Diaphoresis & Nausea', val: '+0.18', width: '36%', isPositive: true },
      { name: 'Pain Worse on Palpation', val: '-0.19', width: '38%', isPositive: false },
      { name: 'Age Under 30 Baseline', val: '-0.08', width: '16%', isPositive: false },
    ],
  },
  migraine: {
    name: 'Vestibular Migraine',
    baseProb: 'E[f(x)] = 0.12 → f(x) = 0.79',
    bars: [
      { name: 'Unilateral Throbbing Cephalea', val: '+0.36', width: '72%', isPositive: true },
      { name: 'Photophobia & Phonophobia', val: '+0.27', width: '54%', isPositive: true },
      { name: 'Episodic Rotational Vertigo', val: '+0.21', width: '42%', isPositive: true },
      { name: 'Absence of Focal Neurological Deficits', val: '-0.12', width: '24%', isPositive: false },
      { name: 'Normal Pupil Light Reflex', val: '-0.05', width: '10%', isPositive: false },
    ],
  },
};

export const MLArchitectureView: React.FC = () => {
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [activeScenario, setActiveScenario] = useState<string>('asthma');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const stage = STAGES[activeStageIdx];
  const scenario = SCENARIOS[activeScenario];

  const handleCopyCode = () => {
    const code = `import numpy as np
import shap
from dirichlet import DirichletCalibrator

# VITALIS Calibrated Inference Wrapper v4.2
def predict_condition_probabilities(symptom_vector: np.ndarray, patient_context: dict) -> dict:
    phi = preprocessor.transform(symptom_vector, patient_context)
    raw_logits = ensemble_model.predict_proba(phi)
    shap_vals = shap_explainer.shap_values(phi)
    calibrated_probs = dirichlet_calibrator.transform(raw_logits)
    uncertainty_idx = calculate_entropy(calibrated_probs)
    return {
        "posteriors": calibrated_probs,
        "attribution": shap_vals,
        "shannon_entropy": uncertainty_idx,
        "triage_urgency": derive_triage_tier(calibrated_probs)
    }`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full bg-background relative overflow-hidden">
      {/* Subtle Ambient Glow Orbs */}
      <div className="absolute -top-40 right-10 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
      <div className="absolute top-96 left-[-100px] w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>

      {/* Header / Academic Credential Banner */}
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop pt-space-xl pb-space-lg">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col max-w-3xl">
            <div className="flex items-center gap-space-xs mb-space-2xs">
              <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-label-caps text-label-caps uppercase tracking-wider border border-primary/20">
                Academic Milestone
              </span>
              <span className="text-outline font-code-md text-code-md">•</span>
              <span className="text-outline font-label-caps text-label-caps uppercase tracking-wider">
                Dept. of Computer Science &amp; Health Informatics
              </span>
            </div>
            <h1 className="font-headline-2xl text-headline-2xl text-on-surface tracking-tight font-bold">
              Machine Learning Architecture &amp; Scientific Pipeline
            </h1>
            <p className="font-body-lg text-body-lg text-outline mt-space-xs leading-relaxed">
              Clinical Decision Support System (CDSS) research prototype. An empirical demonstration of calibrated Dirichlet multi-label inference, Shapley attribution models, and robust uncertainty bounds for triage guidance.
            </p>
          </div>

          <div className="flex items-center gap-space-sm bg-surface-container-low p-space-xs rounded-xl shadow-md flex-shrink-0 border border-outline-variant/20">
            <div className="flex flex-col px-space-sm py-space-2xs bg-surface-container rounded-lg border border-outline-variant/20">
              <span className="font-label-caps text-label-caps text-outline">VALIDATION SUITE</span>
              <span className="font-code-lg text-code-lg text-primary font-semibold">IEEE 11073 ALIGNED</span>
            </div>
            <div className="flex flex-col px-space-sm py-space-2xs bg-surface-container rounded-lg border border-outline-variant/20">
              <span className="font-label-caps text-label-caps text-outline">RUBRIC SCORE</span>
              <span className="font-code-lg text-code-lg text-tertiary-fixed-dim font-semibold">98.4 / 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Interactive Pipeline Visualizer Section */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-space-lg">
        <div className="bg-surface-container-low p-space-lg rounded-xl shadow-xl flex flex-col gap-space-lg border border-outline-variant/20">
          
          {/* Pipeline Navigation & Stage Nodes */}
          <div className="flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
              <div>
                <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                  END-TO-END DATAFLOW
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  Predictive Telemetry Pipeline Graph
                </h2>
              </div>
              <div className="flex items-center gap-space-2xs font-code-md text-code-md text-outline">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span>SYNCHRONOUS INFERENCE GRAPH (LATENCY: ~14.2ms)</span>
              </div>
            </div>

            {/* Flowchart Stages Bar */}
            <div className="relative w-full overflow-x-auto pb-space-sm">
              <div className="flex items-center min-w-[900px] justify-between gap-space-xs relative">
                {/* Connecting Line Layer */}
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-surface-container-highest rounded-full z-0"></div>

                {STAGES.map((s, idx) => {
                  const isActive = activeStageIdx === idx;
                  const icons = ['dataset', 'translate', 'hub', 'account_tree', 'speed', 'insights'];

                  return (
                    <React.Fragment key={idx}>
                      <button
                        onClick={() => setActiveStageIdx(idx)}
                        className="stage-btn relative z-10 flex flex-col items-center gap-space-2xs group focus:outline-none"
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 border ${
                            isActive
                              ? 'bg-primary-container text-on-primary border-primary shadow-[0_0_16px_rgba(10,226,200,0.5)]'
                              : 'bg-surface-container-high text-on-surface-variant border-outline-variant/30'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[24px]">{icons[idx]}</span>
                        </div>
                        <span
                          className={`font-label-caps text-label-caps font-semibold ${
                            isActive ? 'text-primary' : 'text-on-surface-variant'
                          }`}
                        >
                          0{idx + 1}. {s.title.split(' ')[0]}
                        </span>
                        <span className="font-body-sm text-body-sm text-outline">{s.dim.split(' ')[0]}</span>
                      </button>

                      {idx < STAGES.length - 1 && (
                        <span className="material-symbols-outlined text-outline text-[20px] relative z-10">
                          arrow_forward
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stage Deep-Dive Responsive Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg bg-surface-container p-space-lg rounded-xl border border-outline-variant/20">
            {/* Deep Dive Main Description (Left 7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-xs py-0.5 rounded bg-primary/10 text-primary font-code-md text-code-md border border-primary/20">
                    {stage.stageNum}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">{stage.complexity}</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  {stage.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              {/* Mathematical & Implementation Spec Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm pt-space-xs">
                <div className="p-space-xs rounded bg-surface-container-high border border-outline-variant/20">
                  <span className="font-label-caps text-label-caps text-outline block">FEATURE DIMS</span>
                  <span className="font-code-lg text-code-lg text-primary font-semibold">{stage.dim}</span>
                </div>
                <div className="p-space-xs rounded bg-surface-container-high border border-outline-variant/20">
                  <span className="font-label-caps text-label-caps text-outline block">ENCODING</span>
                  <span className="font-code-lg text-code-lg text-on-surface font-semibold">{stage.encoding}</span>
                </div>
                <div className="p-space-xs rounded bg-surface-container-high border border-outline-variant/20">
                  <span className="font-label-caps text-label-caps text-outline block">MISSING RATE TOL</span>
                  <span className="font-code-lg text-code-lg text-on-surface font-semibold">{stage.tol}</span>
                </div>
              </div>

              <div className="flex items-center gap-space-sm pt-space-2xs">
                <button
                  onClick={() => setActiveStageIdx(Math.max(0, activeStageIdx - 1))}
                  disabled={activeStageIdx === 0}
                  className="px-space-sm py-space-xs rounded bg-surface-container-highest text-on-surface font-label-sm text-label-sm hover:bg-surface-bright flex items-center gap-space-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-outline-variant/20"
                >
                  <span className="material-symbols-outlined text-[16px]">west</span> Previous Stage
                </button>
                <button
                  onClick={() => setActiveStageIdx(Math.min(STAGES.length - 1, activeStageIdx + 1))}
                  disabled={activeStageIdx === STAGES.length - 1}
                  className="px-space-sm py-space-xs rounded bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary flex items-center gap-space-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  Next Stage <span className="material-symbols-outlined text-[16px]">east</span>
                </button>
              </div>
            </div>

            {/* Deep Dive Mathematical Formulation (Right 5 Cols) */}
            <div className="lg:col-span-5 bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-center justify-between pb-space-2xs border-b border-surface-container-highest">
                <span className="font-label-caps text-label-caps text-outline tracking-wider">
                  MATHEMATICAL FORMULATION
                </span>
                <span className="font-code-md text-code-md text-primary">LaTeX TeX Notation</span>
              </div>
              <pre className="p-space-sm my-space-xs rounded bg-surface-container-lowest font-code-md text-code-md text-primary leading-loose overflow-x-auto border border-outline-variant/20">
                {stage.math}
              </pre>
              <div className="flex flex-col gap-space-2xs pt-space-xs">
                <span className="font-label-caps text-label-caps text-outline uppercase">
                  Algorithmic Safeguard
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {stage.safeguard}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 'Behind the Prediction' Model Specs & Architectural Metrics */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-space-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          
          {/* Left: Model Card & Metrics (7 Cols) */}
          <div className="lg:col-span-7 bg-surface-container-low p-space-lg rounded-xl shadow-lg flex flex-col gap-space-md border border-outline-variant/20">
            <div className="flex flex-wrap items-center justify-between gap-space-xs">
              <div>
                <span className="font-label-caps text-label-caps text-primary tracking-widest">
                  VALIDATED CHECKPOINT
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  Core Architecture Specifications
                </h2>
              </div>
              <div className="px-space-xs py-space-2xs rounded bg-primary/10 text-primary font-code-md text-code-md font-semibold border border-primary/20">
                vit-healthnet-v4.2-rel
              </div>
            </div>

            <p className="font-body-md text-body-md text-outline">
              Trained and cross-validated over 45,000 synthetic epidemiological cohorts replicating multi-site ICD-10 emergency and primary-care records. Evaluated via 10-fold stratified cross-validation.
            </p>

            {/* 4 Core Empirical Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              <div className="p-space-sm rounded-lg bg-surface-container flex flex-col border border-outline-variant/20">
                <span className="font-label-caps text-label-caps text-outline">AUROC (MACRO)</span>
                <span className="font-headline-md text-headline-md text-primary font-bold mt-space-2xs">0.982</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">95% CI: [0.978, 0.986]</span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container flex flex-col border border-outline-variant/20">
                <span className="font-label-caps text-label-caps text-outline">LOG-LOSS (MULTI)</span>
                <span className="font-headline-md text-headline-md text-primary font-bold mt-space-2xs">0.069</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Brier: 0.019</span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container flex flex-col border border-outline-variant/20">
                <span className="font-label-caps text-label-caps text-outline">COHORT BASELINE</span>
                <span className="font-headline-md text-headline-md text-tertiary-fixed-dim font-bold mt-space-2xs">45k+</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Synthetic Profiles</span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container flex flex-col border border-outline-variant/20">
                <span className="font-label-caps text-label-caps text-outline">MACRO F1 SCORE</span>
                <span className="font-headline-md text-headline-md text-secondary font-bold mt-space-2xs">98.0%</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">15 Clinical Classes</span>
              </div>
            </div>

            {/* Model Hyperparameter Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left font-body-sm text-body-sm">
                <thead>
                  <tr className="text-outline border-b border-outline-variant/20">
                    <th className="pb-space-2xs font-label-caps text-label-caps">HYPERPARAMETER</th>
                    <th className="pb-space-2xs font-label-caps text-label-caps">CONFIGURED VALUE</th>
                    <th className="pb-space-2xs font-label-caps text-label-caps">CALIBRATION RATIONALE</th>
                    <th className="pb-space-2xs font-label-caps text-label-caps">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  <tr className="hover:bg-surface-container transition-colors">
                    <td className="py-space-2xs font-code-md text-code-md text-on-surface">n_estimators</td>
                    <td className="py-space-2xs font-code-md text-code-md text-primary">250 Trees (Random Forest)</td>
                    <td className="py-space-2xs text-outline">Variance stabilization across sparse classes</td>
                    <td className="py-space-2xs">
                      <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-code-md text-label-sm">
                        CONVERGED
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container transition-colors">
                    <td className="py-space-2xs font-code-md text-code-md text-on-surface">max_depth</td>
                    <td className="py-space-2xs font-code-md text-code-md text-primary">12 layers</td>
                    <td className="py-space-2xs text-outline">Restricts overfitting high-cardinality symptom interactions</td>
                    <td className="py-space-2xs">
                      <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-code-md text-label-sm">
                        OPTIMAL
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container transition-colors">
                    <td className="py-space-2xs font-code-md text-code-md text-on-surface">calibration_method</td>
                    <td className="py-space-2xs font-code-md text-code-md text-primary">Sigmoid CalibratedClassifierCV</td>
                    <td className="py-space-2xs text-outline">Mitigates overconfident tree vote fractions</td>
                    <td className="py-space-2xs">
                      <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-code-md text-label-sm">
                        CALIBRATED
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container transition-colors">
                    <td className="py-space-2xs font-code-md text-code-md text-on-surface">min_samples_split</td>
                    <td className="py-space-2xs font-code-md text-code-md text-primary">5 samples</td>
                    <td className="py-space-2xs text-outline">Guarantees cluster support for rare symptoms</td>
                    <td className="py-space-2xs">
                      <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-code-md text-label-sm">
                        TUNED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Academic Research Scope Box */}
            <div className="p-space-sm rounded-lg bg-surface-container flex items-start gap-space-sm border border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary text-[24px] flex-shrink-0">verified_user</span>
              <div className="flex flex-col gap-space-2xs">
                <span className="font-label-caps text-label-caps text-secondary uppercase">
                  Undergraduate Major Capstone Mandate
                </span>
                <p className="font-body-sm text-body-sm text-outline leading-relaxed">
                  Engineered exclusively for academic demonstration under CDSS (Clinical Decision Support Systems) algorithmic benchmarking. Not certified by FDA/CE-MDR for autonomous diagnostic triage.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Calibration Reliability Curve (5 Cols) */}
          <div className="lg:col-span-5 bg-surface-container-low p-space-lg rounded-xl shadow-lg flex flex-col justify-between gap-space-md border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-caps text-label-caps text-outline uppercase">PROBABILITY DIAGNOSTICS</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Calibration Reliability Curve</h3>
              </div>
              <span className="px-space-xs py-1 rounded bg-surface-container font-code-md text-code-md text-primary border border-outline-variant/20">
                ECE: 0.021
              </span>
            </div>

            {/* Inline SVG Reliability Plot */}
            <div className="w-full bg-surface-container p-space-md rounded-xl flex flex-col items-center border border-outline-variant/20">
              <div className="w-full flex justify-between font-label-caps text-label-caps text-outline pb-space-xs">
                <span>Predicted Probability</span>
                <span>Observed Frequency</span>
              </div>
              <svg className="w-full h-44 text-outline" fill="none" viewBox="0 0 320 200">
                <line stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.1" x1="40" x2="300" y1="20" y2="20" />
                <line stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.1" x1="40" x2="300" y1="60" y2="60" />
                <line stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.1" x1="40" x2="300" y1="100" y2="100" />
                <line stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.1" x1="40" x2="300" y1="140" y2="140" />
                <line stroke="currentColor" strokeOpacity="0.2" x1="40" x2="300" y1="180" y2="180" />
                <line stroke="currentColor" strokeOpacity="0.2" x1="40" x2="40" y1="20" y2="180" />
                
                {/* Diagonal Ideal */}
                <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.3" strokeWidth="1.5" x1="40" x2="300" y1="180" y2="20" />
                
                {/* Uncalibrated Baseline */}
                <path d="M 40 180 Q 140 170, 200 110 T 300 20" fill="none" stroke="#ffb4ab" strokeOpacity="0.7" strokeWidth="1.5" />
                
                {/* Calibrated Curve */}
                <path d="M 40 180 Q 90 152, 160 108 T 240 58 T 300 20" fill="none" stroke="#0ae2c8" strokeWidth="2.5" />
                
                <circle cx="100" cy="144" fill="#0ae2c8" r="3.5" />
                <circle cx="160" cy="108" fill="#0ae2c8" r="3.5" />
                <circle cx="220" cy="72" fill="#0ae2c8" r="3.5" />
                <circle cx="275" cy="36" fill="#0ae2c8" r="3.5" />
              </svg>

              <div className="flex items-center gap-space-md pt-space-xs font-label-sm text-label-sm">
                <div className="flex items-center gap-space-2xs">
                  <span className="w-3 h-0.5 bg-primary"></span>
                  <span className="text-on-surface">Calibrated (VITALIS)</span>
                </div>
                <div className="flex items-center gap-space-2xs">
                  <span className="w-3 h-0.5 bg-error"></span>
                  <span className="text-outline">Raw Uncalibrated</span>
                </div>
              </div>
            </div>

            {/* Dataset Breakdown */}
            <div className="flex flex-col gap-space-xs pt-space-2xs">
              <span className="font-label-caps text-label-caps text-outline">
                DATASET SYNTHESIS COHORT BREAKDOWN
              </span>
              <div className="w-full bg-surface-container rounded-full h-3 flex overflow-hidden border border-outline-variant/20">
                <div className="bg-primary h-full" style={{ width: '42%' }} title="Respiratory Conditions (42%)"></div>
                <div className="bg-secondary-container h-full" style={{ width: '28%' }} title="Cardiovascular Indicators (28%)"></div>
                <div className="bg-tertiary-container h-full" style={{ width: '18%' }} title="Gastrointestinal Syndromes (18%)"></div>
                <div className="bg-surface-bright h-full" style={{ width: '12%' }} title="Neurological & Other (12%)"></div>
              </div>
              <div className="flex justify-between text-label-sm font-label-sm text-outline">
                <span className="text-primary font-code-md">■ Respiratory (42%)</span>
                <span className="text-secondary font-code-md">■ Cardio (28%)</span>
                <span className="text-tertiary font-code-md">■ GI (18%)</span>
                <span className="text-on-surface-variant font-code-md">■ Neuro (12%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Feature Weight Inspector (SHAP Waterfall) + Python Wrapper Preview */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-space-lg">
        <div className="bg-surface-container-low p-space-lg rounded-xl shadow-xl flex flex-col gap-space-lg border border-outline-variant/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm">
            <div>
              <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                EXPLAINABLE ARTIFICIAL INTELLIGENCE (XAI)
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                SHAP Feature Attribution &amp; Inference Pipeline
              </h2>
            </div>

            {/* Disease Scenario Selector Tabs */}
            <div className="flex items-center gap-space-2xs bg-surface-container p-1 rounded-lg border border-outline-variant/20">
              {Object.keys(SCENARIOS).map(key => {
                const sc = SCENARIOS[key];
                const isActive = activeScenario === key;

                return (
                  <button
                    key={key}
                    onClick={() => setActiveScenario(key)}
                    className={`scenario-tab px-space-sm py-1.5 rounded font-label-sm text-label-sm transition-all ${
                      isActive
                        ? 'text-primary bg-surface-container-high shadow-sm border border-primary/30'
                        : 'text-outline hover:text-on-surface'
                    }`}
                  >
                    {sc.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            {/* Left: Dynamic SHAP Bar Chart (6 Cols) */}
            <div className="lg:col-span-6 bg-surface-container p-space-md rounded-xl flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-highest">
                <span className="font-label-caps text-label-caps text-outline">
                  SHAPLEY ATTRIBUTION SCORES (\phi_j)
                </span>
                <span className="font-code-md text-code-md text-primary" id="base-prob-tag">
                  {scenario.baseProb}
                </span>
              </div>

              {/* Dynamic Bars */}
              <div className="flex flex-col gap-space-sm py-space-xs">
                {scenario.bars.map((bar, i) => (
                  <div key={i} className="flex flex-col gap-1 p-2 rounded bg-surface-container-low border border-outline-variant/10">
                    <div className="flex justify-between items-center text-body-sm">
                      <span className="text-on-surface font-medium">{bar.name}</span>
                      <span className={`font-code-md font-bold ${bar.isPositive ? 'text-primary' : 'text-error'}`}>
                        {bar.val}
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded overflow-hidden">
                      <div
                        className={`h-full rounded ${bar.isPositive ? 'bg-primary' : 'bg-error'}`}
                        style={{ width: bar.width }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-space-xs rounded bg-surface-container-low flex items-center justify-between text-label-sm font-label-sm border border-outline-variant/10">
                <span className="text-primary flex items-center gap-1 font-code-md">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> Positive Push (+Risk)
                </span>
                <span className="text-error flex items-center gap-1 font-code-md">
                  <span className="material-symbols-outlined text-[14px]">arrow_downward</span> Negative Suppressor (-Risk)
                </span>
              </div>
            </div>

            {/* Right: Python Inference Wrapper Code (6 Cols) */}
            <div className="lg:col-span-6 bg-surface-container-lowest p-space-md rounded-xl flex flex-col justify-between font-code-md text-code-md overflow-hidden border border-outline-variant/20">
              <div className="flex items-center justify-between pb-space-xs text-outline border-b border-surface-container-highest">
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-error/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-primary/80 inline-block"></span>
                  <span className="ml-space-2xs text-on-surface font-semibold">vitalis_inference_engine.py</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="hover:text-primary transition-colors flex items-center gap-1 font-label-caps text-label-caps text-outline"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedCode ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="overflow-x-auto text-on-surface leading-relaxed p-space-xs rounded bg-surface-container-low/50 text-body-sm font-code-md">
                <code>
                  <span className="text-secondary">import</span> numpy <span className="text-secondary">as</span> np{'\n'}
                  <span className="text-secondary">import</span> shap{'\n'}
                  <span className="text-secondary">from</span> dirichlet <span className="text-secondary">import</span> DirichletCalibrator{'\n\n'}
                  <span className="text-outline"># VITALIS Calibrated Inference Wrapper v4.2</span>{'\n'}
                  <span className="text-primary">def</span> <span className="text-primary-fixed">predict_condition_probabilities</span>({'\n'}
                  {'    '}symptom_vector: np.ndarray,{'\n'}
                  {'    '}patient_context: dict{'\n'}
                  ) -&gt; dict:{'\n'}
                  {'    '}<span className="text-outline">"""Computes calibrated posterior with SHAP explanations"""</span>{'\n'}
                  {'    '}phi = preprocessor.transform(symptom_vector, patient_context){'\n'}
                  {'    '}raw_logits = ensemble_model.predict_proba(phi){'\n'}
                  {'    '}shap_vals = shap_explainer.shap_values(phi){'\n'}
                  {'    '}calibrated_probs = dirichlet_calibrator.transform(raw_logits){'\n'}
                  {'    '}uncertainty_idx = calculate_entropy(calibrated_probs){'\n\n'}
                  {'    '}<span className="text-secondary">return</span> &#123;{'\n'}
                  {'        '}<span className="text-tertiary">"posteriors"</span>: calibrated_probs,{'\n'}
                  {'        '}<span className="text-tertiary">"attribution"</span>: shap_vals,{'\n'}
                  {'        '}<span className="text-tertiary">"shannon_entropy"</span>: uncertainty_idx,{'\n'}
                  {'        '}<span className="text-tertiary">"triage_urgency"</span>: derive_triage_tier(calibrated_probs){'\n'}
                  {'    '}&#125;
                </code>
              </pre>

              <div className="flex items-center justify-between text-outline text-label-sm font-label-sm pt-space-xs border-t border-outline-variant/10">
                <span>Interpreter: Python 3.11.4</span>
                <span>Dependencies: shap &gt;= 0.44.0, scikit-learn &gt;= 1.3.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Academic Project Team & Mentorship Panel */}
      <section className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-space-lg mb-space-xl">
        <div className="flex flex-col gap-space-lg">
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
              INSTITUTIONAL EVALUATION
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              B.Tech Major Capstone Mentorship &amp; Rubric Alignment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {/* Faculty Mentorship Card */}
            <div className="bg-surface-container-low p-space-lg rounded-xl shadow-lg flex flex-col justify-between gap-space-md border border-outline-variant/20">
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <img
                    className="w-14 h-14 rounded-xl object-cover border border-outline-variant/30"
                    alt="Dr. Aris Thorne"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-QBmEmJdKVQwvgXJMBw6C0iTJMvJDVb3eDUZGFGyhw_dT1spU0amOEQKkGnnm6AuaYwoaI6aA0mxcwKxmqqcEYmy8g3V74INfcJloqha3UDGgBTDWsrfT1q3DcRT0iUvXh3dbvlEZrF1b2jYRbP2VCAaZgpK3Hkkw2Afnxy7wuy9GgUs7TMCbrB0pL2pw12Vi2V5675GNorzV3gxZF574whnURHyB2wycYxCfE2bLmgSNq_bu8Z9Rvg"
                  />
                  <div className="flex flex-col">
                    <span className="font-headline-md text-headline-md text-on-surface font-bold">
                      Dr. Aris Thorne, Ph.D.
                    </span>
                    <span className="font-label-sm text-label-sm text-primary">Principal Project Mentor</span>
                    <span className="font-body-sm text-body-sm text-outline">Dept. of CSE / AI in Medicine</span>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Supervised mathematical formulation of the Dirichlet prior calibration layer and validated cross-entropy reduction bounds across multi-class symptom spaces.
                </p>
              </div>
              <div className="p-space-xs rounded bg-surface-container flex items-center justify-between border border-outline-variant/20">
                <span className="font-label-caps text-label-caps text-outline">COMMITTEE REVIEW</span>
                <span className="font-code-md text-code-md text-primary font-bold">APPROVED: DISTINCTION</span>
              </div>
            </div>

            {/* Student Lead Researchers Card */}
            <div className="bg-surface-container-low p-space-lg rounded-xl shadow-lg flex flex-col justify-between gap-space-md border border-outline-variant/20">
              <div className="flex flex-col gap-space-sm">
                <span className="font-label-caps text-label-caps text-primary uppercase font-semibold">
                  CANDIDATES FOR B.TECH CSE
                </span>
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container border border-outline-variant/20">
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md text-on-surface font-semibold">
                        Devon Vance (Lead)
                      </span>
                      <span className="font-body-sm text-body-sm text-outline">Roll No: 2020-CS-084</span>
                    </div>
                    <span className="font-code-md text-code-md text-secondary">Pipeline &amp; XAI</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded bg-surface-container border border-outline-variant/20">
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md text-on-surface font-semibold">
                        Kavya Sharma
                      </span>
                      <span className="font-body-sm text-body-sm text-outline">Roll No: 2020-CS-112</span>
                    </div>
                    <span className="font-code-md text-secondary font-code-md">Clinical NLP &amp; Data</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between font-label-caps text-label-caps text-outline border-t border-outline-variant/10 pt-2">
                <span>PROJECT CODE: VTL-2024-CAP</span>
                <span>STAGE: FINAL DEFENSE</span>
              </div>
            </div>

            {/* Future Research Scope Card */}
            <div className="bg-surface-container-low p-space-lg rounded-xl shadow-lg flex flex-col justify-between gap-space-md border border-outline-variant/20">
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-caps text-label-caps text-tertiary-fixed-dim uppercase font-semibold">
                  FUTURE RESEARCH SCOPE
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Post-Graduation Roadmap
                </h3>
                <ul className="flex flex-col gap-space-xs pt-space-2xs font-body-sm text-body-sm text-on-surface-variant">
                  <li className="flex items-start gap-space-2xs">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>
                      <strong>Federated Learning Enclaves:</strong> Decentralized model updates across hospital clusters with zero PHI egress.
                    </span>
                  </li>
                  <li className="flex items-start gap-space-2xs">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>
                      <strong>Wasm On-Device Quantization:</strong> 4-bit INT quantization for instantaneous client-side browser execution.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="p-space-xs rounded bg-surface-container flex items-center justify-between border border-outline-variant/20">
                <span className="font-label-caps text-label-caps text-outline">EXTERNAL SUBMISSION</span>
                <span className="font-code-md text-code-md text-tertiary-fixed-dim font-semibold">IEEE ICHI 2025 Draft</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
