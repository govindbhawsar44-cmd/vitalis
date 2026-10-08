import React from 'react';
import { OrganScroll3D } from '../components/OrganScroll3D';

interface OverviewHeroViewProps {
  onNavigate: (path: string) => void;
}

export const OverviewHeroView: React.FC<OverviewHeroViewProps> = ({ onNavigate }) => {
  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* 3D Parallax Organ Scene in Background */}
      <OrganScroll3D />

      {/* Main Hero Container */}
      <section className="relative w-full z-10 px-margin-mobile md:px-margin-tablet xl:px-margin-desktop py-space-xl xl:py-space-3xl">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-gutter-desktop items-center">
          
          {/* Hero Left: Clinical Copy & Actions */}
          <div className="xl:col-span-7 flex flex-col z-10">
            
            <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-container-low border border-outline-variant/40 w-fit mb-space-lg shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="font-label-caps text-label-caps text-primary tracking-wider uppercase text-[11px]">
                ML-POWERED HEALTH AWARENESS • CLINICAL FEATURE VECTOR ANALYSIS
              </span>
            </div>

            <h1 className="font-headline-2xl text-headline-2xl text-on-surface tracking-tight mb-space-md max-w-2xl font-bold">
              Understand what your symptoms could be telling you.
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-space-xl leading-relaxed">
              Explore possible conditions, understand symptom patterns, and know when it may be time to seek professional care. Built on explainable probabilistic models calibrated against empirical medical literature.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-space-md mb-space-2xl">
              <button
                onClick={() => onNavigate('symptom-analyzer')}
                className="relative inline-flex items-center gap-space-xs px-space-xl py-space-sm rounded-lg bg-primary-container text-on-primary font-headline-md text-headline-md font-semibold transition-all hover:bg-primary shadow-[0_0_24px_rgba(10,226,200,0.35)] hover:shadow-[0_0_36px_rgba(10,226,200,0.6)] active:scale-[0.98]"
              >
                <span>Start Symptom Analysis</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>

              <button
                onClick={() => onNavigate('ml-architecture')}
                className="inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-surface-container-low text-on-surface font-headline-md text-headline-md font-medium hover:bg-surface-container hover:text-primary transition-all border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">schema</span>
                <span>Explore How It Works</span>
              </button>
            </div>

            {/* Governance Strip */}
            <div className="flex flex-wrap items-center gap-space-lg pt-space-lg border-t border-outline-variant/20 max-w-xl">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Dual-Layer Algorithmic Governance</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[18px]">privacy_tip</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Zero-Retention Local Vault</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px]">tune</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Empirical Weight Calibration</span>
              </div>
            </div>

          </div>

          {/* Hero Right: Holographic Telemetry Card */}
          <div className="xl:col-span-5 relative mt-space-xl xl:mt-0">
            <div className="relative w-full rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 backdrop-blur-xl p-space-md shadow-2xl overflow-hidden flex flex-col gap-space-md">
              
              <div className="flex items-center justify-between border-b border-surface-container-highest pb-space-2xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  <span className="font-code-md text-code-md text-primary font-bold">SYSTEM TELEMETRY // ONLINE</span>
                </div>
                <span className="font-code-md text-code-md text-outline">VIT-ML-v4.2</span>
              </div>

              <div className="flex flex-col gap-space-xs">
                <div className="flex justify-between items-center text-body-sm">
                  <span className="text-on-surface-variant">Model Architecture</span>
                  <span className="font-code-md text-primary font-semibold">Random Forest + GradBoost</span>
                </div>
                <div className="flex justify-between items-center text-body-sm">
                  <span className="text-on-surface-variant">Probability Calibration</span>
                  <span className="font-code-md text-secondary">Sigmoid / Dirichlet Density</span>
                </div>
                <div className="flex justify-between items-center text-body-sm">
                  <span className="text-on-surface-variant">Explainability Standard</span>
                  <span className="font-code-md text-tertiary font-semibold">TreeSHAP Cooperative Game Theory</span>
                </div>
                <div className="flex justify-between items-center text-body-sm">
                  <span className="text-on-surface-variant">Input Dimension</span>
                  <span className="font-code-md text-outline">48 Physiological Tokens</span>
                </div>
              </div>

              <div className="p-space-xs rounded-lg bg-surface-container-lowest flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[22px]">health_and_safety</span>
                <div className="flex flex-col">
                  <span className="font-headline-md text-body-sm text-on-surface font-bold">Deterministic Safety Layer</span>
                  <span className="text-[11px] text-outline">Emergency override triggers for chest pain, stridor & cyanosis.</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('symptom-analyzer')}
                className="w-full py-space-xs rounded bg-surface-container-high hover:bg-surface-bright text-primary font-headline-md text-body-sm font-semibold flex items-center justify-center gap-space-xs transition-colors"
              >
                <span>Launch Interactive Studio</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* 3 Core Architectural Pillars */}
      <section className="relative z-10 px-margin-mobile md:px-margin-tablet xl:px-margin-desktop py-space-2xl max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-space-xs mb-space-xl">
          <span className="font-label-caps text-label-caps text-primary uppercase">CLINICAL PRECISION FRAMEWORK</span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold">Why VITALIS?</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Most symptom checkers use unverified keyword heuristics or opaque black-box LLMs prone to medical hallucination. VITALIS anchors every prediction in verified biostatistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          
          <div className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-sm shadow-xl">
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">tune</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Calibrated Probabilities</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Output probabilities reflect true empirical empirical risk with 95% Dirichlet confidence intervals rather than arbitrary score percentages.
            </p>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-sm shadow-xl">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">waterfall_chart</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Explainable AI (SHAP)</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Every prediction exposes an additive Shapley force decomposition showing exactly which symptoms drove the score up and which ruled out alternatives.
            </p>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-sm shadow-xl">
            <div className="w-12 h-12 rounded-lg bg-error-container/20 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Safety Override System</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Emergent red flags bypass probabilistic scoring entirely, immediately directing users to emergency dispatch or urgent clinical auscultation.
            </p>
          </div>

        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="relative z-10 px-margin-mobile md:px-margin-tablet xl:px-margin-desktop py-space-xl max-w-[1440px] mx-auto">
        <div className="rounded-2xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low p-space-xl border border-outline-variant/40 flex flex-col md:flex-row items-center justify-between gap-space-lg shadow-2xl">
          <div className="flex flex-col gap-space-2xs">
            <h3 className="font-headline-xl text-headline-xl text-on-surface font-bold">Ready to analyze your symptoms?</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Begin a zero-knowledge diagnostic triangulation session in the interactive 3D studio.
            </p>
          </div>
          <button
            onClick={() => onNavigate('symptom-analyzer')}
            className="px-space-xl py-space-sm rounded-lg bg-primary-container text-on-primary font-headline-md text-headline-md font-bold hover:bg-primary transition-all shadow-xl active:scale-95 flex-shrink-0"
          >
            Start Analysis Now
          </button>
        </div>
      </section>

    </div>
  );
};