import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/20 py-space-2xl mt-space-3xl">
      <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg pb-space-lg border-b border-outline-variant/10">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">VITALIS</span>
            <span className="font-code-md text-code-md text-outline">| CLINICAL PREDICTION SUITE</span>
          </div>

          <div className="flex flex-wrap items-center gap-space-md font-label-sm text-label-sm text-on-surface-variant">
            <button 
              onClick={() => onNavigate('ml-architecture')}
              className="hover:text-primary transition-colors focus:outline-none"
            >
              Precision Calibration
            </button>
            <span className="text-outline-variant">•</span>
            <button 
              onClick={() => onNavigate('ml-architecture')}
              className="hover:text-primary transition-colors focus:outline-none"
            >
              Algorithmic Governance
            </button>
            <span className="text-outline-variant">•</span>
            <span className="text-outline">Zero-Retention Local Vault & HIPAA Privacy Protocol</span>
          </div>
        </div>

        <div className="pt-space-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
          <p className="font-body-sm text-body-sm text-outline max-w-4xl leading-relaxed">
            VITALIS is an educational and analytical health awareness platform powered by probabilistic machine learning models. It does not provide medical diagnoses or replace licensed clinical judgment. In case of acute symptoms, contact emergency medical care immediately.
          </p>
          <div className="font-code-md text-code-md text-outline-variant flex-shrink-0">
            © 2026 VITALIS LABS INC. TELEMETRY ACTIVE.
          </div>
        </div>

      </div>
    </footer>
  );
};