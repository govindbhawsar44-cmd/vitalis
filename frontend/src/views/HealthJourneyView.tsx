import React from 'react';
import { Observation } from '../types';

interface HealthJourneyViewProps {
  observations: Observation[];
  onOpenObservationModal: () => void;
  onOpenHistoryDrawer: () => void;
  onExportReport: () => void;
  currentEpisodeId?: string;
}

export const HealthJourneyView: React.FC<HealthJourneyViewProps> = ({
  observations,
  onOpenObservationModal,
  onOpenHistoryDrawer,
  onExportReport,
  currentEpisodeId = 'TRK-9042-REV3',
}) => {
  // Default 3-day trajectory baseline if observations list is empty
  const displayObservations: Observation[] =
    observations.length > 0
      ? observations
      : [
          {
            id: 'obs-1',
            day_number: 1,
            date_str: 'OCT 24',
            severity: 2,
            temperature: 37.1,
            spo2: 98,
            clinical_notes:
              'Initial dry tickle in pharynx post-exercise. No systemic malaise, clear nasal passages, vital signs nominal.',
            created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          },
          {
            id: 'obs-2',
            day_number: 2,
            date_str: 'OCT 25',
            severity: 5,
            temperature: 38.0,
            spo2: 97,
            clinical_notes:
              'Dry cough worsened + Low fever onset. Evening chills reported. Oral temperature measured at 38.0°C. Hydration therapy initiated.',
            created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
          },
          {
            id: 'obs-3',
            day_number: 3,
            date_str: 'OCT 26 (TODAY)',
            severity: 6,
            temperature: 38.2,
            spo2: 97,
            clinical_notes:
              'Fatigue peaked, chest tightness noted during deep exhalation. Temperature 38.2°C at 12:45. SpO2 constant at 97%.',
            created_at: new Date().toISOString(),
          },
        ];

  return (
    <div className="relative w-full overflow-hidden bg-surface-container-lowest py-space-2xl px-margin-mobile md:px-margin-tablet lg:px-margin-desktop">
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -left-28 w-80 h-80 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto flex flex-col gap-space-2xl">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-space-lg pb-space-lg border-b border-outline-variant/20">
          <div className="flex flex-col gap-space-xs max-w-2xl">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                Telemetry Session active
              </span>
              <span className="text-outline text-body-sm">•</span>
              <span className="font-code-md text-code-md text-outline">EPISODE #{currentEpisodeId}</span>
            </div>
            <h1 className="font-headline-2xl text-headline-2xl text-on-surface tracking-tight font-bold">
              Longitudinal Recovery &amp; Action Protocol
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Deterministic triage pathways calibrated against 72-hour biometric progression. Track respiratory vectors and clinical safety thresholds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm w-full lg:w-auto">
            <button
              onClick={onOpenHistoryDrawer}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-md text-body-md transition-all shadow-md border border-outline-variant/30"
              id="open-drawer-btn"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">history_toggle_off</span>
              <span>Historical Logs ({displayObservations.length})</span>
            </button>

            <button
              onClick={onExportReport}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md text-body-md transition-all shadow-sm border border-outline-variant/30"
              id="export-summary-btn"
            >
              <span className="material-symbols-outlined text-secondary text-[20px]">sim_card_download</span>
              <span>Export Clinical PDF</span>
            </button>

            <button
              onClick={onOpenObservationModal}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded bg-primary-container text-on-primary font-headline-md text-headline-md font-semibold hover:bg-primary transition-all shadow-xl"
              id="log-observation-btn"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Log Daily Observation</span>
            </button>
          </div>
        </div>

        {/* Dynamic Clinical Pathway: 4 Stages */}
        <div className="relative w-full rounded-xl bg-surface-container-low p-space-lg md:p-space-xl shadow-xl border border-outline-variant/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-lg">
            <div>
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                Dynamic Clinical Pathway
              </span>
              <h2 className="font-headline-xl text-headline-xl text-on-surface font-semibold">
                Triage Progression Vectors
              </h2>
            </div>
            <div className="flex items-center gap-space-xs px-space-sm py-space-2xs rounded bg-surface-container text-on-surface-variant border border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
              <span className="font-label-sm text-label-sm">Standard CDC/WHO Ambulatory Pathway</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md relative">
            {/* Stage 1 */}
            <div className="relative p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs shadow-sm border border-primary/40">
              <div className="flex items-center justify-between">
                <span className="px-space-xs py-space-2xs rounded bg-primary-container text-on-primary font-label-caps text-label-caps font-bold">
                  STAGE 01
                </span>
                <span className="font-code-md text-code-md text-primary font-bold">TODAY • ACTIVE</span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface font-semibold pt-space-xs">
                TODAY
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Acute symptom onset isolation, high volume rehydration &amp; biomarker stabilization tracking.
              </p>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-space-xs">
                <div className="bg-primary h-full w-full"></div>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="relative p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs shadow-sm border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="px-space-xs py-space-2xs rounded bg-surface-container-highest text-on-surface-variant font-label-caps text-label-caps">
                  STAGE 02
                </span>
                <span className="font-code-md text-code-md text-outline">NEXT 24–48H</span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface font-semibold pt-space-xs">
                NEXT 24–48 HOURS
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Continuous temperature mapping, mucus profile evolution &amp; pulse oximeter monitoring.
              </p>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-space-xs">
                <div className="bg-primary/40 h-full w-1/3"></div>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="relative p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs shadow-sm border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="px-space-xs py-space-2xs rounded bg-surface-container-highest text-on-surface-variant font-label-caps text-label-caps">
                  STAGE 03
                </span>
                <span className="font-code-md text-code-md text-outline">DAYS 3–5</span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface font-semibold pt-space-xs">
                PERSISTENCE (&gt;5 DAYS)
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Assessment of secondary bacterial infection signs or delayed immune clearance delays.
              </p>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-space-xs">
                <div className="bg-surface-container-highest h-full w-0"></div>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="relative p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs shadow-sm border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="px-space-xs py-space-2xs rounded bg-error-container text-on-error-container font-label-caps text-label-caps">
                  ESCALATION
                </span>
                <span className="font-code-md text-code-md text-error">CLINIC TRIGGER</span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface font-semibold pt-space-xs">
                CONSULTATION
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                In-person auscultation, diagnostic panel labs, and prescription antimicrobials if indicated.
              </p>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-space-xs">
                <div className="bg-error/30 h-full w-0"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tiered Recovery Action Plan (3 Protocols) */}
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                Clinical Action Directives
              </span>
              <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold">
                Tiered Recovery Action Plan
              </h2>
            </div>
            <span className="font-code-md text-code-md text-outline">3 PROTOCOLS IDENTIFIED</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
            {/* Tier 01: Active Now */}
            <div className="group relative rounded-xl bg-surface-container p-space-lg flex flex-col justify-between shadow-lg transition-transform hover:-translate-y-1 border border-primary/30">
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="font-label-caps text-label-caps text-primary tracking-widest font-semibold">
                      TIER 01 • ACTIVE NOW
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-primary text-[24px]">water_drop</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                    Immediate Supportive Care
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-2xs">
                    Foundational interventions targeted at mucosal barrier repair and fever mitigation.
                  </p>
                </div>
                <div className="flex flex-col gap-space-sm pt-space-xs">
                  <div className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low border border-outline-variant/10">
                    <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 mt-0.5">
                      local_drink
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-md text-body-lg text-on-surface font-medium">
                        Fluid Loading (2.5L / day)
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Warm herbal broths, electrolyte solution, and warm water. Avoid diuretic caffeinated beverages.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low border border-outline-variant/10">
                    <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 mt-0.5">
                      air
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-md text-body-lg text-on-surface font-medium">
                        Airway Humidification &amp; Rest
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Maintain ambient indoor relative humidity between 45–55%. Limit phonation and vocal strain.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low border border-outline-variant/10">
                    <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 mt-0.5">
                      thermostat
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-md text-body-lg text-on-surface font-medium">
                        AM/PM Temperature Logging
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Log oral baseline daily at 08:00 and 20:00 to isolate diurnal spikes and antipyretic efficacy.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-space-md mt-space-md flex items-center justify-between border-t border-outline-variant/20">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Compliance: 2/3 complete</span>
                <span className="font-code-md text-code-md text-primary">STATUS: ENGAGED</span>
              </div>
            </div>

            {/* Tier 02: Monitoring */}
            <div className="group relative rounded-xl bg-surface-container p-space-lg flex flex-col justify-between shadow-lg transition-transform hover:-translate-y-1 border border-tertiary-container/30">
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 rounded-full bg-tertiary-container"></span>
                    <span className="font-label-caps text-label-caps text-tertiary tracking-widest font-semibold">
                      TIER 02 • MONITORING
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-tertiary-container text-[24px]">visibility</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                    Watchlist &amp; Signal Shift
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-2xs">
                    Key sensory indicators denoting normal viral resolution versus lower-tract involvement.
                  </p>
                </div>
                <div className="flex flex-col gap-space-sm pt-space-xs">
                  <div className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low border border-outline-variant/10">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px] flex-shrink-0 mt-0.5">
                      pulmonology
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-md text-body-lg text-on-surface font-medium">
                        Cough Progression Shift
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Note transitions from dry tickle to purulent sputum (yellow/greenish) or paroxysmal coughing spasms.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low border border-outline-variant/10">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px] flex-shrink-0 mt-0.5">
                      monitor_heart
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-md text-body-lg text-on-surface font-medium">
                        Peripheral SpO2 &gt;95%
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Check finger oximeter twice daily. Sustained drop under 94% on room air mandates clinical escalation.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low border border-outline-variant/10">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px] flex-shrink-0 mt-0.5">
                      battery_charging_full
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-md text-body-lg text-on-surface font-medium">
                        Exertional Recovery Rate
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Monitor subjective lethargy score when executing lightweight domestic ambulation.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-space-md mt-space-md flex items-center justify-between border-t border-outline-variant/20">
                <span className="font-label-sm text-label-sm text-outline">Sensory sensitivity: High</span>
                <span className="font-code-md text-code-md text-tertiary-fixed-dim">STANDBY WATCH</span>
              </div>
            </div>

            {/* Tier 03: Escalation */}
            <div className="group relative rounded-xl bg-surface-container p-space-lg flex flex-col justify-between shadow-lg transition-transform hover:-translate-y-1 border border-error/30">
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 rounded-full bg-error"></span>
                    <span className="font-label-caps text-label-caps text-error tracking-widest font-semibold">
                      TIER 03 • ESCALATION
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-error text-[24px]">medical_services</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                    Seek Professional Care
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-2xs">
                    Immediate triggers requiring same-day outpatient clinic or urgent medical evaluation.
                  </p>
                </div>
                <div className="flex flex-col gap-space-sm pt-space-xs">
                  <div className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low border border-outline-variant/10">
                    <span className="material-symbols-outlined text-error text-[20px] flex-shrink-0 mt-0.5">
                      acute
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-md text-body-lg text-on-surface font-medium">
                        Fever &gt;72 Hours
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Pyrexia &gt;38.5°C unmitigated by standard acetaminophen or ibuprofen administration.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low border border-outline-variant/10">
                    <span className="material-symbols-outlined text-error text-[20px] flex-shrink-0 mt-0.5">
                      warning
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-md text-body-lg text-on-surface font-medium">
                        Resting Dyspnea / Wheezing
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Noticeable shortness of breath when seated stationary, audible stridor, or intercostal retractions.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low border border-outline-variant/10">
                    <span className="material-symbols-outlined text-error text-[20px] flex-shrink-0 mt-0.5">
                      trending_up
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-md text-body-lg text-on-surface font-medium">
                        Secondary Rebound Fever
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Sudden return of sharp chest discomfort or high fever after an initial 24-hour period of apparent remission.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-space-md mt-space-md flex items-center justify-between border-t border-outline-variant/20">
                <span className="font-label-sm text-label-sm text-outline">Threshold safety filter active</span>
                <span className="font-code-md text-code-md text-error">RED LINE CRITERIA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Biometric Trajectory & Observation Log Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          
          {/* Left: Trajectory Sparklines (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-space-md rounded-xl bg-surface-container p-space-lg md:p-space-xl shadow-xl border border-outline-variant/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-xs">
              <div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-caps text-label-caps text-primary uppercase">
                    Biometric Trajectory
                  </span>
                  <span className="px-space-2xs py-0 rounded bg-surface-container-high text-outline text-label-sm font-code-md">
                    72-HOUR RECOVERY PROFILE
                  </span>
                </div>
                <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold">
                  Longitudinal Telemetry Sparklines
                </h2>
              </div>
              <div className="flex items-center gap-space-sm">
                <span className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Fatigue
                </span>
                <span className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Cough Freq
                </span>
                <span className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-tertiary-container">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span> Temp (°C)
                </span>
              </div>
            </div>

            {/* Trajectory SVG Graph */}
            <div className="relative w-full rounded bg-surface-container-lowest p-space-md overflow-hidden border border-outline-variant/20">
              <div className="absolute inset-0 grid grid-rows-4 grid-cols-3 pointer-events-none opacity-10">
                <div className="bg-outline/20"></div>
                <div className="bg-outline/10"></div>
                <div className="bg-outline/20"></div>
                <div className="bg-outline/10"></div>
                <div className="bg-outline/20"></div>
                <div className="bg-outline/10"></div>
                <div className="bg-outline/20"></div>
                <div className="bg-outline/10"></div>
                <div className="bg-outline/20"></div>
                <div className="bg-outline/10"></div>
                <div className="bg-outline/20"></div>
                <div className="bg-outline/10"></div>
              </div>

              <div className="relative w-full h-64 flex flex-col justify-between z-10">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 220">
                  <defs>
                    <linearGradient id="fatigueGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#4cffe4" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#4cffe4" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="coughGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#b4c5ff" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#b4c5ff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Fatigue Fill & Curve */}
                  <path d="M 60 170 Q 280 120 300 110 T 540 60 L 540 210 L 60 210 Z" fill="url(#fatigueGradient)" />
                  <path d="M 60 170 Q 280 120 300 110 T 540 60" fill="none" stroke="#4cffe4" strokeLinecap="round" strokeWidth="3" />

                  {/* Cough Curve */}
                  <path d="M 60 145 Q 280 95 300 95 T 540 70 L 540 210 L 60 210 Z" fill="url(#coughGradient)" />
                  <path d="M 60 145 Q 280 95 300 95 T 540 70" fill="none" stroke="#b4c5ff" strokeDasharray="6,4" strokeLinecap="round" strokeWidth="2.5" />

                  {/* Temperature Curve */}
                  <path d="M 60 185 Q 280 80 300 70 T 540 40" fill="none" stroke="#ffbd6a" strokeLinecap="round" strokeWidth="3" />

                  {/* Data Nodes */}
                  <circle className="hover:r-7 transition-all cursor-pointer" cx="60" cy="170" fill="#101419" r="5" stroke="#4cffe4" strokeWidth="2.5" />
                  <circle className="hover:r-7 transition-all cursor-pointer" cx="300" cy="110" fill="#101419" r="5" stroke="#4cffe4" strokeWidth="2.5" />
                  <circle className="animate-pulse" cx="540" cy="60" fill="#4cffe4" r="6" stroke="#101419" strokeWidth="2" />

                  <circle cx="60" cy="145" fill="#101419" r="4" stroke="#b4c5ff" strokeWidth="2" />
                  <circle cx="300" cy="95" fill="#101419" r="4" stroke="#b4c5ff" strokeWidth="2" />
                  <circle cx="540" cy="70" fill="#b4c5ff" r="5" stroke="#101419" strokeWidth="2" />

                  <circle cx="60" cy="185" fill="#101419" r="4" stroke="#ffbd6a" strokeWidth="2" />
                  <circle cx="300" cy="70" fill="#101419" r="4" stroke="#ffbd6a" strokeWidth="2" />
                  <circle cx="540" cy="40" fill="#ffbd6a" r="6" stroke="#101419" strokeWidth="2" />
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between items-center text-outline font-code-md text-code-md px-6 pt-2">
                  <div className="text-left">
                    <span className="text-on-surface font-semibold">DAY 01</span>
                    <span className="block text-body-sm text-outline">{displayObservations[0]?.date_str || 'Day 1'}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-on-surface font-semibold">DAY 02</span>
                    <span className="block text-body-sm text-outline">{displayObservations[1]?.date_str || 'Day 2'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-primary font-bold">DAY 03 (LATEST)</span>
                    <span className="block text-body-sm text-primary">{displayObservations[2]?.date_str || 'Today'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm pt-space-xs">
              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-1 border border-outline-variant/10">
                <span className="font-label-caps text-label-caps text-outline">FATIGUE INDEX</span>
                <div className="flex items-baseline justify-between">
                  <span className="font-headline-md text-headline-md text-primary font-bold">2 → 4 → 6</span>
                  <span className="font-code-md text-code-md text-primary">Ascending / Plateau</span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Peaked at 14:00 today; daytime hypersomnia observed.
                </span>
              </div>

              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-1 border border-outline-variant/10">
                <span className="font-label-caps text-label-caps text-outline">COUGH SEVERITY</span>
                <div className="flex items-baseline justify-between">
                  <span className="font-headline-md text-headline-md text-secondary font-bold">3 → 5 → 6</span>
                  <span className="font-code-md text-code-md text-secondary">Active Plateau</span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Transitioning to occasional productive expectoration.
                </span>
              </div>

              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-1 border border-outline-variant/10">
                <span className="font-label-caps text-label-caps text-outline">CORE TEMPERATURE</span>
                <div className="flex items-baseline justify-between">
                  <span className="font-headline-md text-headline-md text-tertiary-container font-bold">
                    37.1 → 38.2°C
                  </span>
                  <span className="font-code-md text-code-md text-tertiary-container">+1.1°C Shift</span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Responsive to hydration; low-grade systemic pyrexia.
                </span>
              </div>
            </div>
          </div>

          {/* Right: Observation Log (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="rounded-xl bg-surface-container p-space-lg flex flex-col gap-space-md shadow-lg h-full border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Observation Log
                </h3>
                <span className="material-symbols-outlined text-outline text-[20px]">feed</span>
              </div>

              {/* Chronological Timeline */}
              <div className="flex flex-col gap-space-md relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-highest">
                {displayObservations.map((obs, idx) => {
                  const isLatest = idx === displayObservations.length - 1;
                  const dotColor = isLatest
                    ? 'bg-primary animate-pulse'
                    : idx === 0
                    ? 'bg-outline'
                    : 'bg-tertiary-container';

                  return (
                    <div key={obs.id || idx} className="relative flex flex-col gap-1 pl-space-xs">
                      <span className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full ${dotColor}`}></span>
                      <div className="flex items-center justify-between">
                        <span className={`font-code-md text-code-md ${isLatest ? 'text-primary font-bold' : 'text-outline'}`}>
                          DAY {obs.day_number || idx + 1} • {obs.date_str}
                        </span>
                        <span
                          className={`px-space-2xs rounded font-code-md text-label-sm ${
                            obs.severity <= 3
                              ? 'bg-surface-container-high text-on-surface-variant'
                              : obs.severity <= 6
                              ? 'bg-surface-container-high text-tertiary-fixed-dim'
                              : 'bg-primary/20 text-primary font-semibold'
                          }`}
                        >
                          SEVERITY {obs.severity}/10
                        </span>
                      </div>
                      <span className="font-headline-md text-body-lg text-on-surface font-semibold">
                        {obs.clinical_notes?.slice(0, 42) || `Observation recorded for Day ${obs.day_number || idx + 1}`}
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {obs.clinical_notes || 'Patient reported stable baseline vital indicators without respiratory distress.'}
                      </p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={onOpenObservationModal}
                className="w-full mt-auto py-space-xs px-space-sm rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-headline-md text-body-md transition-colors flex items-center justify-center gap-space-xs border border-outline-variant/30"
                id="quick-add-note-btn"
              >
                <span className="material-symbols-outlined text-primary text-[18px]">edit_note</span>
                <span>Append Clinician Note</span>
              </button>
            </div>
          </div>

        </div>

        {/* Connected Smart Device Sync & Physician Preparation Kit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          {/* Smart Device Sync */}
          <div className="relative rounded-xl overflow-hidden bg-surface-container-low p-space-lg flex flex-col justify-between shadow-lg border border-outline-variant/20">
            <div className="flex flex-col gap-space-xs max-w-lg z-10">
              <span className="font-label-caps text-label-caps text-primary uppercase">
                Biometric Telemetry Capture
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Connected Smart Device Sync
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Seamlessly streams sleep cycle telemetry, nocturnal respiratory rates, and HR variance directly into the longitudinal evaluator.
              </p>
            </div>
            <div className="pt-space-lg flex items-center gap-space-md z-10">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span className="font-code-md text-code-md text-on-surface">APPLE HEALTH • CONNECTED</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-outline"></span>
                <span className="font-code-md text-code-md text-outline">WITHINGS SCALE • OFFLINE</span>
              </div>
            </div>
            <div className="mt-space-md rounded-lg overflow-hidden h-36 relative border border-outline-variant/20">
              <img
                className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:opacity-80 transition-opacity"
                alt="Connected Biometric Device Display"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXX7Lwleux8Ynmn4YgzFx9EP6CLUpf7zvxiN10ncqk1s2eeBsT3fFBNRFCX3Eym-v9EsAsjURkEjv65bmQp4f8RuaZEHre-saygsxPjTz4c28PLVpkJ8n7zwHcFRmlY4t3SRV6qBjuSta-sNr1Vkq7c2AYWy9RLFy_nKggzCtlSAb4jBjZGCLP3I-q-GRxkYmt7HJ9-8KlCHJhGPwvHc9Y7xXHjrDO5wRer8GmJKhSYXfvxGfkXebYHg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"></div>
            </div>
          </div>

          {/* Physician Preparation Kit */}
          <div className="relative rounded-xl overflow-hidden bg-surface-container-low p-space-lg flex flex-col justify-between shadow-lg border border-outline-variant/20">
            <div className="flex flex-col gap-space-xs max-w-lg z-10">
              <span className="font-label-caps text-label-caps text-secondary uppercase">
                Clinical Decision Support
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Physician Preparation Kit
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Generate an HL7/FHIR compatible telemetry report ready for intake nurses and virtual care providers.
              </p>
            </div>
            <div className="pt-space-lg flex items-center gap-space-sm z-10">
              <span className="material-symbols-outlined text-secondary text-[24px]">assignment_turned_in</span>
              <span className="font-body-sm text-body-sm text-on-surface font-medium">
                Standard EHR Compatible Encrypted Archive
              </span>
            </div>
            <div className="mt-space-md rounded-lg overflow-hidden h-36 relative border border-outline-variant/20">
              <img
                className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:opacity-80 transition-opacity"
                alt="Physician Consultation Desk"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfPEOWZCX4Bp7Qsz6yM4Yc5ieSETY3rp-AHSy_a4mKlIVhmhAdk3YkRfTBlzpkXjjA6zUDn6I2T-nWLR1m577EgMf4DEoagJDOr7xapMj7_oI1IxkzktrQ7VklknjdttJaSaBwS63aJPfBua0UEXNjyTmYpWIzxyFwdgBNP3rTkyJRGZ_NpDTCNUWNO9x1djEz7ERUwtuY0eHeLxO9WC87VJrccOB_TJC6O6ktMIvr9zL-SmZlF2PGuA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
