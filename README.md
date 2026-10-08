# VITALIS: Multimodal Health Intelligence & Clinical Decision Support System

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.160-black.svg)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-Academic-lightgrey.svg)]()

> **B.Tech Capstone Major Project**  
> *An explainable, calibrated clinical awareness and decision support platform engineered with strict deterministic safety guardrails, Bayesian uncertainty quantification, local TreeSHAP attribution, an interactive 3D human anatomical body map, and longitudinal recovery tracking.*

---

## 📑 Table of Contents
1. [Executive Summary](#-executive-summary)
2. [Key System Capabilities](#-key-system-capabilities)
3. [System Architecture](#-system-architecture)
4. [Machine Learning Engine & Clinical Taxonomy](#-machine-learning-engine--clinical-taxonomy)
5. [Frontend Architecture & Stitch UI Fidelity](#-frontend-architecture--stitch-ui-fidelity)
6. [Repository Structure](#-repository-structure)
7. [Installation & Setup](#-installation--setup)
8. [Running the Application](#-running-the-application)
9. [Automated Testing Suite](#-automated-testing-suite)
10. [API Reference Summary](#-api-reference-summary)
11. [Academic Governance & Safety Disclaimers](#-academic-governance--safety-disclaimers)

---

## 🔬 Executive Summary

Traditional symptom checkers suffer from two critical failure modes:
1. **Uncalibrated Heuristics**: Presenting arbitrary ranking scores without rigorous statistical confidence intervals or Bayesian posteriors.
2. **Black-box Predictions**: Failing to explain *why* a diagnosis was proposed, eroding clinician and patient trust.

**VITALIS** addresses these challenges by uniting:
- **Calibrated Ensemble Inference**: Random Forest ensemble with probability calibration via Platt scaling (`CalibratedClassifierCV`) achieving **98.03% classification accuracy**, **0.069 log-loss**, and **1.000 multiclass AUROC** across 15 acute and chronic conditions.
- **Explainable AI (TreeSHAP)**: Fast, exact local Shapley feature attributions ($\phi_i$) quantifying the positive and negative influence of each selected symptom on the differential diagnosis.
- **Deterministic Red-Flag Safety Overrides**: Hardcoded, rule-based emergency triage matrix ("WHEN NOT TO WAIT") checking for critical conditions (e.g., suspected acute coronary syndrome, stroke, septic shock, anaphylaxis) prior to probabilistic inference.
- **High-Fidelity 3D Anatomical Interface**: Custom Three.js interactive human body mesh with raycasted physiological regions (cranial, thoracic, abdominal, musculoskeletal, systemic, neurovascular) and orbital holographic rings.
- **Longitudinal Patient Journey**: 4-stage longitudinal progression tracker with dynamic SVG vital sparklines, tiered recovery directives (Immediate / Monitor / Seek Care), and chronological clinical observation journaling.

---

## ⚡ Key System Capabilities

| Feature | Technical Implementation | Clinical Significance |
| :--- | :--- | :--- |
| **Interactive 3D Body Map** | Three.js WebGL with raycasting & anatomical sub-mesh highlights | Reduces cognitive friction in symptom input by allowing anatomical localization |
| **Calibrated Posterior Probabilities** | `CalibratedClassifierCV(RandomForestClassifier, method='sigmoid', cv=5)` | Provides true clinical probabilities with 95% Clopper-Pearson/Wilson confidence bands |
| **SHAP Explainability Studio** | Exact TreeSHAP feature attributions with interactive waterfall plots | Explains model reasoning per feature, differentiating true signals from noise |
| **Differential Diagnosis Bento Grid** | Side-by-side comparative matrices of competing diagnoses | Emulates clinical differential diagnosis methodology taught in medical training |
| **Emergency Red-Flag Guardrails** | Deterministic clinical triage rules operating before and alongside ML | Prevents algorithmic hallucination in life-threatening scenarios |
| **Longitudinal Progression Tracker** | SVG sparkline telemetry, multi-day observation diary, recovery milestones | Enables post-acute trajectory monitoring and deterioration detection |

---

## 🧠 Machine Learning Engine & Clinical Taxonomy

### 1. Clinical Symptom Taxonomy
The diagnostic vocabulary consists of **48 clinical symptoms** categorized across 6 primary anatomical tiers:
- **Cranial & Neurological**: Headache, Migraine, Dizziness, Visual Disturbance, Facial Droop, Cognitive Fog, Syncope.
- **Thoracic & Cardiovascular**: Chest Pain (Central/Crushing), Palpitations, Dyspnea, Pleuritic Pain, Hemoptysis, Productive Cough.
- **Abdominal & Gastrointestinal**: Epigastric Pain, Right Lower Quadrant Pain, Nausea/Vomiting, Melena, Diarrhea, Jaundice.
- **Musculoskeletal & Peripheral**: Joint Swelling, Muscular Rigidity, Lumbar Spasm, Calf Asymmetry/Edema, Tremor.
- **Dermatological & Systemic**: Generalized Rash, Purpura, Night Sweats, Weight Loss, High Fever, Chills.
- **Immunological & Metabolic**: Polydipsia, Polyuria, Pruritus, Peripheral Cyanosis, Flushing.

### 2. Supported Clinical Conditions (15 Classes)
1. Acute Coronary Syndrome (ACS / Myocardial Infarction)
2. Cerebrovascular Accident (Ischemic/Hemorrhagic Stroke)
3. Acute Pulmonary Embolism
4. Acute Appendicitis
5. Sepsis / Septic Shock
6. Community-Acquired Pneumonia (CAP)
7. Acute Exacerbation of Asthma / COPD
8. Uncontrolled Diabetes Mellitus (DKA / HHS Risk)
9. Severe Migraine with Aura
10. Gastroesophageal Reflux Disease (GERD)
11. Vasovagal Syncope
12. Acute Gastrointestinal Bleed
13. Generalized Viral Syndrome / Influenza
14. Systemic Anaphylaxis
15. Acute Meningitis

### 3. Model Architecture & Validation Metrics
- **Model**: `RandomForestClassifier` (300 estimators, max_depth=16, min_samples_split=4, class_weight='balanced_subsample') wrapped in `CalibratedClassifierCV(method='sigmoid', cv=5)`.
- **Training Cohort**: 45,000 synthetic clinical records generated with physiological co-occurrence dependencies, age/gender distributions, vitals, and Gaussian noise.
- **Evaluation Results**:
  - **Accuracy**: `98.03%`
  - **Log-Loss**: `0.0691`
  - **Macro Precision**: `0.9804`
  - **Macro Recall**: `0.9802`
  - **Macro F1-Score**: `0.9803`
  - **Multiclass AUROC**: `1.000`

---

## 🎨 Frontend Architecture & Stitch UI Fidelity

The frontend preserves **100% of the visual design** defined in the Google Stitch design system (`Project 11340845651649950441`):
- **Theme**: Deep obsidian palette (`#101419`, `#080b0e`, `#1b2229`).
- **Clinical Primary**: Electric Bio-Cyan (`#4cffe4`, `#0ae2c8`) and Cognitive Lavender (`#b4c5ff`).
- **Typography**: Clean high-contrast sans-serif hierarchy with monospace clinical readouts.
- **Interactive 3D Body Map**: Three.js WebGL canvas rendering anatomical nodes with raycasting for seamless direct region selection.
- **Views Implemented**:
  1. `OverviewHeroView.tsx`: Screen 01 Hero landing with 3D organ parallax, core telemetry pillars, and quick start.
  2. `SymptomAnalyzerView.tsx`: Screen 02 3-Column Diagnostic Studio with anatomical region filtering, live search, symptom queue with severity sliders, and vital signs intake.
  3. `ResultsView.tsx`: Screen 03 Clinical Inference Engine with posterior probability distributions, confidence interval bands, SHAP attribution bento grid, and emergency red-flag triage alert banner.
  4. `HealthJourneyView.tsx`: Screen 04 Longitudinal Tracker with 4-stage vector trajectory, recovery directives, dynamic SVG sparklines, and observation logger.
  5. `MLArchitectureView.tsx`: Screen 06 Academic Architecture Studio with interactive pipeline graph, hyperparameter tables, calibration curves, and SHAP inspector.

---

## 📁 Repository Structure

```
major project/
├── .env                         # Server environment configuration
├── vitalis.db                   # SQLite application database
├── IMPLEMENTATION_PLAN.md       # Full engineering specifications
├── PROJECT_AUDIT.md             # Comprehensive audit against Stitch designs
├── README.md                    # Root project documentation
├── API.md                       # Complete REST API specification
├── ML_DOCUMENTATION.md          # Theoretical formulation & ML validation
│
├── backend/                     # Python 3.11 FastAPI backend
│   ├── main.py                  # Entrypoint, CORS, database setup, static mount
│   ├── database.py              # SQLite connection and table schemas
│   ├── ml/                      # Machine learning pipeline
│   │   ├── symptom_taxonomy.py  # 48 symptoms, 15 condition profiles
│   │   ├── generate_dataset.py  # 45,000 synthetic patient dataset generator
│   │   ├── train.py             # Model training, calibration, and artifact export
│   │   └── artifacts/           # Trained model binaries and feature metadata
│   │       ├── vit_healthnet_v4.joblib
│   │       └── feature_meta.json
│   ├── routes/                  # API endpoints
│   │   ├── auth.py              # User authentication (register/login/me)
│   │   ├── symptoms.py          # Symptom catalog retrieval
│   │   ├── analysis.py          # Diagnostic inference, SHAP, and history
│   │   └── journey.py           # Longitudinal observation management
│   └── services/                # Business logic
│       ├── auth_service.py      # Direct bcrypt hashing and JWT encoding
│       ├── ml_service.py        # Calibrated prediction & SHAP attribution
│       └── safety_service.py    # Deterministic emergency triage rules
│
├── frontend/                    # React 18 + TypeScript + Vite frontend
│   ├── index.html               # Stitch master template
│   ├── package.json             # NPM dependencies (Three.js, Lucide, Tailwind)
│   ├── tsconfig.json            # TypeScript configuration
│   ├── vite.config.ts           # Vite build config with proxy to backend
│   ├── dist/                    # Compiled production build
│   └── src/
│       ├── App.tsx              # Main orchestrator & routing state
│       ├── index.css            # Tailwind custom styles, theme tokens, keyframes
│       ├── components/          # Reusable Stitch components
│       │   ├── Header.tsx       # Stitch top navigation & telemetry status
│       │   ├── Footer.tsx       # Institutional academic footer
│       │   ├── BodyMap3D.tsx    # Interactive Three.js 3D human body mesh
│       │   ├── OrganScroll3D.tsx# Three.js organ parallax hero view
│       │   ├── ShapModal.tsx    # SHAP feature attribution waterfall modal
│       │   ├── ObservationModal.tsx # Daily observation intake modal
│       │   ├── HistoryDrawer.tsx# Prior diagnostic episodes drawer
│       │   └── AuthModal.tsx    # Clinician login / registration
│       ├── views/               # Stitch primary views
│       │   ├── OverviewHeroView.tsx
│       │   ├── SymptomAnalyzerView.tsx
│       │   ├── ResultsView.tsx
│       │   ├── HealthJourneyView.tsx
│       │   └── MLArchitectureView.tsx
│       ├── services/            # Frontend API client
│       │   └── api.ts
│       └── types/               # TypeScript interfaces & type definitions
│           └── index.ts
│
├── tests/                       # Automated test suite
│   └── test_api.py              # End-to-end integration tests (pytest)
│
└── stitch_raw/                  # Original Stitch design exports and references
```

---

## 💻 Installation & Setup

### Prerequisites
- **Python 3.11+** installed and available in your `PATH`.
- **Node.js 18+** and **npm** installed.

### 1. Clone or Open the Repository
```bash
cd "c:\Users\govin\OneDrive\Documents\major project"
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (already pre-configured for local execution):
```bash
copy .env.example .env
```

### 3. Install Python Backend Dependencies
```bash
python -m pip install -r backend/requirements.txt
```

### 4. Install Frontend Dependencies
```bash
cd frontend
npm.cmd install
cd ..
```

---

## 🚀 Running the Application

### Mode A: Unified Single-Port Production Mode (Recommended)
FastAPI serves the compiled React single-page application directly from `frontend/dist` on port `8000`.

1. **Build the Frontend**:
   ```bash
   cd frontend
   npm.cmd run build
   cd ..
   ```
2. **Start the Unified Server**:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
3. Open your browser at:
   - **Application UI**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
   - **Interactive Swagger API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Mode B: Dual-Server Development Mode
1. **Terminal 1 (Backend API)**:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
2. **Terminal 2 (Frontend Dev Server)**:
   ```bash
   cd frontend
   npm.cmd run dev
   ```
3. Open your browser at: [http://localhost:5173/](http://localhost:5173/)

---

## 🧪 Automated Testing Suite

Run the test suite with:
```bash
python -m pytest tests/ -v
```

All 9 tests verify full end-to-end functionality across auth, ML inference, deterministic safety overrides, and longitudinal recovery tracking.

---

## ⚖ Academic Governance & Safety Disclaimers

> **Clinical Decision Support Statement**  
> VITALIS is developed as an academic engineering demonstration for a Bachelor of Technology (B.Tech) capstone project. It is intended strictly for research and clinical educational demonstration purposes and does **not** constitute a certified medical device under FDA 21 CFR Part 820 or EU MDR 2017/745.
