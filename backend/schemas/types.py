from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Auth Schemas ---
class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6)

class UserLoginRequest(BaseModel):
    username_or_email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    email: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: str

# --- Symptom Schemas ---
class SymptomSchema(BaseModel):
    id: str
    code: str
    name: str
    category: str
    anatomical_region: str
    default_severity: int = 5
    is_red_flag: bool = False
    description: Optional[str] = None

class SymptomInput(BaseModel):
    id: str
    name: Optional[str] = None
    severity: int = Field(default=5, ge=1, le=10)
    duration: int = Field(default=3, ge=1, le=365)  # in days

class AnalysisContext(BaseModel):
    onset: Optional[str] = "Gradual (3 - 5 days)"
    progression: Optional[str] = "Slowly worsening"
    triggers: Optional[List[str]] = []

class AnalysisRequest(BaseModel):
    symptoms: List[SymptomInput] = Field(..., min_length=1)
    context: Optional[AnalysisContext] = Field(default_factory=AnalysisContext)

class ShapAttribution(BaseModel):
    feature_id: str
    feature_name: str
    weight: float
    direction: str  # 'positive' or 'negative'
    share_pct: float
    description: str

class PredictionResult(BaseModel):
    condition_name: str
    simple_name: Optional[str] = None
    simple_explanation: Optional[str] = None
    icd10_code: str
    probability: float  # e.g. 0.68
    ci_low: float       # e.g. 0.62
    ci_high: float      # e.g. 0.74
    rank: int
    matching_symptoms: List[str]
    unreported_symptoms: List[str]
    natural_duration: str
    primary_system: str
    action_level: str
    action_level_desc: str
    positive_drivers: List[ShapAttribution]
    negative_suppressors: List[ShapAttribution]

class RedFlagAlert(BaseModel):
    is_triggered: bool
    flags: List[Dict[str, str]]

class AnalysisResponse(BaseModel):
    session_id: str
    aggregate_confidence: float
    primary_condition: str
    primary_probability: float
    predictions: List[PredictionResult]
    red_flags: RedFlagAlert
    base_value: float = 0.180
    disclaimer: str
    created_at: str

# --- Observation Schemas ---
class ObservationCreate(BaseModel):
    day_number: int = Field(..., ge=1)
    date_str: str
    severity: int = Field(..., ge=1, le=10)
    temperature: Optional[float] = None
    spo2: Optional[int] = None
    clinical_notes: Optional[str] = None
    episode_id: Optional[str] = "EPISODE-CURRENT"

class ObservationResponse(BaseModel):
    id: str
    day_number: int
    date_str: str
    severity: int
    temperature: Optional[float]
    spo2: Optional[int]
    clinical_notes: Optional[str]
    created_at: str