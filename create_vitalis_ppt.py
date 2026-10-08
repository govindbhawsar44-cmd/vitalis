import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_vitalis_presentation():
    prs = Presentation()
    # 16:9 Widescreen layout
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette Tokens (Obsidian Dark Theme)
    DARK_BG = RGBColor(16, 20, 25)         # #101419
    CARD_BG = RGBColor(27, 34, 41)         # #1B2229
    CARD_HEADER_BG = RGBColor(0, 51, 102)  # #003366
    CYAN_ACCENT = RGBColor(76, 255, 228)   # #4CFFE4
    CYAN_LIGHT = RGBColor(10, 226, 200)    # #0AE2C8
    WHITE = RGBColor(255, 255, 255)
    MUTED_TEXT = RGBColor(180, 197, 255)   # #B4C5FF
    GRAY_TEXT = RGBColor(160, 175, 190)
    DARK_TEXT = RGBColor(16, 20, 25)

    def set_slide_background(slide, color=DARK_BG):
        bg = slide.background
        fill = bg.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_header(slide, title_text, category_text="VITALIS B.TECH CAPSTONE PROJECT"):
        # Header Badge
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.4), Inches(4.5), Inches(0.35))
        badge.fill.solid()
        badge.fill.fore_color.rgb = CARD_HEADER_BG
        badge.line.color.rgb = CYAN_ACCENT
        tf_b = badge.text_frame
        tf_b.word_wrap = True
        p_b = tf_b.paragraphs[0]
        p_b.text = category_text.upper()
        p_b.font.size = Pt(10)
        p_b.font.bold = True
        p_b.font.color.rgb = CYAN_ACCENT
        p_b.alignment = PP_ALIGN.CENTER

        # Main Slide Title
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(0.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = WHITE

    def add_card(slide, left, top, width, height, title, body_paragraphs, is_cyan_border=False):
        # Card Background Box
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CYAN_ACCENT if is_cyan_border else CARD_HEADER_BG
        card.line.width = Pt(1.5 if is_cyan_border else 1.0)

        tf = card.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.TOP
        tf.margin_left = Inches(0.2)
        tf.margin_right = Inches(0.2)
        tf.margin_top = Inches(0.2)
        tf.margin_bottom = Inches(0.2)

        if title:
            p_t = tf.paragraphs[0]
            p_t.text = title
            p_t.font.size = Pt(14)
            p_t.font.bold = True
            p_t.font.color.rgb = CYAN_ACCENT
            p_t.space_after = Pt(8)

        for i, text in enumerate(body_paragraphs):
            p = tf.add_paragraph() if (title or i > 0) else tf.paragraphs[0]
            p.text = text
            p.font.size = Pt(11)
            p.font.color.rgb = MUTED_TEXT if text.startswith("•") or text.startswith("-") else WHITE
            p.space_after = Pt(4)

        return card

    # =============================================================
    # SLIDE 1: TITLE SLIDE
    # =============================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Title Card Accent Box
    title_box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(11.733), Inches(3.2))
    title_box.fill.solid()
    title_box.fill.fore_color.rgb = CARD_BG
    title_box.line.color.rgb = CYAN_ACCENT
    title_box.line.width = Pt(2.0)
    tf1 = title_box.text_frame
    tf1.word_wrap = True
    tf1.margin_left = Inches(0.4)
    tf1.margin_top = Inches(0.4)

    p1 = tf1.paragraphs[0]
    p1.text = "VITALIS: MULTIMODAL HEALTH INTELLIGENCE"
    p1.font.size = Pt(28)
    p1.font.bold = True
    p1.font.color.rgb = CYAN_ACCENT

    p2 = tf1.add_paragraph()
    p2.text = "Clinical Decision Support System with Calibrated Probabilistic ML & TreeSHAP Explainability"
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = WHITE
    p2.space_after = Pt(14)

    p3 = tf1.add_paragraph()
    p3.text = "B.Tech Capstone Major Project Presentation | Academic Year 2026-2027"
    p3.font.size = Pt(12)
    p3.font.color.rgb = MUTED_TEXT

    # Team Members Card
    add_card(s1, 0.8, 4.3, 5.7, 2.6, "PROJECT TEAM MEMBERS", [
        "• Govind Bhawsar (2303051050270)",
        "• Pranjal Jadhav (2303051050312)",
        "• Ishika Harshyana (2303051050308)",
        "• Vaibhavi Mali (2303051050408)",
        "Branch: Computer Science & Engineering"
    ], is_cyan_border=True)

    # Mentor & Institution Card
    add_card(s1, 6.8, 4.3, 5.7, 2.6, "GUIDANCE & INSTITUTION", [
        "Project Guide / Mentor:",
        "• Aryan Raj (Assistant Professor, CSE)",
        "Head of Department: Prof. Sumitra Menaria",
        "Department of Computer Science & Engineering",
        "Parul Institute of Technology, Parul University"
    ])

    # =============================================================
    # SLIDE 2: EXECUTIVE SUMMARY & VISION
    # =============================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Executive Summary & Clinical System Vision", "PLATFORM OVERVIEW")

    add_card(s2, 0.8, 1.6, 3.7, 5.3, "1. Deterministic Safety", [
        "• Hardcoded Triage Layer:",
        "Checks for acute red-flag emergencies prior to ML model inference.",
        "• Immediate Directives:",
        "Issues non-negotiable emergency warnings ('WHEN NOT TO WAIT') for ACS, Ischemic Stroke, Septic Shock, and Systemic Anaphylaxis.",
        "• Zero False Negatives:",
        "Eliminates algorithmic under-triage risk in critical scenarios."
    ])

    add_card(s2, 4.8, 1.6, 3.7, 5.3, "2. Calibrated ML Core", [
        "• Random Forest Ensemble:",
        "300 decision trees trained on 45,000 synthetic patient records.",
        "• Platt Probability Scaling:",
        "CalibratedClassifierCV produces true empirical probability estimates.",
        "• Validation Benchmarks:",
        "98.03% Accuracy, 0.069 Multi-Class Log-Loss, 1.000 AUROC.",
        "• 95% Confidence Intervals:",
        "Clopper-Pearson Dirichlet error bounds."
    ], is_cyan_border=True)

    add_card(s2, 8.8, 1.6, 3.7, 5.3, "3. Explainable 3D Interface", [
        "• TreeSHAP Attribution:",
        "Computes exact polynomial-time Shapley values for local risk drivers and suppressors.",
        "• Interactive 3D Bio-Engine:",
        "Three.js WebGL human body map with raycasted region selection.",
        "• Longitudinal Tracker:",
        "4-stage recovery milestone tracker with vital sparklines and observation journal."
    ])

    # =============================================================
    # SLIDE 3: PROBLEM STATEMENT & MOTIVATION
    # =============================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Problem Statement & Clinical Motivation", "CLINICAL CHALLENGES")

    add_card(s3, 0.8, 1.6, 5.7, 2.5, "Uncalibrated Heuristic Scores", [
        "• Failure Mode 1:",
        "Traditional symptom checkers output arbitrary match scores (e.g. '85% match') that do not reflect statistical probability or empirical prevalence.",
        "• Clinical Confusion:",
        "Overestimates rare pathologies while confusing patients and clinicians."
    ])

    add_card(s3, 6.8, 1.6, 5.7, 2.5, "Opaque Black-Box Models", [
        "• Failure Mode 2:",
        "Deep learning and standard ML models withhold explanations regarding why a diagnostic differential was generated.",
        "• Lack of Trust:",
        "Clinicians cannot audit feature contributions without local Shapley attributions."
    ])

    add_card(s3, 0.8, 4.3, 11.7, 2.6, "VITALIS Solution & Core Clinical Motivation", [
        "• Safety-First Architecture: Bridge the gap between patient symptom reporting and transparent clinical decision support.",
        "• Deterministic Triage Guardrails: Prevent ML under-triage during acute emergency presentation.",
        "• Mathematical Rigor: Pair Platt-calibrated Bayesian posteriors with polynomial-time TreeSHAP feature attributions.",
        "• Low Friction 3D Interaction: Replace text dropdowns with an interactive Three.js 3D human anatomical body map."
    ], is_cyan_border=True)

    # =============================================================
    # SLIDE 4: SYSTEM OBJECTIVES
    # =============================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Core Engineering Objectives", "PROJECT GOALS")

    add_card(s4, 0.8, 1.6, 5.7, 2.5, "Objective 1: Safety Triage Layer", [
        "• Implement a deterministic rule-based emergency triage matrix checking for critical symptom combinations prior to ML inference.",
        "• Issue instant 'WHEN NOT TO WAIT' emergency directives."
    ])

    add_card(s4, 6.8, 1.6, 5.7, 2.5, "Objective 2: Calibrated Machine Learning", [
        "• Train a Random Forest classifier across 15 diagnostic classes.",
        "• Apply Platt scaling via CalibratedClassifierCV to yield 95% Clopper-Pearson confidence interval bands."
    ], is_cyan_border=True)

    add_card(s4, 0.8, 4.3, 5.7, 2.6, "Objective 3: TreeSHAP Explainability", [
        "• Compute exact Shapley values in polynomial time.",
        "• Decompose posterior probabilities into positive risk drivers and negative suppressors."
    ])

    add_card(s4, 6.8, 4.3, 5.7, 2.6, "Objective 4: 3D Bio-Engine & Telemetry", [
        "• Construct a Three.js WebGL human body mesh supporting raycasted region selection.",
        "• Provide a 4-stage longitudinal patient journey tracker with vital sparklines and observation journal."
    ])

    # =============================================================
    # SLIDE 5: COMPARATIVE ANALYSIS MATRIX
    # =============================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Comparative Analysis: Existing Systems vs VITALIS", "LITERATURE SURVEY")

    # Add Comparison Table
    rows = 6
    cols = 4
    left = Inches(0.8)
    top = Inches(1.6)
    width = Inches(11.7)
    height = Inches(5.3)

    table_shape = s5.shapes.add_table(rows, cols, left, top, width, height)
    table = table_shape.table

    table_data = [
        ["Feature Domain", "Legacy Rule CDSS", "Consumer ML Checkers", "VITALIS CDSS Platform"],
        ["Emergency Triage", "Manual Heuristics", "Probabilistic ML Only", "Deterministic Red-Flag Override Layer"],
        ["Probability Quality", "Uncalibrated Scores", "Raw Model Softmax", "Platt Scaling + 95% Confidence Intervals"],
        ["Local Explainability", "None (Black Box)", "Global Feature List", "TreeSHAP Local Force Decomposition"],
        ["3D Bio-Engine", "Text Dropdowns Only", "Static 2D Images", "Interactive WebGL 3D Body Map"],
        ["Longitudinal Telemetry", "None", "Static Log", "4-Stage Telemetry + Observation Log"]
    ]

    for r_idx, row in enumerate(table_data):
        for c_idx, text in enumerate(row):
            cell = table.cell(r_idx, c_idx)
            cell.text = text
            # Styling cell
            cell.fill.solid()
            if r_idx == 0:
                cell.fill.fore_color.rgb = CARD_HEADER_BG
            elif c_idx == 3:
                cell.fill.fore_color.rgb = RGBColor(15, 45, 55)
            else:
                cell.fill.fore_color.rgb = CARD_BG

            for p in cell.text_frame.paragraphs:
                p.font.size = Pt(11)
                p.font.bold = True if (r_idx == 0 or c_idx == 0 or c_idx == 3) else False
                p.font.color.rgb = CYAN_ACCENT if (r_idx == 0 or c_idx == 3) else WHITE

    # =============================================================
    # SLIDE 6: SYSTEM ARCHITECTURE & 3-TIER PIPELINE
    # =============================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "System Architecture: 3-Tier Clinical Pipeline", "SYSTEM ARCHITECTURE")

    add_card(s6, 0.8, 1.6, 3.7, 5.3, "TIER 1: DETERMINISTIC TRIAGE", [
        "• Hardcoded Red-Flag Predicates:",
        "Evaluates input symptoms against critical emergency safety rules.",
        "• Emergency Directives:",
        "ACS, Ischemic Stroke FAST criteria, Septic Shock, Anaphylaxis.",
        "• Action:",
        "Instructs immediate EMS dispatch prior to ML prediction."
    ], is_cyan_border=True)

    add_card(s6, 4.8, 1.6, 3.7, 5.3, "TIER 2: CALIBRATED ML CORE", [
        "• Feature Normalization:",
        "Vectorizes 48 continuous symptom severities + vitals into 58-dim array.",
        "• Random Forest Ensemble:",
        "300 decision trees calibrated via Platt scaling (CalibratedClassifierCV).",
        "• Statistical Bounds:",
        "Calculates 95% Clopper-Pearson confidence interval bands."
    ])

    add_card(s6, 8.8, 1.6, 3.7, 5.3, "TIER 3: EXPLAINABILITY & TELEMETRY", [
        "• TreeSHAP Attribution Engine:",
        "Exact polynomial-time Shapley force decomposition (phi_i).",
        "• Interactive WebGL UI:",
        "Three.js 3D human body map + differential diagnosis bento grid.",
        "• Longitudinal Telemetry:",
        "4-stage recovery vector tracking."
    ])

    # =============================================================
    # SLIDE 7: DETERMINISTIC SAFETY TRIAGE ENGINE
    # =============================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Tier 1: Deterministic Red-Flag Safety Triage Engine", "CLINICAL SAFETY")

    add_card(s7, 0.8, 1.6, 5.7, 5.3, "Emergency Red-Flag Predicates", [
        "• Acute Coronary Syndrome (ACS / MI):",
        "(chest_pain >= 7) AND ((dyspnea >= 5) OR (diaphoresis >= 5))",
        "• Cerebrovascular Accident (Stroke FAST):",
        "(facial_droop == 1) OR (hemiparesis == 1) OR (aphasia == 1)",
        "• Septic Shock:",
        "(fever >= 38.5 C) AND (systolic_bp < 90) AND (altered_mental_state == 1)",
        "• Systemic Anaphylaxis:",
        "(dyspnea >= 7) AND (urticaria == 1) AND (facial_edema == 1)"
    ], is_cyan_border=True)

    add_card(s7, 6.8, 1.6, 5.7, 5.3, "Deterministic Triage Guarantee", [
        "• Non-Negotiable Directives:",
        "When red-flag predicates evaluate to True, an Emergency Directive payload ('WHEN NOT TO WAIT') is attached immediately.",
        "• Overriding ML Softmax:",
        "Instructs immediate emergency dispatch (911/112) regardless of downstream model probabilities.",
        "• Zero False Negatives:",
        "Ensures clinical safety when atypical symptom presentations occur."
    ])

    # =============================================================
    # SLIDE 8: MACHINE LEARNING ENGINE & PLATT CALIBRATION
    # =============================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Tier 2: Machine Learning Engine & Platt Calibration", "ML CORE")

    add_card(s8, 0.8, 1.6, 5.7, 5.3, "Random Forest & Platt Scaling", [
        "• Model Configuration:",
        "RandomForestClassifier (300 estimators, max_depth=16, min_samples_split=4, class_weight='balanced_subsample').",
        "• Platt Scaling Formulation:",
        "P(Y = c | f(x)) = 1 / (1 + exp(A_c * f_c(x) + B_c))",
        "where A_c, B_c are fit via maximum likelihood on 5-fold CV.",
        "• Purpose:",
        "Removes tree bagging variance distortion, ensuring a 68% predicted probability matches 68% true clinical frequency."
    ], is_cyan_border=True)

    add_card(s8, 6.8, 1.6, 5.7, 5.3, "Uncertainty Quantification & 95% CIs", [
        "• Dirichlet Error Bounds:",
        "SE(p_c) = sqrt( max(0.001, (p_c * (1 - p_c)) / N_eff) )",
        "• Confidence Intervals:",
        "CI_low = max(1.0%, (p_c - 1.96 * SE(p_c)) * 100.0)",
        "CI_high = min(99.0%, (p_c + 1.96 * SE(p_c)) * 100.0)",
        "• Clinical Transparency:",
        "Displays explicit confidence bounds on the frontend."
    ])

    # =============================================================
    # SLIDE 9: EXPLAINABLE AI (TreeSHAP ATTRIBUTION)
    # =============================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_header(s9, "Tier 3: Explainable AI via TreeSHAP Force Decomposition", "EXPLAINABLE AI")

    add_card(s9, 0.8, 1.6, 5.7, 5.3, "TreeSHAP Formulation & Axioms", [
        "• Shapley Value Equation:",
        "phi_i(f, x) = sum_{S in F \\ {i}} [ |S|!(|F|-|S|-1)! / |F|! ] * [ f_x(S u {i}) - f_x(S) ]",
        "• Game-Theoretic Axioms Satisfied:",
        "1. Local Accuracy (Efficiency): sum phi_i = f(x) - E[f(X)]",
        "2. Missingness: Absent symptoms receive phi_i = 0.",
        "3. Consistency: Increasing marginal value never decreases attribution.",
        "4. Symmetry: Equal contributors receive equal attributions."
    ], is_cyan_border=True)

    add_card(s9, 6.8, 1.6, 5.7, 5.3, "SHAP Waterfall Studio Rendering", [
        "• Positive Risk Drivers (Coral):",
        "Symptom severities that actively amplified disease probability.",
        "• Suppressor Factors (Cyan):",
        "Absence of contradictory symptoms that suppressed alternative differential diagnoses.",
        "• Interactive Counterfactuals:",
        "Toggle symptoms on/off to simulate real-time probability shifts."
    ])

    # =============================================================
    # SLIDE 10: CLINICAL TAXONOMY & CONDITION PROFILES
    # =============================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)
    add_header(s10, "Clinical Symptom Taxonomy & Diagnostic Profiles", "CLINICAL TAXONOMY")

    add_card(s10, 0.8, 1.6, 5.7, 5.3, "48 Indexed Symptoms (6 Regions)", [
        "• Cranial / Neuro: Headache, Migraine, Dizziness, Facial Droop, Vision Disturbance, Syncope.",
        "• Thoracic / Cardiac: Substernal Chest Pain, Radiating Pain, Dyspnea, Palpitations, Cough.",
        "• Abdominal / GI: Epigastric Pain, RLQ Pain, Nausea/Vomiting, Melena, Jaundice.",
        "• Musculoskeletal: Joint Swelling, Muscular Rigidity, Lumbar Spasm, Tremor.",
        "• Systemic / Derm: Rash, Purpura, Night Sweats, Weight Loss, High Fever, Chills.",
        "• Metabolic / Immune: Polydipsia, Polyuria, Peripheral Cyanosis, Flushing."
    ])

    add_card(s10, 6.8, 1.6, 5.7, 5.3, "15 Condition Classes (ICD-10 Mapped)", [
        "1. Acute Coronary Syndrome (I21.9)",
        "2. Cerebrovascular Accident (I63.9)",
        "3. Acute Pulmonary Embolism (I26.9)",
        "4. Acute Appendicitis (K35.8)",
        "5. Sepsis / Septic Shock (A41.9)",
        "6. Community-Acquired Pneumonia (J18.9)",
        "7. Asthma / COPD Exacerbation (J45.9)",
        "8. Uncontrolled Diabetes DKA (E11.69)",
        "9. Severe Migraine with Aura (G43.1)",
        "10. GERD (K21.9) | 11. Syncope (R55)",
        "12. Acute GI Bleed (K92.2) | 13. Flu (J11.1)",
        "14. Anaphylaxis (T78.2) | 15. Meningitis (G03.9)"
    ], is_cyan_border=True)

    # =============================================================
    # SLIDE 11: DATA FLOW DIAGRAMS & ARCHITECTURE
    # =============================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11)
    add_header(s11, "System Architecture: Data Flow Diagrams", "DFD DIAGRAMS")

    add_card(s11, 0.8, 1.6, 5.7, 5.3, "Level 0 Context DFD Specifications", [
        "• User / Actor:",
        "Patient or Clinician inputs symptom severities, duration, and vital signs via 3D Body Map or Search.",
        "• VITALIS Core Engine:",
        "Dispatches requests to FastAPI routers (/api/analysis).",
        "• Data Stores:",
        "Embedded SQLite Database storing user credentials, symptom catalog, session headers, predictions, and daily telemetry."
    ], is_cyan_border=True)

    add_card(s11, 6.8, 1.6, 5.7, 5.3, "Level 1 Process DFD Sub-Processes", [
        "• Process 1.0 (Auth & Security):",
        "JWT bearer token issuance & Bcrypt hashing.",
        "• Process 2.0 (Symptom Indexing):",
        "Search catalog & 3D body region mapping.",
        "• Process 3.0 (ML & Triage):",
        "Safety guardrail evaluation + Calibrated ML prediction + TreeSHAP calculation.",
        "• Process 4.0 (Telemetry Logger):",
        "Longitudinal observation journaling."
    ])

    # =============================================================
    # SLIDE 12: DATABASE SCHEMA DESIGN
    # =============================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12)
    add_header(s12, "Database Schema Specifications (SQLite ORM)", "DATABASE DESIGN")

    # DB Schema Table
    rows = 6
    cols = 4
    table_shape2 = s12.shapes.add_table(rows, cols, Inches(0.8), Inches(1.6), Inches(11.7), Inches(5.3))
    table2 = table_shape2.table

    db_data = [
        ["Table Name", "Primary Key", "Foreign Keys", "Key Fields & Constraints"],
        ["users", "id (INTEGER)", "None", "email (VARCHAR Unique), password_hash (VARCHAR), role"],
        ["symptoms", "id (VARCHAR)", "None", "name, category, anatomical_region, default_severity, is_red_flag"],
        ["analysis_sessions", "id (VARCHAR)", "user_id -> users.id", "input_symptoms_json, aggregate_confidence, primary_condition"],
        ["analysis_predictions", "id (INTEGER)", "session_id -> sessions.id", "condition_name, icd10_code, probability, ci_low, ci_high, shap_json"],
        ["observations", "id (INTEGER)", "session_id -> sessions.id", "day_number, overall_severity, temperature, spo2, notes"]
    ]

    for r_idx, row in enumerate(db_data):
        for c_idx, text in enumerate(row):
            cell = table2.cell(r_idx, c_idx)
            cell.text = text
            cell.fill.solid()
            if r_idx == 0:
                cell.fill.fore_color.rgb = CARD_HEADER_BG
            else:
                cell.fill.fore_color.rgb = CARD_BG

            for p in cell.text_frame.paragraphs:
                p.font.size = Pt(11)
                p.font.bold = True if (r_idx == 0 or c_idx == 0) else False
                p.font.color.rgb = CYAN_ACCENT if (r_idx == 0 or c_idx == 0) else WHITE

    # =============================================================
    # SLIDE 13: 3D WEBGL BIO-ENGINE & FRONTEND
    # =============================================================
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background(s13)
    add_header(s13, "3D WebGL Bio-Engine & Frontend Architecture", "FRONTEND TECH")

    add_card(s13, 0.8, 1.6, 5.7, 5.3, "3D Bio-Engine Component (BodyMap3D.tsx)", [
        "• Three.js WebGL Mesh Rendering:",
        "Custom 3D human anatomical model with orbital holographic rings.",
        "• Raycasting Region Selection:",
        "Direct user click detection on cranial, thoracic, abdominal, musculoskeletal, and systemic nodes.",
        "• Anterior / Posterior Flip:",
        "Interactive 180-degree camera rotation.",
        "• Organ Parallax Engine (OrganScroll3D.tsx):",
        "Multi-organ hero parallax rendering."
    ], is_cyan_border=True)

    add_card(s13, 6.8, 1.6, 5.7, 5.3, "React 18 & Tailwind Architecture", [
        "• Google Stitch Obsidian Theme:",
        "#101419 dark palette, #4CFFE4 bio-cyan accents, #B4C5FF cognitive lavender.",
        "• Modular Views:",
        "1. OverviewHeroView.tsx | 2. SymptomAnalyzerView.tsx",
        "3. ResultsView.tsx | 4. HealthJourneyView.tsx",
        "5. MLArchitectureView.tsx",
        "• Modals & Drawers:",
        "ShapModal.tsx, ObservationModal.tsx, HistoryDrawer.tsx, AuthModal.tsx"
    ])

    # =============================================================
    # SLIDE 14: SYSTEM GUI & FEATURE WALKTHROUGH
    # =============================================================
    s14 = prs.slides.add_slide(blank_layout)
    set_slide_background(s14)
    add_header(s14, "System GUI Walkthrough: 6 Core User Views", "UI WALKTHROUGH")

    add_card(s14, 0.8, 1.6, 3.7, 5.3, "Symptom Analyzer Studio", [
        "• 3-Column Diagnostic Studio:",
        "Left: Anatomical region filters & search.",
        "Center: Interactive 3D Human Body Map.",
        "Right: Selected symptom queue with severity sliders & vitals intake accordion."
    ])

    add_card(s14, 4.8, 1.6, 3.7, 5.3, "Results & Differential Grid", [
        "• Probabilistic Distribution:",
        "Primary condition probability with 95% CI error bounds.",
        "• Differential Bento Grid:",
        "Side-by-side comparative matrices of competing diagnostic possibilities."
    ], is_cyan_border=True)

    add_card(s14, 8.8, 1.6, 3.7, 5.3, "SHAP & Health Journey", [
        "• SHAP Waterfall Studio:",
        "Decomposes positive risk drivers and negative suppressors.",
        "• Health Journey Tracker:",
        "4-stage recovery milestone tracker with vital telemetry sparklines."
    ])

    # =============================================================
    # SLIDE 15: EMPIRICAL VALIDATION & RESULTS
    # =============================================================
    s15 = prs.slides.add_slide(blank_layout)
    set_slide_background(s15)
    add_header(s15, "Empirical Validation & Model Benchmark Results", "MODEL BENCHMARKS")

    add_card(s15, 0.8, 1.6, 5.7, 2.5, "Overall Model Metrics (9,000 Test Set)", [
        "• Classification Accuracy: 98.03%",
        "• Multi-Class Log-Loss: 0.0691",
        "• Macro F1-Score: 0.9803",
        "• Multiclass AUROC: 1.0000",
        "• Brier Score: 0.0031"
    ], is_cyan_border=True)

    add_card(s15, 6.8, 1.6, 5.7, 2.5, "Key Condition Performance Highlights", [
        "• Acute Coronary Syndrome (ACS): F1 = 0.983",
        "• Ischemic Stroke (FAST): F1 = 0.990",
        "• Acute Pulmonary Embolism: F1 = 0.976",
        "• Systemic Anaphylaxis: F1 = 0.993",
        "• Sepsis / Septic Shock: F1 = 0.985"
    ])

    add_card(s15, 0.8, 4.3, 11.7, 2.6, "Inference Latency & Efficiency", [
        "• Inference Speed: 12.4 ms per diagnostic assessment (including SHAP calculation).",
        "• Model Artifact Size: 11.8 MB serialized binary (vit_healthnet_v4.joblib).",
        "• Reliability: 0.00% invalid predictions across 9,000 test cases."
    ])

    # =============================================================
    # SLIDE 16: AUTOMATED INTEGRATION TESTING
    # =============================================================
    s16 = prs.slides.add_slide(blank_layout)
    set_slide_background(s16)
    add_header(s16, "Automated Integration Testing (Pytest Suite)", "AUTOMATED TESTING")

    # Pytest Table
    rows = 6
    cols = 4
    table_shape3 = s16.shapes.add_table(rows, cols, Inches(0.8), Inches(1.6), Inches(11.7), Inches(5.3))
    table3 = table_shape3.table

    test_data = [
        ["Test Case ID", "Target Endpoint / Feature", "Expected Assertion Outcome", "Status"],
        ["TC-01 / TC-02", "GET /health & /api/symptoms/search", "HTTP 200 OK & 48 symptoms catalog", "PASSED"],
        ["TC-03", "POST /api/auth/register & Login", "HTTP 201/200 & valid JWT token issued", "PASSED"],
        ["TC-05 / TC-06", "POST /api/analysis (ACS & Stroke)", "Red-flag alert triggered & prob > 80%", "PASSED"],
        ["TC-07", "POST /api/analysis (Respiratory)", "Calibrated probability & SHAP attributions", "PASSED"],
        ["TC-08 / TC-09", "POST /api/journey/observations & History", "HTTP 201 Created & vault history list", "PASSED"]
    ]

    for r_idx, row in enumerate(test_data):
        for c_idx, text in enumerate(row):
            cell = table3.cell(r_idx, c_idx)
            cell.text = text
            cell.fill.solid()
            if r_idx == 0:
                cell.fill.fore_color.rgb = CARD_HEADER_BG
            elif c_idx == 3:
                cell.fill.fore_color.rgb = RGBColor(0, 100, 50)
            else:
                cell.fill.fore_color.rgb = CARD_BG

            for p in cell.text_frame.paragraphs:
                p.font.size = Pt(11)
                p.font.bold = True if (r_idx == 0 or c_idx == 3) else False
                p.font.color.rgb = CYAN_ACCENT if r_idx == 0 else WHITE

    # =============================================================
    # SLIDE 17: CONCLUSION & FUTURE SCOPE
    # =============================================================
    s17 = prs.slides.add_slide(blank_layout)
    set_slide_background(s17)
    add_header(s17, "Conclusion & Future Research Scope", "PROJECT CONCLUSION")

    add_card(s17, 0.8, 1.6, 5.7, 5.3, "Key Accomplishments", [
        "• Solved Core Flaws:",
        "Overcame uncalibrated heuristic scores and black-box decision barriers in conventional symptom checkers.",
        "• Unified Safety & ML:",
        "Combined a deterministic emergency triage layer with Platt-calibrated Random Forest inference (98.03% accuracy).",
        "• Transparent AI:",
        "Engineered local TreeSHAP feature attributions and counterfactual sensitivity tools.",
        "• 100% Visual Fidelity:",
        "Faithfully rendered Google Stitch Obsidian UI specification."
    ], is_cyan_border=True)

    add_card(s17, 6.8, 1.6, 5.7, 5.3, "Future Research Scope", [
        "• HL7 FHIR EHR Integration:",
        "Automatically ingest patient Electronic Health Records & baseline lab results.",
        "• Multimodal Medical Imaging:",
        "Integrate CNNs for automated chest X-ray and CT scan triage.",
        "• Edge Model Quantization:",
        "Quantize ML models for offline mobile execution in remote clinical settings."
    ])

    # =============================================================
    # SLIDE 18: THANK YOU SLIDE
    # =============================================================
    s18 = prs.slides.add_slide(blank_layout)
    set_slide_background(s18)

    thank_box = s18.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.5), Inches(10.333), Inches(4.5))
    thank_box.fill.solid()
    thank_box.fill.fore_color.rgb = CARD_BG
    thank_box.line.color.rgb = CYAN_ACCENT
    thank_box.line.width = Pt(2.0)

    tf_t = thank_box.text_frame
    tf_t.word_wrap = True
    tf_t.margin_top = Inches(0.6)

    pt1 = tf_t.paragraphs[0]
    pt1.text = "THANK YOU!"
    pt1.font.size = Pt(40)
    pt1.font.bold = True
    pt1.font.color.rgb = CYAN_ACCENT
    pt1.alignment = PP_ALIGN.CENTER
    pt1.space_after = Pt(12)

    pt2 = tf_t.add_paragraph()
    pt2.text = "VITALIS: Multimodal Health Intelligence & Clinical Decision Support System"
    pt2.font.size = Pt(18)
    pt2.font.bold = True
    pt2.font.color.rgb = WHITE
    pt2.alignment = PP_ALIGN.CENTER
    pt2.space_after = Pt(20)

    pt3 = tf_t.add_paragraph()
    pt3.text = "Questions & Feedback Welcome"
    pt3.font.size = Pt(16)
    pt3.font.color.rgb = MUTED_TEXT
    pt3.alignment = PP_ALIGN.CENTER
    pt3.space_after = Pt(14)

    pt4 = tf_t.add_paragraph()
    pt4.text = "Live App: http://127.0.0.1:8000/  |  Swagger Docs: http://127.0.0.1:8000/docs"
    pt4.font.size = Pt(12)
    pt4.font.color.rgb = CYAN_LIGHT
    pt4.alignment = PP_ALIGN.CENTER

    # Save Presentation
    output_ppt = "VITALIS_Project_Presentation.pptx"
    prs.save(output_ppt)
    print(f"Presentation successfully saved to {output_ppt}")

if __name__ == "__main__":
    create_vitalis_presentation()
