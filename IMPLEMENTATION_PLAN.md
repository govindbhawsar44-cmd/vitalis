# VITALIS — End-to-End Implementation Plan

**Lead Full-Stack & ML Engineer**  
**Target:** Turn Google Stitch Design into a Fully Functional, Production-Grade Academic Application  
**Primary Mandate:** DO NOT REDESIGN THE FRONTEND. Preserve 100% of the visual design, typography, color palette, animations, 3D anatomical models, and layout hierarchy.

---

## Proposed Architecture

\\\
                                  +---------------------------------------+
                                  |     VITALIS Single Page Application   |
                                  |      React 18 + TypeScript + Vite     |
                                  |      TailwindCSS + Three.js r125      |
                                  +-------------------+-------------------+
                                                      |
                                             REST API (JSON / JWT)
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |           FastAPI Application         |
                                  |         (Python 3.11 ASGI Engine)     |
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +----------------------+
                     |                                                                 |
                     v                                                                 v
+---------------------------------------+                     +---------------------------------------+
|          Persistence Layer            |                     |       Machine Learning Pipeline       |
|    SQLite + SQLAlchemy 2.0 (Async)    |                     |    Ensemble Model (RF + GradBoost)    |
|   Users, Sessions, Observations       |                     |    Calibrated Probabilities (Dirichlet|
+---------------------------------------+                     |    SHAP TreeExplainer Local Force     |
                                                              +---------------------------------------+
\\\

---

## Phase 1: Audit & Discovery (Completed)
- [x] Inspect Stitch project \11340845651649950441\ screens and 3D visual assets.
- [x] Identify UI components, typography, color palettes, Three.js shaders, and interaction hooks.
- [x] Document repository status and deficiencies in \PROJECT_AUDIT.md\.

---

## Phase 2: Project Scaffold & Environment Setup
1. **Backend Directory Structure:**
   - Initialize \ackend/\ with:
     - \main.py\: FastAPI application entrypoint, CORS configuration, error handling.
     - \config.py\: Pydantic settings loading from \.env\.
     - \database.py\: SQLAlchemy engine, session maker, base model.
     - \models/\: Database entity definitions.
     - \schemas/\: Pydantic validation schemas.
     - \outes/\: Route modules (\uth.py\, \symptoms.py\, \nalysis.py\, \journey.py\).
     - \services/\: Business logic for prediction, safety rules, triage pathways.
     - \ml/\: Training scripts, dataset generation, model serialization, and SHAP explainer.
2. **Frontend Directory Structure:**
   - Initialize \rontend/\ with Vite + React + TypeScript.
   - Configure \	ailwind.config.js\ with exact Stitch design tokens (Obsidian theme, typography scales, custom radii).
   - Configure \index.html\ with Google Fonts (Plus Jakarta Sans, Inter, JetBrains Mono) and Material Symbols.
3. **Environment & Dependencies:**
   - Create \.env.example\ with placeholder keys for \JWT_SECRET\, \DATABASE_URL\, \CORS_ORIGIN\.
   - Setup Python virtual environment with \astapi\, \uvicorn\, \sqlalchemy\, \pydantic\, \scikit-learn\, \
umpy\, \joblib\, \shap\, \passlib\, \python-jose\.

---

## Phase 3: Database & Symptom Taxonomy
1. **Entity Models (\ackend/models/\):**
   - \User\: id, username, email, hashed_password, created_at.
   - \Symptom\: id, code, name, category, anatomical_region, default_severity, red_flag_indicator, description.
   - \AnalysisSession\: id, user_id (nullable for guest mode), input_symptoms (JSON), context (JSON), aggregate_confidence, primary_condition, created_at.
   - \AnalysisPrediction\: id, session_id, condition_name, icd10_code, probability, confidence_interval_low, confidence_interval_high, shap_attributions (JSON).
   - \Observation\: id, user_id, episode_id, day_number, date, severity, temperature, spo2, clinical_notes, created_at.
2. **Taxonomy Seeding (\ackend/ml/symptom_taxonomy.py\):**
   - Populate standard 48 symptoms categorized across:
     - Cranial & Neurological
     - Pulmonology & Airway
     - Cardiovascular & Thoracic
     - Gastrointestinal & Hepatic
     - Musculoskeletal & Articular
     - Systemic & Thermal

---

## Phase 4: Machine Learning Pipeline & Explainability Engine
1. **Synthetic Clinical Dataset Generation (\ackend/ml/generate_dataset.py\):**
   - Generate multi-class epidemiological cohorts (50,000+ synthetic patient profiles) covering 22 conditions.
   - Feature matrix: 48 sparse symptom indicators + severity weights + age/onset duration priors.
2. **Model Training & Calibration (\ackend/ml/train.py\):**
   - Train an ensemble of \RandomForestClassifier\ and \GradientBoostingClassifier\.
   - Wrap in \CalibratedClassifierCV\ for verified Dirichlet/sigmoid posterior calibration.
   - Fit \shap.TreeExplainer\ on the trained ensemble.
   - Compute evaluation metrics (AUROC, Multi-Class Log-Loss, F1 Score).
   - Serialize model and metadata to \ackend/ml/artifacts/vit_healthnet_v4.joblib\.
3. **Inference Service (\ackend/services/ml_service.py\):**
   - Feature vectorization from client inputs.
   - Posterior prediction generation with 95% confidence interval estimation.
   - Local SHAP attribution decomposition: positive driving symptoms (\phi > 0) and counter-evidence suppressors (\phi < 0).
   - Verification of exact attribution identity: f(x) = E[f(x)] + \sum \phi_i.
   - Counterfactual perturbation simulation function.

---

## Phase 5: Backend API Layer
1. **Authentication API (\ackend/routes/auth.py\):**
   - Register, Login, Logout, and Current User profile (\/api/auth/me\).
2. **Symptom & Anatomical API (\ackend/routes/symptoms.py\):**
   - List symptoms, search by query/region, list body regions with coordinates.
3. **Analysis & Triage API (\ackend/routes/analysis.py\):**
   - \POST /api/analysis\: Full prediction pipeline execution.
   - \GET /api/analysis/{id}\: Saved analysis retrieval.
   - \GET /api/analysis/history\: Historical sessions for drawer.
4. **Health Journey & Tracking API (\ackend/routes/journey.py\):**
   - \POST /api/journey/observations\: Record daily biometric update.
   - \GET /api/journey/observations\: Fetch time-series observation data.
   - \GET /api/journey/export-summary\: Generate FHIR/JSON clinical dossier.
5. **Safety & Red-Flag Service (\ackend/services/safety_service.py\):**
   - Deterministic red-flag evaluation (e.g., resting dyspnea, cyanosis, radiating chest pain, hyperpyrexia).

---

## Phase 6: Frontend Core Views & Visual Fidelity
1. **Component Scaffolding:**
   - Global Header & Footer preserving exact styling, logo, and active path highlights.
   - Single-page view router switching seamlessly across the 5 primary views.
   - Theme toggle maintaining obsidian dark mode and high-contrast clinical visibility.
2. **Landing Page View (\OverviewHeroView\):**
   - Hero section, dual-layer governance strip, and 3D organ parallax depth scroll canvas.
3. **Symptom Analyzer View (\SymptomAnalyzerView\):**
   - 3-column workstation with pipeline progress (Steps 01-04), physiological tier filters, 3D anatomical locator, live search, symptom tray, context inputs, and submit button.
4. **Results & Probabilities View (\ResultsView\):**
   - Probabilistic distribution bars with CI bands, "Why This Appeared" attribution cards, anatomical vector SVG, "Compare Possibilities" matrix, and "When Not To Wait" red-flag section.
5. **Health Journey View (\HealthJourneyView\):**
   - Triage progression vectors, tiered action plan (Now, Monitor, Seek Care), dynamic SVG sparklines, observation timeline, historical episodes drawer, and observation modal.
6. **ML Architecture View (\MLArchitectureView\):**
   - Interactive 6-stage pipeline graph, model card, hyperparameter table, and reliability curve SVG.

---

## Phase 7: Interactive 3D Anatomical Map & Synchronization
1. **Three.js Anatomical Component (\BodyMap3D.tsx\):**
   - Port anatomical human wireframe/glass geometry from \	hreejs_1.html\.
   - Implement raycasting click detection on body meshes (Head, Chest, Abdomen, Joints).
   - Bi-directional synchronization: clicking a 3D region updates the active filter in Column 1 and highlights matching symptoms. Selecting a filter highlights the 3D anatomical mesh.
   - Anterior / Posterior toggle rotating camera or body group smoothly.

---

## Phase 8: Functional Results, SHAP Studio & Red Flags
1. **Real Model Results Integration:**
   - Display true condition probabilities from API with animated gradient bars.
   - Populate "Why This Appeared" with calculated positive symptom drivers and negative suppressors.
2. **Interactive SHAP Studio Modal:**
   - Modal with dynamic waterfall force decomposition bar (\Δ = +net SHAP accumulation\).
   - Feature attribution ledger with real base values and share percentages.
   - Functional counterfactual simulation toggles that re-calculate attributions live.
3. **Condition Comparison Matrix:**
   - Dynamic comparison table comparing predicted conditions across matching symptoms, missing symptoms, duration, systems, and clinical action levels.
4. **Red-Flag Emergency System:**
   - Evaluate user inputs against emergency indicators. If triggered, illuminate high-contrast coral alert cards and display instant 911 / clinic triangulation buttons.

---

## Phase 9: Longitudinal Health Journey & Dynamic Sparklines
1. **Dynamic SVG Sparklines:**
   - Procedurally compute SVG bezier curves (\M x y Q ...\) and area gradients based on real observation records.
2. **Observation Intake Modal:**
   - Connect severity slider (1-10), temperature, SpO2, and clinical notes to \POST /api/journey/observations\.
   - Update timeline and sparklines in real-time without reloading.
3. **Historical Episodes Drawer:**
   - Fetch real saved analyses from backend. Clicking an episode loads its conditions and symptoms.
4. **Clinical Dossier Export:**
   - Client-side downloadable report summarizing diagnostic session, symptoms, predictions, and safety alerts.

---

## Phase 10: Authentication, Verification & End-to-End Testing
1. **Authentication Modal:**
   - Login / Register modal in top header with persistent token session in localStorage.
2. **Automated Testing Suite:**
   - Backend pytest suite: authentication, symptom catalog, ML prediction inference, and observation logging.
   - ML unit tests: feature vector correctness, probability sum normalization, SHAP decomposition validation.
   - Frontend build & typecheck: \
pm run build\ with zero TypeScript errors.
3. **End-to-End Browser Flow:**
   - Run backend and frontend concurrently.
   - Execute complete clinical flow: Start Analysis -> Select Body Region -> Add Symptoms -> Adjust Severity -> Submit -> Review Probabilities -> Open SHAP Studio -> Compare Conditions -> Inspect Red Flags -> Save to Journey -> View Dynamic Sparkline.
4. **Visual Regression Verification:**
   - Compare all rendered views against Stitch designs to ensure zero visual discrepancy.
5. **Documentation:**
   - Generate \README.md\, \API.md\, \ML_DOCUMENTATION.md\, and \.env.example\.