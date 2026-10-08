import React, { useState } from 'react';
import { createObservation } from '../services/api';
import { Observation } from '../types';

interface ObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onObservationAdded: (newObs: Observation) => void;
  currentDayCount: number;
}

export const ObservationModal: React.FC<ObservationModalProps> = ({
  isOpen,
  onClose,
  onObservationAdded,
  currentDayCount
}) => {
  const [severity, setSeverity] = useState(6);
  const [temperature, setTemperature] = useState('38.1');
  const [spo2, setSpo2] = useState('98');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const now = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dateStr = `${months[now.getMonth()]} ${now.getDate()} (DAY 0${currentDayCount + 1})`;

    try {
      const created = await createObservation({
        day_number: currentDayCount + 1,
        date_str: dateStr,
        severity: Number(severity),
        temperature: temperature ? parseFloat(temperature) : undefined,
        spo2: spo2 ? parseInt(spo2, 10) : undefined,
        clinical_notes: notes.trim() || 'Daily observation committed.'
      });
      onObservationAdded(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save observation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-50 flex items-center justify-center p-space-md">
      <div className="w-full max-w-xl bg-surface-container-low rounded-xl p-space-xl flex flex-col gap-space-lg shadow-2xl border border-outline-variant/30">
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-caps text-label-caps text-primary uppercase">
              Day 0{currentDayCount + 1} Observation Intake
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Record Biometric Update
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-space-2xs rounded bg-surface-container-high text-on-surface hover:text-primary transition-colors focus:outline-none"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-space-xs rounded bg-error-container/30 border border-error/40 text-error font-body-sm text-body-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          
          <div className="flex flex-col gap-space-2xs">
            <label className="font-label-sm text-label-sm text-outline uppercase">
              Overall Symptom Severity (1 to 10)
            </label>
            <div className="flex items-center gap-space-md">
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
              />
              <span className="font-headline-md text-headline-md text-primary font-bold w-8 text-center">
                {severity}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-sm text-label-sm text-outline uppercase">Oral Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full bg-surface-container text-on-surface font-code-md text-code-md px-space-sm py-space-xs rounded focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
              />
            </div>
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-sm text-label-sm text-outline uppercase">Pulse Oximetry SpO2 (%)</label>
              <input
                type="number"
                step="1"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full bg-surface-container text-on-surface font-code-md text-code-md px-space-sm py-space-xs rounded focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
              />
            </div>
          </div>

          <div className="flex flex-col gap-space-2xs">
            <label className="font-label-sm text-label-sm text-outline uppercase">
              Clinical Observations / Subjective Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Specify sputum color, shortness of breath on exertion, throat pain level..."
              className="w-full bg-surface-container text-on-surface font-body-sm text-body-sm p-space-sm rounded focus:outline-none focus:ring-1 focus:ring-primary resize-none border border-outline-variant/30"
            />
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-space-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-space-md py-space-xs rounded bg-surface-container text-on-surface-variant font-headline-md text-body-md hover:bg-surface-container-high transition-colors focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-space-lg py-space-xs rounded bg-primary-container text-on-primary font-headline-md text-body-md font-semibold hover:bg-primary transition-all shadow-md focus:outline-none"
            >
              {submitting ? 'Committing Entry...' : 'Commit Telemetry Entry'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};