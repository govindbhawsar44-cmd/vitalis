# VITALIS REST API Specification

This document provides complete technical specifications for the VITALIS Clinical Decision Support System REST API powered by FastAPI.

- **Base URL**: `http://127.0.0.1:8000`
- **Interactive OpenAPI Documentation**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`
- **Authentication**: JWT Bearer Token (`Authorization: Bearer <token>`)

---

## 📑 Endpoints Index

1. [System Health & Readiness](#1-system-health--readiness)
   - `GET /health`
   - `GET /api/health`
2. [Symptom Catalog](#2-symptom-catalog)
   - `GET /api/symptoms`
3. [Authentication](#3-authentication)
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/auth/me`
4. [Diagnostic Analysis & Explainable AI](#4-diagnostic-analysis--explainable-ai)
   - `POST /api/analysis/predict`
   - `GET /api/analysis/history`
   - `GET /api/analysis/{session_id}`
5. [Longitudinal Patient Journey](#5-longitudinal-patient-journey)
   - `POST /api/journey/observations`
   - `GET /api/journey/{session_id}/observations`

---

## 1. System Health & Readiness

### `GET /health` or `GET /api/health`
Checks backend application health and ML model loading state.

#### Response `200 OK`
```json
{
  "status": "healthy",
  "version": "4.0.0",
  "model_loaded": true,
  "service": "vitalis-healthnet-core"
}
```

---

## 2. Symptom Catalog

### `GET /api/symptoms`
Retrieves the complete catalog of 48 indexed clinical symptoms grouped by anatomical physiological tier.

#### Response `200 OK`
```json
[
  {
    "id": "chest_pain",
    "name": "Chest Pain (Substernal/Crushing)",
    "body_region": "chest",
    "category": "cardiovascular",
    "description": "Pressure, squeezing, fullness, or pain in the center of the chest.",
    "severity_weight": 3.0,
    "is_red_flag": true
  },
  {
    "id": "dyspnea",
    "name": "Shortness of Breath (Dyspnea)",
    "body_region": "chest",
    "category": "respiratory",
    "description": "Difficulty breathing or feeling suffocated at rest or on exertion.",
    "severity_weight": 2.8,
    "is_red_flag": true
  }
]
```

---

## 3. Authentication

### `POST /api/auth/register`
Registers a new clinician or patient account and returns a signed JWT access token.

#### Request Body
```json
{
  "email": "clinician@vitalis-health.org",
  "password": "SecurePassword123!",
  "full_name": "Dr. Sarah Chen, MD",
  "role": "clinician"
}
```

#### Response `201 Created`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "clinician@vitalis-health.org",
    "full_name": "Dr. Sarah Chen, MD",
    "role": "clinician"
  }
}
```

---

### `POST /api/auth/login`
Authenticates credentials and returns a JWT access token.

#### Request Body
```json
{
  "email": "clinician@vitalis-health.org",
  "password": "SecurePassword123!"
}
```

#### Response `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "clinician@vitalis-health.org",
    "full_name": "Dr. Sarah Chen, MD",
    "role": "clinician"
  }
}
```

---

### `GET /api/auth/me`
Retrieves profile information for the authenticated user.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Response `200 OK`
```json
{
  "id": 1,
  "email": "clinician@vitalis-health.org",
  "full_name": "Dr. Sarah Chen, MD",
  "role": "clinician",
  "created_at": "2026-09-07T05:22:18"
}
```

---

## 4. Diagnostic Analysis & Explainable AI

### `POST /api/analysis/predict`
Primary clinical inference endpoint. Accepts symptoms with severities, duration, patient demographics, vitals, and comorbidities. Executes the deterministic red-flag safety triage engine, the calibrated Random Forest ensemble, and computes exact TreeSHAP feature attributions.

#### Request Body
```json
{
  "symptoms": [
    {
      "id": "chest_pain",
      "severity": 8,
      "duration_days": 1
    },
    {
      "id": "dyspnea",
      "severity": 7,
      "duration_days": 1
    },
    {
      "id": "diaphoresis",
      "severity": 6,
      "duration_days": 1
    }
  ],
  "age": 58,
  "sex": "male",
  "heart_rate": 96,
  "systolic_bp": 142,
  "diastolic_bp": 90,
  "temperature": 37.1,
  "oxygen_saturation": 95,
  "comorbidities": ["hypertension", "dyslipidemia"],
  "smoking_status": "former"
}
```

#### Response `200 OK`
```json
{
  "session_id": "ep-8f4b13a7-0e21-4d1a-8c9a-5b1234567890",
  "timestamp": "2026-09-07T05:30:15Z",
  "emergency_red_flags": {
    "triggered": true,
    "urgency_level": "EMERGENCY",
    "title": "Suspected Acute Coronary Syndrome (ACS)",
    "description": "Crushing chest pain combined with dyspnea and diaphoresis strongly warrants immediate emergency evaluation.",
    "action_directive": "Call emergency services immediately (911/112). Do not attempt to drive. Rest seated upright."
  },
  "primary_diagnosis": {
    "condition_id": "acute_coronary_syndrome",
    "condition_name": "Acute Coronary Syndrome (ACS)",
    "icd10": "I21.9",
    "probability": 0.842,
    "confidence_interval_95": [0.814, 0.869],
    "risk_level": "HIGH",
    "urgency": "EMERGENCY",
    "rationale": "High-probability match driven by characteristic ischemic chest pain, exertional dyspnea, and autonomic diaphoresis."
  },
  "differential_diagnoses": [
    {
      "condition_id": "pulmonary_embolism",
      "condition_name": "Acute Pulmonary Embolism",
      "icd10": "I26.9",
      "probability": 0.089,
      "confidence_interval_95": [0.071, 0.109],
      "risk_level": "HIGH",
      "urgency": "EMERGENCY"
    },
    {
      "condition_id": "gerd",
      "condition_name": "Gastroesophageal Reflux Disease",
      "icd10": "K21.9",
      "probability": 0.041,
      "confidence_interval_95": [0.029, 0.055],
      "risk_level": "LOW",
      "urgency": "ROUTINE"
    }
  ],
  "shap_attributions": [
    {
      "feature_id": "chest_pain",
      "feature_name": "Chest Pain (Substernal/Crushing)",
      "shap_value": 0.428,
      "direction": "increases_risk",
      "clinical_context": "Strongest indicator for acute coronary pathology."
    },
    {
      "feature_id": "diaphoresis",
      "feature_name": "Diaphoresis (Cold Sweats)",
      "shap_value": 0.241,
      "direction": "increases_risk",
      "clinical_context": "Reflects sympathetic nervous system surge during myocardial ischemia."
    },
    {
      "feature_id": "dyspnea",
      "feature_name": "Shortness of Breath",
      "shap_value": 0.173,
      "direction": "increases_risk",
      "clinical_context": "Elevated pulmonary capillary wedge pressure contribution."
    }
  ],
  "recovery_plan": {
    "immediate_actions": [
      "Obtain emergency 12-lead ECG immediately.",
      "Administer chewable aspirin 300mg unless contraindicated.",
      "Check serial cardiac biomarkers (High-Sensitivity Troponin T/I)."
    ],
    "monitoring_directives": [
      "Continuous cardiac telemetry for arrhythmia surveillance.",
      "Continuous pulse oximetry target SpO2 > 94%."
    ],
    "seek_care_triggers": [
      "Any radiation of pain to jaw, left arm, or interscapular region.",
      "Onset of presyncope, syncope, or profound hypotension."
    ]
  }
}
```

---

### `GET /api/analysis/history`
Retrieves a list of prior diagnostic analysis sessions for the authenticated user.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Response `200 OK`
```json
[
  {
    "session_id": "ep-8f4b13a7-0e21-4d1a-8c9a-5b1234567890",
    "created_at": "2026-09-07T05:30:15Z",
    "symptoms_count": 3,
    "top_condition": "Acute Coronary Syndrome (ACS)",
    "probability": 0.842,
    "is_red_flag": true
  }
]
```

---

### `GET /api/analysis/{session_id}`
Retrieves full results and stored predictions for a given session.

#### Response `200 OK`
Returns the full prediction JSON schema identical to `POST /api/analysis/predict`.

---

## 5. Longitudinal Patient Journey

### `POST /api/journey/observations`
Appends a daily clinical observation or symptom status update to an active episode session.

#### Request Body
```json
{
  "session_id": "ep-8f4b13a7-0e21-4d1a-8c9a-5b1234567890",
  "day_number": 2,
  "overall_severity": 4,
  "temperature": 36.8,
  "heart_rate": 78,
  "oxygen_saturation": 98,
  "notes": "Pain largely resolved after emergency stenting; mild fatigue reported.",
  "symptom_statuses": [
    { "symptom_id": "chest_pain", "status": "resolved" },
    { "symptom_id": "dyspnea", "status": "improving" }
  ]
}
```

#### Response `201 Created`
```json
{
  "id": 4,
  "session_id": "ep-8f4b13a7-0e21-4d1a-8c9a-5b1234567890",
  "day_number": 2,
  "recorded_at": "2026-09-07T05:35:00Z",
  "overall_severity": 4,
  "temperature": 36.8,
  "heart_rate": 78,
  "oxygen_saturation": 98,
  "notes": "Pain largely resolved after emergency stenting; mild fatigue reported."
}
```

---

### `GET /api/journey/{session_id}/observations`
Retrieves chronological observation points to construct recovery trajectory sparklines.

#### Response `200 OK`
```json
[
  {
    "day_number": 1,
    "recorded_at": "2026-09-06T10:00:00Z",
    "overall_severity": 8,
    "heart_rate": 96,
    "temperature": 37.1,
    "oxygen_saturation": 95,
    "notes": "Initial emergency presentation."
  },
  {
    "day_number": 2,
    "recorded_at": "2026-09-07T05:35:00Z",
    "overall_severity": 4,
    "heart_rate": 78,
    "temperature": 36.8,
    "oxygen_saturation": 98,
    "notes": "Post-intervention recovery Day 2."
  }
]
```
