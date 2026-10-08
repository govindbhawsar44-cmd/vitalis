import React from 'react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: any[];
  onSelectSession: (sessionId: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-50 transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="absolute top-0 right-0 h-full w-full max-w-md bg-surface-container-low p-space-lg flex flex-col gap-space-lg shadow-2xl transition-transform duration-300 border-l border-outline-variant/30"
      >
        <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-highest">
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-primary uppercase">Saved Diagnostic Telemetry</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Historical Episodes</h2>
          </div>
          <button
            onClick={onClose}
            className="p-space-2xs rounded bg-surface-container-high text-on-surface hover:text-primary transition-colors focus:outline-none"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Review previously logged analytical sessions to contrast symptomatic correlation profiles and recovery timelines.
        </p>

        <div className="flex flex-col gap-space-md overflow-y-auto pr-1 flex-1">
          {sessions.length === 0 ? (
            <div className="p-space-lg rounded-lg bg-surface-container text-center flex flex-col items-center gap-space-xs border border-outline-variant/20">
              <span className="material-symbols-outlined text-outline text-[32px]">folder_off</span>
              <span className="font-body-md text-body-md text-on-surface font-semibold">No Historical Episodes Yet</span>
              <p className="font-body-sm text-body-sm text-outline">Run a symptom analysis to automatically record your first diagnostic episode.</p>
            </div>
          ) : (
            sessions.map((s, idx) => (
              <div
                key={s.id || idx}
                onClick={() => {
                  onSelectSession(s.id);
                  onClose();
                }}
                className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs shadow-sm cursor-pointer hover:bg-surface-container-high transition-colors group border border-outline-variant/20 hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-code-md text-code-md text-primary font-bold">{s.id}</span>
                  <span className={`px-space-2xs py-0.5 rounded font-label-caps text-label-caps ${
                    idx === 0 ? 'bg-primary-container text-on-primary font-bold' : 'bg-surface-container-highest text-outline'
                  }`}>
                    {idx === 0 ? 'CURRENT' : 'ARCHIVED'}
                  </span>
                </div>
                <span className="font-headline-md text-body-lg text-on-surface font-semibold group-hover:text-primary transition-colors">
                  {s.primary_condition || 'Clinical Analysis Session'}
                </span>
                <span className="font-body-sm text-body-sm text-outline">
                  {s.created_at ? new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                </span>
                <div className="flex items-center gap-space-sm pt-space-xs text-body-sm text-on-surface-variant">
                  <span>Probability: {Math.round((s.primary_probability || 65) > 1 ? s.primary_probability : (s.primary_probability || 0.65) * 100)}%</span>
                  <span>•</span>
                  <span>{s.symptom_count || 4} Symptoms</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto pt-space-md border-t border-surface-container-highest flex flex-col gap-space-xs">
          <button
            onClick={onClose}
            className="w-full py-space-sm rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-headline-md text-body-md transition-all flex items-center justify-center gap-space-xs focus:outline-none"
          >
            <span className="material-symbols-outlined text-[20px]">done</span>
            <span>Close Vault</span>
          </button>
        </div>
      </div>
    </div>
  );
};