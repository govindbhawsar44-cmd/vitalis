export interface Symptom {
  id: string;
  code: string;
  name: string;
  category: string;
  anatomical_region: string;
  default_severity: number;
  is_red_flag: boolean;
  description?: string;
}

export interface SymptomInput {
  id: string;
  name?: string;
  severity: number;
  duration: number;
}

export interface AnalysisContext {
  onset: string;
  progression: string;
  triggers: string[];
}

export interface ShapAttribution {
  feature_id: string;
  feature_name: string;
  weight: number;
  direction: 'positive' | 'negative';
  share_pct: number;
  description: string;
}

export interface PredictionResult {
  condition_name: string;
  simple_name?: string;
  simple_explanation?: string;
  icd10_code: string;
  probability: number;
  ci_low: number;
  ci_high: number;
  rank: number;
  matching_symptoms: string[];
  unreported_symptoms: string[];
  natural_duration: string;
  primary_system: string;
  action_level: string;
  action_level_desc: string;
  positive_drivers: ShapAttribution[];
  negative_suppressors: ShapAttribution[];
}

export interface RedFlagAlert {
  is_triggered: boolean;
  flags: Array<{
    id: string;
    title: string;
    description: string;
    matched_symptoms?: string;
    severity_level?: string;
  }>;
}

export interface AnalysisResponse {
  session_id: string;
  aggregate_confidence: number;
  primary_condition: string;
  primary_probability: number;
  predictions: PredictionResult[];
  red_flags: RedFlagAlert;
  base_value: number;
  disclaimer: string;
  created_at: string;
}

export interface Observation {
  id: string;
  day_number: number;
  date_str: string;
  severity: number;
  temperature?: number;
  spo2?: number;
  clinical_notes?: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface BodyRegion {
  id: string;
  name: string;
  icon: string;
  count: number;
  mesh_id?: string;
}