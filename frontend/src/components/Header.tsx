import React, { useState } from 'react';
import { User } from '../types';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  isDark,
  onToggleTheme
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const navItems = [
    { id: 'overview-hero', label: 'Overview' },
    { id: 'symptom-analyzer', label: 'Symptom Analyzer' },
    { id: 'results-probabilities', label: 'Analysis Results' },
    { id: 'health-journey-trends', label: 'Health Journey' },
    { id: 'ml-architecture', label: 'ML System Architecture' }
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="h-20 w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between gap-space-md">
        
        {/* Brand Logo & Telemetry Indicator */}
        <div className="flex items-center gap-space-lg">
          <button 
            onClick={() => onNavigate('overview-hero')}
            className="flex items-center gap-space-xs text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-primary/40 flex items-center justify-center p-1 group-hover:border-primary transition-colors">
              <svg viewBox="0 0 160 48" className="w-full h-full text-primary" fill="currentColor">
                <path d="M10 24 L25 10 L40 38 L55 18 L70 30 L85 24 L150 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="85" cy="24" r="4" fill="currentColor"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">VITALIS</span>
              <span className="font-label-caps text-label-caps text-outline tracking-wider text-[10px]">HEALTH INTELLIGENCE</span>
            </div>
          </button>

          <div className="hidden 2xl:flex items-center gap-space-xs px-space-sm py-space-2xs rounded bg-surface-container-low border border-outline-variant/40">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-code-md text-code-md text-primary tracking-wide">CLINICAL MODEL READY</span>
            <span className="font-code-md text-code-md text-outline text-[12px]">(AI DECISION SUPPORT)</span>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-space-lg">
          {navItems.map((item) => {
            const isActive = currentPath === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`transition-colors py-space-xs font-body-md text-body-md relative ${
                  isActive
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Header Cluster */}
        <div className="flex items-center gap-space-md">
          
          <div className="hidden lg:flex items-center gap-space-2xs px-space-sm py-space-2xs rounded bg-surface-container border border-outline-variant/30 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-outline">shield</span>
            <span className="font-label-sm text-label-sm text-outline">Health Awareness Tool • Not an Emergency Service</span>
          </div>

          {/* Theme Mode Toggle */}
          <div className="flex items-center p-space-2xs rounded bg-surface-container border border-outline-variant/40">
            <button
              aria-label="Theme Mode Toggle"
              onClick={onToggleTheme}
              className="p-space-2xs rounded text-primary hover:bg-surface-container-high transition-colors focus:outline-none"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isDark ? 'dark_mode' : 'light_mode'}
              </span>
            </button>
          </div>

          {/* Start Analysis CTA Button */}
          <button
            onClick={() => onNavigate('symptom-analyzer')}
            className="relative inline-flex items-center justify-center px-space-md py-space-xs rounded bg-primary-container text-on-primary font-headline-md text-body-md font-semibold transition-all hover:bg-primary shadow-[0_0_20px_rgba(10,226,200,0.3)] hover:shadow-[0_0_28px_rgba(10,226,200,0.5)] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[18px]">neurology</span>
              Start Analysis
            </span>
          </button>

          {/* Functional User Profile / Auth State */}
          <div className="relative">
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                } else {
                  setShowUserDropdown(!showUserDropdown);
                }
              }}
              title={user ? `Logged in as ${user.username}` : 'Sign In / Register'}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-primary-fixed transition-all focus:outline-none shadow-sm"
            >
              <span className="material-symbols-outlined text-on-primary text-[20px]">
                {user ? 'person' : 'account_circle'}
              </span>
            </button>

            {user && showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-low border border-outline-variant/40 rounded-xl shadow-2xl p-space-xs z-50">
                <div className="p-space-xs border-b border-surface-container-highest">
                  <span className="font-label-caps text-label-caps text-outline block text-[10px]">AUTHENTICATED USER</span>
                  <span className="font-headline-md text-body-md text-on-surface font-semibold block truncate">{user.username}</span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant block truncate">{user.email}</span>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onNavigate('health-journey-trends');
                    }}
                    className="w-full text-left px-space-xs py-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center gap-space-xs font-body-sm text-body-sm"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">history</span>
                    <span>My Health Journey</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full text-left px-space-xs py-1.5 rounded text-error hover:bg-error-container/20 flex items-center gap-space-xs font-body-sm text-body-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};